<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { env } from '$env/dynamic/public';
	import { browser } from '$app/environment';
	import { MaskedTextInput, TextInput } from '$lib/components/inputs';
	import { SelectList } from '$lib/components/selectList';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { SuperFormData, SuperFormErrors } from 'sveltekit-superforms/client';
	import type { InputConstraints } from 'sveltekit-superforms';
	import type { Writable } from 'svelte/store';
	import type { CountrySelectOption, StateSelectOption } from '$lib/shared/models/address';
	import type { AddressLookupDetails } from '../../../routes/api/lookup/address-details/+server';

	interface AddressFormProps extends HTMLInputAttributes {
		formConstraints: Writable<InputConstraints<Record<string, any>>>;
		formData: SuperFormData<Record<string, any>>;
		formErrors: SuperFormErrors<Record<string, any>>;
		startingTabIndex?: number;
	}

	let {
		formConstraints = $bindable(),
		formData = $bindable(),
		formErrors = $bindable(),
		startingTabIndex = undefined
	}: AddressFormProps = $props();

	let states: StateSelectOption[] = $state([]);
	let countries: CountrySelectOption[] = $state([]);

	let availableCountries = $derived(
		countries.map((country) => ({ value: country.shortCode, label: country.name }))
	);

	let availableStates = $derived(states
		.filter((s) => s.country == ($formData.address?.country))
		.map((state) => ({
			value: state.abbreviation,
			label: state.name
		})));

	let addressAutofill: any;

	onMount(async () => {
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

		fetch('/api/lookup/address-details')
			.then(res => res.json() as Promise<AddressLookupDetails>)
			.then(details => {
				states = details.states;
				countries = details.countries;
			});
	});

	onDestroy(() => {
		if (addressAutofill) {
			addressAutofill.removeEventListener('retrieve', onInternalAddressChanged);
			addressAutofill.remove();
		}
	});

	const onInternalAddressChanged = (event: any) => {
		let selectedProperties = event.detail.features[0].properties;

		if (!$formData.address) {
			$formData.address = {};
		}

		$formData.address.addressLine1 = selectedProperties.address_line1;
		$formData.address.addressLine2 = selectedProperties.address_line2;
		$formData.address.addressLine3 = selectedProperties.address_line3;
		$formData.address.city = selectedProperties.address_level2;
		$formData.address.state = selectedProperties.address_level1;
		$formData.address.postalCode = selectedProperties.postcode;
		$formData.address.country =
			countries[
				countries.findIndex((c) => c.shortCode == selectedProperties.country_code.toUpperCase())
				].abbreviation;
	};

	const setCountry = (country: any) => {
		if (!$formData.address) {
			$formData.address = {};
		}

		if (country) {
			$formData.address.country =
				countries[countries.findIndex((c) => c.shortCode == country.toUpperCase())].abbreviation;
		} else {
			$formData.address.country = undefined;
		}
	};

	const getCountry = (countryAbbreviation: any) => {
		if (countryAbbreviation && countries.length > 0) {
			const countryIndex = countries.findIndex(
				(c) => c.abbreviation == countryAbbreviation.toUpperCase()
			);
			return countryIndex >= 0 ? countries[countryIndex].shortCode : undefined;
		} else {
			return undefined;
		}
	};

	// Helper function to safely get address field values
	const getAddressField = (field: string) => {
		return $formData.address?.[field] || '';
	};

	// Helper function to safely set address field values
	const setAddressField = (field: string, value: any) => {
		if (!$formData.address) {
			$formData.address = {};
		}
		$formData.address[field] = value;
	};

	// Initialize address object if it doesn't exist
	$effect(() => {
		if (!$formData.address) {
			$formData.address = {
				addressLine1: '',
				addressLine2: '',
				addressLine3: '',
				city: '',
				state: '',
				postalCode: '',
				country: ''
			};
		}
	});
</script>

<div class="flex flex-col gap-2">
	<input
		type="hidden"
		autocomplete="address-line1"
		value={getAddressField('addressLine1')}
		oninput={(e) => setAddressField('addressLine1', (e.target as HTMLInputElement)?.value)}
	/>
	<TextInput
		label="Address"
		autocomplete="street-address"
		maxlength={240}
		wrapperClass="w-full"
		tabindex={startingTabIndex ? startingTabIndex : undefined}
		constraints={($formConstraints as any).address?.addressLine1}
		errors={($formErrors as any).address?.addressLine1}
		value={getAddressField('addressLine1')}
		oninput={(e) => setAddressField('addressLine1', (e.target as HTMLInputElement)?.value)}
	/>

	<TextInput
		maxlength={240}
		name="addressLine2"
		wrapperClass="w-full"
		autocomplete="address-line2"
		constraints={($formConstraints as any).address?.addressLine2}
		errors={($formErrors as any).address?.addressLine2}
		value={getAddressField('addressLine2')}
		oninput={(e) => setAddressField('addressLine2', (e.target as HTMLInputElement)?.value)}
	/>

	<TextInput
		maxlength={240}
		name="addressLine3"
		wrapperClass="w-full"
		autocomplete="address-line3"
		constraints={($formConstraints as any).address?.addressLine3}
		errors={($formErrors as any).address?.addressLine3}
		value={getAddressField('addressLine3')}
		oninput={(e) => setAddressField('addressLine3', (e.target as HTMLInputElement)?.value)}
	/>
</div>

<div class="flex flex-col gap-2 sm:flex-wrap md:flex-row">
	<TextInput
		label="City"
		maxlength={120}
		wrapperClass="lg:w-[12rem] w-full"
		tabindex={startingTabIndex ? startingTabIndex + 1 : undefined}
		constraints={($formConstraints as any).address?.city}
		errors={($formErrors as any).address?.city}
		value={getAddressField('city')}
		oninput={(e) => setAddressField('city', (e.target as HTMLInputElement)?.value)}
	/>

	<SelectList
		items={availableStates}
		name="state"
		label="State"
		constraints={($formConstraints as any).address?.state}
		value={getAddressField('state')}
		onchanged={(val) => setAddressField('state', val)}
		tabindex={startingTabIndex ? startingTabIndex + 2 : undefined}
		wrapperClass="lg:w-[10rem] w-full"
	/>

	<MaskedTextInput
		label="Zip code"
		name="postalCode"
		maskType="PostalCode"
		maxlength={10}
		wrapperClass="lg:w-[10rem] w-full"
		autocomplete="postal-code"
		constraints={($formConstraints as any).address?.postalCode}
		errors={($formErrors as any).address?.postalCode}
		tabindex={startingTabIndex ? startingTabIndex + 3 : undefined}
		value={getAddressField('postalCode')}
		oninput={(e) => setAddressField('postalCode', (e.target as HTMLInputElement)?.value)}
	/>

	<SelectList
		items={availableCountries}
		name="country"
		label="Country"
		constraints={($formConstraints as any).address?.country}
		value={getCountry(getAddressField('country'))}
		onchanged={setCountry}
		tabindex={startingTabIndex ? startingTabIndex + 4 : undefined}
		wrapperClass="lg:w-[15rem] w-full"
	/>
</div>
