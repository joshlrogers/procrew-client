<script lang="ts">
	import { createSelect, melt } from '@melt-ui/svelte';
	import { fade } from 'svelte/transition';
	import { Icon } from '$lib/components/icon/index.js';
	import { MaterialIcon } from '$lib/components/icon';
	import { cn } from '$lib/utils';
	import { LeadStatus, type LeadStatusType, type Lead } from '$lib/shared/models/lead';
	import ClosedReasonDialog from '$lib/components/dialog/ClosedReasonDialog.svelte';
	import type { HTMLFormAttributes } from 'svelte/elements';

	interface LeadStatusDropdownProps {
		lead: Lead;
		enhance: HTMLFormAttributes['use:enhance'];
		disabled?: boolean;
		wrapperClass?: string;
		onStatusChanged?: (status: LeadStatusType) => void;
	}

	let {
		lead,
		enhance,
		disabled = false,
		wrapperClass = '',
		onStatusChanged = undefined,
	}: LeadStatusDropdownProps = $props();

	// Define status options with validation
	interface StatusOption {
		value: LeadStatusType;
		label: string;
		disabled: boolean;
		color: string;
	}

	// Get valid transitions based on current status
	const getValidTransitions = (currentStatus: LeadStatusType): LeadStatusType[] => {
		switch (currentStatus) {
			case LeadStatus.New:
				return [LeadStatus.New, LeadStatus.Contacted, LeadStatus.Qualified];
			case LeadStatus.Contacted:
				return [LeadStatus.Contacted, LeadStatus.Qualified, LeadStatus.Closed];
			case LeadStatus.Qualified:
				return [LeadStatus.Qualified, LeadStatus.Closed];
			case LeadStatus.Closed:
				return [LeadStatus.Closed]; // No transitions from closed
			default:
				return [currentStatus];
		}
	};

	const getStatusOptions = (): StatusOption[] => {
		const validTransitions = getValidTransitions(lead.status);
		
		return [
			{
				value: LeadStatus.New,
				label: 'New',
				disabled: !validTransitions.includes(LeadStatus.New),
				color: 'text-white'
			},
			{
				value: LeadStatus.Contacted,
				label: 'Contacted',
				disabled: !validTransitions.includes(LeadStatus.Contacted),
				color: 'text-warning-600-400'
			},
			{
				value: LeadStatus.Qualified,
				label: 'Qualified',
				disabled: !validTransitions.includes(LeadStatus.Qualified),
				color: 'text-success-600-400'
			},
			{
				value: LeadStatus.Closed,
				label: 'Closed',
				disabled: !validTransitions.includes(LeadStatus.Closed),
				color: 'text-tertiary-600-400'
			}
		];
	};

	const getStatusLabel = (status: LeadStatusType): string => {
		switch (status) {
			case LeadStatus.New: return 'New';
			case LeadStatus.Contacted: return 'Contacted';
			case LeadStatus.Qualified: return 'Qualified';
			case LeadStatus.Closed: return 'Closed';
			default: return 'Unknown';
		}
	};

	const getStatusColor = (status: LeadStatusType): string => {
		switch (status) {
			case LeadStatus.New: return 'text-surface-white bg-surface';
			case LeadStatus.Contacted: return 'text-warning-600-400 bg-primary';
			case LeadStatus.Qualified: return 'text-success-600-400 bg-success';
			case LeadStatus.Closed: return 'text-tertiary-600-400 bg-tertiary';
			default: return 'text-surface-600-400 bg-surface';
		}
	};

	const getStatusDotColor = (status: LeadStatusType): string => {
		switch (status) {
			case LeadStatus.New: return 'bg-warning-500';
			case LeadStatus.Contacted: return 'bg-warning-500';
			case LeadStatus.Qualified: return 'bg-success-500';
			case LeadStatus.Closed: return 'bg-tertiary-500';
			default: return 'bg-surface-500';
		}
	};

	let statusOptions = $derived(getStatusOptions());
	let showClosedReasonDialog = $state(false);
	let pendingStatus = $state<LeadStatusType | null>(null);
	let statusFormElement = $state<HTMLFormElement | null>(null);

	const {
		elements: { trigger, menu, option },
		states: { open, selectedLabel }
	} = createSelect<LeadStatusType>({
		defaultSelected: { value: lead.status, label: getStatusLabel(lead.status) },
		forceVisible: true,
		onSelectedChange: ({ next }) => {
			if (next && next.value !== lead.status) {
				if (next.value === LeadStatus.Closed) {
					pendingStatus = next.value;
					showClosedReasonDialog = true;
				} else {
					onStatusChanged?.(next.value);
					submitStatusUpdate(next.value);
				}
			}
			return next;
		},
		positioning: {
			placement: 'bottom',
			fitViewport: false,
			sameWidth: true
		}
	});

	const submitStatusUpdate = (newStatus: LeadStatusType, closedReason?: string, notes?: string) => {
		if (statusFormElement) {
			// Update form fields
			const statusInput = statusFormElement.querySelector('input[name="status"]') as HTMLInputElement;
			const closedReasonInput = statusFormElement.querySelector('input[name="closedReason"]') as HTMLInputElement;
			const notesInput = statusFormElement.querySelector('input[name="notes"]') as HTMLInputElement;
			
			if (statusInput) statusInput.value = newStatus.toString();
			if (closedReasonInput) closedReasonInput.value = closedReason || '';
			if (notesInput) notesInput.value = notes || '';
			
			// Submit the form
			console.log(statusFormElement)
			statusFormElement.requestSubmit();
		}
	};

	const handleClosedReasonSubmit = (closedReason: string, notes?: string) => {
		if (pendingStatus) {
			submitStatusUpdate(pendingStatus, closedReason, notes);
		}
		showClosedReasonDialog = false;
		pendingStatus = null;
	};

	const handleClosedReasonCancel = () => {
		showClosedReasonDialog = false;
		pendingStatus = null;
	};

	let buttonClass = cn(
		'input flex items-center justify-between rounded-lg px-3 py-2',
		'h-10 text-sm font-medium min-w-32',
		getStatusColor(lead.status),
		disabled ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110 cursor-pointer'
	);

	let listClass = cn(
		'z-50 flex flex-col overflow-y-auto rounded-lg p-1 max-h-48',
		'bg-surface-100-900 shadow-xl border border-surface-300-700'
	);

	let listItemClass = cn(
		'relative cursor-pointer rounded-md py-2 px-3 transition-colors',
		'data-[highlighted]:bg-primary-500 data-[highlighted]:text-primary-50',
		'data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed',
		'flex items-center gap-2',
	);
