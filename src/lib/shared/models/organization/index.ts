import type { Address } from '$lib/shared/models/address';
import { z } from 'zod';

type Organization = {
    id?: string;
    name?: string;
    address?: Address;
}

const organizationSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(3, 'Name is required.'),
    address: z.object({
        addressLine1: z.string().min(3, 'Address is required.'),
        addressLine2: z.string().min(3, 'Field is too short.').optional().or(z.literal('')),
        addressLine3: z.string().min(3, 'Field is too short.').optional().or(z.literal('')),
        city: z.string().min(2, 'City is required.'),
        state: z.string().min(2, 'State is required.'),
        postalCode: z.string().min(4, 'Postal code is required.'),
        country: z.string().min(2, 'Country is required.'),
    })
});

export {
    organizationSchema as OrganizationSchema,
    type Organization
}