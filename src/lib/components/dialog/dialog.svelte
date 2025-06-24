<script lang="ts">
	import { createDialog, melt } from '@melt-ui/svelte';
	import { fade } from 'svelte/transition';
	import type { Snippet } from 'svelte';
	import { DialogType } from '$lib/components/dialog/index';
	import { cn } from '$lib/utils';

	interface DialogProps {
		actions?: Snippet;
		title?: Snippet;
		content: Snippet;
		isAlert?: boolean;
		open?: boolean;
		type?: DialogType;
		onclosed?: () => void;
	}

	let {
		title: dialogTitle = undefined,
		content: dialogContent,
		open: isOpen = false,
		isAlert = false,
		type = DialogType.Info,
		onclosed = undefined
	}: DialogProps = $props();

	const {
		elements: { content, overlay, portalled },
		states: { open }
	} = createDialog({
		forceVisible: true,
		closeOnOutsideClick: false,
		role: !isAlert ? 'dialog' : 'alertdialog',
		onOpenChange: ({ next }) => {
			if (next === false) {
				onclosed?.();
			}

			return next;
		}
	});

	const titleHeaderColors = (): string => {
		switch (type) {
			case DialogType.Error:
				return 'bg-coral-red-600 text-white';
			default:
				return 'bg-regent-gray-500 text-regent-gray-950';
		}
	};

	let footerClasses = cn(
		'min-h-10',
		'round-b-xl',
		'p-2',
		'text-lg',
		'font-semibold',
		titleHeaderColors()
	);
	let titleClasses = cn(
		'min-h-10',
		'rounded-t-xl',
		'p-2',
		'text-lg',
		'font-semibold',
		titleHeaderColors()
	);

	$effect(() => {
		$open = isOpen;
	});
</script>

{#if $open}
	<div use:melt={$portalled}>
		<div
			use:melt={$overlay}
			class="fixed inset-0 z-50 bg-black/50"
			transition:fade={{ duration: 150 }}
		></div>
		<div
			class="fixed top-1/2 left-1/2 z-50 max-w-[90vw] min-w-[12em]
						-translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl bg-white
            shadow-lg"
			use:melt={$content}
		>
			<div class={titleClasses}>
				{@render dialogTitle?.()}
			</div>

			<div class="my-2 max-h-[80vh] overflow-y-auto px-6">
				{@render dialogContent()}
			</div>

			<div class={footerClasses}></div>
		</div>
	</div>
{/if}
