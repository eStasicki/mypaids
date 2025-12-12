<script lang="ts">
	import { page } from "$app/stores";
</script>

<div class="container mx-auto px-4 py-8 max-w-2xl">
	<div class="bg-red-900 bg-opacity-50 border border-red-700 rounded-lg p-6">
		<h1 class="text-2xl font-bold text-red-200 mb-4">Błąd autoryzacji</h1>
		<p class="text-red-300 mb-4">
			Wystąpił błąd podczas logowania. Spróbuj ponownie.
		</p>
		<a
			href="/"
			class="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
		>
			Powrót do strony głównej
		</a>
	</div>
</div>
