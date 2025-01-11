<script lang="ts">
	import { Tabs } from '@skeletonlabs/skeleton-svelte';
	import { TabOptions } from './index';
	import GeneralPanel from "./generalPanel.svelte";
	import avatar from '$lib/assets/avatar.svg';
	import { Icon, MaterialIcon } from '$lib/components/icon';
	import { CompanyTypeSelectList } from '$lib/components/selectList';
	import type { Company } from '$lib/shared/models/company';
	import { ActiveCompany } from '$lib/shared/stores';
	import { invalidateAll } from '$app/navigation';
	import { Panel } from '$lib/components/panel';



	class CompanyPageState {
		activeTab = $state(TabOptions.General.toString());
		company = $state<Company>();

		constructor(company?: Company) {
			this.company = company;
		}
	}

	let {
		data
	} = $props();

	let pageState = $state(new CompanyPageState(data.company));

	$effect(() => {
		if (pageState.company && pageState.company.id !== $ActiveCompany) {
			invalidateAll().then(() => {
				pageState = new CompanyPageState(data.company);
			});
		}
	});
</script>

<div class="flex flex-col gap-4 items-center">

	<Panel class="w-[65%]">

		{#snippet header()}
			<div class="flex flex-row items-center">
				<Icon icon={MaterialIcon.BUSINESS} class="mr-2" />
				Company
			</div>
		{/snippet}

		{#snippet content()}
			<div class='flex flex-row gap-1 items-end mb-2'>

				<div class="w-16 h-16">
					<img alt="Logo" src={avatar} class="w-full h-full" />
				</div>

				<div class="flex flex-col gap-2">
					<div class='flex flex-row gap-0 items-center min-w-64'>
						<h1 class="w-full">{pageState.company?.name}</h1>
					</div>
					{#await data.companyTypes then companyTypes}
						<CompanyTypeSelectList disabled={true}
																	 label={null}
																	 value={pageState.company?.companyTypeId}
																	 {companyTypes} />
					{/await}
				</div>
			</div>
			<Tabs bind:value={pageState.activeTab}>

				{#snippet list()}
					<Tabs.Control value={TabOptions.General.toString()}>
						General
					</Tabs.Control>
					<Tabs.Control value={TabOptions.Departments.toString()}>
						Departments
					</Tabs.Control>
					<Tabs.Control value={TabOptions.Operations.toString()}>
						Operations
					</Tabs.Control>
					<Tabs.Control value={TabOptions.Holidays.toString()}>
						Holidays
					</Tabs.Control>
				{/snippet}

				{#snippet content()}
					<Tabs.Panel value={TabOptions.General.toString()}>
						<GeneralPanel bind:company={pageState.company} />
					</Tabs.Panel>
					<Tabs.Panel value={TabOptions.Departments.toString()}>
						Departments
					</Tabs.Panel>
					<Tabs.Panel value={TabOptions.Operations.toString()}>
						Operations
					</Tabs.Panel>
					<Tabs.Panel value={TabOptions.Holidays.toString()}>
						Holidays
					</Tabs.Panel>
				{/snippet}
			</Tabs>
		{/snippet}

	</Panel>

</div>