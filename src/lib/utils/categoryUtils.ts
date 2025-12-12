export interface Category {
	id: string;
	name: string;
	color: string;
	icon: string;
}

export interface CategoryData {
	id: string;
	color: string;
	icon: string;
}

export const DEFAULT_CATEGORIES_DATA: CategoryData[] = [
	{
		id: "electricity",
		color: "#fbbf24",
		icon: "⚡",
	},
	{
		id: "water",
		color: "#3b82f6",
		icon: "💧",
	},
	{
		id: "gas",
		color: "#ef4444",
		icon: "🔥",
	},
	{
		id: "internet",
		color: "#8b5cf6",
		icon: "🌐",
	},
	{
		id: "trash",
		color: "#10b981",
		icon: "🗑️",
	},
	{
		id: "heating",
		color: "#f97316",
		icon: "🔥",
	},
	{
		id: "insurance",
		color: "#06b6d4",
		icon: "🛡️",
	},
	{
		id: "other",
		color: "#6b7280",
		icon: "📋",
	},
];

export function getCategories(t: (key: string) => string): Category[] {
	return DEFAULT_CATEGORIES_DATA.map((cat) => ({
		...cat,
		name: t(`categories.${cat.id}`),
	}));
}

export const DEFAULT_CATEGORIES: Category[] = DEFAULT_CATEGORIES_DATA.map((cat) => ({
	...cat,
	name: cat.id,
}));

export function getCategoryById(id: string, t?: (key: string) => string): Category | undefined {
	if (t) {
		const data = DEFAULT_CATEGORIES_DATA.find((cat) => cat.id === id);
		if (data) {
			return {
				...data,
				name: t(`categories.${id}`),
			};
		}
	}
	return DEFAULT_CATEGORIES.find((cat) => cat.id === id);
}

export function getCategoryColor(id: string): string {
	const category = DEFAULT_CATEGORIES_DATA.find((cat) => cat.id === id);
	return category?.color || DEFAULT_CATEGORIES_DATA[DEFAULT_CATEGORIES_DATA.length - 1].color;
}

export function getCategoryName(id: string, t?: (key: string) => string): string {
	if (t) {
		return t(`categories.${id}`) || id;
	}
	const category = getCategoryById(id);
	return category?.name || DEFAULT_CATEGORIES[DEFAULT_CATEGORIES.length - 1].name;
}

export function getCategoryIcon(id: string): string {
	const category = DEFAULT_CATEGORIES_DATA.find((cat) => cat.id === id);
	return category?.icon || DEFAULT_CATEGORIES_DATA[DEFAULT_CATEGORIES_DATA.length - 1].icon;
}
