<script lang="ts">
	import { zod } from 'sveltekit-superforms/adapters';
	import { superForm, defaults } from 'sveltekit-superforms/client';

	import { Dialog } from '$lib/components/dialog';
	import { InputField, TextInput } from '$lib/components/inputs';
	import { CompanyTypeSelectList, TimezoneSelectList } from '$lib/components/selectList';
	import { AddressForm } from '$lib/components/addressForm';
	import { Button, ButtonStyle } from '$lib/components/buttons/button';
	import { CompanySchema } from '$lib/shared/models/company';
	import toast from 'svelte-french-toast';

	let {
		states = [],
		countries = [],
		open = false,
		onclosed = undefined,
		companyTypes
	} = $props();


	const {
		form,
		constraints,
		errors,
		reset,
		enhance,
		submitting,
		tainted,
		isTainted
	} = superForm(defaults(zod(CompanySchema)), {
		dataType: 'json',
		validationMethod: 'oninput',
		validators: zod(CompanySchema),
		resetForm: true,
		onUpdated: (event) => {
			if (event.form.posted) {
				toast.success(`Created company ${event.form.data.name}!`);
				open = false;
				onclosed?.();
			}
		}
	});

	const onDialogClosed = () => {
		onclosed?.();
		reset();
	};
</script>

<Dialog {open} onclosed={onDialogClosed}>
	{#snippet title()}
		Create a new company
	{/snippet}

	{#snippet content()}
		<div class="flex flex-col gap-2">
			<form method="POST" action="?/createCompany" use:enhance>
				<CompanyTypeSelectList
					companyTypes={companyTypes}
					bind:value={$form.companyTypeId} />

				<TextInput
					label="Name"
					type="text"
					name="name"
					constraints={$constraints.name}
					errors={$errors.name}
					bind:value={$form.name} />

				<TimezoneSelectList
					label="Timezone"
					bind:value={$form.timezone} />

				<InputField
					label="Email address"
					type="email"
					name="emailAddress"
					constraints={$constraints.emailAddress}
					errors={$errors.emailAddress}
					bind:value={$form.emailAddress} />

				<AddressForm
					{states}
					{countries}
					formConstraints={constraints}
					formErrors={errors}
					formData={form} />

				<div
					class="mt-4 py-2 min-h-10 flex flex-row justify-end gap-2 border-t-2 border-t-regent-gray-300">
					<Button
						text="Cancel"
						buttonStyle={ButtonStyle.SECONDARY}
						onclick={() => {
							open = false;
							onclosed?.();
						}} />
					<Button
						text="Create"
						buttonStyle={ButtonStyle.PRIMARY}
						disabled={!isTainted($tainted) || $submitting }
						type="submit" />
				</div>

			</form>
		</div>
	{/snippet}

</Dialog>