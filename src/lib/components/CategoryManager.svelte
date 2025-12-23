<script lang="ts">
	import {
		createUserCategory,
		updateUserCategory,
		deleteUserCategory,
		loadUserCategories,
		AVAILABLE_ICONS,
		type Category,
	} from "$lib/utils/categoryUtils";
	import { t } from "$lib/utils/i18n";
	import { categoryManagerOpen } from "$lib/stores/categoryManager";

	let { onOpen }: { onOpen?: () => void } = $props();

	let isOpen = $derived.by(() => $categoryManagerOpen);
	let userCategories = $state<Category[]>([]);
	let editingCategory: Category | null = $state(null);
	let categoryName = $state("");
	let selectedIcon = $state("📋");
	let selectedColor = $state("#6b7280");
	let isLoading = $state(false);
	let isLoadingCategories = $state(false);
	let error = $state<string | null>(null);
	let showDeleteConfirm = $state<Category | null>(null);

	const colors = [
		"#fbbf24",
		"#3b82f6",
		"#ef4444",
		"#8b5cf6",
		"#10b981",
		"#f97316",
		"#06b6d4",
		"#6b7280",
		"#ec4899",
		"#14b8a6",
		"#a855f7",
		"#f59e0b",
		"#84cc16",
		"#22d3ee",
		"#f43f5e",
	];

	async function loadCategories() {
		if (isLoadingCategories) return;
		isLoadingCategories = true;
		try {
			userCategories = await loadUserCategories();
		} catch (err) {
			console.error("Error loading categories:", err);
			userCategories = [];
		} finally {
			isLoadingCategories = false;
		}
	}

	async function openModal(event?: MouseEvent) {
		if (event) {
			event.stopPropagation();
		}
		if (onOpen) {
			onOpen();
		}
		categoryManagerOpen.set(true);
		await loadCategories();
	}

	function closeModal() {
		categoryManagerOpen.set(false);
		editingCategory = null;
		categoryName = "";
		selectedIcon = "📋";
		selectedColor = "#6b7280";
		error = null;
		showDeleteConfirm = null;
	}

	function startEdit(category: Category) {
		editingCategory = category;
		categoryName = category.name;
		selectedIcon = category.icon;
		selectedColor = category.color;
		error = null;
	}

	function cancelEdit() {
		editingCategory = null;
		categoryName = "";
		selectedIcon = "📋";
		selectedColor = "#6b7280";
		error = null;
	}

	async function saveCategory() {
		if (!categoryName.trim()) {
			error = t("categories.errors.nameRequired", "Nazwa kategorii jest wymagana");
			return;
		}

		isLoading = true;
		error = null;

		try {
			if (editingCategory) {
				await updateUserCategory(
					editingCategory.id,
					categoryName.trim(),
					selectedIcon,
					selectedColor
				);
			} else {
				await createUserCategory(categoryName.trim(), selectedIcon, selectedColor);
			}
			await loadCategories();
			cancelEdit();
		} catch (err: any) {
			error =
				err.message ||
				t("categories.errors.saveError", "Wystąpił błąd podczas zapisywania kategorii");
			console.error("Error saving category:", err);
		} finally {
			isLoading = false;
		}
	}

	function confirmDelete(category: Category) {
		showDeleteConfirm = category;
	}

	function cancelDelete() {
		showDeleteConfirm = null;
	}

	async function deleteCategory() {
		if (!showDeleteConfirm) return;

		const category = showDeleteConfirm;
		showDeleteConfirm = null;
		isLoading = true;
		error = null;

		try {
			await deleteUserCategory(category.id);
			await loadCategories();
			if (editingCategory?.id === category.id) {
				cancelEdit();
			}
		} catch (err: any) {
			error =
				err.message ||
				t("categories.errors.deleteError", "Wystąpił błąd podczas usuwania kategorii");
			console.error("Error deleting category:", err);
		} finally {
			isLoading = false;
		}
	}

	function handleEscape(event: KeyboardEvent) {
		if (event.key === "Escape" && $categoryManagerOpen) {
			closeModal();
		}
	}

	$effect(() => {
		if ($categoryManagerOpen) {
			document.body.style.overflow = "hidden";
			loadCategories();
			return () => {
				document.body.style.overflow = "";
			};
		}
	});
