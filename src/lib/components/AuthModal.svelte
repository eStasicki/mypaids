<script lang="ts">
	import AuthButton from "./AuthButton.svelte";
	import DevLoginForm from "./DevLoginForm.svelte";
	import { user } from "$lib/stores";
	import { browser } from "$app/environment";
	import { isDevMode } from "$lib/supabase/handlers";
	import { goto } from "$app/navigation";

	let { isOpen = $bindable(false) }: { isOpen: boolean } = $props();

	let currentUser = $derived($user);
	let modalRef: HTMLDivElement | null = $state(null);
	let previousActiveElement: HTMLElement | null = $state(null);

	if (browser) {
		$effect(() => {
			if (currentUser) {
				isOpen = false;
				// Redirect to my-paids after login
				goto("/my-paids");
			}
		});

		$effect(() => {
			if (isOpen) {
				previousActiveElement = document.activeElement as HTMLElement;
				setTimeout(() => {
					const firstButton = modalRef?.querySelector("button");
					firstButton?.focus();
				}, 100);
				document.body.style.overflow = "hidden";
			} else {
				document.body.style.overflow = "";
				if (previousActiveElement) {
					previousActiveElement.focus();
				}
			}
		});
	}

	function closeModal() {
		isOpen = false;
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			closeModal();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === "Escape") {
			closeModal();
		}
		if (event.key === "Tab") {
			const focusableElements = modalRef?.querySelectorAll(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			);
			if (!focusableElements || focusableElements.length === 0) return;

			const firstElement = focusableElements[0] as HTMLElement;
			const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

			if (event.shiftKey) {
				if (document.activeElement === firstElement) {
					event.preventDefault();
					lastElement.focus();
				}
			} else {
				if (document.activeElement === lastElement) {
					event.preventDefault();
					firstElement.focus();
				}
			}
		}
	}
</script>

{#if isOpen}
	<div
		class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200 cursor-pointer"
		onclick={handleBackdropClick}
		onkeydown={handleKeydown}
		role="dialog"
		aria-modal="true"
		aria-labelledby="auth-modal-title"
		aria-describedby="auth-modal-description"
	>
		<div
			bind:this={modalRef}
			class="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-gray-700/50 animate-in zoom-in-95 duration-300 focus:outline-none cursor-default"
			onclick={(e) => e.stopPropagation()}
			tabindex="-1"
		>
			<div class="flex justify-between items-start mb-8">
				<div>
					<h2 id="auth-modal-title" class="text-3xl font-bold text-white mb-2">Witaj z powrotem</h2>
					<p id="auth-modal-description" class="text-gray-400 text-sm">Zaloguj się, aby kontynuować</p>
				</div>
				<button
					onclick={closeModal}
					class="text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg p-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 cursor-pointer"
					aria-label="Zamknij dialog logowania"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			{#if isDevMode()}
				<DevLoginForm />
				<div class="mt-6 pt-6 border-t border-gray-700/50">
					<p class="text-xs text-gray-400 text-center mb-4">Lub zaloguj się przez:</p>
					<div class="space-y-3" role="group" aria-label="Opcje logowania OAuth">
						<AuthButton provider="google" />
						<AuthButton provider="github" />
						<AuthButton provider="facebook" />
						<AuthButton provider="twitter" />
						<AuthButton provider="discord" />
					</div>
				</div>
			{:else}
				<div class="space-y-3" role="group" aria-label="Opcje logowania">
					<AuthButton provider="google" />
					<AuthButton provider="github" />
					<AuthButton provider="facebook" />
					<AuthButton provider="twitter" />
					<AuthButton provider="discord" />
				</div>
				<div class="mt-6 pt-6 border-t border-gray-700/50">
					<p class="text-xs text-gray-500 text-center">
						Kontynuując, akceptujesz nasze warunki użytkowania i politykę prywatności
					</p>
				</div>
			{/if}
		</div>
	</div>
{/if}
