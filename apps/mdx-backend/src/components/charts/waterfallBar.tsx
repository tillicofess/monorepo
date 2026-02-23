import { useEffect, useRef } from 'react';
import useChartResize from '@/hooks/chart/useChartResize.ts';
import { useEChart } from '@/hooks/chart/useEChart.ts';
import type { PageLoadTiming } from '@/types/log/performanceType';

const MetricChart = (props: PageLoadTiming) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useEChart(containerRef);

  useChartResize(containerRef, chartRef);

  const buildOption = (data: PageLoadTiming) => {
    // 1. 定义阶段顺序与展示名称
    const stages = [
      { key: 'dns_lookup', name: 'DNS Lookup' },
      { key: 'tcp_connection', name: 'TCP Connection' },
      { key: 'ssl_connection', name: 'SSL' },
      { key: 'ttfb', name: 'TTFB' },
      { key: 'content_transfer', name: 'Content Transfer' },
      { key: 'content_parsing', name: 'DOM Parsing' },
      { key: 'resource_loading', name: 'Resource Loading' },
    ];

    // 2. 计算阶梯偏移量 (Placeholder)
    // 每个阶段的起点 = 前面所有阶段耗时之和
    const placeholders: number[] = [];
    const values: number[] = [];
    let currentSum = 0;

    stages.forEach((stage) => {
      placeholders.push(currentSum);
      const val = data[stage.key as keyof PageLoadTiming] as number;
      values.push(val);
      currentSum += val;
    });

    return {
      title: {
        text: 'Navigation Timing Waterfall',
        left: 'center',
        textStyle: { fontSize: 14, color: '#666' },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const tar = params[1]; // 取第二个系列（实际数据）
          return `${tar.name}<br/>Duration: <b>${tar.value}ms</b>`;
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        splitLine: { lineStyle: { type: 'dashed' } },
        axisLabel: { formatter: '{value} ms' },
      },
      yAxis: {
        type: 'category',
        inverse: true, // 让阶段从上往下排列，符合 Network 面板习惯
        data: stages.map((s) => s.name),
      },
      series: [
        {
          name: 'Placeholder',
          type: 'bar',
          stack: 'Total',
          itemStyle: {
            borderColor: 'transparent',
            color: 'transparent', // 关键：设为透明
          },
          emphasis: {
            itemStyle: { borderColor: 'transparent', color: 'transparent' },
          },
          data: placeholders,
        },
        {
          name: 'Duration',
          type: 'bar',
          stack: 'Total',
          label: {
            show: true,
            position: 'right',
            formatter: '{c}ms',
          },
          itemStyle: {
            // 根据阶段类型赋予不同的 Chrome 风格颜色
            color: (params: any) => {
              const colors = [
                '#37A2DA',
                '#32C5E9',
                '#67E0E3',
                '#9FE6B8',
                '#FFDB5C',
                '#ff9f7f',
                '#fb7293',
              ];
              return colors[params.dataIndex];
            },
          },
          data: values,
        },
      ],
    };
  };

  useEffect(() => {
    if (!chartRef.current) return;
    const option = buildOption(props);
    chartRef.current.setOption(option as any, { notMerge: true });
  }, [props]);

  return <div ref={containerRef} style={{ width: '100%', height: 400 }} />;
};

export default MetricChart;
