import { ApiClient } from '$lib/server/apiClient';
import type { PageServerLoad, Actions } from './$types';
import type { Lead } from '$lib/shared/models/lead';
import type { CountrySelectOption, StateSelectOption } from '$lib/shared/models/address';
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { LeadSchema } from '$lib/shared/models/lead';

export const load: PageServerLoad = async ({ fetch, url, depends }) => {
    const pageNumber = Number(url.searchParams.get('pageNumber')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 10;
    const sortBy = url.searchParams.get('sortBy') || 'lastName';
    const sortDirection = url.searchParams.get('sortDirection') || 'asc';
    const searchTerm = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const assignedToId = url.searchParams.get('assignedToId') || '';
    const createdDateFilter = url.searchParams.get('createdDateFilter') || 'all';

    depends('leads:list');

    return {
        leads: fetchLeads({ fetch, pageNumber, pageSize, sortBy, sortDirection, searchTerm, status, assignedToId, createdDateFilter }),
        searchTerm, // Pass the search term back to the component
        status,
        assignedToId,
        createdDateFilter,
        countries: await fetchCountries({ fetch }),
        states: await fetchStates({ fetch }),
        salesRepresentatives: await fetchSalesRepresentatives({ fetch }),
    };
};

interface FetchLeadsParams {
    fetch: (input: string, init?: RequestInit) => Promise<Response>;
    pageNumber: number;
    pageSize: number;
    sortBy: string;
    sortDirection: string;
    searchTerm: string;
    status: string;
    assignedToId: string;
    createdDateFilter: string;
}

interface LeadsApiResponse {
    items: Lead[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
}

const fetchLeads = async ({ fetch, pageNumber, pageSize, sortBy, sortDirection, searchTerm, status, assignedToId, createdDateFilter }: FetchLeadsParams) => {
    const params = new URLSearchParams({
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString(),
        sortBy,
        sortDirection
    });

    if (searchTerm.trim()) {
        params.set('search', searchTerm.trim());
    }
    
    if (status.trim()) {
        params.set('status', status.trim());
    }
    
    if (assignedToId.trim()) {
        params.set('assignedToId', assignedToId.trim());
    }
    
    if (createdDateFilter.trim() && createdDateFilter !== 'all') {
        params.set('createdDateFilter', createdDateFilter.trim());
    }

    const apiUrl = `/leads?${params.toString()}`;
    const response = await ApiClient.get<LeadsApiResponse>(fetch, apiUrl);

    if (response.isOk && response.value) {
        return {
            value: response.value.items || response.value, // Handle both formats
            page: response.value.pageNumber || pageNumber,
            total: response.value.totalCount || (Array.isArray(response.value) ? response.value.length : 0),
            count: response.value.items?.length || (Array.isArray(response.value) ? response.value.length : 0),
            isOk: true
        };
    }

    return {
        value: [],
        page: 1,
        total: 0,
        count: 0,
        isOk: false
    };
};

interface FetchDataParams {
    fetch: (input: string, init?: RequestInit) => Promise<Response>;
}

const fetchCountries = async ({ fetch }: FetchDataParams) => {
    const response = await ApiClient.get<CountrySelectOption[]>(fetch, '/utility/lookup/address/countries');
    
    if (response.isOk && response.value) {
        return response.value;
    }
    
    return [];
};

const fetchStates = async ({ fetch }: FetchDataParams) => {
    const response = await ApiClient.get<StateSelectOption[]>(fetch, '/utility/lookup/address/states');
    
    if (response.isOk && response.value) {
        return response.value;
    }
    
    return [];
};

interface SalesRepresentative {
    id: string;
    firstName: string;
    lastName: string;
    emailAddress?: string;
    displayName: string;
}

const fetchSalesRepresentatives = async ({ fetch }: FetchDataParams) => {
    const response = await ApiClient.get<SalesRepresentative[]>(fetch, '/organization/company/employee/sales-representatives');
    
    if (response.isOk && response.value) {
        return response.value;
    }
    
    return [];
};

export const actions: Actions = {
    createLead: async ({ request, fetch }) => {
        const form = await superValidate(request, zod(LeadSchema));

        if (!form.valid) {
            return fail(400, { form });
        }

        try {
            // Call the backend API to create the lead
            const response = await ApiClient.post<Lead>(fetch, '/leads', form.data);
            
            if (response.isOk && response.value) {
                return {
                    form,
                    success: true,
                    leadId: response.value.id
                };
            } else {
                return fail(400, {
                    form,
                    error: 'Failed to create lead',
                    details: response.error?.error || 'Unknown error'
                });
            }
        } catch (error) {
            console.error('Error creating lead:', error);
            return fail(500, {
                form,
                error: 'Internal server error'
            });
        }
    },

    search: async ({ request, fetch }) => {
        const formData = await request.formData();
        const searchTerm = formData.get('search')?.toString() || '';
        const pageNumber = Number(formData.get('pageNumber')) || 1;
        const pageSize = Number(formData.get('pageSize')) || 10;
        const sortBy = formData.get('sortBy')?.toString() || 'lastName';
        const sortDirection = formData.get('sortDirection')?.toString() || 'asc';
        const status = formData.get('status')?.toString() || '';
        const assignedToId = formData.get('assignedToId')?.toString() || '';
        const createdDateFilter = formData.get('createdDateFilter')?.toString() || 'all';

        try {
            const searchResults = await fetchLeads({ 
                fetch, 
                pageNumber, 
                pageSize, 
                sortBy, 
                sortDirection, 
                searchTerm,
                status,
                assignedToId,
                createdDateFilter
            });
            
            return {
                searchResults,
                searchTerm,
                success: true
            };
        } catch (error) {
            console.error('Search error:', error);
            return fail(500, {
                error: 'Search failed',
                searchTerm
            });
        }
    }
}; 