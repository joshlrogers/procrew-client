<script lang="ts">
	import { cn } from '$lib/utils';
	import type { IconProps } from '$lib/components/icon/index';

	let { icon, class: extClass = undefined, ...otherProps }: IconProps = $props();

	const iconClass = cn('material-symbols-rounded', extClass);
</script>

<span class={iconClass} {...otherProps}>
	{icon}
</span>