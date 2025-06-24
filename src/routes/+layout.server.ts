import { ApiClient } from '$lib/server/apiClient';
import type { Company } from '$lib/shared/models/company';
import type { LayoutServerLoad } from './$types';
import { type RequestEvent } from '@sveltejs/kit';

export const load: LayoutServerLoad = async (event) => {
	const accessToken = event.locals.token;

	if (!accessToken) {
		return {
			account: null,
			companies: []
		};
	}

	return {
		account: event.locals.account,
		companies: fetchCompanies(event)
	};
};

const fetchCompanies = async (event: RequestEvent) => {
	if (event.locals.account?.isRegistered) {
		let companiesResponse = await ApiClient.get<Company[]>(event.fetch, '/organization/company');
		if (companiesResponse.isOk && companiesResponse.value) {
			return companiesResponse.value;
		}
	}

	return [];
};
