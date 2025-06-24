import type { Actions, PageServerLoad, RequestEvent } from './$types';
import { setAccountCookie } from '$lib/server/auth/session';
import { type Account, AccountSchema } from '$lib/shared/models/account/index';
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { ApiClient } from '$lib/server/apiClient';
import type { CountrySelectOption, StateSelectOption } from '$lib/shared/models/address';
import { OrganizationSchema, type Organization } from '$lib/shared/models/organization';
import { redirect } from '@sveltejs/kit';
import { CompanySchema } from '$lib/shared/models/company';

export const load: PageServerLoad = async (event: RequestEvent) => {
	const account = event.locals.account;

	const form = await superValidate(account, zod(AccountSchema));

	if (account?.isRegistered) {
		return redirect(302, '/');
	}

	const organizationForm = await superValidate(zod(OrganizationSchema));
	const companyForm = await superValidate(zod(CompanySchema));

	return {
		form,
		organizationForm,
		companyForm,
		countries: fetchCountries(event),
		states: fetchStates(event)
	};
};

export const actions: Actions = {
	register: async (event: RequestEvent) => {
		const formData = await event.request.formData();
		const form = await superValidate(formData, zod(AccountSchema));

		if (!form.valid) {
			return form;
		}

		var registrationResponse = await ApiClient.post<Account>(
			event.fetch,
			'/account/register',
			form.data
		);

		if (registrationResponse.isOk && registrationResponse.value) {
			setAccountCookie(
				event,
				registrationResponse.value,
				new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
			);
			return message(form, { text: 'Registration successful!', type: 'success' });
		}

		return message(form, { text: 'Registration failed!', type: 'error' });
	},
	createOrganization: async (event: RequestEvent) => {
		const formData = await event.request.formData();
		const form = await superValidate(formData, zod(OrganizationSchema));

		if (!form.valid) {
			return form;
		}

		var organizationResponse = await ApiClient.post<Organization>(
			event.fetch,
			'/organization',
			form.data
		);

		if (organizationResponse.isOk && organizationResponse.value) {
			return message(form, { text: 'Organization created!', type: 'success' });
		}

		return message(form, { text: 'Organization creation failed!', type: 'error' });
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

const fetchStates = async (event: RequestEvent) => {
	let response = await ApiClient.get<StateSelectOption[]>(
		event.fetch,
		'/utility/lookup/address/states'
	);
	if (response.isOk && response.value) {
		return response.value;
	}
};
