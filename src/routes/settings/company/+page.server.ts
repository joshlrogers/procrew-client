import type { PageServerLoad, RequestEvent } from './$types';
import { ApiClient } from '$lib/server/apiClient';
import { type Company, CompanySchema, type CompanyType } from '$lib/shared/models/company';
import { getAccount, getCompany, getToken } from '$lib/server/session';
import { fail, redirect } from '@sveltejs/kit';
import type { CountrySelectOption, StateSelectOption } from '$lib/shared/models/address';
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load: PageServerLoad = async (event: RequestEvent) => {
	const accessToken = await getToken(event);
	const companyId = getCompany(event);

	if (!accessToken) {
		return redirect(302, `/login/b2c?redirect_url=${event.url.pathname}`);
	}

	if (!companyId) {
		return fail(400, {
			data: 'Unable to retrieve company.'
		});
	}

	return {
		countries: fetchCountries(accessToken, companyId),
		states: fetchStates(accessToken, companyId),
		companyTypes: fetchCompanyTypes(accessToken, companyId),
		company: await getCurrentCompany(companyId, accessToken)
	};
};

export const actions = {
	updateCompany: async (event) => {
		const accessToken = await getToken(event);
		const account = getAccount(event);
		const companyId = getCompany(event);

		if (!accessToken || !account?.defaultOrganizationId) {
			return redirect(302, `/login/b2c?redirect_url=${event.url.pathname}`);
		}

		const form = await superValidate<Company>(
			await event.request.formData(),
			zod(CompanySchema)
		);

		if (!form.valid) {
			return message(form, { type: 'error', text: 'Invalid organization.' });
		}

		let result = await ApiClient.put<Company>(
			`/organization/company`,
			form.data,
			accessToken,
			companyId
		);

		if (result.isOk && result.value) {
			return message(form, { type: 'success', text: 'Company updated!' });
		}

		return message(
			form,
			{
				type: 'error',
				text: 'Unexpected error encountered updating the company.'
			},
			{ status: 500 }
		);
	}
};

const getCurrentCompany = async (companyId: string, accessToken: string) => {
	let response = await ApiClient.get<Company>(`/organization/company/${companyId}`, accessToken);
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
