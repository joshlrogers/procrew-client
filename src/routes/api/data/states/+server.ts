import { redirect, type RequestEvent, type RequestHandler } from '@sveltejs/kit';
import { ApiClient } from '$lib/server/apiClient';
import type { StateSelectOption } from '$lib/shared/models/address';
import { getToken } from '$lib/server/session';


export const GET: RequestHandler = async (event: RequestEvent) => {
	const accessToken = await getToken(event);

	if (!accessToken) {
		return redirect(302, `/login/b2c?redirect_url=${event.url.pathname}`);
	}

	let states = await fetchStates(event, accessToken);
	return new Response(JSON.stringify(states));
}

const fetchStates = async (event: RequestEvent, accessToken: string) => {
	let response = await ApiClient.get<StateSelectOption[]>(
		event,
		'/utility/lookup/address/states',
		accessToken
	);
	if (response.isOk && response.value) {
		return response.value;
	}
};