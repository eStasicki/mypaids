import type { Month } from '../types';
import { getTotalForMonth } from './monthUtils';

export function getChartLabels(months: Month[]): string[] {
	return months.map((m) =>
		m.date.toLocaleDateString('pl-PL', { month: 'short', year: 'numeric' })
	);
}

export function getChartData(months: Month[]): number[] {
	return months.map((m) => getTotalForMonth(m));
}

export const CHART_COLORS = {
	primary: 'rgb(59, 130, 246)',
	primaryAlpha: 'rgba(59, 130, 246, 0.7)',
	primaryLight: 'rgba(59, 130, 246, 0.1)',
	primaryMedium: 'rgba(59, 130, 246, 0.3)',
	border: 'rgba(59, 130, 246, 0.5)'
} as const;

export const CHART_CONFIG = {
	responsive: true,
	maintainAspectRatio: false,
	plugins: {
		legend: {
			display: true,
			labels: {
				color: '#e5e7eb'
			}
		},
		tooltip: {
			backgroundColor: 'rgba(31, 41, 55, 0.9)',
			titleColor: '#fff',
			bodyColor: '#e5e7eb',
			borderColor: CHART_COLORS.border,
			borderWidth: 1
		}
	},
	scales: {
		y: {
			beginAtZero: true,
			ticks: {
				color: '#9ca3af',
				callback: function (value: unknown) {
					return `${value} zł`;
				}
			},
			grid: {
				color: 'rgba(107, 114, 128, 0.2)'
			}
		},
		x: {
			ticks: {
				color: '#9ca3af'
			},
			grid: {
				color: 'rgba(107, 114, 128, 0.2)'
			}
		}
	}
} as const;

