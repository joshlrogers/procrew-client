import * as msal from '@azure/msal-node';
import { AZURE_CLIENT_ID, AZURE_AUTHORITY, AZURE_AUTHORITY_DOMAIN } from '$env/static/private';
import type { Configuration } from '@azure/msal-node';

// Validate required environment variables
if (!AZURE_CLIENT_ID || AZURE_CLIENT_ID.trim() === '') {
	throw new Error('AZURE_CLIENT_ID environment variable is required but not set. Please configure this in your .env file.');
}

if (!AZURE_AUTHORITY || AZURE_AUTHORITY.trim() === '') {
	throw new Error('AZURE_AUTHORITY environment variable is required but not set. Please configure this in your .env file.');
}

const publicClientConfig: Configuration = {
	auth: {
		clientId: AZURE_CLIENT_ID,
		authority: AZURE_AUTHORITY,
		knownAuthorities: [AZURE_AUTHORITY_DOMAIN]
	}
};

// Create an MSAL PublicClientApplication object
export const publicClientApp = new msal.PublicClientApplication(
	publicClientConfig
);

export const cryptoProvider = new msal.CryptoProvider();
