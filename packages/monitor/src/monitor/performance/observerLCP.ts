import { eventBus } from '../utils/eventBus';

let lcp = 0;
let lcpObserver: PerformanceObserver | null = null;

export function startLCP() {
  lcpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    lcp = lastEntry.startTime;
  });
  lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
}

export function stopLCPAndReport() {
  if (!lcpObserver) return;

  lcpObserver.disconnect();

  eventBus.emit('performance', {
    type: 'performance',
    subType: 'lcp',
    value: lcp,
    url: document.location.href,
    effectiveType: (navigator as any).connection?.effectiveType || 'unknown',
  });

  lcpObserver = null;
}
