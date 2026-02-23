import * as echarts from 'echarts';
import { useEffect } from 'react';

const useChartResize = (
  containerRef: React.RefObject<HTMLElement | null>,
  chartRef: React.RefObject<echarts.ECharts | null>,
) => {
  useEffect(() => {
    if (!containerRef.current) return;

    const resize = echarts.throttle(() => {
      chartRef.current?.resize();
    }, 200);

    const observer = new ResizeObserver(resize);
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);
};

export default useChartResize;
