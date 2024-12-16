<script lang="ts">
    import {onDestroy, onMount} from "svelte";
    import {env} from "$env/dynamic/public";
    import {browser} from "$app/environment";
    import {TextInput} from "$lib/components/textInput";
    import {SelectList} from "$lib/components/selectList";
    import type {HTMLInputAttributes} from "svelte/elements";
    import type {Address, CountrySelectOption, StateSelectOption} from "$lib/shared/models/address";

    class AddressFormModel {
        addressLine1 = $state('')
        addressLine2: string | undefined = $state(undefined);
        addressLine3: string | undefined = $state(undefined);
        city = $state('');
        country = $state('')
        state = $state('');
        postalCode = $state('');

        constructor(address: Address) {
            this.addressLine1 = address.addressLine1;
            this.addressLine2 = address.addressLine2;
            this.addressLine3 = address.addressLine3;
            this.city = address.city;
            this.country = address.country;
            this.state = address.state;
            this.postalCode = address.postalCode;
        }

        address = (): Address => {
            return {
                addressLine1: this.addressLine1,
                addressLine2: this.addressLine2,
                addressLine3: this.addressLine3,
                city: this.city,
                postalCode: this.postalCode,
                country: this.country,
                state: this.state
            }
        }

        reset = () => {
            this.addressLine1 = '';
            this.addressLine2 = undefined;
            this.addressLine3 = undefined;
            this.city = '';
            this.state = '';
            this.postalCode = '';
            this.country = '';
        }
    }

    interface AddressFormProps extends HTMLInputAttributes {
        defaultAddress?: Address;
        countries: CountrySelectOption[];
        defaultCountry: CountrySelectOption;
        defaultState: StateSelectOption;
        onAddressChanged?: (address: Address) => void;
        states: StateSelectOption[];
    }

    let {
        countries = [] as CountrySelectOption[],
        defaultAddress = {} as Address,
        defaultCountry,
        defaultState,
        onAddressChanged = undefined,
        states = [] as StateSelectOption[],
    }: AddressFormProps = $props();

    let currentAddress = $state(new AddressFormModel(defaultAddress));

    let availableCountries = countries.map(country => {
        return {value: country.shortCode, label: country.name};
    });
    let availableStates = states.map(state => {
        return {value: state.abbreviation, label: state.name};
    });

    let selectedState = $state(availableStates[availableStates.findIndex(s => s.value === defaultState?.abbreviation)]);
    let selectedCountry = $state(availableCountries[availableCountries.findIndex(s => s.value === defaultCountry?.shortCode)]);

    let addressAutofill: any;

    onMount(async () => {
        if (browser) {
            let {autofill} = await import('@mapbox/search-js-web');
            addressAutofill = autofill({
                accessToken: env.PUBLIC_MAILBOX_API_TOKEN,
                options: {
                    country: "us",
                    proximity: "ip",
                    streets: false
                }
            });

            addressAutofill.addEventListener('retrieve', onInternalAddressChanged);
        }
    });

    onDestroy(() => {
        if (addressAutofill) {
            addressAutofill.removeEventListener('retrieve', onInternalAddressChanged);
            addressAutofill.remove();
        }
    })

    const onInternalAddressChanged = (event: any) => {
        let selectedProperties = event.detail.features[0].properties;

        currentAddress.addressLine1 = selectedProperties.address_line1;
        currentAddress.addressLine2 = selectedProperties.address_line2;
        currentAddress.addressLine3 = selectedProperties.address_line3;
        currentAddress.city = selectedProperties.address_level2;
        currentAddress.state = selectedProperties.address_level1;
        currentAddress.postalCode = selectedProperties.postcode;
        currentAddress.country = selectedProperties.country_code.toUpperCase();

        selectedCountry = availableCountries[availableCountries.findIndex(c => c.value === currentAddress.country)];
        selectedState = availableStates[availableStates.findIndex(s => s.value === currentAddress.state)];

        onAddressChanged?.(currentAddress.address());
    }
</script>

<TextInput label="Address"
           maxlength={240}
           width="w-full"
           required={true}
           value={currentAddress.addressLine1}
           autocomplete="street-address"/>

<input type="hidden" name="addressLine1" value={currentAddress.addressLine1}/>
<TextInput maxlength={240}
           name="addressLine2"
           width="w-full"
           autocomplete="address-line2"
           value={currentAddress.addressLine2}/>

<TextInput maxlength={240}
           name="addressLine3"
           width="w-full"
           wrapperClass='mb-5'
           autocomplete="address-line3"
           value={currentAddress.addressLine3}/>

<div class="flex flex-col md:flex-row md:flex-wrap gap-2">
    <TextInput label="City"
               name="city"
               maxlength={120}
               width="md:w-[12rem] w-full"
               required={true}
               autocomplete="address-level2"
               value={currentAddress.city}/>

    <SelectList items={availableStates}
                name="state"
                label="State"
                required={true}
                selectedValue={selectedState}
                width="md:w-[10rem] w-full"/>

    <TextInput label="Zip code"
               name="postalCode"
               maxlength={10}
               width="2xl:w-[10rem] w-full"
               required={true}
               autocomplete="address-postalCode"
               value={currentAddress.postalCode}/>

    <input type="hidden" name="country" autocomplete="country" value={selectedCountry?.value}/>
    <SelectList items={availableCountries}
                label="Country"
                required={true}
                selectedValue={selectedCountry}
                width="2xl:w-[15rem] w-full"/>

</div>

