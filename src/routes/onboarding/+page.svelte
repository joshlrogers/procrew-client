<script lang="ts">
	import { Wizard } from '$lib/components/wizard';
	import { MaterialIcon } from '$lib/components/icon';

	const steps = [
		{ 
			icon: MaterialIcon.BUSINESS, 
			label: 'Company Details', 
			description: 'Enter your company information' 
		},
		{ 
			icon: MaterialIcon.GROUPS, 
			label: 'Team Setup',
			description: 'Add team members' 
		},
		{ 
			icon: MaterialIcon.SETTINGS, 
			label: 'Configuration' 
		}
	];

	let onboardingContext = $state({
        currentStep: 0,
        orientation: 'horizontal' as 'horizontal' | 'vertical'
    });

    const toggleOrientation = () => {
        onboardingContext.orientation = onboardingContext.orientation === 'horizontal' ? 'vertical' : 'horizontal';
    }

    const onStepChanged = (step?: number) => {
        onboardingContext.currentStep = step ?? 0;
    }
</script>

<button onclick={toggleOrientation}>Toggle Orientation</button>
<div class="flex flex-col items-center justify-center h-screen">
	<Wizard 
		{steps} 
		currentStep={onboardingContext.currentStep} 
	    orientation={onboardingContext.orientation} 
        allowStepChange={true}
        onStepChanged={onStepChanged}
	    shape="square" 
	/>
</div>