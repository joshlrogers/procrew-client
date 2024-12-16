import type {Handle} from "@sveltejs/kit";
import {deleteSessionTokenCookie, getAccount, getToken} from "$lib/server/session";

export const handle: Handle = async ({ event, resolve }) => {
    const token = await getToken(event);
    if(token === null) {
        event.locals.account = null;
        return resolve(event);
    }

    let account = getAccount(event);
    if(!account) {
        deleteSessionTokenCookie(event);
        return resolve(event);
    }

    event.locals.account = account;
    return resolve(event);
};