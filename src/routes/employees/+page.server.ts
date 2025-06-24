import { ApiClient } from '$lib/server/apiClient';
import type { PageServerLoad } from './$types';
import type { Employee } from '$lib/shared/models/employee';

export const load: PageServerLoad = async ({ fetch }) => {
	return {
		employees: fetchEmployees(fetch)
	};
};

export const actions = {};

const fetchEmployees = async (
	fetch: (input: string, init?: RequestInit) => Promise<Response>
): Promise<Employee[]> => {
	let response = await ApiClient.get<Employee[]>(
		fetch,
		`/organization/company/employee?count=25&pagenumber=1`
	);
	if (response.isOk && response.value) {
		return response.value;
	}

	return [];
};
