<script lang="ts">
	import { page } from '$app/state';
	import { IconButton } from '$lib/components/buttons/iconButton';
	import { MaterialIcon } from '$lib/components/icon';
	import { type Department, DepartmentSchema } from '$lib/shared/models/department';
	import { Button, ButtonStyle } from '$lib/components/buttons/button';
	import { superForm } from 'sveltekit-superforms';
	import { defaults } from 'sveltekit-superforms/client';
	import { zod } from 'sveltekit-superforms/adapters';
	import { ProgressRing, type ToastContext } from '@skeletonlabs/skeleton-svelte';
	import { getContext, onMount } from 'svelte';
	import { TextInput } from '$lib/components/inputs';

	const toast: ToastContext = getContext('toast');
	let newDeptInput: TextInput;
	let updateDeptInput: TextInput;

	let {
		constraints,
		enhance,
		form,
		reset,
		isTainted,
		tainted,
		submitting,
		delayed
	} = superForm<Department>(defaults({}, zod(DepartmentSchema)), {
		dataType: 'json',
		clearOnSubmit: 'errors-and-message',
		multipleSubmits: 'prevent',
		resetForm: false,
		validators: zod(DepartmentSchema),
		invalidateAll: false,
		onUpdated: async (event) => {
			if (event.form.valid) {
				hasFocused = false;
				let department = event.form.data;

				let updated = departments
					.some((dept: Department) => dept.id === department.id);

				if (updated) {
					activeDepartmentId = undefined;
					departments[departments.findIndex(d => d.id === department.id)] = department;
				} else {
					activeDepartmentId = undefined;
					showAddNewDepartment = false;
					departments.push(department);
					reset({ date: { name: '', shortCode: '' }, newState: { name: '', shortCode: '' } });
				}

				toast.create({
					type: 'success',
					title: 'Success!',
					description: `${updated ? 'Updated' : 'Created'} ${department.name} department.`,
					duration: 10000
				});
			}
		}
	});

	let activeDepartmentId: string | null | undefined = $state();
	let departments = $state([]);
	let showAddNewDepartment: boolean = $state(false);
	let hasFocused = $state(false);

	let deleteDepartment = async (department: Department) => {
		let result = await fetch(`/api/departments/${department.id}`, {
			method: 'DELETE'
		});

		if (result.ok) {
			departments = departments.filter(d => d.id !== department.id);

			toast.create({
				type: 'success',
				title: 'Success!',
				description: `Deleted the ${department.name} department.`,
				duration: 10000
			});
		}
	};

	let editDepartment = (department: Department) => {
		hasFocused = false;
		showAddNewDepartment = false;
		reset({ data: department, newState: department });
		if (activeDepartmentId && activeDepartmentId === department.id) {
			activeDepartmentId = undefined;
		} else {
			activeDepartmentId = department.id;
		}
	};

	let onAddDepartmentClicked = () => {
		hasFocused = false;
		reset({ data: { name: '', shortCode: '' }, newState: { name: '', shortCode: '' } });
		activeDepartmentId = undefined;
		showAddNewDepartment = !showAddNewDepartment;
	};

	$effect(() => {
		if (activeDepartmentId && !hasFocused) {
			updateDeptInput?.setFocus();
			updateDeptInput?.setSelectionRange(0, $form.name.length);
		}

		if (showAddNewDepartment && !hasFocused) {
			newDeptInput?.setFocus();
		}

		hasFocused = true;
	});

	onMount(async () => {
		departments = await page.data.departments;
	});
</script>
<div class="flex flex-col items-center px-4">

	<form class="w-full" method="POST" action="?/updateDepartment" use:enhance>
		<div class="w-full px-4 py-2 shadow-md bg-surface-300-700 rounded-t-lg">
			<IconButton onclick={onAddDepartmentClicked}
									icon={MaterialIcon.ADD}
									isRounded={true}
									tooltip="Add a new department" />
		</div>
		{#if showAddNewDepartment}
			<div class="flex flex-row gap-4 items-end my-2 ml-2">
				<div class="w-5/12">
					<TextInput id="newDeptName"
										 label="Name"
										 constraints={$constraints.name}
										 bind:value={$form.name}
										 bind:this={newDeptInput} />
				</div>
				<div class="w-5/12">
					<TextInput id="newDeptShortcode"
										 label="Short code"
										 casing="Upper"
										 constraints={$constraints.shortCode}
										 bind:value={$form.shortCode} />
				</div>
				<div class="w-1/6 flex gap-2">
					<Button text="Cancel"
									class="mr-2"
									buttonStyle={ButtonStyle.SECONDARY} onclick={() => showAddNewDepartment = false} />
					{#if !$delayed}
						<Button disabled={!isTainted($tainted) || $submitting}
										type="submit"
										text="Save"
										buttonStyle={ButtonStyle.PRIMARY} />
					{:else}
						<div class="w-[5rem] h-[2.75rem] flex items-center justify-center">
						<ProgressRing value={null}
													size="size-5"
													meterStroke="stroke-tertiary-600-400"
													trackStroke="stroke-tertiary-50-950" />
						</div>
					{/if}
				</div>
			</div>
		{/if}
		<table class="table">
			<thead>
			<tr class="table-row">
				<th>Name</th>
				<th>Short code</th>
				<th></th>
			</tr>
			</thead>
			<tbody>
			{#if departments.length > 0}
				{#each departments as department}
					<tr>
						<td class="w-5/12">{department.name}</td>
						<td class="w-5/12">{department.shortCode}</td>
						<td class="w-1/6 flex flex-row items-center gap-1">
							<IconButton icon={MaterialIcon.EDIT}
													class="m-2"
													onclick={() => editDepartment(department)}
													tooltip={`Edit the ${department.name} department`} />
							<IconButton icon={MaterialIcon.DELETE}
													onclick={() => deleteDepartment(department)}
													tooltip={`Delete the ${department.name} department`} />
						</td>
					</tr>
					{#if activeDepartmentId && activeDepartmentId === department.id}
						<tr class="bg-surface-100-900">
							<td class="w-5/12 pr-4 py-1 ml-0">
								<TextInput name="name"
													 constraints={$constraints.name}
													 bind:value={$form.name}
													 bind:this={updateDeptInput} />
							</td>
							<td class=" w-5/12 pr-4 py-1 ml-0">
								<TextInput name="shortCode"
													 constraints={$constraints.shortCode}
													 casing="Upper"
													 bind:value={$form.shortCode} />
							</td>
							<td class="w-1/6 flex gap-1 items-center">
								<Button text="Cancel"
												class="mr-2"
												buttonStyle={ButtonStyle.SECONDARY} onclick={() => activeDepartmentId = null} />
								<Button disabled={!isTainted($tainted) || $submitting}
												type="submit"
												text="Save"
												buttonStyle={ButtonStyle.PRIMARY} />
							</td>
						</tr>
					{/if}
				{/each}
			{/if}
			</tbody>
		</table>
	</form>

</div>