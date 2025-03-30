<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { env } from '$env/dynamic/public';
	import { browser } from '$app/environment';
	import { TextInput } from '$lib/components/inputs';
	import { SelectList } from '$lib/components/selectList';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { SuperFormData, SuperFormErrors } from 'sveltekit-superforms/client';
	import type { InputConstraints } from 'sveltekit-superforms';
	import type { Writable } from 'svelte/store';
	import type { CountrySelectOption, StateSelectOption } from '$lib/shared/models/address';

	interface AddressFormProps extends HTMLInputAttributes {
		countries?: CountrySelectOption[]
		states?: StateSelectOption[],
		formConstraints: Writable<InputConstraints<Record<string, any>>>,
		formData: SuperFormData<Record<string, any>>;
		formErrors: SuperFormErrors<Record<string, any>>;
		startingTabIndex?: number;
	}

	let {
		countries = [],
		states = [],
		formConstraints = $bindable(),
		formData = $bindable(),
		formErrors = $bindable(),
		startingTabIndex = undefined
	}: AddressFormProps = $props();


	let availableCountries = $derived(countries.map(country => ({ value: country.shortCode, label: country.name })));

	let availableStates = $derived(states.map(state => ({ value: state.abbreviation, label: state.name })));

	let addressAutofill: any;

	onMount((async () => {
		if (browser) {
			let { autofill } = await import('@mapbox/search-js-web');
			addressAutofill = autofill({
				accessToken: env.PUBLIC_MAPBOX_API_TOKEN,
				options: {
					country: 'us',
					proximity: 'ip',
					streets: false
				}
			});

			addressAutofill.addEventListener('retrieve', onInternalAddressChanged);
		}
	}));

	onDestroy(() => {
		if (addressAutofill) {
			addressAutofill.removeEventListener('retrieve', onInternalAddressChanged);
			addressAutofill.remove();
		}
	});

	const onInternalAddressChanged = (event: any) => {
		let selectedProperties = event.detail.features[0].properties;

		$formData.address.addressLine1 = selectedProperties.address_line1;
		$formData.address.addressLine2 = selectedProperties.address_line2;
		$formData.address.addressLine3 = selectedProperties.address_line3;
		$formData.address.city = selectedProperties.address_level2;
		$formData.address.state = selectedProperties.address_level1;
		$formData.address.postalCode = selectedProperties.postcode;
		$formData.address.country = countries[countries.findIndex(c => c.shortCode == selectedProperties.country_code.toUpperCase())].abbreviation;

		$inspect(formData);
	}

	const setCountry = (country: any) => {
		if(country) {
			$formData.address.country = countries[countries.findIndex(c => c.shortCode == country.toUpperCase())].abbreviation;
		} else {
			$formData.address.country = undefined;
		}
	}

	const getCountry = (countryAbbreviation: any) => {
		if(countryAbbreviation) {
			return countries[countries.findIndex(c => c.abbreviation == countryAbbreviation.toUpperCase())].shortCode;
		} else {
			return undefined;
		}
	}

</script>

<div class="flex flex-col gap-2">
	<input type="hidden"
				 autocomplete="address-line1"
				 bind:value={$formData.address.addressLine1} />
	<TextInput label="Address"
						 autocomplete="street-address"
						 maxlength={240}
						 wrapperClass="w-full"
						 required={true}
						 tabindex={startingTabIndex ? startingTabIndex : undefined}
						 constraints={$formConstraints.address?.addressLine1}
						 errors={$formErrors.address?.addressLine1}
						 bind:value={$formData.address.addressLine1} />

	<TextInput maxlength={240}
						 name="addressLine2"
						 wrapperClass="w-full"
						 autocomplete="address-line2"
						 constraints={$formConstraints.address?.addressLine2}
						 errors={$formErrors.address?.addressLine2}
						 bind:value={$formData.address.addressLine2} />

	<TextInput maxlength={240}
						 name="addressLine3"
						 wrapperClass='w-full'
						 autocomplete="address-line3"
						 constraints={$formConstraints.address?.addressLine3}
						 errors={$formErrors.address?.addressLine3}
						 bind:value={$formData.address.addressLine3} />

</div>

<div class="flex flex-col md:flex-row sm:flex-wrap gap-2">
	<TextInput label="City"
						 maxlength={120}
						 wrapperClass="lg:w-[12rem] w-full"
						 required={true}
						 tabindex={startingTabIndex ? startingTabIndex + 1 : undefined}
						 constraints={$formConstraints.address?.city}
						 errors={$formErrors.address?.city}
						 bind:value={$formData.address.city} />

	<SelectList items={availableStates}
							name="state"
							label="State"
							required={true}
							value={$formData.address.state}
							onchanged={(val) => $formData.address.state = val}
							tabindex={startingTabIndex ? startingTabIndex + 2 : undefined}
							wrapperClass="lg:w-[10rem] w-full" />

	<TextInput label="Zip code"
						 name="postalCode"
						 maxlength={10}
						 wrapperClass="lg:w-[10rem] w-full"
						 required={true}
						 autocomplete="address-postalCode"
						 constraints={$formConstraints.address?.postalCode}
						 errors={$formErrors.address?.postalCode}
						 tabindex={startingTabIndex ? startingTabIndex + 3 : undefined}
						 bind:value={$formData.address.postalCode} />

	<SelectList items={availableCountries}
							name="country"
							label="Country"
							required={true}
							value={getCountry($formData.address.country)}
							onchanged={setCountry}
							tabindex={startingTabIndex ? startingTabIndex + 4 : undefined}
							wrapperClass="lg:w-[15rem] w-full" />
</div>

