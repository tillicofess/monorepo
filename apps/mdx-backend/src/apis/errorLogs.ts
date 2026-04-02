import { http } from "@/lib/axios";

export const findCodeBySourceMap = async (error: {
	debug_id: string; // 使用我们之前上报的 debug_id
	line: number;
	column: number;
}) => {
	try {
		const { debug_id, line, column } = error;

		// 直接向后端请求还原后的结果
		const response = await http.get(`/errorLogs/getOriginalCode`, {
			params: {
				debugId: debug_id,
				line,
				column,
			},
		});

		const { data } = response.data;

		return {
			result: {
				source: data.source,
				line: data.line,
				column: data.column,
				name: data.name,
			},
			codeSnippet: data.codeSnippet,
		};
	} catch (err) {
		console.warn("Failed to retrieve source code from source map:", err);
		throw err;
	}
};
