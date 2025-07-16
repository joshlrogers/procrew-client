<script lang="ts">
	import { Icon, MaterialIcon } from '$lib/components/icon';

	interface FilterBadgeProps {
		text: string;
		variant?: 'filled' | 'tonal' | 'outlined';
		color?: 'surface' | 'primary' | 'success' | 'tertiary' | 'error' | 'warning';
		size?: 'sm' | 'base';
		classes?: string;
		onDismiss?: () => void;
		dismissible?: boolean;
	}

	let {
		text,
		variant = 'tonal',
		color = 'primary',
		size = 'sm',
		classes = '',
		onDismiss,
		dismissible = true
	}: FilterBadgeProps = $props();

	const handleDismiss = (e: Event) => {
		e.stopPropagation();
		onDismiss?.();
	};

	const baseClasses = 'badge';
	const sizeClasses = size === 'sm' ? 'text-xs' : 'text-sm';

	// Static class lookup object - classes will be discovered by compiler
	const variantClassMap = {
		'filled-surface': 'preset-filled-surface-500',
		'filled-primary': 'preset-filled-primary-500',
		'filled-success': 'preset-filled-success-500',
		'filled-tertiary': 'preset-filled-tertiary-500',
		'filled-error': 'preset-filled-error-500',
		'filled-warning': 'preset-filled-warning-500',
		'tonal-surface': 'preset-tonal-surface',
		'tonal-primary': 'preset-tonal-primary',
		'tonal-success': 'preset-tonal-success',
		'tonal-tertiary': 'preset-tonal-tertiary',
		'tonal-error': 'preset-tonal-error',
		'tonal-warning': 'preset-tonal-warning',
		'outlined-surface': 'preset-outlined-surface-500',
		'outlined-primary': 'preset-outlined-primary-500',
		'outlined-success': 'preset-outlined-success-500',
		'outlined-tertiary': 'preset-outlined-tertiary-500',
		'outlined-error': 'preset-outlined-error-500',
		'outlined-warning': 'preset-outlined-warning-500'
	} as const;

	const variantKey = `${variant}-${color}` as keyof typeof variantClassMap;
	const variantClasses = variantClassMap[variantKey] || '';

	const badgeClasses = dismissible 
		? `${baseClasses} ${sizeClasses} ${variantClasses} flex items-center gap-1 ${classes}`.trim()
		: `${baseClasses} ${sizeClasses} ${variantClasses} ${classes}`.trim();
</script>

<span class={badgeClasses}>
	{text}
	{#if dismissible && onDismiss}
		<button
			type="button"
			class="rounded-full hover:bg-surface-200-700 transition-colors h-6"
			onclick={handleDismiss}
			aria-label="Clear {text} filter"
		>
			<Icon 
				icon={MaterialIcon.CLOSE} 
				class="w-3 h-3 mr-1 text-surface-500-400"
			/>
		</button>
	{/if}
</span>