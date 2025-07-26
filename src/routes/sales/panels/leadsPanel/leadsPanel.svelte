<script lang="ts">
    import { goto, preloadData } from '$app/navigation';
    import { page } from '$app/state';
    import { Panel } from '$lib/components/panel';
    import { IconButton } from '$lib/components/buttons/iconButton';
    import { Icon, MaterialIcon } from '$lib/components/icon';
    import { Pagination } from '@skeletonlabs/skeleton-svelte';
    import { ProgressRing } from '@skeletonlabs/skeleton-svelte';
    import type { Lead } from '$lib/shared/models/lead';
    import { LeadStatus, LeadPriority } from '$lib/shared/models/lead';
    import { LeadStatusOptions, LeadPriorityOptions, DateFilterOptions } from '$lib/shared/models/options';
    import { Badge } from '$lib/components/badge';
    import { FilterBar } from '$lib/components/filters';
    import { filterStore } from '$lib/shared/stores/filterContext';
    import { NewLeadModal } from '../../modals';
    import type { CountrySelectOption, StateSelectOption } from '$lib/shared/models/address';
    import { invalidate } from '$app/navigation';
    import { SearchInput } from '$lib/components/inputs';
    import { SelectList } from '$lib/components/selectList';
    import type { SelectListOption } from '$lib/shared/models/options';

    interface SalesRepresentative {
        id: string;
        firstName: string;
        lastName: string;
        emailAddress?: string;
        displayName: string;
    }

    interface LeadsPanelProps {
        leadsData: Promise<{
            value: Lead[];
            page: number;
            total: number;
            count: number;
            isOk: boolean;
        }>;
        salesRepresentatives?: SalesRepresentative[];
        initialSearchTerm?: string;
        initialStatus?: string;
        initialAssignedToId?: string;
        initialCreatedDateFilter?: string;
    }

    let { 
        leadsData,
        salesRepresentatives = [],
        initialSearchTerm = '',
        initialStatus = '',
        initialAssignedToId = '',
        initialCreatedDateFilter = 'all'
    }: LeadsPanelProps = $props();

    let currentPage = $state(1);
    let pageSize = $state(10);
    let sortBy = $state('companyName');
    let sortDirection = $state('asc');
    let searchTerm = $state(initialSearchTerm);
    let statusFilter = $state(initialStatus);
    let assignedToFilter = $state(initialAssignedToId);
    let createdDateFilter = $state(initialCreatedDateFilter);
    let showNewLeadModal = $state(false);
    let isSearching = $state(false);
    let isFilteringActive = $state(false);
    let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;
    let states: StateSelectOption[] = $state([]);
    let countries: CountrySelectOption[] = $state([]);

    // Keep filter states in sync with URL parameters
    $effect(() => {
        const urlPage = Number(page.url.searchParams.get('pageNumber')) || 1;
        const urlPageSize = Number(page.url.searchParams.get('pageSize')) || 10;
        const urlSortBy = page.url.searchParams.get('sortBy') || 'companyName';
        const urlSortDirection = page.url.searchParams.get('sortDirection') || 'asc';
        const urlSearch = page.url.searchParams.get('search') || '';
        const urlStatus = page.url.searchParams.get('status') || '';
        const urlAssignedToId = page.url.searchParams.get('assignedToId') || '';
        const urlCreatedDateFilter = page.url.searchParams.get('createdDateFilter') || 'all';
        
        currentPage = urlPage;
        pageSize = urlPageSize;
        sortBy = urlSortBy;
        sortDirection = urlSortDirection;
        searchTerm = urlSearch;
        statusFilter = urlStatus;
        assignedToFilter = urlAssignedToId;
        createdDateFilter = urlCreatedDateFilter;
    });
    
    // Keep a separate state for the input value to prevent disruption
    let inputSearchTerm = $state(initialSearchTerm);

    // Update URL with new parameters and trigger load function
    const updateUrl = (newPage?: number, newPageSize?: number, newSortBy?: string, newSortDirection?: string, newSearchTerm?: string, newStatusFilter?: string, newAssignedToFilter?: string, newCreatedDateFilter?: string) => {
        const url = new URL(page.url);
        
        if (newPage !== undefined) {
            url.searchParams.set('pageNumber', newPage.toString());
        }
        if (newPageSize !== undefined) {
            url.searchParams.set('pageSize', newPageSize.toString());
        }
        if (newSortBy !== undefined) {
            url.searchParams.set('sortBy', newSortBy);
        }
        if (newSortDirection !== undefined) {
            url.searchParams.set('sortDirection', newSortDirection);
        }
        if (newSearchTerm !== undefined) {
            if (newSearchTerm.trim()) {
                url.searchParams.set('search', newSearchTerm.trim());
            } else {
                url.searchParams.delete('search');
            }
        }
        if (newStatusFilter !== undefined) {
            if (newStatusFilter.trim()) {
                url.searchParams.set('status', newStatusFilter.trim());
            } else {
                url.searchParams.delete('status');
            }
        }
        if (newAssignedToFilter !== undefined) {
            if (newAssignedToFilter.trim()) {
                url.searchParams.set('assignedToId', newAssignedToFilter.trim());
            } else {
                url.searchParams.delete('assignedToId');
            }
        }
        if (newCreatedDateFilter !== undefined) {
            if (newCreatedDateFilter.trim() && newCreatedDateFilter !== 'all') {
                url.searchParams.set('createdDateFilter', newCreatedDateFilter.trim());
            } else {
                url.searchParams.delete('createdDateFilter');
            }
        }
        
        // Use goto to trigger load function with proper options to minimize disruption
        goto(url.toString(), { 
            noScroll: true,
            keepFocus: true,
            replaceState: false,
            invalidateAll: true
        }).then(() => {
            // Clear loading states once navigation completes
            isSearching = false;
            isFilteringActive = false;
        }).catch(() => {
            // Also clear loading states on error
            isSearching = false;
            isFilteringActive = false;
        });
    };

    const handleSort = (field: string) => {
        const newDirection = sortBy === field && sortDirection === 'asc' ? 'desc' : 'asc';
        updateUrl(1, undefined, field, newDirection);
    };

    const handlePageChange = (event: { page: number }) => {
        updateUrl(event.page);
    };

    const handlePageSizeChange = (event: { pageSize: number }) => {
        updateUrl(1, event.pageSize);
    };

    const handleSearch = (newSearchTerm: string) => {
        // Don't trigger search if the term hasn't actually changed from initial
        if (newSearchTerm === initialSearchTerm && !isSearching) {
            return;
        }
        
        // Update the input term immediately to preserve user input
        inputSearchTerm = newSearchTerm;
        
        // Clear any existing search timer
        if (searchDebounceTimer) {
            clearTimeout(searchDebounceTimer);
        }
        
        // Set loading state immediately for visual feedback
        isSearching = true;
        
        // Debounce the actual search to avoid too many API calls
        searchDebounceTimer = setTimeout(() => {
            // Update URL which will trigger the load function
            updateUrl(1, undefined, undefined, undefined, newSearchTerm);
        }, 300);
    };

    const handleClearSearch = () => {
        // Clear any pending search timers
        if (searchDebounceTimer) {
            clearTimeout(searchDebounceTimer);
        }
        
        inputSearchTerm = '';
        isSearching = true; // Show loading while clearing
        updateUrl(1, undefined, undefined, undefined, '');
    };

    const handleStatusFilter = (status: string | number | undefined) => {
        // Allow undefined values to be converted to empty string for clearing
        const statusValue = status === undefined ? '' : status?.toString() || '';
        isFilteringActive = true;
        updateUrl(1, undefined, undefined, undefined, undefined, statusValue);
    };

    const handleAssignedToFilter = (assignedToId: string | number | undefined) => {
        // Allow undefined values to be converted to empty string for clearing
        const assignedToValue = assignedToId === undefined ? '' : assignedToId?.toString() || '';
        isFilteringActive = true;
        updateUrl(1, undefined, undefined, undefined, undefined, undefined, assignedToValue);
    };

    const handleCreatedDateFilter = (dateFilter: string | number | undefined) => {
        // Allow undefined values to be converted to 'all' for clearing
        const dateFilterValue = dateFilter === undefined ? 'all' : dateFilter?.toString() || 'all';
        isFilteringActive = true;
        updateUrl(1, undefined, undefined, undefined, undefined, undefined, undefined, dateFilterValue);
    };

    const handleClearFilters = () => {
        // Clear search and filters, reset to page 1
        inputSearchTerm = '';
        isFilteringActive = true;
        updateUrl(1, undefined, undefined, undefined, '', '', '', 'all');
    };

    const getSortIcon = (field: string) => {
        if (sortBy !== field) return MaterialIcon.LIST;
        return sortDirection === 'asc' ? MaterialIcon.ARROW_DROP_UP : MaterialIcon.ARROW_DROP_DOWN;
    };

    const formatPhoneNumber = (phoneNumber: string | null | undefined) => {
        if (!phoneNumber) return '';
        return phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    };

    const getDisplayName = (lead: Lead) => {
        if (lead.companyName) {
            return lead.companyName;
        }
        const firstName = lead.firstName || '';
        const lastName = lead.lastName || '';
        return `${lastName}, ${lead.salutation || ''} ${firstName}`.trim() || 'Unknown';
    };

    const getStatusLabel = (status: number) => {
        const statusOption = LeadStatusOptions.find((option: SelectListOption) => option.value === status);
        return statusOption ? statusOption.label : 'Unknown';
    };

    const getPriorityLabel = (priority: number | null | undefined) => {
        if (priority === null || priority === undefined) return '';
        const priorityOption = LeadPriorityOptions.find((option: SelectListOption) => option.value === priority);
        return priorityOption ? priorityOption.label : '';
    };

    const getStatusBadgeProps = (status: number) => {
        switch (status) {
            case LeadStatus.New:
                return { variant: 'tonal' as const, color: 'surface' as const };
            case LeadStatus.Contacted:
                return { variant: 'tonal' as const, color: 'primary' as const };
            case LeadStatus.Qualified:
                return { variant: 'tonal' as const, color: 'success' as const };
            case LeadStatus.Closed:
                return { variant: 'tonal' as const, color: 'tertiary' as const };
            default:
                return { variant: 'tonal' as const, color: 'surface' as const };
        }
    };

    const getPriorityBadgeProps = (priority: number | null | undefined) => {
        switch (priority) {
            case LeadPriority.High:
                return { variant: 'tonal' as const, color: 'error' as const };
            case LeadPriority.Medium:
                return { variant: 'tonal' as const, color: 'warning' as const };
            case LeadPriority.Low:
                return { variant: 'tonal' as const, color: 'surface' as const };
            default:
                return null;
        }
    };

    const formatCurrency = (value: number | null | undefined) => {
        if (value == null) return '';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(value);
    };

    const formatAddress = (address: any) => {
        if (!address) return '';
        const parts = [];
        if (address.city) parts.push(address.city);
        if (address.state) parts.push(address.state);
        return parts.join(', ');
    };

    const handleNewLead = () => {
        showNewLeadModal = true;
    };

    const handleModalClose = async (success?: boolean) => {
        showNewLeadModal = false;
        if (success) {
            // Refresh only the leads data by invalidating the specific dependency
            await invalidate('leads:list');
        }
    };

    // Create filter options
    const statusOptions: SelectListOption[] = [
        { value: '', label: 'All' },
        ...LeadStatusOptions
    ];

    const assignedToOptions: SelectListOption[] = [
        { value: '', label: 'All' },
        { value: 'me', label: 'Me' },
        ...salesRepresentatives.map(rep => ({
            value: rep.id,
            label: rep.displayName
        }))
    ];

    const dateCreatedOptions: SelectListOption[] = DateFilterOptions;

    // Sync filter store with local state
    $effect(() => {
        filterStore.setFilter('search', searchTerm);
        filterStore.setFilter('status', statusFilter);
        filterStore.setFilter('assignedTo', assignedToFilter);
        filterStore.setFilter('dateCreated', createdDateFilter);
    });

    // Update result counts in filter store
    $effect(() => {
        leadsData.then(data => {
            if (data.isOk) {
                filterStore.setResultCount(data.count, data.total);
            }
        });
    });

    // Create filter items for FilterBar
    const createFilterItems = () => {
        const items = [];
        
        if (searchTerm.trim()) {
            items.push({
                key: 'search',
                label: `Search: "${searchTerm}"`,
                value: searchTerm,
                onClear: () => { isFilteringActive = true; handleClearSearch(); }
            });
        }
        
        if (statusFilter.trim()) {
            const statusLabel = statusOptions.find(o => o.value.toString() === statusFilter)?.label || statusFilter;
            items.push({
                key: 'status',
                label: `Status: ${statusLabel}`,
                value: statusFilter,
                onClear: () => { isFilteringActive = true; handleStatusFilter(''); }
            });
        }
        
        if (assignedToFilter.trim()) {
            const assignedLabel = assignedToOptions.find(o => o.value === assignedToFilter)?.label || assignedToFilter;
            items.push({
                key: 'assignedTo',
                label: `Assigned: ${assignedLabel}`,
                value: assignedToFilter,
                onClear: () => { isFilteringActive = true; handleAssignedToFilter(''); }
            });
        }
        
        if (createdDateFilter.trim() && createdDateFilter !== 'all') {
            const dateLabel = dateCreatedOptions.find(o => o.value === createdDateFilter)?.label || createdDateFilter;
            items.push({
                key: 'dateCreated',
                label: `Date: ${dateLabel}`,
                value: createdDateFilter,
                onClear: () => { isFilteringActive = true; handleCreatedDateFilter('all'); }
            });
        }
        
        return items;
    };

    const filterItems = $derived(createFilterItems());
