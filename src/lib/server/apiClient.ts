import {INTERNAL_API_URL} from "$env/static/private";
import type {Result} from "$lib/shared/models/result";

export class ApiClient {
    static async delete(route: string, token: string, companyId?: string) {
        return await this.fetchRoute("DELETE", route, null, token, companyId);
    }

    static async get<T>(route: string, token: string, companyId?: string): Promise<Result<T>> {
        return await this.fetchRoute("GET", route, null, token, companyId);
    }

    static async post<T>(route: string, content: T, token: string, companyId?: string): Promise<Result<T>> {
        return await this.fetchRoute("POST", route, JSON.stringify(content), token, companyId);
    }

    static async put<T>(route: string, content: any, token: string, companyId?: string): Promise<Result<T>> {
        return await this.fetchRoute("PUT", route, JSON.stringify(content), token, companyId);
    }

    private static buildRoute(route: string) {
        const root = INTERNAL_API_URL.endsWith("/") ? `${INTERNAL_API_URL}` : `${INTERNAL_API_URL}/`;
        return `${root}${route.startsWith("/") ? route.slice(1) : route}`
    }

    private static async fetchRoute<T>(method: "POST" | "DELETE" | "GET" | "PUT",
                                       route: string,
                                       content: string | null,
                                       token: string,
                                       companyId?: string,
                                       cache: RequestCache = "default"): Promise<Result<T>> {
        const request: RequestInit = {
            method,
            cache,
            body: content,
            headers: this.getHeaders(token, companyId),
        };

        const response = await fetch(this.buildRoute(route), request);
        return await response.json() as Result<T>;
    }

    private static getHeaders(token: string, companyId?: string) {
        const headers = new Headers();
        headers.set("Authorization", `Bearer ${token}`);
        headers.set("Content-Type", "application/json");
        if(companyId) {
            headers.set("x-pc-company", companyId);
        }
        return headers;
    }
}