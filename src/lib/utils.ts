import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
	type AnyCalendarDate,
	CalendarDate,
	fromDate,
	getLocalTimeZone,
	type ZonedDateTime
} from '@internationalized/date';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export class DateUtils {
	public static toDateTime(
		date?: Date | null,
		timezone: string | undefined = getLocalTimeZone()
	): ZonedDateTime | undefined {
		if (!date) return undefined;

		return fromDate(date, timezone);
	}

	public static toDate(date?: AnyCalendarDate): Date | undefined {
		if (date) {
			// Create date in UTC to avoid timezone issues
			return new Date(Date.UTC(date.year, date.month - 1, date.day));
		}
	}

	public static toCalendarDate(date?: Date | null): CalendarDate | undefined {
		if (!date) return undefined;

		return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
	}
}

/**
 * Generic utility to transform Date objects to strings for form compatibility
 * Recursively handles nested objects and arrays
 */
export function transformDatesForForms<T>(obj: T): T {
	if (obj === null || obj === undefined) return obj;

	if (obj instanceof Date) {
		return obj.toISOString().split('T')[0] as T;
	}

	if (Array.isArray(obj)) {
		return obj.map((item) => transformDatesForForms(item)) as T;
	}

	if (typeof obj === 'object') {
		const transformed = {} as T;
		for (const [key, value] of Object.entries(obj)) {
			(transformed as any)[key] = transformDatesForForms(value);
		}
		return transformed;
	}

	return obj;
}

/**
 * Safe date to string conversion with null handling
 */
export function dateToString(date: Date | string | null | undefined): string | null {
	if (!date) return null;
	if (typeof date === 'string') return date;
	if (date instanceof Date) return date.toISOString().split('T')[0];
	return null;
}
