<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	interface PanelProps extends HTMLAttributes<HTMLElement> {
		background?: string;
		baseClass?: string;
		contentClass?: string;
		header?: Snippet;
		headerClass?: string;
		extHeaderClass?: string;
		content?: Snippet;
		footer?: Snippet;
	}

	let {
		baseClass = 'card',
		background = 'preset-filled-surface-100-900',
		class: extClass = undefined,
		content = undefined,
		contentClass = 'p-4',
		footer = undefined,
		header = undefined,
		headerClass = 'p-2 preset-filled-surface-300-700 rounded-t-[var(--radius-container)]',
		extHeaderClass = undefined,
		...otherProps
	}: PanelProps = $props();

	let panelClasses = cn(baseClass, background, extClass);
</script>

<div class={panelClasses} {...otherProps}>
	{#if header}
		<header class={cn(headerClass, extHeaderClass)}>
			{@render header()}
		</header>
	{/if}

	{#if content}
		<article class={contentClass}>
			{@render content()}
		</article>
	{/if}

	{#if footer}
		<footer>
			{@render footer()}
		</footer>
	{/if}
</div>
