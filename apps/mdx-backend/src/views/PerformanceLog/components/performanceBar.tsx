import { theme } from 'antd';
import { useEffect, useRef } from 'react';
import useChartResize from '@/hooks/chart/useChartResize.ts';
import { useEChart } from '@/hooks/chart/useEChart.ts';
import type { ChartProps } from '@/views/PerformanceLog/types/performanceType';

const THEME = {
  good: '#0cce6b', // 翠绿
  improve: '#ffa400', // 琥珀
  poor: '#ff4e42', // 砖红
};

const MetricChart = (props: ChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useEChart(containerRef);
  const { token } = theme.useToken();

  useChartResize(containerRef, chartRef);

  const buildOption = ({ metricKey, p75, thresholds, min, max }: ChartProps) => {
    const [good, need] = thresholds;
    const indicatorColor = token.colorText;
    const borderColor = token.colorBgContainer;

    return {
      title: {
        text: `{val|${p75}}{unit|ms}`, // 使用富文本
        right: 10,
        top: 'center',
        textStyle: {
          rich: {
            val: { fontSize: 20, fontWeight: 'bold', color: token.colorText },
            unit: { fontSize: 12, color: token.colorTextTertiary, padding: [0, 0, 4, 4] },
          },
        },
      },
      grid: {
        left: 10,
        right: 120, // 为右侧标题留出充足空间
        top: 35,
        bottom: 35,
      },
      xAxis: { type: 'value', min, max, show: false },
      yAxis: { type: 'category', data: [metricKey], show: false },
      series: [
        // 背景层：Good
        {
          type: 'bar',
          stack: 'total',
          silent: true,
          data: [good],
          barWidth: 12,
          itemStyle: {
            color: THEME.good,
          },
          markLine: {
            symbol: 'none',
            silent: true,
            label: {
              position: 'start',
              formatter: '{b}', // 显示名称，如 "2500"
              fontSize: 10,
              color: token.colorTextTertiary,
              distance: 10, // 文字与线的距离
            },
            lineStyle: {
              type: 'dashed',
              color: token.colorBorderSecondary,
              width: 1,
            },
            data: [
              { xAxis: good, name: good.toString() },
              { xAxis: need, name: need.toString() },
            ],
          },
        },
        // 背景层：Improve
        {
          type: 'bar',
          stack: 'total',
          silent: true,
          data: [need - good],
          itemStyle: { color: THEME.improve },
        },
        // 背景层：Poor
        {
          type: 'bar',
          stack: 'total',
          silent: true,
          data: [max - need],
          itemStyle: {
            color: THEME.poor,
          },
        },
        // 关键：p75 指示器 (改用 pictorialBar 模拟滑块)
        {
          type: 'pictorialBar',
          symbol: 'rect', // 使用矩形模拟刻度线
          symbolSize: [4, 24], // 宽度4，高度超过背景槽
          symbolOffset: [0, 0],
          z: 20,
          symbolPosition: 'end',
          data: [p75],
          itemStyle: {
            color: indicatorColor,
            shadowBlur: 4,
            shadowColor: `${token.colorText}4D`,
            borderWidth: 2,
            borderColor: borderColor,
          },
          // 增加数值标注
          label: {
            show: true,
            position: 'top',
            formatter: metricKey.toUpperCase(),
            fontSize: 12,
            fontWeight: 'bold',
            color: token.colorTextSecondary,
            distance: 10,
          },
        },
      ],
    };
  };

  useEffect(() => {
    if (!chartRef.current) return;

    const option = buildOption(props);
    chartRef.current.setOption(option as any);
  }, [props, token]);

  return <div ref={containerRef} style={{ width: '100%', height: 90 }} />;
};

export default MetricChart;
