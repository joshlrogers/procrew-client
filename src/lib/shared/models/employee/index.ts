import { z } from 'zod';
import { AddressSchema } from '$lib/shared/models/address';

const demographicsSchema = z.object({
	gender: z.string().optional().nullish(),
	race: z.string().optional().nullish(),
	ethnicity: z.string().optional().nullish(),
	maritalStatus: z.string().optional().nullish(),
	dateOfBirth: z.date().nullish(),
});

const emergencyContactSchema = z.object({
	firstName: z.string().min(1, 'First name is required.').max(250, 'First name is too long.'),
	lastName: z.string().min(1, 'Last name is required.').max(250, 'Last name is too long.'),
	emailAddress: z.string().email().max(250, 'Email is too long.').optional().nullish(),
	isPrimary: z.boolean().default(false),
	phoneNumber: z.string().optional().nullish(),
	relation: z.string()
});

const employeeSchema = z
	.object({
		id: z.string().uuid().optional().nullish(),
		address: AddressSchema,
		firstName: z.string().min(2, 'First name is required.'),
		lastName: z.string().min(2, 'Last name is required.'),
		emailAddress: z.string().email().optional().nullish(),
		emergencyContacts: z.array(emergencyContactSchema).optional().nullish(),
		demographics: demographicsSchema,
		hireDate: z.date().nullish(),
		phoneNumber: z.string().optional().nullish(),
		sequence: z.number().optional().nullish(),
		title: z.string().optional().nullish()
	})
	.superRefine((emp, ctx) => {
		if(!emp.emailAddress && !emp.phoneNumber){
			ctx.addIssue({
				code: 'custom',
				message: "Must have an email address or phone number.",
				path: ['phoneNumber']
			})
		}
	});

type EmergencyContact = z.infer<typeof emergencyContactSchema>;
type Employee = z.infer<typeof employeeSchema>;
type Demographics = z.infer<typeof demographicsSchema>;

export {
	demographicsSchema as DemographicsSchema,
	emergencyContactSchema as EmergencyContactSchema,
	employeeSchema as EmployeeSchema,
	type Demographics,
	type EmergencyContact,
	type Employee
};
