import { useEffect, useRef } from "react";
import echarts from "@/utils/echart";

export const useEChart = (
	containerRef: React.RefObject<HTMLDivElement | null>,
) => {
	const chartRef = useRef<ReturnType<typeof echarts.init> | null>(null);

	useEffect(() => {
		if (!containerRef.current) return;

		const chart = echarts.init(containerRef.current);
		chartRef.current = chart;

		return () => {
			chart.dispose();
			chartRef.current = null;
		};
	}, []);

	return chartRef;
};
