<script lang="ts">
	import { invalidateAll } from '$app/navigation';

	import { ActiveCompany } from '$lib/shared/stores';
	import type { PageProps } from './$types';
	import Dashboard from './dashboard/dashboard.svelte';
	import { ProgressRing } from '@skeletonlabs/skeleton-svelte';

	let {
		data
	}: PageProps = $props();

	let isLoading = $state(false);

	$effect(() => {
		if (data.company && data.company.id !== $ActiveCompany) {
			isLoading = true;
			invalidateAll().then(() => {
				isLoading = false;
			});
		}
	});
</script>

<div class="flex flex-col gap-4 items-center">

	{#if isLoading}
		<div class="flex flex-row justify-center items-center gap-2">
			<ProgressRing value={null} size="size-14" meterStroke="stroke-tertiary-600-400"
										trackStroke="stroke-tertiary-50-950" />
		</div>
	{:else}
		<Dashboard company={data.company} />
	{/if}
</div>