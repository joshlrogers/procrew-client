import { z } from 'zod';
import { AddressSchema } from '../address';

export enum CustomerType {
    RESIDENTIAL = 'Residential',
    COMMERCIAL = 'Commercial'
}

const quickAddCustomerSchema = z.object({
    customerType: z.nativeEnum(CustomerType).default(CustomerType.RESIDENTIAL),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    companyName: z.string().optional(),
    phoneNumber: z.string().optional(),
    email: z.string().email('Invalid email address.').optional(),
}).refine(
    (data) => {
        // For residential customers, first name and last name are required
        if (data.customerType === CustomerType.RESIDENTIAL) {
            return data.firstName && data.firstName.trim().length > 0 && 
                   data.lastName && data.lastName.trim().length > 0;
        }
        // For commercial customers, company name is required
        if (data.customerType === CustomerType.COMMERCIAL) {
            return data.companyName && data.companyName.trim().length > 0;
        }
        return false;
    },
    {
        message: "Required fields must be provided based on customer type.",
        path: ["firstName"], // This will show the error on the first name field for residential
    }
).refine(
    (data) => data.phoneNumber || data.email,
    {
        message: "Either phone number or email address must be provided.",
        path: ["phoneNumber"],
    }
);

const customerSchema = z.object({
    id: z.string().optional(),
    customerType: z.nativeEnum(CustomerType).default(CustomerType.RESIDENTIAL),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    companyName: z.string().optional(),
    phoneNumber: z.string().optional(),
    email: z.string().email('Invalid email address.').optional(),
    address: AddressSchema.optional().default({
        addressLine1: '',
        addressLine2: '',
        addressLine3: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
    }),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
});

type QuickAddCustomer = z.infer<typeof quickAddCustomerSchema>;
type Customer = z.infer<typeof customerSchema>;

export {
    quickAddCustomerSchema as QuickAddCustomerSchema,
    customerSchema as CustomerSchema,
    type QuickAddCustomer,
    type Customer,
} 