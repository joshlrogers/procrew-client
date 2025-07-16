import { writable, derived, type Writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface FilterState {
    search: string;
    status: string;
    assignedTo: string;
    dateCreated: string;
    priority: string;
    estimatedValueMin: number | null;
    estimatedValueMax: number | null;
}

export interface FilterPreset {
    id: string;
    name: string;
    filters: Partial<FilterState>;
    isDefault?: boolean;
}

export interface FilterContextState {
    filters: FilterState;
    appliedFilters: FilterState;
    isLiveFiltering: boolean;
    hasUnappliedChanges: boolean;
    resultCount: number;
    totalCount: number;
    presets: FilterPreset[];
}

const defaultFilters: FilterState = {
    search: '',
    status: '',
    assignedTo: '',
    dateCreated: 'all',
    priority: '',
    estimatedValueMin: null,
    estimatedValueMax: null
};

const defaultPresets: FilterPreset[] = [
    {
        id: 'all',
        name: 'All Leads',
        filters: {},
        isDefault: true
    },
    {
        id: 'my-active',
        name: 'My Active Leads',
        filters: {
            assignedTo: 'me',
            status: '0' // LeadStatus.New = 0
        }
    },
    {
        id: 'new-leads',
        name: 'New Leads',
        filters: {
            status: '0' // LeadStatus.New = 0
        }
    },
    {
        id: 'recent',
        name: 'Recent (Last 7 Days)',
        filters: {
            dateCreated: 'last7days'
        }
    },
    {
        id: 'qualified',
        name: 'Qualified Leads',
        filters: {
            status: '2' // LeadStatus.Qualified = 2
        }
    }
];

function createFilterStore() {
    const { subscribe, set, update }: Writable<FilterContextState> = writable({
        filters: { ...defaultFilters },
        appliedFilters: { ...defaultFilters },
        isLiveFiltering: true,
        hasUnappliedChanges: false,
        resultCount: 0,
        totalCount: 0,
        presets: defaultPresets
    });

    return {
        subscribe,
        
        // Update individual filter
        setFilter: (key: keyof FilterState, value: any) => {
            update(state => ({
                ...state,
                filters: { ...state.filters, [key]: value },
                hasUnappliedChanges: !state.isLiveFiltering
            }));
        },

        // Apply all pending filters
        applyFilters: () => {
            update(state => ({
                ...state,
                appliedFilters: { ...state.filters },
                hasUnappliedChanges: false
            }));
        },

        // Clear all filters
        clearAllFilters: () => {
            update(state => ({
                ...state,
                filters: { ...defaultFilters },
                appliedFilters: { ...defaultFilters },
                hasUnappliedChanges: false
            }));
        },

        // Clear individual filter
        clearFilter: (key: keyof FilterState) => {
            update(state => ({
                ...state,
                filters: { ...state.filters, [key]: (defaultFilters as any)[key] },
                hasUnappliedChanges: !state.isLiveFiltering
            }));
        },

        // Set filtering mode
        setLiveFiltering: (isLive: boolean) => {
            update(state => ({
                ...state,
                isLiveFiltering: isLive,
                hasUnappliedChanges: !isLive && JSON.stringify(state.filters) !== JSON.stringify(state.appliedFilters)
            }));
        },

        // Update result counts
        setResultCount: (resultCount: number, totalCount: number) => {
            update(state => ({
                ...state,
                resultCount,
                totalCount
            }));
        },

        // Apply preset
        applyPreset: (presetId: string) => {
            update(state => {
                const preset = state.presets.find(p => p.id === presetId);
                if (!preset) return state;

                const newFilters = { ...defaultFilters, ...preset.filters };
                return {
                    ...state,
                    filters: newFilters,
                    appliedFilters: newFilters,
                    hasUnappliedChanges: false
                };
            });
        },

        // Add custom preset
        addPreset: (name: string, filters: Partial<FilterState>) => {
            update(state => ({
                ...state,
                presets: [
                    ...state.presets,
                    {
                        id: `custom-${Date.now()}`,
                        name,
                        filters
                    }
                ]
            }));
        },

        // Remove preset
        removePreset: (presetId: string) => {
            update(state => ({
                ...state,
                presets: state.presets.filter(p => p.id !== presetId && !p.isDefault)
            }));
        },

        // Reset to default state
        reset: () => {
            set({
                filters: { ...defaultFilters },
                appliedFilters: { ...defaultFilters },
                isLiveFiltering: true,
                hasUnappliedChanges: false,
                resultCount: 0,
                totalCount: 0,
                presets: defaultPresets
            });
        }
    };
}

export const filterStore = createFilterStore();

// Derived stores for common use cases
export const activeFilters = derived(filterStore, $store => {
    const filters = $store.appliedFilters;
    return Object.entries(filters).filter(([key, value]) => {
        if (key === 'dateCreated') return value !== 'all';
        if (typeof value === 'string') return value.trim() !== '';
        return value !== null && value !== undefined;
    }).map(([key, value]) => ({ key: key as keyof FilterState, value }));
});

export const filterCount = derived(activeFilters, $filters => $filters.length);

export const hasActiveFilters = derived(filterCount, $count => $count > 0);

export const needsApply = derived(filterStore, $store => $store.hasUnappliedChanges);