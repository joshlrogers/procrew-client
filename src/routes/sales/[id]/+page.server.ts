import { ApiClient } from '$lib/server/apiClient';
import type { Lead } from '$lib/shared/models/lead';
import { LeadSchema } from '$lib/shared/models/lead';
import type { PageServerLoad, RequestEvent } from './$types';
import { error } from '@sveltejs/kit';
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

export const actions = {
	updateLead
};

export const load: PageServerLoad = async ({ fetch, params }) => {
	const lead = await fetchLead(fetch, params.id);
	const form = await superValidate(lead, zod(LeadSchema));

	return {
		lead,
		form,
		salesRepresentatives: await fetchSalesRepresentatives(fetch),
	};
};