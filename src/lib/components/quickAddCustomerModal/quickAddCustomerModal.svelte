<script lang="ts">
	import { createDialog, melt } from '@melt-ui/svelte';
	import { fade } from 'svelte/transition';
	import { TextInput } from '$lib/components/inputs';
	import { Button } from '$lib/components/buttons/button';
	import { ButtonStyle } from '$lib/components/buttons/button';
	import { cn } from '$lib/utils';
	import { goto } from '$app/navigation';
	import type { QuickAddCustomer } from '$lib/shared/models/customer';
	import { CustomerType } from '$lib/shared/models/customer';

	interface QuickAddCustomerModalProps {
		open?: boolean;
		onClose?: () => void;
		onSave?: (customer: QuickAddCustomer) => Promise<string | null>; // Returns customer ID on success, null on error
	}

	let {
		open: isOpen = false,
		onClose = () => {},
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

	let customer: QuickAddCustomer = $state({
		customerType: CustomerType.RESIDENTIAL,
		firstName: '',
		lastName: '',
		companyName: '',
		phoneNumber: '',
		email: ''
	});

	let errors: Record<string, string> = $state({});
	let isSubmitting = $state(false);

	const validateForm = (): boolean => {
		errors = {};
		
		// Validate based on customer type
		if (customer.customerType === CustomerType.RESIDENTIAL) {
			if (!customer.firstName?.trim()) {
				errors.firstName = 'First name is required for residential customers.';
			}
			if (!customer.lastName?.trim()) {
				errors.lastName = 'Last name is required for residential customers.';
			}
		} else if (customer.customerType === CustomerType.COMMERCIAL) {
			if (!customer.companyName?.trim()) {
				errors.companyName = 'Company name is required for commercial customers.';
			}
		}
		
		if (customer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
			errors.email = 'Invalid email address.';
		}
		
		if (!customer.phoneNumber?.trim() && !customer.email?.trim()) {
			errors.phoneNumber = 'Either phone number or email address must be provided.';
		}
		
		return Object.keys(errors).length === 0;
	};

	const handleSave = async () => {
		if (!validateForm()) {
			return;
		}

		isSubmitting = true;
		try {
			const customerId = await onSave(customer);
			if (customerId) {
				// Navigate to customer edit screen
				await goto(`/customers/${customerId}`);
			}
		} catch (error) {
			console.error('Error saving customer:', error);
		} finally {
			isSubmitting = false;
		}
	};

	const handleCancel = () => {
		customer = {
			customerType: CustomerType.RESIDENTIAL,
			firstName: '',
			lastName: '',
			companyName: '',
			phoneNumber: '',
			email: ''
		};
		errors = {};
		onClose();
	};

	const handleCustomerTypeChange = (type: CustomerType) => {
		customer.customerType = type;
		// Clear validation errors when switching types
		errors = {};
	};

	$effect(() => {
		$open = isOpen;
	});

	let titleClasses = cn('min-h-10', 'rounded-t-xl', 'p-4', 'text-lg', 'font-semibold', 'bg-regent-gray-500', 'text-regent-gray-950');
	let footerClasses = cn('min-h-10', 'rounded-b-xl', 'p-4', 'flex', 'justify-end', 'gap-2', 'bg-regent-gray-100');
</script>

{#if $open}
	<div use:melt={$portalled}>
		<div
			use:melt={$overlay}
			class="fixed inset-0 z-50 bg-black/50"
			transition:fade={{ duration: 150 }}
		></div>
		<div class="fixed left-1/2 top-1/2 z-50 max-w-[90vw] min-w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white shadow-lg"
				 use:melt={$content}>
			<div class={titleClasses}>
				Quick Add Customer
			</div>

			<div class="p-6 space-y-4">
				<!-- Customer Type Selection -->
				<div>
					<label class="block mb-2 label">
						<span class="label-text">Customer Type</span>
					</label>
					<div class="flex gap-4">
						<label class="flex items-center cursor-pointer">
							<input
								type="radio"
								name="customerType"
								value={CustomerType.RESIDENTIAL}
								checked={customer.customerType === CustomerType.RESIDENTIAL}
								onchange={() => handleCustomerTypeChange(CustomerType.RESIDENTIAL)}
								disabled={isSubmitting}
								class="radio radio-primary mr-2"
							/>
							<span class="text-sm">Residential</span>
						</label>
						<label class="flex items-center cursor-pointer">
							<input
								type="radio"
								name="customerType"
								value={CustomerType.COMMERCIAL}
								checked={customer.customerType === CustomerType.COMMERCIAL}
								onchange={() => handleCustomerTypeChange(CustomerType.COMMERCIAL)}
								disabled={isSubmitting}
								class="radio radio-primary mr-2"
							/>
							<span class="text-sm">Commercial</span>
						</label>
					</div>
				</div>

				<!-- Conditional Fields Based on Customer Type -->
				{#if customer.customerType === CustomerType.RESIDENTIAL}
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<TextInput
							label="First Name"
							required={true}
							bind:value={customer.firstName}
							errors={errors.firstName}
							disabled={isSubmitting}
						/>
						<TextInput
							label="Last Name"
							required={true}
							bind:value={customer.lastName}
							errors={errors.lastName}
							disabled={isSubmitting}
						/>
					</div>
				{:else if customer.customerType === CustomerType.COMMERCIAL}
					<TextInput
						label="Company Name"
						required={true}
						bind:value={customer.companyName}
						errors={errors.companyName}
						disabled={isSubmitting}
					/>
				{/if}
				
				<TextInput
					label="Phone Number"
					type="tel"
					bind:value={customer.phoneNumber}
					errors={errors.phoneNumber}
					disabled={isSubmitting}
				/>
				
				<TextInput
					label="Email Address"
					type="email"
					bind:value={customer.email}
					errors={errors.email}
					disabled={isSubmitting}
				/>
				
				<div class="text-sm text-gray-600">
					* Either phone number or email address must be provided
				</div>
			</div>

			<div class={footerClasses}>
				<Button
					text="Cancel"
					buttonStyle={ButtonStyle.SECONDARY}
					disabled={isSubmitting}
					onclick={handleCancel}
				/>
				<Button
					text={isSubmitting ? "Saving..." : "Save"}
					buttonStyle={ButtonStyle.PRIMARY}
					disabled={isSubmitting}
					onclick={handleSave}
				/>
			</div>
		</div>
	</div>
{/if} 