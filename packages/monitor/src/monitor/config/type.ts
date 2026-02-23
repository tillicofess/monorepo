export interface MonitorUserConfig {
  version: string;
  reportUrl: string;
  appName: string;

  maxBreadcrumb?: number;
  enableError?: boolean;
  enableBehavior?: boolean;
  enablePerformance?: boolean;
}

// 内部最终配置
export interface MonitorConfig {
  appName: string;
  version: string;
  reportUrl: string;

  maxBreadcrumb: number;
  enableError: boolean;
  enableBehavior: boolean;
  enablePerformance: boolean;
}
