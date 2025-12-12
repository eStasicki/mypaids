<script lang="ts">
	import { user } from "$lib/stores";
	import { browser } from "$app/environment";
	import AuthModal from "$lib/components/AuthModal.svelte";
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";
	import AOS from "aos";
	import "aos/dist/aos.css";

	let showAuthModal = $state(false);
	let currentUser = $derived($user);

	function openAuthModal() {
		showAuthModal = true;
	}

	if (browser) {
		$effect(() => {
			if (currentUser) {
				goto("/my-paids");
			}
		});
	}

	onMount(() => {
		if (!browser) return;

		// Check if device is mobile (tablet and below)
		const isMobile = window.innerWidth < 768;

		// Initialize AOS only on desktop devices
		if (!isMobile) {
			AOS.init({
				duration: 800,
				easing: "ease-in-out",
				once: true,
				mirror: true,
				offset: 100,
			});

			return () => {
				AOS.refresh();
			};
		}
	});
</script>

<svelte:head>
	<title>Moje Rachunki - Zarządzaj swoimi rachunkami domowymi</title>
	<meta
		name="description"
		content="Profesjonalna aplikacja do zarządzania rachunkami domowymi. Śledź wydatki, analizuj koszty i kontroluj budżet w jednym miejscu."
	/>
</svelte:head>

