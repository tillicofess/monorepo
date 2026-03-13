import sourceMap from "source-map-js";
import { http } from "@/lib/axios";

function matchStr(str: string) {
	if (str.endsWith(".js")) return str.substring(str.lastIndexOf("/") + 1);
}

export function loadSourceMap(
	fileName: string,
	appName: string,
	version: string,
) {
	const file = matchStr(fileName);
	if (!file) return;
	return new Promise((resolve) => {
		http
			.get(
				`/errorLogs/getmap?fileName=${file}&appName=${appName}&version=${version}`,
			)
			.then((response) => {
				resolve(response.data);
			});
	});
}

export const findCodeBySourceMap = async (error: {
	message: string;
	fileName: string;
	line: number;
	column: number;
	appName: string;
	version: string;
}) => {
	try {
		const { fileName, line, column, appName, version } = error;
		const sourceData = await loadSourceMap(fileName, appName, version);
		const { sourcesContent, sources } = sourceData as sourceMap.RawSourceMap;
		const consumer = await new sourceMap.SourceMapConsumer(
			sourceData as sourceMap.RawSourceMap,
		);
		const result = consumer.originalPositionFor({
			line: Number(line),
			column: Number(column),
		});
		const code = sourcesContent?.[sources.indexOf(result.source)] ?? "";
		let codeSnippet = "";
		if (code) {
			// 将代码按行分割为数组
			const lines = code.split("\n");

			// 获取报错行号（result.line）对应的代码
			const errorLine = result.line - 1; // 注意源代码的行号是从 1 开始的，数组索引是从 0 开始的，所以要减去 1
			const contextLines = 10; // 获取报错行前后各 10 行（可以根据需要调整）

			// 取报错行及前后几行代码
			const start = Math.max(0, errorLine - contextLines); // 确保开始行不小于 0
			const end = Math.min(lines.length, errorLine + contextLines + 1); // 确保结束行不超过总行数

			// 获取报错位置附近的代码段
			codeSnippet = lines.slice(start, end).join("\n");
		}

		return {
			result,
			codeSnippet,
		};
	} catch {
		throw new Error("Failed to find code by source map");
	}
};
