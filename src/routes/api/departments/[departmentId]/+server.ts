import { error, type RequestEvent, type RequestHandler } from '@sveltejs/kit';
import { ApiClient } from '$lib/server/apiClient';

export const DELETE: RequestHandler = async (event: RequestEvent) => {
	const departmentId = event.params.departmentId;
	const result = await ApiClient.delete(
		event.fetch,
		`/organization/company/departments/${departmentId}`
	);

	if (result.isOk) {
		return new Response(null);
	}

	return error(result.status, { message: result.error?.error ?? 'Unknown error encountered.' });
};
