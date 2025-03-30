<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';
	import { Tooltip } from '@skeletonlabs/skeleton-svelte';

	interface TooltipProps extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
		text: string;
	}

	let {
		children,
		text,
		...otherProps
	}: TooltipProps = $props();

</script>

<Tooltip openDelay={300} contentBase="card preset-filled p-2" zIndex={99} {...otherProps}>
	{#snippet trigger()}
		{@render children?.()}
	{/snippet}
	{#snippet content()}
		{text}
	{/snippet}
</Tooltip>






