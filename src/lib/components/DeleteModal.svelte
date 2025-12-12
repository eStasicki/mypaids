<script lang="ts">
	let {
		show,
		title,
		message,
		onConfirm,
		onCancel,
	}: {
		show: boolean;
		title: string;
		message: string;
		onConfirm: () => void;
		onCancel: () => void;
	} = $props();

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			onCancel();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === "Escape") {
			onCancel();
		}
	}
</script>

{#if show}
	<div
		role="dialog"
		aria-modal="true"
		aria-labelledby="modal-title"
		aria-describedby="modal-description"
		tabindex="-1"
		onclick={handleBackdropClick}
		onkeydown={handleKeydown}
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
	>
		<div
			class="bg-linear-to-br from-gray-800/95 to-gray-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-gray-700/50 max-w-md w-full mx-4 transform transition-all animate-fade-in"
		>
			<div class="flex items-start gap-4 mb-4">
				<div
					class="shrink-0 w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center border border-red-500/30"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6 text-red-400"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						aria-hidden="true"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
						/>
					</svg>
				</div>
				<div class="flex-1">
					<h3 id="modal-title" class="text-xl font-bold text-white mb-2">
						{title}
					</h3>
					<p id="modal-description" class="text-gray-400 text-sm">
						{message}
					</p>
				</div>
			</div>
			<div class="flex gap-3 pt-4">
				<button
					type="button"
					onclick={onCancel}
					aria-label="Anuluj usuwanie"
					class="flex-1 px-4 py-2.5 bg-gray-700/50 hover:bg-gray-700 text-white rounded-xl font-medium transition-all duration-200 border border-gray-600/50 hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer"
				>
					Anuluj
				</button>
				<button
					type="button"
					onclick={onConfirm}
					aria-label="Potwierdź usuwanie"
					class="flex-1 px-4 py-2.5 bg-linear-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
				>
					Usuń
				</button>
			</div>
		</div>
	</div>
{/if}
