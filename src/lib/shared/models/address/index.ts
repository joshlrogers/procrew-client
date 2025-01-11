import { z } from 'zod';

type Address = {
    addressLine1: string,
    addressLine2?: string,
    addressLine3?: string,
    city: string,
    country: string,
    postalCode: string
    state: string,
}
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

export {
    addressSchema as AddressSchema,
    type Address,
    type CountrySelectOption,
    type StateSelectOption,
}
