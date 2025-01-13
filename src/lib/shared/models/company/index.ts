import { AddressSchema } from '$lib/shared/models/address';

type CompanyType = {
	id?: string;
	description: string;
	name: string;
};

import { z } from 'zod';

const businessHoursSchema = z
	.object({
		sundayStart: z.string().optional().nullish(),
		sundayEnd: z.string().optional().nullish(),
		mondayStart: z.string().optional().nullish(),
		mondayEnd: z.string().optional().nullish(),
		tuesdayStart: z.string().optional().nullish(),
		tuesdayEnd: z.string().optional().nullish(),
		wednesdayStart: z.string().optional().nullish(),
		wednesdayEnd: z.string().optional().nullish(),
		thursdayStart: z.string().optional().nullish(),
		thursdayEnd: z.string().optional().nullish(),
		fridayStart: z.string().optional().nullish(),
		fridayEnd: z.string().optional().nullish(),
		saturdayStart: z.string().optional().nullish(),
		saturdayEnd: z.string().optional().nullish()
	})
	.refine((hours) => Boolean(hours.sundayStart) === Boolean(hours.sundayEnd), {
		message: 'Must have a start and end time for each day.',
		path: ['sundayStart', 'sundayEnd']
	})
	.refine((hours) => Boolean(hours.mondayStart) === Boolean(hours.mondayEnd), {
		message: 'Must have a start and end time for each day.',
		path: ['mondayStart', 'mondayEnd']
	})
	.refine((hours) => Boolean(hours.tuesdayStart) === Boolean(hours.tuesdayEnd), {
		message: 'Must have a start and end time for each day.',
		path: ['tuesdayStart', 'tuesdayEnd']
	})
	.refine((hours) => Boolean(hours.wednesdayStart) === Boolean(hours.wednesdayEnd), {
		message: 'Must have a start and end time for each day.',
		path: ['wednesdayStart', 'wednesdayEnd']
	})
	.refine((hours) => Boolean(hours.thursdayStart) === Boolean(hours.thursdayEnd), {
		message: 'Must have a start and end time for each day.',
		path: ['thursdayStart', 'thursdayEnd']
	})
	.refine((hours) => Boolean(hours.fridayStart) === Boolean(hours.fridayEnd), {
		message: 'Must have a start and end time for each day.',
		path: ['fridayStart', 'fridayEnd']
	})
	.refine((hours) => Boolean(hours.saturdayStart) === Boolean(hours.saturdayEnd), {
		message: 'Must have a start and end time for each day.',
		path: ['saturdayStart', 'saturdayEnd']
	});

type BusinessHours = z.infer<typeof businessHoursSchema>;

const companySchema = z.object({
	companyTypeId: z.number(),
	emailAddress: z.string().email(),
	id: z.string().uuid().optional(),
	name: z.string().min(3, 'Name is required.').max(125),
	timezone: z.string(),
	phoneNumber: z.string().nullish(),
	businessHours: businessHoursSchema,
	address: AddressSchema
});

type Company = z.infer<typeof companySchema>;

export {
	businessHoursSchema as BusinessHoursSchema,
	companySchema as CompanySchema,
	type BusinessHours,
	type Company,
	type CompanyType
};
