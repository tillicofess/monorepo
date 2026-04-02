import { eventBus } from "../utils/eventBus";
import type { MonitorError } from "./type";

let inited = false;

function getUrlFromStack(stack?: string): string | undefined {
	if (!stack) return undefined;
	// 匹配第一个出现的 http(s) 链接，直到 .js 结束
	const match = stack.match(/https?:\/\/[^\s)]+\.js/);
	return match ? match[0] : undefined;
}

function findDebugIdByUrl(url?: string): string | undefined {
	if (!url) return undefined;
	const debugIds = (window as any)._monitorDebugIds;
	if (!debugIds) return undefined;

	// 遍历注册表，只要记录的 key 包含这个 URL，就说明匹配上了
	const targetKey = Object.keys(debugIds).find((key) => key.includes(url));
	return targetKey ? debugIds[targetKey] : undefined;
}

export default function initErrorCollector() {
	if (inited) return;
	inited = true;
	// 捕获 JS 运行时错误
	window.onerror = (msg, source, lineno, colno, error) => {
		const stack = error?.stack;
		const reportData: MonitorError = {
			category: "js",
			type: error?.name || "Error",
			message: String(msg),
			stack: stack,
			fileName: source,
			line: lineno,
			column: colno,
			debug_id: findDebugIdByUrl(source),
		};

		eventBus.emit("error", reportData);
	};

	// 处理 Promise 未捕获拒绝错误
	window.addEventListener(
		"unhandledrejection",
		(event: PromiseRejectionEvent) => {
			const reason = event.reason;
			let reportData: MonitorError;
			if (reason instanceof Error) {
				const stack = reason.stack;
				const firstJsUrl = getUrlFromStack(stack);
				reportData = {
					category: "promise",
					type: reason.name,
					message: reason.message,
					stack: stack,
					debug_id: findDebugIdByUrl(firstJsUrl),
				};
			} else {
				reportData = {
					category: "promise",
					type: "PromiseError",
					message: String(reason),
				};
			}

			eventBus.emit("error", reportData);
		},
	);

	// 处理 资源 | DOM 错误
	window.addEventListener(
		"error",
		(event: Event) => {
			// 忽略 JS 运行时错误
			if (event instanceof ErrorEvent) return;

			const target = event.target as any;
			const url = target.currentSrc || target.src || target.href || "";
			const reportData: MonitorError = {
				category: "resource",
				type: "ResourceError",
				message: `资源加载失败: ${target.tagName} ${url}`,
				url: url,
				tagName: target.tagName,
			};

			eventBus.emit("error", reportData);
		},
		true, // 捕获阶段，才能拿到资源错误
	);
}
