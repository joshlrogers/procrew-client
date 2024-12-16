import {confidentialClientApp, cryptoProvider} from "$lib/server/oauth";
import type { RequestEvent } from "@sveltejs/kit";
import type {AuthorizationUrlRequest} from "@azure/msal-node";
import {AZURE_AUTHORITY, AZURE_REDIRECT_URI, AZURE_SCOPES} from "$env/static/private";

export async function GET(event: RequestEvent): Promise<Response> {
    const redirectUrl = event.url.searchParams.get("redirect_url");

    const { verifier, challenge } = await cryptoProvider.generatePkceCodes();
    event.cookies.set("oauth_challenge", cryptoProvider.base64Encode(JSON.stringify({ challengeMethod: 'S256', verifier, challenge })), {
        httpOnly: true,
        maxAge: 60 * 10,
        secure: import.meta.env.PROD,
        path: "/",
        sameSite: "lax"
    });

    const csrfToken = cryptoProvider.createNewGuid();
    const state = cryptoProvider.base64Encode(JSON.stringify({
        csrfToken,
        redirectUrl
    }));

    event.cookies.set("oauth_state", state, {
        httpOnly: true,
        maxAge: 60 * 10,
        secure: import.meta.env.PROD,
        path: "/",
        sameSite: "lax"
    });

    const authCodeUrlRequest: AuthorizationUrlRequest = {
        authority: AZURE_AUTHORITY,
        codeChallenge: challenge,
        codeChallengeMethod: "S256",
        scopes: AZURE_SCOPES.split(","),
        redirectUri: AZURE_REDIRECT_URI,
        state: state
    };

    const authUrl = await confidentialClientApp.getAuthCodeUrl(authCodeUrlRequest);
    return new Response(null, {
        status: 302,
        headers: {
            Location: authUrl
        }
    });
}