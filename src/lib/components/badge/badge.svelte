<script lang="ts">
    interface BadgeProps {
        text: string;
        variant?: 'filled' | 'tonal' | 'outlined';
        color?: 'surface' | 'primary' | 'success' | 'tertiary' | 'error' | 'warning';
        size?: 'sm' | 'base';
        classes?: string;
    }

    let {
        text,
        variant = 'tonal',
        color = 'surface',
        size = 'sm',
        classes = ''
    }: BadgeProps = $props();

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
        'outlined-warning': 'preset-outlined-warning-500',
    } as const;
    
    const variantKey = `${variant}-${color}` as keyof typeof variantClassMap;
    const variantClasses = variantClassMap[variantKey] || '';
    
    const badgeClasses = `${baseClasses} ${sizeClasses} ${variantClasses} ${classes}`.trim();
</script>

<span class={badgeClasses}>
    {text}
</span> 