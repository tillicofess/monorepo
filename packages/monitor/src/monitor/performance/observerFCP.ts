import { eventBus } from '../utils/eventBus';

export default function paintObserver() {
  const paintObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name === 'first-contentful-paint') {
        paintObserver.disconnect();
        eventBus.emit('performance', {
          type: 'performance',
          subType: 'fcp',
          value: entry.startTime,
          url: document.location.href,
          effectiveType: (navigator as any).connection?.effectiveType || 'unknown',
        });
      }
    }
  });
  paintObserver.observe({ type: 'paint', buffered: true });
}
