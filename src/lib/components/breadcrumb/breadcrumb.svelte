<script lang="ts">
	import { MaterialIcon } from '$lib/components/icon';
	import Icon from '$lib/components/icon/icon.svelte';

	/**
	 * Defines the structure for a single breadcrumb item.
	 * - `label`: The text to display for the breadcrumb item.
	 * - `url`: The navigation path for the breadcrumb item.
	 * - `icon` (optional): A MaterialIcon to display before the label.
	 */
	export type BreadcrumbItem = {
		label: string;
		url: string;
		icon?: MaterialIcon;
	};

	type Props = {
		/** An array of BreadcrumbItem objects to display. */
		items: BreadcrumbItem[];
		/** Optional MaterialIcon to use as a separator. Defaults to MaterialIcon.ARROW_FORWARD_IOS. */
		separatorIcon?: MaterialIcon;
	};

	// The ARROW_FORWARD_IOS enum member will be resolved once the icon/index.ts is correctly updated and the language server picks up the change.
	let { items, separatorIcon = MaterialIcon.ARROW_FORWARD_IOS }: Props = $props();
</script>

{#snippet itemRenderer(item: BreadcrumbItem)}
	<div class="flex">
		{#if item.icon}
			<Icon icon={item.icon} class="text-primary-700-300 mr-1.5 sm:mr-2" />
		{/if}
		<a href={item.url} class="text-primary-700-300 hover:text-primary-500 font-medium">
			{item.label}
		</a>
	</div>
{/snippet}

{#snippet separatorRenderer(iconName: MaterialIcon)}
	<Icon iconSize="medium" icon={iconName} class="text-primary-200-800" />
{/snippet}

<nav aria-label="breadcrumb" class="py-2">
	<ol class="flex items-center space-x-1 text-sm sm:space-x-1.5">
		{#each items as item, i (item.url)}
			<li>
				{@render itemRenderer(item)}
			</li>
			{#if i < items.length - 1}
				<li class="flex items-center" aria-hidden="true">
					{@render separatorRenderer(separatorIcon)}
				</li>
			{/if}
		{/each}
	</ol>
</nav>
