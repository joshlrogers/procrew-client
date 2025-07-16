<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Icon, MaterialIcon } from '$lib/components/icon';
	import { Badge } from '$lib/components/badge';
	import type { SelectListOption } from '$lib/shared/models/options';

	interface SearchableSelectProps {
		items: SelectListOption[];
		value?: string | number | string[] | number[];
		placeholder?: string;
		searchPlaceholder?: string;
		label?: string;
		multiple?: boolean;
		disabled?: boolean;
		clearable?: boolean;
		maxHeight?: string;
		class?: string;
		showSearch?: boolean;
		showSelectAll?: boolean;
		emptyMessage?: string;
	}

	let {
		items = [],
		placeholder = 'Select an option',
		searchPlaceholder = 'Search...',
		label = '',
		multiple = false,
		disabled = false,
		clearable = true,
		maxHeight = 'max-h-60',
		class: className = '',
		showSearch = true,
		showSelectAll = false,
		emptyMessage = 'No options found',
		value = multiple ? [] : '',
	}: SearchableSelectProps = $props();

	const dispatch = createEventDispatcher();

	let isOpen = $state(false);
	let searchTerm = $state('');
	let searchInputRef: HTMLInputElement;
	let containerRef: HTMLDivElement;

	const selectedValues = $derived(
		multiple 
			? Array.isArray(value) ? value : []
			: value ? [value] : []
	);

	const filteredItems = $derived(
		items.filter(item => 
			item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
			item.value.toString().toLowerCase().includes(searchTerm.toLowerCase())
		)
	);

	const selectedItems = $derived(
		items.filter(item => selectedValues.includes(item.value))
	);

	const displayText = $derived(
		selectedItems.length === 0 ? placeholder :
		selectedItems.length === 1 ? selectedItems[0].label :
		multiple ? `${selectedItems.length} selected` :
		selectedItems[0].label
	);

	const handleToggle = () => {
		if (disabled) return;
		isOpen = !isOpen;
		if (isOpen && showSearch) {
			setTimeout(() => searchInputRef?.focus(), 0);
		}
	};

	const handleSelect = (item: SelectListOption) => {
		if (multiple) {
			const currentValues = Array.isArray(value) ? value : [];
			const newValues = currentValues.includes(item.value)
				? currentValues.filter(v => v !== item.value)
				: [...currentValues, item.value];
			dispatch('change', newValues);
		} else {
			dispatch('change', item.value);
			isOpen = false;
		}
	};

	const handleSelectAll = () => {
		if (!multiple) return;
		const allValues = filteredItems.map(item => item.value);
		dispatch('change', allValues);
	};

	const handleClearAll = () => {
		if (multiple) {
			dispatch('change', []);
		} else {
			dispatch('change', '');
		}
	};

	const handleClear = (e: Event) => {
		e.stopPropagation();
		handleClearAll();
	};

	let focusedIndex = $state(-1);

	const handleKeydown = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			isOpen = false;
			focusedIndex = -1;
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			if (!isOpen) {
				isOpen = true;
			} else {
				focusedIndex = Math.min(focusedIndex + 1, filteredItems.length - 1);
			}
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			if (isOpen) {
				focusedIndex = Math.max(focusedIndex - 1, -1);
			}
		} else if (e.key === 'Enter') {
			e.preventDefault();
			if (isOpen && focusedIndex >= 0 && focusedIndex < filteredItems.length) {
				handleSelect(filteredItems[focusedIndex]);
			} else if (!isOpen) {
				isOpen = true;
			}
		} else if (e.key === 'Tab') {
			isOpen = false;
			focusedIndex = -1;
		}
	};

	const handleOutsideClick = (e: MouseEvent) => {
		if (containerRef && !containerRef.contains(e.target as Node)) {
			isOpen = false;
		}
	};

	$effect(() => {
		if (isOpen) {
			document.addEventListener('click', handleOutsideClick);
			document.addEventListener('keydown', handleKeydown);
		} else {
			document.removeEventListener('click', handleOutsideClick);
			document.removeEventListener('keydown', handleKeydown);
		}

		return () => {
			document.removeEventListener('click', handleOutsideClick);
			document.removeEventListener('keydown', handleKeydown);
		};
	});

	$effect(() => {
		if (!isOpen) {
			searchTerm = '';
			focusedIndex = -1;
		}
	});
