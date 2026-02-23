export interface overviewDataItem {
  value: number;
  prev: number;
}

export interface OverviewData {
  [key: string]: overviewDataItem;
}

export interface ChartData {
  pageviews: Array<{
    x: string;
    y: number;
  }>;
  sessions: Array<{
    x: string;
    y: number;
  }>;
}
