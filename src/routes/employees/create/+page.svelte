<script lang="ts">
	import { EmployeeFormSchema } from '$lib/shared/models/employee';
	import { superForm } from 'sveltekit-superforms/client';
	import { DateUtils } from '$lib/utils';
	import {
		EthnicityOptions,
		GenderOptions,
		MaritalStatusOptions,
		type SelectListOption
	} from '$lib/shared/models/options';
	import { Button, ButtonStyle } from '$lib/components/buttons/button';
	import { Checkbox, DateInput, MaskedTextInput, TextInput } from '$lib/components/inputs';
	import { Section } from '$lib/components/section';
	import { AddressForm } from '$lib/components/addressForm';
	import { SelectList } from '$lib/components/selectList';
	import { zod } from 'sveltekit-superforms/adapters';
	import { Panel } from '$lib/components/panel';

	let { data } = $props();

	let departmentOptions: SelectListOption[] = $derived(
		data.departments?.map((d) => ({
			label: d.name,
			value: d.id
		})) ?? []
	);

	const { form, errors, enhance, constraints, isTainted, tainted, submitting } = superForm(
		data.form,
		{
			dataType: 'json',
			invalidateAll: false,
			multipleSubmits: 'prevent',
			resetForm: false,
			validators: zod(EmployeeFormSchema),
			validationMethod: 'onsubmit',
			clearOnSubmit: 'errors-and-message'
		}
	);
</script>

<div class="flex flex-col items-center gap-4">
	<Panel class="w-[75%]">
		{#snippet header()}
			<h1>Create new employee</h1>
		{/snippet}
		{#snippet content()}
			<form use:enhance action="?/createEmployee" method="POST">
				<Section title="Basic information">
					<div class="flex w-full flex-col gap-2 py-2">
						<div class="flex w-full flex-row gap-2">
							<TextInput
								wrapperClass="w-1/2"
								bind:value={$form.firstName}
								constraints={$constraints.firstName}
								errors={$errors.firstName}
								label="First name"
								autofocus
								tabindex={1}
							/>
							<TextInput
								wrapperClass="w-1/2"
								bind:value={$form.lastName}
								constraints={$constraints.lastName}
								errors={$errors.lastName}
								label="Last name"
								tabindex={2}
							/>
						</div>

						<div class="flex w-full flex-row gap-2">
							<MaskedTextInput
								wrapperClass="w-1/2"
								bind:value={$form.phoneNumber}
								constraints={$constraints.phoneNumber}
								errors={$errors.phoneNumber}
								maskType="Phone"
								label="Phone number"
								tabindex={3}
							/>
							<TextInput
								wrapperClass="w-1/2"
								bind:value={$form.emailAddress}
								constraints={$constraints.emailAddress}
								errors={$errors.emailAddress}
								label="Email address"
								tabindex={4}
							/>
						</div>
						<div class="flex w-full flex-row">
							<div class="mr-2 w-1/2">
								<DateInput
									label="Hire date"
									required={true}
									startingTabIndex={5}
									dateValue={DateUtils.toCalendarDate(
										$form.hireDate ? new Date($form.hireDate + 'T00:00:00') : null
									)}
									errors={$errors.hireDate}
									onDateChange={(val) => {

										$form.hireDate = val
											? DateUtils.toDate(val)?.toISOString().split('T')[0]
											: null;
									}}
								/>
							</div>
							<div class="w-1/2">
								<SelectList
									label="Department"
									placeholder="Department"
									required={true}
									tabindex={14}
									value={departmentOptions.filter((d) => d.value === $form.departmentId)?.[0]
										?.value}
									onchanged={(val) =>
										($form.departmentId = departmentOptions.filter(
											(d) => d.value === val
										)?.[0]?.value)}
									items={departmentOptions}
								/>
							</div>
						</div>

						<AddressForm
							name="address"
							formConstraints={constraints}
							formData={form}
							startingTabIndex={6}
							formErrors={errors}
						/>

					</div>
				</Section>

				<Section title="Demographics">
					<div class="flex w-full flex-col gap-2 py-2">
						<div class="flex w-full flex-row">
							<div class="mr-2 w-1/2">
								<DateInput
									label="Date of birth"
									required={true}
									startingTabIndex={13}
									dateValue={DateUtils.toCalendarDate(
										$form.demographics.dateOfBirth
											? new Date($form.demographics.dateOfBirth + 'T00:00:00')
											: null
									)}
									errors={$errors.demographics?.dateOfBirth}
									onDateChange={(val) => {

										$form.demographics.dateOfBirth = val
											? DateUtils.toDate(val)?.toISOString().split('T')[0]
											: null;
									}}
								/>
							</div>
							<div class="w-1/2">
								<SelectList
									label="Gender"
									placeholder="Gender"
									required={false}
									value={GenderOptions.filter((go) => go.value === $form.demographics.gender)?.[0]
										?.value}
									onchanged={(val) =>
										($form.demographics.gender = GenderOptions.filter(
											(go) => go.value === val
										)?.[0]?.value)}
									tabindex={18}
									items={GenderOptions}
								/>
							</div>
						</div>
						<div class="flex w-full flex-row">
							<div class="mr-2 w-1/2">
								<SelectList
									label="Ethnicity"
									placeholder="Ethnicity"
									required={false}
									tabindex={19}
									value={EthnicityOptions.filter(
										(go) => go.value === $form.demographics.ethnicity
									)?.[0]?.value}
									onchanged={(val) =>
										($form.demographics.ethnicity = EthnicityOptions.filter(
											(go) => go.value === val
										)?.[0]?.value)}
									items={EthnicityOptions}
								/>
							</div>
							<div class="w-1/2">
								<SelectList
									label="Marital status"
									required={false}
									tabindex={20}
									value={MaritalStatusOptions.filter(
										(go) => go.value === $form.demographics.maritalStatus
									)?.[0]?.value}
									onchanged={(val) =>
										($form.demographics.maritalStatus = MaritalStatusOptions.filter(
											(go) => go.value === val
										)?.[0]?.value)}
									items={MaritalStatusOptions}
								/>
							</div>
						</div>
					</div>
				</Section>

				<Section title="Additional information">
					<div class="flex w-full flex-col gap-2 p-2">
						<div class="flex w-full flex-row">
							<div class="mr-2 w-1/2">
								<TextInput label="Emergency contact name" tabindex={21} />
							</div>
							<div class="w-1/2">
								<MaskedTextInput maskType="Phone" label="Emergency contact number" tabindex={22} />
							</div>
						</div>
						<div class="flex w-full flex-row">
							<div class="mr-2 w-1/2">
								<TextInput
									bind:value={$form.title}
									constraints={$constraints.title}
									errors={$errors.title}
									label="Title"
									tabindex={23}
								/>
							</div>
							<div class="w-1/2">
								<Checkbox
									bind:checked={$form.isSalesPerson}
									label="Sales Person"
									tabindex={24}
								/>
							</div>
						</div>
					</div>
				</Section>

				<div class="flex w-full flex-row-reverse px-4">
					<Button
						text="Create"
						buttonStyle={ButtonStyle.PRIMARY}
						disabled={!isTainted($tainted) || $submitting}
						type="submit"
					/>
				</div>
			</form>
		{/snippet}
	</Panel>
</div>
