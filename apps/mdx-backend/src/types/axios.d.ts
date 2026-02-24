import 'axios';

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
    _retryCount?: number; // 为下一步重试机制做准备
  }
}