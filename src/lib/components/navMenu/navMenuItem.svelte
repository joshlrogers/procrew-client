<script lang="ts">
	import { page } from '$app/stores';
	import { Icon } from '$lib/components/icon';

	let {
		href,
		text,
		icon = undefined,
		iconClass = undefined,
		spanClass = 'ms-2',
		subText = undefined,
		...otherProps
	} = $props();
	let isActive = $state($page.url.pathname === href);
	$effect(() => {
		isActive = $page.url.pathname === href;
	});

	let activeClass =
		'flex items-center p-2 font-bold rounded-lg hover:cursor-default bg-surface-300-700';
	let nonActiveClass = 'flex items-center p-2 font-norma rounded-lg hover:bg-surface-300-700';
</script>

<li {...otherProps}>
	<a
		data-sveltekit-preload-data="tap"
		data-sveltekit-preload-code="hover"
		{href}
		class={isActive ? activeClass : nonActiveClass}
		aria-current={isActive ? 'page' : undefined}
	>
		{#if icon}
			<Icon {icon} class={iconClass} />
		{/if}
		<span class={spanClass}>{text}</span>
		{@render subText?.()}
	</a>
</li>
