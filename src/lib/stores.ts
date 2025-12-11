import { writable } from 'svelte/store';
import type { Month } from './types';
import { loadTemplatesFromStorage } from './utils/templateUtils';
import type { BillTemplate } from './types';

export const months = writable<Month[]>([]);
export const newCardIds = writable<Set<string>>(new Set());

// Initialize templates store with data from localStorage
const initialTemplates = loadTemplatesFromStorage();
export const templates = writable<BillTemplate[]>(initialTemplates);
