<script lang="ts">
	import { months, user } from "$lib/stores";
	import { onMount } from "svelte";
	import LineChart from "$lib/components/charts/LineChart.svelte";
	import BarChart from "$lib/components/charts/BarChart.svelte";
	import AreaChart from "$lib/components/charts/AreaChart.svelte";
	import type { Month } from "$lib/types";
	import { loadMonthsFromSupabase } from "$lib/utils/supabaseUtils";
	import { browser } from "$app/environment";
	import { goto } from "$app/navigation";
	import {
		getTotalForAllMonths,
		getAveragePerMonth,
		getAvailableYears,
		filterMonthsByYears,
		sortMonthsByDate,
	} from "$lib/utils/monthUtils";
	import { DEFAULT_CATEGORIES, getCategoryById, type Category } from "$lib/utils/categoryUtils";
	import { getCategoryTotals } from "$lib/utils/chartUtils";
	import { t } from "$lib/utils/i18n";
	import { tick } from "svelte";
	import {
		getMostExpensiveBills,
		getCategoryStatistics,
		getTrends,
		getYearComparison,
		getBillTypeAverage,
		type TrendData,
		type YearComparison,
	} from "$lib/utils/statisticsUtils";

	let chartType = $state<"line" | "bar" | "area">("line");
	let loadedMonths = $state<Month[]>([]);
	let selectedYears = $state<Set<number>>(new Set());
	let selectedCategories = $state<Set<string>>(new Set());
	let showCategoryFilter = $state(false);
	let showDetailedStats = $state(false);
	let detailedStatsRef: HTMLElement | null = $state(null);
	let currentUser = $derived($user);
	let categoryTotalsPromise = $state<Promise<Array<{ category: Category; total: number }>> | null>(null);
	let categoryCache = $state<Map<string, Category>>(new Map());

	if (browser) {
		$effect(() => {
			if (!currentUser) {
				goto("/");
			}
		});
	}

	onMount(() => {
		if (browser) {
			loadMonthsFromSupabase()
				.then((loaded) => {
					loadedMonths = sortMonthsByDate(loaded, true);

					if (selectedYears.size === 0 && loadedMonths.length > 0) {
						const availableYears = new Set(loadedMonths.map((m) => m.date.getFullYear()));
						selectedYears = availableYears;
					}

					if (selectedCategories.size === 0) {
						const allCategoryIds = new Set<string>();
						loadedMonths.forEach((month) => {
							month.bills.forEach((bill) => {
								if (bill.categoryId) {
									allCategoryIds.add(bill.categoryId);
								}
							});
						});
						selectedCategories = allCategoryIds;
					}
				})
				.catch((error) => {
					console.error("Failed to load months from Supabase:", error);
				});
		}

		const unsubscribe = months.subscribe((value) => {
			const sorted = sortMonthsByDate(value, true);
			loadedMonths = sorted;

			if (selectedYears.size === 0 && sorted.length > 0) {
				const availableYears = new Set(sorted.map((m) => m.date.getFullYear()));
				selectedYears = availableYears;
			}

			if (selectedCategories.size === 0) {
				const allCategoryIds = new Set<string>();
				sorted.forEach((month) => {
					month.bills.forEach((bill) => {
						if (bill.categoryId) {
							allCategoryIds.add(bill.categoryId);
						}
					});
				});
				selectedCategories = allCategoryIds;
			}
		});

		return () => {
			unsubscribe();
		};
	});

	function getFilteredMonths() {
		let filtered = filterMonthsByYears(loadedMonths, selectedYears);

		if (selectedCategories.size > 0) {
			filtered = filtered.map((month) => ({
				...month,
				bills: month.bills.filter(
					(bill) => !bill.categoryId || selectedCategories.has(bill.categoryId)
				),
			}));
		}

		return filtered;
	}

	function toggleCategory(categoryId: string) {
		const updated = new Set(selectedCategories);
		if (updated.has(categoryId)) {
			updated.delete(categoryId);
		} else {
			updated.add(categoryId);
		}
		selectedCategories = updated;
	}

	function selectAllCategories() {
		const allCategoryIds = new Set<string>();
		loadedMonths.forEach((month) => {
			month.bills.forEach((bill) => {
				if (bill.categoryId) {
					allCategoryIds.add(bill.categoryId);
				}
			});
		});
		selectedCategories = allCategoryIds;
	}

	function deselectAllCategories() {
		selectedCategories = new Set();
	}

	function getAvailableCategoryIds(): string[] {
		const categoryIds = new Set<string>();
		loadedMonths.forEach((month) => {
			month.bills.forEach((bill) => {
				if (bill.categoryId) {
					categoryIds.add(bill.categoryId);
				}
			});
		});
		return Array.from(categoryIds);
	}

	async function loadCategory(categoryId: string): Promise<Category | null> {
		if (categoryCache.has(categoryId)) {
			return categoryCache.get(categoryId) || null;
		}
		const category = await getCategoryById(categoryId, t);
		if (category) {
			categoryCache.set(categoryId, category);
		}
		return category || null;
	}

	$effect(() => {
		const filtered = getFilteredMonths();
		if (filtered.length > 0) {
			categoryTotalsPromise = getCategoryTotals(filtered, t);
		} else {
			categoryTotalsPromise = Promise.resolve([]);
		}
	});

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

	$effect(() => {
		if (showDetailedStats && browser) {
			tick().then(() => {
				if (detailedStatsRef) {
					setTimeout(() => {
						if (detailedStatsRef) {
							const elementTop = detailedStatsRef.getBoundingClientRect().top + window.pageYOffset;
							const offset = 100;
							window.scrollTo({
								top: elementTop - offset,
								behavior: "smooth"
							});
						}
					}, 200);
				}
			});
		}
	});
