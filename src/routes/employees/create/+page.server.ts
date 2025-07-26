import type { PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { EmployeeFormSchema } from '$lib/shared/models/employee';
import { ApiClient } from '$lib/server/apiClient';
import { redirect, type RequestEvent } from '@sveltejs/kit';
import type { Department } from '$lib/shared/models/department';

const createEmployee = async ({ fetch, request }: RequestEvent) => {
	const form = await superValidate(await request.formData(), zod(EmployeeFormSchema));
	if (!form.valid) {
		return form;
	}

	let content = JSON.stringify(form.data);

	const result = await ApiClient.postRaw(fetch, '/organization/company/employee', content);
	if (result.isOk && result.value) {
		return redirect(302, '/employees');
	}

	return {
		...form,
		errors: result.error
	};
};

const fetchDepartments = async (
	fetch: (input: string, init?: RequestInit) => Promise<Response>
) => {
	let response = await ApiClient.get<Department[]>(fetch, '/organization/company/departments');
	if (response.isOk && response.value) {
		return response.value;
	}
};


export const actions = {
	createEmployee
};

export const load: PageServerLoad = async ({ fetch }) => {
	const form = await superValidate(zod(EmployeeFormSchema));

	return {
		form,
		departments: await fetchDepartments(fetch)
	};
};
