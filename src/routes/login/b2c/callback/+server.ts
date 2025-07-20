import type { RequestEvent } from '@sveltejs/kit';
import { publicClientApp, cryptoProvider } from '$lib/server/auth/oauth';
import type { AuthenticationResult, AuthorizationCodeRequest } from '@azure/msal-node';
import { AZURE_REDIRECT_URI, AZURE_SCOPES } from '$env/static/private';
import { ApiClient } from '$lib/server/apiClient';
import type { Account } from '$lib/shared/models/account';
import { setAccountCookie, setSessionCookie } from '$lib/server/auth/session';

export async function GET(event: RequestEvent): Promise<Response> {
	const requestCode = event.url.searchParams.get('code');
	const requestState = event.url.searchParams.get('state');

	const oauthStateCookie = event.cookies.get('oauth_state');

	if (!requestState) {
		return new Response('Missing state parameter', { status: 400 });
	}

	if (!oauthStateCookie) {
		return new Response('Missing authentication state cookie', { status: 400 });
	}

	let state: { csrfToken: string };
	let localState: { csrfToken: string; redirectUrl: string };

	try {
		const rawLocalState = cryptoProvider.base64Decode(oauthStateCookie);
		state = JSON.parse(cryptoProvider.base64Decode(requestState.toString()));
		localState = JSON.parse(rawLocalState);
	} catch (error) {
		console.error('Failed to parse state data:', error);
		return new Response('Invalid state data', { status: 400 });
	}

	if (state.csrfToken !== localState.csrfToken) {
		return new Response('Invalid authentication state', { status: 401 });
	}

	const rawChallenge = event.cookies.get('oauth_challenge') ?? null;
	let codeVerifier: {
		challengeMethod: string;
		verifier: string;
		challenge: string;
	} | null = null;

	if (rawChallenge) {
		try {
			codeVerifier = JSON.parse(cryptoProvider.base64Decode(rawChallenge));
		} catch (error) {
			console.error('Failed to parse oauth_challenge cookie:', error);
			return new Response('Invalid challenge data', { status: 400 });
		}
	}

	if (requestCode === null) {
		return new Response('Missing authorization code', { status: 400 });
	}

	if (codeVerifier === null) {
		return new Response('Missing code verifier', { status: 400 });
	}

	try {
		console.log('Attempting token acquisition with authorization code');
		const authRequest: AuthorizationCodeRequest = {
			code: requestCode.toString(),
			redirectUri: AZURE_REDIRECT_URI,
			codeVerifier: codeVerifier.verifier,
			scopes: AZURE_SCOPES.split(',')
		};
		
		const tokenResponse = await publicClientApp.acquireTokenByCode(authRequest);

		if (!tokenResponse || !tokenResponse.account) {
			return new Response('Authentication failed', { status: 401 });
		}

		const account = await getUser(tokenResponse);
		if (!account?.idpId) {
			return new Response('User not found', { status: 404 });
		}

		account.homeAccountId = tokenResponse.account.homeAccountId;
		account.localAccountId = tokenResponse.account.localAccountId;

		setSessionCookie(event, tokenResponse.accessToken, tokenResponse.expiresOn!);
		setAccountCookie(event, account, tokenResponse.expiresOn!);
		
		const redirectUrl = localState.redirectUrl || '/';

		return new Response(null, {
			status: 302,
			headers: {
				Location: redirectUrl
			}
		});
	} catch (e) {
		console.error('Authentication error:', e);
		return new Response('Authentication failed', { status: 400 });
	}
}

async function getUser(authenticationResult: AuthenticationResult) {
	const result = await ApiClient.rawGet<Account>('account/me', authenticationResult.accessToken);
	return result.isOk ? result.value : null;
}
