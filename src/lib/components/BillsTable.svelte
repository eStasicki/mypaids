<script lang="ts">
	import type { Month } from '$lib/types';
	import { months } from '$lib/stores';
	import { createBill, parseAmount } from '$lib/utils/monthUtils';

	let { month }: { month: Month } = $props();

	let editingId = $state<string | null>(null);
	let newBillName = $state('');
	let newBillAmount = $state<string>('');
	let newBillNameInput: HTMLInputElement | null = $state(null);

	function addBill() {
		if (!newBillName.trim()) return;

		const newBill = createBill(newBillName, newBillAmount);

		months.update((ms) =>
			ms.map((m) =>
				m.id === month.id ? { ...m, bills: [...m.bills, newBill] } : m
			)
		);

		newBillName = '';
		newBillAmount = '';
		
		setTimeout(() => {
			newBillNameInput?.focus();
		}, 0);
	}

	function updateBill(billId: string, field: 'name' | 'amount', value: string) {
		months.update((ms) =>
			ms.map((m) =>
				m.id === month.id
					? {
							...m,
							bills: m.bills.map((b) =>
								b.id === billId
									? {
											...b,
											[field]: field === 'amount' ? parseAmount(value) : value
										}
									: b
							)
						}
					: m
			)
		);
	}

	function deleteBill(billId: string) {
		months.update((ms) =>
			ms.map((m) =>
				m.id === month.id ? { ...m, bills: m.bills.filter((b) => b.id !== billId) } : m
			)
		);
	}

	function handleKeydown(event: KeyboardEvent, billId?: string) {
		if (event.key === 'Enter') {
			event.preventDefault();
			if (billId) {
				editingId = null;
			} else {
				addBill();
			}
		}
		if (event.key === 'Escape') {
			editingId = null;
		}
	}
</script>

<div class="overflow-x-auto rounded-xl">
	<table class="w-full" role="table">
		<thead>
			<tr class="border-b border-gray-700/50">
				<th scope="col" class="text-left py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Nazwa</th>
				<th scope="col" class="text-right py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Kwota (zł)</th>
				<th scope="col" class="w-12" aria-label="Akcje"></th>
			</tr>
		</thead>
		<tbody>
			{#each month.bills as bill (bill.id)}
				<tr class="border-b border-gray-700/30 hover:bg-gray-700/20 transition-all duration-150">
					<td class="py-4 px-4">
						{#if editingId === bill.id}
							<input
								type="text"
								value={bill.name}
								aria-label="Edytuj nazwę rachunku"
								onblur={() => (editingId = null)}
								onkeydown={(e) => handleKeydown(e, bill.id)}
								oninput={(e) => updateBill(bill.id, 'name', e.currentTarget.value)}
								class="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all cursor-text"
							/>
						{:else}
							<button
								onclick={() => (editingId = bill.id)}
								aria-label="Edytuj nazwę rachunku: {bill.name}"
								class="text-left text-white hover:text-blue-400 transition-colors w-full text-sm font-medium py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded cursor-pointer"
							>
								{bill.name}
							</button>
						{/if}
					</td>
					<td class="py-4 px-4 text-right">
						{#if editingId === bill.id}
							<input
								type="text"
								value={bill.amount?.toString() ?? ''}
								aria-label="Edytuj kwotę rachunku"
								onblur={() => (editingId = null)}
								onkeydown={(e) => handleKeydown(e, bill.id)}
								oninput={(e) => updateBill(bill.id, 'amount', e.currentTarget.value)}
								placeholder="-"
								class="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all cursor-text"
							/>
						{:else}
							<button
								onclick={() => (editingId = bill.id)}
								aria-label="Edytuj kwotę rachunku: {bill.amount !== null ? bill.amount.toFixed(2) + ' zł' : 'brak kwoty'}"
								class="text-right text-white hover:text-blue-400 transition-colors w-full text-sm font-semibold py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded cursor-pointer"
							>
								{#if bill.amount !== null}
									{bill.amount.toFixed(2)}
								{:else}
									<span class="text-gray-500">-</span>
								{/if}
							</button>
						{/if}
					</td>
					<td class="py-4 px-4">
						<button
							onclick={() => deleteBill(bill.id)}
							aria-label="Usuń rachunek {bill.name}"
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
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</td>
				</tr>
			{/each}
			<tr class="bg-gradient-to-r from-gray-700/20 to-gray-700/10 border-t border-gray-700/30">
				<td class="py-4 px-4">
					<input
						type="text"
						bind:value={newBillName}
						bind:this={newBillNameInput}
						aria-label="Nazwa nowego rachunku"
						onkeydown={(e) => handleKeydown(e)}
						placeholder="Nazwa rachunku"
						class="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all cursor-text"
					/>
				</td>
				<td class="py-4 px-4">
					<input
						type="text"
						bind:value={newBillAmount}
						aria-label="Kwota nowego rachunku"
						onkeydown={(e) => handleKeydown(e)}
						placeholder="Kwota"
						class="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm text-right placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all cursor-text"
					/>
				</td>
				<td class="py-4 px-4">
					<button
						onclick={addBill}
						aria-label="Dodaj nowy rachunek"
						class="text-green-400 hover:text-green-300 transition-all duration-200 p-2 rounded-lg hover:bg-green-500/10 active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-500/50 cursor-pointer"
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
								d="M12 4v16m8-8H4"
							/>
						</svg>
					</button>
				</td>
			</tr>
		</tbody>
	</table>
</div>

