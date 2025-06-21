<script lang="ts">
	import { Icon } from '$lib/components/icon';
	import type { IconButtonProps } from '$lib/components/buttons/iconButton/index';
	import { cn } from '$lib/utils';
	import { Tooltip } from '$lib/components/tooltip';

	let {
		disabled = false,
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

	const buttonClasses = $derived(cn(
		'chip place-items-center p-2',
		flat ? '' : 'shadow-md shadow-surface-50/35',
		`w-[${width}rem] h-[${width}rem]`,
		isRounded ? 'rounded-full' : '', className));
	const iconClasses = cn('text-2xl');
</script>

{#if tooltip && tooltip.length > 0}
	<Tooltip openDelay={200} text={tooltip} triggerClass={buttonClasses}>
		<button {type} {onclick} {disabled} {...otherProps}>
			<Icon {icon} class={iconClasses} />
		</button>
	</Tooltip>
{:else}
	<button class={buttonClasses}
					{type}
					{onclick}
					{disabled}
					{...otherProps}>
		<Icon {icon} class={iconClasses} />
	</button>
{/if}