</script>

<div class="relative {className}" bind:this={containerRef}>
	{#if label}
		<span class="text-sm font-medium text-surface-600-300 mb-1 block">
			{label}
		</span>
	{/if}

	<!-- Main Select Button -->
	<button
		type="button"
		class="flex items-center justify-between w-full px-3 py-2 border border-surface-300-600 rounded-lg bg-surface-50-900 hover:bg-surface-100-800 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors {disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}"
		onclick={handleToggle}
		onkeydown={handleKeydown}
		{disabled}
	>
		<div class="flex items-center gap-2 flex-1 min-w-0">
			{#if multiple && selectedItems.length > 0}
				<div class="flex items-center gap-1 flex-wrap">
					{#each selectedItems.slice(0, 3) as item}
						<Badge 
							text={item.label} 
							variant="tonal" 
							color="primary" 
							size="sm"
						/>
					{/each}
					{#if selectedItems.length > 3}
						<Badge 
							text="+{selectedItems.length - 3} more" 
							variant="tonal" 
							color="surface" 
							size="sm"
						/>
					{/if}
				</div>
			{:else}
				<span class="truncate {selectedItems.length === 0 ? 'text-surface-500-400' : 'text-surface-900-100'}">
					{displayText}
				</span>
			{/if}
		</div>

		<div class="flex items-center gap-1 ml-2">
			{#if clearable && selectedItems.length > 0}
				<button
					type="button"
					class="mb-2 h-4 hover:bg-surface-200-700 rounded transition-colors"
					onclick={handleClear}
				>
					<Icon icon={MaterialIcon.CLOSE} class="w-4 h-4 text-surface-500-400" />
				</button>
			{/if}
			<Icon 
				icon={isOpen ? MaterialIcon.KEYBOARD_ARROW_UP : MaterialIcon.KEYBOARD_ARROW_DOWN} 
				class="mb-1 w-5 h-5 text-surface-500-400 flex-shrink-0"
			/>
		</div>
	</button>

	<!-- Dropdown Menu -->
	{#if isOpen}
		<div class="absolute z-50 w-full mt-1 bg-white dark:bg-surface-800 border border-surface-300-600 rounded-lg shadow-lg {maxHeight} overflow-hidden">
			<!-- Search Input -->
			{#if showSearch}
				<div class="p-3 border-b border-surface-200-700">
					<div class="relative">
						<Icon icon={MaterialIcon.SEARCH} class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-surface-500-400" />
						<input
							bind:this={searchInputRef}
							bind:value={searchTerm}
							type="text"
							placeholder={searchPlaceholder}
							class="w-full pl-10 pr-4 py-2 border border-surface-300-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-surface-700"
						/>
					</div>
				</div>
			{/if}

			<!-- Select All Option -->
			{#if multiple && showSelectAll && filteredItems.length > 0}
				<div class="p-2 border-b border-surface-200-700">
					<button
						type="button"
						class="w-full px-3 py-2 text-left hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors text-primary-600-400 font-medium"
						onclick={handleSelectAll}
					>
						Select All ({filteredItems.length})
					</button>
				</div>
			{/if}

			<!-- Options List -->
			<div class="max-h-48 overflow-y-auto">
				{#if filteredItems.length === 0}
					<div class="px-3 py-8 text-center text-surface-500-400">
						{emptyMessage}
					</div>
				{:else}
					{#each filteredItems as item, index}
						<button
							type="button"
							class="w-full px-3 py-2 text-left hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors flex items-center justify-between group {focusedIndex === index ? 'bg-surface-100 dark:bg-surface-700' : ''}"
							onclick={() => handleSelect(item)}
							onmouseenter={() => focusedIndex = index}
						>
							<span class="truncate">{item.label}</span>
							{#if selectedValues.includes(item.value)}
								<Icon icon={MaterialIcon.CHECK} class="w-4 h-4 text-primary-600-400 flex-shrink-0" />
							{/if}
						</button>
					{/each}
				{/if}
			</div>
		</div>
	{/if}
</div>