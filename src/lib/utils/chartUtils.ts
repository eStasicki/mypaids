import type { Month } from "../types";
import { getTotalForMonth } from "./monthUtils";
import { DEFAULT_CATEGORIES, type Category } from "./categoryUtils";

export function getChartLabels(months: Month[]): string[] {
	return months.map((m) => m.date.toLocaleDateString("pl-PL", { month: "short", year: "numeric" }));
}

export function getChartData(months: Month[]): number[] {
	return months.map((m) => getTotalForMonth(m));
}

export function getChartDataByCategory(months: Month[]): Record<string, number[]> {
	const categoryData: Record<string, number[]> = {};

	DEFAULT_CATEGORIES.forEach((category) => {
		categoryData[category.id] = months.map((month) => {
			return month.bills
				.filter((bill) => bill.categoryId === category.id)
				.reduce((sum, bill) => sum + (bill.amount ?? 0), 0);
		});
	});

	return categoryData;
}

export function getCategoryTotals(months: Month[]): Array<{ category: Category; total: number }> {
	const totals = new Map<string, number>();

	months.forEach((month) => {
		month.bills.forEach((bill) => {
			if (bill.categoryId && bill.amount !== null) {
				const current = totals.get(bill.categoryId) || 0;
				totals.set(bill.categoryId, current + bill.amount);
			}
		});
	});

	return DEFAULT_CATEGORIES.map((category) => ({
		category,
		total: totals.get(category.id) || 0,
	}))
		.filter((item) => item.total > 0)
		.sort((a, b) => b.total - a.total);
}

export const CHART_COLORS = {
	primary: "rgb(59, 130, 246)",
	primaryAlpha: "rgba(59, 130, 246, 0.7)",
	primaryLight: "rgba(59, 130, 246, 0.1)",
	primaryMedium: "rgba(59, 130, 246, 0.3)",
	border: "rgba(59, 130, 246, 0.5)",
} as const;

export const CHART_CONFIG = {
	responsive: true,
	maintainAspectRatio: false,
	plugins: {
		legend: {
			display: true,
			labels: {
				color: "#e5e7eb",
			},
		},
		tooltip: {
			backgroundColor: "rgba(31, 41, 55, 0.9)",
			titleColor: "#fff",
			bodyColor: "#e5e7eb",
			borderColor: CHART_COLORS.border,
			borderWidth: 1,
		},
	},
	scales: {
		y: {
			beginAtZero: true,
			ticks: {
				color: "#9ca3af",
				callback: function (value: unknown) {
					return `${value} zł`;
				},
			},
			grid: {
				color: "rgba(107, 114, 128, 0.2)",
			},
		},
		x: {
			ticks: {
				color: "#9ca3af",
			},
			grid: {
				color: "rgba(107, 114, 128, 0.2)",
			},
		},
	},
} as const;
