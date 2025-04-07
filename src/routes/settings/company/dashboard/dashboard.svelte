<script lang="ts">
	import type { Company } from '$lib/shared/models/company';
	import { Icon, MaterialIcon } from '$lib/components/icon';
	import avatar from '$lib/assets/avatar.svg';
	import { TabOptions } from '../index';
	import { Tabs } from '@skeletonlabs/skeleton-svelte';
	import { DepartmentPanel, GeneralPanel, HolidayPanel, OperationsPanel } from '../panels';
	import { CompanyTypeSelectList } from '$lib/components/selectList';
	import { Panel } from '$lib/components/panel';
	import { page } from '$app/state';

	interface DashboardProps {
		company?: Company;
	}

	let {
		company
	}: DashboardProps = $props();

	let activeTab = $state(TabOptions.General.toString());

</script>

<Panel class="w-[75%]">

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
					<h1 class="w-full">{company?.name}</h1>
				</div>
				{#await page.data.companyTypes}
					Loading...
				{:then companyTypes}
					<CompanyTypeSelectList disabled={true}
																 label={null}
																 value={company?.companyTypeId}
																 {companyTypes} />
				{/await}
			</div>
		</div>
		<Tabs value={activeTab} onValueChange={(e) => activeTab = e.value}>

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
					<GeneralPanel company={company} />
				</Tabs.Panel>
				<Tabs.Panel value={TabOptions.Departments.toString()}>
					{#await page.data.departments then departments}
						<DepartmentPanel departments={departments} />
					{/await}
				</Tabs.Panel>
				<Tabs.Panel value={TabOptions.Operations.toString()}>
					<OperationsPanel company={company} />
				</Tabs.Panel>
				<Tabs.Panel value={TabOptions.Holidays.toString()}>
					<HolidayPanel />
				</Tabs.Panel>
			{/snippet}

		</Tabs>

	{/snippet}

</Panel>