</script>

<div class="container mx-auto px-4 py-8 max-w-7xl">
	<!-- svelte-ignore a11y_no_redundant_roles -->
	<header role="banner" class="mb-10">
		<div class="mb-6">
			<h1
				class="text-5xl font-bold bg-linear-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2 leading-normal"
			>
				Podsumowanie
			</h1>
			<p class="text-gray-400 text-sm">Analiza Twoich rachunków</p>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
			<div
				class="bg-linear-to-br from-gray-800/90 to-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
			>
				<div class="text-sm text-gray-400 mb-1">Łączna suma</div>
				<div class="text-3xl font-bold text-white">
					{getTotalAll().toFixed(2)} zł
				</div>
			</div>
			<div
				class="bg-linear-to-br from-gray-800/90 to-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
			>
				<div class="text-sm text-gray-400 mb-1">Średnia miesięczna</div>
				<div class="text-3xl font-bold text-white">
					{getAverage().toFixed(2)} zł
				</div>
			</div>
			<div
				class="bg-linear-to-br from-gray-800/90 to-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
			>
				<div class="text-sm text-gray-400 mb-1">Liczba miesięcy</div>
				<div class="text-3xl font-bold text-white">
					{getFilteredMonths().length}
				</div>
			</div>
		</div>

		{#if getAvailableYears(loadedMonths).length > 0}
			<div
				class="bg-linear-to-br from-gray-800/90 to-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 mb-6"
			>
				<div
					class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4"
				>
					<div>
						<h3 class="text-lg font-semibold text-white mb-1">Filtruj według roku</h3>
						<p class="text-sm text-gray-400">
							Wybierz lata, które mają być uwzględnione w wykresie
						</p>
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
							class="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 cursor-pointer {selectedYears.has(
								year
							)
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

		{#if getAvailableCategoryIds().length > 0}
			<div
				class="bg-linear-to-br from-gray-800/90 to-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 mb-6"
			>
				<div
					class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4"
				>
					<div>
						<h3 class="text-lg font-semibold text-white mb-1">Filtruj według kategorii</h3>
						<p class="text-sm text-gray-400">
							Wybierz kategorie, które mają być uwzględnione w wykresie
						</p>
					</div>
					<div class="flex gap-2">
						<button
							onclick={selectAllCategories}
							aria-label="Zaznacz wszystkie kategorie"
							class="px-3 py-1.5 text-sm bg-gray-700/50 hover:bg-gray-700 text-white rounded-lg transition-all duration-200 border border-gray-600/50 hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
						>
							Wszystkie
						</button>
						<button
							onclick={deselectAllCategories}
							aria-label="Odznacz wszystkie kategorie"
							class="px-3 py-1.5 text-sm bg-gray-700/50 hover:bg-gray-700 text-white rounded-lg transition-all duration-200 border border-gray-600/50 hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
						>
							Brak
						</button>
					</div>
				</div>
				<div class="flex flex-wrap gap-3">
					{#each getAvailableCategoryIds() as categoryId}
						{#await loadCategory(categoryId) then category}
							{#if category}
								<label
									class="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 cursor-pointer {selectedCategories.has(
										categoryId
									)
										? 'bg-blue-600/20 border-blue-500/50'
										: 'bg-gray-700/30 border-gray-600/50 hover:bg-gray-700/50'}"
									style={selectedCategories.has(categoryId)
										? `border-left-color: ${category.color};`
										: ""}
								>
									<input
										type="checkbox"
										checked={selectedCategories.has(categoryId)}
										onchange={() => toggleCategory(categoryId)}
										aria-label="Zaznacz kategorię {category.name}"
										class="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
									/>
									<span class="text-lg">{category.icon}</span>
									<span class="font-medium text-gray-300">{category.name}</span>
								</label>
							{/if}
						{/await}
					{/each}
				</div>
			</div>
		{/if}

		<div class="flex flex-wrap gap-2 mb-6">
			<button
				onclick={() => (chartType = "line")}
				aria-label="Wykres liniowy"
				class="px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer {chartType ===
				'line'
					? 'bg-linear-to-r from-blue-600 to-blue-500 text-white'
					: 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 border border-gray-600/50'}"
			>
				Liniowy
			</button>
			<button
				onclick={() => (chartType = "bar")}
				aria-label="Wykres słupkowy"
				class="px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer {chartType ===
				'bar'
					? 'bg-linear-to-r from-blue-600 to-blue-500 text-white'
					: 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 border border-gray-600/50'}"
			>
				Słupkowy
			</button>
			<button
				onclick={() => (chartType = "area")}
				aria-label="Wykres obszarowy"
				class="px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer {chartType ===
				'area'
					? 'bg-linear-to-r from-blue-600 to-blue-500 text-white'
					: 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 border border-gray-600/50'}"
			>
				Obszarowy
			</button>
			<button
				onclick={() => (showDetailedStats = !showDetailedStats)}
				aria-label={showDetailedStats
					? "Ukryj szczegółowe statystyki"
					: "Pokaż szczegółowe statystyki"}
				class="px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer {showDetailedStats
					? 'bg-linear-to-r from-purple-600 to-purple-500 text-white'
					: 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 border border-gray-600/50'}"
			>
				{showDetailedStats ? "Ukryj" : "Pokaż"} Statystyki
			</button>
		</div>
	</header>

	<div
		class="bg-linear-to-br from-gray-800/90 to-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-gray-700/50"
	>
		{#if loadedMonths.length === 0}
			<div class="text-center py-16">
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
							d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
						/>
					</svg>
				</div>
				<p class="text-xl font-semibold text-gray-300 mb-2">Brak danych do wyświetlenia</p>
				<p class="text-sm text-gray-500">Dodaj miesiące, aby zobaczyć podsumowanie</p>
			</div>
		{:else if getFilteredMonths().length === 0}
			<div class="text-center py-16">
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
							d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
						/>
					</svg>
				</div>
				<p class="text-xl font-semibold text-gray-300 mb-2">Brak danych dla wybranych filtrów</p>
				<p class="text-sm text-gray-500">
					Zaznacz przynajmniej jeden rok i kategorię, aby zobaczyć wykres
				</p>
			</div>
		{:else}
			<div class="mb-6">
				<h3 class="text-lg font-semibold text-white mb-4">Podsumowanie według kategorii</h3>
				{#await categoryTotalsPromise then categoryTotals}
					<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
						{#each categoryTotals as { category, total }}
							<div
								class="bg-gray-700/30 rounded-lg p-4 border border-gray-600/50"
								style="border-left: 4px solid {category.color};"
							>
								<div class="flex items-center gap-2 mb-2">
									<span class="text-xl">{category.icon}</span>
									<span class="font-medium text-white">{category.name}</span>
								</div>
								<div class="text-2xl font-bold text-white">
									{total.toFixed(2)} zł
								</div>
							</div>
						{/each}
					</div>
				{:catch}
					<div class="text-gray-400 text-sm">Błąd ładowania kategorii</div>
				{/await}
			</div>
			{#if chartType === "line"}
				<LineChart loadedMonths={getFilteredMonths()} />
			{:else if chartType === "bar"}
				<BarChart loadedMonths={getFilteredMonths()} />
			{:else if chartType === "area"}
				<AreaChart loadedMonths={getFilteredMonths()} />
			{/if}
		{/if}
	</div>

	{#if showDetailedStats && getFilteredMonths().length > 0}
		{@const filtered = getFilteredMonths()}
		{@const mostExpensive = getMostExpensiveBills(filtered, 10)}
		{@const categoryStats = getCategoryStatistics(filtered)}
		{@const trends = getTrends(filtered)}
		{@const yearComparison = getYearComparison(filtered)}
		{@const billTypeAverages = getBillTypeAverage(filtered)}

		<div bind:this={detailedStatsRef} class="mt-8 space-y-6">
			<h2 class="text-3xl font-bold text-white mb-6">Szczegółowe statystyki</h2>

			<!-- Najdroższe rachunki -->
			{#if mostExpensive.length > 0}
				<div
					class="bg-linear-to-br from-gray-800/90 to-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-gray-700/50"
				>
					<h3 class="text-xl font-semibold text-white mb-4">Najdroższe rachunki</h3>
					<div class="space-y-2">
						{#each mostExpensive as item}
							<div
								class="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg border border-gray-600/50"
							>
								<div class="flex items-center gap-3">
									{#if item.bill.categoryId}
										{#await loadCategory(item.bill.categoryId) then category}
											{#if category}
												<span class="text-xl">{category.icon}</span>
											{/if}
										{/await}
									{/if}
									<div>
										<div class="font-medium text-white">{item.bill.name}</div>
										<div class="text-xs text-gray-400">
											{item.month.date.toLocaleDateString("pl-PL", {
												month: "long",
												year: "numeric",
											})}
										</div>
									</div>
								</div>
								<div class="text-right">
									<div class="font-bold text-white text-lg">
										{item.bill.amount?.toFixed(2)} zł
									</div>
									<div class="text-xs text-gray-400">
										z {item.totalInMonth.toFixed(2)} zł
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Statystyki kategorii -->
			{#if categoryStats.length > 0}
				<div
					class="bg-linear-to-br from-gray-800/90 to-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-gray-700/50"
				>
					<h3 class="text-xl font-semibold text-white mb-4">Statystyki według kategorii</h3>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						{#each categoryStats as stat}
							{#await loadCategory(stat.categoryId) then category}
								{#if category}
									<div
										class="p-4 bg-gray-700/30 rounded-lg border border-gray-600/50"
										style="border-left: 4px solid {category.color};"
									>
										<div class="flex items-center gap-2 mb-2">
											<span class="text-2xl">{category.icon}</span>
											<h4 class="font-semibold text-white">{category.name}</h4>
										</div>
										<div class="space-y-1 text-sm">
											<div class="flex justify-between">
												<span class="text-gray-400">Łączna suma:</span>
												<span class="text-white font-medium">{stat.totalAmount.toFixed(2)} zł</span>
											</div>
											<div class="flex justify-between">
												<span class="text-gray-400">Średnia:</span>
												<span class="text-white font-medium">{stat.averageAmount.toFixed(2)} zł</span>
											</div>
											<div class="flex justify-between">
												<span class="text-gray-400">Liczba rachunków:</span>
												<span class="text-white font-medium">{stat.count}</span>
											</div>
										</div>
									</div>
								{/if}
							{/await}
						{/each}
					</div>
				</div>
			{/if}

			<!-- Trendy -->
			{#if trends.length > 1}
				<div
					class="bg-linear-to-br from-gray-800/90 to-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-gray-700/50"
				>
					<h3 class="text-xl font-semibold text-white mb-4">Trendy miesięczne</h3>
					<div class="space-y-2">
						{#each trends.slice(1) as trend}
							<div
								class="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg border border-gray-600/50"
							>
								<div>
									<div class="font-medium text-white">
										{trend.month.toLocaleDateString("pl-PL", {
											month: "long",
											year: "numeric",
										})}
									</div>
									<div class="text-sm text-gray-400">
										{#if trend.change > 0}
											<span class="text-red-400">↑ Wzrost</span>
										{:else if trend.change < 0}
											<span class="text-green-400">↓ Spadek</span>
										{:else}
											<span class="text-gray-400">→ Bez zmian</span>
										{/if}
									</div>
								</div>
								<div class="text-right">
									<div class="font-bold text-white">
										{trend.total.toFixed(2)} zł
									</div>
									<div
										class="text-sm {trend.change > 0
											? 'text-red-400'
											: trend.change < 0
												? 'text-green-400'
												: 'text-gray-400'}"
									>
										{trend.change > 0 ? "+" : ""}{trend.change.toFixed(2)} zł ({trend.changePercent >
										0
											? "+"
											: ""}{trend.changePercent.toFixed(1)}%)
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Porównanie lat -->
			{#if yearComparison.length > 1}
				<div
					class="bg-linear-to-br from-gray-800/90 to-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-gray-700/50"
				>
					<h3 class="text-xl font-semibold text-white mb-4">Porównanie lat</h3>
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{#each yearComparison as comparison}
							<div class="p-4 bg-gray-700/30 rounded-lg border border-gray-600/50">
								<h4 class="text-lg font-semibold text-white mb-3">
									{comparison.year}
								</h4>
								<div class="space-y-2 text-sm">
									<div class="flex justify-between">
										<span class="text-gray-400">Łączna suma:</span>
										<span class="text-white font-medium">{comparison.total.toFixed(2)} zł</span>
									</div>
									<div class="flex justify-between">
										<span class="text-gray-400">Średnia miesięczna:</span>
										<span class="text-white font-medium">{comparison.average.toFixed(2)} zł</span>
									</div>
									<div class="flex justify-between">
										<span class="text-gray-400">Liczba miesięcy:</span>
										<span class="text-white font-medium">{comparison.monthCount}</span>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Średnie dla typów rachunków -->
			{#if billTypeAverages.length > 0}
				<div
					class="bg-linear-to-br from-gray-800/90 to-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-gray-700/50"
				>
					<h3 class="text-xl font-semibold text-white mb-4">Średnie dla typów rachunków</h3>
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
						{#each billTypeAverages.slice(0, 15) as avg}
							<div class="p-3 bg-gray-700/30 rounded-lg border border-gray-600/50">
								<div class="font-medium text-white mb-1">{avg.name}</div>
								<div class="flex justify-between text-sm">
									<span class="text-gray-400">Średnia:</span>
									<span class="text-white font-semibold">{avg.average.toFixed(2)} zł</span>
								</div>
								<div class="flex justify-between text-xs text-gray-500 mt-1">
									<span>Wystąpień:</span>
									<span>{avg.count}</span>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>
