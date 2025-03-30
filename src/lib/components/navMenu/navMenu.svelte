<script lang="ts">
	import { Modal } from '@skeletonlabs/skeleton-svelte';

	interface NavMenuProps {
		isOpen: boolean;
		children: any;
		onOpenChanged?: (isOpen: boolean) => void;
	}

	let {
		isOpen = false,
		children = undefined,
		onOpenChanged = undefined
	}: NavMenuProps = $props();


</script>
<Modal
	triggerBase="btn preset-tonal"
	contentBase="bg-surface-100-900 p-4 space-y-4 shadow-xl w-[480px] h-screen"
	positionerJustify="justify-start"
	positionerAlign=""
	positionerPadding=""
	transitionsPositionerIn={{ x: -480, duration: 200 }}
	transitionsPositionerOut={{ x: -480, duration: 200 }}
	onOpenChange={(e) => onOpenChanged?.(e.open)}
	open={isOpen}>
	{#snippet content()}
		{@render children?.()}
	{/snippet}
</Modal>
