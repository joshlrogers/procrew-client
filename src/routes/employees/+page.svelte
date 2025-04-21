<script lang="ts">
	import { Panel } from '$lib/components/panel';
	import { IconButton } from '$lib/components/buttons/iconButton';
	import { MaterialIcon } from '$lib/components/icon';
	import type { PageProps } from './$types';
	import { ProgressRing } from '@skeletonlabs/skeleton-svelte';

	let {
		data
	}: PageProps = $props();
</script>

<div class="flex flex-col gap-4 items-center">
	<Panel class="w-[75%]">
		{#snippet content()}
			{#await data.employees}
				<div class="flex flex-row justify-center items-center gap-2">
					<ProgressRing value={null} size="size-14" meterStroke="stroke-tertiary-600-400"
												trackStroke="stroke-tertiary-50-950" />
				</div>
			{:then employees}
				<div class="w-full pl-1 shadow-md bg-surface-300-700 rounded-t-lg">
					<a href="/employees/create" class="text-primary-500">
						<IconButton
							icon={MaterialIcon.ADD}
							flat={true}
							isRounded={true}
							tooltip="Add a new employee" />
					</a>
				</div>
				<div class="p-2">
					<table class="table">
						<thead>
						<tr>
							<th>Last name</th>
							<th>First name</th>
							<th>Phone number</th>
							<th></th>
						</tr>
						</thead>
						<tbody>
						{#if employees.length === 0}
							<tr>
								<td colspan="4">No employees found...</td>
							</tr>
						{:else}
							{#each employees as employee}
								<tr>
									<td>{employee.lastName}</td>
									<td>{employee.firstName}</td>
									<td>{employee.phoneNumber?.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')}</td>
									<td class="flex flex-row gap">
										<IconButton flat={true} icon={MaterialIcon.EDIT} />
										<IconButton flat={true} icon={MaterialIcon.DELETE} />
									</td>
								</tr>
							{/each}
						{/if}
						</tbody>
					</table>
				</div>
			{/await}

		{/snippet}
	</Panel>
</div>