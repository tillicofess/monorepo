import { breadcrumb } from '../behavior/store';
import { getConfig } from '../config/index';
import { report } from '../report';
import { formatTime } from '../utils/day';
import { eventBus } from '../utils/eventBus';
import initErrorCollector from './collect';
import type { MonitorError } from './type';

let inited = false;

export function initError() {
  if (inited) return;
  inited = true;
  const config = getConfig();

  // 1. 订阅错误事件
  eventBus.on('error', (error: MonitorError) => {
    // 3. 组合行为数据
    const payload = {
      type: 'error',
      error,
      actions: breadcrumb.getStack(),
      time: formatTime(new Date()),
      version: config.version,
    };
    // 4. 上报
    report(payload);
    // 5. 清空面包屑
    breadcrumb.clear();
  });

  // 2. 启动采集器
  initErrorCollector();
}
