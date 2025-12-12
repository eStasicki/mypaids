<script lang="ts">
  import "../app.css";
  import favicon from "$lib/assets/favicon.svg";
  import { _ } from "svelte-i18n";
  import { browser } from "$app/environment";

  let { children } = $props();
  
  let title = $state("Moje Rachunki");
  
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

<div
  class="min-h-screen bg-linear-to-br from-gray-900 via-gray-900 to-gray-800 text-gray-100"
>
  {@render children()}
</div>
