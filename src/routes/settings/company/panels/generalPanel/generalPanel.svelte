<script lang="ts">
	import { defaults, superForm } from 'sveltekit-superforms/client';
	import { zod } from 'sveltekit-superforms/adapters';

	import { page } from '$app/state';

	import { type Company, CompanySchema } from '$lib/shared/models/company';
	import { TextInput } from '$lib/components/inputs';
	import { AddressForm } from '$lib/components/addressForm';
	import { Button, ButtonStyle } from '$lib/components/buttons/button';
	import { TimezoneSelectList } from '$lib/components/selectList';
	import toast from 'svelte-french-toast';

	interface CompanyDetailsProps {
		company?: Company;
	}

	let {
		company
	}: CompanyDetailsProps = $props();

	const {
		form,
		constraints,
		errors,
		reset,
		enhance,
		submitting,
		tainted,
		isTainted
	} = superForm(defaults(company, zod(CompanySchema)), {
		dataType: 'json',
		validationMethod: 'oninput',
		validators: zod(CompanySchema),
		multipleSubmits: 'prevent',
		resetForm: true,
		onUpdated: (event) => {
			if (event.form.valid) {
				reset({ data: event.form.data, newState: event.form.data });

				toast.success(`Updated company ${event.form.data.name}`);
			}
		}
	});

	$effect(() => {
		if ($form.id !== company?.id) {
			reset({
				data: company
			});
		}
	});
</script>

{#if company}
	<form method="POST" action="?/updateCompany" use:enhance>
		<div class="flex flex-col gap-4">

			<input type="hidden" value={$form.id} name="id" />

			<TextInput
				label="Name"
				name="name"
				tabindex={1}
				autofocus
				errors={$errors.name}
				bind:value={$form.name} />

			{#await page.data.countries then countries}
				{#await page.data.states then states }
					<AddressForm name="address"
											 {countries}
											 {states}
											 formConstraints={constraints}
											 formData={form}
											 startingTabIndex={2}
											 formErrors={errors} />
				{/await}
			{/await}

			<TextInput label="Email address"
								 name="emailAddress"
								 errors={$errors.emailAddress}
								 constraints={$constraints.emailAddress}
								 tabindex={7}
								 type="email"
								 bind:value={$form.emailAddress} />

			<TextInput label="Phone number"
								 name="phoneNumber"
								 errors={$errors.phoneNumber}
								 constraints={$constraints.phoneNumber}
								 tabindex={8}
								 type="tel"
								 bind:value={$form.phoneNumber} />

			<TimezoneSelectList name="timezone"
													label="Timezone"
													required={true}
													errors={$errors.timezone}
													constraints={$constraints.timezone}
													tabindex={9}
													bind:value={$form.timezone} />

			<div class="flex flex-row justify-end gap-2">

				<Button disabled={!isTainted($tainted) || $submitting}
								text="Reset"
								tabindex={11}
								onclick={() => reset()}
								buttonStyle={ButtonStyle.SECONDARY}
								type="button" />

				<Button disabled={!isTainted($tainted) || $submitting}
								text="Save"
								tabindex={10}
								buttonStyle={ButtonStyle.PRIMARY}
								type="submit" />
			</div>
		</div>
	</form>
{/if}
