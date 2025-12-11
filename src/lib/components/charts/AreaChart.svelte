<script lang="ts">
	import type { Month } from '$lib/types';
	import BaseChart from './BaseChart.svelte';
	import { CHART_COLORS } from '$lib/utils/chartUtils';

	let { loadedMonths }: { loadedMonths: Month[] } = $props();

	const datasetConfig = {
		borderColor: CHART_COLORS.primary,
		backgroundColor: CHART_COLORS.primaryMedium,
		tension: 0.4,
		fill: true,
		pointRadius: 4,
		pointHoverRadius: 6,
		pointBackgroundColor: CHART_COLORS.primary,
		pointBorderColor: '#fff',
		pointBorderWidth: 2
	};
</script>

<BaseChart {loadedMonths} chartType="line" {datasetConfig} />

