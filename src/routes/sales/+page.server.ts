import { ApiClient } from '$lib/server/apiClient';
import type { RequestEvent } from '@sveltejs/kit';
import type { Lead } from '$lib/shared/models/lead';

export const load = async ({ fetch, url }: RequestEvent) => {
    const pageNumber = Number(url.searchParams.get('pageNumber')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 10;
    const sortBy = url.searchParams.get('sortBy') || 'lastName';
    const sortDirection = url.searchParams.get('sortDirection') || 'asc';

    return {
        leads: fetchLeads({ fetch, pageNumber, pageSize, sortBy, sortDirection })
    };
};

interface FetchLeadsParams {
    fetch: (input: string, init?: RequestInit) => Promise<Response>;
    pageNumber: number;
    pageSize: number;
    sortBy: string;
    sortDirection: string;
}

const fetchLeads = async ({ fetch, pageNumber, pageSize, sortBy, sortDirection }: FetchLeadsParams) => {
    const params = new URLSearchParams({
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString(),
        sortBy,
        sortDirection
    });

    const response = await ApiClient.get<Lead[]>(fetch, `/leads?${params.toString()}`);

    if (response.isOk && response.value) {
        return {
            value: response.value,
            page: pageNumber,
            total: response.value.length, // This would normally come from the API
            count: response.value.length,
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