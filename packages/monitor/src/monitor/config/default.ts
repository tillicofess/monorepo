import type { MonitorConfig } from './type';

export const defaultConfig: Omit<MonitorConfig, 'appName' | 'version' | 'reportUrl'> = {
  maxBreadcrumb: 20,
  enableError: false,
  enableBehavior: false,
  enablePerformance: false,
};
