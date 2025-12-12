import type { Month, Bill } from "../types";
import { getTotalForMonth } from "./monthUtils";
import { getCategoryById, DEFAULT_CATEGORIES } from "./categoryUtils";

export interface BillStatistics {
	bill: Bill;
	month: Month;
	totalInMonth: number;
}

export interface CategoryStatistics {
	categoryId: string;
	totalAmount: number;
	averageAmount: number;
	count: number;
}

export interface TrendData {
	month: Date;
	total: number;
	change: number; // Zmiana w stosunku do poprzedniego miesiąca
	changePercent: number;
}

export interface YearComparison {
	year: number;
	total: number;
	average: number;
	monthCount: number;
}

export function getMostExpensiveBills(months: Month[], limit = 10): BillStatistics[] {
	const allBills: BillStatistics[] = [];

	months.forEach((month) => {
		const totalInMonth = getTotalForMonth(month);
		month.bills.forEach((bill) => {
			if (bill.amount !== null && bill.amount > 0) {
				allBills.push({
					bill,
					month,
					totalInMonth,
				});
			}
		});
	});

	return allBills.sort((a, b) => (b.bill.amount ?? 0) - (a.bill.amount ?? 0)).slice(0, limit);
}

export function getCategoryStatistics(months: Month[]): CategoryStatistics[] {
	const categoryMap = new Map<string, { total: number; count: number }>();

	months.forEach((month) => {
		month.bills.forEach((bill) => {
			if (bill.categoryId && bill.amount !== null) {
				const current = categoryMap.get(bill.categoryId) || { total: 0, count: 0 };
				categoryMap.set(bill.categoryId, {
					total: current.total + bill.amount,
					count: current.count + 1,
				});
			}
		});
	});

	return Array.from(categoryMap.entries())
		.map(([categoryId, data]) => ({
			categoryId,
			totalAmount: data.total,
			averageAmount: data.count > 0 ? data.total / data.count : 0,
			count: data.count,
		}))
		.sort((a, b) => b.totalAmount - a.totalAmount);
}

export function getTrends(months: Month[]): TrendData[] {
	const sortedMonths = [...months].sort((a, b) => a.date.getTime() - b.date.getTime());
	const trends: TrendData[] = [];

	sortedMonths.forEach((month, index) => {
		const total = getTotalForMonth(month);
		let change = 0;
		let changePercent = 0;

		if (index > 0) {
			const previousTotal = getTotalForMonth(sortedMonths[index - 1]);
			change = total - previousTotal;
			changePercent = previousTotal > 0 ? (change / previousTotal) * 100 : 0;
		}

		trends.push({
			month: month.date,
			total,
			change,
			changePercent,
		});
	});

	return trends;
}

export function getYearComparison(months: Month[]): YearComparison[] {
	const yearMap = new Map<number, { totals: number[]; months: Month[] }>();

	months.forEach((month) => {
		const year = month.date.getFullYear();
		const current = yearMap.get(year) || { totals: [], months: [] };
		current.totals.push(getTotalForMonth(month));
		current.months.push(month);
		yearMap.set(year, current);
	});

	return Array.from(yearMap.entries())
		.map(([year, data]) => ({
			year,
			total: data.totals.reduce((sum, t) => sum + t, 0),
			average:
				data.totals.length > 0
					? data.totals.reduce((sum, t) => sum + t, 0) / data.totals.length
					: 0,
			monthCount: data.months.length,
		}))
		.sort((a, b) => b.year - a.year);
}

export function getBillTypeAverage(
	months: Month[]
): Array<{ name: string; average: number; count: number }> {
	const billMap = new Map<string, { total: number; count: number }>();

	months.forEach((month) => {
		month.bills.forEach((bill) => {
			if (bill.amount !== null) {
				const current = billMap.get(bill.name) || { total: 0, count: 0 };
				billMap.set(bill.name, {
					total: current.total + bill.amount,
					count: current.count + 1,
				});
			}
		});
	});

	return Array.from(billMap.entries())
		.map(([name, data]) => ({
			name,
			average: data.count > 0 ? data.total / data.count : 0,
			count: data.count,
		}))
		.sort((a, b) => b.average - a.average);
}
