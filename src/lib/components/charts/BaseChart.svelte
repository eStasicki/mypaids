<script lang="ts">
	import { onMount } from "svelte";
	import { Chart, registerables, type ChartConfiguration } from "chart.js";
	import type { Month } from "$lib/types";
	import { getChartLabels, getChartData, CHART_CONFIG, CHART_COLORS } from "$lib/utils/chartUtils";

	Chart.register(...registerables);

	let {
		loadedMonths,
		chartType,
		datasetConfig,
	}: {
		loadedMonths: Month[];
		chartType: "line" | "bar";
		datasetConfig: Record<string, unknown>;
	} = $props();

	let canvasElement: HTMLCanvasElement | null = $state(null);
	let chartInstance: Chart | null = $state(null);

	function createChartConfig(): ChartConfiguration {
		const labels = getChartLabels(loadedMonths);
		const data = getChartData(loadedMonths);

		return {
			type: chartType,
			data: {
				labels,
				datasets: [
					{
						label: "Suma miesięczna",
						data,
						...datasetConfig,
					},
				],
			},
			options: CHART_CONFIG,
		};
	}

	function updateChart() {
		if (!chartInstance) return;
		if (loadedMonths.length === 0) {
			chartInstance.data.labels = [];
			chartInstance.data.datasets[0].data = [];
			chartInstance.update();
			return;
		}

		const labels = getChartLabels(loadedMonths);
		const data = getChartData(loadedMonths);

		chartInstance.data.labels = labels;
		chartInstance.data.datasets[0].data = data;
		chartInstance.update();
	}

	onMount(() => {
		if (!canvasElement) return;

		const ctx = canvasElement.getContext("2d");
		if (!ctx) return;

		const config = createChartConfig();
		chartInstance = new Chart(ctx, config);

		return () => {
			if (chartInstance) {
				chartInstance.destroy();
			}
		};
	});

	$effect(() => {
		updateChart();
	});
</script>

<div class="w-full" style="height: 400px;">
	<canvas bind:this={canvasElement}></canvas>
</div>
