import { MaterialIcon } from '$lib/components/icon';
import { LeadPriority, LeadStatus } from './lead';

interface SelectListOption {
	icon?: MaterialIcon;
	label: string;
	value: any;
}

let ethnicityOptions: SelectListOption[] = [
	{ value: 1, label: 'Caucasian' },
	{ value: 2, label: 'Black' },
	{ value: 3, label: 'Other' }
];

let genderOptions: SelectListOption[] = [
	{ value: 1, label: 'Male' },
	{ value: 2, label: 'Female' },
	{ value: 3, label: 'Unspecified' }
];

let maritalStatusOptions: SelectListOption[] = [
	{ value: 1, label: 'Single' },
	{ value: 2, label: 'Married' }
];

let salutationOptions: SelectListOption[] = [
	{ value: 'Mr.', label: 'Mr.' },
	{ value: 'Mrs.', label: 'Mrs.' },
	{ value: 'Ms.', label: 'Ms.' },
	{ value: 'Miss', label: 'Miss' },
	{ value: 'Dr.', label: 'Dr.' },
	{ value: 'Prof.', label: 'Prof.' },
	{ value: 'Rev.', label: 'Rev.' }
];

let leadPriorityOptions: SelectListOption[] = [
	{ value: LeadPriority.Low, label: 'Low' },
	{ value: LeadPriority.Medium, label: 'Medium' },
	{ value: LeadPriority.High, label: 'High' }
];

let leadStatusOptions: SelectListOption[] = [
	{ value: LeadStatus.New, label: 'New' },
	{ value: LeadStatus.Contacted, label: 'Contacted' },
	{ value: LeadStatus.Qualified, label: 'Qualified' },
	{ value: LeadStatus.Closed, label: 'Closed' }
];

export {
	ethnicityOptions as EthnicityOptions,
	genderOptions as GenderOptions,
	maritalStatusOptions as MaritalStatusOptions,
	salutationOptions as SalutationOptions,
	leadPriorityOptions as LeadPriorityOptions,
	leadStatusOptions as LeadStatusOptions,
	type SelectListOption
};
