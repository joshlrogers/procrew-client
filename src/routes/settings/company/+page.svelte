<script lang="ts">
	import { invalidate, invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import avatar from '$lib/assets/avatar.svg';

	import { Icon, MaterialIcon } from '$lib/components/icon';
	import { Panel } from '$lib/components/panel';
	import { CompanyTypeSelectList } from '$lib/components/selectList';

	import { ActiveCompany } from '$lib/shared/stores';
	import { TabOptions } from '.';
	import type { PageProps } from './$types';
	import { ProgressRing, Tabs } from '@skeletonlabs/skeleton-svelte';
	import { GeneralPanel, DepartmentPanel, OperationsPanel, HolidayPanel } from './panels';

	let { data }: PageProps = $props();

	let activeTab = $state(TabOptions.General.toString());
	let currentCompany = $state($ActiveCompany);

	$effect(() => {
		if (currentCompany && $ActiveCompany) {
			if (currentCompany !== $ActiveCompany) {
				invalidate('app:company');
			}
		}
	});
</script>

<div class="flex flex-col items-center gap-4">
	<Panel class="w-[75%]">
		{#snippet header()}
			<div class="flex flex-row items-center">
				<Icon icon={MaterialIcon.BUSINESS} class="mr-2" />
				Company
			</div>
		{/snippet}

		{#snippet content()}
			{#await data.company}
				<div class="flex flex-row items-center justify-center gap-2">
					<ProgressRing
						value={null}
						size="size-14"
						meterStroke="stroke-tertiary-600-400"
						trackStroke="stroke-tertiary-50-950"
					/>
				</div>
			{:then company}
				<div class="mb-2 flex flex-row items-end gap-1">
					<div class="h-16 w-16">
						<img alt="Logo" src={avatar} class="h-full w-full" />
					</div>

					<div class="flex flex-col gap-2">
						<div class="flex min-w-64 flex-row items-center gap-0">
							<h1 class="w-full">{company?.name}</h1>
						</div>
						{#await data.companyTypes}
							Loading...
						{:then companyTypes}
							<CompanyTypeSelectList
								disabled={true}
								label={null}
								value={company?.companyTypeId}
								{companyTypes}
							/>
						{/await}
					</div>
				</div>
				<Tabs value={activeTab} onValueChange={(e) => (activeTab = e.value)}>
					{#snippet list()}
						<Tabs.Control value={TabOptions.General.toString()}>General</Tabs.Control>
						<Tabs.Control value={TabOptions.Departments.toString()}>Departments</Tabs.Control>
						<Tabs.Control value={TabOptions.Operations.toString()}>Operations</Tabs.Control>
						<Tabs.Control value={TabOptions.Holidays.toString()}>Holidays</Tabs.Control>
					{/snippet}

					{#snippet content()}
						<Tabs.Panel value={TabOptions.General.toString()}>
							<GeneralPanel {company} />
						</Tabs.Panel>
						<Tabs.Panel value={TabOptions.Departments.toString()}>
							{#await page.data.departments then departments}
								<DepartmentPanel {departments} />
							{/await}
						</Tabs.Panel>
						<Tabs.Panel value={TabOptions.Operations.toString()}>
							<OperationsPanel {company} />
						</Tabs.Panel>
						<Tabs.Panel value={TabOptions.Holidays.toString()}>
							<HolidayPanel />
						</Tabs.Panel>
					{/snippet}
				</Tabs>
			{/await}
		{/snippet}
	</Panel>
</div>
