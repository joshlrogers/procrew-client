import Root from "./addressForm.svelte";
import type {Address} from "$lib/shared/models/address";

export interface AddressFormProps {
    address: Address
}

export {
    Root as AddressForm,
}