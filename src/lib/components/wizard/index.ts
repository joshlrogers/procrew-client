import WizardRoot from './Wizard.svelte';
import WizardStepComponent from './WizardStep.svelte';
import type { MaterialIcon } from '$lib/components/icon';

export interface WizardStepData {
	icon: MaterialIcon;
	label: string;
	description?: string;
}

interface WizardContext {
    orientation: 'horizontal' | 'vertical';
}


export {
	WizardRoot as Wizard,
    WizardStepComponent as WizardStep,
    type WizardContext,
}; 