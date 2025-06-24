import Root from './addressForm.svelte';
import type { Address, CountrySelectOption, StateSelectOption } from '$lib/shared/models/address';
import type { SuperFormData, SuperFormErrors } from 'sveltekit-superforms/client';
import type { InputConstraints } from 'sveltekit-superforms';
import type { Writable } from 'svelte/store';
import type { HTMLInputAttributes } from 'svelte/elements';

export interface AddressFormProps extends HTMLInputAttributes {
	countries?: CountrySelectOption[];
	states?: StateSelectOption[];
	formConstraints: Writable<InputConstraints<Record<string, any>>>;
	formData: SuperFormData<Record<string, any>>;
	formErrors: SuperFormErrors<Record<string, any>>;
	startingTabIndex?: number;
}

export { Root as AddressForm };
