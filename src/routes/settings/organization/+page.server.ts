import { redirect } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import type { PageServerLoad, RequestEvent } from './$types';

import { getAccount, getToken } from '$lib/server/auth/session';
import { ApiClient } from '$lib/server/apiClient';
import type { CountrySelectOption, StateSelectOption } from '$lib/shared/models/address';
import { type Organization, OrganizationSchema } from '$lib/shared/models/organization';
import { type Company, CompanySchema, type CompanyType } from '$lib/shared/models/company';

export const load: PageServerLoad = async (event: RequestEvent) => {
	const accessToken = await getToken(event);
	const account = getAccount(event);

	if (!accessToken || !account?.defaultOrganizationId) {
		return redirect(302, `/login/b2c?redirect_url=${event.url.pathname}`);
	}

	const organization = await fetchOrganization(event, account.defaultOrganizationId);
	const form = await superValidate<Organization>(organization, zod(OrganizationSchema));

	return {
		companies: fetchCompanies(event),
		form,
		companyTypes: fetchCompanyTypes(event),
		countries: fetchCountries(event),
		states: fetchStates(event)
	};
};

export const actions = {
	createCompany: async (event) => {
		let company = (await event.request.formData()) as unknown as Company;
		const form = await superValidate<Company>(company, zod(CompanySchema));

		if (!form.valid) {
			return message(form, { type: 'error', text: 'Invalid company.' });
		}

		let response = await ApiClient.post<Company>(event.fetch, '/organization/company', form.data);
		if (response.isOk && response.value) {
			form.data = response.value;
			return message(form, { type: 'success', text: 'Company created!' });
		}

		return message(
			form,
			{
				type: 'error',
				text: 'Unexpected failure encountered while attempting to save the company.'
			},
			{ status: 500 }
		);
	},
	updateOrganization: async (event) => {
		const form = await superValidate<Organization>(
			await event.request.formData(),
			zod(OrganizationSchema)
		);
		if (!form.valid) {
			return message(form, { type: 'error', text: 'Invalid organization.' });
		}

		let result = await ApiClient.put<Organization>(
			event.fetch,
			`/organization/${form.data.id}`,
			form.data
		);
		if (result.isOk && result.value) {
			return message(form, { type: 'success', text: 'Organization updated!' });
		}

		return message(
			form,
			{
				type: 'error',
				text: 'Unexpected error encountered updating the organization.'
			},
			{ status: 500 }
		);
	}
};

const fetchCompanies = async (event: RequestEvent) => {
	let response = await ApiClient.get<Company[]>(event.fetch, '/organization/company');
	if (response.isOk && response.value) {
		return response.value;
	}
};

const fetchCompanyTypes = async (event: RequestEvent) => {
	const response = await ApiClient.get<CompanyType[]>(event.fetch, '/utility/company/types');
	if (response.isOk && response.value) {
		return response.value;
	}
};

const fetchCountries = async (event: RequestEvent) => {
	let response = await ApiClient.get<CountrySelectOption[]>(
		event.fetch,
		'/utility/lookup/address/countries'
	);
	if (response.isOk && response.value) {
		return response.value;
	}
};

const fetchOrganization = async (
	event: RequestEvent,
	organizationId: string
) => {
	let response = await ApiClient.get<Organization>(event.fetch, `/organization/${organizationId}`);
	if (response.isOk && response.value) {
		return response.value;
	}
};

const fetchStates = async (event: RequestEvent) => {
	let response = await ApiClient.get<StateSelectOption[]>(
		event.fetch,
		'/utility/lookup/address/states'
	);
	if (response.isOk && response.value) {
		return response.value;
	}
};
