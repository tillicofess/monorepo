import { defaultConfig } from './default';
import type { MonitorConfig, MonitorUserConfig } from './type';

let config: MonitorConfig | null = null;

export function setConfig(userConfig: MonitorUserConfig) {
  // 一次 merge 就完成内部最终配置
  config = {
    ...defaultConfig, // 默认值字段
    ...userConfig, // 用户必填和覆盖默认字段
  } as MonitorConfig;
}

export function getConfig(): MonitorConfig {
  if (!config) {
    throw new Error('[Monitor] config not initialized, call initMonitor first.');
  }
  return config;
}
