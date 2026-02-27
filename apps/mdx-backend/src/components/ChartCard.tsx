// components/ChartCard.tsx

import { Card, Spin, Typography, theme } from 'antd';
import { useEffect, useRef } from 'react';
import { FormattedMessage, type IntlShape, useIntl } from 'react-intl';
import useChartResize from '@/hooks/chart/useChartResize.ts';
import { useEChart } from '@/hooks/chart/useEChart.ts';
import type { ChartData } from '@/types/dashBoard';

const { Title, Text } = Typography;

const ChartCard = (props: { data: ChartData; loading: boolean }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useEChart(containerRef);
  const intl = useIntl();
  const { token } = theme.useToken();

  useChartResize(containerRef, chartRef);

  // 图表选项
  const buildOption = (data: ChartData, intl: IntlShape) => {
    const pageviewsData = data.pageviews.map((point) => [point.x, point.y]);
    const visibleData = data.sessions.map((point) => [point.x, point.y]);
    const primaryColor = token.colorPrimary;
    const successColor = token.colorSuccess;

    return {
      // 标题
      title: {
        text: '',
      },
      // 提示框
      tooltip: {
        trigger: 'axis',
        backgroundColor: token.colorBgElevated,
        borderColor: token.colorBorder,
        borderWidth: 1,
        textStyle: {
          color: token.colorText,
        },
        axisPointer: {
          type: 'line',
          lineStyle: {
            color: primaryColor,
            width: 1,
          },
        },
      },
      // 图例
      legend: {
        orient: 'vertical',
        right: 20,
        top: 'top',
        textStyle: {
          color: token.colorTextSecondary,
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        top: 50,
        containLabel: true,
      },
      // x轴
      xAxis: {
        type: 'time',
        nameLocation: 'middle',
        nameGap: 35,
        nameTextStyle: {
          color: token.colorTextSecondary,
          fontSize: 12,
        },
        // 轴线样式
        axisLine: {
          lineStyle: {
            color: token.colorBorderSecondary,
          },
        },
        axisTick: {
          show: false,
        },
        // 轴线标签样式
        axisLabel: {
          color: token.colorTextSecondary,
          formatter: (value: number) => {
            const date = new Date(value);
            return `${date.getMonth() + 1}/${date.getDate()}`;
          },
        },
        // 在grid上样式
        splitLine: {
          show: true,
          lineStyle: {
            color: token.colorBorderSecondary,
            type: 'dashed',
          },
        },
      },
      // y轴
      yAxis: {
        type: 'value',
        name: intl.formatMessage({ id: 'pageviews', defaultMessage: 'Pageviews' }),
        nameTextStyle: {
          color: token.colorTextSecondary,
          fontSize: 12,
        },
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: token.colorTextSecondary,
        },
        splitLine: {
          lineStyle: {
            color: token.colorBorderSecondary,
          },
        },
      },
      // 区域缩放 此处为滑动条
      dataZoom: [
        {
          type: 'slider',
          start: 0,
          end: 100,
          bottom: 10,
          height: 20,
          borderColor: 'transparent',
          backgroundColor: token.colorBorderSecondary,
          fillerColor: `${primaryColor}33`,
          handleStyle: {
            color: primaryColor,
            borderColor: primaryColor,
          },
          textStyle: {
            color: token.colorTextSecondary,
          },
          handleIcon:
            'path://M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
        },
        {
          type: 'inside',
          disabled: true,
        },
      ],
      series: [
        {
          name: intl.formatMessage({ id: 'pageviews', defaultMessage: 'Pageviews' }),
          type: 'line',
          smooth: true,
          showSymbol: false, // 数据点
          symbolSize: 6, // 数据点大小
          // 折线拐点标志的样式
          itemStyle: {
            color: primaryColor,
          },
          // 线条样式
          lineStyle: {
            width: 3,
            shadowColor: `${primaryColor}4D`,
            shadowBlur: 10,
            shadowOffsetY: 10,
          },
          // 区域填充样式
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: `${primaryColor}4D`,
                },
                {
                  offset: 1,
                  color: `${primaryColor}0D`,
                },
              ],
            },
          },
          data: pageviewsData,
        },
        {
          name: intl.formatMessage({ id: 'visitors', defaultMessage: 'Visitors' }),
          type: 'line',
          smooth: true,
          showSymbol: false,
          symbolSize: 6,
          // 折线拐点标志的样式
          itemStyle: {
            color: successColor,
          },
          // 线条样式
          lineStyle: {
            width: 3,
            shadowColor: `${successColor}4D`,
            shadowBlur: 10,
            shadowOffsetY: 10,
          },
          // 区域填充样式
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: `${successColor}4D`,
                },
                {
                  offset: 1,
                  color: `${successColor}0D`,
                },
              ],
            },
          },
          data: visibleData,
        },
      ],
    };
  };

  useEffect(() => {
    if (!chartRef.current) return;

    const option = buildOption(props.data, intl);
    chartRef.current.setOption(option as any);
  }, [props, intl.locale, token]);

  return (
    <Card
      title={
        <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <FormattedMessage id="visitRecord" defaultMessage="访问记录" />
        </Title>
      }
      style={{
        borderRadius: 12,
        marginBlock: 16,
        border: `1px solid ${token.colorBorderSecondary}`,
        boxShadow: token.boxShadow,
      }}
      styles={{ body: { padding: token.padding } }}
      extra={
        <Text type="secondary" style={{ fontSize: 12 }}>
          <FormattedMessage id="latestUpdateTime" defaultMessage="最新更新" />:{' '}
          {new Date().toLocaleString()}
        </Text>
      }
    >
      <div
        ref={containerRef}
        style={{ width: '100%', height: 320, visibility: props.loading ? 'hidden' : 'visible' }}
      />
      {props.loading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: `${token.colorBgContainer}99`,
            zIndex: 10,
          }}
        >
          <Spin />
        </div>
      )}
    </Card>
  );
};

export default ChartCard;
