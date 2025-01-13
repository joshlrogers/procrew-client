import { z } from 'zod';

type CountrySelectOption = {
    abbreviation: string;
    name: string;
    shortCode: string;
}

type StateSelectOption = {
    abbreviation: string;
    country: string;
    name: string;
}

const addressSchema = z.object({
    addressLine1: z.string().min(3, 'Address is required.'),
    addressLine2: z.string().min(3, 'Field is too short.').optional().or(z.literal('')),
    addressLine3: z.string().min(3, 'Field is too short.').optional().or(z.literal('')),
    city: z.string().min(2, 'City is required.'),
    state: z.string().min(2, 'State is required.'),
    postalCode: z.string().min(4, 'Postal code is required.'),
    country: z.string().min(2, 'Country is required.'),
});

type Address = z.infer<typeof addressSchema>;

export {
    addressSchema as AddressSchema,
    type Address,
    type CountrySelectOption,
    type StateSelectOption,
}
