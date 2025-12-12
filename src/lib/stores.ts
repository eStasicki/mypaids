import { writable } from "svelte/store";
import type { Month } from "./types";
import { loadTemplatesFromStorage } from "./utils/templateUtils";
import type { BillTemplate } from "./types";
import type { User, Session } from "@supabase/supabase-js";

export const months = writable<Month[]>([]);
export const newCardIds = writable<Set<string>>(new Set());

const initialTemplates = loadTemplatesFromStorage();
export const templates = writable<BillTemplate[]>(initialTemplates);

export const user = writable<User | null>(null);
export const session = writable<Session | null>(null);
