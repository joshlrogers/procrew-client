import { z } from 'zod';
import { AddressSchema } from '../address';

export enum CustomerType {
	RESIDENTIAL = 'Residential',
	COMMERCIAL = 'Commercial'
}

const quickAddCustomerSchema = z
	.object({
		customerType: z.nativeEnum(CustomerType).default(CustomerType.RESIDENTIAL),
		firstName: z.string().optional(),
		lastName: z.string().optional(),
		companyName: z.string().optional(),
		phoneNumber: z.string().optional(),
		primaryEmailAddress: z.string().email('Invalid email address.').optional()
	})
	.superRefine((val, ctx) => {
		if (val.customerType === CustomerType.RESIDENTIAL) {
			if (!val.firstName) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'First name is required for residential customers.',
					path: ['firstName']
				});
			}

			if (!val.lastName) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Last name is required for residential customers.',
					path: ['lastName']
				});
			}
		}
		if (val.customerType === CustomerType.COMMERCIAL) {
			if (!val.companyName) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Company name is required for commercial customers.',
					path: ['companyName']
				});
			}
		}

		if (!val.phoneNumber && !val.primaryEmailAddress) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Phone number or email address must be provided.',
				path: ['phoneNumber']
			});

			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Email address or phone number must be provided.',
				path: ['primaryEmailAddress']
			});
		}
	});

const customerSchema = z.object({
	id: z.string().optional(),
	customerType: z.nativeEnum(CustomerType).default(CustomerType.RESIDENTIAL),
	firstName: z.string().optional(),
	lastName: z.string().optional(),
	companyName: z.string().optional(),
	phoneNumber: z.string().optional(),
	primaryEmailAddress: z.string().email('Invalid email address.').optional(),
	address: AddressSchema.optional().default({
		addressLine1: '',
		addressLine2: '',
		addressLine3: '',
		city: '',
		state: '',
		postalCode: '',
		country: ''
	}),
	createdAt: z.date().optional(),
	updatedAt: z.date().optional()
});

type QuickAddCustomer = z.infer<typeof quickAddCustomerSchema>;
type Customer = z.infer<typeof customerSchema>;

export {
	quickAddCustomerSchema as QuickAddCustomerSchema,
	customerSchema as CustomerSchema,
	type QuickAddCustomer,
	type Customer
};
