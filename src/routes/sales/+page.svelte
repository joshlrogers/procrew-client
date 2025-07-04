<script lang="ts">
	import { LeadsPanel } from './panels/leadsPanel';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Sales - Leads</title>
</svelte:head>

<div class="flex flex-col items-center gap-4">
	<div class="w-[90%]">
		<LeadsPanel
			leadsData={data.leads}
			countries={data.countries}
			states={data.states}
			salesRepresentatives={data.salesRepresentatives}
			initialSearchTerm={data.searchTerm}
			initialStatus={data.status}
			initialAssignedToId={data.assignedToId}
			initialCreatedDateFilter={data.createdDateFilter}
		/>
	</div>
</div>
