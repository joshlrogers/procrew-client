import { ApiClient } from '$lib/server/apiClient';
import type { Lead } from '$lib/shared/models/lead';
import { 
	LeadSchema, 
	leadStatusUpdateFormSchema,
	type UpdateLeadStatusRequest 
} from '$lib/shared/models/lead';
import type { PageServerLoad, RequestEvent } from './$types';
import { error, fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

interface SalesRepresentative {
	id: string;
	firstName: string;
	lastName: string;
	emailAddress?: string;
	displayName: string;
}

const fetchLead = async (
	fetch: (input: string, init?: RequestInit) => Promise<Response>,
	id: string
) => {
	const response = await ApiClient.get<Lead>(fetch, `/leads/${id}`);
	if (response.isOk && response.value) {
		return response.value;
	}

	if (response.error?.error.includes('not found')) {
		throw error(404, 'Lead not found');
	}

	throw error(500, 'Failed to load lead');
};

const fetchSalesRepresentatives = async (
	fetch: (input: string, init?: RequestInit) => Promise<Response>
) => {
	const response = await ApiClient.get<SalesRepresentative[]>(
		fetch,
		'/organization/company/employee/sales-representatives'
	);
	if (response.isOk && response.value) {
		return response.value;
	}
	return [];
};

const updateLead = async ({ fetch, request, params }: RequestEvent) => {
	const formData = await request.formData();
	const form = await superValidate(formData, zod(LeadSchema));
	
	if (!form.valid) {
		return { form };
	}

	const result = await ApiClient.put<Lead>(fetch, `/leads/${params.id}`, form.data);
	if (result.isOk && result.value) {
		const updatedForm = await superValidate(result.value, zod(LeadSchema));
		return { form: updatedForm, success: true };
	}

	return { form, success: false };
};

const updateLeadStatus = async ({ fetch, request, params }: RequestEvent) => {
	const formData = await request.formData();
	const statusForm = await superValidate(formData, zod(leadStatusUpdateFormSchema));
	
	if (!statusForm.valid) {
		return fail(400, { statusForm });
	}

	// Validate that the leadId matches the route parameter
	if (statusForm.data.leadId !== params.id) {
		statusForm.errors.leadId = ['Lead ID mismatch'];
		return fail(400, { statusForm });
	}

	// Create API request
	const apiRequest: UpdateLeadStatusRequest = {
		status: statusForm.data.status,
		closedReason: statusForm.data.closedReason,
		notes: statusForm.data.notes
	};

	const result = await ApiClient.put<Lead>(fetch, `/leads/${params.id}/status`, apiRequest);
	
	if (result.isOk && result.value) {
		// Update the form with the latest lead data
		const updatedStatusForm = await superValidate(
			{
				leadId: result.value.id || params.id,
				status: result.value.status,
				closedReason: null,
				notes: null
			}, 
			zod(leadStatusUpdateFormSchema)
		);
		return { statusForm: updatedStatusForm, success: true, updatedLead: result.value };
	}

	// Handle API errors
	if (result.error?.error) {
		statusForm.errors._errors = [result.error.error];
	} else {
		statusForm.errors._errors = ['Failed to update lead status'];
	}
	
	return fail(400, { statusForm });
};

export const actions = {
	updateLead,
	updateLeadStatus
};

export const load: PageServerLoad = async ({ fetch, params }) => {
	const lead = await fetchLead(fetch, params.id);
	const form = await superValidate(lead, zod(LeadSchema));
	
	// Create status update form
	const statusForm = await superValidate(
		{
			leadId: lead.id || params.id,
			status: lead.status,
			closedReason: null,
			notes: null
		}, 
		zod(leadStatusUpdateFormSchema)
	);

	return {
		lead,
		form,
		statusForm,
		salesRepresentatives: await fetchSalesRepresentatives(fetch),
	};
};