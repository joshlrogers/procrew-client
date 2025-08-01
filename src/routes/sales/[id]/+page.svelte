<script lang="ts">
	import { superForm } from 'sveltekit-superforms/client';
	import { zod } from 'sveltekit-superforms/adapters';
	import { LeadSchema, LeadStatus } from '$lib/shared/models/lead';
	import { TextInput, MaskedTextInput } from '$lib/components/inputs';
	import { Panel } from '$lib/components/panel';
	import { Breadcrumb } from '$lib/components/breadcrumb';
	import { Icon, MaterialIcon } from '$lib/components/icon';
	import { SelectList } from '$lib/components/selectList';
	import { 
		SalutationOptions, 
		LeadStatusOptions, 
		LeadPriorityOptions,
		type SelectListOption 
	} from '$lib/shared/models/options';
	import { AddressForm } from '$lib/components/addressForm';
	import { Button, ButtonStyle } from '$lib/components/buttons/button';
	import toast from 'svelte-french-toast';

	let { data } = $props();

	let salesRepOptions: SelectListOption[] = $derived(
		data.salesRepresentatives?.map((rep) => ({
			label: rep.displayName,
			value: rep.id
		})) ?? []
	);

	const { form, errors, enhance, constraints, isTainted, tainted, submitting } = superForm(
		data.form,
		{
			dataType: 'json',
			invalidateAll: false,
			multipleSubmits: 'prevent',
			resetForm: false,
			validators: zod(LeadSchema),
			validationMethod: 'onsubmit',
			clearOnSubmit: 'errors-and-message',
			onUpdated: (event) => {
				if (event.form.valid) {
					const displayName = event.form.data.companyName || 
						`${event.form.data.firstName || ''} ${event.form.data.lastName || ''}`.trim() || 'Lead';
					toast.success(`Updated lead ${displayName}.`);
				} else {
					toast.error('Failed to update lead.');
				}
			}
		}
	);

	// Get display name for the lead
	let leadDisplayName = $derived.by(() => {
		if ($form.companyName?.trim()) {
			return $form.companyName;
		} else {
			return `${$form.firstName || ''} ${$form.lastName || ''}`.trim() || 'Lead';
		}
	});

	// Initialize address object for form binding
	$effect(() => {
		if ($form && !$form.address) {
			$form.address = {
				addressLine1: '',
				addressLine2: '',
				addressLine3: '',
				city: '',
				state: '',
				postalCode: '',
				country: ''
			};
		}
	});
</script>

<svelte:head>
	<title>Edit Lead - {leadDisplayName}</title>
</svelte:head>

