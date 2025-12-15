<script lang="ts">
	import { months } from "$lib/stores";
	import { onMount } from "svelte";
	import { _ } from "svelte-i18n";
	import { t } from "$lib/utils/i18n";
	import MonthCard from "$lib/components/MonthCard.svelte";
	import AddMonthForm from "$lib/components/AddMonthForm.svelte";
	import ExportImportModal from "$lib/components/ExportImportModal.svelte";
	import SearchFiltersComponent from "$lib/components/SearchFilters.svelte";
	import TemplateManager from "$lib/components/TemplateManager.svelte";
	import { loadMonthsFromSupabase } from "$lib/utils/supabaseUtils";
	import { sortMonthsByDate } from "$lib/utils/monthUtils";
	import { filterMonths, getSearchStats, type SearchFilters } from "$lib/utils/searchUtils";
	import { user } from "$lib/stores";
	import { browser } from "$app/environment";
	import { goto } from "$app/navigation";
	import { exportImportModalOpen, templateManagerOpen, addMonthFormOpen } from "$lib/stores/modals";
	import { getMonthName, getTotalForMonth } from "$lib/utils/monthUtils";
	import EditMonthModal from "$lib/components/EditMonthModal.svelte";
	import type { Month } from "$lib/types";

	let isLoading = $state(false);
	let currentUser = $derived($user);
	let showAddForm = $derived($addMonthFormOpen);
	let showExportImportModal = $derived($exportImportModalOpen);
	let showTemplateManager = $derived($templateManagerOpen);
	let highlightForm = $state(false);
	const VIEW_MODE_STORAGE_KEY = "mypaids-view-mode";

	function loadViewMode(): "cards" | "table" {
		if (!browser) return "cards";
		try {
			const stored = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
			if (stored === "cards" || stored === "table") {
				return stored;
			}
		} catch (error) {
			console.error("Failed to load view mode from storage:", error);
		}
		return "cards";
	}

	function saveViewMode(mode: "cards" | "table") {
		if (!browser) return;
		try {
			localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
		} catch (error) {
			console.error("Failed to save view mode to storage:", error);
		}
	}

	let viewMode = $state<"cards" | "table">(browser ? loadViewMode() : "cards");
	let editingMonth = $state<Month | null>(null);
	let showEditModal = $state(false);
	let searchFilters = $state<SearchFilters>({
		query: "",
		categoryIds: new Set(),
		minAmount: null,
		maxAmount: null,
		sortBy: "date",
		sortOrder: "desc",
	});

	if (browser) {
		$effect(() => {
			if (!currentUser) {
				goto("/");
			}
		});

		$effect(() => {
			if (showAddForm) {
				// Set highlight immediately when form opens
				highlightForm = true;
				// Remove highlight after animation completes
				const timer = setTimeout(() => {
					highlightForm = false;
				}, 1200);
				return () => {
					clearTimeout(timer);
				};
			} else {
				highlightForm = false;
			}
		});
	}

	import { saveMonthToSupabase, deleteMonthFromSupabase } from "$lib/utils/supabaseUtils";

	async function loadMonths() {
		if (!currentUser) {
			months.set([]);
			return;
		}

		isLoading = true;
		try {
			const loadedMonths = await loadMonthsFromSupabase();
			if (loadedMonths.length > 0) {
				months.set(sortMonthsByDate(loadedMonths));
			} else {
				months.set([]);
			}
		} catch (error) {
			console.error("Failed to load months from Supabase:", error);
			months.set([]);
		} finally {
			isLoading = false;
		}
	}

	onMount(async () => {
		if (browser) {
			await loadMonths();
		}
	});

	// React to user changes (login/logout)
	if (browser) {
		$effect(() => {
			if (currentUser) {
				loadMonths();
			} else {
				// Clear data when user logs out
				months.set([]);
			}
		});
	}

	$effect(() => {
		if (!browser || isLoading || !currentUser) return;

		const unsubscribe = months.subscribe(async (value) => {
			if (value.length === 0 || !currentUser) return;

			for (const month of value) {
				try {
					await saveMonthToSupabase(month);
				} catch (error) {
					console.error(`Failed to save month ${month.id}:`, error);
				}
			}
		});

		return unsubscribe;
	});
