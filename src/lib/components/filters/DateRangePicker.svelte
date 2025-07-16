<script lang="ts">
	import { Icon, MaterialIcon } from '$lib/components/icon';
	import { DateFilterOptions } from '$lib/shared/models/options';
	import type { SelectListOption } from '$lib/shared/models/options';

	interface DateRangePickerProps {
		value?: string;
		onChanged?: (value: string) => void;
		label?: string;
		placeholder?: string;
		class?: string;
		showCustomRange?: boolean;
		customStartDate?: string;
		customEndDate?: string;
		onCustomRangeChanged?: (startDate: string, endDate: string) => void;
	}

	let {
		value = 'all',
		onChanged,
		label = 'Date Range',
		placeholder = 'Select date range',
		class: className = '',
		showCustomRange = true,
		customStartDate = '',
		customEndDate = '',
		onCustomRangeChanged
	}: DateRangePickerProps = $props();

	let isOpen = $state(false);
	let showCustomInputs = $state(false);
	let containerRef: HTMLDivElement;

	const dateOptions: SelectListOption[] = [
		...DateFilterOptions,
		...(showCustomRange ? [{ value: 'custom', label: 'Custom Range' }] : [])
	];

	const selectedOption = $derived(
		dateOptions.find(option => option.value === value) || dateOptions[0]
	);

	const handleToggle = () => {
		isOpen = !isOpen;
	};

	const handleSelect = (option: SelectListOption) => {
		if (option.value === 'custom') {
			showCustomInputs = true;
		} else {
			showCustomInputs = false;
			onChanged?.(option.value.toString());
			isOpen = false;
		}
	};

	const handleCustomRangeApply = () => {
		if (customStartDate && customEndDate) {
			onCustomRangeChanged?.(customStartDate, customEndDate);
			onChanged?.('custom');
			isOpen = false;
		}
	};

	const handleCustomRangeCancel = () => {
		showCustomInputs = false;
		if (value !== 'custom') {
			isOpen = false;
		}
	};

	const handleOutsideClick = (e: MouseEvent) => {
		if (containerRef && !containerRef.contains(e.target as Node)) {
			isOpen = false;
			showCustomInputs = false;
		}
	};

	const formatDateRange = () => {
		if (value === 'custom' && customStartDate && customEndDate) {
			const start = new Date(customStartDate).toLocaleDateString();
			const end = new Date(customEndDate).toLocaleDateString();
			return `${start} - ${end}`;
		}
		return selectedOption.label;
	};

	$effect(() => {
		if (isOpen) {
			document.addEventListener('click', handleOutsideClick);
		} else {
			document.removeEventListener('click', handleOutsideClick);
		}

		return () => {
			document.removeEventListener('click', handleOutsideClick);
		};
	});
</script>

<div class="relative {className}" bind:this={containerRef}>
	{#if label}
		<label class="text-sm font-medium text-surface-600-300 mb-1 block">
			{label}
		</label>
	{/if}

	<!-- Main Button -->
	<button
		type="button"
		class="flex items-center justify-between w-full px-3 py-2 border border-surface-300-600 rounded-lg bg-surface-50-900 hover:bg-surface-100-800 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
		onclick={handleToggle}
	>
		<div class="flex items-center gap-2 flex-1 min-w-0">
			<Icon icon={MaterialIcon.DATE_RANGE} class="w-4 text-surface-600-300 flex-shrink-0" />
			<span class="ml-2 text-sm truncate text-surface-900-100">
				{formatDateRange()}
			</span>
		</div>
		<Icon 
			icon={isOpen ? MaterialIcon.KEYBOARD_ARROW_UP : MaterialIcon.KEYBOARD_ARROW_DOWN} 
			class="w-5 h-5 text-surface-500-400 flex-shrink-0 ml-2" 
		/>
	</button>

	<!-- Dropdown -->
	{#if isOpen}
		<div class="absolute z-50 w-full mt-1 bg-white dark:bg-surface-800 border border-surface-300-600 rounded-lg shadow-lg max-h-80 overflow-hidden">
			{#if showCustomInputs}
				<!-- Custom Date Range Inputs -->
				<div class="p-4 space-y-4">
					<div class="flex items-center gap-2 mb-3">
						<button
							type="button"
							class="p-1 hover:bg-surface-100 dark:hover:bg-surface-700 rounded transition-colors"
							onclick={handleCustomRangeCancel}
						>
							<Icon icon={MaterialIcon.ARROW_BACK} class="w-4 h-4" />
						</button>
						<span class="text-sm font-medium">Custom Date Range</span>
					</div>

					<div class="grid grid-cols-2 gap-3">
						<div>
							<label class="text-xs font-medium text-surface-600-300 mb-1 block">
								Start Date
							</label>
							<input
								type="date"
								bind:value={customStartDate}
								class="w-full px-3 py-2 border border-surface-300-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-surface-700 text-sm"
							/>
						</div>
						<div>
							<label class="text-xs font-medium text-surface-600-300 mb-1 block">
								End Date
							</label>
							<input
								type="date"
								bind:value={customEndDate}
								class="w-full px-3 py-2 border border-surface-300-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-surface-700 text-sm"
							/>
						</div>
					</div>

					<div class="flex justify-end gap-2">
						<button
							type="button"
							class="px-3 py-2 text-sm font-medium text-surface-700 dark:text-surface-200 bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 rounded-lg transition-colors"
							onclick={handleCustomRangeCancel}
						>
							Cancel
						</button>
						<button
							type="button"
							class="px-3 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50"
							onclick={handleCustomRangeApply}
							disabled={!customStartDate || !customEndDate}
						>
							Apply
						</button>
					</div>
				</div>
			{:else}
				<!-- Date Options List -->
				<div class="max-h-60 overflow-y-auto">
					{#each dateOptions as option}
						<button
							type="button"
							class="w-full px-3 py-2 text-left hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors flex items-center justify-between {value === option.value ? 'bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-400' : ''}"
							onclick={() => handleSelect(option)}
						>
							<span class="text-sm">{option.label}</span>
							{#if value === option.value}
								<Icon icon={MaterialIcon.CHECK} class="w-4 h-4 text-primary-600-400" />
							{/if}
						</button>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>