<div class="min-h-screen bg-linear-to-br from-gray-900 via-gray-900 to-gray-800 text-gray-100">
	<!-- Navigation -->
	<nav class="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-7xl flex justify-between items-center">
		<div class="flex items-center gap-2">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
				/>
			</svg>
			<span class="text-lg sm:text-2xl font-bold">Moje Rachunki</span>
		</div>
		<button
			onclick={openAuthModal}
			class="px-4 py-2 sm:px-6 sm:py-2.5 text-sm sm:text-base bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg sm:rounded-xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 cursor-pointer"
		>
			Zaloguj się
		</button>
	</nav>

	<!-- Hero Section -->
	<section class="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 max-w-7xl">
		<div class="text-center mb-12 sm:mb-16" data-aos="fade-up">
			<h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 px-2 bg-linear-to-r from-white via-blue-100 to-white bg-clip-text text-transparent animate-float">
				Zarządzaj swoimi rachunkami
				<br />
				<span class="text-blue-400">z łatwością</span>
			</h1>
			<p class="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-400 mb-6 sm:mb-8 max-w-3xl mx-auto px-4" data-aos="fade-up" data-aos-delay="100">
				Profesjonalna aplikacja do śledzenia wydatków domowych. Kontroluj budżet, analizuj koszty i nigdy nie przegap terminu płatności.
			</p>
			<div class="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center flex-wrap px-4" data-aos="fade-up" data-aos-delay="200">
				<button
					onclick={openAuthModal}
					class="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 cursor-pointer hover:shadow-blue-500/50"
				>
					Rozpocznij za darmo
				</button>
				<a
					href="#features"
					class="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gray-700/50 hover:bg-gray-700 text-white rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 border border-gray-600/50 hover:border-gray-600 cursor-pointer transform hover:scale-105 active:scale-95 text-center"
				>
					Dowiedz się więcej
				</a>
			</div>
		</div>

		<!-- Hero Image/Demo -->
		<div class="relative max-w-5xl mx-auto mb-12 sm:mb-16 md:mb-20 px-4" data-aos="fade-up" data-aos-delay="300">
			<div class="bg-linear-to-br from-gray-800/90 to-gray-800/70 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-gray-700/50 shadow-2xl transform hover:scale-[1.02] transition-all duration-500">
				<div class="bg-gray-900/50 rounded-lg p-3 sm:p-4 md:p-6 border border-gray-700/30">
					<div class="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
						<div class="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500"></div>
						<div class="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-500"></div>
						<div class="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500"></div>
						<div class="flex-1"></div>
						<div class="text-xs sm:text-sm text-gray-500">Moje Rachunki</div>
					</div>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
						<div class="bg-gray-800/50 rounded-lg p-3 sm:p-4 border border-gray-700/30">
							<div class="flex items-center justify-between mb-2 sm:mb-3">
								<span class="text-xs sm:text-sm font-semibold text-gray-300">Listopad 2024</span>
								<span class="text-base sm:text-lg font-bold text-white">1,245.50 zł</span>
							</div>
							<div class="space-y-1.5 sm:space-y-2">
								<div class="flex items-center justify-between text-xs sm:text-sm">
									<span class="text-gray-400">⚡ Prąd</span>
									<span class="text-gray-300">250.00 zł</span>
								</div>
								<div class="flex items-center justify-between text-xs sm:text-sm">
									<span class="text-gray-400">💧 Woda</span>
									<span class="text-gray-300">120.50 zł</span>
								</div>
								<div class="flex items-center justify-between text-xs sm:text-sm">
									<span class="text-gray-400">🔥 Gaz</span>
									<span class="text-gray-300">180.00 zł</span>
								</div>
							</div>
						</div>
						<div class="bg-gray-800/50 rounded-lg p-3 sm:p-4 border border-gray-700/30">
							<div class="flex items-center justify-between mb-2 sm:mb-3">
								<span class="text-xs sm:text-sm font-semibold text-gray-300">Grudzień 2024</span>
								<span class="text-base sm:text-lg font-bold text-white">1,320.49 zł</span>
							</div>
							<div class="space-y-1.5 sm:space-y-2">
								<div class="flex items-center justify-between text-xs sm:text-sm">
									<span class="text-gray-400">⚡ Prąd</span>
									<span class="text-gray-300">280.00 zł</span>
								</div>
								<div class="flex items-center justify-between text-xs sm:text-sm">
									<span class="text-gray-400">🔥 Ogrzewanie</span>
									<span class="text-gray-300">350.00 zł</span>
								</div>
								<div class="flex items-center justify-between text-xs sm:text-sm">
									<span class="text-gray-400">🛡️ Ubezpieczenie</span>
									<span class="text-gray-300">150.00 zł</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Features Section -->
	<section id="features" class="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 max-w-7xl">
		<div class="text-center mb-10 sm:mb-12 md:mb-16 px-4" data-aos="fade-up">
			<h2 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">Wszystko czego potrzebujesz</h2>
			<p class="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
				Kompleksowe narzędzie do zarządzania rachunkami domowymi w jednym miejscu
			</p>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
			<!-- Feature 1 -->
			<div class="bg-linear-to-br from-gray-800/90 to-gray-800/70 backdrop-blur-sm rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20" data-aos="fade-up" data-aos-delay="100">
				<div class="w-12 h-12 sm:w-14 sm:h-14 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 sm:mb-6 transform hover:scale-110 transition-transform duration-300">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
						/>
					</svg>
				</div>
				<h3 class="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Proste zarządzanie</h3>
				<p class="text-sm sm:text-base text-gray-400">
					Dodawaj i organizuj rachunki w prosty sposób. Kategoryzuj wydatki, dodawaj notatki i śledź wszystkie swoje płatności w jednym miejscu.
				</p>
			</div>

			<!-- Feature 2 -->
			<div class="bg-linear-to-br from-gray-800/90 to-gray-800/70 backdrop-blur-sm rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20" data-aos="fade-up" data-aos-delay="200">
				<div class="w-12 h-12 sm:w-14 sm:h-14 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 sm:mb-6 transform hover:scale-110 transition-transform duration-300">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 sm:h-8 sm:w-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
						/>
					</svg>
				</div>
				<h3 class="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Szczegółowe analizy</h3>
				<p class="text-sm sm:text-base text-gray-400">
					Otrzymuj szczegółowe statystyki i wykresy swoich wydatków. Analizuj trendy, porównuj miesiące i kontroluj swój budżet.
				</p>
			</div>

			<!-- Feature 3 -->
			<div class="bg-linear-to-br from-gray-800/90 to-gray-800/70 backdrop-blur-sm rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-gray-700/50 hover:border-green-500/50 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20" data-aos="fade-up" data-aos-delay="300">
				<div class="w-12 h-12 sm:w-14 sm:h-14 bg-green-500/20 rounded-xl flex items-center justify-center mb-4 sm:mb-6 transform hover:scale-110 transition-transform duration-300">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 sm:h-8 sm:w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				</div>
				<h3 class="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Nigdy nie przegap terminu</h3>
				<p class="text-sm sm:text-base text-gray-400">
					Organizuj rachunki według miesięcy i dat. Łatwo znajdź wszystkie płatności i upewnij się, że nic nie umknie Twojej uwadze.
				</p>
			</div>

			<!-- Feature 4 -->
			<div class="bg-linear-to-br from-gray-800/90 to-gray-800/70 backdrop-blur-sm rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-gray-700/50 hover:border-yellow-500/50 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/20" data-aos="fade-up" data-aos-delay="400">
				<div class="w-12 h-12 sm:w-14 sm:h-14 bg-yellow-500/20 rounded-xl flex items-center justify-center mb-4 sm:mb-6 transform hover:scale-110 transition-transform duration-300">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
						/>
					</svg>
				</div>
				<h3 class="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Szablony rachunków</h3>
				<p class="text-sm sm:text-base text-gray-400">
					Twórz szablony dla powtarzających się rachunków. Oszczędzaj czas dzięki automatycznemu dodawaniu regularnych płatności.
				</p>
			</div>

			<!-- Feature 5 -->
			<div class="bg-linear-to-br from-gray-800/90 to-gray-800/70 backdrop-blur-sm rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-gray-700/50 hover:border-red-500/50 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20" data-aos="fade-up" data-aos-delay="500">
				<div class="w-12 h-12 sm:w-14 sm:h-14 bg-red-500/20 rounded-xl flex items-center justify-center mb-4 sm:mb-6 transform hover:scale-110 transition-transform duration-300">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 sm:h-8 sm:w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
				</div>
				<h3 class="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Zaawansowane wyszukiwanie</h3>
				<p class="text-sm sm:text-base text-gray-400">
					Szybko znajdź konkretne rachunki dzięki potężnym filtrom. Szukaj po nazwie, kategorii, kwocie i wielu innych kryteriach.
				</p>
			</div>

			<!-- Feature 6 -->
			<div class="bg-linear-to-br from-gray-800/90 to-gray-800/70 backdrop-blur-sm rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-gray-700/50 hover:border-indigo-500/50 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/20" data-aos="fade-up" data-aos-delay="600">
				<div class="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-4 sm:mb-6 transform hover:scale-110 transition-transform duration-300">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 sm:h-8 sm:w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
						/>
					</svg>
				</div>
				<h3 class="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Eksport i import</h3>
				<p class="text-sm sm:text-base text-gray-400">
					Eksportuj swoje dane w formacie JSON lub importuj je z innych źródeł. Miej pełną kontrolę nad swoimi danymi.
				</p>
			</div>
		</div>
	</section>

	<!-- CTA Section -->
	<section class="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 max-w-7xl">
		<div class="bg-linear-to-br from-blue-600/20 to-purple-600/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 border border-blue-500/30 text-center transform transition-all duration-500" data-aos="zoom-in" data-aos-delay="100">
			<h2 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">Gotowy, aby zacząć?</h2>
			<p class="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
				Dołącz do tysięcy użytkowników, którzy już kontrolują swoje rachunki domowe
			</p>
			<button
				onclick={openAuthModal}
				class="px-6 sm:px-8 py-3 sm:py-4 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 cursor-pointer hover:shadow-blue-500/50"
			>
				Załóż darmowe konto
			</button>
		</div>
	</section>

	<!-- Footer -->
	<footer class="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-7xl border-t border-gray-800" data-aos="fade-up">
		<div class="text-center text-gray-500 text-sm sm:text-base">
			<p>&copy; 2024 Moje Rachunki. Wszystkie prawa zastrzeżone.</p>
		</div>
	</footer>
</div>

<AuthModal bind:isOpen={showAuthModal} />

