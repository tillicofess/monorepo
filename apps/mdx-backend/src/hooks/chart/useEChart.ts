import * as echarts from 'echarts';
import { useEffect, useRef } from 'react';

export const useEChart = (containerRef: React.RefObject<HTMLDivElement | null>) => {
  const chartRef = useRef<echarts.ECharts | null>(null);

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
