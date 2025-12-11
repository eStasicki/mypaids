<script lang="ts">
	import { templates } from '$lib/stores';
	import { saveTemplatesToStorage, createTemplate, templateToBill } from '$lib/utils/templateUtils';
	import { DEFAULT_CATEGORIES, getCategoryById } from '$lib/utils/categoryUtils';
	import CategorySelector from './CategorySelector.svelte';
	import type { BillTemplate } from '$lib/types';

	let { show, onClose, onSelectTemplate }: {
		show: boolean;
		onClose: () => void;
		onSelectTemplate?: (template: BillTemplate) => void;
	} = $props();

	let isAdding = $state(false);
	let editingId = $state<string | null>(null);
	let templateName = $state('');
	let templateAmount = $state<string>('');
	let templateCategoryId = $state<string>('');
	let templateAutoAdd = $state(false);

	function handleAddTemplate() {
		if (!templateName.trim()) return;

		const amount = templateAmount.trim() === '' || templateAmount.trim() === '-'
			? null
			: parseFloat(templateAmount.replace(',', '.'));

		const newTemplate = createTemplate(
			templateName,
			isNaN(amount ?? 0) ? null : amount,
			templateCategoryId || undefined,
			templateAutoAdd
		);

		templates.update((ts) => {
			const updated = [...ts, newTemplate];
			saveTemplatesToStorage(updated);
			return updated;
		});

		templateName = '';
		templateAmount = '';
		templateCategoryId = '';
		templateAutoAdd = false;
		isAdding = false;
	}

	function handleDeleteTemplate(templateId: string) {
		templates.update((ts) => {
			const updated = ts.filter((t) => t.id !== templateId);
			saveTemplatesToStorage(updated);
			return updated;
		});
	}

	function handleEditTemplate(template: BillTemplate) {
		editingId = template.id;
		templateName = template.name;
		templateAmount = template.amount?.toString() ?? '';
		templateCategoryId = template.categoryId || '';
		templateAutoAdd = template.autoAdd;
		isAdding = true;
	}

	function handleSaveEdit() {
		if (!templateName.trim() || !editingId) return;

		const amount = templateAmount.trim() === '' || templateAmount.trim() === '-'
			? null
			: parseFloat(templateAmount.replace(',', '.'));

		templates.update((ts) => {
			const updated = ts.map((t) =>
				t.id === editingId
					? {
							...t,
							name: templateName.trim(),
							amount: isNaN(amount ?? 0) ? null : amount,
							categoryId: templateCategoryId || undefined,
							autoAdd: templateAutoAdd
						}
					: t
			);
			saveTemplatesToStorage(updated);
			return updated;
		});

		templateName = '';
		templateAmount = '';
		templateCategoryId = '';
		templateAutoAdd = false;
		editingId = null;
		isAdding = false;
	}

	function handleCancelEdit() {
		templateName = '';
		templateAmount = '';
		templateCategoryId = '';
		templateAutoAdd = false;
		editingId = null;
		isAdding = false;
	}

	function handleSelectTemplate(template: BillTemplate) {
		onSelectTemplate?.(template);
		onClose();
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			onClose();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			onClose();
		}
	}
</script>

