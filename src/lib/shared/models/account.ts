import type {Permission} from "$lib/shared/models/permission";

export interface Account {
    availableCompanies: string[];
    defaultCompanyId: string | null;
    defaultOrganizationId: string | null;
    emailAddress: string;
    firstName: string;
    homeAccountId: string | null;
    idpId: string | null;
    isRegistered: boolean;
    lastName: string;
    localAccountId: string | null;
    permissions: Permission[];
}