<div class="flex flex-col items-center gap-4">
	<div class="mb-[-1rem] flex w-[75%] content-start pl-4">
		<Breadcrumb
			items={[
				{ label: 'Home', url: '/' },
				{ label: 'Sales', url: '/sales' },
				{ label: 'Edit Lead', url: `/sales/${data.lead.id}` }
			]}
		/>
	</div>
	<Panel class="w-[75%]">
		{#snippet header()}
			<div class="flex items-center gap-3">
				<Icon icon={MaterialIcon.EDIT} iconSize="2rem" />
				<div>
					<h1 class="text-xl font-semibold">Edit Lead</h1>
					<p class="text-sm opacity-75">{leadDisplayName}</p>
				</div>
			</div>
		{/snippet}
		{#snippet content()}
			<form use:enhance method="POST" action="?/updateLead">
				<!-- Contact Information Section -->
				<section class="mb-6">
					<h3 class="text-lg bg-surface-200-800 px-2 mb-4 rounded">Contact Information</h3>
					<div class="flex w-full flex-col gap-4 p-2">
						<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
							<SelectList
								label="Salutation"
								placeholder="Select salutation"
								required={false}
								tabindex={1}
								value={SalutationOptions.find(opt => opt.value === $form.salutation)?.value}
								onchanged={(val) => $form.salutation = val?.toString() || null}
								items={SalutationOptions}
								wrapperClass="w-full"
							/>
							
							<TextInput
								wrapperClass="w-full"
								constraints={$constraints.companyName}
								errors={$errors.companyName}
								bind:value={$form.companyName}
								tabindex={2}
								label="Company Name"
							/>
						</div>
						
						<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
							<TextInput
								wrapperClass="w-full"
								constraints={$constraints.firstName}
								errors={$errors.firstName}
								bind:value={$form.firstName}
								tabindex={3}
								label="First Name"
							/>
							
							<TextInput
								wrapperClass="w-full"
								constraints={$constraints.lastName}
								errors={$errors.lastName}
								bind:value={$form.lastName}
								tabindex={4}
								label="Last Name"
							/>
						</div>
						
						<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
							<TextInput
								wrapperClass="w-full"
								constraints={$constraints.emailAddress}
								errors={$errors.emailAddress}
								bind:value={$form.emailAddress}
								tabindex={5}
								label="Email Address"
								type="email"
							/>
							
							<MaskedTextInput
								wrapperClass="w-full"
								bind:value={$form.phoneNumber}
								constraints={$constraints.phoneNumber}
								errors={$errors.phoneNumber}
								maskType="Phone"
								label="Phone Number"
								tabindex={6}
							/>
						</div>
					</div>
				</section>

				<!-- Lead Details Section -->
				<section class="mb-6">
					<h3 class="text-lg bg-surface-200-800 px-2 mb-4 rounded">Lead Details</h3>
					<div class="flex w-full flex-col gap-4 p-2">
						<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
							<SelectList
								label="Status"
								placeholder="Select status"
								required={true}
								tabindex={7}
								value={LeadStatusOptions.find(opt => opt.value === $form.status)?.value}
								onchanged={(val) => $form.status = typeof val === 'number' ? val : LeadStatus.New}
								items={LeadStatusOptions}
								wrapperClass="w-full"
							/>
							
							<SelectList
								label="Priority"
								placeholder="Select priority"
								required={false}
								tabindex={8}
								value={LeadPriorityOptions.find(opt => opt.value === $form.priority)?.value}
								onchanged={(val) => $form.priority = typeof val === 'number' ? val : null}
								items={LeadPriorityOptions}
								wrapperClass="w-full"
							/>
							
							<TextInput
								wrapperClass="w-full"
								constraints={$constraints.estimatedValue}
								errors={$errors.estimatedValue}
								bind:value={$form.estimatedValue}
								tabindex={9}
								label="Estimated Value"
								type="number"
								step="0.01"
								min="0"
								max="999999.99"
							/>
						</div>
						
						<div class="grid grid-cols-1 gap-4">
							<SelectList
								label="Assigned To"
								placeholder="Select sales representative"
								required={false}
								tabindex={10}
								value={salesRepOptions.find(opt => opt.value === $form.assignedToId)?.value}
								onchanged={(val) => $form.assignedToId = val?.toString() || null}
								items={salesRepOptions}
								wrapperClass="w-full"
							/>
						</div>
					</div>
				</section>

				<!-- Address Section -->
				<section class="mb-6">
					<h3 class="text-lg bg-surface-200-800 px-2 mb-4 rounded">Address</h3>
					<div class="flex w-full flex-col gap-4 p-2">
								<AddressForm
									name="address"
									formConstraints={constraints}
									formData={form}
									startingTabIndex={11}
									formErrors={errors}
								/>
					</div>
				</section>

				<!-- Notes Section -->
				<section class="mb-6">
					<h3 class="text-lg bg-surface-200-800 px-2 mb-4 rounded">Notes</h3>
					<div class="flex w-full flex-col gap-4 p-2">
						<div class="w-full">
							<label for="notes" class="label mb-2 block text-sm font-medium">
								<span class="label-text">Notes</span>
							</label>
							<textarea
								id="notes"
								name="notes"
								bind:value={$form.notes}
								disabled={$submitting}
								class="textarea w-full"
								rows="4"
								tabindex={17}
								placeholder="Enter any additional notes..."
								{...$constraints.notes}
							></textarea>
							{#if $errors.notes}
								<div class="text-error-500 mt-1 text-sm">
									{$errors.notes}
								</div>
							{/if}
						</div>
					</div>
				</section>

				<!-- Action Buttons -->
				<div class="flex w-full flex-row-reverse gap-4 px-4">
					<Button
						text="Save Changes"
						buttonStyle={ButtonStyle.PRIMARY}
						disabled={!isTainted($tainted) || $submitting}
						type="submit"
					/>
					<Button
						text="Cancel"
						buttonStyle={ButtonStyle.SECONDARY}
						disabled={$submitting}
						onclick={() => history.back()}
					/>
				</div>
			</form>
		{/snippet}
	</Panel>
</div>