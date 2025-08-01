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
import { fail } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { type Department, DepartmentSchema } from '$lib/shared/models/department';
import type { Result } from '$lib/shared/models/result';

export const load: PageServerLoad = async ({ fetch, locals, depends }) => {
	if (!locals.company) {
		return fail(400, {
			data: 'Unable to retrieve company.'
		});
	}

	depends('app:company');

	return {
		departments: getDepartments(fetch),
		federalHolidays: fetchFederalHolidays(fetch),
		holidays: fetchCompanyHolidays(fetch),
		companyTypes: fetchCompanyTypes(fetch),
		company: getCurrentCompany(fetch, locals.company)
	};
};

export const actions = {
	updateBusinessHours: async (event: RequestEvent) => {
		const form = await superValidate<BusinessHours>(
			await event.request.formData(),
			zod(BusinessHoursSchema)
		);

		if (!form.valid) {
			return message(form, { type: 'error', text: 'Invalid business hours.' });
		}

		let result = await ApiClient.put<Company>(
			event.fetch,
			`/organization/company/hours`,
			form.data
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
	updateCompany: async (event: RequestEvent) => {
		const form = await superValidate<Company>(await event.request.formData(), zod(CompanySchema));

		if (!form.valid) {
			return message(form, { type: 'error', text: 'Invalid organization.' });
		}

		let result = await ApiClient.put<Company>(event.fetch, `/organization/company`, form.data);

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
	updateDepartment: async (event: RequestEvent) => {
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
				event.fetch,
				`/organization/company/departments/${form.data.id}`,
				form.data
			);
		} else {
			result = await ApiClient.post<Department>(
				event.fetch,
				`/organization/company/departments`,
				form.data
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
	updateHolidays: async (event: RequestEvent) => {
		const form = await superValidate<Holidays>(
			await event.request.formData(),
			zod(CompanyHolidaysSchema)
		);

		if (!form.valid) {
			return message(form, { type: 'error', text: 'Invalid business hours.' });
		}

		let result = await ApiClient.put<Holiday[]>(
			event.fetch,
			`/organization/company/holidays`,
			form.data.holidays
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

const getCurrentCompany = async (
	fetch: (input: string, init?: RequestInit) => Promise<Response>,
	companyId: string
) => {
	let response = await ApiClient.get<Company>(fetch, `/organization/company/${companyId}`);
	if (response.isOk && response.value) {
		return response.value;
	}
};

const getDepartments = async (fetch: (input: string, init?: RequestInit) => Promise<Response>) => {
	let response = await ApiClient.get<Department[]>(fetch, `/organization/company/departments`);
	if (response.isOk && response.value) {
		return response.value;
	}
};

const fetchCompanyHolidays = async (
	fetch: (input: string, init?: RequestInit) => Promise<Response>
) => {
	let response = await ApiClient.get<Holiday[]>(fetch, '/organization/company/holidays');
	if (response.isOk && response.value) {
		return response.value;
	}
};

const fetchCompanyTypes = async (
	fetch: (input: string, init?: RequestInit) => Promise<Response>
) => {
	const response = await ApiClient.get<CompanyType[]>(fetch, '/utility/company/types');

	if (response.isOk && response.value) {
		return response.value;
	}
};

const fetchFederalHolidays = async (
	fetch: (input: string, init?: RequestInit) => Promise<Response>
) => {
	let response = await ApiClient.get<Holiday[]>(fetch, '/utility/lookup/holidays');
	if (response.isOk && response.value) {
		return response.value;
	}
};
