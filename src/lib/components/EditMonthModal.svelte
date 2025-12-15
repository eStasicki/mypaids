<script lang="ts">
	import type { Month } from "$lib/types";
	import { months } from "$lib/stores";
	import {
		getMaxDaysInMonth,
		sortMonthsByDate,
		MONTH_NAMES,
		getMonthName,
	} from "$lib/utils/monthUtils";
	import { DATE_RANGES } from "$lib/utils/constants";
	import BillsTable from "./BillsTable.svelte";

	let {
		show,
		month,
		onClose,
	}: {
		show: boolean;
		month: Month | null;
		onClose: () => void;
	} = $props();

	let editDay = $state(new Date().getDate());
	let editMonth = $state(new Date().getMonth() + 1);
	let editYear = $state(new Date().getFullYear());
	let editNotes = $state("");

	$effect(() => {
		if (month) {
			editDay = month.date.getDate();
			editMonth = month.date.getMonth() + 1;
			editYear = month.date.getFullYear();
			editNotes = month.notes || "";
		}
	});

	function getMaxDays() {
		return getMaxDaysInMonth(editYear, editMonth);
	}

	$effect(() => {
		const maxDays = getMaxDays();
		if (editDay > maxDays) {
			editDay = maxDays;
		}
	});

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			onClose();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === "Escape") {
			onClose();
		}
	}

	function handleSave() {
		if (!month) return;

		const newDate = new Date(editYear, editMonth - 1, editDay);
		months.update((ms) => {
			const updated = ms.map((m) =>
				m.id === month.id
					? {
							...m,
							date: newDate,
							notes: editNotes.trim() || undefined,
						}
					: m
			);
			return sortMonthsByDate(updated);
		});

		onClose();
	}
</script>

{#if show && month}
	<div
		role="dialog"
		aria-modal="true"
		aria-labelledby="edit-month-title"
		tabindex="-1"
		onclick={handleBackdropClick}
		onkeydown={handleKeydown}
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto py-8"
	>
		<div
			class="bg-linear-to-br from-gray-800/95 to-gray-800/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700/50 max-w-4xl w-full mx-4 my-8 transform transition-all animate-fade-in max-h-[90vh] overflow-y-auto"
		>
			<div class="flex items-center justify-between mb-6">
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
								d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
							/>
						</svg>
					</div>
					<h2 id="edit-month-title" class="text-2xl font-bold text-white">
						Edytuj {getMonthName(month.date)}
						{month.date.getFullYear()}
					</h2>
				</div>
				<button
					onclick={onClose}
					aria-label="Zamknij"
					class="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer"
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
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<div class="space-y-6">
				<div>
					<div class="block text-sm font-medium text-gray-300 mb-3">Data zapłacenia</div>
					<div class="grid grid-cols-3 gap-4">
						<div>
							<label for="edit-day" class="block text-xs font-medium text-gray-400 mb-2"
								>Dzień</label
							>
							<input
								type="number"
								id="edit-day"
								bind:value={editDay}
								min="1"
								max={getMaxDays()}
								class="w-full h-10 px-4 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all cursor-text"
							/>
						</div>
						<div>
							<label for="edit-month" class="block text-xs font-medium text-gray-400 mb-2"
								>Miesiąc</label
							>
							<select
								id="edit-month"
								bind:value={editMonth}
								class="w-full h-10 px-4 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all cursor-pointer"
							>
								{#each MONTH_NAMES as monthName, index}
									<option value={index + 1}>{monthName}</option>
								{/each}
							</select>
						</div>
						<div>
							<label for="edit-year" class="block text-xs font-medium text-gray-400 mb-2">Rok</label
							>
							<input
								type="number"
								id="edit-year"
								bind:value={editYear}
								min={DATE_RANGES.MIN_YEAR}
								max={DATE_RANGES.MAX_YEAR}
								class="w-full h-10 px-4 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all cursor-text"
							/>
						</div>
					</div>
				</div>

				<div>
					<div class="block text-sm font-medium text-gray-300 mb-3">Rachunki</div>
					<div class="bg-gray-800/50 rounded-xl p-4 border border-gray-700/30">
						<BillsTable {month} />
					</div>
				</div>

				<div>
					<label for="edit-notes" class="block text-sm font-medium text-gray-300 mb-2"
						>Notatki</label
					>
					<textarea
						id="edit-notes"
						bind:value={editNotes}
						placeholder="Dodaj notatki do tego miesiąca..."
						rows="3"
						class="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all cursor-text resize-none"
					></textarea>
				</div>
			</div>

			<div class="flex gap-3 pt-6 mt-6 border-t border-gray-700/50">
				<button
					type="button"
					onclick={onClose}
					aria-label="Anuluj edycję"
					class="flex-1 px-6 py-3 bg-gray-700/50 hover:bg-gray-700 text-white rounded-xl font-medium transition-all duration-200 border border-gray-600/50 hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer"
				>
					Anuluj
				</button>
				<button
					type="button"
					onclick={handleSave}
					aria-label="Zapisz zmiany"
					class="flex-1 px-6 py-3 bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
				>
					Zapisz
				</button>
			</div>
		</div>
	</div>
{/if}
