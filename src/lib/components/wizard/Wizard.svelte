<script lang="ts">
	import { cn } from '$lib/utils';
	import WizardStep from './WizardStep.svelte';
	import type { WizardStep as WizardStepType } from './index';

	interface WizardProps {
		steps: WizardStepType[];
		currentStep?: number;
		orientation?: 'horizontal' | 'vertical';
		shape?: 'circle' | 'square';
		class?: string;
        onStepChanged?: (step?: number) => void;
        allowStepChange?: boolean;
	}

	let {
		steps,
		currentStep = 0,
		orientation = 'horizontal',
		shape = 'circle',
		class: extClass = '',
		onStepChanged = undefined,
		allowStepChange = true,
		...otherProps
	}: WizardProps = $props();

	const wizardClass = $derived(cn(
		'flex',
		orientation === 'horizontal' ? 'flex-row' : 'flex-col',
		orientation === 'horizontal' ? 'items-start' : 'items-center',
		extClass
	));

    const timelineClass = $derived(cn(
        'flex flex-wrap perspective-[5000px] content-center relative bg-gray-300 p-1 text-white before:top-16 before:content-[""] h-2 rounded-xl before:absolute',
        orientation === 'horizontal' ? 'flex-row' : 'flex-col',
        orientation === 'horizontal' ? 'mx-5' : 'my-5',
        orientation === 'horizontal' ? 'w-full' : 'h-full',
        orientation === 'horizontal' ? 'h-2' : 'w-2'
    ));

    const onStepActivate = (index: number) => {
        if(allowStepChange) {
            onStepChanged?.(index);
        }
    }

    let stepWrapperClass = $derived(cn('relative text-center', orientation === 'horizontal' ? 'top-3 max-w-16 mx-10' : 'left-11 my-10'));
</script>

<div class={wizardClass} {...otherProps} data-orientation={orientation}>
    <div class={timelineClass} aria-hidden="true">
	{#each steps as step, index}
		<div class={stepWrapperClass}>
			<WizardStep
				{...step}
				{shape}
                {orientation}
                onActivate={() => {
                    if (index !== currentStep) {
                        onStepActivate?.(index);
                    }
                }}
				status={index < currentStep ? 'completed' : index === currentStep ? 'current' : 'upcoming'}
			/>
		</div>
	{/each}
    </div>
</div>
