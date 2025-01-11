<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	interface PanelProps extends HTMLAttributes<HTMLElement> {
		baseClass?: string;
		header?: Snippet;
		content?: Snippet;
		footer?: Snippet;
	}

	let {
		baseClass = 'card',
		class: extClass = undefined,
		content = undefined,
		footer = undefined,
		header = undefined,
		...otherProps
	}: PanelProps = $props();

	let panelClass = cn(baseClass, extClass);
</script>

<div class={panelClass} {...otherProps}>
	{#if header}
		<header>
			{@render header()}
		</header>
	{/if}

	{#if content}
		<article>
			{@render content()}
		</article>
	{/if}

	{#if footer}
		<footer>
			{@render footer()}
		</footer>
	{/if}
</div>
