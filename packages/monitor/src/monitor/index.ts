import { initBehavior } from './behavior/init';
import { getConfig, setConfig } from './config/index';
import type { MonitorUserConfig } from './config/type';
import { initError } from './error/init';
import { initPerformance } from './performance/init';

let inited = false;

export function initMonitor(userOptions: MonitorUserConfig) {
  // SSR 环境检查，避免在服务端执行
  if (typeof window === 'undefined') {
    console.warn('[Monitor SDK] initMonitor should not be called in SSR environment');
    return;
  }

  if (inited) return;
  inited = true;

  // 1. 全局配置
  setConfig(userOptions);
  const config = getConfig();

  // 1. 初始化行为采集器
  if (config.enableBehavior !== false) {
    initBehavior();
  }

  // 2. 初始化错误采集器
  if (config.enableError !== false) {
    initError();
  }

  // 3. 初始化性能采集器
  if (config.enablePerformance !== false) {
    initPerformance();
  }

  console.log('[Monitor SDK] initialized', config);
}
