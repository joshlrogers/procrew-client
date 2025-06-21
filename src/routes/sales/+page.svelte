<script lang="ts">
    import { LeadsPanel } from './panels/leadsPanel';
    import type { PageProps } from './$types';

    let { data }: PageProps = $props();
</script>

<svelte:head>
    <title>Sales - Leads</title>
</svelte:head>

<div class="flex flex-col gap-4 items-center">
    <div class="w-[90%]">
        <LeadsPanel leadsData={data.leads} />
    </div>
</div>