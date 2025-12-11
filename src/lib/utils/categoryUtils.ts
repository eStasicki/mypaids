export interface Category {
	id: string;
	name: string;
	color: string;
	icon: string;
}

export const DEFAULT_CATEGORIES: Category[] = [
	{
		id: 'electricity',
		name: 'Prąd',
		color: '#fbbf24',
		icon: '⚡'
	},
	{
		id: 'water',
		name: 'Woda',
		color: '#3b82f6',
		icon: '💧'
	},
	{
		id: 'gas',
		name: 'Gaz',
		color: '#ef4444',
		icon: '🔥'
	},
	{
		id: 'internet',
		name: 'Internet',
		color: '#8b5cf6',
		icon: '🌐'
	},
	{
		id: 'trash',
		name: 'Śmieci',
		color: '#10b981',
		icon: '🗑️'
	},
	{
		id: 'heating',
		name: 'Ogrzewanie',
		color: '#f97316',
		icon: '🔥'
	},
	{
		id: 'insurance',
		name: 'Ubezpieczenie',
		color: '#06b6d4',
		icon: '🛡️'
	},
	{
		id: 'other',
		name: 'Inne',
		color: '#6b7280',
		icon: '📋'
	}
];

export function getCategoryById(id: string): Category | undefined {
	return DEFAULT_CATEGORIES.find((cat) => cat.id === id);
}

export function getCategoryColor(id: string): string {
	const category = getCategoryById(id);
	return category?.color || DEFAULT_CATEGORIES[DEFAULT_CATEGORIES.length - 1].color;
}

export function getCategoryName(id: string): string {
	const category = getCategoryById(id);
	return category?.name || DEFAULT_CATEGORIES[DEFAULT_CATEGORIES.length - 1].name;
}

export function getCategoryIcon(id: string): string {
	const category = getCategoryById(id);
	return category?.icon || DEFAULT_CATEGORIES[DEFAULT_CATEGORIES.length - 1].icon;
}

