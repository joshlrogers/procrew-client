<script lang="ts">
	import { Button } from '$lib/components/buttons/button';
	import { ButtonStyle } from '$lib/components/buttons/button';
	import { QuickAddCustomerModal } from '$lib/components/quickAddCustomerModal';
	import type { QuickAddCustomer } from '$lib/shared/models/customer';

	let showQuickAddModal = $state(false);

	const handleAddCustomer = () => {
		showQuickAddModal = true;
	};

	const handleCloseModal = () => {
		showQuickAddModal = false;
	};

	const handleSaveCustomer = async (customer: QuickAddCustomer): Promise<string | null> => {
		return null;
	};
</script>

<svelte:head>
	<title>Customer Dashboard</title>
</svelte:head>

<div class="container mx-auto p-6">
	<div class="flex justify-between items-center mb-8">
		<h1 class="text-3xl font-bold text-gray-900">Customer Dashboard</h1>
		<Button
			text="Add New Customer"
			buttonStyle={ButtonStyle.PRIMARY}
			onclick={handleAddCustomer}
			width="w-auto"
			class="px-6"
		/>
	</div>

	<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
		<div class="text-center">
			<div class="mb-4">
				<svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
				</svg>
			</div>
			<h3 class="text-lg font-medium text-gray-900 mb-2">No customers yet</h3>
			<p class="text-gray-500 mb-6">Get started by adding your first customer.</p>
			<Button
				text="Add Your First Customer"
				buttonStyle={ButtonStyle.PRIMARY}
				onclick={handleAddCustomer}
				width="w-auto"
				class="px-6"
			/>
		</div>
	</div>
</div>

<QuickAddCustomerModal
	open={showQuickAddModal}
	onClose={handleCloseModal}
	onSave={handleSaveCustomer}
/> 