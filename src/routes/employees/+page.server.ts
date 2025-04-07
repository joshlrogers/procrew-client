import { ApiClient } from '$lib/server/apiClient';
import type { PageServerLoad } from './$types';
import type { Company } from '$lib/shared/models/company';

export const load: PageServerLoad = async ({ fetch }) => {
	return {
		employees: fetchEmployees(fetch)
	};
};

export const actions = {};

const fetchEmployees = async (fetch: (input: string, init?: RequestInit) => Promise<Response>) => {
	let response = await ApiClient.get<Company>(fetch, `/organization/company/employee?count=25&pagenumber=1`);
	if (response.isOk && response.value) {
		return response.value;
	}
};
