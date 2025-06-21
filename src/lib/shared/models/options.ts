import { MaterialIcon } from '$lib/components/icon';

interface SelectListOption {
	icon?: MaterialIcon;
	label: string;
	value: any;
}

let ethnicityOptions: SelectListOption[] = [
	{ value: 1, label: 'Caucasian' },
	{ value: 2, label: 'Black' },
	{ value: 3, label: 'Other' },
]

let genderOptions: SelectListOption[] = [
	{ value: 1, label: 'Male' },
	{ value: 2, label: 'Female' },
	{ value: 3, label: 'Unspecified' },
]

let maritalStatusOptions: SelectListOption[] = [
	{ value: 1, label: 'Single' },
	{ value: 2, label: 'Married' },
]

export {
	ethnicityOptions as EthnicityOptions,
	genderOptions as GenderOptions,
	maritalStatusOptions as MaritalStatusOptions,
	type SelectListOption
}