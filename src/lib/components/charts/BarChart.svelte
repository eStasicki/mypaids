<script lang="ts">
	import type { Month } from "$lib/types";
	import BaseChart from "./BaseChart.svelte";
	import { CHART_COLORS } from "$lib/utils/chartUtils";

	let { loadedMonths }: { loadedMonths: Month[] } = $props();

	const datasetConfig = {
		backgroundColor: CHART_COLORS.primaryAlpha,
		borderColor: CHART_COLORS.primary,
		borderWidth: 2,
		borderRadius: 4,
	};
</script>

<BaseChart {loadedMonths} chartType="bar" {datasetConfig} />
