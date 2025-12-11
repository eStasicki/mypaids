<script lang="ts">
	import type { Month } from '$lib/types';
	import BaseChart from './BaseChart.svelte';
	import { CHART_COLORS } from '$lib/utils/chartUtils';

	let { loadedMonths }: { loadedMonths: Month[] } = $props();

	const datasetConfig = {
		borderColor: CHART_COLORS.primary,
		backgroundColor: CHART_COLORS.primaryLight,
		tension: 0.4,
		fill: false,
		pointRadius: 5,
		pointHoverRadius: 7,
		pointBackgroundColor: CHART_COLORS.primary,
		pointBorderColor: '#fff',
		pointBorderWidth: 2
	};
</script>

<BaseChart {loadedMonths} chartType="line" {datasetConfig} />

