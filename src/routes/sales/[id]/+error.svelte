<script lang="ts">
	import { page } from '$app/stores';
	import { Panel } from '$lib/components/panel';
	import { Breadcrumb } from '$lib/components/breadcrumb';
	import { Button } from '$lib/components/buttons/button';
	import { ButtonStyle } from '$lib/components/buttons/button';
	import { goto } from '$app/navigation';

	// Get the error from the page store
	$: error = $page.error;
	$: status = $page.status;
</script>

<svelte:head>
	<title>Error - Lead Not Found</title>
</svelte:head>

<div class="flex flex-col items-center gap-4">
	<div class="mb-[-1rem] flex w-[75%] content-start pl-4">
		<Breadcrumb
			items={[
				{ label: 'Home', url: '/' },
				{ label: 'Sales', url: '/sales' },
				{ label: 'Error', url: '' }
			]}
		/>
	</div>
	<Panel class="w-[75%]">
		{#snippet header()}
			{status === 404 ? 'Lead Not Found' : 'Error Loading Lead'}
		{/snippet}
		{#snippet content()}
			<div class="text-center py-8">
				{#if status === 404}
					<div class="mb-6">
						<div class="text-6xl text-gray-400 mb-4">404</div>
						<h2 class="text-xl font-semibold text-gray-900 mb-2">Lead Not Found</h2>
						<p class="text-gray-600">
							The lead you're looking for doesn't exist or you don't have permission to view it.
						</p>
					</div>
				{:else}
					<div class="mb-6">
						<div class="text-6xl text-red-400 mb-4">⚠️</div>
						<h2 class="text-xl font-semibold text-gray-900 mb-2">Something Went Wrong</h2>
						<p class="text-gray-600">
							{error?.message || 'An unexpected error occurred while loading the lead.'}
						</p>
					</div>
				{/if}

				<div class="flex justify-center gap-4">
					<Button
						text="Back to Sales"
						buttonStyle={ButtonStyle.PRIMARY}
						onclick={() => goto('/sales')}
						width="w-auto"
						class="px-6"
					/>
					<Button
						text="Go Home"
						buttonStyle={ButtonStyle.SECONDARY}
						onclick={() => goto('/')}
						width="w-auto"
						class="px-6"
					/>
				</div>
			</div>
		{/snippet}
	</Panel>
</div>