<script lang="ts">
	import { signInWithEmail, signUpWithEmail, isDevMode } from "$lib/supabase/handlers";
	import { user } from "$lib/stores";

	let email = $state("");
	let password = $state("");
	let fullName = $state("");
	let isSignUp = $state(false);
	let isLoading = $state(false);
	let error = $state<string | null>(null);
	let success = $state<string | null>(null);

	const currentUser = $derived($user);
	const devMode = isDevMode();

	async function handleSubmit() {
		if (!devMode) {
			error = "Tryb developerski jest wyłączony";
			return;
		}

		isLoading = true;
		error = null;
		success = null;

		try {
			if (isSignUp) {
				await signUpWithEmail(email, password, fullName);
				success = "Konto zostało utworzone pomyślnie!";
			} else {
				await signInWithEmail(email, password);
				success = "Zalogowano pomyślnie!";
			}
		} catch (err) {
			error = err instanceof Error ? err.message : "Wystąpił błąd podczas logowania";
		} finally {
			isLoading = false;
		}
	}

	function toggleMode() {
		isSignUp = !isSignUp;
		error = null;
		success = null;
	}
</script>

{#if !devMode}
	<div class="p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
		<p class="text-yellow-300 text-sm text-center">
			Logowanie przez email/password jest dostępne tylko w trybie developerskim
		</p>
	</div>
{:else}
	<div class="space-y-4">
		<div class="flex items-center gap-2 mb-4 p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
			<svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
				/>
			</svg>
			<p class="text-blue-300 text-xs">Tryb developerski - tylko do testowania</p>
		</div>

		{#if error}
			<div class="p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
				<p class="text-red-300 text-sm">{error}</p>
			</div>
		{/if}

		{#if success}
			<div class="p-3 bg-green-900/20 border border-green-700/50 rounded-lg">
				<p class="text-green-300 text-sm">{success}</p>
			</div>
		{/if}

		{#if currentUser}
			<div class="p-3 bg-green-900/20 border border-green-700/50 rounded-lg">
				<p class="text-green-300 text-sm">Zalogowano jako: {currentUser.email}</p>
			</div>
		{:else}
			<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-4">
				{#if isSignUp}
					<div>
						<label for="dev-fullname" class="block text-sm font-medium text-gray-300 mb-2">
							Imię i nazwisko
						</label>
						<input
							id="dev-fullname"
							type="text"
							bind:value={fullName}
							placeholder="Jan Kowalski"
							class="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
					</div>
				{/if}

				<div>
					<label for="dev-email" class="block text-sm font-medium text-gray-300 mb-2">
						Email
					</label>
					<input
						id="dev-email"
						type="email"
						bind:value={email}
						placeholder="dev@example.com"
						required
						class="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					/>
				</div>

				<div>
					<label for="dev-password" class="block text-sm font-medium text-gray-300 mb-2">
						Hasło
					</label>
					<input
						id="dev-password"
						type="password"
						bind:value={password}
						placeholder="••••••••"
						required
						minlength="6"
						class="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					/>
				</div>

				<button
					type="submit"
					disabled={isLoading}
					class="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
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
							{isSignUp ? "Tworzenie konta..." : "Logowanie..."}
						</span>
					{:else}
						{isSignUp ? "Utwórz konto" : "Zaloguj się"}
					{/if}
				</button>
			</form>

			<div class="text-center pt-2">
				<button
					type="button"
					onclick={toggleMode}
					class="text-sm text-gray-400 hover:text-gray-300 underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
				>
					{isSignUp ? "Masz już konto? Zaloguj się" : "Nie masz konta? Utwórz konto"}
				</button>
			</div>
		{/if}
	</div>
{/if}

