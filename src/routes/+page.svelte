<script lang="ts">
	import { months } from '$lib/stores';
	import { onMount } from 'svelte';
	import MonthCard from '$lib/components/MonthCard.svelte';
	import AddMonthForm from '$lib/components/AddMonthForm.svelte';
	import { loadMonthsFromStorage, saveMonthsToStorage } from '$lib/utils/storageUtils';
	import { sortMonthsByDate } from '$lib/utils/monthUtils';

	let showAddForm = $state(false);

	onMount(() => {
		const loadedMonths = loadMonthsFromStorage();
		if (loadedMonths.length > 0) {
			months.set(sortMonthsByDate(loadedMonths));
		}
	});

	$effect(() => {
		const unsubscribe = months.subscribe((value) => {
			saveMonthsToStorage(value);
		});
		return unsubscribe;
	});
</script>

<div class="container mx-auto px-4 py-8 max-w-7xl">
	<header role="banner" class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
		<div>
			<h1 class="text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
				Moje Rachunki
			</h1>
			<p class="text-gray-400 text-sm">Zarządzaj swoimi rachunkami domowymi</p>
		</div>
		<div class="flex gap-3">
			<a
				href="/summary"
				aria-label="Przejdź do podsumowania"
				class="px-6 py-3 bg-gray-700/50 hover:bg-gray-700 text-white rounded-xl font-medium transition-all duration-200 border border-gray-600/50 hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer flex items-center gap-2 active:scale-95"
			>
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
				</svg>
				<span>Podsumowanie</span>
			</a>
			<button
				onclick={() => (showAddForm = !showAddForm)}
				aria-label={showAddForm ? 'Anuluj dodawanie miesiąca' : 'Dodaj nowy miesiąc'}
				aria-expanded={showAddForm}
				aria-controls="add-month-form"
				class="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 active:scale-95 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
			>
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
				</svg>
				<span>{showAddForm ? 'Anuluj' : 'Dodaj Miesiąc'}</span>
			</button>
		</div>
	</header>

	{#if showAddForm}
		<div id="add-month-form" class="mb-8 animate-fade-in" role="region" aria-labelledby="add-month-form-title">
			<AddMonthForm onClose={() => (showAddForm = false)} />
		</div>
	{/if}

	<div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
		{#each $months as month (month.id)}
			<MonthCard {month} />
		{:else}
			<div class="col-span-full text-center py-16">
				<div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-800/50 mb-4">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
					</svg>
				</div>
				<p class="text-xl font-semibold text-gray-300 mb-2">Brak dodanych miesięcy</p>
				<p class="text-sm text-gray-500">Kliknij "Dodaj Miesiąc", aby rozpocząć</p>
			</div>
		{/each}
	</div>
</div>
