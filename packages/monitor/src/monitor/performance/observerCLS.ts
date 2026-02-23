import { eventBus } from '../utils/eventBus';

let cls = 0;
let clsObserver: PerformanceObserver | null = null;

export function startCLS() {
  cls = 0;
  clsObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries() as any[]) {
      if (!entry.hadRecentInput) {
        cls += entry.value;
      }
    }
  });
  clsObserver.observe({ type: 'layout-shift', buffered: true });
}

export function stopCLSAndReport() {
  if (!clsObserver) return;

  clsObserver.disconnect();

  eventBus.emit('performance', {
    type: 'performance',
    subType: 'cls',
    value: cls.toFixed(4),
    url: document.location.href,
    effectiveType: (navigator as any).connection?.effectiveType || 'unknown',
  });

  clsObserver = null;
}
