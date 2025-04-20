import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
	type AnyCalendarDate,
	fromDate,
	getLocalTimeZone,
	type ZonedDateTime
} from '@internationalized/date';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export class DateUtils {
	public static toDateTime(date?: Date | null, timezone: string | undefined = getLocalTimeZone()): ZonedDateTime | undefined {
		if(!date) return undefined

		return fromDate(date, timezone)
	}

	public static toDate(date?: AnyCalendarDate): Date | undefined {
		if(date) {
			return new Date(date.year, date.month, date.day)
		}
	}
}