{#if show}
	<div
		role="dialog"
		aria-modal="true"
		aria-labelledby="template-manager-title"
		onclick={handleBackdropClick}
		onkeydown={handleKeydown}
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4"
	>
		<div
			class="bg-gradient-to-br from-gray-800/95 to-gray-800/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700/50 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
		>
			<div class="flex items-center justify-between mb-6">
				<h2 id="template-manager-title" class="text-2xl font-bold text-white">
					Zarządzaj szablonami rachunków
				</h2>
				<button
					onclick={onClose}
					aria-label="Zamknij"
					class="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer"
				>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			{#if isAdding}
				<div class="mb-6 p-4 bg-gray-700/30 rounded-xl border border-gray-600/50">
					<h3 class="text-lg font-semibold text-white mb-4">
						{editingId ? 'Edytuj szablon' : 'Dodaj nowy szablon'}
					</h3>
					<div class="space-y-4">
						<div>
							<label for="template-name" class="block text-sm font-medium text-gray-300 mb-2">Nazwa</label>
							<input
								id="template-name"
								type="text"
								bind:value={templateName}
								placeholder="Nazwa rachunku"
								aria-label="Nazwa szablonu"
								class="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all cursor-text"
							/>
						</div>
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<label for="template-amount" class="block text-sm font-medium text-gray-300 mb-2">Kwota (zł)</label>
								<input
									id="template-amount"
									type="text"
									bind:value={templateAmount}
									placeholder="Kwota"
									aria-label="Kwota szablonu"
									class="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all cursor-text"
								/>
							</div>
							<div>
								<label class="block text-sm font-medium text-gray-300 mb-2">Kategoria</label>
								<CategorySelector
									selectedCategoryId={templateCategoryId}
									onSelect={(categoryId) => (templateCategoryId = categoryId)}
								/>
							</div>
						</div>
						<div class="flex items-center gap-2">
							<input
								id="template-auto-add"
								type="checkbox"
								bind:checked={templateAutoAdd}
								aria-label="Automatycznie dodawaj do nowych miesięcy"
								class="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
							/>
							<label for="template-auto-add" class="text-sm text-gray-300 cursor-pointer">
								Automatycznie dodawaj do nowych miesięcy
							</label>
						</div>
						<div class="flex gap-3 pt-2">
							<button
								onclick={editingId ? handleSaveEdit : handleAddTemplate}
								aria-label={editingId ? 'Zapisz zmiany' : 'Dodaj szablon'}
								class="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
							>
								{editingId ? 'Zapisz' : 'Dodaj'}
							</button>
							<button
								onclick={handleCancelEdit}
								aria-label="Anuluj"
								class="flex-1 px-6 py-3 bg-gray-700/50 hover:bg-gray-700 text-white rounded-xl font-medium transition-all duration-200 border border-gray-600/50 hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer"
							>
								Anuluj
							</button>
						</div>
					</div>
				</div>
			{:else}
				<button
					onclick={() => (isAdding = true)}
					aria-label="Dodaj nowy szablon"
					class="w-full mb-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer flex items-center justify-center gap-2"
				>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
					</svg>
					Dodaj nowy szablon
				</button>
			{/if}

			<div class="space-y-3">
				{#if $templates.length === 0}
					<div class="text-center py-12">
						<div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800/50 mb-4">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
							</svg>
						</div>
						<p class="text-lg font-semibold text-gray-300 mb-2">Brak szablonów</p>
						<p class="text-sm text-gray-500">Dodaj szablon, aby szybko dodawać powtarzalne rachunki</p>
					</div>
				{:else}
					{#each $templates as template (template.id)}
						<div class="bg-gray-700/30 rounded-xl p-4 border border-gray-600/50 hover:border-gray-600 transition-all">
							<div class="flex items-start justify-between gap-4">
								<div class="flex-1">
									<div class="flex items-center gap-3 mb-2">
										{#if template.categoryId}
											{@const category = getCategoryById(template.categoryId)}
											{#if category}
												<span class="text-xl">{category.icon}</span>
											{/if}
										{/if}
										<h4 class="text-lg font-semibold text-white">{template.name}</h4>
										{#if template.autoAdd}
											<span class="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded border border-green-500/30">
												Auto
											</span>
										{/if}
									</div>
									<div class="flex items-center gap-4 text-sm text-gray-400">
										<span>Kwota: {template.amount !== null ? `${template.amount.toFixed(2)} zł` : 'Brak'}</span>
										{#if template.categoryId}
											{@const category = getCategoryById(template.categoryId)}
											{#if category}
												<span>Kategoria: {category.name}</span>
											{/if}
										{/if}
									</div>
								</div>
								<div class="flex gap-2">
									{#if onSelectTemplate}
										<button
											onclick={() => handleSelectTemplate(template)}
											aria-label="Użyj szablonu {template.name}"
											class="px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-all duration-200 border border-green-500/30 hover:border-green-500/50 focus:outline-none focus:ring-2 focus:ring-green-500/50 cursor-pointer"
										>
											Użyj
										</button>
									{/if}
									<button
										onclick={() => handleEditTemplate(template)}
										aria-label="Edytuj szablon {template.name}"
										class="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-all duration-200 border border-blue-500/30 hover:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
									>
										Edytuj
									</button>
									<button
										onclick={() => handleDeleteTemplate(template.id)}
										aria-label="Usuń szablon {template.name}"
										class="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-all duration-200 border border-red-500/30 hover:border-red-500/50 focus:outline-none focus:ring-2 focus:ring-red-500/50 cursor-pointer"
									>
										Usuń
									</button>
								</div>
							</div>
						</div>
					{/each}
				{/if}
			</div>
		</div>
	</div>
{/if}

