<script lang="ts">
	import { cn } from '$lib/utils';
	import type { IconProps } from '$lib/components/icon/index';

	let {
		icon,
		class: extClass = undefined,
		iconSize = 'default',
		...otherProps
	}: IconProps = $props();

	let intIconSize = $derived(
		iconSize === 'default'
			? null
			: iconSize === 'small'
				? 'var(--text-xs)'
				: iconSize === 'medium'
					? 'var(--text-sm)'
					: iconSize === 'large'
						? 'var(--text-lg)'
						: iconSize
	);

	const iconClass = cn('material-symbols-rounded', extClass);
</script>

<span style:font-size={intIconSize} class={iconClass} {...otherProps}>
	{icon}
</span>
