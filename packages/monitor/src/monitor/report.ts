import { getConfig } from './config/index';

// 延迟获取 XMLHttpRequest 原型方法，避免 SSR 环境下报错
function getXhrMethods() {
  const originProto = XMLHttpRequest.prototype;
  return {
    originOpen: originProto.open,
    originSend: originProto.send,
  };
}

export function isSupportSendBeacon() {
  return typeof navigator !== 'undefined' && 'sendBeacon' in navigator;
}

// 延迟选择上报方法，避免 SSR 环境下报错
function getReportMethod() {
  return isSupportSendBeacon() ? beaconRequest : xhrRequest;
}

export function report(data: any) {
  // SSR 环境检查
  if (typeof window === 'undefined') {
    return;
  }

  const config = getConfig();
  if (!config.reportUrl) {
    console.error('[Monitor] reportUrl not configured');
    return;
  }
  if (config.appName) {
    data = { ...data, appName: config.appName };
  }
  const reportData = JSON.stringify(data);
  getReportMethod()(config.reportUrl, reportData);
}

export function xhrRequest(url: string, data: any) {
  const { originOpen, originSend } = getXhrMethods();
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(() => {
      const xhr = new XMLHttpRequest();
      originOpen.call(xhr, 'POST', url, true);
      originSend.call(xhr, data);
    });
  } else {
    setTimeout(() => {
      const xhr = new XMLHttpRequest();
      originOpen.call(xhr, 'POST', url, true);
      originSend.call(xhr, data);
    }, 0);
  }
}

export function beaconRequest(url: string, data: any) {
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(
      () => {
        navigator.sendBeacon(url, data);
      },
      { timeout: 3000 },
    );
  } else {
    setTimeout(() => {
      navigator.sendBeacon(url, data);
    }, 0);
  }
}
