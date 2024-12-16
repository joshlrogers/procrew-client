import { fail, redirect } from "@sveltejs/kit";

import type { Actions, RequestEvent } from "@sveltejs/kit";
import {deleteAccountCookie, deleteSessionTokenCookie} from "$lib/server/session";

export async function load(event: RequestEvent) {
    if(!event.locals.account) {
        return redirect(302, `/login/b2c?redirect_url=${event.url}`);
    }
    return {
        account: event.locals.account
    }
}

export const actions: Actions = {
    default: action
};

async function action(event: RequestEvent) {
    if (event.locals.account === null) {
        return fail(400);
    }

    deleteAccountCookie(event);
    deleteSessionTokenCookie(event);

    return redirect(302, `/login/b2c?redirect_url=${event.url}`);
}