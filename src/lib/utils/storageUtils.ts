import type { Month } from '../types';

const STORAGE_KEY = 'mypaids-months';

export function loadMonthsFromStorage(): Month[] {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (!stored) return [];

		const parsed = JSON.parse(stored);
		return parsed.map((m: any) => ({
			...m,
			date: new Date(m.date),
			notes: m.notes || undefined,
			bills: (m.bills || []).map((b: any) => ({
				...b,
				categoryId: b.categoryId || undefined,
				comment: b.comment || undefined
			}))
		}));
	} catch (error) {
		console.error('Failed to load months from storage:', error);
		return [];
	}
}

export function saveMonthsToStorage(months: Month[]): void {
	try {
		const serialized = months.map((m) => ({
			...m,
			date: m.date.toISOString()
		}));
		localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
	} catch (error) {
		console.error('Failed to save months to storage:', error);
	}
}

