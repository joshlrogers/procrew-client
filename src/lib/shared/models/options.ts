import { MaterialIcon } from '$lib/components/icon';

interface SelectListOption {
	icon?: MaterialIcon;
	label: string;
	value: any;
}

let ethnicityOptions: SelectListOption[] = [
	{ value: 'caucasian', label: 'Caucasian' },
	{ value: 'black', label: 'Black' },
	{ value: 'other', label: 'Other' },
]

let genderOptions: SelectListOption[] = [
	{ value: 'male', label: 'Male' },
	{ value: 'female', label: 'Female' },
	{ value: 'unspecified', label: 'Unspecified' },
]

let maritalStatusOptions: SelectListOption[] = [
	{ value: 'single', label: 'Single' },
	{ value: 'married', label: 'Married' },
]

export {
	ethnicityOptions as EthnicityOptions,
	genderOptions as GenderOptions,
	maritalStatusOptions as MaritalStatusOptions,
	type SelectListOption
}