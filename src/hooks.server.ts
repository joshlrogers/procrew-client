import { type Handle, type HandleFetch, redirect } from '@sveltejs/kit';
import { deleteSessionTokenCookie, getAccount, getCompany, getToken } from '$lib/server/auth/session';

export const handle: Handle = async ({ event, resolve }) => {
    const token = await getToken(event);

    if(token === null) {
        event.locals.account = undefined;
        if(event.url.pathname !== '/login/b2c' && event.url.pathname !== '/login/b2c/callback') {
            return redirect(302, `/login/b2c?redirect_url=${event.url.pathname}`);
        }

        return resolve(event);
    }

    let account = getAccount(event);
    if(!account) {
        deleteSessionTokenCookie(event);
        return resolve(event);
    }

    event.locals.account = account;
    event.locals.token = token;
    event.locals.company = getCompany(event.cookies);

    if(!account.isOnboarded && event.url.pathname !== '/on-boarding') {
        return redirect(302, '/on-boarding');
    }

    return resolve(event);
};

export const handleFetch: HandleFetch = async ({event, request, fetch}) => {
    setHeaders(request, event.locals.token, event.locals.company);
    return fetch(request);
}

function setHeaders(request: Request, token?: string, companyId?: string) {
    request.headers.set("Authorization", `Bearer ${token}`);
    request.headers.set("Content-Type", "application/json");
    if(companyId) {
        request.headers.set("x-pc-company", companyId);
    }
}