<script lang="ts">
	import { signOut, getProfile, updateProfile, updatePassword, updateUserMetadata, uploadAvatar, deleteAvatar } from "$lib/supabase/handlers";
	import { user } from "$lib/stores";
	import { browser } from "$app/environment";
	import { onMount } from "svelte";

	let { isOpen = $bindable(false) }: { isOpen: boolean } = $props();

	let currentUser = $derived($user);
	let profile = $state<any>(null);
	let isLoading = $state(false);
	let isSaving = $state(false);
	let error = $state<string | null>(null);
	let success = $state<string | null>(null);

	let fullName = $state("");
	let avatarUrl = $state("");
	let currentPassword = $state("");
	let newPassword = $state("");
	let confirmPassword = $state("");
	let selectedFile: File | null = $state(null);
	let avatarPreview = $state<string | null>(null);
	let isUploading = $state(false);

	let modalRef: HTMLDivElement | null = $state(null);
	let previousActiveElement: HTMLElement | null = $state(null);
	let profileLoaded = $state(false);

	async function loadProfile() {
		if (!currentUser || profileLoaded) return;
		
		try {
			const userProfile = await getProfile();
			profile = userProfile;
			fullName = userProfile?.full_name || "";
			avatarUrl = userProfile?.avatar_url || "";
			avatarPreview = userProfile?.avatar_url || null;
			profileLoaded = true;
		} catch (err) {
			console.error("Failed to load profile:", err);
		}
	}

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		
		if (!file) return;

		// Validate file type
		if (!file.type.startsWith("image/")) {
			error = "Wybrany plik musi być obrazem";
			return;
		}

		// Validate file size (max 5MB)
		const maxSize = 5 * 1024 * 1024; // 5MB
		if (file.size > maxSize) {
			error = "Rozmiar pliku nie może przekraczać 5MB";
			return;
		}

		selectedFile = file;
		error = null;

		// Create preview
		const reader = new FileReader();
		reader.onload = (e) => {
			avatarPreview = e.target?.result as string;
		};
		reader.readAsDataURL(file);
	}

	async function handleUploadAvatar() {
		if (!selectedFile) return;

		isUploading = true;
		error = null;

		try {
			// Delete old avatar if exists
			if (avatarUrl && avatarUrl.includes("/avatars/")) {
				await deleteAvatar(avatarUrl);
			}

			// Upload new avatar
			const newAvatarUrl = await uploadAvatar(selectedFile);
			avatarUrl = newAvatarUrl;
			avatarPreview = newAvatarUrl;
			selectedFile = null;

			// Update profile with new avatar URL
			await updateProfile({
				avatar_url: newAvatarUrl,
			});

			// Reload profile
			const updatedProfile = await getProfile();
			profile = updatedProfile;

			success = "Avatar został przesłany pomyślnie";
			setTimeout(() => {
				success = null;
			}, 3000);

			// Dispatch custom event to notify parent component
			if (browser) {
				window.dispatchEvent(new CustomEvent("profile-updated"));
			}
		} catch (err) {
			error = err instanceof Error ? err.message : "Wystąpił błąd podczas przesyłania avatara";
		} finally {
			isUploading = false;
		}
	}

	if (browser) {
		$effect(() => {
			if (isOpen) {
				previousActiveElement = document.activeElement as HTMLElement;
				document.body.style.overflow = "hidden";
				if (currentUser && !profileLoaded) {
					loadProfile();
				}
			} else {
				document.body.style.overflow = "";
				if (previousActiveElement) {
					previousActiveElement.focus();
				}
				profileLoaded = false;
			}
		});
	}

	function closeModal() {
		isOpen = false;
		error = null;
		success = null;
		currentPassword = "";
		newPassword = "";
		confirmPassword = "";
		selectedFile = null;
		avatarPreview = null;
		profileLoaded = false;
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
	}

	async function handleSaveProfile() {
		if (!currentUser) return;

		isSaving = true;
		error = null;
		success = null;

		try {
			await updateProfile({
				full_name: fullName || null,
				avatar_url: avatarUrl || null,
			});

			if (fullName) {
				await updateUserMetadata({
					full_name: fullName,
				});
			}

			// Reload profile to get updated data
			const updatedProfile = await getProfile();
			profile = updatedProfile;
			avatarUrl = updatedProfile?.avatar_url || "";
			avatarPreview = updatedProfile?.avatar_url || null;

			success = "Profil został zaktualizowany pomyślnie";
			setTimeout(() => {
				success = null;
			}, 3000);

			// Dispatch custom event to notify parent component
			if (browser) {
				window.dispatchEvent(new CustomEvent("profile-updated"));
			}
		} catch (err) {
			error = err instanceof Error ? err.message : "Wystąpił błąd podczas aktualizacji profilu";
		} finally {
			isSaving = false;
		}
	}

	async function handleChangePassword() {
		if (newPassword.length < 6) {
			error = "Hasło musi mieć minimum 6 znaków";
			return;
		}

		if (newPassword !== confirmPassword) {
			error = "Hasła nie są identyczne";
			return;
		}

		isSaving = true;
		error = null;
		success = null;

		try {
			await updatePassword(newPassword);
			success = "Hasło zostało zmienione pomyślnie";
			currentPassword = "";
			newPassword = "";
			confirmPassword = "";
			setTimeout(() => {
				success = null;
			}, 3000);
		} catch (err) {
			error = err instanceof Error ? err.message : "Wystąpił błąd podczas zmiany hasła";
		} finally {
			isSaving = false;
		}
	}

	async function handleSignOut() {
		isLoading = true;
		try {
			await signOut();
			closeModal();
		} catch (err) {
			error = err instanceof Error ? err.message : "Wystąpił błąd podczas wylogowywania";
		} finally {
			isLoading = false;
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
		aria-labelledby="user-settings-modal-title"
	>
		<div
			bind:this={modalRef}
			class="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl border border-gray-700/50 animate-in zoom-in-95 duration-300 focus:outline-none cursor-default max-h-[90vh] overflow-y-auto"
			onclick={(e) => e.stopPropagation()}
			tabindex="-1"
		>
			<div class="flex justify-between items-start mb-6">
				<div>
					<h2 id="user-settings-modal-title" class="text-3xl font-bold text-white mb-2">
						Ustawienia konta
					</h2>
					<p class="text-gray-400 text-sm">Zarządzaj swoim profilem i ustawieniami</p>
				</div>
				<button
					onclick={closeModal}
					class="text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg p-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 cursor-pointer"
					aria-label="Zamknij modal ustawień"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			{#if error}
				<div class="mb-6 p-4 bg-red-900/20 border border-red-700/50 rounded-lg">
					<p class="text-red-300 text-sm">{error}</p>
				</div>
			{/if}

			{#if success}
				<div class="mb-6 p-4 bg-green-900/20 border border-green-700/50 rounded-lg">
					<p class="text-green-300 text-sm">{success}</p>
				</div>
			{/if}

			<div class="space-y-6">
				<div>
					<h3 class="text-xl font-semibold text-white mb-4">Informacje o profilu</h3>
					<div class="space-y-4">
						<div>
							<label for="user-email" class="block text-sm font-medium text-gray-300 mb-2">
								Email
							</label>
							<input
								id="user-email"
								type="email"
								value={currentUser?.email || ""}
								disabled
								class="w-full px-4 py-2.5 bg-gray-700/30 border border-gray-600/50 rounded-lg text-gray-400 text-sm cursor-not-allowed"
							/>
							<p class="text-xs text-gray-500 mt-1">Email nie może być zmieniony</p>
						</div>

						<div>
							<label for="user-fullname" class="block text-sm font-medium text-gray-300 mb-2">
								Imię i nazwisko
							</label>
							<input
								id="user-fullname"
								type="text"
								bind:value={fullName}
								placeholder="Jan Kowalski"
								class="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
						</div>

						<div>
							<label for="user-avatar" class="block text-sm font-medium text-gray-300 mb-2">
								Avatar
							</label>
							
							{#if avatarPreview}
								<div class="mb-4 flex items-center gap-4">
									<img
										src={avatarPreview}
										alt="Podgląd avatara"
										class="w-20 h-20 rounded-full object-cover border-2 border-gray-600"
									/>
									<div class="flex-1">
										<p class="text-sm text-gray-400 mb-2">Podgląd avatara</p>
										<button
											onclick={() => {
												selectedFile = null;
												avatarPreview = avatarUrl || null;
											}}
											class="text-sm text-red-400 hover:text-red-300 transition-colors"
										>
											Anuluj
										</button>
									</div>
								</div>
							{/if}

							<div class="space-y-3">
								<label
									for="avatar-upload"
									class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700/30 hover:bg-gray-700/50 transition-colors"
								>
									<div class="flex flex-col items-center justify-center pt-5 pb-6">
										<svg
											class="w-10 h-10 mb-3 text-gray-400"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
											/>
										</svg>
										<p class="mb-2 text-sm text-gray-400">
											<span class="font-semibold">Kliknij, aby przesłać</span> lub przeciągnij i upuść
										</p>
										<p class="text-xs text-gray-500">PNG, JPG, GIF do 5MB</p>
									</div>
									<input
										id="avatar-upload"
										type="file"
										accept="image/*"
										onchange={handleFileSelect}
										class="hidden"
									/>
								</label>

								{#if selectedFile}
									<div class="flex items-center gap-2">
										<button
											onclick={handleUploadAvatar}
											disabled={isUploading}
											class="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium"
										>
											{#if isUploading}
												<span class="flex items-center justify-center gap-2">
													<svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
														<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
														<path
															class="opacity-75"
															fill="currentColor"
															d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
														></path>
													</svg>
													Przesyłanie...
												</span>
											{:else}
												Prześlij avatar
											{/if}
										</button>
									</div>
								{/if}

								<div class="text-xs text-gray-500 mt-2">
									<p>Lub wprowadź URL awatara:</p>
								</div>
								<input
									id="user-avatar"
									type="url"
									bind:value={avatarUrl}
									placeholder="https://example.com/avatar.jpg"
									class="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
							</div>
						</div>

						<button
							onclick={handleSaveProfile}
							disabled={isSaving}
							class="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
						>
							{#if isSaving}
								<span class="flex items-center justify-center gap-2">
									<svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
										<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
										<path
											class="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
									Zapisywanie...
								</span>
							{:else}
								Zapisz zmiany profilu
							{/if}
						</button>
					</div>
				</div>

				<div class="border-t border-gray-700/50 pt-6">
					<h3 class="text-xl font-semibold text-white mb-4">Zmiana hasła</h3>
					<div class="space-y-4">
						<div>
							<label for="user-new-password" class="block text-sm font-medium text-gray-300 mb-2">
								Nowe hasło
							</label>
							<input
								id="user-new-password"
								type="password"
								bind:value={newPassword}
								placeholder="••••••••"
								minlength="6"
								class="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
						</div>

						<div>
							<label for="user-confirm-password" class="block text-sm font-medium text-gray-300 mb-2">
								Potwierdź hasło
							</label>
							<input
								id="user-confirm-password"
								type="password"
								bind:value={confirmPassword}
								placeholder="••••••••"
								minlength="6"
								class="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
						</div>

						<button
							onclick={handleChangePassword}
							disabled={isSaving || !newPassword || !confirmPassword}
							class="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800"
						>
							{#if isSaving}
								<span class="flex items-center justify-center gap-2">
									<svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
										<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
										<path
											class="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
									Zmienianie hasła...
								</span>
							{:else}
								Zmień hasło
							{/if}
						</button>
					</div>
				</div>

				<div class="border-t border-gray-700/50 pt-6">
					<button
						onclick={handleSignOut}
						disabled={isLoading}
						class="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-red-800 disabled:to-red-900 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800"
					>
						{#if isLoading}
							<span class="flex items-center justify-center gap-2">
								<svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
									<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
									<path
										class="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									></path>
								</svg>
								Wylogowywanie...
							</span>
						{:else}
							<span class="flex items-center justify-center gap-2">
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
									/>
								</svg>
								Wyloguj się
							</span>
						{/if}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

