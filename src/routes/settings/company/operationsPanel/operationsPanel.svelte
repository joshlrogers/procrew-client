<script lang="ts">
	import { getContext } from 'svelte';
	import type { ToastContext } from '@skeletonlabs/skeleton-svelte';
	import { defaults, superForm } from 'sveltekit-superforms/client';
	import { zod } from 'sveltekit-superforms/adapters';

	import { Button } from '$lib/components/buttons/button';
	import { type BusinessHours, BusinessHoursSchema } from '$lib/shared/models/company';

	import BusinessHoursRow from './businessHoursRow.svelte';

	const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	const toast: ToastContext = getContext('toast');

	let {
		company = $bindable()
	} = $props();

	let {
		form,
		errors,
		enhance,
		reset,
		submitting,
		tainted,
		isTainted
	} = superForm<BusinessHours>(defaults(company.businessHours, zod(BusinessHoursSchema)), {
		dataType: 'json',
		clearOnSubmit: 'errors-and-message',
		multipleSubmits: 'prevent',
		resetForm: false,
		validationMethod: 'oninput',
		validators: zod(BusinessHoursSchema),
		invalidateAll: false,
		onUpdated: (event) => {
			if (event.form.valid) {
				reset({ data: event.form.data, newState: event.form.data });

				toast.create({
					type: 'success',
					title: 'Success!',
					description: `Updated company's business hours.`,
					duration: 10000
				});
			}
		}
	});

	let operationalDays: Record<string, { enabled: boolean, start?: string | null, end?: string | null }> = $state(
		{
			'Sunday': {
				'enabled': Boolean($form.sundayStart) || Boolean($form.sundayEnd),
				'start': $form.sundayStart,
				'end': $form.sundayEnd
			},
			'Monday': {
				'enabled': Boolean($form.mondayStart) || Boolean($form.mondayEnd),
				'start': $form.mondayStart,
				'end': $form.mondayEnd
			},
			'Tuesday': {
				'enabled': Boolean($form.tuesdayStart) || Boolean($form.tuesdayEnd),
				'start': $form.tuesdayStart,
				'end': $form.tuesdayEnd
			},
			'Wednesday': {
				'enabled': Boolean($form.wednesdayStart) || Boolean($form.wednesdayEnd),
				'start': $form.wednesdayStart,
				'end': $form.wednesdayEnd
			},
			'Thursday': {
				'enabled': Boolean($form.thursdayStart) || Boolean($form.thursdayEnd),
				'start': $form.thursdayStart,
				'end': $form.thursdayEnd
			},
			'Friday': {
				'enabled': Boolean($form.fridayStart) || Boolean($form.fridayEnd),
				'start': $form.fridayStart,
				'end': $form.fridayEnd
			},
			'Saturday': {
				'enabled': Boolean($form.saturdayStart) || Boolean($form.saturdayEnd),
				'start': $form.saturdayStart,
				'end': $form.saturdayEnd
			}
		}
	);

	const setTime = (day: string, start?: string | null, end?: string | null) => {
		switch (day) {
			case 'Sunday':
				$form.sundayStart = operationalDays[day].start = start;
				$form.sundayEnd = operationalDays[day].end = end;
				break;
			case 'Monday':
				$form.mondayStart = operationalDays[day].start = start;
				$form.mondayEnd = operationalDays[day].end = end;
				break;
			case 'Tuesday':
				$form.tuesdayStart = operationalDays[day].start = start;
				$form.tuesdayEnd = operationalDays[day].end = end;
				break;
			case 'Wednesday':
				$form.wednesdayStart = operationalDays[day].start = start;
				$form.wednesdayEnd = operationalDays[day].end = end;
				break;
			case 'Thursday':
				$form.thursdayStart = operationalDays[day].start = start;
				$form.thursdayEnd = operationalDays[day].end = end;
				break;
			case 'Friday':
				$form.fridayStart = operationalDays[day].start = start;
				$form.fridayEnd = operationalDays[day].end = end;
				break;
			case 'Saturday':
				$form.saturdayStart = operationalDays[day].start = start;
				$form.saturdayEnd = operationalDays[day].end = end;
				break;
		}
	};

	const getError = (day: string) => {
		if (!$errors) {
			return null;
		}


		let startTime = $errors[`${day.toLowerCase()}Start` as keyof typeof $errors] as Record<string, string[]> | undefined;
		if (startTime) {
			return startTime?.[0];
		}

		let endTime = $errors[`${day.toLowerCase()}End` as keyof typeof $errors] as Record<string, string[]> | undefined;
		if (endTime) {
			return endTime?.[0];
		}
	};

</script>

<div class="flex flex-col items-center gap-4">

	<form method="POST" action="?/updateBusinessHours" use:enhance>
		<div class="flex flex-col gap-2 p-4 items-center">
			{#each days as day}
				<BusinessHoursRow start={operationalDays[day].start}
													end={operationalDays[day].end}
													onBusinessHoursChange={setTime}
													errors={getError(day)}
													{day} />
			{/each}
		</div>

		<div class="mt-4 flex justify-end">
			<Button
				disabled={!isTainted($tainted) || $submitting}
				text="Save"
				type="submit" />
		</div>
	</form>
</div>