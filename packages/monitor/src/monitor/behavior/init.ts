import { eventBus } from '../utils/eventBus';
import { initBehaviorCollector } from './collect';
import { breadcrumb } from './store';

let inited = false;

export function initBehavior() {
  if (inited) return;
  inited = true;
  breadcrumb.init();

  // 1. 订阅采集结果，写入 breadcrumb
  eventBus.on('behavior', (event: any) => {
    breadcrumb.push(event);
  });

  // 2. 启动采集器
  initBehaviorCollector();
}
