<script lang="ts">
	import { Icon } from '$lib/components/icon';
	import type { IconButtonProps } from '$lib/components/buttons/iconButton/index';
	import { cn } from '$lib/utils';
	import { Tooltip } from '$lib/components/tooltip';

	let {
		icon,
		onclick = undefined,
		isRounded = false,
		class: className = undefined,
		width = 2.5,
		flat = false,
		tooltip = undefined,
		type = 'button',
		...otherProps
	}: IconButtonProps = $props();

	const buttonClasses = cn(
		'grid group aspect-auto place-items-center',
		flat ? '' : 'shadow-lg',
		`w-[${width}rem] h-[${width}rem]`,
		isRounded ? 'rounded-full' : '', className);
	const iconClasses = cn('text-2xl');
</script>

{#if tooltip && tooltip.length > 0}
	<Tooltip openDelay={200} onclick={onclick} text={tooltip} triggerClasses={buttonClasses}>
			<Icon {icon} class={iconClasses} />
	</Tooltip>
{:else}
	<button class={buttonClasses}
					{type}
					{onclick}
					{...otherProps}>
		<Icon {icon} class={iconClasses} />
	</button>
{/if}

