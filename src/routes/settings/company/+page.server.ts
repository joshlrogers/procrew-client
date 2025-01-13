import type { PageServerLoad, RequestEvent } from './$types';
import { ApiClient } from '$lib/server/apiClient';
import {
	type BusinessHours,
	BusinessHoursSchema,
	type Company,
	CompanySchema,
	type CompanyType
} from '$lib/shared/models/company';
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
		countries: fetchCountries(event, accessToken, companyId),
		states: fetchStates(event, accessToken, companyId),
		companyTypes: fetchCompanyTypes(event, accessToken, companyId),
		company: await getCurrentCompany(event, companyId, accessToken)
	};
};

export const actions = {
	updateBusinessHours: async (event) => {
		const accessToken = await getToken(event);
		const account = getAccount(event);

		if (!accessToken || !account?.defaultOrganizationId) {
			return redirect(302, `/login/b2c?redirect_url=${event.url.pathname}`);
		}

		const form = await superValidate<BusinessHours>(
			await event.request.formData(),
			zod(BusinessHoursSchema)
		);

		if (!form.valid) {
			return message(form, { type: 'error', text: 'Invalid business hours.' });
		}

		let result = await ApiClient.put<Company>(
			event,
			`/organization/company/hours`,
			form.data,
			accessToken
		);

		if (result.isOk && result.value) {
			return message(form, { type: 'success', text: 'Company business hours updated!' });
		}

		return message(
			form,
			{
				type: 'error',
				text: "Unexpected error encountered updating the company's business hours."
			},
			{ status: 500 }
		);
	},
	updateCompany: async (event) => {
		const accessToken = await getToken(event);
		const account = getAccount(event);

		if (!accessToken || !account?.defaultOrganizationId) {
			return redirect(302, `/login/b2c?redirect_url=${event.url.pathname}`);
		}

		const form = await superValidate<Company>(await event.request.formData(), zod(CompanySchema));

		if (!form.valid) {
			return message(form, { type: 'error', text: 'Invalid organization.' });
		}

		let result = await ApiClient.put<Company>(
			event,
			`/organization/company`,
			form.data,
			accessToken
		);

		if (result.isOk && result.value) {
			return message(form, { type: 'success', text: 'Company business hours updated!' });
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

const getCurrentCompany = async (event: RequestEvent, companyId: string, accessToken: string) => {
	let response = await ApiClient.get<Company>(event, `/organization/company/${companyId}`, accessToken);
	if (response.isOk && response.value) {
		return response.value;
	}
};

const fetchCompanyTypes = async (event: RequestEvent, accessToken: string, companyId?: string) => {
	const response = await ApiClient.get<CompanyType[]>(event, '/utility/company/types', accessToken);

	if (response.isOk && response.value) {
		return response.value;
	}
};

const fetchCountries = async (event: RequestEvent, accessToken: string, companyId?: string) => {
	let response = await ApiClient.get<CountrySelectOption[]>(
		event,
		'/utility/lookup/address/countries',
		accessToken
	);
	if (response.isOk && response.value) {
		return response.value;
	}
};

const fetchStates = async (event: RequestEvent, accessToken: string, companyId?: string) => {
	let response = await ApiClient.get<StateSelectOption[]>(
		event,
		'/utility/lookup/address/states',
		accessToken
	);
	if (response.isOk && response.value) {
		return response.value;
	}
};
