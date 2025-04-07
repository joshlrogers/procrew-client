import type { RequestHandler } from '@sveltejs/kit';
import { setCompanyCookie } from '$lib/server/auth/session';

export const GET: RequestHandler = (event) => {
	let companyId = event.locals.company
	if(companyId) {
		return new Response(JSON.stringify(companyId));
	} else {
		let account = event.locals.account;
		let expirationDate = new Date();
		expirationDate.setDate(new Date().getDate() + 1);
		setCompanyCookie(event, account?.defaultCompanyId ?? "", expirationDate);
		return new Response(JSON.stringify(account?.defaultCompanyId));
	}
}

export const POST: RequestHandler = async (event) => {
	let companyId = await event.request.text();
	if(companyId) {
		let expirationDate = new Date();
		expirationDate.setDate(new Date().getDate() + 1);
		setCompanyCookie(event, companyId, expirationDate);
		return new Response(JSON.stringify(companyId));
	}

	return new Response('', {status: 400});
}