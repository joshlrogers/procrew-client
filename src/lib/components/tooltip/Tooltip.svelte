<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';
	import { Tooltip } from '@skeletonlabs/skeleton-svelte';
	import { cn } from '$lib/utils';

	interface TooltipProps extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
		text: string;
		baseClass?: string;
		cursor?: 'default' | 'pointer';
	}

	let {
		children,
		text,
		baseClass = 'max-w-18',
		cursor = 'pointer',
		...otherProps
	}: TooltipProps = $props();

	const triggerBaseClass = $derived(cn(baseClass, `cursor-${cursor}`));
</script>

<Tooltip openDelay={300} contentBase="card preset-filled p-2" triggerBase={triggerBaseClass} zIndex={99} {...otherProps}>
	{#snippet trigger()}
		{@render children?.()}
	{/snippet}
	{#snippet content()}
		{text}
	{/snippet}
</Tooltip>






