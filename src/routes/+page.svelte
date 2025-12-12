<script lang="ts">
  import { months } from "$lib/stores";
  import { onMount } from "svelte";
  import { _ } from "svelte-i18n";
  import { t } from "$lib/utils/i18n";
  import MonthCard from "$lib/components/MonthCard.svelte";
  import AddMonthForm from "$lib/components/AddMonthForm.svelte";
  import ExportImportModal from "$lib/components/ExportImportModal.svelte";
  import SearchFiltersComponent from "$lib/components/SearchFilters.svelte";
  import TemplateManager from "$lib/components/TemplateManager.svelte";
  import {
    loadMonthsFromStorage,
    saveMonthsToStorage,
  } from "$lib/utils/storageUtils";
  import { sortMonthsByDate } from "$lib/utils/monthUtils";
  import {
    filterMonths,
    getSearchStats,
    type SearchFilters,
  } from "$lib/utils/searchUtils";

  let showAddForm = $state(false);
  let showExportImportModal = $state(false);
  let showTemplateManager = $state(false);
  let searchFilters = $state<SearchFilters>({
    query: "",
    categoryIds: new Set(),
    minAmount: null,
    maxAmount: null,
    sortBy: "date",
    sortOrder: "desc",
  });

  onMount(() => {
    const loadedMonths = loadMonthsFromStorage();
    if (loadedMonths.length > 0) {
      months.set(sortMonthsByDate(loadedMonths));
    }
  });

  $effect(() => {
    const unsubscribe = months.subscribe((value) => {
      saveMonthsToStorage(value);
    });
    return unsubscribe;
  });
</script>

<div class="container mx-auto px-4 py-8 max-w-7xl">
  <header
    role="banner"
    class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4"
  >
    <div>
      <h1
        class="text-5xl font-bold bg-linear-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2 leading-normal"
      >
        {t("app.title", "Moje Rachunki")}
      </h1>
      <p class="text-gray-400 text-sm">{t("app.subtitle", "Zarządzaj swoimi rachunkami domowymi")}</p>
    </div>
    <div class="flex gap-3 flex-wrap">
      <a
        href="/summary"
        aria-label={t("aria.goToSummary", "Przejdź do podsumowania")}
        class="px-6 py-3 bg-gray-700/50 hover:bg-gray-700 text-white rounded-xl font-medium transition-all duration-200 border border-gray-600/50 hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer flex items-center gap-2 active:scale-95"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <span>{t("monthsPage.summary", "Podsumowanie")}</span>
      </a>
      <button
        onclick={() => (showExportImportModal = true)}
        aria-label={t("aria.exportImport", "Eksportuj lub importuj dane")}
        class="px-6 py-3 bg-gray-700/50 hover:bg-gray-700 text-white rounded-xl font-medium transition-all duration-200 border border-gray-600/50 hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer flex items-center gap-2 active:scale-95"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        <span>{t("monthsPage.exportImport", "Eksport/Import")}</span>
      </button>
      <button
        onclick={() => (showTemplateManager = true)}
        aria-label={t("aria.manageTemplates", "Zarządzaj szablonami rachunków")}
        class="px-6 py-3 bg-gray-700/50 hover:bg-gray-700 text-white rounded-xl font-medium transition-all duration-200 border border-gray-600/50 hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer flex items-center gap-2 active:scale-95"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <span>{t("monthsPage.templates", "Szablony")}</span>
      </button>
      <button
        onclick={() => (showAddForm = !showAddForm)}
        aria-label={showAddForm
          ? t("aria.cancelAddMonth", "Anuluj dodawanie miesiąca")
          : t("aria.addNewMonth", "Dodaj nowy miesiąc")}
        aria-expanded={showAddForm}
        aria-controls="add-month-form"
        class="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 active:scale-95 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        <span>{showAddForm ? t("common.cancel", "Anuluj") : t("monthsPage.addMonth", "Dodaj Miesiąc")}</span>
      </button>
    </div>
  </header>

  {#if showAddForm}
    <div
      id="add-month-form"
      class="mb-8 animate-fade-in"
      role="region"
      aria-labelledby="add-month-form-title"
    >
      <AddMonthForm onClose={() => (showAddForm = false)} />
    </div>
  {/if}

  <SearchFiltersComponent
    filters={searchFilters}
    onFiltersChange={(f) => (searchFilters = f)}
  />

  {#if true}
    {@const filteredMonths = filterMonths($months, searchFilters)}
    {@const stats = getSearchStats($months, searchFilters)}

    {#if searchFilters.query.trim() !== "" || searchFilters.categoryIds.size > 0 || searchFilters.minAmount !== null || searchFilters.maxAmount !== null}
      <div
        class="mb-6 p-4 bg-linear-to-br from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20"
      >
        <div class="flex flex-wrap items-center gap-4 text-sm">
          <div class="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span class="text-gray-300">{t("monthsPage.found", "Znaleziono:")}</span>
            <span class="font-semibold text-white"
              >{stats.totalBills} {t("monthsPage.billsCount", "rachunków")}</span
            >
          </div>
          <div class="flex items-center gap-2">
            <span class="text-gray-300">{t("monthsPage.totalSum", "Łączna suma:")}</span>
            <span class="font-semibold text-white"
              >{stats.totalAmount.toFixed(2)} {t("bills.currency", "zł")}</span
            >
          </div>
          <div class="flex items-center gap-2">
            <span class="text-gray-300">{t("monthsPage.average", "Średnia:")}</span>
            <span class="font-semibold text-white"
              >{stats.averageAmount.toFixed(2)} {t("bills.currency", "zł")}</span
            >
          </div>
        </div>
      </div>
    {/if}

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {#each filteredMonths as month (month.id)}
        <MonthCard {month} />
      {:else}
        <div class="col-span-full text-center py-16">
          <div
            class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-800/50 mb-4"
          >
            {#if searchFilters.query.trim() !== "" || searchFilters.categoryIds.size > 0 || searchFilters.minAmount !== null || searchFilters.maxAmount !== null}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-10 w-10 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            {:else}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-10 w-10 text-gray-500"
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
            {/if}
          </div>
          {#if searchFilters.query.trim() !== "" || searchFilters.categoryIds.size > 0 || searchFilters.minAmount !== null || searchFilters.maxAmount !== null}
            <p class="text-xl font-semibold text-gray-300 mb-2">
              {t("monthsPage.noSearchResults", "Brak wyników wyszukiwania")}
            </p>
            <p class="text-sm text-gray-500">
              {t("monthsPage.noSearchResultsMessage", "Spróbuj zmienić kryteria wyszukiwania")}
            </p>
          {:else if $months.length === 0}
            <p class="text-xl font-semibold text-gray-300 mb-2">
              {t("monthsPage.noMonths", "Brak dodanych miesięcy")}
            </p>
            <p class="text-sm text-gray-500">
              {t("monthsPage.noMonthsMessage", "Kliknij \"Dodaj Miesiąc\", aby rozpocząć")}
            </p>
          {:else}
            <p class="text-xl font-semibold text-gray-300 mb-2">
              {t("monthsPage.noMonths", "Brak dodanych miesięcy")}
            </p>
            <p class="text-sm text-gray-500">
              {t("monthsPage.noMonthsMessage", "Kliknij \"Dodaj Miesiąc\", aby rozpocząć")}
            </p>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

<ExportImportModal
  show={showExportImportModal}
  onClose={() => (showExportImportModal = false)}
/>
<TemplateManager
  show={showTemplateManager}
  onClose={() => (showTemplateManager = false)}
/>
