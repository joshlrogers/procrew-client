import type { PageServerLoad, RequestEvent } from './$types';
import { getAccount, getCompany, getToken } from '$lib/server/session';
import { ApiClient } from '$lib/server/apiClient';
import type { CountrySelectOption, StateSelectOption } from '$lib/shared/models/address';
import { redirect } from '@sveltejs/kit';
import { type Organization, OrganizationSchema } from '$lib/shared/models/organization';
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { type Company, type CompanyType, NewCompanySchema } from '$lib/shared/models/company';

export const load: PageServerLoad = async (event: RequestEvent) => {
	const companyId =  getCompany(event);
	const accessToken = await getToken(event);
	const account = getAccount(event);

	if (!accessToken || !account?.defaultOrganizationId) {
		return redirect(302, `/login/b2c?redirect_url=${event.url.pathname}`);
	}

	const organization = await fetchOrganization(account.defaultOrganizationId, accessToken, companyId);
	const form = await superValidate<Organization>(organization, zod(OrganizationSchema));

	return {
		companies: fetchCompanies(accessToken),
		form,
		companyTypes: fetchCompanyTypes(accessToken),
		countries: fetchCountries(accessToken),
		states: fetchStates(accessToken)
	};
};

export const actions = {
	createCompany: async (event) => {
		const companyId = getCompany(event);
		const accessToken = await getToken(event);
		const account = getAccount(event);
		if (!accessToken || !account?.defaultOrganizationId) {
			return redirect(302, `/login/b2c?redirect_url=${event.url.pathname}`);
		}

		const form = await superValidate<Company>(
			await event.request.formData(),
			zod(NewCompanySchema)
		);

		if (!form.valid) {
			return message(form, { type: 'error', text: 'Invalid company.' });
		}

		let response = await ApiClient.post<Company>(
			'/organization/company',
			form.data,
			accessToken,
			companyId
		);
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
		const companyId = getCompany(event);
		const accessToken = await getToken(event);
		const account = getAccount(event);
		if (!accessToken || !account?.defaultOrganizationId) {
			return redirect(302, `/login/b2c?redirect_url=${event.url.pathname}`);
		}

		const form = await superValidate<Organization>(
			await event.request.formData(),
			zod(OrganizationSchema)
		);
		if (!form.valid) {
			return message(form, { type: 'error', text: 'Invalid organization.' });
		}

		let result = await ApiClient.put<Organization>(
			`/organization/${form.data.id}`,
			form.data,
			accessToken,
			companyId
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

const fetchCompanies = async (accessToken: string, companyId?: string) => {
	let response = await ApiClient.get<Company[]>('/organization/company', accessToken, companyId);
	if (response.isOk && response.value) {
		return response.value;
	}
};

const fetchCompanyTypes = async (accessToken: string, companyId?: string) => {
	const response = await ApiClient.get<CompanyType[]>(
		'/utility/company/types',
		accessToken,
		companyId
	);
	if (response.isOk && response.value) {
		return response.value;
	}
};

const fetchCountries = async (accessToken: string, companyId?: string) => {
	let response = await ApiClient.get<CountrySelectOption[]>(
		'/utility/lookup/address/countries',
		accessToken,
		companyId
	);
	if (response.isOk && response.value) {
		return response.value;
	}
};

const fetchOrganization = async (
	organizationId: string,
	accessToken: string,
	companyId?: string
) => {
	let response = await ApiClient.get<Organization>(
		`/organization/${organizationId}`,
		accessToken,
		companyId
	);
	if (response.isOk && response.value) {
		return response.value;
	}
};

const fetchStates = async (accessToken: string, companyId?: string) => {
	let response = await ApiClient.get<StateSelectOption[]>(
		'/utility/lookup/address/states',
		accessToken,
		companyId
	);
	if (response.isOk && response.value) {
		return response.value;
	}
};
