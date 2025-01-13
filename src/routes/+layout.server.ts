import { ApiClient } from '$lib/server/apiClient';
import { getToken } from '$lib/server/session';
import type { Company } from '$lib/shared/models/company';
import type { LayoutServerLoad } from '../../.svelte-kit/types/src/routes/$types';
import { redirect, type RequestEvent } from '@sveltejs/kit';

export const load: LayoutServerLoad = async (event) => {
	const accessToken = await getToken(event);

	if (!accessToken && !event.url.pathname.startsWith('/login')) {
		return redirect(302, `/login/b2c?redirect_url=${event.url.pathname}`);
	} else if (!accessToken) {
		return {
			account: null,
			companies: []
		};
	}

	return {
		account: event.locals.account,
		companies: fetchCompanies(event, accessToken)
	};
};

const fetchCompanies = async (event: RequestEvent, accessToken: string) => {
	let companiesResponse = await ApiClient.get<Company[]>(event, '/organization/company', accessToken);
	if (companiesResponse.isOk && companiesResponse.value) {
		return companiesResponse.value;
	}
};
