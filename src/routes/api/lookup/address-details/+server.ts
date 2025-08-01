import type { RequestEvent, RequestHandler } from '@sveltejs/kit';
import { ApiClient } from '$lib/server/apiClient';
import type { CountrySelectOption, StateSelectOption } from '$lib/shared/models/address';
import type { Fetch } from '$lib/shared';

export interface AddressLookupDetails {
	countries: CountrySelectOption[];
	states: StateSelectOption[];
}

export const GET: RequestHandler = async ({ fetch }: RequestEvent): Promise<Response> => {
	const response = new Response(
		JSON.stringify({
			countries: await fetchCountries(fetch),
			states: await fetchStates(fetch)
		}));

	response.headers.set("Cache-Control", "private,max-age=86400");

	return response;
};

const fetchCountries = async (fetch: Fetch) => {
	const response = await ApiClient.get<CountrySelectOption[]>(
		fetch,
		'/utility/lookup/address/countries'
	);

	if (response.isOk && response.value) {
		return response.value;
	}

	return [];
};

const fetchStates = async (fetch: Fetch) => {
	const response = await ApiClient.get<StateSelectOption[]>(
		fetch,
		'/utility/lookup/address/states'
	);

	if (response.isOk && response.value) {
		return response.value;
	}

	return [];
};
