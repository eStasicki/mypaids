import { createClient } from "$lib/supabase/client";

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

export interface UserCategory {
	id: string;
	user_id: string;
	name: string;
	icon: string;
	color: string;
	created_at: string;
	updated_at: string;
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

export const AVAILABLE_ICONS = [
	"⚡", "💧", "🔥", "🌐", "🗑️", "🛡️", "📋", "🏠", "🚗", "🍔",
	"☕", "📱", "💻", "🎮", "📺", "🎵", "📚", "✈️", "🏋️", "💊",
	"🎁", "💳", "💰", "📊", "🔧", "🌳", "🎨", "📷", "🎬", "🏥"
];

export async function loadUserCategories(): Promise<Category[]> {
	const supabase = createClient();
	const { data: { user } } = await supabase.auth.getUser();

	if (!user) {
		return [];
	}

	const { data, error } = await supabase
		.from("user_categories")
		.select("*")
		.eq("user_id", user.id)
		.order("created_at", { ascending: true });

	if (error) {
		console.error("Error loading user categories:", error);
		return [];
	}

	return (data || []).map((cat) => ({
		id: cat.id,
		name: cat.name,
		color: cat.color,
		icon: cat.icon,
	}));
}

export async function createUserCategory(name: string, icon: string, color: string): Promise<Category | null> {
	const supabase = createClient();
	const { data: { user } } = await supabase.auth.getUser();

	if (!user) {
		throw new Error("User not authenticated");
	}

	const { data, error } = await supabase
		.from("user_categories")
		.insert({
			user_id: user.id,
			name: name.trim(),
			icon,
			color,
		})
		.select()
		.single();

	if (error) {
		throw error;
	}

	return {
		id: data.id,
		name: data.name,
		color: data.color,
		icon: data.icon,
	};
}

export async function updateUserCategory(id: string, name: string, icon: string, color: string): Promise<Category | null> {
	const supabase = createClient();
	const { data: { user } } = await supabase.auth.getUser();

	if (!user) {
		throw new Error("User not authenticated");
	}

	const { data, error } = await supabase
		.from("user_categories")
		.update({
			name: name.trim(),
			icon,
			color,
		})
		.eq("id", id)
		.eq("user_id", user.id)
		.select()
		.single();

	if (error) {
		throw error;
	}

	return {
		id: data.id,
		name: data.name,
		color: data.color,
		icon: data.icon,
	};
}

export async function deleteUserCategory(id: string): Promise<void> {
	const supabase = createClient();
	const { data: { user } } = await supabase.auth.getUser();

	if (!user) {
		throw new Error("User not authenticated");
	}

	const { error } = await supabase
		.from("user_categories")
		.delete()
		.eq("id", id)
		.eq("user_id", user.id);

	if (error) {
		throw error;
	}
}

export async function getCategories(t: (key: string) => string): Promise<Category[]> {
	const defaultCategories = DEFAULT_CATEGORIES_DATA.map((cat) => ({
		...cat,
		name: t(`categories.${cat.id}`),
	}));

	const userCategories = await loadUserCategories();

	return [...defaultCategories, ...userCategories];
}

export const DEFAULT_CATEGORIES: Category[] = DEFAULT_CATEGORIES_DATA.map((cat) => ({
	...cat,
	name: cat.id,
}));

export async function getCategoryById(id: string, t?: (key: string) => string): Promise<Category | undefined> {
	const isDefaultCategory = DEFAULT_CATEGORIES_DATA.some((cat) => cat.id === id);

	if (isDefaultCategory) {
		const data = DEFAULT_CATEGORIES_DATA.find((cat) => cat.id === id);
		if (data) {
			return {
				...data,
				name: t ? t(`categories.${id}`) : id,
			};
		}
		return DEFAULT_CATEGORIES.find((cat) => cat.id === id);
	}

	const userCategories = await loadUserCategories();
	return userCategories.find((cat) => cat.id === id);
}

export function getCategoryColor(id: string): string {
	const category = DEFAULT_CATEGORIES_DATA.find((cat) => cat.id === id);
	return category?.color || DEFAULT_CATEGORIES_DATA[DEFAULT_CATEGORIES_DATA.length - 1].color;
}

export async function getCategoryName(id: string, t?: (key: string) => string): Promise<string> {
	const category = await getCategoryById(id, t);
	return category?.name || (t ? t(`categories.${id}`) || id : id);
}

export function getCategoryIcon(id: string): string {
	const category = DEFAULT_CATEGORIES_DATA.find((cat) => cat.id === id);
	return category?.icon || DEFAULT_CATEGORIES_DATA[DEFAULT_CATEGORIES_DATA.length - 1].icon;
}
