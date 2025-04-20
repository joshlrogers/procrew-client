<script lang="ts">
	import type { Snippet } from 'svelte';

	interface SectionProps {
		title: string;
		children: Snippet;
	}

	let {
		title
		, children
	}: SectionProps = $props();
</script>

<section>
	<div class="flex flex-col gap-2">
		<div class="uppercase text-lg bg-surface-200-800 px-2">{title}</div>
		<div class="flex flex-row w-full p-2">
			{@render children?.()}
		</div>
	</div>
</section>