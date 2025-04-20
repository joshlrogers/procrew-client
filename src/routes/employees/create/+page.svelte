<script lang="ts">
	import { EmployeeSchema } from '$lib/shared/models/employee';
	import { superForm } from 'sveltekit-superforms/client';
	import { DateUtils } from '$lib/utils';
	import { EthnicityOptions, GenderOptions, MaritalStatusOptions } from '$lib/shared/models/options';
	import { Button, ButtonStyle } from '$lib/components/buttons/button';
	import { DateInput, MaskedTextInput, TextInput } from '$lib/components/inputs';
	import { Section } from '$lib/components/section';
	import { AddressForm } from '$lib/components/addressForm';
	import { SelectList } from '$lib/components/selectList';
	import { zod } from 'sveltekit-superforms/adapters';
	import { Panel } from '$lib/components/panel';

	let {
		data
	} = $props();

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
		validators: zod(EmployeeSchema),
		validationMethod: 'onsubmit',
		clearOnSubmit: 'errors-and-message'
	});
</script>
<div class="flex flex-col gap-4 items-center">

	<Panel class="w-[75%]">
		{#snippet header()}
			<h1>Create new employee</h1>
		{/snippet}
		{#snippet content()}
			<form use:enhance action="?/createEmployee" method="POST">

				<Section title="Basic information">
					<div class="flex flex-col gap-2 w-full py-2">

						<div class="flex flex-row gap-2 w-full">
							<TextInput wrapperClass="w-1/2"
												 bind:value={$form.firstName}
												 constraints={$constraints.firstName}
												 errors={$errors.firstName}
												 label="First name"
												 autofocus
												 tabindex={1}
												 required={true} />
							<TextInput wrapperClass="w-1/2"
												 bind:value={$form.lastName}
												 constraints={$constraints.lastName}
												 errors={$errors.lastName}
												 label="Last name"
												 tabindex={2}
												 required={true} />
						</div>

						<div class="flex flex-row gap-2 w-full">
							<MaskedTextInput wrapperClass="w-1/2"
															 bind:value={$form.phoneNumber}
															 constraints={$constraints.phoneNumber}
															 errors={$errors.phoneNumber}
															 maskType="Phone"
															 label="Phone number"
															 tabindex={3} />
							<TextInput wrapperClass="w-1/2"
												 bind:value={$form.emailAddress}
												 constraints={$constraints.emailAddress}
												 errors={$errors.emailAddress}
												 label="Email address"
												 tabindex={4} />
						</div>
						<div class="flex flex-row w-full">
							<div class="w-1/2 mr-2">
								<DateInput label="Hire date"
													 required={true}
													 startingTabIndex={5}
													 dateValue={DateUtils.toDateTime($form.hireDate)}
													 errors={$errors.hireDate}
													 onDateChange={(val) => $form.hireDate = DateUtils.toDate(val) }
								/>
							</div>
						</div>

						{#await data.countries then countries}
							{#await data.states then states}
								<AddressForm name="address"
														 {countries}
														 {states}
														 formConstraints={constraints}
														 formData={form}
														 startingTabIndex={6}
														 formErrors={errors} />
							{/await}
						{/await}
					</div>
				</Section>

				<Section title="Demographics">
					<div class="flex flex-col gap-2 w-full py-2">
						<div class="flex flex-row w-full">
							<div class="w-1/2 mr-2">
								<DateInput label="Date of birth"
													 required={true}
													 startingTabIndex={13}
													 dateValue={DateUtils.toDateTime($form.demographics.dateOfBirth)}
													 errors={$errors.demographics?.dateOfBirth}
													 onDateChange={(val) => $form.demographics.dateOfBirth = DateUtils.toDate(val) }
								/>
							</div>
							<div class="w-1/2">
								<SelectList label="Gender"
														placeholder="Gender"
														required={false}
														value={GenderOptions.filter(go => go.value === $form.demographics.gender)?.[0]?.value}
														onchanged={(val) => $form.demographics.gender = GenderOptions.filter(go=>go.value === val)?.[0]?.value}
														tabindex={18}
														items={GenderOptions} />
							</div>
						</div>
						<div class="flex flex-row w-full">
							<div class="w-1/2 mr-2">
								<SelectList label="Ethnicity"
														placeholder="Ethnicity"
														required={false}
														tabindex={19}
														value={EthnicityOptions.filter(go=>go.value === $form.demographics.ethnicity)?.[0]?.value}
														onchanged={(val) => $form.demographics.ethnicity = EthnicityOptions.filter(go=>go.value === val)?.[0]?.value}
														items={EthnicityOptions} />
							</div>
							<div class="w-1/2">
								<SelectList label="Marital status"
														required={false}
														tabindex={20}
														value={MaritalStatusOptions.filter(go=>go.value === $form.demographics.maritalStatus)?.[0]?.value}
														onchanged={(val) => $form.demographics.maritalStatus = MaritalStatusOptions.filter(go=>go.value === val)?.[0]?.value}
														items={MaritalStatusOptions} />
							</div>
						</div>
					</div>
				</Section>

				<Section title="Additional information">
					<div class="flex flex-row w-full p-2">
						<div class="w-1/2 mr-2">
							<TextInput label="Emergency contact name" tabindex={21} />
						</div>
						<div class="w-1/2">
							<MaskedTextInput maskType="Phone"
															 label="Emergency contact number"
															 tabindex={22} />
						</div>
					</div>
				</Section>

				<div class="flex flex-row-reverse w-full px-4">
					<Button text="Create"
									buttonStyle={ButtonStyle.PRIMARY}
									disabled={!isTainted($tainted) || $submitting}
									type="submit" />
				</div>
			</form>
		{/snippet}
	</Panel>
</div>