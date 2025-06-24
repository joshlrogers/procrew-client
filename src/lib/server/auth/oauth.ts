import * as msal from '@azure/msal-node';
import { AZURE_CLIENT_ID, AZURE_AUTHORITY, AZURE_AUTHORITY_DOMAIN } from '$env/static/private';
import type { Configuration } from '@azure/msal-node';

const confidentialClientConfig: Configuration = {
	auth: {
		clientId: AZURE_CLIENT_ID,
		authority: AZURE_AUTHORITY,
		clientSecret: ' ',
		knownAuthorities: [AZURE_AUTHORITY_DOMAIN]
	}
};

// Create an MSAL PublicClientApplication object
export const confidentialClientApp = new msal.ConfidentialClientApplication(
	confidentialClientConfig
);

export const cryptoProvider = new msal.CryptoProvider();
