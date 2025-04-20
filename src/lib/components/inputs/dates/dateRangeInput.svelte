<script lang="ts">
	import { createDateRangePicker, type DateRange } from '@melt-ui/svelte';
	import { melt } from '@melt-ui/svelte';
	import { Icon, MaterialIcon } from '$lib/components/icon';
	import type { InputConstraint } from 'sveltekit-superforms';

	interface DateRangeProps {
		constraints?: InputConstraint;
		errors?: any;
		label?: string;
		labelClass?: string;
		rangeValue?: DateRange;
		onRangeChange?: ((value: DateRange) => void);
	}

	let {
		label: labelText,
		rangeValue = undefined,
		onRangeChange = undefined,
		...otherProps
	}: DateRangeProps = $props();

	const {
		elements: {
			calendar,
			heading,
			grid,
			cell,
			field,
			prevButton,
			nextButton,
			endSegment,
			startSegment,
			trigger,
			content,
			label
		},
		states: { months, headingValue, weekdays, segmentContents, open, value },
		helpers: { isDateDisabled, isDateUnavailable }
	} = createDateRangePicker({
		forceVisible: true,
		defaultValue: { start: rangeValue?.start, end: rangeValue?.end },
		onValueChange: ({ next }) => {
			onRangeChange?.(next);
			$open = !(next.start && next.end);
			return next;
		}
	});
</script>

<style lang="postcss">
    @import './dateStyles.css';
</style>

<div class="flex w-full flex-col items-center gap-3">
	<div>
		{#if labelText}
			<span use:melt={$label}>{labelText}</span>
		{/if}
		<div use:melt={$field}>
			{#each $segmentContents.start as seg}
				<div use:melt={$startSegment(seg.part)}>
					{seg.value}
				</div>
			{/each}
			<div aria-hidden="true">-</div>
			{#each $segmentContents.end as seg}
				<div use:melt={$endSegment(seg.part)}>
					{seg.value}
				</div>
			{/each}
			<div class="ml-2">
				<button use:melt={$trigger}>
					<Icon icon={MaterialIcon.DATE_RANGE} />
				</button>
			</div>
		</div>
	</div>

	{#if $open}
		<div use:melt={$content}>
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
				{#each $months as month}
					<table use:melt={$grid}>
						<thead aria-hidden="true">
						<tr>
							{#each $weekdays as day}
								<th>
									{day}
								</th>
							{/each}
						</tr>
						</thead>
						<tbody>
						{#each month.weeks as days}
							<tr>
								{#each days as date}
									<td role="gridcell"
											aria-disabled={$isDateDisabled(date) || $isDateUnavailable(date)}>
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
	{/if}
</div>
