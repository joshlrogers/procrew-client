import type { PageServerLoad, RequestEvent } from './$types';
import { ApiClient } from '$lib/server/apiClient';
import {
	type BusinessHours,
	BusinessHoursSchema,
	type Company,
	CompanyHolidaysSchema,
	CompanySchema,
	type CompanyType,
	type Holiday,
	type Holidays
} from '$lib/shared/models/company';
import { getAccount, getCompany, getToken } from '$lib/server/session';
import { fail, redirect } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { CountrySelectOption } from '$lib/shared/models/address';
import { type Department, DepartmentSchema } from '$lib/shared/models/department';
import type { Result } from '$lib/shared/models/result';

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
		companyTypes: fetchCompanyTypes(event, accessToken),
		countries: fetchCountries(event, accessToken),
		departments: getDepartments(event, accessToken),
		federalHolidays: fetchFederalHolidays(event, accessToken),
		holidays: fetchCompanyHolidays(event, accessToken),
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
			form.data = result.value.businessHours;
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
	},
	updateDepartment: async (event) => {
		const accessToken = await getToken(event);
		const account = getAccount(event);

		if (!accessToken || !account?.defaultOrganizationId) {
			return redirect(302, `/login/b2c?redirect_url=${event.url.pathname}`);
		}

		const form = await superValidate<Department>(
			await event.request.formData(),
			zod(DepartmentSchema)
		);
		if (!form.valid) {
			return message(form, { type: 'error', text: 'Invalid department.' });
		}

		let result: Result<Department>;
		if (form.data.id) {
			result = await ApiClient.put<Department>(
				event,
				`/organization/company/departments/${form.data.id}`,
				form.data,
				accessToken
			);
		} else {
			result = await ApiClient.post<Department>(
				event,
				`/organization/company/departments`,
				form.data,
				accessToken
			);
		}

		if (result.isOk && result.value) {
			let action = form.data.id ? 'updated' : 'created.';
			form.data = result.value;
			return message(form, { type: 'success', text: `Company department ${action}!` });
		}

		return message(
			form,
			{
				type: 'error',
				text: 'Unexpected error encountered updating the company department.'
			},
			{ status: 500 }
		);
	},
	updateHolidays: async (event) => {
		const accessToken = await getToken(event);
		const account = getAccount(event);

		if (!accessToken || !account?.defaultOrganizationId) {
			return redirect(302, `/login/b2c?redirect_url=${event.url.pathname}`);
		}

		const form = await superValidate<Holidays>(
			await event.request.formData(),
			zod(CompanyHolidaysSchema)
		);

		if (!form.valid) {
			return message(form, { type: 'error', text: 'Invalid business hours.' });
		}

		let result = await ApiClient.put<Holiday[]>(
			event,
			`/organization/company/holidays`,
			form.data.holidays,
			accessToken
		);

		if (result.isOk && result.value) {
			form.data.holidays = result.value;
			return message(form, { type: 'success', text: 'Company holidays updated!' });
		}

		return message(
			form,
			{
				type: 'error',
				text: "Unexpected error encountered updating the company's holidays."
			},
			{ status: 500 }
		);
	}
};

const getCurrentCompany = async (event: RequestEvent, companyId: string, accessToken: string) => {
	let response = await ApiClient.get<Company>(
		event,
		`/organization/company/${companyId}`,
		accessToken
	);
	if (response.isOk && response.value) {
		return response.value;
	}
};

const getDepartments = async (event: RequestEvent, accessToken: string) => {
	let response = await ApiClient.get<Department[]>(
		event,
		`/organization/company/departments`,
		accessToken
	);
	if (response.isOk && response.value) {
		return response.value;
	}
};

const fetchCompanyHolidays = async (event: RequestEvent, accessToken: string) => {
	let response = await ApiClient.get<Holiday[]>(
		event,
		'/organization/company/holidays',
		accessToken
	);
	if (response.isOk && response.value) {
		return response.value;
	}
};

const fetchCompanyTypes = async (event: RequestEvent, accessToken: string) => {
	const response = await ApiClient.get<CompanyType[]>(event, '/utility/company/types', accessToken);

	if (response.isOk && response.value) {
		return response.value;
	}
};

const fetchCountries = async (event: RequestEvent, accessToken: string) => {
	let response = await ApiClient.get<CountrySelectOption[]>(
		event,
		'/utility/lookup/address/countries',
		accessToken
	);
	if (response.isOk && response.value) {
		return response.value;
	}
};

const fetchFederalHolidays = async (event: RequestEvent, accessToken: string) => {
	let response = await ApiClient.get<Holiday[]>(event, '/utility/lookup/holidays', accessToken);
	if (response.isOk && response.value) {
		return response.value;
	}
};
