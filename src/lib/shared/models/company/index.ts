import { type Address, AddressSchema } from '$lib/shared/models/address';

type Company = {
	address: Address;
	companyTypeId: number;
	companyType?: CompanyType;
	emailAddress?: string;
	id?: string;
	name: string;
	phoneNumber?: string;
	timezone: string;
}

type CompanyType = {
	id?: string;
	description: string;
	name: string;
}

import { z } from 'zod';

const companySchema = z.object({
	companyTypeId: z.number(),
	emailAddress: z.string().email(),
	id: z.string().uuid(),
	name: z.string().min(3, 'Name is required.').max(125),
	timezone: z.string(),
	phoneNumber: z.string().nullish(),
	businessHours: z.object({

	}).optional().or(z.literal('')),
	address: AddressSchema
});

const newCompanySchema = z.object({
	emailAddress: z.string().email(),
	name: z.string().min(3, 'Name is required.').max(125),
	companyTypeId: z.number(),
	timezone: z.string(),
	phoneNumber: z.string().optional().or(z.literal('')),
	businessHours: z.object({

	}).optional().or(z.literal('')),
	address: AddressSchema
});

export {
	companySchema as CompanySchema,
	newCompanySchema as NewCompanySchema,
	type Company,
	type CompanyType
}