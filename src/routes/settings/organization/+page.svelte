<script lang="ts">

	import { Panel } from '$lib/components/panel';
	import { IconButton } from '$lib/components/buttons/iconButton';
	import { Icon, MaterialIcon } from '$lib/components/icon';
	import { ActiveCompany } from '$lib/shared/stores';
	import { type Organization } from '$lib/shared/models/organization';
	import toast from 'svelte-french-toast';
	import CompanyCreationDialog from './companyCreationDialog/companyCreationDialog.svelte';

	import type { PageProps } from './$types';
	import OrganizationPanel from './organizationPanel/organizationPanel.svelte';
	import { ProgressRing } from '@skeletonlabs/skeleton-svelte';

	let { data }: PageProps = $props();
	let companyCreationDialogOpen = $state(false);

	const onAddCompanyClicked = () => {
		companyCreationDialogOpen = true;
	};

	const onOrganizationUpdated = (organization: Organization) => {
		toast.success(`Organization updated!`);
	}
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
			{#await data.countries}
			<div class="flex flex-row justify-center items-center gap-2">
				<ProgressRing value={null} size="size-14" meterStroke="stroke-tertiary-600-400"
											trackStroke="stroke-tertiary-50-950" />
			</div>
			{:then countries}
				{#await data.states}
				<div class="flex flex-row justify-center items-center gap-2">
					<ProgressRing value={null} size="size-14" meterStroke="stroke-tertiary-600-400"
												trackStroke="stroke-tertiary-50-950" />
				</div>
				{:then states}
					<OrganizationPanel 
						organizationForm={data.form} 
						countries={countries} 
						states={states} 
						action="?/updateOrganization"
						onUpdated={onOrganizationUpdated} />
				{/await}
			{/await}
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
										flat={true}
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
