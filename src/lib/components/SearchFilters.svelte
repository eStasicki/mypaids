<script lang="ts">
	import { DEFAULT_CATEGORIES, getCategories, type Category } from "$lib/utils/categoryUtils";
	import type { SearchFilters } from "$lib/utils/searchUtils";
	import { t } from "$lib/utils/i18n";
	import { onMount } from "svelte";

	let {
		filters,
		onFiltersChange,
	}: {
		filters: SearchFilters;
		onFiltersChange: (filters: SearchFilters) => void;
	} = $props();
	let isExpanded = $state(false);
	let categories = $state<Category[]>(DEFAULT_CATEGORIES);

	function updateFilters(updates: Partial<SearchFilters>) {
		onFiltersChange({ ...filters, ...updates });
	}

	function toggleCategory(categoryId: string) {
		const updated = new Set(filters.categoryIds);
		if (updated.has(categoryId)) {
			updated.delete(categoryId);
		} else {
			updated.add(categoryId);
		}
		updateFilters({ categoryIds: updated });
	}

	async function loadCategories() {
		try {
			categories = await getCategories(t);
		} catch {
			categories = DEFAULT_CATEGORIES;
		}
	}

	onMount(() => {
		loadCategories();
	});

	function selectAllCategories() {
		const allIds = new Set(categories.map((c) => c.id));
		updateFilters({ categoryIds: allIds });
	}

	function clearAllCategories() {
		updateFilters({ categoryIds: new Set() });
	}

	function clearFilters() {
		onFiltersChange({
			query: "",
			categoryIds: new Set(),
			minAmount: null,
			maxAmount: null,
			sortBy: "date",
			sortOrder: "desc",
		});
	}

	const hasActiveFilters =
		filters.query.trim() !== "" ||
		filters.categoryIds.size > 0 ||
		filters.minAmount !== null ||
		filters.maxAmount !== null ||
		filters.sortBy !== "date" ||
		filters.sortOrder !== "desc";
</script>

<div
	class="bg-linear-to-br from-gray-800/90 to-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 mb-6"
