<script lang="ts">
	import { page } from "$app/stores";
	import { user } from "$lib/stores";
	import { categoryManagerOpen } from "$lib/stores/categoryManager";
	import { exportImportModalOpen, templateManagerOpen, addMonthFormOpen } from "$lib/stores/modals";
	import { getProfile, signOut } from "$lib/supabase/handlers";
	import { browser } from "$app/environment";
	import { goto } from "$app/navigation";
	import { t } from "$lib/utils/i18n";

	let { showUserSettingsModal, onUserSettingsOpen }: { showUserSettingsModal: boolean; onUserSettingsOpen: () => void } = $props();

	let currentUser = $derived($user);
	let currentPath = $derived($page.url.pathname);
	let userProfile = $state<any>(null);
	let sidebarOpen = $state(false);
	let isSigningOut = $state(false);

	async function loadUserProfile() {
		if (!currentUser) {
			userProfile = null;
			return;
		}

		try {
			const profile = await getProfile();
			userProfile = profile;
		} catch (err: any) {
			if (err?.message && (err.message.includes("Auth session missing") || err.message.includes("must be authenticated"))) {
				userProfile = null;
				return;
			}
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

	function openCategoryManager() {
		categoryManagerOpen.set(true);
	}

	function openExportImport() {
		exportImportModalOpen.set(true);
	}

	function openTemplateManager() {
		templateManagerOpen.set(true);
	}

	function toggleAddMonthForm() {
		if (currentPath !== "/my-paids") {
			addMonthFormOpen.set(true);
			goto("/my-paids");
		} else {
			addMonthFormOpen.update((value) => !value);
		}
	}

	function isActive(path: string): boolean {
		return currentPath === path;
	}

	function toggleSidebar() {
		sidebarOpen = !sidebarOpen;
	}

	async function handleSignOut() {
		isSigningOut = true;
		try {
			await signOut();
		} catch (error) {
			console.error("Sign out error:", error);
		} finally {
			isSigningOut = false;
		}
	}
</script>

<div class="fixed left-0 top-0 h-full z-40 flex">
	<aside
		class="bg-gray-800/95 backdrop-blur-sm border-r border-gray-700/50 w-64 flex flex-col transition-transform duration-300 ease-in-out {sidebarOpen
			? 'translate-x-0'
			: '-translate-x-full'} lg:translate-x-0"
	>
		<div class="flex items-center justify-between p-4 border-b border-gray-700/50">
			<div class="flex items-center gap-2">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6 text-blue-500"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
					/>
				</svg>
				<span class="text-lg font-bold text-white">Moje Rachunki</span>
			</div>
			<button
				onclick={toggleSidebar}
				class="lg:hidden text-gray-400 hover:text-white transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
				aria-label="Zamknij menu"
			>
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>

		<nav class="flex-1 overflow-y-auto py-4">
			<div class="px-2 space-y-1">
				{#if currentUser}
					<a
						href="/my-paids"
						class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 {isActive('/my-paids')
							? 'bg-blue-600/20 text-blue-400 border-l-2 border-blue-500'
							: 'text-gray-300 hover:bg-gray-700/50 hover:text-white'}"
					>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							/>
						</svg>
						<span>Rachunki</span>
					</a>
					<a
						href="/summary"
						class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 {isActive('/summary')
							? 'bg-blue-600/20 text-blue-400 border-l-2 border-blue-500'
							: 'text-gray-300 hover:bg-gray-700/50 hover:text-white'}"
					>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
							/>
						</svg>
						<span>Podsumowanie</span>
					</a>
					<div class="px-2 pt-2 pb-1">
						<div class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
							Akcje
						</div>
					</div>
					<button
						onclick={toggleAddMonthForm}
						class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium bg-green-600/20 hover:bg-green-600/30 text-green-400 hover:text-green-300 border border-green-500/30 hover:border-green-500/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
					>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 4v16m8-8H4"
							/>
						</svg>
						<span>Dodaj miesiąc</span>
					</button>
					<button
						onclick={openExportImport}
						class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
							/>
						</svg>
						<span>Eksport/Import</span>
					</button>
					<button
						onclick={openTemplateManager}
						class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							/>
						</svg>
						<span>Szablony</span>
					</button>
					<button
						onclick={openCategoryManager}
						class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
							/>
						</svg>
						<span>Zarządzaj kategoriami</span>
					</button>
				{:else}
					<a
						href="/"
						class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 {isActive('/')
							? 'bg-blue-600/20 text-blue-400 border-l-2 border-blue-500'
							: 'text-gray-300 hover:bg-gray-700/50 hover:text-white'}"
					>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
							/>
						</svg>
						<span>Strona główna</span>
					</a>
				{/if}
			</div>
		</nav>

		{#if currentUser}
			<div class="border-t border-gray-700/50 p-4 space-y-2">
				<button
					onclick={() => {
						onUserSettingsOpen();
						loadUserProfile();
					}}
					class="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-700/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
					aria-label="Otwórz ustawienia konta"
				>
					{#if userProfile?.avatar_url}
						<img
							src={userProfile.avatar_url}
							alt="Avatar użytkownika"
							class="w-8 h-8 rounded-full object-cover border-2 border-gray-600"
						/>
					{:else}
						<div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
							{currentUser.email?.charAt(0).toUpperCase() || "U"}
						</div>
					{/if}
					<div class="flex-1 text-left min-w-0">
						<div class="text-sm font-medium text-white truncate">
							{currentUser.email}
						</div>
						<div class="text-xs text-gray-400">Ustawienia</div>
					</div>
				</button>
				<button
					onclick={handleSignOut}
					disabled={isSigningOut}
					class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
					aria-label="Wyloguj się"
				>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
						/>
					</svg>
					<span>{isSigningOut ? "Wylogowywanie..." : "Wyloguj się"}</span>
				</button>
			</div>
		{/if}
	</aside>

	{#if !sidebarOpen}
		<button
			onclick={toggleSidebar}
			class="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800/90 backdrop-blur-sm border border-gray-700/50 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
			aria-label="Otwórz menu"
		>
			<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
			</svg>
		</button>
	{/if}

	{#if sidebarOpen}
		<div
			class="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
			onclick={toggleSidebar}
			role="button"
			tabindex="-1"
			onkeydown={(e) => {
				if (e.key === "Escape") {
					toggleSidebar();
				}
			}}
		></div>
	{/if}
</div>

