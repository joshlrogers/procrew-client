<script lang="ts">
	import { Icon } from '$lib/components/icon';
	import { MaterialIcon } from '$lib/components/icon';
	import { cn } from '$lib/utils';
	import { blur, fade, fly, slide, type TransitionConfig } from 'svelte/transition';

	let {
		children,
		title,
		transitionType = undefined,
		transitionParams = {},
		leadingIcon = undefined
	} = $props();
	let isOpen = $state(false);

	let buttonClass = cn(
		'w-full bg-transparent flex items-center p-2',
		'transition hover:bg-surface-300-700',
		'duration-75',
		'rounded-lg',
		'group'
	);
	let spanClass = cn('flex-1', 'ms-3', 'text-left', 'rtl:text-right', 'whitespace-nowrap');

	let toggleOpen = () => {
		isOpen = !isOpen;
	};

	const multiple = (node: Element, params: any): TransitionConfig => {
		switch (transitionType) {
			case 'blur':
				return blur(node, params);
			case 'fly':
				return fly(node, params);
			case 'fade':
				return fade(node, params);
			default:
				return slide(node, params);
		}
	};
</script>

<li>
	<button
		type="button"
		onclick={toggleOpen}
		class={buttonClass}
		aria-controls="nav-group-dropdown"
		data-collapse-toggle="nav-group-dropdown"
	>
		{#if leadingIcon}
			<Icon icon={leadingIcon} />
		{/if}
		<span class={spanClass}>{title}</span>

		<Icon
			icon={MaterialIcon.ARROW_LEFT}
			class="transition duration-200 data-[open=true]:-rotate-90"
			data-open={isOpen}
		/>
	</button>
	{#if isOpen}
		<ul class="ps-4" transition:multiple={transitionParams}>
			{@render children()}
		</ul>
	{/if}
</li>
