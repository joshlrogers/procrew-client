<script lang="ts">
	import { Icon, MaterialIcon } from '$lib/components/icon';
	import { FilterBadge } from '$lib/components/filters';
	import { Badge } from '$lib/components/badge';

	interface FilterItem {
		key: string;
		label: string;
		value: string;
		onClear: () => void;
	}

	interface FilterBarProps {
		filters: FilterItem[];
		onClearAll?: () => void;
		onApplyFilters?: () => void;
		showClearAll?: boolean;
		showApplyButton?: boolean;
		hasUnappliedChanges?: boolean;
		resultCount?: number;
		totalCount?: number;
		isLoading?: boolean;
		class?: string;
		layout?: 'horizontal' | 'vertical';
	}

	let {
		filters = [],
		onClearAll,
		onApplyFilters,
		showClearAll = true,
		showApplyButton = false,
		hasUnappliedChanges = false,
		resultCount = 0,
		totalCount = 0,
		isLoading = false,
		class: className = '',
		layout = 'horizontal'
	}: FilterBarProps = $props();

	const activeFilters = $derived(filters.filter(f => f.value.trim() !== ''));
	const filterCount = $derived(activeFilters.length);
	const hasActiveFilters = $derived(filterCount > 0);

	const handleClearAll = () => {
		onClearAll?.();
	};

	const handleApplyFilters = () => {
		onApplyFilters?.();
	};

	const getResultText = () => {
		if (isLoading) return 'Loading...';
		if (resultCount === 0) return 'No results';
		if (hasActiveFilters) {
			return `${resultCount.toLocaleString()} of ${totalCount.toLocaleString()} results`;
		}
		return `${totalCount.toLocaleString()} results`;
	};

	const getFilterSummary = () => {
		if (filterCount === 0) return '';
		if (filterCount === 1) return '1 filter applied';
		return `${filterCount} filters applied`;
	};
</script>

<div class="filter-bar {className}" class:vertical={layout === 'vertical'}>
	<!-- Results Summary -->
	<div class="results-summary">
		<div class="flex items-center gap-2">
			<Icon 
				icon={isLoading ? MaterialIcon.HOURGLASS_EMPTY : MaterialIcon.SEARCH} 
				class="mb-2 mr-1 w-4 h-4 text-surface-600-300 {isLoading ? 'animate-spin' : ''}"
			/>
			<span class="text-sm font-medium text-surface-700-200">
				{getResultText()}
			</span>
		</div>

		{#if hasActiveFilters}
			<div class="flex items-center gap-2 text-sm text-surface-600-300">
				<Icon icon={MaterialIcon.FILTER_LIST} class="mb-2 mr-1 w-4 h-4" />
				<span>{getFilterSummary()}</span>
			</div>
		{/if}
	</div>

	<!-- Active Filters Section -->
	{#if hasActiveFilters}
		<div class="active-filters-section">
			<!-- Filter Count and Actions -->
			<div class="filter-actions">
				{#if showApplyButton && hasUnappliedChanges}
					<button
						type="button"
						class="apply-button"
						onclick={handleApplyFilters}
					>
						<Icon icon={MaterialIcon.CHECK} class="w-4 h-4" />
						Apply Filters
						<Badge text="•" variant="filled" color="warning" size="sm" />
					</button>
				{/if}

				{#if showClearAll && onClearAll}
					<button
						type="button"
						class="clear-all-button"
						onclick={handleClearAll}
					>
						<Icon icon={MaterialIcon.CLEAR_ALL} class="mb-2 mr-1 w-4 h-4" />
						Clear All
					</button>
				{/if}
			</div>

			<!-- Active Filter Badges -->
			<div class="active-filters">
				{#each activeFilters as filter (filter.key)}
					<FilterBadge
						text={filter.label}
						variant="tonal"
						color="primary"
						size="sm"
						onDismiss={filter.onClear}
						dismissible={true}
					/>
				{/each}
			</div>
		</div>
	{:else if showApplyButton && hasUnappliedChanges}
		<!-- Show apply button even with no active filters if there are unapplied changes -->
		<div class="filter-actions">
			<button
				type="button"
				class="apply-button"
				onclick={handleApplyFilters}
			>
				<Icon icon={MaterialIcon.CHECK} class="w-4 h-4" />
				Apply Filters
				<Badge text="•" variant="filled" color="warning" size="sm" />
			</button>
		</div>
	{/if}
</div>

<style>
	.filter-bar {
		background-color: var(--color-surface-200-800);
		border: 1px solid var(--color-surface-200-800);
		border-radius: 0.375rem;
		padding: 0.5rem 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		font-size: 0.875rem;
	}

	.filter-bar.vertical {
		gap: 1rem;
	}

	.results-summary {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.active-filters-section {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.filter-actions {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		flex-wrap: wrap;
	}

	.apply-button {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.375rem 0.625rem;
		font-size: 0.8125rem;
		font-weight: 500;
		color: white;
		background-color: var(--color-primary-600);
		border-radius: 0.375rem;
		transition: background-color 0.2s;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
	}

	.apply-button:hover {
		background-color: var(--color-primary-700);
	}

	.clear-all-button {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.375rem 0.625rem;
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--color-primary-600);
		background-color: var(--color-primary-50);
		border: 1px solid var(--color-primary-300);
		border-radius: 0.375rem;
		transition: background-color 0.2s;
	}

	.clear-all-button:hover {
		background-color: var(--color-primary-100);
	}

	.active-filters {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.375rem;
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.filter-bar {
			padding: 0.5rem;
			gap: 0.375rem;
		}

		.results-summary {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.25rem;
		}

		.filter-actions {
			width: 100%;
		}

		.apply-button,
		.clear-all-button {
			flex: 1;
			justify-content: center;
			min-width: 0;
		}
	}
</style>