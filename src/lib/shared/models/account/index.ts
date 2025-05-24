import { z } from "zod";

const permissionSchema = z.object({
    description: z.string().nullable(),
    name: z.string(),
});

const accountSchema = z.object({
    availableCompanies: z.array(z.string()),
    defaultCompanyId: z.string().nullable(),
    defaultOrganizationId: z.string().nullable(),
    homeAccountId: z.string().nullable(),
    localAccountId: z.string().nullable(),
    emailAddress: z.string().email(),
    idpId: z.string().min(1).nullable(),
    firstName: z.string().min(1).max(125),
    lastName: z.string().min(1).max(125),
    isRegistered: z.boolean(),
    permissions: z.array(permissionSchema),
});

type Account = z.infer<typeof accountSchema>;

export {
    accountSchema as AccountSchema,
    type Account,
}