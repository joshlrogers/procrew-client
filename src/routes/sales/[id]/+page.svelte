<script lang="ts">
	import { superForm } from 'sveltekit-superforms/client';
	import { zod } from 'sveltekit-superforms/adapters';
	import { LeadSchema, leadStatusUpdateFormSchema } from '$lib/shared/models/lead';
	import { TextInput, MaskedTextInput, LeadStatusDropdown, LeadAssignmentPicker } from '$lib/components/inputs';
	import { Panel } from '$lib/components/panel';
	import { Breadcrumb } from '$lib/components/breadcrumb';
	import { Icon, MaterialIcon } from '$lib/components/icon';
	import { SelectList } from '$lib/components/selectList';
	import {
		SalutationOptions,
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

	// Main lead form
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

	// Status update form
	const {
			form: statusForm,
			errors: statusErrors,
			enhance: statusEnhance
		} = superForm(
			data.statusForm,
			{
				dataType: 'json',
				invalidateAll: false,
				multipleSubmits: 'prevent',
				resetForm: false,
				validators: zod(leadStatusUpdateFormSchema),
				validationMethod: 'onsubmit',
				clearOnSubmit: 'errors-and-message',
				onUpdated: (event) => {
					if (event.form.valid) {
						// Update the main form's status when status update succeeds
						$form.status = event.form.data.status;
						if (event.form.data.notes) {
							$form.notes = event.form.data.notes;
						}
						toast.success('Lead status updated successfully');
					} else {
						const errorMessage = event.form.errors._errors?.[0] || 'Failed to update lead status';
						toast.error(errorMessage);
					}
				}
			}
		)
	;

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

	// Create reactive lead object for the status dropdown
	let currentLead = $derived({
		...$form,
		id: data.lead.id
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
				<Icon icon={MaterialIcon.EDIT} iconSize="2em" />
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
								value={$form.salutation}
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
							<div class="w-full">
								<label class="label mb-2 block text-sm font-medium">
									<span class="label-text">Status <span class="text-error-200-800 ml-1">*</span></span>
								</label>
								<LeadStatusDropdown
									lead={currentLead}
									onStatusChanged={(val) => $statusForm.status = val}
									enhance={statusEnhance}
									wrapperClass="w-full"
								/>
								{#if $statusErrors._errors}
									<div class="text-error-500 mt-1 text-sm">
										{$statusErrors._errors.join(', ')}
									</div>
								{/if}
							</div>

							<SelectList
								label="Priority"
								placeholder="Select priority"
								required={false}
								tabindex={8}
								value={$form.priority}
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
							<LeadAssignmentPicker
								leadId={data.lead.id || ''}
								currentAssigneeId={$form.assignedToId}
								assignableUsers={data.assignableUsers}
								onAssignmentChanged={(assigneeId) => {
									// Update the main form when assignment changes
									$form.assignedToId = assigneeId;
								}}
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
								{...$constraints.notes}></textarea>
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
						text="Save"
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