</script>

<div class="container mx-auto px-4 py-8 max-w-7xl">
	<header role="banner" class="mb-10">
		<h1
			class="text-5xl font-bold bg-linear-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2 leading-normal"
		>
			{t("app.title", "Moje Rachunki")}
		</h1>
		<p class="text-gray-400 text-sm">
			{t("app.subtitle", "Zarządzaj swoimi rachunkami domowymi")}
		</p>
	</header>

	{#if currentUser && showAddForm}
		<div
			id="add-month-form"
			class="mb-8 animate-fade-in"
			role="region"
			aria-labelledby="add-month-form-title"
		>
			<AddMonthForm onClose={() => addMonthFormOpen.set(false)} {highlightForm} />
		</div>
	{/if}

	{#if currentUser}
		<SearchFiltersComponent filters={searchFilters} onFiltersChange={(f) => (searchFilters = f)} />
	{/if}

	{#if isLoading}
		<div class="flex flex-col items-center justify-center py-16">
			<div
				class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800/50 mb-4"
			>
				<svg
					class="animate-spin h-8 w-8 text-blue-500"
					fill="none"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
					></circle>
					<path
						class="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					></path>
				</svg>
			</div>
			<p class="text-lg font-semibold text-gray-300 mb-2">Wczytywanie rachunków...</p>
			<p class="text-sm text-gray-500">Proszę czekać</p>
		</div>
	{:else if !currentUser}
		<div class="flex flex-col items-center justify-center py-16">
			<div
				class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-800/50 mb-4"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-10 w-10 text-gray-500"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
					/>
				</svg>
			</div>
			<p class="text-xl font-semibold text-gray-300 mb-2">
				Zaloguj się, aby zobaczyć swoje rachunki
			</p>
			<p class="text-sm text-gray-500">
				Musisz być zalogowany, aby przeglądać i zarządzać rachunkami
			</p>
		</div>
	{:else}
		{@const filteredMonths = filterMonths($months, searchFilters)}
		{@const stats = getSearchStats($months, searchFilters)}

		{#if searchFilters.query.trim() !== "" || searchFilters.categoryIds.size > 0 || searchFilters.minAmount !== null || searchFilters.maxAmount !== null}
			<div
				class="mb-6 p-4 bg-linear-to-br from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20"
			>
				<div class="flex flex-wrap items-center gap-4 text-sm">
					<div class="flex items-center gap-2">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5 text-blue-400"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							aria-hidden="true"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							/>
						</svg>
						<span class="text-gray-300">{t("monthsPage.found", "Znaleziono:")}</span>
						<span class="font-semibold text-white"
							>{stats.totalBills} {t("monthsPage.billsCount", "rachunków")}</span
						>
					</div>
					<div class="flex items-center gap-2">
						<span class="text-gray-300">{t("monthsPage.totalSum", "Łączna suma:")}</span>
						<span class="font-semibold text-white"
							>{stats.totalAmount.toFixed(2)} {t("bills.currency", "zł")}</span
						>
					</div>
					<div class="flex items-center gap-2">
						<span class="text-gray-300">{t("monthsPage.average", "Średnia:")}</span>
						<span class="font-semibold text-white"
							>{stats.averageAmount.toFixed(2)} {t("bills.currency", "zł")}</span
						>
					</div>
				</div>
			</div>
		{/if}

		{#if filteredMonths.length > 0}
			<div class="mb-6 flex justify-end">
				<button
					onclick={() => {
						viewMode = viewMode === "cards" ? "table" : "cards";
						saveViewMode(viewMode);
					}}
					aria-label={viewMode === "cards" ? "Przełącz na widok tabeli" : "Przełącz na widok kart"}
					class="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
				>
					{#if viewMode === "cards"}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5 text-gray-300"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							aria-hidden="true"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
							/>
						</svg>
						<span class="text-sm text-gray-300">Widok tabeli</span>
					{:else}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5 text-gray-300"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							aria-hidden="true"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
							/>
						</svg>
						<span class="text-sm text-gray-300">Widok kart</span>
					{/if}
				</button>
			</div>
		{/if}

		{#if viewMode === "cards"}
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{#each filteredMonths as month (month.id)}
					<MonthCard {month} />
				{:else}
					<div class="col-span-full text-center py-16">
						<div
							class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-800/50 mb-4"
						>
							{#if searchFilters.query.trim() !== "" || searchFilters.categoryIds.size > 0 || searchFilters.minAmount !== null || searchFilters.maxAmount !== null}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-10 w-10 text-gray-500"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
									/>
								</svg>
							{:else}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-10 w-10 text-gray-500"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
									/>
								</svg>
							{/if}
						</div>
						{#if searchFilters.query.trim() !== "" || searchFilters.categoryIds.size > 0 || searchFilters.minAmount !== null || searchFilters.maxAmount !== null}
							<p class="text-xl font-semibold text-gray-300 mb-2">
								{t("monthsPage.noSearchResults", "Brak wyników wyszukiwania")}
							</p>
							<p class="text-sm text-gray-500">
								{t("monthsPage.noSearchResultsMessage", "Spróbuj zmienić kryteria wyszukiwania")}
							</p>
						{:else if $months.length === 0}
							<p class="text-xl font-semibold text-gray-300 mb-2">
								{t("monthsPage.noMonths", "Brak dodanych miesięcy")}
							</p>
							<p class="text-sm text-gray-500">
								{t("monthsPage.noMonthsMessage", 'Kliknij "Dodaj Miesiąc", aby rozpocząć')}
							</p>
						{:else}
							<p class="text-xl font-semibold text-gray-300 mb-2">
								{t("monthsPage.noMonths", "Brak dodanych miesięcy")}
							</p>
							<p class="text-sm text-gray-500">
								{t("monthsPage.noMonthsMessage", 'Kliknij "Dodaj Miesiąc", aby rozpocząć')}
							</p>
						{/if}
					</div>
				{/each}
			</div>
		{:else}
			<div class="md:hidden space-y-4">
				{#each filteredMonths as month (month.id)}
					{@const paidBills = month.bills.filter((bill) => bill.amount !== null)}
					{@const billsList = paidBills
						.map((bill) => `${bill.name}: ${bill.amount?.toFixed(2) || 0}`)
						.join(", ")}
					{@const total = getTotalForMonth(month)}
					<div
						class="bg-gray-800/50 border border-gray-700/50 rounded-lg overflow-hidden hover:bg-gray-800/70 transition-colors"
					>
						<div class="border-b border-gray-700/50 px-4 py-3 flex items-center justify-between">
							<div class="text-white font-medium text-base">
								{getMonthName(month.date)}
								{month.date.getFullYear()}
							</div>
							<button
								onclick={() => {
									editingMonth = month;
									showEditModal = true;
								}}
								aria-label="Edytuj miesiąc {getMonthName(month.date)} {month.date.getFullYear()}"
								class="text-blue-400 hover:text-blue-300 transition-all duration-200 p-2 rounded-lg hover:bg-blue-500/10 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-5 w-5"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									aria-hidden="true"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
									/>
								</svg>
							</button>
						</div>
						<div class="border-b border-gray-700/50 px-4 py-3">
							<div class="text-xs text-gray-400 mb-1 uppercase tracking-wider">Data zapłacenia</div>
							<div class="text-gray-400 text-sm">
								zapłacono: {month.date.toLocaleDateString("pl-PL", {
									day: "numeric",
									month: "long",
									year: "numeric",
								})}
							</div>
						</div>
						<div class="border-b border-gray-700/50 px-4 py-3">
							<div class="text-xs text-gray-400 mb-1 uppercase tracking-wider">Rachunki</div>
							<div class="text-gray-300 text-sm">
								{#if billsList}
									{billsList}
								{:else}
									<span class="text-gray-500">Brak zapłaconych rachunków</span>
								{/if}
							</div>
						</div>
						<div class="px-4 py-3 flex items-center justify-between">
							<div class="text-xs text-gray-400 uppercase tracking-wider">Suma</div>
							<div class="text-white font-semibold text-lg">{total.toFixed(2)} ZŁ</div>
						</div>
					</div>
				{/each}
			</div>
			<div class="hidden md:block overflow-x-auto">
				<table
					class="w-full table-auto border-separate border-spacing-0 border border-gray-700/50 rounded-lg overflow-hidden"
				>
					<thead>
						<tr>
							<th
								class="text-left py-4 px-4 text-sm font-semibold text-gray-300 border-b border-r border-gray-700/50 whitespace-nowrap"
								>Miesiąc</th
							>
							<th
								class="text-left py-4 px-4 text-sm font-semibold text-gray-300 border-b border-r border-gray-700/50 whitespace-nowrap"
								>Data zapłacenia</th
							>
							<th
								class="text-left py-4 px-4 text-sm font-semibold text-gray-300 border-b border-r border-gray-700/50"
								>Rachunki</th
							>
							<th
								class="text-right py-4 px-4 text-sm font-semibold text-gray-300 border-b border-r border-gray-700/50 whitespace-nowrap"
								>Suma</th
							>
							<th class="w-12 py-4 px-4 border-b border-gray-700/50" aria-label="Akcje"></th>
						</tr>
					</thead>
					<tbody>
						{#each filteredMonths as month (month.id)}
							{@const paidBills = month.bills.filter((bill) => bill.amount !== null)}
							{@const billsList = paidBills
								.map((bill) => `${bill.name}: ${bill.amount?.toFixed(2) || 0}`)
								.join(", ")}
							{@const total = getTotalForMonth(month)}
							<tr class="hover:bg-gray-800/30 transition-colors">
								<td
									class="py-4 px-4 text-white font-medium border-b border-r border-gray-700/30 whitespace-nowrap"
								>
									{getMonthName(month.date)}
									{month.date.getFullYear()}
								</td>
								<td
									class="py-4 px-4 text-gray-400 border-b border-r border-gray-700/30 whitespace-nowrap"
								>
									zapłacono: {month.date.toLocaleDateString("pl-PL", {
										day: "numeric",
										month: "long",
										year: "numeric",
									})}
								</td>
								<td class="py-4 px-4 text-gray-300 border-b border-r border-gray-700/30">
									{#if billsList}
										{billsList}
									{:else}
										<span class="text-gray-500">Brak zapłaconych rachunków</span>
									{/if}
								</td>
								<td
									class="py-4 px-4 text-right text-white font-semibold border-b border-r border-gray-700/30 whitespace-nowrap"
								>
									{total.toFixed(2)} ZŁ
								</td>
								<td class="py-4 px-4 border-b border-gray-700/30">
									<button
										onclick={() => {
											editingMonth = month;
											showEditModal = true;
										}}
										aria-label="Edytuj miesiąc {getMonthName(
											month.date
										)} {month.date.getFullYear()}"
										class="text-blue-400 hover:text-blue-300 transition-all duration-200 p-2 rounded-lg hover:bg-blue-500/10 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											class="h-5 w-5"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
											aria-hidden="true"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
											/>
										</svg>
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	{/if}
</div>

<ExportImportModal show={showExportImportModal} onClose={() => exportImportModalOpen.set(false)} />
<TemplateManager show={showTemplateManager} onClose={() => templateManagerOpen.set(false)} />
<EditMonthModal
	show={showEditModal}
	month={editingMonth}
	onClose={() => {
		showEditModal = false;
		editingMonth = null;
	}}
/>
