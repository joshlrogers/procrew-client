import { z } from 'zod';
import { AddressSchema, type Address } from '../address';

export const LeadStatus = { 
    New: 'New',
    Contacted: 'Contacted',
    Qualified: 'Qualified',
    Closed: 'Closed'
} as const;

export type LeadStatusType = typeof LeadStatus[keyof typeof LeadStatus];

export const LeadPriority = {
    Low: 'Low',
    Medium: 'Medium',
    High: 'High'
} as const;

export type LeadPriorityType = typeof LeadPriority[keyof typeof LeadPriority];

const leadSchema = z.object({
    id: z.string().uuid().optional().nullable(),
    salutation: z.string().min(2, 'Salutation is too short.').max(12, 'Salutation is too long.').optional().nullable(),
    companyName: z.string().max(250, 'Company name is too long.').optional().nullable(),
    firstName: z.string().max(250, 'First name is too long.').optional().nullable(),
    lastName: z.string().max(250, 'Last name is too long.').optional().nullable(),
    emailAddress: z.string().email('Invalid email address.').max(250, 'Email is too long.').optional().nullable(),
    phoneNumber: z.string().max(15, 'Phone number is too long.').optional().nullable(),
    notes: z.string().max(1000, 'Notes are too long.').optional().nullable(),
    status: z.nativeEnum(LeadStatus).default(LeadStatus.New),
    assignedToId: z.string().uuid().optional().nullable(),
    priority: z.nativeEnum(LeadPriority).optional().nullable(),
    estimatedValue: z.number().min(0, 'Estimated value cannot be negative.').max(999999.99, 'Estimated value cannot exceed $999,999.99').optional().nullable(),
    address: AddressSchema.partial().optional().nullable()
}).refine((data) => {
    const hasCompanyName = data.companyName && data.companyName.trim().length > 0;
    const hasFirstName = data.firstName && data.firstName.trim().length > 0;
    const hasLastName = data.lastName && data.lastName.trim().length > 0;
    
    return hasCompanyName || hasFirstName || hasLastName;
}, {
    message: 'Either company name or at least one of first name or last name is required.',
    path: ['companyName'] // This will show the error on the companyName field, but you can adjust as needed
});

type Lead = z.infer<typeof leadSchema>;

export {
    leadSchema as LeadSchema,
    type Lead
}; 