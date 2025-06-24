import { zod } from 'sveltekit-superforms/adapters';
import { superValidate } from 'sveltekit-superforms/server';
import type { Actions, PageServerLoad, RequestEvent } from './$types';
import { QuickAddCustomerSchema, type Customer } from '$lib/shared/models/customer';
import { ApiClient } from '$lib/server/apiClient';

const quickAddCustomer = async ({ fetch, request }: RequestEvent) => {
	const form = await superValidate(await request.formData(), zod(QuickAddCustomerSchema));
	if (!form.valid) {
		return form;
	}

	let response = await ApiClient.post<Customer>(fetch, '/customers', form.data as Customer);
	if (response.isOk && response.value) {
		return {
			form,
			success: true,
			message: 'Customer added successfully'
		};
	}

	return {
		form,
		success: false,
		message: 'Failed to add customer'
	};
};

const fetchCustomers = async ({ fetch }: RequestEvent) => {
	let response = await ApiClient.get<Customer[]>(
		fetch,
		'/customers?pageSize=25&pageNumber=1&sortBy=lastName&sortDirection=asc'
	);
	if (response.isOk && response.value) {
		return response.value;
	}
	return [];
};

export const actions: Actions = {
	quickAdd: quickAddCustomer
};

export const load: PageServerLoad = async (request) => {
	request.depends('customers');

	return {
		customers: fetchCustomers(request)
	};
};
