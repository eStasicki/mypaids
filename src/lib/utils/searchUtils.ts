import type { Month, Bill } from '../types';
import { getMonthName } from './monthUtils';

export interface SearchFilters {
	query: string;
	categoryIds: Set<string>;
	minAmount: number | null;
	maxAmount: number | null;
	sortBy: 'date' | 'amount' | 'name';
	sortOrder: 'asc' | 'desc';
}

export function filterBills(bills: Bill[], filters: SearchFilters): Bill[] {
	let filtered = [...bills];

	// Filtrowanie po zapytaniu tekstowym
	if (filters.query.trim()) {
		const query = filters.query.toLowerCase().trim();
		filtered = filtered.filter((bill) =>
			bill.name.toLowerCase().includes(query)
		);
	}

	// Filtrowanie po kategoriach
	if (filters.categoryIds.size > 0) {
		filtered = filtered.filter((bill) =>
			bill.categoryId && filters.categoryIds.has(bill.categoryId)
		);
	}

	// Filtrowanie po kwocie
	if (filters.minAmount !== null) {
		filtered = filtered.filter((bill) => bill.amount !== null && bill.amount >= filters.minAmount!);
	}
	if (filters.maxAmount !== null) {
		filtered = filtered.filter((bill) => bill.amount !== null && bill.amount <= filters.maxAmount!);
	}

	return filtered;
}

export function filterMonths(months: Month[], filters: SearchFilters): Month[] {
	const hasActiveFilters = filters.query.trim() !== '' || 
		filters.categoryIds.size > 0 || 
		filters.minAmount !== null || 
		filters.maxAmount !== null;

	const filtered = months.map((month) => ({
		...month,
		bills: filterBills(month.bills, filters)
	}));

	const monthsToShow = hasActiveFilters
		? filtered.filter((month) => month.bills.length > 0)
		: filtered;

	const sorted = [...monthsToShow].sort((a, b) => {
		let comparison = 0;

		switch (filters.sortBy) {
			case 'date':
				comparison = a.date.getTime() - b.date.getTime();
				break;
			case 'amount':
				const aTotal = a.bills.reduce((sum, bill) => sum + (bill.amount ?? 0), 0);
				const bTotal = b.bills.reduce((sum, bill) => sum + (bill.amount ?? 0), 0);
				comparison = aTotal - bTotal;
				break;
			case 'name':
				const aName = getMonthName(a.date);
				const bName = getMonthName(b.date);
				comparison = aName.localeCompare(bName, 'pl');
				break;
		}

		return filters.sortOrder === 'asc' ? comparison : -comparison;
	});

	return sorted;
}

export function getSearchStats(months: Month[], filters: SearchFilters): {
	totalBills: number;
	totalAmount: number;
	averageAmount: number;
} {
	const filtered = filterMonths(months, filters);
	const allBills = filtered.flatMap((month) => month.bills);
	const totalBills = allBills.length;
	const totalAmount = allBills.reduce((sum, bill) => sum + (bill.amount ?? 0), 0);
	const averageAmount = totalBills > 0 ? totalAmount / totalBills : 0;

	return {
		totalBills,
		totalAmount,
		averageAmount
	};
}