</script>

<div class={cn('relative', wrapperClass)}>
	<!-- Hidden form for status updates -->
	<form 
		bind:this={statusFormElement}
		method="POST" 
		action="?/updateLeadStatus" 
		use:enhance
		class="hidden">
		<input type="hidden" name="leadId" value={lead.id} />
		<input type="hidden" name="status" value={lead.status} />
		<input type="hidden" name="closedReason" value="" />
		<input type="hidden" name="notes" value="" />
	</form>

	<button class={buttonClass} use:melt={$trigger} {disabled}>
		<div class="flex items-center gap-2">
			<div class="w-2 h-2 rounded-full {getStatusDotColor(lead.status)}"></div>
			{$selectedLabel}
		</div>
		<Icon icon={MaterialIcon.ARROW_DROP_DOWN} class="ml-auto text-white" />
	</button>

	{#if $open}
		<div class={listClass} use:melt={$menu} transition:fade={{ duration: 150 }}>
			{#each statusOptions as statusOption}
				<div 
					class={cn(listItemClass, statusOption.color)}
					use:melt={$option({ value: statusOption.value, label: statusOption.label, disabled: statusOption.disabled })}>
					<div class="w-2 h-2 rounded-full {getStatusDotColor(statusOption.value)}"></div>
					<span class={statusOption.color}>{statusOption.label}</span>
					{#if statusOption.disabled}
						<Icon icon={MaterialIcon.LOCK} class="ml-auto text-surface-400-600 opacity-75" />
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Closed Reason Dialog -->
<ClosedReasonDialog 
	open={showClosedReasonDialog}
	onConfirm={handleClosedReasonSubmit}
	onCancel={handleClosedReasonCancel}
/>