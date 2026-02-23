// performance/type.ts
export interface PerformanceMetrics {
  type: 'performance';
  subType: 'cls' | 'lcp' | 'fid' | 'fcp' | 'waterfall';
  value: number | WaterfallData;
  url?: string;
  effectiveType: '4g' | '3g' | '2g' | 'slow-2g' | 'unknown';
}

export interface WaterfallData {
  dnsLookup: number;
  tcpConnection: number;
  sslConnection: number;
  ttfb: number;
  contentTransfer: number;
  contentParsing: number;
  resourceLoading: number;
  totalTime: number;
}
