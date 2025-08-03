<script lang="ts">
	import { superForm } from 'sveltekit-superforms/client';
	import { zod } from 'sveltekit-superforms/adapters';
	import { z } from 'zod';
	import { SelectList } from '$lib/components/selectList';
	import { Button, ButtonStyle } from '$lib/components/buttons/button';
	import { Icon, MaterialIcon } from '$lib/components/icon';
	import toast from 'svelte-french-toast';
	import type { SelectListOption } from '$lib/shared/models/options';
	
	// Schema for assignment request
	const assignLeadSchema = z.object({
		assignedToId: z.string().uuid().optional().nullable(),
		notes: z.string().max(500, 'Notes cannot exceed 500 characters.').optional().nullable()
	});
	
	type AssignLeadForm = z.infer<typeof assignLeadSchema>;
	
	interface Props {
		leadId: string;
		currentAssigneeId?: string | null;
		assignableUsers: Array<{
			id: string;
			name: string;
			email: string;
			avatar?: string | null;
			role: string;
			isActive: boolean;
		}>;
		onAssignmentChanged?: (assigneeId: string | null) => void;
		wrapperClass?: string;
	}
	
	let { leadId, currentAssigneeId = null, assignableUsers, onAssignmentChanged, wrapperClass = '' }: Props = $props();
	
	// Convert assignable users to select options
	let assignmentOptions: SelectListOption[] = $derived([
		{ label: 'Unassigned', value: null },
		...assignableUsers
			.filter(user => user.isActive)
			.map(user => ({
				label: `${user.name} (${user.role})`,
				value: user.id
			}))
	]);
	
	// Get current assignee display name
	let currentAssigneeName = $derived.by(() => {
		if (!currentAssigneeId) return 'Unassigned';
		const assignee = assignableUsers.find(user => user.id === currentAssigneeId);
		return assignee ? assignee.name : 'Unknown User';
	});
	
	let isEditing = $state(false);
	let showConfirmation = $state(false);
	let pendingAssigneeId = $state<string | null>(null);
	
	// Form for assignment
	const { form, errors, enhance, submitting } = superForm<AssignLeadForm>(
		{ assignedToId: currentAssigneeId ?? null, notes: null },
		{
			dataType: 'json',
			invalidateAll: false,
			multipleSubmits: 'prevent',
			resetForm: false,
			validators: zod(assignLeadSchema),
			validationMethod: 'onsubmit',
			clearOnSubmit: 'errors',
			onUpdated: (event) => {
				if (event.form.valid) {
					const newAssigneeId = event.form.data.assignedToId;
					const assigneeName = newAssigneeId 
						? assignableUsers.find(u => u.id === newAssigneeId)?.name || 'Unknown User'
						: 'Unassigned';
					
					toast.success(`Lead ${newAssigneeId ? 'assigned to' : 'unassigned from'} ${assigneeName}.`);
					
					// Update local state
					currentAssigneeId = newAssigneeId;
					isEditing = false;
					showConfirmation = false;
					
					// Notify parent component
					onAssignmentChanged?.(newAssigneeId);
				} else {
					toast.error('Failed to update lead assignment.');
				}
			}
		}
	);
	
	function startEdit() {
		isEditing = true;
		$form.assignedToId = currentAssigneeId;
		$form.notes = null;
	}
	
	function cancelEdit() {
		isEditing = false;
		showConfirmation = false;
		$form.assignedToId = currentAssigneeId;
		$form.notes = null;
	}
	
	function handleAssignmentChange(newAssigneeId: string | null) {
		if (newAssigneeId !== currentAssigneeId) {
			pendingAssigneeId = newAssigneeId;
			showConfirmation = true;
		} else {
			showConfirmation = false;
		}
		$form.assignedToId = newAssigneeId;
	}
	
	function confirmAssignment() {
		// The form submission will be handled by superform
		showConfirmation = false;
	}
</script>

<div class={`lead-assignment-picker ${wrapperClass}`}>
	{#if !isEditing}
		<!-- Display current assignment -->
		<div class="flex items-center justify-between p-3 border rounded-lg bg-surface-50-900">
			<div class="flex items-center gap-3">
				<Icon icon={MaterialIcon.PERSON} />
				<div>
					<div class="font-medium">Assigned to</div>
					<div class="text-sm opacity-75">{currentAssigneeName}</div>
				</div>
			</div>
			<Button
				text={currentAssigneeId ? "Reassign" : "Assign"}
				buttonStyle={ButtonStyle.SECONDARY}
				onclick={startEdit}
			/>
		</div>
	{:else}
		<!-- Assignment form -->
		<form 
			use:enhance 
			method="POST" 
			action="?/assignLead"
			class="border rounded-lg p-4 bg-surface-50-900"
		>
			<div class="space-y-4">
				<div class="flex items-center gap-2 mb-3">
					<Icon icon={MaterialIcon.PERSON} />
					<h4 class="font-medium">Assign Lead</h4>
				</div>
				
				<SelectList
					label="Assign to"
					placeholder="Select user"
					required={false}
					value={$form.assignedToId}
					onchanged={handleAssignmentChange}
					items={assignmentOptions}
					wrapperClass="w-full"
				/>
				
				<div class="w-full">
					<label for="assignment-notes" class="label mb-2 block text-sm font-medium">
						<span class="label-text">Assignment Notes (Optional)</span>
					</label>
					<textarea
						id="assignment-notes"
						name="notes"
						bind:value={$form.notes}
						disabled={$submitting}
						class="textarea w-full"
						rows="3"
						placeholder="Add a note about this assignment..."
						{...$errors.notes ? { 'aria-invalid': 'true' } : {}}
					></textarea>
					{#if $errors.notes}
						<div class="text-error-500 mt-1 text-sm">
							{$errors.notes}
						</div>
					{/if}
				</div>
				
				{#if showConfirmation && pendingAssigneeId !== currentAssigneeId}
					<div class="p-3 bg-warning-100 border border-warning-300 rounded-lg">
						<div class="flex items-center gap-2 mb-2">
							<Icon icon={MaterialIcon.WARNING} />
							<span class="font-medium">Confirm Assignment</span>
						</div>
						<p class="text-sm mb-3">
							{#if pendingAssigneeId}
								Assign this lead to {assignableUsers.find(u => u.id === pendingAssigneeId)?.name || 'Unknown User'}?
							{:else}
								Remove the current assignment from this lead?
							{/if}
						</p>
					</div>
				{/if}
				
				<div class="flex gap-2 justify-end">
					<Button
						text="Cancel"
						buttonStyle={ButtonStyle.SECONDARY}
						disabled={$submitting}
						onclick={cancelEdit}
					/>
					<Button
						text={showConfirmation ? "Confirm" : "Save"}
						buttonStyle={ButtonStyle.PRIMARY}
						disabled={$submitting}
						type="submit"
					/>
				</div>
			</div>
		</form>
	{/if}
</div>

<style>
	.lead-assignment-picker {
		/* Component-specific styles can go here */
	}
</style>