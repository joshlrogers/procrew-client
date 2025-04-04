import type {RequestEvent} from "@sveltejs/kit";
import {confidentialClientApp, cryptoProvider} from "$lib/server/oauth";
import type { AuthenticationResult, AuthorizationCodeRequest } from '@azure/msal-node';
import {AZURE_REDIRECT_URI, AZURE_SCOPES} from "$env/static/private";
import {ApiClient} from "$lib/server/apiClient";
import type {Account} from "$lib/shared/models/account";
import { setAccountCookie, setSessionCookie } from '$lib/server/session';

export async function GET(event: RequestEvent): Promise<Response> {
    const requestCode = event.url.searchParams.get("code");
    const requestState = event.url.searchParams.get("state");

    const rawLocalState = cryptoProvider.base64Decode(event.cookies.get("oauth_state") ?? "");
    if (!requestState) {
        return new Response(null, {status: 400});
    }

    const state: { csrfToken: string } = JSON.parse(cryptoProvider.base64Decode(requestState.toString()));
    const localState: { csrfToken: string, redirectUrl: string } = JSON.parse(rawLocalState ?? "");
    if (state.csrfToken !== localState.csrfToken) {
        return new Response(null, {status: 401});
    }

    const rawChallenge = event.cookies.get("oauth_challenge") ?? null;
    const codeVerifier: {
        challengeMethod: string,
        verifier: string,
        challenge: string
    } | null = rawChallenge === null ? null : JSON.parse(cryptoProvider.base64Decode(rawChallenge));

    if (requestCode === null || codeVerifier === null) {
        return new Response(null, {
            status: 400
        });
    }

    try {
        const authRequest: AuthorizationCodeRequest = {
            code: requestCode.toString(),
            redirectUri: AZURE_REDIRECT_URI,
            codeVerifier: codeVerifier.verifier,
            scopes: AZURE_SCOPES.split(",")
        }
        const tokenResponse = await confidentialClientApp.acquireTokenByCode(authRequest);
        if(!tokenResponse || !tokenResponse.account) {
            return new Response(null, {status: 401});
        }

        const account = await getUser(event, tokenResponse);
        if(!account?.idpId) {
            return new Response("User not found", {status: 404});
        }

        account.homeAccountId = tokenResponse.account.homeAccountId;
        account.localAccountId = tokenResponse.account.localAccountId;

        setSessionCookie(event, tokenResponse.accessToken, tokenResponse.expiresOn!);
        setAccountCookie(event, account, tokenResponse.expiresOn!);
        return new Response(null, {
            status: 302,
            headers: {
                Location: localState.redirectUrl ? localState.redirectUrl : "/"
            }
        });
    } catch (e) {
        // Invalid code or client credentials
        return new Response(null, {
            status: 400
        });
    }
}

async function getUser(event: RequestEvent, authenticationResult: AuthenticationResult) {
    event.locals.token = authenticationResult.accessToken;
    const result = await ApiClient.get<Account>(event.fetch, "account/me");
    return result.isOk ? result.value : null;
}