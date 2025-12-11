<script lang="ts">
	import type { Month } from '$lib/types';
	import { months, newCardIds } from '$lib/stores';
	import BillsTable from './BillsTable.svelte';
	import DeleteModal from './DeleteModal.svelte';
	import { onMount } from 'svelte';
	import { getMonthName, getTotalForMonth, getMaxDaysInMonth, sortMonthsByDate, MONTH_NAMES } from '$lib/utils/monthUtils';
	import { NEW_CARD_ANIMATION_DURATION, DATE_RANGES } from '$lib/utils/constants';

	let { month }: { month: Month } = $props();
	let showDeleteModal = $state(false);
	let isNewCard = $state(false);

	onMount(() => {
		const unsubscribe = newCardIds.subscribe((ids) => {
			if (ids.has(month.id)) {
				isNewCard = true;
				setTimeout(() => {
					isNewCard = false;
					newCardIds.update((currentIds) => {
						const updated = new Set(currentIds);
						updated.delete(month.id);
						return updated;
					});
				}, NEW_CARD_ANIMATION_DURATION);
			}
		});
		return unsubscribe;
	});

	let editingDate = $state(false);
	let editDay = $state(month.date.getDate());
	let editMonth = $state(month.date.getMonth() + 1);
	let editYear = $state(month.date.getFullYear());

	function handleDelete() {
		showDeleteModal = true;
	}

	function confirmDelete() {
		months.update((ms) => ms.filter((m) => m.id !== month.id));
		showDeleteModal = false;
	}

	function cancelDelete() {
		showDeleteModal = false;
	}

	function handleDuplicate() {
		const originalDay = month.date.getDate();
		const now = new Date();
		const currentYear = now.getFullYear();
		const currentMonth = now.getMonth();
		
		const maxDaysInCurrentMonth = getMaxDaysInMonth(currentYear, currentMonth + 1);
		const dayToUse = Math.min(originalDay, maxDaysInCurrentMonth);
		
		const newDate = new Date(currentYear, currentMonth, dayToUse);
		
		const duplicatedMonth: Month = {
			id: crypto.randomUUID(),
			date: newDate,
			bills: month.bills.map((bill) => ({
				id: crypto.randomUUID(),
				name: bill.name,
				amount: bill.amount
			}))
		};

		newCardIds.update((ids) => {
			const updated = new Set(ids);
			updated.add(duplicatedMonth.id);
			return updated;
		});

		months.update((ms) => {
			const updated = [...ms, duplicatedMonth];
			return sortMonthsByDate(updated);
		});
	}

	function getMaxDays() {
		return getMaxDaysInMonth(editYear, editMonth);
	}

	$effect(() => {
		if (editingDate) {
			const maxDays = getMaxDays();
			if (editDay > maxDays) {
				editDay = maxDays;
			}
		}
	});

	function startEditingDate() {
		editingDate = true;
		editDay = month.date.getDate();
		editMonth = month.date.getMonth() + 1;
		editYear = month.date.getFullYear();
	}

	function saveDate() {
		const newDate = new Date(editYear, editMonth - 1, editDay);
		months.update((ms) => {
			const updated = ms.map((m) =>
				m.id === month.id ? { ...m, date: newDate } : m
			);
			return sortMonthsByDate(updated);
		});
		editingDate = false;
	}

	function cancelEditingDate() {
		editingDate = false;
		editDay = month.date.getDate();
		editMonth = month.date.getMonth() + 1;
		editYear = month.date.getFullYear();
	}

	function handleDateKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			saveDate();
		}
		if (event.key === 'Escape') {
			event.preventDefault();
			cancelEditingDate();
		}
	}
</script>

<div class="group relative bg-gradient-to-br from-gray-800/90 to-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:shadow-3xl hover:shadow-blue-500/10 hover:-translate-y-1 {isNewCard ? 'animate-pulse-new-card' : ''}">
	<div class="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 rounded-2xl transition-all duration-300 pointer-events-none"></div>
	
	<div class="relative">
		<div class="flex justify-between items-start mb-6">
			<div class="flex-1">
				<div class="flex items-center gap-3 mb-2">
					<div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-blue-500/20">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
						</svg>
					</div>
					<div>
						<h2 class="text-2xl font-bold text-white">
							{getMonthName(month.date)} {month.date.getFullYear()}
						</h2>
					</div>
				</div>
				{#if editingDate}
					<div class="text-sm ml-13 flex items-center gap-2">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<div class="flex items-center gap-2">
							<input
								type="number"
								bind:value={editDay}
								min="1"
								max={getMaxDays()}
								onkeydown={handleDateKeydown}
								aria-label="Edytuj dzień"
								class="w-16 px-2 py-1 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all cursor-text"
							/>
							<select
								bind:value={editMonth}
								onkeydown={handleDateKeydown}
								aria-label="Edytuj miesiąc"
								class="px-3 py-1 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all cursor-pointer"
							>
								{#each MONTH_NAMES as monthName, index}
									<option value={index + 1}>{monthName}</option>
								{/each}
							</select>
							<input
								type="number"
								bind:value={editYear}
								min={DATE_RANGES.MIN_YEAR}
								max={DATE_RANGES.MAX_YEAR}
								onkeydown={handleDateKeydown}
								aria-label="Edytuj rok"
								class="w-20 px-2 py-1 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all cursor-text"
							/>
							<button
								onclick={saveDate}
								aria-label="Zapisz datę"
								class="text-green-400 hover:text-green-300 transition-all duration-200 p-1 rounded hover:bg-green-500/10 focus:outline-none focus:ring-2 focus:ring-green-500/50 cursor-pointer"
								title="Zapisz"
							>
								<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
								</svg>
							</button>
							<button
								onclick={cancelEditingDate}
								aria-label="Anuluj edycję daty"
								class="text-red-400 hover:text-red-300 transition-all duration-200 p-1 rounded hover:bg-red-500/10 focus:outline-none focus:ring-2 focus:ring-red-500/50 cursor-pointer"
								title="Anuluj"
							>
								<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>
					</div>
				{:else}
					<button
						onclick={startEditingDate}
						aria-label="Edytuj datę miesiąca"
						class="text-sm text-gray-400 hover:text-blue-400 ml-13 flex items-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded cursor-pointer"
					>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						{month.date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}
					</button>
				{/if}
			</div>
			<div class="flex gap-2">
				<button
					onclick={handleDuplicate}
					aria-label="Powiel kartę miesiąca"
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
							d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
						/>
					</svg>
				</button>
				<button
					onclick={handleDelete}
					aria-label="Usuń miesiąc"
					class="text-red-400 hover:text-red-300 transition-all duration-200 p-2 rounded-lg hover:bg-red-500/10 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500/50 cursor-pointer"
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
							d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
						/>
					</svg>
				</button>
			</div>
		</div>

		<BillsTable {month} />

		<div class="mt-6 pt-6 border-t border-gray-700/50">
			<div class="flex justify-between items-center bg-gradient-to-r from-gray-800/50 to-gray-800/30 rounded-xl p-4 border border-gray-700/30">
				<span class="text-lg font-semibold text-gray-300">Suma:</span>
				<span class="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
					{getTotalForMonth(month).toFixed(2)} <span class="text-xl text-gray-400">zł</span>
				</span>
			</div>
		</div>
	</div>
</div>

<DeleteModal
	show={showDeleteModal}
	title="Usuń miesiąc"
	message="Czy na pewno chcesz usunąć miesiąc {getMonthName(month.date)} {month.date.getFullYear()}? Ta operacja jest nieodwracalna."
	onConfirm={confirmDelete}
	onCancel={cancelDelete}
/>

