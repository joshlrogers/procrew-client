<script lang="ts">
	import { Modal } from '@skeletonlabs/skeleton-svelte';

	let {
		isOpen = false,
		trigger = undefined,
		children = undefined,
	} = $props();

</script>

<Modal
	trigger={trigger}
	triggerBase="btn preset-tonal"
	contentBase="bg-surface-100-900 p-4 space-y-4 shadow-xl w-[480px] h-screen"
	positionerJustify="justify-start"
	positionerAlign=""
	positionerPadding=""
	transitionsPositionerIn={{ x: -480, duration: 200 }}
	transitionsPositionerOut={{ x: -480, duration: 200 }}
	bind:open={isOpen}>
	{#snippet content()}
		{@render children?.()}
	{/snippet}
</Modal>
