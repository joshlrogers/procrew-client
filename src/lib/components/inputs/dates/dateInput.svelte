<script lang="ts">
	import { createDatePicker, melt } from '@melt-ui/svelte';
	import {
		type AnyCalendarDate,
		ZonedDateTime
	} from '@internationalized/date';
	import { Icon, MaterialIcon } from '$lib/components/icon';

	interface DateInputProps {
		errors?: any;
		label?: string;
		dateValue?: ZonedDateTime | CalendarDate;
		onDateChange?: (date?: AnyCalendarDate) => void;
		required?: boolean;
		startingTabIndex?: number;
		wrapperClass?: string;
	}

	let {
		errors = undefined,
		label: labelText = undefined,
		dateValue = undefined,
		onDateChange = undefined,
		required = false,
		startingTabIndex = undefined,
		wrapperClass:extWrapperClass = undefined
	}: DateInputProps = $props();

	let wrapperClass = $derived(extWrapperClass);

	const {
		elements: {
			calendar,
			cell,
			content,
			field,
			grid,
			heading,
			label,
			nextButton,
			prevButton,
			segment,
			trigger
		},
		states: { months, headingValue, weekdays, segmentContents, open },
		helpers: { isDateDisabled, isDateUnavailable }
	} = createDatePicker({

		forceVisible: true,
		defaultValue: dateValue,
		onValueChange: ({ next }) => {

			onDateChange?.(next);
			$open = false;
			return next;
		}
	});

	function getTabIndex(part: string) {
		return startingTabIndex && part !== 'literal' ? startingTabIndex + (part === 'month' ? 0 : part === 'day' ? 1 : 2) : undefined;
	}
</script>

<style lang="postcss">
    @import './dateStyles.css';
</style>
<div class={wrapperClass}>
	<div class="flex w-full flex-col gap-6">
		<div>
			{#if labelText}
				<label use:melt={$label} class="label">
				<span class="block mb-2 label-text">{ labelText }
					{#if required}
						<span class="text-error-200-800 ml-1">*</span>
					{/if}
				</span>
				</label>
			{/if}
			<div use:melt={$field}>
				{#each $segmentContents as seg, i}
					<div use:melt={$segment(seg.part)} tabindex={getTabIndex(seg.part)}>
						{seg.value}
					</div>
				{/each}
				<div>
					<button type="button" use:melt={$trigger}>
						<Icon icon={MaterialIcon.EVENT} />
					</button>
				</div>
			</div>
		</div>
		{#if errors}
			<div class="uppercase text-xs leading-1 tracking-tighter text-coral-red-700 px-1">
				{errors}
			</div>
		{/if}
		{#if $open}
			<div
				use:melt={$content}
			>
				<div use:melt={$calendar}>
					<header>
						<button use:melt={$prevButton}>
							<Icon icon={MaterialIcon.KEYBOARD_DOUBLE_ARROW_LEFT} />
						</button>
						<div use:melt={$heading}>
							{$headingValue}
						</div>
						<button use:melt={$nextButton}>
							<Icon icon={MaterialIcon.KEYBOARD_DOUBLE_ARROW_RIGHT} />
						</button>
					</header>
					<div>
						{#each $months as month}
							<table use:melt={$grid}>
								<thead aria-hidden="true">
								<tr>
									{#each $weekdays as day}
										<th>
											<div>
												{day}
											</div>
										</th>
									{/each}
								</tr>
								</thead>
								<tbody>
								{#each month.weeks as weekDates}
									<tr>
										{#each weekDates as date}
											<td
												role="gridcell"
												aria-disabled={$isDateDisabled(date) ||
                          $isDateUnavailable(date)}
											>
												<div use:melt={$cell(date, month.value)}>
													{date.day}
												</div>
											</td>
										{/each}
									</tr>
								{/each}
								</tbody>
							</table>
						{/each}
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>