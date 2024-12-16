type Address = {
    addressLine1: string,
    addressLine2?: string,
    addressLine3?: string,
    city: string,
    country: string,
    postalCode: string
    state: string,
}
type CountrySelectOption = {
    abbreviation: string;
    name: string;
    shortCode: string;
}

type StateSelectOption = {
    abbreviation: string;
    country: string;
    name: string;
}

export {
    type Address,
    type CountrySelectOption,
    type StateSelectOption,
}
