'use client';

import { useEffect } from 'react';
import { initMonitor } from '@monorepo/monitor';

export default function MonitorInit() {
  useEffect(() => {
    initMonitor({
      reportUrl: 'http://localhost:4000/errorLogs/create',
      appName: 'ssr-mdx',
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      enableBehavior: true,
      enableError: true,
      maxBreadcrumb: 10,
      enablePerformance: true,
    });
  }, []);

  return null;
}
