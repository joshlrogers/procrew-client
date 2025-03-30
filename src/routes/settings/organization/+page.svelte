<script lang="ts">
	import { getContext } from 'svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';

	import { Panel } from '$lib/components/panel';
	import { TextInput } from '$lib/components/inputs';
	import { AddressForm } from '$lib/components/addressForm';
	import { Button, ButtonStyle } from '$lib/components/buttons/button';
	import { IconButton } from '$lib/components/buttons/iconButton';
	import { Icon, MaterialIcon } from '$lib/components/icon';
	import { Loader } from '$lib/components/loader';
	import { ActiveCompany } from '$lib/shared/stores';
	import { OrganizationSchema } from '$lib/shared/models/organization';

	import CompanyCreationDialog from './companyCreationDialog/companyCreationDialog.svelte';

	import type { PageData } from './$types';
	import type { ToastContext } from '@skeletonlabs/skeleton-svelte';

	const toast: ToastContext = getContext('toast');

	let { data }: { data: PageData } = $props();
	let companyCreationDialogOpen = $state(false);

	const { form, enhance, constraints, errors, tainted, isTainted, submitting } = superForm(data.form, {
		dataType: 'json',
		validationMethod: 'oninput',
		clearOnSubmit: 'errors-and-message',
		multipleSubmits: 'prevent',
		validators: zod(OrganizationSchema),
		resetForm: false,
		onUpdated: (event) => {
			if (event.form.valid) {
				toast.create({
					type: 'success',
					title: 'Success!',
					description: `Organization updated!`,
					duration: 10000
				});
			}
		}
	});

	const onAddCompanyClicked = () => {
		companyCreationDialogOpen = true;
	};
</script>

<div class="flex flex-col gap-4 items-center">

	<Panel class="w-[65%]">

		{#snippet header()}
			<div class="flex flex-row items-center">
				<Icon icon={MaterialIcon.BUSINESS_CENTER} class="mr-2" />
				Organization
			</div>
		{/snippet}

		{#snippet content()}
			<form method="POST" action="?/updateOrganization" use:enhance>
				<div class="flex flex-col gap-2">
					<input name="id" type="hidden" bind:value={$form.id} />
					<TextInput id="name"
										 name="name"
										 bind:value={$form.name}
										 label="Organization"
										 maxlength={120}
										 wrapperClass='mb-5'
										 required={true}
										 autofocus={true}
										 tabindex={1}
										 autocomplete="off"
										 errors={$errors.name}
										 constraints={$constraints.name} />

					{#await data.countries}
						<Loader />
					{:then countries}
						{#await data.states}
							<Loader />

						{:then states}
							<AddressForm name="address"
													 {countries}
													 {states}
													 formConstraints={constraints}
													 formData={form}
													 startingTabIndex={2}
													 formErrors={errors} />
						{/await}
					{/await}


					<div class="flex flex-row justify-end gap-2">
						<Button disabled={!isTainted($tainted) || $submitting}
										text="Save"
										tabindex={7}
										buttonStyle={ButtonStyle.PRIMARY}
										type="submit" />
					</div>
				</div>
			</form>
		{/snippet}
	</Panel>

	<Panel class="w-[65%]">

		{#snippet header()}
			<div class="flex flex-row items-center">
				<Icon icon={MaterialIcon.BUSINESS} class="mr-2" />
				Companies
			</div>
		{/snippet}

		{#snippet content()}
			<div class="w-full px-4 py-2 shadow-md bg-surface-300-700 rounded-t-lg">
				<IconButton onclick={onAddCompanyClicked}
										icon={MaterialIcon.ADD}
										isRounded={true}
										tooltip="Add a new company" />
			</div>
			<table class="table">
				<thead>
				<tr>
					<th>Company name</th>
					<th>Street address</th>
					<th>City</th>
					<th>State</th>
					<th>Zip code</th>
					<th>Phone number</th>
				</tr>
				</thead>
				<tbody>
				{#await data.companies}
					<tr class="border-b text-regent-gray-900 bg-regent-gray-100 border-regent-gray-300">
						<th scope="row"
								colspan="6"
								class="px-4 py-3 font-medium whitespace-nowrap">
							Loading companies...
						</th>
					</tr>
				{:then companies}
					{#if companies && companies.length > 0}
						{#each companies as company}
							{#key company.id}
								<tr>
									<th>
										{#if $ActiveCompany === company.id}
											<Icon icon={MaterialIcon.BOLT} class="mr-2" />
										{/if}
										{company.name}
									</th>
									<td>{company.address.addressLine1}</td>
									<td>{company.address.city}</td>
									<td>{company.address.state}</td>
									<td>{company.address.postalCode}</td>
									<td>{company.phoneNumber}</td>
								</tr>
							{/key}
						{/each}
					{:else}
						<tr class="border-b text-regent-gray-900 bg-regent-gray-100 border-regent-gray-300">
							<th scope="row"
									colspan="6"
									class="px-4 py-3 font-medium whitespace-nowrap">
								No companies found.
							</th>
						</tr>
					{/if}
				{/await}
				</tbody>
			</table>
			<div class="w-full px-4 py-2 overflow-x-auto shadow-md bg-surface-300-700 rounded-b-lg">
			</div>
		{/snippet}
	</Panel>

</div>
{#await data.companyTypes then companyTypes}
	{#await data.countries then countries}
		{#await data.states then states}
			<CompanyCreationDialog
				{states}
				{countries}
				open={companyCreationDialogOpen}
				{companyTypes}
				onclosed={() => companyCreationDialogOpen = false} />
		{/await}
	{/await}
{/await}
