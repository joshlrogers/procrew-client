<script lang="ts">
	import { Panel } from '$lib/components/panel';
	import { IconButton } from '$lib/components/buttons/iconButton';
	import { MaterialIcon } from '$lib/components/icon';
	import { CreateEmployeeModal } from './modals/index.js';

	let {
		data
	}: PageProps = $props();
</script>

<div class="flex flex-col gap-4 items-center">
	<Panel class="w-[75%]">
		{#snippet content()}
			{#await data.employees}
			{:then employees}
				<div class="w-full px-4 py-2 shadow-md bg-surface-300-700 rounded-t-lg">
					<CreateEmployeeModal>
						{#snippet trigger()}
							<IconButton
								icon={MaterialIcon.ADD}
								flat={true}
								tooltip="Add a new department" />
						{/snippet}
					</CreateEmployeeModal>
				</div>
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
								<td>{employee.phoneNumber}</td>
								<td>
									<IconButton icon={MaterialIcon.EDIT} />
									<IconButton icon={MaterialIcon.DELETE} />
								</td>
							</tr>
						{/each}
					{/if}
					</tbody>
				</table>
			{/await}

		{/snippet}
	</Panel>
</div>