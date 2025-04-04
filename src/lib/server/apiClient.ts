import {INTERNAL_API_URL} from "$env/static/private";
import type {Result} from "$lib/shared/models/result";

export class ApiClient {
    static async delete(fetch: (input: string, init?: RequestInit) => Promise<Response>, route: string) {
        return await this.fetchRoute(fetch, "DELETE", route, null);
    }

    static async get<T>(fetch: (input: string, init?: RequestInit) => Promise<Response>, route: string): Promise<Result<T>> {
        return await this.fetchRoute<T>(fetch, 'GET', route, null);
    }

    static async post<T>(fetch: (input: string, init?: RequestInit) => Promise<Response>, route: string, content: T): Promise<Result<T>> {
        return await this.fetchRoute<T>(fetch, "POST", route, JSON.stringify(content));
    }

    static async put<T>(fetch: (input: string, init?: RequestInit) => Promise<Response>, route: string, content: any): Promise<Result<T>> {
        return await this.fetchRoute<T>(fetch, "PUT", route, JSON.stringify(content));
    }

    private static buildRoute(route: string) {
        const root = INTERNAL_API_URL.endsWith("/") ? `${INTERNAL_API_URL}` : `${INTERNAL_API_URL}/`;
        return `${root}${route.startsWith("/") ? route.slice(1) : route}`
    }

    private static async fetchRoute<T>(fetch: (input: string, init?: RequestInit) => Promise<Response>,
                                       method: "POST" | "DELETE" | "GET" | "PUT",
                                       route: string,
                                       content: string | null,
                                       cache: RequestCache = "default"): Promise<Result<T>> {
        const request: RequestInit = {
            method,
            cache,
            body: content,
        };

        const response = await fetch(this.buildRoute(route), request);
        return await response.json() as Result<T>;
    }
}