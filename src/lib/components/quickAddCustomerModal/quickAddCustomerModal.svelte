<script lang="ts">
	import { createDialog, melt } from '@melt-ui/svelte';
	import { fade } from 'svelte/transition';
	import { TextInput } from '$lib/components/inputs';
	import { Button } from '$lib/components/buttons/button';
	import { ButtonStyle } from '$lib/components/buttons/button';
	import { cn } from '$lib/utils';
	import type { QuickAddCustomer } from '$lib/shared/models/customer';
	import { CustomerType, QuickAddCustomerSchema } from '$lib/shared/models/customer';
	import { Panel } from '../panel';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';

	interface QuickAddCustomerModalProps {
		open?: boolean;
		onClose?: (success?: boolean) => void;
		onSave?: (customer: QuickAddCustomer) => Promise<string | null>; // Returns customer ID on success, null on error
	}

	let {
		open: isOpen = false,
		onClose = (success?: boolean) => {},
		onSave = async () => null
	}: QuickAddCustomerModalProps = $props();

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

	let {form, 
		enhance, 
		errors, 
		constraints,
		tainted,
		isTainted,
		submitting,
		reset
	} = superForm(defaults(zod(QuickAddCustomerSchema)), {
		dataType: 'json',
		invalidateAll: false,
		multipleSubmits: 'prevent',
		resetForm: false,
		validationMethod: 'onsubmit',
		validators: zod(QuickAddCustomerSchema),
		clearOnSubmit: 'errors-and-message',
		onUpdated: async (event) => {
			if(event.form.valid) {
				reset({data: { customerType: CustomerType.RESIDENTIAL }, newState: { customerType: CustomerType.RESIDENTIAL }});
				onClose(true);
				return;
			}

			onClose(false);
		}
	});

	const handleCancel = () => {
		reset({data: { customerType: CustomerType.RESIDENTIAL }, newState: { customerType: CustomerType.RESIDENTIAL }});
		onClose();
	};

	const handleCustomerTypeChange = (type: CustomerType) => {
		$form.customerType = type;
		$form.companyName = '';
		$form.firstName = '';
		$form.lastName = '';
	};

	$effect(() => {
		$open = isOpen;
	});

	let titleClasses = cn('text-lg', 'font-semibold');
	let footerClasses = cn('min-h-10', 'rounded-b-xl', 'p-4', 'flex', 'justify-end', 'gap-2', 'bg-regent-gray-100');
</script>

{#if $open}
	<div use:melt={$portalled}>
		<div
			use:melt={$overlay}
			class="fixed inset-0 z-50 bg-black/50"
			transition:fade={{ duration: 150 }}
		></div>
		<div class="fixed left-1/2 top-1/2 z-50 max-w-[90vw] min-w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-surface-900 shadow-lg"
				 use:melt={$content}>
			<Panel extHeaderClass={titleClasses}>
				{#snippet header()}
					Quick Add Customer
				{/snippet}
				{#snippet content()}
				<form action="?/quickAdd" method="POST" use:enhance>
					<div class="p-6 space-y-4">
						<!-- Customer Type Selection -->
						<div>
							<div class="block mb-2 label">
								<span class="label-text">Customer Type</span>
							</div>
							<div class="flex gap-4">
								<label class="flex items-center cursor-pointer">
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
								<label class="flex items-center cursor-pointer">
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
		
						<!-- Conditional Fields Based on Customer Type -->
						{#if $form.customerType === CustomerType.RESIDENTIAL}
							<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
							<TextInput
								label="Company Name"
								required={true}
								bind:value={$form.companyName}
								constraints={$constraints.companyName}
								errors={$errors.companyName}
								disabled={$submitting}
								autofocus={true}
							/>
						{/if}
						
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
						
						<div class="text-sm text-gray-600">
							* Either phone number or email address must be provided
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
							text={$submitting ? "Saving..." : "Save"}
							type="submit"
							buttonStyle={ButtonStyle.PRIMARY}
							disabled={!isTainted($tainted) || $submitting}
						/>
					</div>
					</form>
				{/snippet}
			</Panel>
			
		</div>
	</div>
{/if} 