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
			initialSearchTerm={data.searchTerm}
		/>
	</div>
</div>
