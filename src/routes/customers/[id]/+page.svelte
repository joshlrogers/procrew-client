<script lang="ts">
	import { TextInput } from '$lib/components/inputs';
	import { Button } from '$lib/components/buttons/button';
	import { ButtonStyle } from '$lib/components/buttons/button';
	import { CustomerSchema, CustomerType } from '$lib/shared/models/customer';
	import { superForm } from 'sveltekit-superforms/client';
	import { zod } from 'sveltekit-superforms/adapters';
	import { AddressForm } from '$lib/components/addressForm/index.js';
	import { Panel } from '$lib/components/panel';
	import { Breadcrumb } from '$lib/components/breadcrumb';

	let { data } = $props();

	const { form, errors, enhance, constraints, isTainted, tainted, submitting } = superForm(
		data.form,
		{
			dataType: 'json',
			invalidateAll: false,
			multipleSubmits: 'prevent',
			resetForm: false,
			validators: zod(CustomerSchema),
			validationMethod: 'onsubmit',
			clearOnSubmit: 'errors-and-message'
		}
	);

	const handleCustomerTypeChange = (type: CustomerType) => {
		$form.customerType = type;
	};

	// Get display name for the customer
	let customerDisplayName = $derived.by(() => {
		if ($form.customerType === CustomerType.COMMERCIAL) {
			return $form.companyName || 'Commercial Customer';
		} else {
			return `${$form.firstName || ''} ${$form.lastName || ''}`.trim() || 'Residential Customer';
		}
	});
</script>

<svelte:head>
	<title>Edit Customer - {customerDisplayName}</title>
</svelte:head>

<div class="flex flex-col items-center gap-4">
	<div class="mb-[-1rem] flex w-[75%] content-start pl-4">
		<Breadcrumb
			items={[
				{ label: 'Home', url: '/' },
				{ label: 'Customers', url: '/customers' },
				{ label: customerDisplayName, url: `${$form.id}` }
			]}
		/>
	</div>
	<Panel class="w-[75%]">
		{#snippet header()}
			Edit Customer {customerDisplayName}
		{/snippet}
		{#snippet content()}
			<form method="post" action="?/updateCustomer" use:enhance>
				{#await data.countries then countries}
					{#await data.states}
						<div class="container mx-auto p-6">
							<div class="flex h-64 items-center justify-center">
								<div class="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
							</div>
						</div>
					{:then states}
						<div class="mb-6">
							<div class="label mb-2 block">
								<span class="label-text">Customer Type</span>
							</div>
							<div class="flex gap-4">
								<label class="flex cursor-pointer items-center">
									<input
										type="radio"
										name="customerType"
										value={CustomerType.RESIDENTIAL}
										checked={$form.customerType === CustomerType.RESIDENTIAL}
										onchange={() => handleCustomerTypeChange(CustomerType.RESIDENTIAL)}
										disabled={$submitting}
										class="radio radio-primary mr-2"
									/>
									<span class="text-sm">Residential</span>
								</label>
								<label class="flex cursor-pointer items-center">
									<input
										type="radio"
										name="customerType"
										value={CustomerType.COMMERCIAL}
										checked={$form.customerType === CustomerType.COMMERCIAL}
										onchange={() => handleCustomerTypeChange(CustomerType.COMMERCIAL)}
										disabled={$submitting}
										class="radio radio-primary mr-2"
									/>
									<span class="text-sm">Commercial</span>
								</label>
							</div>
						</div>

						{#if $form.customerType === CustomerType.RESIDENTIAL}
							<div class="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
								<TextInput
									label="First Name"
									required={true}
									bind:value={$form.firstName}
									constraints={$constraints.firstName}
									errors={$errors.firstName}
									disabled={$submitting}
								/>
								<TextInput
									label="Last Name"
									required={true}
									bind:value={$form.lastName}
									constraints={$constraints.lastName}
									errors={$errors.lastName}
									disabled={$submitting}
								/>
							</div>
						{:else if $form.customerType === CustomerType.COMMERCIAL}
							<div class="mb-4">
								<TextInput
									label="Company Name"
									required={true}
									bind:value={$form.companyName}
									constraints={$constraints.companyName}
									errors={$errors.companyName}
									disabled={$submitting}
								/>
							</div>
						{/if}

						<!-- Contact Information Section -->
						<div>
							<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
								<TextInput
									label="Phone Number"
									type="tel"
									bind:value={$form.phoneNumber}
									constraints={$constraints.phoneNumber}
									errors={$errors.phoneNumber}
									disabled={$submitting}
								/>
								<TextInput
									label="Email Address"
									type="email"
									bind:value={$form.primaryEmailAddress}
									constraints={$constraints.primaryEmailAddress}
									errors={$errors.primaryEmailAddress}
									disabled={$submitting}
								/>
							</div>
						</div>

						<AddressForm
							{states}
							{countries}
							formConstraints={constraints}
							formData={form}
							formErrors={errors}
						/>

						<!-- Action Buttons -->
						<div class="flex justify-end gap-4 pt-6">
							<Button
								text="Cancel"
								buttonStyle={ButtonStyle.SECONDARY}
								disabled={$submitting}
								onclick={() => history.back()}
								width="w-auto"
								class="px-6"
							/>
							<Button
								text={$submitting ? 'Saving...' : 'Save Changes'}
								buttonStyle={ButtonStyle.PRIMARY}
								disabled={!isTainted($tainted) || $submitting}
								type="submit"
								width="w-auto"
								class="px-6"
							/>
						</div>
					{/await}
				{/await}
			</form>
		{/snippet}
	</Panel>
</div>
