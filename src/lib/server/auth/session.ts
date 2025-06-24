import type { Cookies, RequestEvent } from '@sveltejs/kit';
import type { Account } from '$lib/shared/models/account';
import { confidentialClientApp } from '$lib/server/auth/oauth';
import { type SilentFlowRequest } from '@azure/msal-node';
import { AZURE_SCOPES } from '$env/static/private';

export function deleteAccountCookie(event: RequestEvent): void {
	event.cookies.set('account', '', {
		httpOnly: true,
		path: '/',
		secure: import.meta.env.PROD,
		sameSite: 'lax',
		maxAge: 0
	});
}

export function deleteSessionTokenCookie(event: RequestEvent): void {
	event.cookies.set('session', '', {
		httpOnly: true,
		path: '/',
		secure: import.meta.env.PROD,
		sameSite: 'lax',
		maxAge: 0
	});
}

export function getAccount({ cookies }: RequestEvent): Account | null {
	const rawAccount = cookies?.get('account');
	if (!rawAccount) {
		return null;
	}

	return JSON.parse(rawAccount) as Account;
}

export function getCompany(cookies: Cookies): string | undefined {
	const rawCompany = cookies.get('company');
	if (!rawCompany) {
		return undefined;
	}

	return rawCompany;
}

// In session.ts - Add token caching
const TOKEN_CACHE_KEY = 'cached_token';
const TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes buffer

export async function getToken(event: RequestEvent): Promise<string | undefined | null> {
    // Check if we have a valid cached token first
    const cachedToken = event.cookies.get(TOKEN_CACHE_KEY);
    if (cachedToken) {
        const tokenData = JSON.parse(cachedToken);
        if (Date.now() < tokenData.expiresAt - TOKEN_EXPIRY_BUFFER) {
            return tokenData.token;
        }
    }

    // Only refresh token if cached token is expired or missing
    const tokenCache = confidentialClientApp.getTokenCache();
    const account = getAccount(event);
    
    if (account) {
        const authAccount = account?.homeAccountId
            ? await tokenCache.getAccountByHomeId(account.homeAccountId)
            : await tokenCache.getAccountByLocalId(account!.localAccountId!);

        if (authAccount) {
            const silentRequest: SilentFlowRequest = {
                account: authAccount,
                scopes: AZURE_SCOPES.split(',')
            };

            const tokenResponse = await confidentialClientApp.acquireTokenSilent(silentRequest);
            if (tokenResponse?.accessToken) {
                // Cache the token
                const tokenData = {
                    token: tokenResponse.accessToken,
                    expiresAt: tokenResponse.expiresOn?.getTime() || (Date.now() + 3600000)
                };
                
                event.cookies.set(TOKEN_CACHE_KEY, JSON.stringify(tokenData), {
                    httpOnly: true,
                    path: '/',
                    secure: import.meta.env.PROD,
                    sameSite: 'lax',
                    maxAge: Math.floor((tokenData.expiresAt - Date.now()) / 1000)
                });
                
                return tokenResponse.accessToken;
            }
        }
    }

    return null;
}

export function setCompanyCookie(event: RequestEvent, companyId: string, expiresAt: Date): void {
	event.cookies.set('company', companyId, {
		httpOnly: true,
		path: '/',
		secure: import.meta.env.PROD,
		sameSite: 'lax',
		expires: expiresAt
	});
}

export function setAccountCookie(event: RequestEvent, account: Account, expiresAt: Date): void {
	event.cookies.set('account', JSON.stringify(account), {
		httpOnly: true,
		path: '/',
		secure: import.meta.env.PROD,
		sameSite: 'lax',
		expires: expiresAt
	});
}

export function setSessionCookie(event: RequestEvent, token: string, expiresAt: Date): void {
	event.cookies.set('session', token, {
		httpOnly: true,
		path: '/',
		secure: import.meta.env.PROD,
		sameSite: 'lax',
		expires: expiresAt
	});
}