>
	<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
		<div class="flex items-center gap-3">
			<div
				class="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-blue-500/20"
			>
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
						d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
					/>
				</svg>
			</div>
			<div>
				<h3 class="text-lg font-semibold text-white">Wyszukiwanie i filtrowanie</h3>
				<p class="text-sm text-gray-400">Znajdź rachunki według różnych kryteriów</p>
			</div>
		</div>
		<div class="flex gap-2">
			{#if hasActiveFilters}
				<button
					onclick={clearFilters}
					aria-label="Wyczyść filtry"
					class="px-4 py-2 text-sm bg-gray-700/50 hover:bg-gray-700 text-white rounded-lg transition-all duration-200 border border-gray-600/50 hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer"
				>
					Wyczyść
				</button>
			{/if}
			<button
				onclick={() => (isExpanded = !isExpanded)}
				aria-label={isExpanded ? "Zwiń filtry" : "Rozwiń filtry"}
				aria-expanded={isExpanded}
				class="px-4 py-2 text-sm bg-gray-700/50 hover:bg-gray-700 text-white rounded-lg transition-all duration-200 border border-gray-600/50 hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer flex items-center gap-2"
			>
				<span>{isExpanded ? "Zwiń" : "Rozwiń"}</span>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-4 w-4 transition-transform {isExpanded ? 'rotate-180' : ''}"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					aria-hidden="true"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M19 9l-7 7-7-7"
					/>
				</svg>
			</button>
		</div>
	</div>

	<div class="mb-4">
		<input
			type="text"
			bind:value={filters.query}
			oninput={(e) => updateFilters({ query: e.currentTarget.value })}
			placeholder="Szukaj po nazwie rachunku..."
			aria-label="Wyszukaj rachunki"
			class="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all cursor-text"
		/>
	</div>

	{#if isExpanded}
		<div class="space-y-4 pt-4 border-t border-gray-700/50">
			<div>
				<label class="block text-sm font-medium text-gray-300 mb-2">Kategorie</label>
				<div class="flex flex-wrap gap-2 mb-2">
					<button
						onclick={selectAllCategories}
						aria-label="Zaznacz wszystkie kategorie"
						class="px-3 py-1.5 text-xs bg-gray-700/50 hover:bg-gray-700 text-white rounded-lg transition-all duration-200 border border-gray-600/50 hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
					>
						Wszystkie
					</button>
					<button
						onclick={clearAllCategories}
						aria-label="Odznacz wszystkie kategorie"
						class="px-3 py-1.5 text-xs bg-gray-700/50 hover:bg-gray-700 text-white rounded-lg transition-all duration-200 border border-gray-600/50 hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
					>
						Brak
					</button>
				</div>
				<div class="flex flex-wrap gap-2">
					{#each categories as category}
						<label
							class="flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 cursor-pointer {filters.categoryIds.has(
								category.id
							)
								? 'bg-blue-600/20 border-blue-500/50'
								: 'bg-gray-700/30 border-gray-600/50 hover:bg-gray-700/50'}"
							style={filters.categoryIds.has(category.id)
								? `border-left-color: ${category.color};`
								: ""}
						>
							<input
								type="checkbox"
								checked={filters.categoryIds.has(category.id)}
								onchange={() => toggleCategory(category.id)}
								aria-label="Zaznacz kategorię {category.name}"
								class="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
							/>
							<span class="text-base">{category.icon}</span>
							<span class="text-sm text-gray-300">{category.name}</span>
						</label>
					{/each}
				</div>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div>
					<label for="min-amount" class="block text-sm font-medium text-gray-300 mb-2"
						>Minimalna kwota (zł)</label
					>
					<input
						id="min-amount"
						type="number"
						bind:value={filters.minAmount}
						oninput={(e) =>
							updateFilters({
								minAmount: e.currentTarget.value ? parseFloat(e.currentTarget.value) : null,
							})}
						placeholder="0"
						min="0"
						step="0.01"
						aria-label="Minimalna kwota"
						class="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all cursor-text"
					/>
				</div>
				<div>
					<label for="max-amount" class="block text-sm font-medium text-gray-300 mb-2"
						>Maksymalna kwota (zł)</label
					>
					<input
						id="max-amount"
						type="number"
						bind:value={filters.maxAmount}
						oninput={(e) =>
							updateFilters({
								maxAmount: e.currentTarget.value ? parseFloat(e.currentTarget.value) : null,
							})}
						placeholder="Brak limitu"
						min="0"
						step="0.01"
						aria-label="Maksymalna kwota"
						class="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all cursor-text"
					/>
				</div>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div>
					<label for="sort-by" class="block text-sm font-medium text-gray-300 mb-2"
						>Sortuj według</label
					>
					<select
						id="sort-by"
						bind:value={filters.sortBy}
						onchange={(e) =>
							updateFilters({
								sortBy: e.currentTarget.value as "date" | "amount" | "name",
							})}
						aria-label="Sortuj według"
						class="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all cursor-pointer"
					>
						<option value="date">Data</option>
						<option value="amount">Kwota</option>
						<option value="name">Nazwa miesiąca</option>
					</select>
				</div>
				<div>
					<label for="sort-order" class="block text-sm font-medium text-gray-300 mb-2"
						>Kolejność</label
					>
					<select
						id="sort-order"
						bind:value={filters.sortOrder}
						onchange={(e) =>
							updateFilters({
								sortOrder: e.currentTarget.value as "asc" | "desc",
							})}
						aria-label="Kolejność sortowania"
						class="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all cursor-pointer"
					>
						<option value="desc">Malejąco</option>
						<option value="asc">Rosnąco</option>
					</select>
				</div>
			</div>
		</div>
	{/if}
</div>
