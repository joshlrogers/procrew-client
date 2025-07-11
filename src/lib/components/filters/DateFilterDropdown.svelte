<script lang="ts">
	import { createSelect, melt } from '@melt-ui/svelte';
	import { fade } from 'svelte/transition';
	import { Icon } from '$lib/components/icon/index.js';
	import { MaterialIcon } from '$lib/components/icon';
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	interface DateFilterOption {
		value: string;
		label: string;
		icon?: string;
	}

	interface DateFilterProps extends HTMLAttributes<HTMLButtonElement> {
		value?: string;
		onchanged?: (val: string | undefined) => void;
		wrapperClass?: string;
		height?: string;
		minWidth?: string;
		showLabel?: boolean;
		label?: string;
	}

	let {
		value = 'all',
		onchanged = undefined,
		wrapperClass = undefined,
		height = 'h-10',
		minWidth = 'min-w-[140px]',
		showLabel = true,
		label = 'Date Created',
		...otherProps
	}: DateFilterProps = $props();

	const dateFilterOptions: DateFilterOption[] = [
		{ value: 'all', label: 'All Time', icon: MaterialIcon.CALENDAR_TODAY },
		{ value: 'today', label: 'Today', icon: MaterialIcon.TODAY },
		{ value: 'thisweek', label: 'This Week', icon: MaterialIcon.DATE_RANGE },
		{ value: 'thismonth', label: 'This Month', icon: MaterialIcon.CALENDAR_MONTH }
	];

	// Helper function to find option by value
	const findOptionByValue = (val: string | undefined) => {
		if (val === undefined) return dateFilterOptions[0]; // Default to 'All Time'
		return dateFilterOptions.find((option) => option.value === val) || dateFilterOptions[0];
	};

	const {
		elements: { trigger, menu, option },
		states: { open, selectedLabel, selected }
	} = createSelect<string>({
		defaultSelected: findOptionByValue(value),
		forceVisible: true,
		onSelectedChange: ({ curr, next }) => {
			if (curr?.value !== next?.value && next?.value !== undefined) {
				onchanged?.(next.value);
			}
			return next;
		},
		positioning: {
			placement: 'bottom',
			fitViewport: false,
			sameWidth: true
		}
	});

	let buttonClass = cn(
		'select-list input',
		'flex items-center justify-between rounded-lg px-3 py-2 shadow',
		'bg-surface-100-800 text-surface-900-50',
		height,
		minWidth
	);

	let listClass = cn(
		'select-list-contents z-100 flex flex-col overflow-y-auto rounded-lg p-1 shadow focus:!ring-0',
		'max-h-48 bg-surface-100-800 text-surface-900-50'
	);

	let listItemClass = cn(
		'relative cursor-pointer rounded-lg py-2 pl-4 pr-4 focus:z-100 ' +
			'data-[highlighted]:bg-primary-500 data-[highlighted]:font-bold data-[disabled]:opacity-50 ' +
			'flex flex-row gap-2 items-center'
	);

	let labelClass = cn('block mb-2 text-sm font-medium label');

	let selectedOption = $derived(() => findOptionByValue(value));

	// Update selected when value prop changes
	$effect(() => {
		$selected = findOptionByValue(value);
	});

	// Check if filter is active (not 'all')
	let isActive = $derived(value !== 'all');
</script>

<div class={wrapperClass}>
	{#if showLabel}
		<label class={labelClass}>
			<span class="label-text">
				{label}
				{#if isActive}
					<span class="ml-1 text-xs text-primary-500 font-semibold">•</span>
				{/if}
			</span>
		</label>
	{/if}

	<button class={buttonClass} use:melt={$trigger} {...otherProps}>
		{#if selectedOption?.icon}
			<Icon icon={selectedOption.icon} class="mr-2 text-surface-600-300" />
		{/if}
		<span class={cn('flex-1 text-left', isActive && 'font-medium text-primary-600-300')}>
			{$selectedLabel}
		</span>
		<Icon icon={MaterialIcon.ARROW_DROP_DOWN} class="ml-2 text-surface-600-300" />
	</button>

	{#if $open}
		<div class={listClass} use:melt={$menu} transition:fade={{ duration: 150 }}>
			{#each dateFilterOptions as option}
				<div class={listItemClass} use:melt={option(option)}>
					{#if option.icon}
						<Icon icon={option.icon} class="text-surface-600-300" />
					{/if}
					{option.label}
				</div>
			{/each}
		</div>
	{/if}
</div>