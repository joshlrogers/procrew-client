<script lang="ts">
	import { Tabs, ProgressRing } from '@skeletonlabs/skeleton-svelte';
	import { invalidateAll } from '$app/navigation';

	import { TabOptions } from './index';
	import DepartmentPanel from './departmentPanel/departmentPanel.svelte';
	import GeneralPanel from './generalPanel/generalPanel.svelte';
	import HolidayPanel from './holidayPanel/holidayPanel.svelte';
	import OperationsPanel from './operationsPanel/operationsPanel.svelte';

	import avatar from '$lib/assets/avatar.svg';
	import { Icon, MaterialIcon } from '$lib/components/icon';
	import { CompanyTypeSelectList } from '$lib/components/selectList';
	import { ActiveCompany } from '$lib/shared/stores';
	import { Panel } from '$lib/components/panel';

	import type { Company } from '$lib/shared/models/company';

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

	let isLoading = $state(false);
	let pageState = $state(new CompanyPageState(data.company));

	$effect(() => {
		if (pageState.company && pageState.company.id !== $ActiveCompany) {
			isLoading = true;
			pageState.activeTab = TabOptions.General.toString();
			invalidateAll().then(() => {
				pageState = new CompanyPageState(data.company);
				isLoading = false;
			});
		}
	});
</script>

<div class="flex flex-col gap-4 items-center">

	<Panel class="w-[75%]">

		{#snippet header()}
			<div class="flex flex-row items-center">
				<Icon icon={MaterialIcon.BUSINESS} class="mr-2" />
				Company
			</div>
		{/snippet}

		{#snippet content()}
			{#if isLoading}
				<div class="flex flex-row justify-center items-center gap-2">
					<ProgressRing value={null} size="size-14" meterStroke="stroke-tertiary-600-400"
												trackStroke="stroke-tertiary-50-950" />
				</div>
			{:else}
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
				<Tabs value={pageState.activeTab} onValueChange={(e) => pageState.activeTab = e.value}>

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
							<DepartmentPanel />
						</Tabs.Panel>
						<Tabs.Panel value={TabOptions.Operations.toString()}>
							<OperationsPanel bind:company={pageState.company} />
						</Tabs.Panel>
						<Tabs.Panel value={TabOptions.Holidays.toString()}>
							<HolidayPanel />
						</Tabs.Panel>
					{/snippet}
				</Tabs>
			{/if}

		{/snippet}

	</Panel>

</div>