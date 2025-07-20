import type { Cookies, RequestEvent } from '@sveltejs/kit';
import type { Account } from '$lib/shared/models/account';
import { publicClientApp } from '$lib/server/auth/oauth';
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
	try {
		const cachedToken = event.cookies.get(TOKEN_CACHE_KEY);
		if (cachedToken) {
			try {
				const tokenData = JSON.parse(cachedToken);
				if (Date.now() < tokenData.expiresAt - TOKEN_EXPIRY_BUFFER) {
					return tokenData.token;
				}
			} catch (e) {
				// Clear invalid cached token
				event.cookies.set(TOKEN_CACHE_KEY, '', {
					httpOnly: true,
					path: '/',
					secure: import.meta.env.PROD,
					sameSite: 'lax',
					maxAge: 0
				});
			}
		}

		const account = getAccount(event);
		if (!account) {
			return null;
		}

		const tokenCache = publicClientApp.getTokenCache();
		const authAccount = account?.homeAccountId
			? await tokenCache.getAccountByHomeId(account.homeAccountId)
			: await tokenCache.getAccountByLocalId(account!.localAccountId!);

		if (authAccount) {
			const tokenResponse = await attemptSilentTokenAcquisition(authAccount, event);
			if (tokenResponse) {
				return tokenResponse;
			}
		}

		// Create a minimal account object that MSAL can work with
		// This uses the account identifiers stored in our extended cookie
		if (account.homeAccountId || account.localAccountId) {
			try {
				// Force MSAL to try silent acquisition with account identifiers
				// even though it's not in the cache - this can sometimes work
				// if the server-side MSAL cache has the refresh token
				const reconstructedAccount = {
					homeAccountId: account.homeAccountId,
					localAccountId: account.localAccountId,
					environment: '', // Will be populated by MSAL
					tenantId: '', // Will be populated by MSAL
					username: account.emailAddress
				};

				const silentRequest: SilentFlowRequest = {
					account: reconstructedAccount as any,
					scopes: AZURE_SCOPES.split(','),
					forceRefresh: true // Force a refresh to try to re-establish the token
				};

				const tokenResponse = await publicClientApp.acquireTokenSilent(silentRequest);
				
				if (tokenResponse?.accessToken) {
					return cacheAndReturnToken(tokenResponse.accessToken, tokenResponse.expiresOn, event);
				}
			} catch (reconstructionError) {
				console.log('Account reconstruction failed:', (reconstructionError as Error).message);
			}
		}
		
		return null;

	} catch (error) {
		console.error('Failed to acquire token - unexpected error:', error);
		// Clear any potentially invalid cached data
		event.cookies.set(TOKEN_CACHE_KEY, '', {
			httpOnly: true,
			path: '/',
			secure: import.meta.env.PROD,
			sameSite: 'lax',
			maxAge: 0
		});
		return null;
	}
}

async function attemptSilentTokenAcquisition(authAccount: any, event: RequestEvent): Promise<string | null> {
	try {
		const silentRequest: SilentFlowRequest = {
			account: authAccount,
			scopes: AZURE_SCOPES.split(',')
		};

		const tokenResponse = await publicClientApp.acquireTokenSilent(silentRequest);
		if (tokenResponse?.accessToken) {
			return cacheAndReturnToken(tokenResponse.accessToken, tokenResponse.expiresOn, event);
		} else {
			return null;
		}
	} catch (error) {
		return null;
	}
}

function cacheAndReturnToken(accessToken: string, expiresOn: Date | null, event: RequestEvent): string {
	// Cache the token
	const tokenData = {
		token: accessToken,
		expiresAt: expiresOn?.getTime() || Date.now() + 3600000
	};

	event.cookies.set(TOKEN_CACHE_KEY, JSON.stringify(tokenData), {
		httpOnly: true,
		path: '/',
		secure: import.meta.env.PROD,
		sameSite: 'lax',
		maxAge: Math.floor((tokenData.expiresAt - Date.now()) / 1000)
	});

	return accessToken;
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

export function setAccountCookie(event: RequestEvent, account: Account, tokenExpiresAt: Date): void {
	// Set account cookie to expire in 30 days instead of when the access token expires
	// This allows for long-term sessions with automatic token refresh
	const accountExpiresAt = new Date();
	accountExpiresAt.setDate(accountExpiresAt.getDate() + 30);
	
	event.cookies.set('account', JSON.stringify(account), {
		httpOnly: true,
		path: '/',
		secure: import.meta.env.PROD,
		sameSite: 'lax',
		expires: accountExpiresAt
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
