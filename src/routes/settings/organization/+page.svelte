<script lang="ts">
    import {enhance} from "$app/forms";
    import {Panel} from "$lib/components/panel/index.js";
    import {TextInput} from "$lib/components/textInput";
    import type {ActionData} from "./$types";
    import {AddressForm} from "$lib/components/addressForm/index.js";
    import {Button, ButtonStyle} from "$lib/components/buttons/button/index.js";
    import {addToast} from "$lib/components/toast"
    import {applyAction, deserialize} from "$app/forms";
    import {invalidateAll} from "$app/navigation";
    import type {ActionResult} from "@sveltejs/kit";

    let {data, form}: { data: any, form: ActionData } = $props()
    let organization = $state(data.organization);
    let organizationAddress = $state(data.organization.address);
    let organizationState = $state(data.states[data.states.findIndex(s => s.abbreviation === organization.address.state)])
    let organizationCountry = $state(data.countries[data.countries.findIndex(c => c.shortCode === organization.address.country)])
    let isWorking = $state(false);

    function enhanceForm() {
        isWorking = true;
        return async (event: any) => {
            isWorking = false;
            if(event.result.type === 'success') {
                await invalidateAll();
                console.log("Cheers!");
                addToast({
                    data: {
                        title: "Success",
                        description: "Organization updated.",
                        color: "bg-conifer"
                    }
                });

                refreshData();
            }

            await applyAction(event.result);
        };
    };

    function refreshData() {
        organization = data.organization;
        organizationAddress = data.organization.address;
        organizationState = data.states[data.states.findIndex(s => s.abbreviation === organization.address.state)]
        organizationCountry = data.countries[data.countries.findIndex(c => c.shortCode === organization.address.country)]
    }
</script>

<Panel class="m-5 p-4 max-w-[60%] mx-auto">
    <form method="POST" action="?/updateOrganization" use:enhance={enhanceForm}>
        <div class="flex flex-col gap-2">
            <input name="id" type="hidden" value={organization.id}/>
            <TextInput id="organization_name"
                       name="organization_name"
                       bind:value={organization.name}
                       label="Organization"
                       maxlength={120}
                       wrapperClass='mb-5'
                       required={true}
                       autofocus={true}
                       width="w-full"
                       tabIndex="1"/>

            <AddressForm name="address"
                         defaultAddress={organizationAddress}
                         states={data.states}
                         defaultState={organizationState}
                         countries={data.countries}
                         defaultCountry={organizationCountry}
                         onAddressChanged={(address) => organizationAddress = address}/>

            <div class="flex flex-row justify-end gap-2">
                <Button text="Cancel" buttonStyle={ButtonStyle.SECONDARY}/>
                <Button disabled={isWorking}
                        text="Save"
                        buttonStyle={ButtonStyle.PRIMARY}
                        type="submit"/>
            </div>
        </div>
    </form>
</Panel>

<Panel class="m-5 p-4 max-w-[60%] mx-auto">

</Panel>