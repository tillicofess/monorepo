// 环境配置文件

// 环境识别
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;
export const mode = import.meta.env.MODE;

// API 配置
export const API_CONFIG = {
  // 开发环境配置
  development: {
    baseURL: 'http://localhost:4000',
    timeout: 15000,
    withCredentials: true,
  },
  // 生产环境配置
  production: {
    baseURL: 'https://api.ticscreek.top',
    timeout: 15000,
    withCredentials: true,
  },
};

// 获取当前环境的 API 配置
export const getApiConfig = () => {
  return isDevelopment ? API_CONFIG.development : API_CONFIG.production;
};

// 其他环境相关配置
export const ENV_CONFIG = {
  // 日志级别
  logLevel: isDevelopment ? 'debug' : 'error',
  // 是否启用调试
  enableDebug: isDevelopment,
  // API 重试次数
  retryCount: isDevelopment ? 1 : 3,
};

// 导出常用的环境判断函数
export const isDevMode = () => isDevelopment;
export const isProdMode = () => isProduction;

// 环境信息打印（仅开发环境）
if (isDevelopment) {
  console.log('🚀 Environment Info:', {
    mode,
    isDevelopment,
    isProduction,
    apiConfig: getApiConfig(),
  });
}