</script>

<svelte:window onkeydown={handleEscape} />

{#if $categoryManagerOpen}
	<div
		class="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto p-4"
		onclick={(e) => {
			if (e.target === e.currentTarget) {
				closeModal();
			}
		}}
		role="dialog"
		aria-modal="true"
		aria-labelledby="category-manager-title"
	>
		<div
			class="category-manager-modal bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-w-2xl w-full my-auto max-h-[90vh] overflow-hidden flex flex-col"
			onclick={(e) => e.stopPropagation()}
		>
			<div class="flex items-center justify-between p-6 border-b border-gray-700">
				<div>
					<h2 id="category-manager-title" class="text-xl font-semibold text-white">
						{t("categories.manage", "Zarządzaj kategoriami")}
					</h2>
					<p class="text-sm text-gray-400 mt-1">
						{editingCategory
							? t("categories.edit", "Edytuj kategorię")
							: userCategories.length === 0
								? t("categories.noCategoriesMessage", "Dodaj pierwszą kategorię, aby rozpocząć")
								: t("categories.add", "Dodaj kategorię")}
					</p>
				</div>
				<button
					type="button"
					onclick={closeModal}
					class="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-700/50"
					aria-label={t("common.close", "Zamknij")}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<div class="flex-1 overflow-y-auto p-6">
				<div class="space-y-6">
					{#if !editingCategory || userCategories.length > 0}
						<div>
							<label class="block text-sm font-medium text-gray-300 mb-2">
								{t("categories.name", "Nazwa kategorii")}
							</label>
							<input
								type="text"
								bind:value={categoryName}
								placeholder={t("categories.namePlaceholder", "np. Telefon")}
								class="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
								disabled={isLoading}
								onkeydown={(e) => {
									if (e.key === "Enter" && !isLoading && categoryName.trim()) {
										saveCategory();
									}
								}}
							/>
						</div>

						<div>
							<label class="block text-sm font-medium text-gray-300 mb-2">
								{t("categories.icon", "Ikona")}
							</label>
							<div
								class="grid grid-cols-10 gap-2 p-4 bg-gray-700/30 rounded-lg max-h-48 overflow-y-auto border border-gray-600/50"
							>
								{#each AVAILABLE_ICONS as icon}
									<button
										type="button"
										onclick={() => (selectedIcon = icon)}
										disabled={isLoading}
										class="text-2xl p-2 rounded-lg hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed {selectedIcon ===
										icon
											? 'bg-blue-600 ring-2 ring-blue-400 scale-110'
											: 'bg-gray-700/50'}"
										aria-label={t("categories.selectIcon", "Wybierz ikonę")}
									>
										{icon}
									</button>
								{/each}
							</div>
						</div>

						<div>
							<label class="block text-sm font-medium text-gray-300 mb-2">
								{t("categories.color", "Kolor")}
							</label>
							<div
								class="grid grid-cols-8 gap-2 p-4 bg-gray-700/30 rounded-lg border border-gray-600/50"
							>
								{#each colors as color}
									<button
										type="button"
										onclick={() => (selectedColor = color)}
										disabled={isLoading}
										class="h-10 rounded-lg border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed {selectedColor ===
										color
											? 'border-white scale-110 ring-2 ring-blue-400/50'
											: 'border-gray-600 hover:border-gray-500'}"
										style="background-color: {color}"
										aria-label={t("categories.selectColor", "Wybierz kolor")}
									/>
								{/each}
							</div>
						</div>

						{#if error}
							<div
								class="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm flex items-center gap-2"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-5 w-5 flex-shrink-0"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								<span>{error}</span>
							</div>
						{/if}

						<div class="flex gap-3 pt-2">
							{#if editingCategory}
								<button
									type="button"
									onclick={cancelEdit}
									disabled={isLoading}
									class="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
								>
									{t("common.cancel", "Anuluj")}
								</button>
								<button
									type="button"
									onclick={saveCategory}
									disabled={isLoading || !categoryName.trim()}
									class="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
								>
									{isLoading
										? t("common.loading", "Ładowanie...")
										: t("common.update", "Zaktualizuj")}
								</button>
							{:else}
								<button
									type="button"
									onclick={saveCategory}
									disabled={isLoading || !categoryName.trim()}
									class="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
								>
									{isLoading ? t("common.loading", "Ładowanie...") : t("common.save", "Zapisz")}
								</button>
							{/if}
						</div>
					{/if}
				</div>

				{#if userCategories.length > 0}
					<div class="mt-8 pt-6 border-t border-gray-700">
						<div class="flex items-center justify-between mb-4">
							<h3 class="text-lg font-semibold text-white">
								{t("categories.yourCategories", "Twoje kategorie")}
							</h3>
							{#if editingCategory}
								<button
									type="button"
									onclick={cancelEdit}
									class="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-4 w-4"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M12 6v6m0 0v6m0-6h6m-6 0H6"
										/>
									</svg>
									{t("categories.addNew", "Dodaj nową kategorię")}
								</button>
							{/if}
						</div>
						<div class="space-y-2">
							{#each userCategories as category}
								<div
									class="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors border {editingCategory?.id ===
									category.id
										? 'border-blue-500/50 bg-blue-500/10'
										: 'border-transparent'}"
								>
									<span class="text-2xl">{category.icon}</span>
									<div class="flex-1 min-w-0">
										<div class="text-white font-medium truncate">{category.name}</div>
									</div>
									<div
										class="w-6 h-6 rounded-full border-2 border-gray-600 flex-shrink-0"
										style="background-color: {category.color}"
									/>
									<button
										type="button"
										onclick={() => startEdit(category)}
										disabled={isLoading}
										class="p-2 text-blue-400 hover:text-blue-300 transition-colors rounded-lg hover:bg-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
										aria-label={t("common.edit", "Edytuj")}
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											class="h-5 w-5"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
											/>
										</svg>
									</button>
									<button
										type="button"
										onclick={() => confirmDelete(category)}
										disabled={isLoading}
										class="p-2 text-red-400 hover:text-red-300 transition-colors rounded-lg hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
										aria-label={t("common.delete", "Usuń")}
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											class="h-5 w-5"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
											/>
										</svg>
									</button>
								</div>
							{/each}
						</div>
					</div>
				{:else if !editingCategory}
					<div class="mt-8 pt-6 border-t border-gray-700 text-center py-8">
						<div class="text-gray-400 mb-2">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-12 w-12 mx-auto mb-3 opacity-50"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
								/>
							</svg>
						</div>
						<p class="text-gray-400 text-sm">
							{t("categories.noCategories", "Brak kategorii")}
						</p>
						<p class="text-gray-500 text-xs mt-1">
							{t("categories.noCategoriesMessage", "Dodaj pierwszą kategorię, aby rozpocząć")}
						</p>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

{#if showDeleteConfirm}
	<div
		class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto p-4"
	>
		<div class="bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-w-md w-full my-auto">
			<div class="p-6">
				<h3 class="text-lg font-semibold text-white mb-2">
					{t("common.delete", "Usuń")}
				</h3>
				<p class="text-gray-300 mb-1">
					{t("categories.deleteConfirm", 'Czy na pewno chcesz usunąć kategorię "{name}"?').replace(
						"{name}",
						showDeleteConfirm.name
					)}
				</p>
				<p class="text-sm text-gray-400 mb-6">
					{t(
						"categories.deleteConfirmDescription",
						"Ta operacja jest nieodwracalna. Wszystkie rachunki przypisane do tej kategorii pozostaną bez kategorii."
					)}
				</p>
				<div class="flex gap-3">
					<button
						type="button"
						onclick={cancelDelete}
						disabled={isLoading}
						class="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
					>
						{t("common.cancel", "Anuluj")}
					</button>
					<button
						type="button"
						onclick={deleteCategory}
						disabled={isLoading}
						class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
					>
						{isLoading ? t("common.loading", "Ładowanie...") : t("common.delete", "Usuń")}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
