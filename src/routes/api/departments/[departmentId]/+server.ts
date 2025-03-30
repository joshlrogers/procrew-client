import { error, redirect, type RequestEvent, type RequestHandler } from '@sveltejs/kit';
import { getToken } from '$lib/server/session';
import { ApiClient } from '$lib/server/apiClient';

export const DELETE: RequestHandler = async (event: RequestEvent) => {
	const accessToken = await getToken(event);

	if (!accessToken) {
		return redirect(302, `/login/b2c?redirect_url=${event.url.pathname}`);
	}

	const departmentId = event.params.departmentId;
	const result = await ApiClient.delete(event, `/organization/company/departments/${departmentId}`, accessToken);

	if(result.isOk) {
		return new Response(null);
	}

	return error(result.status, {message: result.error?.error ?? "Unknown error encountered."});
}