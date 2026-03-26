import { initMonitor } from "@monorepo/monitor";

// 从环境变量读取配置
const config = {
	version: process.env.NEXT_PUBLIC_MONITOR_VERSION || "1.0.0",
	reportUrl:
		process.env.NEXT_PUBLIC_MONITOR_REPORT_URL ||
		"https://api.ticscreek.top/errorLogs/create",
	appName: process.env.NEXT_PUBLIC_MONITOR_APP_NAME || "ssr-mdx",
	enableError: process.env.NEXT_PUBLIC_MONITOR_ENABLE_ERROR !== "true",
	enableBehavior: process.env.NEXT_PUBLIC_MONITOR_ENABLE_BEHAVIOR !== "true",
	enablePerformance:
		process.env.NEXT_PUBLIC_MONITOR_ENABLE_PERFORMANCE !== "true",
	maxBreadcrumb: Number(process.env.NEXT_PUBLIC_MONITOR_MAX_BREADCRUMB) || 10,
};
// 初始化监控SDK
initMonitor(config);