</script>

<Panel class="w-full">
    {#snippet header()}
        <div class="flex flex-row items-center justify-between">
            <div class="flex items-center gap-3">
                <Icon icon={MaterialIcon.SELL} iconSize="2rem" />
                <div>
                    <h1 class="text-xl font-semibold">Leads</h1>
                    <p class="text-sm opacity-75">Manage your sales prospects</p>
                </div>
            </div>
            <div>
                <IconButton
                    icon={MaterialIcon.ADD}
                    flat={true}
                    isRounded={true}
                    textColor="text-primary-500"
                    tooltip="Add a new lead"
                    onclick={handleNewLead}
                />
            </div>
        </div>
    {/snippet}

    {#snippet content()}
        {#await leadsData}
            <div class="flex flex-row justify-center items-center gap-2 py-8">
                <ProgressRing 
                    value={null} 
                    size="size-14" 
                    meterStroke="stroke-tertiary-600-400"
                    trackStroke="stroke-tertiary-50-950" 
                />
            </div>
        {:then data}
            {#if data.isOk && data.value}
                <div class="space-y-4">
                    <!-- Search and Filter Controls -->
                    <div class="space-y-4">
                        <!-- Search Input -->
                        <div class="flex items-center gap-4">
                            <div class="relative flex-1 max-w-md">
                                <SearchInput
                                    placeholder="Search leads..."
                                    value={inputSearchTerm}
                                    onSearch={handleSearch}
                                    onClear={handleClearSearch}
                                    class="w-full"
                                />
                                {#if isSearching}
                                    <div class="absolute right-12 top-1/2 transform -translate-y-1/2">
                                        <ProgressRing 
                                            value={null} 
                                            size="size-4" 
                                            meterStroke="stroke-primary-500"
                                            trackStroke="stroke-surface-200" 
                                        />
                                    </div>
                                {/if}
                            </div>
                            {#if isSearching}
                                <div class="flex items-center gap-2 text-sm text-primary-500 font-medium">
                                    Searching...
                                </div>
                            {/if}
                        </div>

                        <!-- Filter Controls -->
                        <div class="flex flex-wrap items-center gap-4">
                            <div class="flex items-center gap-4">
                                <SelectList
                                    label="Status"
                                    items={statusOptions}
                                    value={statusFilter}
                                    onchanged={handleStatusFilter}
                                    class="min-w-[140px]"
                                    height="h-9"
                                />
                                
                                <SelectList
                                    label="Assigned To"
                                    items={assignedToOptions}
                                    value={assignedToFilter}
                                    onchanged={handleAssignedToFilter}
                                    class="min-w-[160px]"
                                    height="h-9"
                                />
                                
                                <SelectList
                                    label="Date Created"
                                    items={dateCreatedOptions}
                                    value={createdDateFilter}
                                    onchanged={handleCreatedDateFilter}
                                    class="min-w-[140px]"
                                    height="h-9"
                                />
                            </div>
                        </div>

                        <!-- Enhanced Filter Bar -->
                        {#await leadsData then data}
                            {#if data.isOk}
                                <FilterBar
                                    filters={filterItems}
                                    onClearAll={handleClearFilters}
                                    resultCount={data.count}
                                    totalCount={data.total}
                                    isLoading={isSearching || isFilteringActive}
                                    class="mt-4"
                                />
                            {/if}
                        {/await}
                        
                        <!-- Filter Activity Indicator -->
                        {#if isFilteringActive && !isSearching}
                            <div class="flex items-center gap-2 text-sm text-primary-500 font-medium">
                                <ProgressRing 
                                    value={null} 
                                    size="size-4" 
                                    meterStroke="stroke-primary-500"
                                    trackStroke="stroke-surface-200" 
                                />
                                Applying filters...
                            </div>
                        {/if}
                    </div>

                    <!-- Table -->
                    <div class="table-wrap">
                        <table class="table caption-bottom">
                            <thead>
                                <tr>
                                    <th class="cursor-pointer hover:bg-surface-200-800" onclick={() => handleSort('companyName')}>
                                        <div class="flex items-center justify-between">
                                            Company/Name
                                            <Icon icon={getSortIcon('companyName')} />
                                        </div>
                                    </th>
                                    <th class="cursor-pointer hover:bg-surface-200-800" onclick={() => handleSort('emailAddress')}>
                                        <div class="flex items-center justify-between">
                                            Email
                                            <Icon icon={getSortIcon('emailAddress')} />
                                        </div>
                                    </th>
                                    <th class="cursor-pointer hover:bg-surface-200-800" onclick={() => handleSort('phoneNumber')}>
                                        <div class="flex items-center justify-between">
                                            Phone
                                            <Icon icon={getSortIcon('phoneNumber')} />
                                        </div>
                                    </th>
                                    <th class="cursor-pointer hover:bg-surface-200-800" onclick={() => handleSort('status')}>
                                        <div class="flex items-center justify-between">
                                            Status
                                            <Icon icon={getSortIcon('status')} />
                                        </div>
                                    </th>
                                    <th class="cursor-pointer hover:bg-surface-200-800" onclick={() => handleSort('priority')}>
                                        <div class="flex items-center justify-between">
                                            Priority
                                            <Icon icon={getSortIcon('priority')} />
                                        </div>
                                    </th>
                                    <th class="cursor-pointer hover:bg-surface-200-800" onclick={() => handleSort('estimatedValue')}>
                                        <div class="flex items-center justify-between">
                                            Est. Value
                                            <Icon icon={getSortIcon('estimatedValue')} />
                                        </div>
                                    </th>
                                    <th>Address</th>
                                    <th>Notes</th>
                                    <th class="w-24">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="[&>tr]:hover:preset-tonal-primary">
                                {#if data.value.length === 0}
                                    <tr>
                                        <td colspan="9" class="text-center py-8 text-surface-500">
                                            {#if searchTerm.trim()}
                                                No results found for "{searchTerm.trim()}".
                                                <button
                                                    type="button"
                                                    onclick={handleClearSearch}
                                                    class="text-primary-500 hover:text-primary-600 underline ml-1"
                                                >
                                                    Clear search
                                                </button>
                                            {:else}
                                                No leads found.
                                            {/if}
                                        </td>
                                    </tr>
                                {:else}
                                    {#each data.value as lead}
                                        <tr class="cursor-pointer" onclick={() => goto(`/sales/${lead.id}`)}>
                                            <td class="font-medium">
                                                {getDisplayName(lead)}
                                                {#if lead.salutation}
                                                    <span class="text-sm text-surface-500">({lead.salutation})</span>
                                                {/if}
                                            </td>
                                            <td>{lead.emailAddress || ''}</td>
                                            <td>{formatPhoneNumber(lead.phoneNumber)}</td>
                                            <td>
                                                <Badge 
                                                    text={getStatusLabel(lead.status)}
                                                    {...getStatusBadgeProps(lead.status)}
                                                />
                                            </td>
                                            <td>
                                                {#if lead.priority !== null && lead.priority !== undefined}
                                                    {@const priorityProps = getPriorityBadgeProps(lead.priority)}
                                                    {#if priorityProps}
                                                        <Badge 
                                                            text={getPriorityLabel(lead.priority)}
                                                            {...priorityProps}
                                                        />
                                                    {/if}
                                                {/if}
                                            </td>
                                            <td class="text-right font-mono">
                                                {formatCurrency(lead.estimatedValue)}
                                            </td>
                                            <td class="max-w-xs truncate text-sm text-surface-600">
                                                {formatAddress(lead.address)}
                                            </td>
                                            <td class="max-w-xs truncate">
                                                {lead.notes || ''}
                                            </td>
                                            <td>
                                                <div class="flex gap-1" onclick={(e) => e.stopPropagation()}>
                                                    <IconButton
                                                        icon={MaterialIcon.EDIT}
                                                        flat={true}
                                                        tooltip="Edit lead"
                                                        onhover={() => preloadData(`/sales/${lead.id}`)}
                                                        onclick={() => goto(`/sales/${lead.id}`)}
                                                    />
                                                    <IconButton
                                                        icon={MaterialIcon.DELETE}
                                                        flat={true}
                                                        tooltip="Delete lead"
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    {/each}
                                {/if}
                            </tbody>
                        </table>
                    </div>

                    <!-- Pagination Footer -->
                    <footer class="flex justify-between items-center">
                        <div class="flex items-center gap-2">
                            <label for="pageSize" class="text-sm">Items per page:</label>
                            <select 
                                id="pageSize"
                                name="pageSize" 
                                class="select max-w-[100px]" 
                                value={pageSize} 
                                onchange={(e) => handlePageSizeChange({ pageSize: Number(e.currentTarget.value) })}
                            >
                                {#each [5, 10, 25, 50] as size}
                                    <option value={size}>{size}</option>
                                {/each}
                            </select>
                        </div>
                        
                        <!-- Pagination -->
                        <Pagination
                            data={data.value}
                            count={data.total}
                            page={data.page}
                            pageSize={pageSize}
                            onPageChange={handlePageChange}
                            onPageSizeChange={handlePageSizeChange}
                            siblingCount={2}
                        />
                    </footer>
                </div>
            {:else}
                <div class="text-center py-8 text-error-500">
                    Failed to load leads. Please try again.
                </div>
            {/if}
        {:catch error}
            <div class="text-center py-8 text-error-500">
                Error loading leads: {error.message}
            </div>
        {/await}
    {/snippet}
</Panel>

<NewLeadModal 
    open={showNewLeadModal}
    {countries}
    {states}
    onClose={handleModalClose}
/> 