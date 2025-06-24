import { ApiClient } from '$lib/server/apiClient';
import type { CountrySelectOption, StateSelectOption } from '$lib/shared/models/address';
import { CustomerSchema, type Customer } from '$lib/shared/models/customer';
import { zod } from 'sveltekit-superforms/adapters';
import { superValidate } from 'sveltekit-superforms/server';
import type { PageServerLoad, RequestEvent } from './$types';
import { redirect } from '@sveltejs/kit';

const fetchCustomer = async (
	fetch: (input: string, init?: RequestInit) => Promise<Response>,
	id: string
) => {
	const response = await ApiClient.get<Customer>(fetch, `/customers/${id}`);
	if (response.isOk && response.value) {
		return response.value;
	}

	return null;
};

const fetchStates = async (fetch: (input: string, init?: RequestInit) => Promise<Response>) => {
	const response = await ApiClient.get<StateSelectOption[]>(
		fetch,
		`/utility/lookup/address/states`
	);
	if (response.isOk && response.value) {
		return response.value;
	}
	return [];
};

const fetchCountries = async (fetch: (input: string, init?: RequestInit) => Promise<Response>) => {
	const response = await ApiClient.get<CountrySelectOption[]>(
		fetch,
		`/utility/lookup/address/countries`
	);
	if (response.isOk && response.value) {
		return response.value;
	}
	return [];
};

const updateCustomer = async ({ fetch, request, params }: RequestEvent) => {
	const formData = await request.formData();
	const form = await superValidate(formData, zod(CustomerSchema));
	if (!form.valid) {
		return form;
	}

	const result = await ApiClient.put(fetch, `/customers/${params.id}`, form.data);
	if (result.isOk && result.value) {
		return redirect(302, '/customers');
	}

	return {
		...form,
		errors: result.error
	};
};

export const actions = {
	updateCustomer
};

export const load: PageServerLoad = async ({ fetch, params }) => {
	const customer = await fetchCustomer(fetch, params.id);
	const form = await superValidate(customer, zod(CustomerSchema));

	return {
		form,
		states: fetchStates(fetch),
		countries: fetchCountries(fetch)
	};
};
