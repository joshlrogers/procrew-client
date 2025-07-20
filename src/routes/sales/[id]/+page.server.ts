import { ApiClient } from '$lib/server/apiClient';
import type { Lead } from '$lib/shared/models/lead';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

const fetchLead = async (
	fetch: (input: string, init?: RequestInit) => Promise<Response>,
	id: string
) => {
	const response = await ApiClient.get<Lead>(fetch, `/leads/${id}`);
	if (response.isOk && response.value) {
		return response.value;
	}

	if (response.error?.includes('not found')) {
		throw error(404, 'Lead not found');
	}

	throw error(500, 'Failed to load lead');
};

export const load: PageServerLoad = async ({ fetch, params }) => {
	const lead = await fetchLead(fetch, params.id);

	return {
		lead
	};
};