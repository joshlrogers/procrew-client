<script lang="ts">
	import { cn } from '$lib/utils';
	import { Icon } from '$lib/components/icon';
	import { Tooltip } from '$lib/components/tooltip';
	import type { MaterialIcon } from '$lib/components/icon';

	interface WizardStepProps {
		icon: MaterialIcon;
		label: string;
		description?: string;
        orientation: 'horizontal' | 'vertical';
		status: 'upcoming' | 'current' | 'completed';
		shape: 'circle' | 'square';
        onActivate?: () => void;
	}

	let {
		icon,
		label,
		description,
		status,
		shape,
        orientation,
        onActivate = undefined 
	}: WizardStepProps = $props();

	const getBackgroundColor = () => {
		switch (status) {
			case 'completed':
				return 'bg-secondary-500';
			case 'current':
				return 'bg-primary-200-800';
			default:
				return 'bg-primary-800-200';
		}
	};

	const stepClass = $derived(cn(
		'flex items-center justify-center mr-2',
		shape === 'circle' ? 'rounded-full' : 'rounded-md',
		getBackgroundColor(),
		status === 'current' ? 'text-white' : 'text-tertiary-500',
		'w-12 h-12'
	));

	const labelClass = $derived(cn(
		'text-sm font-medium',
		'w-20 h-full',
		status === 'current' ? 'text-primary-600' : 'text-tertiary-500'
	));

    let baseClass = $derived(cn('flex items-center cursor-pointer', orientation === 'horizontal' ? 'flex-col' : 'flex-row'));
    const buttonClass = $derived(cn(status === 'current' ? 'cursor-default' : 'cursor-pointer'));
    const wrapperClass = $derived(cn('flex items-center', buttonClass, orientation === 'horizontal' ? 'flex-col' : 'flex-row'));
</script>

<div class={wrapperClass} 
    onkeydown={(e) => e.key === 'Enter' ? onActivate?.() : undefined}
    onclick={() => status === 'current' ? undefined : onActivate?.()}
    tabindex={status === 'current' ? -1 : 0}
    role="button"
    aria-current={status === 'current'}>

	{#if description}
		<Tooltip {baseClass} text={description} cursor={status === 'current' ? 'default' : 'pointer'}>
            <div class={stepClass}>
                <Icon icon={icon} />
            </div>
            <div class={labelClass}>{label}</div>
		</Tooltip>
	{:else}
        <div class={baseClass}>
            <div class={stepClass}>
                <Icon icon={icon} />
            </div>
            <div class={labelClass}>{label}</div>
        </div>
	{/if}
</div> 