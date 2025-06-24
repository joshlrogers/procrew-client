import { type Handle, type HandleFetch, redirect } from '@sveltejs/kit';
import {
	deleteSessionTokenCookie,
	getAccount,
	getCompany,
	getToken
} from '$lib/server/auth/session';

export const handle: Handle = async ({ event, resolve }) => {
	// Skip auth for static assets and specific routes
	if (
		event.url.pathname.startsWith('/_app/') ||
		event.url.pathname.startsWith('/favicon') ||
		event.url.pathname.includes('.')
	) {
		return resolve(event);
	}

	const token = await getToken(event);

	if (token === null) {
		event.locals.account = undefined;
		if (event.url.pathname !== '/login/b2c' && event.url.pathname !== '/login/b2c/callback') {
			return redirect(302, `/login/b2c?redirect_url=${event.url.pathname}`);
		}
		return resolve(event);
	}

	// Cache account and company lookups
	let account = getAccount(event);
	if (!account) {
		deleteSessionTokenCookie(event);
		return resolve(event);
	}

	event.locals.account = account;
	event.locals.token = token;
	event.locals.company = getCompany(event.cookies);

	// Only check onboarding for page routes, not API routes
	if (
		!account.isOnboarded &&
		event.url.pathname !== '/on-boarding' &&
		!event.url.pathname.startsWith('/api/')
	) {
		return redirect(302, '/on-boarding');
	}

	return resolve(event);
};

export const handleFetch: HandleFetch = async ({ event, request, fetch }) => {
	setHeaders(request, event.locals.token, event.locals.company);
	return fetch(request);
};

function setHeaders(request: Request, token?: string, companyId?: string) {
	request.headers.set('Authorization', `Bearer ${token}`);
	request.headers.set('Content-Type', 'application/json');
	if (companyId) {
		request.headers.set('x-pc-company', companyId);
	}
}
