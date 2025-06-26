<script lang="ts">
	import { createDialog, melt } from '@melt-ui/svelte';
	import { fade } from 'svelte/transition';
	import { TextInput, MaskedTextInput } from '$lib/components/inputs';
	import { Button } from '$lib/components/buttons/button';
	import { ButtonStyle } from '$lib/components/buttons/button';
	import { SelectList } from '$lib/components/selectList';
	import { AddressForm } from '$lib/components/addressForm';
	import { cn } from '$lib/utils';
	import { LeadSchema, LeadPriority } from '$lib/shared/models/lead';
	import { LeadPriorityOptions, SalutationOptions } from '$lib/shared/models/options';
	import { Panel } from '$lib/components/panel';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	import type { CountrySelectOption, StateSelectOption } from '$lib/shared/models/address';
	import toast from 'svelte-french-toast';

	interface NewLeadModalProps {
		open?: boolean;
		countries?: CountrySelectOption[];
		states?: StateSelectOption[];
		onClose?: (success?: boolean) => void;
	}

	let {
		open: isOpen = false,
		countries = [],
		states = [],
		onClose = (success?: boolean) => {}
	}: NewLeadModalProps = $props();

	const {
		elements: { content, overlay, portalled },
		states: { open }
	} = createDialog({
		forceVisible: true,
		closeOnOutsideClick: false,
		role: 'dialog',
		onOpenChange: ({ next }) => {
			if (next === false) {
				onClose();
			}
			return next;
		}
	});

	let { form, enhance, errors, constraints, submitting, reset, message, validate } = superForm(
		defaults(zod(LeadSchema)),
		{
			dataType: 'json',
			invalidateAll: true,
			multipleSubmits: 'prevent',
			resetForm: false,
			validationMethod: 'onsubmit',
			validators: zod(LeadSchema),
			clearOnSubmit: 'errors-and-message',
			onResult: async ({ result }) => {
				if (result.type === 'success') {
					// Success - show success toast, reset form, and close modal
					toast.success('Lead created successfully.');
					reset();
					onClose(true);
				} else if (result.type === 'failure') {
					// Handle server-side errors - show error toast but keep modal open
					const errorMessage = result.data?.error || 'Failed to create lead.';
					toast.error(errorMessage);
				}
			}
		}
	);

	const handleCancel = () => {
		reset();
		onClose();
	};

	const handleKeydown = (event: KeyboardEvent) => {
		if (event.key === 'Escape') {
			handleCancel();
		}
	};

	// Initialize address object for form binding (even though address is optional)
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

	// Sync dialog open state with prop
	$effect(() => {
		$open = isOpen;
		reset();
	});

	let titleClasses = cn('text-lg', 'font-semibold');
	let footerClasses = cn(
		'min-h-10',
		'rounded-b-xl',
		'p-4',
		'flex',
		'justify-end',
		'gap-2',
		'bg-regent-gray-100'
	);
</script>

<svelte:window on:keydown={handleKeydown} />

