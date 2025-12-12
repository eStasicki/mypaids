<script lang="ts">
	import "../app.css";
	import favicon from "$lib/assets/favicon.svg";
	import { _ } from "svelte-i18n";
	import { browser } from "$app/environment";
	import AuthModal from "$lib/components/AuthModal.svelte";
	import { user } from "$lib/stores";

	let { children } = $props();

	let title = $state("Moje Rachunki");
	let showAuthModal = $state(false);
	let currentUser = $derived($user);

	function openAuthModal() {
		showAuthModal = true;
	}

	if (browser) {
		$effect(() => {
			try {
				title = $_("app.title") || "Moje Rachunki";
			} catch {
				title = "Moje Rachunki";
			}
		});
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>{title}</title>
</svelte:head>

<div class="min-h-screen bg-linear-to-br from-gray-900 via-gray-900 to-gray-800 text-gray-100">
	<header class="container mx-auto px-4 py-4 max-w-7xl flex justify-between items-center">
		<h1 class="text-2xl font-bold">{title}</h1>
		<div class="flex items-center gap-4">
			{#if currentUser}
				<div class="flex items-center gap-2">
					<div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
						{currentUser.email?.charAt(0).toUpperCase() || "U"}
					</div>
					<span class="text-sm text-gray-300">{currentUser.email}</span>
				</div>
			{:else}
				<button
					onclick={openAuthModal}
					class="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 cursor-pointer"
				>
					Zaloguj się
				</button>
			{/if}
		</div>
	</header>
	<main>
		{@render children()}
	</main>
	<AuthModal bind:isOpen={showAuthModal} />
</div>
