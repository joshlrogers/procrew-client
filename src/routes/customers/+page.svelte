<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { Button } from '$lib/components/buttons/button';
	import { ButtonStyle } from '$lib/components/buttons/button';
	import { Panel } from '$lib/components/panel';
	import { QuickAddCustomerModal } from '$lib/components/quickAddCustomerModal';
	import type { QuickAddCustomer } from '$lib/shared/models/customer';
	import { ProgressRing } from '@skeletonlabs/skeleton-svelte';
	import type { PageProps } from './$types';
	import toast from 'svelte-french-toast';
	import Tooltip from '$lib/components/tooltip/Tooltip.svelte';
	let {
		data
	}: PageProps = $props();
	
	let showQuickAddModal = $state(false);

	const handleAddCustomer = () => {
		showQuickAddModal = true;
	};

	const handleCloseModal = (success?: boolean) => {
		showQuickAddModal = false;
		if(success) {
			toast.success("Customer added successfully");	
			invalidate("customers");
		} else if(success === false) {
			toast.error("Failed to add customer");
		}
	};

	const handleSaveCustomer = async (customer: QuickAddCustomer): Promise<string | null> => {
		return null;
	};
</script>

<svelte:head>
	<title>Customer Dashboard</title>
</svelte:head>

<div class="flex flex-col gap-4 items-center">
	<Panel class="w-[75%]">
		{#snippet header()}
		<div class="flex flex-row justify-between">	
			<div>
				<h1 class="text-2xl font-bold">Customer Dashboard</h1>
			</div>
			<div>
				<Tooltip text="Quick add a new customer." 
					arrow={true}
					size="md"
					position="bottom"
				>
					<Button
						text="Quick Add"
						buttonStyle={ButtonStyle.TERTIARY}
						onclick={handleAddCustomer}
						width="w-24"
						height="h-8"
					/>
				</Tooltip>
			</div>
		</div>
		{/snippet}
		{#snippet content()}
		{#await data.customers}
			<div class="flex flex-row justify-center items-center gap-2">
				<ProgressRing value={null} size="size-14" meterStroke="stroke-tertiary-600-400"
											trackStroke="stroke-tertiary-50-950" />
			</div>
		{:then customers}
			<div class="flex flex-col justify-between items-center mb-8">
				{#if customers.length === 0}
					<h3 class="text-lg font-medium text-primary-400-600 mb-2">No customers yet</h3>
					<Button
						text="Add Your First Customer"
						buttonStyle={ButtonStyle.SECONDARY}
						onclick={handleAddCustomer}
						width="w-auto"
						class="px-6"
						/>
				{:else}
					<table class='table'>
						<thead class="table-header-group">
							<tr class="table-header-row">
								<th class="table-header-cell">First Name</th>
								<th class="table-header-cell">Last Name</th>
								<th class="table-header-cell">Email</th>
							</tr>
						</thead>
						<tbody class="table-row-group">
							{#each customers as customer}
							<tr class="table-row">
								<td class="table-cell">{customer.firstName}</td>
								<td class="table-cell">{customer.lastName}</td>
								<td class="table-cell">{customer.primaryEmailAddress}</td>
							</tr>
							{/each}
						</tbody>
					</table>
				{/if}
			</div>
		{/await}
		{/snippet}
	</Panel>
</div>

<QuickAddCustomerModal
	open={showQuickAddModal}
	onClose={handleCloseModal}
	onSave={handleSaveCustomer}
/> 