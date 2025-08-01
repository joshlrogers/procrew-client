<script lang="ts">
	import { TextInput } from '$lib/components/inputs';
	import { AddressForm } from '$lib/components/addressForm';
	import { Button, ButtonStyle } from '$lib/components/buttons/button';
	import { OrganizationSchema, type Organization } from '$lib/shared/models/organization';
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';

	interface OrganizationPanelProps {
		organizationForm: SuperValidated<Organization>;
		action: string;
		onUpdated?: (organization: Organization) => void;
	}

	let {
		organizationForm,
		action = '?/updateOrganization',
		onUpdated = undefined
	}: OrganizationPanelProps = $props();

	const { form, enhance, constraints, errors, tainted, isTainted, reset, submitting } = superForm(
		organizationForm,
		{
			dataType: 'json',
			validationMethod: 'oninput',
			clearOnSubmit: 'errors-and-message',
			multipleSubmits: 'prevent',
			validators: zod(OrganizationSchema),
			resetForm: false,
			invalidateAll: false,
			onUpdated: (event) => {
				if (event.form.valid) {
					reset({ data: event.form.data, newState: event.form.data });
					onUpdated?.(event.form.data);
				}
			}
		}
	);
</script>

<form method="POST" {action} use:enhance>
	<div class="flex flex-col gap-2">
		<input name="id" type="hidden" bind:value={$form.id} />
		<TextInput
			id="name"
			name="name"
			bind:value={$form.name}
			label="Organization"
			maxlength={120}
			wrapperClass="mb-5"
			autofocus={true}
			tabindex={1}
			autocomplete="off"
			errors={$errors.name}
			constraints={$constraints.name}
		/>

		<AddressForm
			name="address"
			formConstraints={constraints}
			formData={form}
			startingTabIndex={2}
			formErrors={errors}
		/>

		<div class="flex flex-row justify-end gap-2">
			<Button
				disabled={!isTainted($tainted) || $submitting}
				text="Save"
				tabindex={7}
				buttonStyle={ButtonStyle.PRIMARY}
				type="submit"
			/>
		</div>
	</div>
</form>
