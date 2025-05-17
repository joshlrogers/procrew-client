import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
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
	public static toDateTime(date?: Date | null, timezone: string | undefined = getLocalTimeZone()): ZonedDateTime | undefined {
		if(!date) return undefined

		return fromDate(date, timezone)
	}

	public static toDate(date?: AnyCalendarDate): Date | undefined {
		if(date) {
			return new Date(date.year, date.month, date.day)
		}
	}

	public static toCalendarDate(date?: Date | null): CalendarDate | undefined {
		if(!date) return undefined

		console.log(date);

		return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate())
	}
}