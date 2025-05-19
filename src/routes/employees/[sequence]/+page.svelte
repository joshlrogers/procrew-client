<script lang="ts">

	import { superForm } from 'sveltekit-superforms/client';
	import { zod } from 'sveltekit-superforms/adapters';
	import { EmployeeSchema } from '$lib/shared/models/employee';
	import { DateInput, MaskedTextInput, TextInput } from '$lib/components/inputs';
	import { Panel } from '$lib/components/panel';
	import { Section } from '$lib/components/section';
	import { DateUtils } from '$lib/utils';
	import { SelectList } from '$lib/components/selectList';
	import {
		EthnicityOptions,
		GenderOptions,
		MaritalStatusOptions,
		type SelectListOption
	} from '$lib/shared/models/options';
	import { AddressForm } from '$lib/components/addressForm';
	import { Button, ButtonStyle } from '$lib/components/buttons/button';
	import { Breadcrumb } from '$lib/components/breadcrumb';

	let {
		data
	} = $props();

	let departmentOptions: SelectListOption[] = $derived(data.departments?.map(d => ({
		label: d.name,
		value: d.id
	})) ?? []);

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
	<div class="w-[75%] flex content-start mb-[-1rem] pl-4	">
		<Breadcrumb items={[
		{ label: 'Home', url: '/' },
		{ label: 'Employees', url: '/employees' },
		{ label: 'Edit employee', url: `${$form.sequence}` }
	]} />
	</div>
	<Panel class="w-[75%]">
		{#snippet header()}
			Edit employee {$form.firstName} {$form.lastName} (<span
			class="px-0.5 slashed-zero proportional-nums"># {Intl.NumberFormat('en-US', { minimumIntegerDigits: 3 }).format($form.sequence ?? 0)}</span>)
		{/snippet}
		{#snippet content()}
			<form use:enhance method="POST" action="?/updateEmployee">
				<Section title="Basic information">
					<div class="flex flex-col gap-2 w-full py-2">

						<div class="flex flex-row gap-2 w-full">
							<TextInput
								wrapperClass="w-1/2"
								constraints={$constraints.firstName}
								errors={$errors.firstName}
								bind:value={$form.firstName}
								tabindex={1}
								label="First name" />
							<TextInput
								wrapperClass="w-1/2"
								constraints={$constraints.lastName}
								errors={$errors.lastName}
								bind:value={$form.lastName}
								tabindex={2}
								label="Last name" />
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

						<div class="flex flex-row gap-2 w-full">
							<DateInput wrapperClass="w-1/2"
												 label="Hire date"
												 required={true}
												 startingTabIndex={5}
												 dateValue={DateUtils.toCalendarDate($form.hireDate)}
												 errors={$errors.hireDate}
												 onDateChange={(val) => $form.hireDate = DateUtils.toDate(val) } />

							<SelectList wrapperClass="w-1/2"
													label="Department"
													placeholder="Department"
													required={true}
													tabindex={6}
													value={departmentOptions.filter(d => d.value === $form.departmentId)?.[0]?.value}
													onchanged={(val) => $form.departmentId = departmentOptions.filter(d=>d.value === val)?.[0]?.value}
													items={departmentOptions} />
						</div>

						{#await data.countries then countries}
							{#await data.states then states}
								<AddressForm name="address"
														 {countries}
														 {states}
														 formConstraints={constraints}
														 formData={form}
														 startingTabIndex={7}
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
													 dateValue={DateUtils.toCalendarDate($form.demographics.dateOfBirth)}
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

				<div class="flex flex-row-reverse w-full px-4">
					<Button text="Update"
									buttonStyle={ButtonStyle.PRIMARY}
									disabled={!isTainted($tainted) || $submitting}
									type="submit" />
				</div>
			</form>
		{/snippet}
	</Panel>
</div>