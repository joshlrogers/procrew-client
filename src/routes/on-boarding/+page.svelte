<script lang="ts">
	import { Wizard } from '$lib/components/wizard';
	import { Icon, MaterialIcon } from '$lib/components/icon';
	import { Panel } from '$lib/components/panel';
	import { TextInput } from '$lib/components/inputs';
	import { superForm } from 'sveltekit-superforms/client';
	import { zod } from 'sveltekit-superforms/adapters';
	import { AccountSchema } from '$lib/shared/models/account/index';
	import { Button, ButtonStyle } from '$lib/components/buttons/button';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import OrganizationPanel from '../settings/organization/organizationPanel/organizationPanel.svelte';
	import { ProgressRing } from '@skeletonlabs/skeleton-svelte';
	import type { Organization } from '$lib/shared/models/organization';
	import toast from 'svelte-french-toast';

	let { data } = $props();

	const {
		form,
		errors,
		enhance,
		constraints,
		isTainted,
		tainted,
		submitting
	} = superForm(data.form, {
		dataType: 'json',
		invalidateAll: false,
		multipleSubmits: 'prevent',
		resetForm: false,
		validators: zod(AccountSchema),
		validationMethod: 'onsubmit',
		clearOnSubmit: 'errors-and-message',
		onUpdated: async (event) => {
			if (event.form.valid) {
				onboardingContext.isRegistered = true;
				onboardingContext.currentStep = 1;
			}
		}
	});

	const steps = [
		{
			icon: MaterialIcon.HOW_TO_REG,
			label: 'Registration',
			description: 'Register your account'
		},
		{
			icon: MaterialIcon.BUSINESS_CENTER,
			label: 'Organization',
			description: 'Add your organization information'
		},
		{
			icon: MaterialIcon.BUSINESS,
			label: 'Company',
			description: 'Add your company information'
		}
	];

	const determineCurrentStep = () => {
		if(!$form.isRegistered) {
			return 0;
		}
		if(!$form.defaultOrganizationId) {
			return 1;
		}
		if(!$form.defaultCompanyId) {
			return 2;
		}
		return 3;
	}

	let onboardingContext = $state({
		currentStep: -1,
		orientation: 'horizontal' as 'horizontal' | 'vertical',
		isRegistered: $form.isRegistered,
		companyCreated: $form.defaultCompanyId !== null,
		organizationCreated: $form.defaultOrganizationId !== null
	});

	const onStepChanged = (step?: number) => {
		if(step === 0 && onboardingContext.isRegistered) {
			onboardingContext.currentStep = 1;
			return;
		}

		onboardingContext.currentStep = step ?? 0;
	};

	onMount(() => {
		onboardingContext.currentStep = determineCurrentStep();
	});

	const onOrganizationUpdated = (organization: Organization) => {
		goto('/settings/organization');
	}

	$effect(() => {
		$inspect(onboardingContext);
	})
</script>


<div class="flex flex-col gap-4 items-center">

	<div class="flex flex-col items-center justify-center mt-4 mb-10">
		<Wizard
			{steps}
			currentStep={onboardingContext.currentStep}
			orientation={onboardingContext.orientation}
			allowStepChange={true}
			onStepChanged={onStepChanged}
			shape="square"
		/>
	</div>
	{#if onboardingContext.currentStep === 0}
		<Panel class="w-[75%]">
			{#snippet header()}
				<div class="flex flex-row items-center">
					<Icon icon={MaterialIcon.HOW_TO_REG} class="mr-2" />
					Registration
				</div>
			{/snippet}
			{#snippet content()}
				<div class="flex flex-col gap-4 items-center">
					{#if onboardingContext.isRegistered}
						<p>You're already registered. Please login to continue.</p>
					{:else}
						<form method="POST" action="?/register" class="w-full" use:enhance>

							<div class="flex flex-col gap-4 items-center">
								<TextInput label="First Name"
												 required={true}
												 wrapperClass="w-1/2"
												 bind:value={$form.firstName}
												 constraints={$constraints.firstName}
												 errors={$errors.firstName}
												 autofocus={true}
								/>
								<TextInput label="Last Name"
												 required={true}
												 wrapperClass="w-1/2"
												 bind:value={$form.lastName}
												 constraints={$constraints.lastName}
												 errors={$errors.lastName}
								/>
								<TextInput label="Email"
												 wrapperClass="w-1/2"
												 bind:value={$form.emailAddress}
												 constraints={$constraints.emailAddress}
												 errors={$errors.emailAddress}
												 readonly
								/>
							</div>
							<div class="flex w-full px-4 mt-2 justify-center">
								<div class="w-1/2 text-right mr-2">
									<Button type="submit"
											text="Register"
											buttonStyle={ButtonStyle.PRIMARY}
											disabled={!isTainted($tainted) || $submitting}
									/>
								</div>
							</div>
						</form>
					{/if}
				</div>
			{/snippet}

		</Panel>
	{:else if onboardingContext.currentStep === 1}
		<Panel class="w-[75%]">
			{#snippet header()}
				<div class="flex flex-row items-center">
					<Icon icon={MaterialIcon.BUSINESS_CENTER} class="mr-2" />
					Organization
				</div>
			{/snippet}
			{#snippet content()}
				{#await data.countries}
				<div class="flex flex-row justify-center items-center gap-2">
					<ProgressRing value={null} size="size-14" meterStroke="stroke-tertiary-600-400"
												trackStroke="stroke-tertiary-50-950" />
				</div>
				{:then countries}
					{#await data.states}
					<div class="flex flex-row justify-center items-center gap-2">
						<ProgressRing value={null} size="size-14" meterStroke="stroke-tertiary-600-400"
													trackStroke="stroke-tertiary-50-950" />
					</div>
					{:then states}
						<OrganizationPanel 
							organizationForm={data.organizationForm} 
							countries={countries} 
							states={states} 
							action="?/createOrganization"
							onUpdated={onOrganizationUpdated}
						/>
					{/await}
				{/await}
			{/snippet}
		</Panel>
	{:else if onboardingContext.currentStep === 2}
		<Panel class="w-[75%]">
			{#snippet header()}
				<div class="flex flex-row items-center">
					<Icon icon={MaterialIcon.BUSINESS} class="mr-2" />
					Company
				</div>
			{/snippet}
		</Panel>
	{/if}
</div>