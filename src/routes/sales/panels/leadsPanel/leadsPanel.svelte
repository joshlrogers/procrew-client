<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { Panel } from '$lib/components/panel';
    import { IconButton } from '$lib/components/buttons/iconButton';
    import { Icon, MaterialIcon } from '$lib/components/icon';
    import { Pagination } from '@skeletonlabs/skeleton-svelte';
    import { ProgressRing } from '@skeletonlabs/skeleton-svelte';
    import type { Lead } from '$lib/shared/models/lead';
    import { LeadStatus, LeadPriority } from '$lib/shared/models/lead';

    interface LeadsPanelProps {
        leadsData: Promise<{
            value: Lead[];
            page: number;
            total: number;
            count: number;
            isOk: boolean;
        }>;
    }

    let { leadsData }: LeadsPanelProps = $props();

    let currentPage = $state(1);
    let pageSize = $state(10);
    let sortBy = $state('lastName');
    let sortDirection = $state('asc');

    // Update URL with new parameters
    const updateUrl = (newPage?: number, newPageSize?: number, newSortBy?: string, newSortDirection?: string) => {
        const url = new URL($page.url);
        
        if (newPage !== undefined) {
            url.searchParams.set('pageNumber', newPage.toString());
            currentPage = newPage;
        }
        if (newPageSize !== undefined) {
            url.searchParams.set('pageSize', newPageSize.toString());
            pageSize = newPageSize;
        }
        if (newSortBy !== undefined) {
            url.searchParams.set('sortBy', newSortBy);
            sortBy = newSortBy;
        }
        if (newSortDirection !== undefined) {
            url.searchParams.set('sortDirection', newSortDirection);
            sortDirection = newSortDirection;
        }
        
        goto(url.toString());
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
        return `${firstName} ${lastName}`.trim() || 'Unknown';
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case LeadStatus.New:
                return 'badge-surface-200-700';
            case LeadStatus.Contacted:
                return 'badge-primary-200-700';
            case LeadStatus.Qualified:
                return 'badge-success-200-700';
            case LeadStatus.Closed:
                return 'badge-tertiary-200-700';
            default:
                return 'badge-surface-200-700';
        }
    };

    const getPriorityBadgeClass = (priority: string | null | undefined) => {
        switch (priority) {
            case LeadPriority.High:
                return 'badge-error-200-700';
            case LeadPriority.Medium:
                return 'badge-warning-200-700';
            case LeadPriority.Low:
                return 'badge-surface-200-700';
            default:
                return '';
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
</script>

<Panel class="w-full">
    {#snippet header()}
        <div class="flex flex-row items-center justify-between">
            <div class="flex flex-row items-center">
                <Icon icon={MaterialIcon.SELL} class="mr-2" />
                Leads
            </div>
            <div>
                <IconButton
                    icon={MaterialIcon.ADD}
                    flat={true}
                    isRounded={true}
                    textColor="text-primary-500"
                    tooltip="Add a new lead"
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
                                            No leads found.
                                        </td>
                                    </tr>
                                {:else}
                                    {#each data.value as lead}
                                        <tr>
                                            <td class="font-medium">
                                                {getDisplayName(lead)}
                                                {#if lead.salutation}
                                                    <span class="text-sm text-surface-500">({lead.salutation})</span>
                                                {/if}
                                            </td>
                                            <td>{lead.emailAddress || ''}</td>
                                            <td>{formatPhoneNumber(lead.phoneNumber)}</td>
                                            <td>
                                                <span class="badge {getStatusBadgeClass(lead.status)} text-xs">
                                                    {lead.status}
                                                </span>
                                            </td>
                                            <td>
                                                {#if lead.priority}
                                                    <span class="badge {getPriorityBadgeClass(lead.priority)} text-xs">
                                                        {lead.priority}
                                                    </span>
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
                                                <div class="flex gap-1">
                                                    <IconButton
                                                        icon={MaterialIcon.EDIT}
                                                        flat={true}
                                                        tooltip="Edit lead"
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