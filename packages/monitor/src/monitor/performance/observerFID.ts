import { eventBus } from '../utils/eventBus';

export default function fidObserver() {
  const fidObserver = new PerformanceObserver((list) => {
    const entry: any = list.getEntries()[0];
    eventBus.emit('performance', {
      type: 'performance',
      subType: 'fid',
      value: (entry.processingStart - entry.startTime).toFixed(4),
      url: document.location.href,
      effectiveType: (navigator as any).connection?.effectiveType || 'unknown',
    });
    fidObserver.disconnect();
  });
  fidObserver.observe({ type: 'first-input', buffered: true });
}
