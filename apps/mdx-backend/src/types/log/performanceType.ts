export const METRIC_KEYS = ['cls', 'fcp', 'lcp', 'fid'] as const;
export type NetworkEffectiveType = 'slow-2g' | '2g' | '3g' | '4g';

export type MetricKey = (typeof METRIC_KEYS)[number];

export type Thresholds = readonly [good: number, need: number];

export interface MetricConfig {
  thresholds: Thresholds;
  min: number;
  max: number;
}

export interface PerformanceData {
  sub_type: MetricKey;
  p75: number;
  p90: number;
}

export interface PageLoadTiming {
  effective_type: NetworkEffectiveType;
  dns_lookup: number;
  tcp_connection: number;
  ssl_connection: number;
  ttfb: number;
  content_transfer: number;
  content_parsing: number;
  resource_loading: number;
  total: number;
}

export interface ChartProps extends MetricConfig {
  metricKey: MetricKey;
  p75: number;
}

export const performanceMetrics: Record<MetricKey, MetricConfig> = {
  cls: {
    thresholds: [0.1, 0.25],
    min: 0,
    max: 1,
  },
  fcp: {
    thresholds: [2500, 4000],
    min: 0,
    max: 10000,
  },
  lcp: {
    thresholds: [2500, 4000],
    min: 0,
    max: 10000,
  },
  fid: {
    thresholds: [100, 300],
    min: 0,
    max: 1000,
  },
};
