<script lang="ts">
	import { getCategories, DEFAULT_CATEGORIES, type Category } from "$lib/utils/categoryUtils";
	import CategoryManager from "./CategoryManager.svelte";
	import { _ } from "svelte-i18n";
	import { get } from "svelte/store";
	import { browser } from "$app/environment";
	import { t } from "$lib/utils/i18n";

	let {
		selectedCategoryId,
		onSelect,
	}: { selectedCategoryId?: string; onSelect: (categoryId: string) => void } = $props();
	let isOpen = $state(false);
	let containerRef: HTMLDivElement | null = $state(null);
	let buttonRef: HTMLButtonElement | null = $state(null);
	let dropdownRef: HTMLDivElement | null = $state(null);
	let categoryManagerKey = $state(0);

	let categories = $state<Category[]>(DEFAULT_CATEGORIES);
	let isLoading = $state(false);

	async function loadCategories() {
		if (!browser) return;
		isLoading = true;
		try {
			categories = await getCategories((key: string) => {
				try {
					return get(_)(key) || key.split(".").pop() || key;
				} catch {
					return key.split(".").pop() || key;
				}
			});
		} catch {
			categories = DEFAULT_CATEGORIES;
		} finally {
			isLoading = false;
		}
	}

	$effect(() => {
		loadCategories();
	});

	function toggleDropdown() {
		isOpen = !isOpen;
		if (isOpen) {
			loadCategories();
		}
	}

	function selectCategory(categoryId: string) {
		onSelect(categoryId);
		isOpen = false;
	}

	function handleCategoryManagerClose() {
		categoryManagerKey++;
		loadCategories();
	}

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (target.closest(".category-manager-trigger") || target.closest(".category-manager-modal")) {
			return;
		}
		if (
			containerRef &&
			!containerRef.contains(target) &&
			dropdownRef &&
			!dropdownRef.contains(target)
		) {
			isOpen = false;
		}
	}

	$effect(() => {
		if (isOpen) {
			document.addEventListener("click", handleClickOutside);
			return () => {
				document.removeEventListener("click", handleClickOutside);
			};
		}
	});
</script>

<div bind:this={containerRef} class="relative" style="z-index: 1;">
	<button
		bind:this={buttonRef}
		type="button"
		onclick={toggleDropdown}
		aria-label={t("bills.category", "Kategoria")}
		aria-expanded={isOpen}
		class="flex items-center gap-2 px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm hover:bg-gray-700 hover:border-gray-600 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer min-w-[120px]"
	>
		{#if selectedCategoryId}
			{@const category = categories.find((c) => c.id === selectedCategoryId)}
			{#if category}
				<span class="text-lg">{category.icon}</span>
				<span class="flex-1 text-left">{category.name}</span>
			{:else}
				<span class="flex-1 text-left text-gray-400">{t("bills.category", "Kategoria")}</span>
			{/if}
		{:else}
			<span class="flex-1 text-left text-gray-400">{$_("bills.category")}</span>
		{/if}
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="h-4 w-4 text-gray-400"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			aria-hidden="true"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
		</svg>
	</button>

	{#if isOpen}
		<div
			bind:this={dropdownRef}
			class="absolute top-full left-0 mt-2 z-9999 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-w-max min-w-[200px]"
		>
			{#if isLoading}
				<div class="px-4 py-3 text-gray-400 text-sm">
					{t("common.loading", "Ładowanie...")}
				</div>
			{:else}
				<div class="max-h-64 overflow-y-auto">
					{#each categories as category}
						<button
							type="button"
							onclick={() => selectCategory(category.id)}
							aria-label={t(
								"searchFilters.selectCategory",
								`Zaznacz kategorię ${category.name}`
							).replace("{name}", category.name)}
							class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-700/50 transition-colors text-left cursor-pointer {selectedCategoryId ===
							category.id
								? 'bg-gray-700/30'
								: ''}"
						>
							<span class="text-lg">{category.icon}</span>
							<span class="flex-1 text-white text-sm">{category.name}</span>
							{#if selectedCategoryId === category.id}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-4 w-4 text-blue-400"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									aria-hidden="true"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M5 13l4 4L19 7"
									/>
								</svg>
							{/if}
						</button>
					{/each}
				</div>
				<div class="border-t border-gray-700 p-2" onclick={(e) => e.stopPropagation()}>
					<CategoryManager 
						key={categoryManagerKey} 
						onOpen={() => {
							isOpen = false;
						}}
					/>
				</div>
			{/if}
		</div>
	{/if}
</div>
