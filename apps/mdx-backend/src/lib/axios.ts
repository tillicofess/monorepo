import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios';
import keycloak from '@/providers/auth/keycloak';
import { getApiConfig } from '../config/env';

const MAX_RETRY_LIMIT = 3; // 最大重试次数
const RETRY_DELAY = 1000;  // 重试延迟（毫秒）
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
let refreshPromise: Promise<boolean> | null = null;

// 获取当前环境的 API 配置
const apiConfig = getApiConfig();

// 创建 axios 实例
const instance: AxiosInstance = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  withCredentials: apiConfig.withCredentials,
  headers: {
    'Content-Type': 'application/json',
  },
});


// 请求拦截器
instance.interceptors.request.use((config) => {
  if (keycloak.token) {
    config.headers.Authorization = `Bearer ${keycloak.token}`;
  }
  return config;
});


const successHandler = (response: AxiosResponse) => {
  return response;
};

// 响应错误处理
const errorHandler = async (error: AxiosError) => {
  const config = error.config as InternalAxiosRequestConfig;
  if (!config) return Promise.reject(error);

  // --- 场景 A: 处理 401 Token 过期 (无感刷新) ---
  if (error.response?.status === 401 && !config._retry) {
    config._retry = true; // 标记该请求已经尝试过刷新 Token

    try {
      // 如果当前已经有一个刷新任务在进行，则直接复用它
      if (!refreshPromise) {
        refreshPromise = new Promise((resolve, reject) => {
          // KeycloakPromise 转换为标准 Promise
          keycloak.updateToken(30)
            .then((refreshed) => {
              // 判定标准：要么真的刷新了，要么本地 token 依然可用
              resolve(refreshed || (!!keycloak.token && !keycloak.isTokenExpired()));
            })
            .catch((err) => {
              reject(err);
            })
            .finally(() => {
              // 任务结束（无论成功失败），必须清空引用，否则下次过期将无法再次刷新
              refreshPromise = null;
            });
        });
      }

      // 等待刷新任务完成（无论是自己发起的还是“搭便车”的）
      const isSuccess = await refreshPromise;

      if (isSuccess && keycloak.token) {
        // 刷新成功，更新 Header 并重新发起本次请求
        config.headers.Authorization = `Bearer ${keycloak.token}`;
        return instance(config);
      }

      // 刷新逻辑执行了但没拿到有效 Token
      keycloak.clearToken();
      return Promise.reject(new Error('Token refresh failed: No valid token found'));

    } catch (refreshError) {
      // 刷新请求过程中报错（如 Refresh Token 也过期了）
      keycloak.clearToken();
      return Promise.reject(refreshError);
    }
  }

  // --- 场景 B: 实现通用请求最大重试次数 (针对 5xx 或网络错误) ---
  // 逻辑：如果是 5xx 错误且未达到重试上限，则自动重试
  const shouldRetry =
    !error.response || (error.response.status >= 500 && error.response.status <= 599);

  if (shouldRetry) {
    config._retryCount = config._retryCount ?? 0;

    if (config._retryCount < MAX_RETRY_LIMIT) {
      config._retryCount++;
      console.warn(`请求失败，正在进行第 ${config._retryCount} 次重试...`);

      await sleep(RETRY_DELAY);
      return instance(config);
    }
  }

  return Promise.reject(error);
};

// 响应拦截器
instance.interceptors.response.use(successHandler, errorHandler);

// 封装常用的 HTTP 方法
export const http = {
  // GET 请求
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return instance.get(url, config);
  },

  // POST 请求
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return instance.post(url, data, config);
  },

  // PUT 请求
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return instance.put(url, data, config);
  },

  // DELETE 请求
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return instance.delete(url, config);
  },

  // PATCH 请求
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return instance.patch(url, data, config);
  },
};

// 导出 axios 实例，以便需要更复杂配置时使用
export default instance;

// 类型定义
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T | null;
}

// 封装带有统一响应格式的请求方法
export const api = {
  // GET 请求，返回统一格式
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await http.get<ApiResponse<T>>(url, config);
    return response.data;
  },

  // POST 请求，返回统一格式
  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    const response = await http.post<ApiResponse<T>>(url, data, config);
    return response.data;
  },

  // PUT 请求，返回统一格式
  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    const response = await http.put<ApiResponse<T>>(url, data, config);
    return response.data;
  },

  // DELETE 请求，返回统一格式
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await http.delete<ApiResponse<T>>(url, config);
    return response.data;
  },

  // PATCH 请求，返回统一格式
  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    const response = await http.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  },
};

export const fetcher = (url: string) => http.get(url).then((res) => res.data.data);
