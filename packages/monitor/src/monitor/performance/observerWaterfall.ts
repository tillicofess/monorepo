// performance/observerWaterfall.ts
import { eventBus } from '../utils/eventBus';
import type { PerformanceMetrics } from './type';

function calculateWaterfallData(entry: PerformanceNavigationTiming): PerformanceMetrics {
  const dnsLookup = entry.domainLookupEnd - entry.domainLookupStart;
  const tcpConnection = entry.connectEnd - entry.connectStart;
  const sslConnection =
    'secureConnectionStart' in entry ? entry.connectEnd - entry.secureConnectionStart : 0;
  const ttfb = entry.responseStart - entry.requestStart;
  const contentTransfer = entry.responseEnd - entry.responseStart;
  const contentParsing = entry.domInteractive - entry.responseEnd;
  const resourceLoading = entry.loadEventStart - entry.domContentLoadedEventEnd;
  const totalTime = entry.loadEventEnd - entry.fetchStart;

  const waterfallData = {
    dnsLookup: +Math.max(0, dnsLookup).toFixed(4),
    tcpConnection: +Math.max(0, tcpConnection).toFixed(4),
    sslConnection: +Math.max(0, sslConnection).toFixed(4),
    ttfb: +Math.max(0, ttfb).toFixed(4),
    contentTransfer: +Math.max(0, contentTransfer).toFixed(4),
    contentParsing: +Math.max(0, contentParsing).toFixed(4),
    resourceLoading: +Math.max(0, resourceLoading).toFixed(4),
    totalTime: +Math.max(0, totalTime).toFixed(4),
  };

  return {
    type: 'performance',
    subType: 'waterfall',
    value: waterfallData,
    url: window.location.href,
    effectiveType: (navigator as any).connection?.effectiveType || 'unknown',
  };
}

export default function waterfallObserver() {
  window.addEventListener('load', () => {
    const observer = new PerformanceObserver((list) => {
      const entry = list.getEntries()[0] as PerformanceNavigationTiming;
      if (entry.loadEventEnd) {
        const metrics = calculateWaterfallData(entry);
        eventBus.emit('performance', metrics);
        observer.disconnect();
      }
    });
    observer.observe({ type: 'navigation', buffered: true });
  });
}
