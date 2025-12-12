<script lang="ts">
	import "../app.css";
	import favicon from "$lib/assets/favicon.svg";
	import { _ } from "svelte-i18n";
	import { browser } from "$app/environment";
	import AuthModal from "$lib/components/AuthModal.svelte";
	import UserSettingsModal from "$lib/components/UserSettingsModal.svelte";
	import CategoryManager from "$lib/components/CategoryManager.svelte";
	import { user } from "$lib/stores";
	import { getProfile } from "$lib/supabase/handlers";
	import { onMount } from "svelte";

	let { children } = $props();

	let title = $state("Moje Rachunki");
	let showAuthModal = $state(false);
	let showUserSettingsModal = $state(false);
	let currentUser = $derived($user);
	let userProfile = $state<any>(null);

	async function loadUserProfile() {
		if (!currentUser) {
			userProfile = null;
			return;
		}

		try {
			const profile = await getProfile();
			userProfile = profile;
		} catch (err: any) {
			// Silently handle auth errors (user logged out)
			if (err?.message && (err.message.includes("Auth session missing") || err.message.includes("must be authenticated"))) {
				userProfile = null;
				return;
			}
			// Only log other errors
			if (err?.message) {
				console.error("Failed to load user profile:", err);
			}
			userProfile = null;
		}
	}

	if (browser) {
		$effect(() => {
			if (currentUser) {
				loadUserProfile();
			} else {
				userProfile = null;
			}
		});

		// Listen for profile updates from UserSettingsModal
		$effect(() => {
			const handleProfileUpdate = () => {
				if (currentUser) {
					loadUserProfile();
				}
			};
			
			window.addEventListener("profile-updated", handleProfileUpdate);
			
			return () => {
				window.removeEventListener("profile-updated", handleProfileUpdate);
			};
		});
	}

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
	<main>
		{@render children()}
	</main>
	<AuthModal bind:isOpen={showAuthModal} />
	<UserSettingsModal bind:isOpen={showUserSettingsModal} />
	<CategoryManager />
</div>
