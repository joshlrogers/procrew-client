import { AddressSchema } from '$lib/shared/models/address';
import { z } from 'zod';

const organizationSchema = z.object({
    id: z.string().uuid().nullable(),
    name: z.string().min(3, 'Name is required.'),
    address: AddressSchema
});

type Organization = z.infer<typeof organizationSchema>;

export {
    organizationSchema as OrganizationSchema,
    type Organization
}