import { eventBus } from '../utils/eventBus';
import type { MonitorError } from './type';

let inited = false;

export default function initErrorCollector() {
  if (inited) return;
  inited = true;
  // 捕获 JS 运行时错误
  window.onerror = (msg, source, lineno, colno, error) => {
    const reportData: MonitorError = {
      category: 'js',
      type: error?.name || 'Error',
      message: String(msg),
      stack: error?.stack,
      fileName: source,
      line: lineno,
      column: colno,
    };

    eventBus.emit('error', reportData);
  };

  // 处理 Promise 未捕获拒绝错误
  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    const reason = event.reason;
    let reportData: MonitorError;
    if (reason instanceof Error) {
      reportData = {
        category: 'promise',
        type: reason.name,
        message: reason.message,
        stack: reason.stack,
      };
    } else {
      reportData = {
        category: 'promise',
        type: 'PromiseError',
        message: String(reason),
      };
    }

    eventBus.emit('error', reportData);
  });

  // 处理 资源 | DOM 错误
  window.addEventListener(
    'error',
    (event: Event) => {
      // 忽略 JS 运行时错误
      if (event instanceof ErrorEvent) return;

      const target = event.target as any;
      const url = target.currentSrc || target.src || target.href || '';
      const reportData: MonitorError = {
        category: 'resource',
        type: 'ResourceError',
        message: `资源加载失败: ${target.tagName} ${url}`,
        url: url,
        tagName: target.tagName,
      };

      eventBus.emit('error', reportData);
    },
    true, // 捕获阶段，才能拿到资源错误
  );
}
