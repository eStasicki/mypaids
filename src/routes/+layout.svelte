<script lang="ts">
	import "../app.css";
	import favicon from "$lib/assets/favicon.svg";
	import { _ } from "svelte-i18n";
	import { browser } from "$app/environment";
	import AuthModal from "$lib/components/AuthModal.svelte";
	import UserSettingsModal from "$lib/components/UserSettingsModal.svelte";
	import CategoryManager from "$lib/components/CategoryManager.svelte";
	import Sidebar from "$lib/components/Sidebar.svelte";
	import { user } from "$lib/stores";

	let { children } = $props();

	let title = $state("Moje Rachunki");
	let showAuthModal = $state(false);
	let showUserSettingsModal = $state(false);
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
	{#if currentUser}
		<Sidebar showUserSettingsModal={showUserSettingsModal} onUserSettingsOpen={() => (showUserSettingsModal = true)} />
	{/if}
	<main class="{currentUser ? 'lg:ml-64' : ''}">
		{@render children()}
	</main>
	<AuthModal bind:isOpen={showAuthModal} />
	<UserSettingsModal bind:isOpen={showUserSettingsModal} />
	<CategoryManager />
</div>
