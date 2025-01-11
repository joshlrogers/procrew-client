<script lang="ts">
	import { createTooltip, melt } from '@melt-ui/svelte';
	import { fade } from 'svelte/transition';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	interface TooltipProps extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
		text: string;
	}

	let {
		children,
		text,
		...otherProps
	}: TooltipProps = $props();

	const {
		elements: { trigger, content, arrow },
		states: { open }
	} = createTooltip({
		positioning: {
			placement: 'top'
		},
		openDelay: 0,
		closeDelay: 0,
		closeOnPointerDown: false,
		forceVisible: true,
	});

</script>

<div class="inline-block" use:melt={$trigger} {...otherProps}>
	{@render children()}
</div>

{#if $open}
	<div
		use:melt={$content}
		transition:fade={{ duration: 100 }}
		class=" z-10 rounded-lg bg-white shadow"
	>
		<div use:melt={$arrow}></div>
		<p class="px-4 py-1 text-magnum-700">{text}</p>
	</div>
{/if}







