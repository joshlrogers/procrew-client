import type {PageServerLoad, RequestEvent} from "./$types";
import {getAccount, getToken} from "$lib/server/session";
import {ApiClient} from "$lib/server/apiClient";
import type {CountrySelectOption, StateSelectOption} from "$lib/shared/models/address";
import {fail, redirect} from "@sveltejs/kit";
import type {Organization} from "$lib/shared/models/organization";

export const load: PageServerLoad = async (event: RequestEvent) => {
    const accessToken = await getToken(event);
    const account = getAccount(event);

    if (!accessToken || !account?.defaultOrganizationId) {
        return redirect(302, `/login/b2c?redirect_url=${event.url.pathname}`);
    }

    return {
        countries: await fetchCountries(accessToken),
        organization: await fetchOrganization(account.defaultOrganizationId, accessToken),
        states: await fetchStates(accessToken),
    }
};

export const actions = {
    updateOrganization: async (event) => {
        const accessToken = await getToken(event);
        const account = getAccount(event);
        if (!accessToken || !account?.defaultOrganizationId) {
            return redirect(302, `/login/b2c?redirect_url=${event.url.pathname}`);
        }

        let data = await event.request.formData();

        let organization = {
            id: data.get("id"),
            name: data.get("organization_name"),
            address: {
                addressLine1: data.get("addressLine1"),
                addressLine2: data.get("addressLine2"),
                addressLine3: data.get("addressLine3"),
                city: data.get("city"),
                state: data.get("state"),
                country: (data.get("country") as string).toUpperCase(),
                postalCode: data.get("postalCode"),
            }
        }

        let result = await ApiClient.put(`/organization/${organization.id}`, organization, accessToken);
        if (result.isOk && result.value) {
            return {success: true, organization: result.value};
        }

        return fail(400);
    }
}

const fetchCountries = async (accessToken: string) => {
    let response = await ApiClient.get<CountrySelectOption[]>("/utility/lookup/address/countries", accessToken);
    if (response.isOk && response.value) {
        return response.value;
    }
};

const fetchOrganization = async (organizationId: string, accessToken: string) => {
    let response = await ApiClient.get<Organization>(`/organization/${organizationId}`, accessToken);
    if (response.isOk && response.value) {
        return response.value;
    }
};

const fetchStates = async (accessToken: string) => {
    let response = await ApiClient.get<StateSelectOption[]>("/utility/lookup/address/states", accessToken);
    if (response.isOk && response.value) {
        return response.value;
    }
};
