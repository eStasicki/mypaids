<script lang="ts">
	import { months } from '$lib/stores';
	import type { Month } from '$lib/types';
	import { getMaxDaysInMonth, sortMonthsByDate, MONTH_NAMES } from '$lib/utils/monthUtils';
	import { DATE_RANGES } from '$lib/utils/constants';

	let { onClose }: { onClose?: () => void } = $props();

	let year = $state(new Date().getFullYear());
	let month = $state(new Date().getMonth() + 1);
	let day = $state(new Date().getDate());

	function getMaxDays() {
		return getMaxDaysInMonth(year, month);
	}

	$effect(() => {
		const maxDays = getMaxDays();
		if (day > maxDays) {
			day = maxDays;
		}
	});

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		const date = new Date(year, month - 1, day);
		const newMonth: Month = {
			id: crypto.randomUUID(),
			date,
			bills: []
		};

		months.update((ms) => {
			const updated = [...ms, newMonth];
			return sortMonthsByDate(updated);
		});

		onClose?.();
	}
</script>

<div class="bg-gradient-to-br from-gray-800/95 to-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700/50">
	<div class="flex items-center gap-3 mb-6">
		<div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-blue-500/20">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
		</div>
		<h2 id="add-month-form-title" class="text-2xl font-bold text-white">Dodaj Nowy Miesiąc</h2>
	</div>
	<form onsubmit={handleSubmit} class="space-y-4">
		<div class="grid grid-cols-3 gap-4">
			<div>
				<label for="day" class="block text-sm font-medium text-gray-300 mb-2">Dzień</label>
				<input
					type="number"
					id="day"
					bind:value={day}
					min="1"
					max={getMaxDays()}
					required
					aria-required="true"
					class="w-full h-10 px-4 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-text"
				/>
			</div>
			<div>
				<label for="month" class="block text-sm font-medium text-gray-300 mb-2">Miesiąc</label>
				<select
					id="month"
					bind:value={month}
					required
					aria-required="true"
					class="w-full h-10 px-4 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
				>
					{#each MONTH_NAMES as monthName, index}
						<option value={index + 1}>{monthName}</option>
					{/each}
				</select>
			</div>
			<div>
				<label for="year" class="block text-sm font-medium text-gray-300 mb-2">Rok</label>
				<input
					type="number"
					id="year"
					bind:value={year}
					min={DATE_RANGES.MIN_YEAR}
					max={DATE_RANGES.MAX_YEAR}
					required
					aria-required="true"
					class="w-full h-10 px-4 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-text"
				/>
			</div>
		</div>
		<div class="flex gap-3 pt-4">
			<button
				type="submit"
				aria-label="Dodaj nowy miesiąc"
				class="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
			>
				Dodaj
			</button>
			<button
				type="button"
				onclick={() => onClose?.()}
				aria-label="Anuluj dodawanie miesiąca"
				class="flex-1 px-6 py-3 bg-gray-700/50 hover:bg-gray-700 text-white rounded-xl font-medium transition-all duration-200 border border-gray-600/50 hover:border-gray-600 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer"
			>
				Anuluj
			</button>
		</div>
	</form>
</div>

