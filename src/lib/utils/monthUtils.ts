import type { Month, Bill } from '../types';

export const MONTH_NAMES = [
	'Styczeń',
	'Luty',
	'Marzec',
	'Kwiecień',
	'Maj',
	'Czerwiec',
	'Lipiec',
	'Sierpień',
	'Wrzesień',
	'Październik',
	'Listopad',
	'Grudzień'
] as const;

export function getMonthName(date: Date): string {
	return MONTH_NAMES[date.getMonth()];
}

export function getTotalForMonth(month: Month): number {
	return month.bills.reduce((sum, bill) => sum + (bill.amount ?? 0), 0);
}

export function getTotalForAllMonths(months: Month[]): number {
	return months.reduce((sum, month) => sum + getTotalForMonth(month), 0);
}

export function getAveragePerMonth(months: Month[]): number {
	if (months.length === 0) return 0;
	return getTotalForAllMonths(months) / months.length;
}

export function sortMonthsByDate(months: Month[], ascending = false): Month[] {
	const sorted = [...months].sort((a, b) => a.date.getTime() - b.date.getTime());
	return ascending ? sorted : sorted.reverse();
}

export function getAvailableYears(months: Month[]): number[] {
	const years = new Set(months.map((m) => m.date.getFullYear()));
	return Array.from(years).sort((a, b) => b - a);
}

export function filterMonthsByYears(months: Month[], years: Set<number>): Month[] {
	if (years.size === 0) return [];
	return months.filter((m) => years.has(m.date.getFullYear()));
}

export function getMaxDaysInMonth(year: number, month: number): number {
	return new Date(year, month, 0).getDate();
}

export function createBill(name: string, amount: string | number | null): Bill {
	const parsedAmount =
		amount === null || amount === '' || amount === '-'
			? null
			: typeof amount === 'string'
				? parseFloat(amount.replace(',', '.')) || null
				: amount;

	return {
		id: crypto.randomUUID(),
		name: name.trim(),
		amount: parsedAmount === null || isNaN(parsedAmount) ? null : parsedAmount
	};
}

export function parseAmount(value: string): number | null {
	const trimmed = value.trim();
	if (trimmed === '' || trimmed === '-') return null;
	const parsed = parseFloat(trimmed.replace(',', '.'));
	return isNaN(parsed) ? null : parsed;
}

