import { _ } from 'svelte-i18n';
import { get } from 'svelte/store';
import { browser } from '$app/environment';

export function t(key: string, fallback?: string): string {
	if (!browser) {
		return fallback || key.split('.').pop() || key;
	}
	try {
		return get(_)(key) || fallback || key.split('.').pop() || key;
	} catch {
		return fallback || key.split('.').pop() || key;
	}
}

