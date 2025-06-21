import type { PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { type Employee, EmployeeFormSchema } from '$lib/shared/models/employee';
import { ApiClient } from '$lib/server/apiClient';
import type { CountrySelectOption, StateSelectOption } from '$lib/shared/models/address';
import type { Department } from '$lib/shared/models/department';
import { redirect, type RequestEvent } from '@sveltejs/kit';
import { dateToString } from '$lib/utils';

const transformEmployeeForForm = (employee: Employee) => {
	return {
		...employee,
		hireDate: dateToString(employee.hireDate),
		demographics: employee.demographics ? {
			...employee.demographics,
			dateOfBirth: dateToString(employee.demographics.dateOfBirth)
		} : undefined
	};
};

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
	const form = await superValidate(await request.formData(), zod(EmployeeFormSchema));
	if (!form.valid) {
		return { form };
	}

	const result = await ApiClient.put<Employee>(fetch, '/organization/company/employee', form.data);
	if(result.isOk && result.value) {
		const transformedEmployee = transformEmployeeForForm(result.value);
		const updatedForm = await superValidate(transformedEmployee, zod(EmployeeFormSchema));
		return { form: updatedForm, success: true };
	}

	return { form, success: false };
};

export const actions = {
	updateEmployee
}

export const load: PageServerLoad = async ({ fetch, params }: RequestEvent) => {
	if(!params.sequence) {
		return redirect(302, '/employees');
	}

	let employee = await fetchEmployee(fetch, params.sequence);
	const transformedEmployee = employee ? transformEmployeeForForm(employee) : undefined;
	
	const form = await superValidate(transformedEmployee, zod(EmployeeFormSchema));

	return {
		form,
		countries: fetchCountries(fetch),
		states: fetchStates(fetch),
		departments: await fetchDepartments(fetch)
	};
};