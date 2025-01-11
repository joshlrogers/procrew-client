<script lang="ts">
	import { page } from '$app/stores';
	import { type Company, CompanySchema } from '$lib/shared/models/company';
	import { TextInput } from '$lib/components/inputs';
	import { AddressForm } from '$lib/components/addressForm';
	import { defaults, superForm } from 'sveltekit-superforms/client';
	import { zod } from 'sveltekit-superforms/adapters';
	import { Button, ButtonStyle } from '$lib/components/buttons/button';
	import type { ToastContext } from '@skeletonlabs/skeleton-svelte';
	import { getContext } from 'svelte';
	import { TimezoneSelectList } from '$lib/components/selectList/index.js';

	const toast: ToastContext = getContext('toast');

	interface CompanyDetailsProps {
		company?: Company;
		onclosed?: () => void
	}

	let {
		company = $bindable(),
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

				toast.create({
					type: 'success',
					title: 'Success!',
					description: `Updated company ${event.form.data.name}`,
					duration: 10000
				});
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

			{#await $page.data.countries then countries}
				{#await $page.data.states then states}
					<AddressForm name="address"
											 {countries}
											 {states}
											 formConstraints={constraints}
											 formData={form}
											 startingTabIndex={2}
											 formErrors={errors} />
				{/await}
			{/await}

			<TimezoneSelectList name="timezone"
													label="Timezone"
													required={true}
													errors={$errors.timezone}
													constraints={$constraints.timezone}
													bind:value={$form.timezone} />

			<div class="flex flex-row justify-end gap-2">

				<Button disabled={!isTainted($tainted) || $submitting}
								text="Reset"
								tabindex={8}
								onclick={() => reset()}
								buttonStyle={ButtonStyle.SECONDARY}
								type="button" />

				<Button disabled={!isTainted($tainted) || $submitting}
								text="Save"
								tabindex={7}
								buttonStyle={ButtonStyle.PRIMARY}
								type="submit" />
			</div>
		</div>
	</form>
{/if}
