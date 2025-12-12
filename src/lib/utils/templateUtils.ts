import type { BillTemplate, Bill } from "../types";

const STORAGE_KEY = "mypaids-templates";

export function loadTemplatesFromStorage(): BillTemplate[] {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (!stored) return [];
		return JSON.parse(stored);
	} catch (error) {
		console.error("Failed to load templates from storage:", error);
		return [];
	}
}

export function saveTemplatesToStorage(templates: BillTemplate[]): void {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
	} catch (error) {
		console.error("Failed to save templates to storage:", error);
	}
}

export function createTemplate(
	name: string,
	amount: number | null,
	categoryId?: string,
	autoAdd = false
): BillTemplate {
	return {
		id: crypto.randomUUID(),
		name: name.trim(),
		amount,
		categoryId: categoryId || undefined,
		autoAdd,
	};
}

export function templateToBill(template: BillTemplate): Bill {
	return {
		id: crypto.randomUUID(),
		name: template.name,
		amount: template.amount,
		categoryId: template.categoryId,
	};
}
