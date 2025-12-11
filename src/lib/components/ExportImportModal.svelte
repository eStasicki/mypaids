<script lang="ts">
	import { months } from '$lib/stores';
	import { exportToJSON, exportToCSV, downloadFile, parseImportedJSON, parseImportedCSV } from '$lib/utils/exportUtils';
	import { generatePDFReport } from '$lib/utils/pdfUtils';
	import { sortMonthsByDate, getMonthName } from '$lib/utils/monthUtils';
	import type { Month } from '$lib/types';

	let { show, onClose }: { show: boolean; onClose: () => void } = $props();
	let activeTab = $state<'export' | 'import'>('export');
	let importError = $state<string | null>(null);
	let importFile: File | null = $state(null);
	let selectedMonthsForExport = $state<Set<string>>(new Set());
	let showMonthSelection = $state(false);

	function getMonthsToExport(): Month[] {
		if (selectedMonthsForExport.size === 0) {
			return [];
		}
		return $months.filter((m) => selectedMonthsForExport.has(m.id));
	}

	function handleExportJSON() {
		const monthsToExport = getMonthsToExport();
		if (monthsToExport.length === 0) {
			importError = 'Wybierz przynajmniej jeden miesiąc do eksportu';
			return;
		}
		const data = exportToJSON(monthsToExport);
		const filename = `mypaids-export-${new Date().toISOString().split('T')[0]}.json`;
		downloadFile(data, filename, 'application/json');
		importError = null;
	}

	function handleExportCSV() {
		const monthsToExport = getMonthsToExport();
		if (monthsToExport.length === 0) {
			importError = 'Wybierz przynajmniej jeden miesiąc do eksportu';
			return;
		}
		const data = exportToCSV(monthsToExport);
		const filename = `mypaids-export-${new Date().toISOString().split('T')[0]}.csv`;
		downloadFile(data, filename, 'text/csv');
		importError = null;
	}

	function handleExportPDF() {
		const monthsToExport = getMonthsToExport();
		if (monthsToExport.length === 0) {
			importError = 'Wybierz przynajmniej jeden miesiąc do eksportu';
			return;
		}
		const title = `Raport Rachunków - ${new Date().toLocaleDateString('pl-PL')}`;
		generatePDFReport(monthsToExport, title);
		importError = null;
	}

	function toggleMonthSelection(monthId: string) {
		const updated = new Set(selectedMonthsForExport);
		if (updated.has(monthId)) {
			updated.delete(monthId);
		} else {
			updated.add(monthId);
		}
		selectedMonthsForExport = updated;
	}

	function selectAllMonths() {
		selectedMonthsForExport = new Set($months.map((m) => m.id));
	}

	function deselectAllMonths() {
		selectedMonthsForExport = new Set();
	}

	$effect(() => {
		if (show && activeTab === 'export') {
			importError = null;
		}
		if (!show) {
			selectedMonthsForExport = new Set();
			showMonthSelection = false;
			importError = null;
		}
	});

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		importFile = file;
		importError = null;
	}

	async function handleImport() {
		if (!importFile) {
			importError = 'Wybierz plik do importu';
			return;
		}

		try {
			const content = await importFile.text();
			let importedMonths: Month[];

			if (importFile.name.endsWith('.json')) {
				importedMonths = parseImportedJSON(content);
			} else if (importFile.name.endsWith('.csv')) {
				importedMonths = parseImportedCSV(content);
			} else {
				importError = 'Nieobsługiwany format pliku. Użyj JSON lub CSV.';
				return;
			}

			if (importedMonths.length === 0) {
				importError = 'Plik nie zawiera żadnych danych';
				return;
			}

			const sorted = sortMonthsByDate(importedMonths);
			months.set(sorted);
			onClose();
		} catch (error) {
			importError = error instanceof Error ? error.message : 'Błąd podczas importu pliku';
		}
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
		aria-labelledby="export-import-title"
		onclick={handleBackdropClick}
		onkeydown={handleKeydown}
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
	>
		<div
			class="bg-gradient-to-br from-gray-800/95 to-gray-800/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700/50 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto transform transition-all animate-fade-in"
		>
			<div class="flex items-center justify-between mb-6">
				<h2 id="export-import-title" class="text-2xl font-bold text-white">
					Eksport / Import danych
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

			<div class="flex gap-2 mb-6 border-b border-gray-700/50">
				<button
					onclick={() => (activeTab = 'export')}
					aria-label="Zakładka eksportu"
					class="px-4 py-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer {activeTab === 'export'
						? 'text-blue-400 border-b-2 border-blue-400'
						: 'text-gray-400 hover:text-gray-300'}"
				>
					Eksport
				</button>
				<button
					onclick={() => (activeTab = 'import')}
					aria-label="Zakładka importu"
					class="px-4 py-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer {activeTab === 'import'
						? 'text-blue-400 border-b-2 border-blue-400'
						: 'text-gray-400 hover:text-gray-300'}"
				>
					Import
				</button>
			</div>

			{#if activeTab === 'export'}
				<div class="space-y-4">
					<p class="text-gray-400 text-sm mb-4">
						Wyeksportuj swoje dane w formacie JSON, CSV lub PDF. Plik zostanie pobrany na Twoje urządzenie.
					</p>

					{#if $months.length > 0}
						<div class="mb-4">
							<div class="flex items-center justify-between mb-3">
								<label class="text-sm font-medium text-gray-300">
									Wybierz miesiące do eksportu ({selectedMonthsForExport.size} z {$months.length})
								</label>
								<div class="flex gap-2">
									<button
										onclick={selectAllMonths}
										aria-label="Zaznacz wszystkie miesiące"
										class="px-3 py-1 text-xs bg-gray-700/50 hover:bg-gray-700 text-white rounded-lg transition-all duration-200 border border-gray-600/50 hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
									>
										Wszystkie
									</button>
									<button
										onclick={deselectAllMonths}
										aria-label="Odznacz wszystkie miesiące"
										class="px-3 py-1 text-xs bg-gray-700/50 hover:bg-gray-700 text-white rounded-lg transition-all duration-200 border border-gray-600/50 hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
									>
										Brak
									</button>
									<button
										onclick={() => (showMonthSelection = !showMonthSelection)}
										aria-label={showMonthSelection ? 'Ukryj listę miesięcy' : 'Pokaż listę miesięcy'}
										aria-expanded={showMonthSelection}
										class="px-3 py-1 text-xs bg-gray-700/50 hover:bg-gray-700 text-white rounded-lg transition-all duration-200 border border-gray-600/50 hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer flex items-center gap-1"
									>
										<span>{showMonthSelection ? 'Ukryj' : 'Pokaż'}</span>
										<svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 transition-transform {showMonthSelection ? 'rotate-180' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
										</svg>
									</button>
								</div>
							</div>
							{#if showMonthSelection}
								<div class="max-h-48 overflow-y-auto bg-gray-700/30 rounded-lg border border-gray-600/50 p-3 space-y-2">
									{#each sortMonthsByDate($months) as month}
										<label
											class="flex items-center gap-3 p-2 rounded-lg border transition-all duration-200 cursor-pointer hover:bg-gray-700/30 {selectedMonthsForExport.has(month.id)
												? 'bg-blue-600/20 border-blue-500/50'
												: 'bg-gray-700/10 border-gray-600/30'}"
										>
											<input
												type="checkbox"
												checked={selectedMonthsForExport.has(month.id)}
												onchange={() => toggleMonthSelection(month.id)}
												aria-label="Zaznacz miesiąc {getMonthName(month.date)} {month.date.getFullYear()}"
												class="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
											/>
											<div class="flex-1">
												<div class="text-sm font-medium text-white">
													{getMonthName(month.date)} {month.date.getFullYear()}
												</div>
												<div class="text-xs text-gray-400">
													{month.date.toLocaleDateString('pl-PL')} • {month.bills.length} rachunków
												</div>
											</div>
										</label>
									{/each}
								</div>
							{/if}
						</div>
					{/if}

					<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
						<button
							onclick={handleExportJSON}
							aria-label="Eksportuj do JSON"
							class="flex flex-col items-center gap-3 p-6 bg-gray-700/50 hover:bg-gray-700 border border-gray-600/50 hover:border-gray-600 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer group"
						>
							<div class="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-500/30 group-hover:bg-blue-500/30 transition-colors">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
								</svg>
							</div>
							<div class="text-center">
								<div class="font-semibold text-white mb-1">JSON</div>
								<div class="text-xs text-gray-400">Strukturalny format</div>
							</div>
						</button>
						<button
							onclick={handleExportCSV}
							aria-label="Eksportuj do CSV"
							class="flex flex-col items-center gap-3 p-6 bg-gray-700/50 hover:bg-gray-700 border border-gray-600/50 hover:border-gray-600 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer group"
						>
							<div class="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center border border-green-500/30 group-hover:bg-green-500/30 transition-colors">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
								</svg>
							</div>
							<div class="text-center">
								<div class="font-semibold text-white mb-1">CSV</div>
								<div class="text-xs text-gray-400">Arkusz kalkulacyjny</div>
							</div>
						</button>
						<button
							onclick={handleExportPDF}
							aria-label="Eksportuj do PDF"
							class="flex flex-col items-center gap-3 p-6 bg-gray-700/50 hover:bg-gray-700 border border-gray-600/50 hover:border-gray-600 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer group"
						>
							<div class="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center border border-red-500/30 group-hover:bg-red-500/30 transition-colors">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
								</svg>
							</div>
							<div class="text-center">
								<div class="font-semibold text-white mb-1">PDF</div>
								<div class="text-xs text-gray-400">Raport do druku</div>
							</div>
						</button>
					</div>

					{#if importError && activeTab === 'export'}
						<div class="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
							<div class="flex items-center gap-2 text-red-400">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								<span class="text-sm font-medium">{importError}</span>
							</div>
						</div>
					{/if}
				</div>
			{:else}
				<div class="space-y-4">
					<p class="text-gray-400 text-sm mb-4">
						Zaimportuj dane z pliku JSON lub CSV. Istniejące dane zostaną zastąpione.
					</p>
					<div class="space-y-4">
						<label
							for="import-file"
							class="flex flex-col items-center justify-center gap-4 p-8 border-2 border-dashed border-gray-600/50 rounded-xl hover:border-gray-600 transition-colors cursor-pointer bg-gray-700/30 hover:bg-gray-700/50"
						>
							<svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
							</svg>
							<div class="text-center">
								<div class="font-medium text-white mb-1">
									{importFile ? importFile.name : 'Kliknij, aby wybrać plik'}
								</div>
								<div class="text-xs text-gray-400">JSON lub CSV</div>
							</div>
							<input
								id="import-file"
								type="file"
								accept=".json,.csv"
								onchange={handleFileSelect}
								class="hidden"
								aria-label="Wybierz plik do importu"
							/>
						</label>

						{#if importError}
							<div class="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
								<div class="flex items-center gap-2 text-red-400">
									<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									<span class="text-sm font-medium">{importError}</span>
								</div>
							</div>
						{/if}

						<div class="flex gap-3 pt-2">
							<button
								onclick={handleImport}
								disabled={!importFile}
								aria-label="Importuj dane"
								class="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
							>
								Importuj
							</button>
							<button
								onclick={onClose}
								aria-label="Anuluj"
								class="flex-1 px-6 py-3 bg-gray-700/50 hover:bg-gray-700 text-white rounded-xl font-medium transition-all duration-200 border border-gray-600/50 hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer"
							>
								Anuluj
							</button>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}

