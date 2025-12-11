<script lang="ts">
	import { months } from '$lib/stores';
	import { onMount } from 'svelte';
	import LineChart from '$lib/components/charts/LineChart.svelte';
	import BarChart from '$lib/components/charts/BarChart.svelte';
	import AreaChart from '$lib/components/charts/AreaChart.svelte';
	import type { Month } from '$lib/types';
	import { loadMonthsFromStorage } from '$lib/utils/storageUtils';
	import {
		getTotalForAllMonths,
		getAveragePerMonth,
		getAvailableYears,
		filterMonthsByYears,
		sortMonthsByDate
	} from '$lib/utils/monthUtils';

	let chartType = $state<'line' | 'bar' | 'area'>('line');
	let loadedMonths = $state<Month[]>([]);
	let selectedYears = $state<Set<number>>(new Set());

	onMount(() => {
		const loaded = loadMonthsFromStorage();
		loadedMonths = sortMonthsByDate(loaded, true);

		const unsubscribe = months.subscribe((value) => {
			const sorted = sortMonthsByDate(value, true);
			loadedMonths = sorted;
			
			if (selectedYears.size === 0 && sorted.length > 0) {
				const availableYears = new Set(sorted.map((m) => m.date.getFullYear()));
				selectedYears = availableYears;
			}
		});
		return unsubscribe;
	});

	function getFilteredMonths() {
		return filterMonthsByYears(loadedMonths, selectedYears);
	}

	function getTotalAll() {
		return getTotalForAllMonths(getFilteredMonths());
	}

	function getAverage() {
		return getAveragePerMonth(getFilteredMonths());
	}

	function toggleYear(year: number) {
		const updated = new Set(selectedYears);
		if (updated.has(year)) {
			updated.delete(year);
		} else {
			updated.add(year);
		}
		selectedYears = updated;
	}

	function selectAllYears() {
		const allYears = new Set(loadedMonths.map((m) => m.date.getFullYear()));
		selectedYears = allYears;
	}

	function deselectAllYears() {
		selectedYears = new Set();
	}
</script>

<div class="container mx-auto px-4 py-8 max-w-7xl">
	<header role="banner" class="mb-10">
		<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
			<div>
				<h1 class="text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
					Podsumowanie
				</h1>
				<p class="text-gray-400 text-sm">Analiza Twoich rachunków</p>
			</div>
			<a
				href="/"
				aria-label="Wróć do głównej strony"
				class="px-6 py-3 bg-gray-700/50 hover:bg-gray-700 text-white rounded-xl font-medium transition-all duration-200 border border-gray-600/50 hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer flex items-center gap-2"
			>
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
				</svg>
				Powrót
			</a>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
			<div class="bg-gradient-to-br from-gray-800/90 to-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
				<div class="text-sm text-gray-400 mb-1">Łączna suma</div>
				<div class="text-3xl font-bold text-white">{getTotalAll().toFixed(2)} zł</div>
			</div>
			<div class="bg-gradient-to-br from-gray-800/90 to-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
				<div class="text-sm text-gray-400 mb-1">Średnia miesięczna</div>
				<div class="text-3xl font-bold text-white">{getAverage().toFixed(2)} zł</div>
			</div>
			<div class="bg-gradient-to-br from-gray-800/90 to-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
				<div class="text-sm text-gray-400 mb-1">Liczba miesięcy</div>
				<div class="text-3xl font-bold text-white">{getFilteredMonths().length}</div>
			</div>
		</div>

		{#if getAvailableYears(loadedMonths).length > 0}
			<div class="bg-gradient-to-br from-gray-800/90 to-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 mb-6">
				<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
					<div>
						<h3 class="text-lg font-semibold text-white mb-1">Filtruj według roku</h3>
						<p class="text-sm text-gray-400">Wybierz lata, które mają być uwzględnione w wykresie</p>
					</div>
					<div class="flex gap-2">
						<button
							onclick={selectAllYears}
							aria-label="Zaznacz wszystkie lata"
							class="px-3 py-1.5 text-sm bg-gray-700/50 hover:bg-gray-700 text-white rounded-lg transition-all duration-200 border border-gray-600/50 hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
						>
							Wszystkie
						</button>
						<button
							onclick={deselectAllYears}
							aria-label="Odznacz wszystkie lata"
							class="px-3 py-1.5 text-sm bg-gray-700/50 hover:bg-gray-700 text-white rounded-lg transition-all duration-200 border border-gray-600/50 hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
						>
							Brak
						</button>
					</div>
				</div>
				<div class="flex flex-wrap gap-3">
					{#each getAvailableYears(loadedMonths) as year}
						<label
							class="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 cursor-pointer {selectedYears.has(year)
								? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
								: 'bg-gray-700/30 border-gray-600/50 text-gray-300 hover:bg-gray-700/50'}"
						>
							<input
								type="checkbox"
								checked={selectedYears.has(year)}
								onchange={() => toggleYear(year)}
								aria-label="Zaznacz rok {year}"
								class="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
							/>
							<span class="font-medium">{year}</span>
						</label>
					{/each}
				</div>
			</div>
		{/if}

		<div class="flex flex-wrap gap-2 mb-6">
			<button
				onclick={() => (chartType = 'line')}
				aria-label="Wykres liniowy"
				class="px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer {chartType === 'line'
					? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white'
					: 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 border border-gray-600/50'}"
			>
				Liniowy
			</button>
			<button
				onclick={() => (chartType = 'bar')}
				aria-label="Wykres słupkowy"
				class="px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer {chartType === 'bar'
					? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white'
					: 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 border border-gray-600/50'}"
			>
				Słupkowy
			</button>
			<button
				onclick={() => (chartType = 'area')}
				aria-label="Wykres obszarowy"
				class="px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer {chartType === 'area'
					? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white'
					: 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 border border-gray-600/50'}"
			>
				Obszarowy
			</button>
		</div>
	</header>

	<div class="bg-gradient-to-br from-gray-800/90 to-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-gray-700/50">
		{#if loadedMonths.length === 0}
			<div class="text-center py-16">
				<div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-800/50 mb-4">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
					</svg>
				</div>
				<p class="text-xl font-semibold text-gray-300 mb-2">Brak danych do wyświetlenia</p>
				<p class="text-sm text-gray-500">Dodaj miesiące, aby zobaczyć podsumowanie</p>
			</div>
		{:else if getFilteredMonths().length === 0}
			<div class="text-center py-16">
				<div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-800/50 mb-4">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
					</svg>
				</div>
				<p class="text-xl font-semibold text-gray-300 mb-2">Brak danych dla wybranych lat</p>
				<p class="text-sm text-gray-500">Zaznacz przynajmniej jeden rok, aby zobaczyć wykres</p>
			</div>
		{:else}
			{#if chartType === 'line'}
				<LineChart loadedMonths={getFilteredMonths()} />
			{:else if chartType === 'bar'}
				<BarChart loadedMonths={getFilteredMonths()} />
			{:else if chartType === 'area'}
				<AreaChart loadedMonths={getFilteredMonths()} />
			{/if}
		{/if}
	</div>
</div>

