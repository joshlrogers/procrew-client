import type { RequestEvent } from '@sveltejs/kit';
import type { Account } from '$lib/shared/models/account';
import { confidentialClientApp } from '$lib/server/oauth';
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

export function getAccount(event: RequestEvent): Account | null {
	const rawAccount = event.cookies.get('account');
	if (!rawAccount) {
		return null;
	}

	return JSON.parse(rawAccount) as Account;
}

export function getCompany(event: RequestEvent): string | undefined {
	const rawCompany = event.cookies.get('company');
	if (!rawCompany) {
		return undefined;
	}

	return rawCompany;
}

export async function getToken(event: RequestEvent): Promise<string | undefined | null> {
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
			if (!tokenResponse || tokenResponse.accessToken.length === 0) {
				return null;
			}

			return tokenResponse.accessToken;
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