{#if $open}
	<div use:melt={$portalled}>
		<div
			use:melt={$overlay}
			class="fixed inset-0 z-50 bg-black/50"
			transition:fade={{ duration: 150 }}
		></div>
		<div
			class="bg-surface-900 fixed top-1/2 left-1/2 z-50 max-h-[90vh] max-w-[90vw] min-w-[600px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl shadow-lg"
			use:melt={$content}
		>
			<Panel extHeaderClass={titleClasses}>
				{#snippet header()}
					New Lead
				{/snippet}
				{#snippet content()}
					<form action="?/createLead" method="POST" use:enhance>
						<div class="space-y-6 p-6">
							{#if $message}
								<div class="alert alert-error">
									<span>{$message}</span>
								</div>
							{/if}

							<!-- Contact Information -->
							<div class="space-y-4">
								<div class="border-surface-300 mb-4 border-b pb-2">
									<h3 class="text-surface-50 text-lg font-semibold">Contact Information</h3>
								</div>

								<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
									<SelectList
										label="Salutation"
										name="salutation"
										required={false}
										items={SalutationOptions}
										value={$form.salutation || ''}
										onchanged={(val) => ($form.salutation = val as string)}
										wrapperClass="w-full"
									/>
									<TextInput
										label="First Name"
										name="firstName"
										bind:value={$form.firstName}
										constraints={$constraints.firstName}
										errors={$errors.firstName}
										disabled={$submitting}
									/>
									<TextInput
										label="Last Name"
										name="lastName"
										bind:value={$form.lastName}
										constraints={$constraints.lastName}
										errors={$errors.lastName}
										disabled={$submitting}
									/>
								</div>

								<TextInput
									label="Company Name"
									name="companyName"
									bind:value={$form.companyName}
									constraints={$constraints.companyName}
									errors={$errors.companyName}
									disabled={$submitting}
								/>

								<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
									<MaskedTextInput
										label="Phone"
										name="phoneNumber"
										maskType="Phone"
										bind:value={$form.phoneNumber}
										constraints={$constraints.phoneNumber}
										errors={$errors.phoneNumber}
										disabled={$submitting}
									/>
									<TextInput
										label="Email"
										name="emailAddress"
										type="email"
										bind:value={$form.emailAddress}
										constraints={$constraints.emailAddress}
										errors={$errors.emailAddress}
										disabled={$submitting}
									/>
								</div>
							</div>

							<!-- Lead Details -->
							<div class="space-y-4">
								<div class="border-surface-300 mb-4 border-b pb-2">
									<h3 class="text-surface-50 text-lg font-semibold">Lead Details</h3>
								</div>

								<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
									<SelectList
										label="Priority"
										name="priority"
										required={false}
										items={LeadPriorityOptions}
										value={$form.priority || LeadPriority.Medium}
										onchanged={(val) =>
											($form.priority = val as (typeof LeadPriority)[keyof typeof LeadPriority])}
										wrapperClass="w-full"
									/>
								</div>
							</div>

							<!-- Service Address -->
							<div class="space-y-4">
								<div class="border-surface-300 mb-4 border-b pb-2">
									<h3 class="text-surface-50 text-lg font-semibold">Service Address</h3>
								</div>

								{#if countries.length > 0 && states.length > 0}
									<AddressForm
										{countries}
										{states}
										formData={form}
										formErrors={errors}
										formConstraints={constraints}
									/>
								{:else}
									<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
										<TextInput
											label="Street"
											name="address.addressLine1"
											bind:value={$form.address!.addressLine1}
											constraints={$constraints.address?.addressLine1}
											errors={$errors.address?.addressLine1}
											disabled={$submitting}
										/>
										<TextInput
											label="City"
											name="address.city"
											bind:value={$form.address!.city}
											constraints={$constraints.address?.city}
											errors={$errors.address?.city}
											disabled={$submitting}
										/>
									</div>
									<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
										<TextInput
											label="State"
											name="address.state"
											bind:value={$form.address!.state}
											constraints={$constraints.address?.state}
											errors={$errors.address?.state}
											disabled={$submitting}
										/>
										<TextInput
											label="Zip"
											name="address.postalCode"
											bind:value={$form.address!.postalCode}
											constraints={$constraints.address?.postalCode}
											errors={$errors.address?.postalCode}
											disabled={$submitting}
										/>
									</div>
								{/if}
							</div>

							<!-- Additional Information -->
							<div class="space-y-4">
								<div class="border-surface-300 mb-4 border-b pb-2">
									<h3 class="text-surface-50 text-lg font-semibold">Additional Information</h3>
								</div>

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
										rows="3"
										placeholder="Enter any additional notes..."
									></textarea>
									{#if $errors.notes}
										<div class="text-error-500 mt-1 text-sm">
											{$errors.notes}
										</div>
									{/if}
								</div>
							</div>

							<div class="text-surface-600 text-sm">
								<div>
									* Either company name or at least one of first name or last name is required
								</div>
								<div>* Either email address or phone number is required</div>
							</div>
						</div>

						<div class={footerClasses}>
							<Button
								text="Cancel"
								buttonStyle={ButtonStyle.SECONDARY}
								disabled={$submitting}
								onclick={handleCancel}
							/>
							<Button
								text={$submitting ? 'Saving...' : 'Save'}
								type="submit"
								buttonStyle={ButtonStyle.PRIMARY}
								disabled={$submitting}
							/>
						</div>
					</form>
				{/snippet}
			</Panel>
		</div>
	</div>
{/if}
