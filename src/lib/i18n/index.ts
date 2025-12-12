import { register, init, getLocaleFromNavigator } from 'svelte-i18n';
import plPL from './pl-PL.json';

register('pl-PL', () => Promise.resolve(plPL));

const isBrowser = typeof window !== 'undefined';

init({
	fallbackLocale: 'pl-PL',
	initialLocale: isBrowser ? (getLocaleFromNavigator() || 'pl-PL') : 'pl-PL',
});

