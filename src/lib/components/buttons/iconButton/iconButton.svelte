<script lang="ts">
	import { Icon } from '$lib/components/icon';
	import type { IconButtonProps } from '$lib/components/buttons/iconButton/index';
	import { cn } from '$lib/utils';

	let {
		icon,
		onclick = undefined,
		isRounded = false,
		class: className = undefined,
		width = 2.5,
		flat = false,
		...otherProps
	}: IconButtonProps = $props();

	const buttonClasses = cn(
		'grid group aspect-auto place-items-center',
		flat ? '' : 'shadow-lg',
		`w-[${width}rem] h-[${width}rem]`,
		isRounded ? 'rounded-full' : '', className);
	const iconClasses = cn('text-2xl');
</script>

<button class={buttonClasses}
				{onclick}
				{...otherProps}>
	<Icon {icon} class={iconClasses} />
</button>