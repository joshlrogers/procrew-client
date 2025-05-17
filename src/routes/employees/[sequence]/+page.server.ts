import type { PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { type Employee, EmployeeSchema } from '$lib/shared/models/employee';
import { ApiClient } from '$lib/server/apiClient';
import type { CountrySelectOption, StateSelectOption } from '$lib/shared/models/address';
import type { Department } from '$lib/shared/models/department';
import { redirect, type RequestEvent } from '@sveltejs/kit';

const fetchCountries = async (fetch: (input: string, init?: RequestInit) => Promise<Response>) => {
	let response = await ApiClient.get<CountrySelectOption[]>(
		fetch,
		'/utility/lookup/address/countries'
	);
	if (response.isOk && response.value) {
		return response.value;
	}
};

const fetchDepartments = async (fetch: (input: string, init?: RequestInit) => Promise<Response>) => {
	let response = await ApiClient.get<Department[]>(
		fetch,
		'/organization/company/departments'
	);
	if (response.isOk && response.value) {
		return response.value;
	}
};

const fetchEmployee = async(fetch: (input: string, init?: RequestInit) => Promise<Response>, id: string) => {
	let response = await ApiClient.get<Employee>(fetch, `/organization/company/employee/${id}`);
	if (response.isOk && response.value) {
		return response.value;
	}
};

const fetchStates = async (fetch: (input: string, init?: RequestInit) => Promise<Response>) => {
	let response = await ApiClient.get<StateSelectOption[]>(fetch, '/utility/lookup/address/states');
	if (response.isOk && response.value) {
		return response.value;
	}
};

const updateEmployee = async ({ fetch, request }: RequestEvent) => {
	const form = await superValidate(await request.formData(), zod(EmployeeSchema));
	if (!form.valid) {
		return form;
	}

	let content = JSON.stringify(form.data, (k,v) => {
		if(k === 'dateOfBirth') {
			if(v) {
				const date = new Date();
				date.setTime(Date.parse(v));
				return `${date.getFullYear()}-${date.getMonth() < 10 ? '0' + date.getMonth(): date.getMonth()}-${date.getDate() < 10 ? '0' + date.getDate() : date.getDate()}`;
			}
		}

		if(k === 'hireDate') {
			if(v) {
				const date = new Date();
				date.setTime(Date.parse(v));
				return `${date.getFullYear()}-${date.getMonth() < 10 ? '0' + date.getMonth(): date.getMonth()}-${date.getDate() < 10 ? '0' + date.getDate() : date.getDate()}`;
			}
		}

		return v;
	});

	const result = await ApiClient.putRaw(fetch, '/organization/company/employee', content);
	if(result.isOk && result.value) {
		return redirect(302, '/employees');
	}

	return {
		...form,
		errors: result.error
	}
};

export const actions = {
	updateEmployee
}

export const load: PageServerLoad = async ({ fetch, params }: RequestEvent) => {
	if(!params.sequence) {
		return redirect(302, '/employees');
	}

	let employee = await fetchEmployee(fetch, params.sequence)
	const form = await superValidate(employee, zod(EmployeeSchema));

	return {
		form,
		countries: fetchCountries(fetch),
		states: fetchStates(fetch),
		departments: await fetchDepartments(fetch)
	};
};