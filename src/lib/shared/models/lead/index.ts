import { z } from 'zod';
import { AddressSchema, type Address } from '../address';

// Optional address schema for leads (no required fields)
const optionalAddressSchema = z
	.object({
		addressLine1: z.string().optional().nullable(),
		addressLine2: z.string().optional().nullable(),
		addressLine3: z.string().optional().nullable(),
		city: z.string().optional().nullable(),
		state: z.string().optional().nullable(),
		postalCode: z.string().optional().nullable(),
		country: z.string().optional().nullable()
	})
	.optional()
	.nullable();

export const LeadStatus = {
	New: 0,
	Contacted: 1,
	Qualified: 2,
	Closed: 3
} as const;

export type LeadStatusType = (typeof LeadStatus)[keyof typeof LeadStatus];

export const LeadPriority = {
	Low: 0,
	Medium: 1,
	High: 2
} as const;

export type LeadPriorityType = (typeof LeadPriority)[keyof typeof LeadPriority];

const leadSchema = z
	.object({
		id: z.string().uuid().optional().nullable(),
		salutation: z
			.string()
			.min(2, 'Salutation is too short.')
			.max(12, 'Salutation is too long.')
			.optional()
			.nullable(),
		companyName: z.string().max(250, 'Company name is too long.').optional().nullable(),
		firstName: z.string().max(250, 'First name is too long.').optional().nullable(),
		lastName: z.string().max(250, 'Last name is too long.').optional().nullable(),
		emailAddress: z
			.string()
			.max(250, 'Email is too long.')
			.refine(
				(val) => !val || val === '' || z.string().email().safeParse(val).success,
				'Invalid email address.'
			)
			.optional()
			.nullable(),
		phoneNumber: z.string().max(15, 'Phone number is too long.').optional().nullable(),
		notes: z.string().max(1000, 'Notes are too long.').optional().nullable(),
		status: z.nativeEnum(LeadStatus).default(LeadStatus.New),
		assignedToId: z.string().uuid().optional().nullable(),
		priority: z.nativeEnum(LeadPriority).default(LeadPriority.Medium).optional().nullable(),
		estimatedValue: z
			.number()
			.min(0, 'Estimated value cannot be negative.')
			.max(999999.99, 'Estimated value cannot exceed $999,999.99')
			.optional()
			.nullable(),
		address: optionalAddressSchema
	})
	.transform((data) => {
		// Convert empty address object to null if all address fields are empty
		if (data.address) {
			const hasAddressData =
				data.address.addressLine1?.trim() ||
				data.address.city?.trim() ||
				data.address.state?.trim() ||
				data.address.postalCode?.trim() ||
				data.address.country?.trim();

			if (!hasAddressData) {
				data.address = null;
			}
		}

		return data;
	})
	.refine(
		(data) => {
			const hasCompanyName = data.companyName && data.companyName.trim().length > 0;
			const hasFirstName = data.firstName && data.firstName.trim().length > 0;
			const hasLastName = data.lastName && data.lastName.trim().length > 0;

			return hasCompanyName || hasFirstName || hasLastName;
		},
		{
			message: 'Either company name or at least one of first name or last name is required.',
			path: ['companyName']
		}
	)
	.refine(
		(data) => {
			const hasEmail = data.emailAddress && data.emailAddress.trim().length > 0;
			const hasPhone = data.phoneNumber && data.phoneNumber.trim().length > 0;

			return hasEmail || hasPhone;
		},
		{
			message: 'Either email address or phone number is required.',
			path: ['emailAddress']
		}
	);

type Lead = z.infer<typeof leadSchema>;

// Status update request schema for API
export const updateLeadStatusRequestSchema = z.object({
	status: z.nativeEnum(LeadStatus),
	closedReason: z.string().optional().nullable(),
	notes: z.string().optional().nullable()
});

export type UpdateLeadStatusRequest = z.infer<typeof updateLeadStatusRequestSchema>;

// Status update form schema for superforms
export const leadStatusUpdateFormSchema = z.object({
	leadId: z.string().uuid(),
	status: z.nativeEnum(LeadStatus),
	closedReason: z.string().optional().nullable(),
	notes: z.string().max(500, 'Notes cannot exceed 500 characters.').optional().nullable()
});

export type LeadStatusUpdateForm = z.infer<typeof leadStatusUpdateFormSchema>;

export { leadSchema as LeadSchema, type Lead };
