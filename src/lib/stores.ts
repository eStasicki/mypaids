import { writable } from 'svelte/store';
import type { Month } from './types';

export const months = writable<Month[]>([]);
export const newCardIds = writable<Set<string>>(new Set());

