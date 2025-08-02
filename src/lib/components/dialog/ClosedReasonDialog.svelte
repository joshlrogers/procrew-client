<script lang="ts">
	import { createDialog, melt } from '@melt-ui/svelte';
	import { fade } from 'svelte/transition';
	import { Icon } from '$lib/components/icon/index.js';
	import { MaterialIcon } from '$lib/components/icon';
	import { cn } from '$lib/utils';

	interface ClosedReasonDialogProps {
		open: boolean;
		onConfirm: (reason: string, notes?: string) => void;
		onCancel: () => void;
	}

	let {
		open = false,
		onConfirm,
		onCancel
	}: ClosedReasonDialogProps = $props();

	let selectedReason = $state<string>('');
	let notes = $state<string>('');

	const winReasons = [
		'Purchase made',
		'Contract signed',
		'Service started'
	];

	const lostReasons = [
		'No budget',
		'Competitor chosen',
		'No longer interested',
		'Unresponsive'
	];

	const {
		elements: { content, overlay, portalled, close, title },
		states: { open: dialogOpen }
	} = createDialog({
		forceVisible: true,
		closeOnOutsideClick: false,
		onOpenChange: ({ next }) => {
			if (next === false) {
				handleCancel();
			}
			return next;
		}
	});

	const handleConfirm = () => {
		if (selectedReason) {
			onConfirm(selectedReason, notes.trim() || undefined);
			resetForm();
		}
	};

	const handleCancel = () => {
		onCancel();
		resetForm();
	};

	const resetForm = () => {
		selectedReason = '';
		notes = '';
	};

	const selectReason = (reason: string) => {
		selectedReason = reason;
	};

	// Update dialog state when prop changes
	$effect(() => {
		$dialogOpen = open;
	});

	let reasonButtonClass = (reason: string) => cn(
		'w-full text-left px-3 py-2 rounded border transition-colors',
		selectedReason === reason
			? 'bg-primary-100 border-primary-500 text-primary-700'
			: 'hover:bg-gray-50 border-gray-200'
	);
</script>

{#if $dialogOpen}
	<div use:melt={$portalled}>
		<div
			use:melt={$overlay}
			class="fixed inset-0 z-50 bg-black/50"
			transition:fade={{ duration: 150 }}></div>
		<div
			class="fixed top-1/2 left-1/2 z-50 max-w-md w-full mx-4
						-translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl 
						bg-surface-50-950 shadow-xl border border-surface-300-700"
			use:melt={$content}
		>
			<!-- Header -->
			<div class="flex items-center justify-between p-4 border-b">
				<h2 use:melt={$title} class="text-lg font-semibold text-gray-900">
					Close Lead
				</h2>
				<button
					use:melt={$close}
					class="text-gray-400 hover:text-gray-600 transition-colors"
				>
					<Icon icon={MaterialIcon.CLOSE} />
				</button>
			</div>

			<!-- Content -->
			<div class="p-4 space-y-4">
				<p class="text-gray-600 text-sm">
					Please provide a reason for closing this lead:
				</p>

				<!-- Won Reasons -->
				<div class="space-y-2">
					<h4 class="text-sm font-medium text-green-700 flex items-center gap-2">
						<Icon icon={MaterialIcon.CHECK_CIRCLE} class="text-green-600" />
						Won
					</h4>
					<div class="space-y-1 pl-6">
						{#each winReasons as reason}
							<button
								class={reasonButtonClass(reason)}
								onclick={() => selectReason(reason)}>
								{reason}
							</button>
						{/each}
					</div>
				</div>

				<!-- Lost Reasons -->
				<div class="space-y-2">
					<h4 class="text-sm font-medium text-red-700 flex items-center gap-2">
						<Icon icon={MaterialIcon.CANCEL} class="text-red-600" />
						Lost
					</h4>
					<div class="space-y-1 pl-6">
						{#each lostReasons as reason}
							<button
								class={reasonButtonClass(reason)}
								onclick={() => selectReason(reason)}>
								{reason}
							</button>
						{/each}
					</div>
				</div>

				<!-- Optional Notes -->
				<div class="space-y-2">
					<label for="notes" class="text-sm font-medium text-gray-700">
						Additional Notes (Optional)
					</label>
					<textarea
						id="notes"
						bind:value={notes}
						class="w-full px-3 py-2 border rounded-md text-sm resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
						rows="3"
						placeholder="Any additional details about closing this lead..."></textarea>
				</div>
			</div>

			<!-- Footer -->
			<div class="flex gap-2 justify-end p-4 border-t bg-gray-50 rounded-b-xl">
				<button
					class="px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors text-sm"
					onclick={handleCancel}>
					Cancel
				</button>
				<button
					class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
					disabled={!selectedReason}
					onclick={handleConfirm}>
					Close Lead
				</button>
			</div>
		</div>
	</div>
{/if}