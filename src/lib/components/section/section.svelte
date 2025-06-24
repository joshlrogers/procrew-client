<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils';

	interface SectionProps {
		title: string;
		children: Snippet;
		titleClass?: string;
		upperCaseTitle?: boolean;
	}

	let {
		title,
		titleClass: extTitleClass = undefined,
		upperCaseTitle = false,
		children
	}: SectionProps = $props();

	let titleClass = $derived(cn('text-lg bg-surface-200-800 px-2', extTitleClass));
</script>

<section>
	<div class="flex flex-col gap-2">
		<div class:uppercase={upperCaseTitle} class={titleClass}>
			{title}
		</div>
		<div class="flex w-full flex-row p-2">
			{@render children?.()}
		</div>
	</div>
</section>
