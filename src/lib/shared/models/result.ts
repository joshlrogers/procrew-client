import type {AppError} from "$lib/shared/models/appError";

export interface Result<T> {
    isOk: boolean;
    value: T | null;
    error: AppError | null;
}