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
	emailAddress: z.string().email().optional().nullish(),
	id: z.string().uuid().optional(),
	name: z.string().min(3, 'Name is required.').max(125),
	timezone: z.string(),
	phoneNumber: z.string().nullish(),
	businessHours: businessHoursSchema,
	address: AddressSchema
});

type Company = z.infer<typeof companySchema>;

const holidaySchema = z.object({
	country: z.string().max(3).optional().nullish(),
	day: z.number().min(1).max(31).optional().nullish(),
	dayOfWeek: z.number().min(0).max(6).optional().nullish(),
	id: z.string().uuid().optional().nullish(),
	month: z.number().min(1).max(12),
	name: z.string(),
	region: z.string().max(3).optional().nullish(),
	week: z.number().min(1).max(4).optional().nullish()
});

const companyHolidaysSchema = z.object({
	holidays: z.array(holidaySchema)
});

type Holiday = z.infer<typeof holidaySchema>;
type Holidays = z.infer<typeof companyHolidaysSchema>;

export {
	businessHoursSchema as BusinessHoursSchema,
	companyHolidaysSchema as CompanyHolidaysSchema,
	companySchema as CompanySchema,
	holidaySchema as HolidaySchema,
	type BusinessHours,
	type Company,
	type CompanyType,
	type Holiday,
	type Holidays
};
