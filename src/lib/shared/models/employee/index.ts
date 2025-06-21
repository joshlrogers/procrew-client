import { z } from 'zod';
import { AddressSchema } from '$lib/shared/models/address';
import { parse } from 'date-fns';

const demographicsSchema = z.object({
	gender: z.number().optional().nullish(),
	race: z.number().optional().nullish(),
	ethnicity: z.number().optional().nullish(),
	maritalStatus: z.number().optional().nullish(),
	dateOfBirth: z.string().transform(val => parse(val, 'yyyy-MM-dd', new Date())).nullish(),
});

const demographicsFormSchema = z.object({
	gender: z.number().optional().nullish(),
	race: z.number().optional().nullish(),
	ethnicity: z.number().optional().nullish(),
	maritalStatus: z.number().optional().nullish(),
	dateOfBirth: z.string().nullish(),
});

const emergencyContactSchema = z.object({
	firstName: z.string().min(1, 'First name is required.').max(250, 'First name is too long.'),
	lastName: z.string().min(1, 'Last name is required.').max(250, 'Last name is too long.'),
	emailAddress: z.string().email().min(5, 'Email is invalid.').max(250, 'Email is too long.').optional().nullish(),
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
		emailAddress: z.string().email().min(5, 'Email is invalid.').max(250, 'Email is too long.').optional().nullish(),
		emergencyContacts: z.array(emergencyContactSchema).optional().nullish(),
		demographics: demographicsSchema,
		departmentId: z.string().uuid(),
		hireDate: z.string().transform(val => parse(val, 'yyyy-MM-dd', new Date())).nullish(),
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

const employeeFormSchema = z
	.object({
		id: z.string().uuid().optional().nullish(),
		address: AddressSchema,
		firstName: z.string().min(2, 'First name is required.'),
		lastName: z.string().min(2, 'Last name is required.'),
		emailAddress: z.string().email().min(5, 'Email is invalid.').max(250, 'Email is too long.').optional().nullish(),
		emergencyContacts: z.array(emergencyContactSchema).optional().nullish(),
		demographics: demographicsFormSchema,
		departmentId: z.string().uuid(),
		hireDate: z.string().nullish(),
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
type EmployeeForm = z.infer<typeof employeeFormSchema>;
type Demographics = z.infer<typeof demographicsSchema>;
type DemographicsForm = z.infer<typeof demographicsFormSchema>;

export {
	demographicsSchema as DemographicsSchema,
	demographicsFormSchema as DemographicsFormSchema,
	emergencyContactSchema as EmergencyContactSchema,
	employeeSchema as EmployeeSchema,
	employeeFormSchema as EmployeeFormSchema,
	type Demographics,
	type DemographicsForm,
	type EmergencyContact,
	type Employee,
	type EmployeeForm
};
