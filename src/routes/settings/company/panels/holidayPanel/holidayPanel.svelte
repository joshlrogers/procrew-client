<script lang="ts">
	import { page } from '$app/state';
	import { type Company, CompanyHolidaysSchema, type Holiday, type Holidays } from '$lib/shared/models/company';
	import { Panel } from '$lib/components/panel';
	import { Checkbox, TextInput } from '$lib/components/inputs';
	import { onMount } from 'svelte';
	import { getDate, getMonth, parse } from 'date-fns';
	import { Button } from '$lib/components/buttons/button/index.js';
	import { superForm } from 'sveltekit-superforms';
	import { defaults } from 'sveltekit-superforms/client';
	import { zod } from 'sveltekit-superforms/adapters';
	import toast from 'svelte-french-toast';

	interface HolidayPanelProps {
		company?: Company;
	}

	let {
		company
	}: HolidayPanelProps = $props();

	let federalHolidays = $state<Holiday[]>([]);
	let companyHolidays = $state<Holiday[]>([]);
	let newCompanyHoliday = $state('');
	let newCompanyHolidayName = $state('');

	let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	let daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

	let {
		enhance,
		form,
		reset,
		isTainted,
		tainted,
		delayed
	} = superForm<Holidays>(defaults({ holidays: [] }, zod(CompanyHolidaysSchema)), {
		dataType: 'json',
		clearOnSubmit: 'errors-and-message',
		multipleSubmits: 'prevent',
		resetForm: false,
		validators: zod(CompanyHolidaysSchema),
		invalidateAll: false,
		onUpdated: (event) => {
			if (event.form.valid) {
				companyHolidays = [];
				let holidays = event.form.data.holidays;
				applyHolidays(holidays);
				toast.success(`Updated company's holidays.`);
			}
		}
	});

	onMount(async () => {
		const currentHolidays = await page.data.holidays as Holiday[];
		federalHolidays = await page.data.federalHolidays as Holiday[];
		applyHolidays(currentHolidays);
	});

	function addNumberSuffix(number?: number | null) {
		if (!number) {
			return;
		}

		if (number < 4) {
			if (number.toString().endsWith('1')) {
				return number + 'st';
			} else if (number.toString().endsWith('2')) {
				return number + 'nd';
			} else if (number.toString().endsWith('3')) {
				return number + 'rd';
			}
		} else {
			return number + 'th';
		}
	}

	function addHoliday() {
		let date = parse(newCompanyHoliday, 'yyyy-MM-dd', new Date());

		let companyHoliday = {
			month: getMonth(date) + 1,
			day: getDate(date),
			week: null,
			dayOfWeek: null,
			country: company?.address.country,
			name: newCompanyHolidayName
		};

		let exists = $form.holidays.findIndex(sh => sh.day === companyHoliday.day && sh.month === companyHoliday.month) !== -1;
		let isCompanyHoliday = companyHolidays.findIndex(sh => sh.day === companyHoliday.day && sh.month === companyHoliday.month) !== -1;
		let isFederalHoliday = federalHolidays.findIndex(sh => sh.day === companyHoliday.day && sh.month === companyHoliday.month) !== -1;

		if (!exists) {
			form.set({ holidays: [...$form.holidays, companyHoliday] });
			if (!isCompanyHoliday && !isFederalHoliday) {
				companyHolidays.push(companyHoliday);
			}
			newCompanyHolidayName = '';
			newCompanyHoliday = '';
		}
	}

	function applyHolidays(currentHolidays: Holiday[]) {
		let selectedHolidays = [];
		for (let ix = 0; ix < currentHolidays.length; ix++) {
			let fedHolidayIndex = federalHolidays.findIndex(fh =>
				fh.day === currentHolidays[ix].day &&
				fh.dayOfWeek === currentHolidays[ix].dayOfWeek &&
				fh.month === currentHolidays[ix].month &&
				fh.week === currentHolidays[ix].week);

			if (fedHolidayIndex === -1) {
				companyHolidays.push(currentHolidays[ix]);
			}

			selectedHolidays.push(currentHolidays[ix]);
		}

		reset({ data: { holidays: selectedHolidays }, newState: { holidays: selectedHolidays } });
	}

	function getHolidayName(holiday: Holiday) {
		const isDynamic = !holiday.day && holiday.dayOfWeek;
		const preamble = isDynamic ? `${addNumberSuffix(holiday.week)} ${holiday.dayOfWeek ? daysOfWeek[holiday.dayOfWeek] : ''} of ` : '';
		const postamble = isDynamic ? '' : ` ${addNumberSuffix(holiday.day)}`;

		return `${holiday.name} (${preamble}${months[holiday.month - 1]}${postamble})`;
	}

	function holidayChanged(holiday: Holiday, value: boolean) {
		if (value) {
			form.set({ holidays: [...$form.holidays, holiday] });
		} else {
			form.set({
				holidays: $form.holidays.filter(sh =>
					!(
						sh.day === holiday.day &&
						sh.dayOfWeek === holiday.dayOfWeek &&
						sh.month === holiday.month &&
						sh.week === holiday.week
					)
				)
			});
		}
	}

	function isSelected(holiday: Holiday) {
		if (!$form.holidays || $form.holidays.length === 0) return false;

		return $form.holidays.findIndex(sh =>
			sh.day === holiday.day &&
			sh.dayOfWeek === holiday.dayOfWeek &&
			sh.month === holiday.month &&
			sh.week === holiday.week) !== -1;
	}
</script>

<form method="POST" action="?/updateHolidays" use:enhance>
	<div class="flex flex-col w-full gap-4 items-center px-4">

		<Panel title="Federal holidays"
					 class="w-full">
			{#snippet header()}
				Federal holidays
			{/snippet}
			{#snippet content()}
				<div class="flex md:flex-wrap flex-col md:max-h-96 md:content-center">
					{#await page.data.federalHolidays then holidays}
						{#each holidays as holiday}
							<Checkbox labelPosition="left"
												labelClass="w-[20rem]"
												wrapperClass="flex my-4"
												label={getHolidayName(holiday)}
												checked={isSelected(holiday)}
												onCheckedChange={(checked) => holidayChanged(holiday, checked)} />
						{/each}
					{/await}
				</div>
			{/snippet}
		</Panel>

		<Panel title="Company holidays"
					 class="w-full">
			{#snippet header()}
				Company holidays
			{/snippet}
			{#snippet content()}
				<div class="flex flex-row gap-2 items-center">
					<TextInput placeholder="Holiday name"
										 value={newCompanyHolidayName}
										 oninput={(event) => newCompanyHolidayName = event.currentTarget.value}
										 required />
					<input class="input max-w-40"
								 type="date"
								 oninput={(event) => newCompanyHoliday = event.currentTarget.value}
								 value={newCompanyHoliday} />
					<button class="btn preset-filled-primary-100-900"
									disabled={!newCompanyHolidayName || !newCompanyHoliday}
									onclick={addHoliday}>Add
					</button>
				</div>
				<div class="flex flex-wrap flex-col max-h-96 mt-2 items-center">
					{#each companyHolidays as holiday}
						<Checkbox label={getHolidayName(holiday)}
											checked={isSelected(holiday)}
											labelPosition="left"
											labelClass="w-[20rem]"
											wrapperClass="flex my-4"
											onCheckedChange={(checked) => holidayChanged(holiday, checked)} />
					{/each}
				</div>
				<div class="flex justify-end mt-2">
					<Button type="submit" text="Save" disabled={!isTainted($tainted)} />
				</div>
			{/snippet}
		</Panel>

	</div>
</form>
