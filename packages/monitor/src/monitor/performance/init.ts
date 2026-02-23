// performance/init.ts

import { getConfig } from '../config/index';
import { report } from '../report';
import { formatTime } from '../utils/day';
import { eventBus } from '../utils/eventBus';
import { listenRouteChange } from '../utils/router';
import { startCLS, stopCLSAndReport } from './observerCLS';
import fcpObserver from './observerFCP';
import fidObserver from './observerFID';
import { startLCP, stopLCPAndReport } from './observerLCP';
import waterfallObserver from './observerWaterfall';
import type { PerformanceMetrics } from './type';

let inited = false;

export function initPerformance() {
  if (inited) return;
  inited = true;

  // 订阅性能指标事件，上报
  eventBus.on('performance', (metrics: PerformanceMetrics) => {
    const payload = {
      ...metrics,
      version: getConfig().version,
      time: formatTime(new Date()),
    };
    report(payload);
  });

  // 初始化性能指标采集器
  fidObserver();
  fcpObserver();
  waterfallObserver();

  startCLS();
  startLCP();

  listenRouteChange(() => {
    stopCLSAndReport();
    stopLCPAndReport();

    startCLS();
    startLCP();
  });

  window.addEventListener('beforeunload', () => {
    stopCLSAndReport();
    stopLCPAndReport();
  });
}
