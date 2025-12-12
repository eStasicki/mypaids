<script lang="ts">
  import "../app.css";
  import favicon from "$lib/assets/favicon.svg";

  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>Moje Rachunki</title>
</svelte:head>

<div
  class="min-h-screen bg-linear-to-br from-gray-900 via-gray-900 to-gray-800 text-gray-100"
>
  {@render children()}
</div>
