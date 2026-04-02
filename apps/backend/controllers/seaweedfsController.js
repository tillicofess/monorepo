import axios from "axios";
import sourceMap from "source-map-js";
import pool from "../config/db.js";

export const uploadSourceMap = async (req, res) => {
	try {
		// 打印 CI 传过来的参数
		const { debugId, releaseId, uploadId, fileName } = req.body;
		const fileBuffer = req.file.buffer;

		// 1. 转发给 SeaweedFS Filer (内部地址)
		const seaweedBaseUrl = process.env.SEAWEEDFS_FILER_URL;
		const seaweedPath = `/sourcemaps/${debugId}.map`;

		await axios.put(`${seaweedBaseUrl}${seaweedPath}`, fileBuffer, {
			headers: { "Content-Type": "application/octet-stream" },
		});

		// 2. 写入 MySQL 数据库
		const sql = `
            INSERT INTO monitor_sourcemaps 
            (debug_id, release_id, upload_id, file_name, seaweed_path) 
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            release_id = VALUES(release_id),
            seaweed_path = VALUES(seaweed_path)
        `;

		// 使用 pool.execute 自动处理连接获取与释放
		await pool.execute(sql, [
			debugId,
			releaseId,
			uploadId,
			fileName,
			seaweedPath,
		]);

		res.status(200).json({ success: true, message: "SourceMap Sync Done" });
	} catch (error) {
		console.error("❌ 上传失败:", error.message);
		res.status(500).json({ error: error.message });
	}
};

export const getOriginalCode = async (req, res) => {
	try {
		const { debugId, line, column } = req.query;

		// 1. 从数据库查找对应的 SeaweedFS 路径
		const [rows] = await pool.execute(
			"SELECT seaweed_path FROM monitor_sourcemaps WHERE debug_id = ?",
			[debugId],
		);

		if (rows.length === 0) {
			return res
				.status(404)
				.json({ error: "SourceMap not found for this debugId" });
		}

		const seaweedPath = rows[0].seaweed_path;
		const seaweedBaseUrl = process.env.SEAWEEDFS_FILER_URL;

		// 2. 从 SeaweedFS 获取 Map 文件内容 (内部网络)
		const seaweedResponse = await axios.get(`${seaweedBaseUrl}${seaweedPath}`);
		const rawSourceMap = seaweedResponse.data;

		// 3. 使用 source-map-js 进行解析
		const consumer = new sourceMap.SourceMapConsumer(rawSourceMap);

		// 还原原始位置
		const adjustedLine = Number(line) - 1;
		const originalPos = consumer.originalPositionFor({
			line: adjustedLine,
			column: Number(column),
		});

		if (!originalPos.source) {
			return res
				.status(400)
				.json({ error: "Could not find original position" });
		}

		// 4. 获取代码片段 (codeSnippet)
		let codeSnippet = "";
		const sourceIndex = rawSourceMap.sources.indexOf(originalPos.source);
		const fullSourceCode = rawSourceMap.sourcesContent?.[sourceIndex];

		if (fullSourceCode) {
			const lines = fullSourceCode.split("\n");
			const errorLine = originalPos.line - 1; // 数组索引从 0 开始
			const start = Math.max(0, errorLine - 5); // 取前后 5 行即可
			const end = Math.min(lines.length, errorLine + 6);

			codeSnippet = lines.slice(start, end).map((content, index) => ({
				line: start + index + 1,
				content: content,
				isErrorLine: start + index === errorLine,
			}));
		}

		// 5. 只返回安全的信息给前端
		res.json({
			success: true,
			data: {
				source: originalPos.source,
				line: originalPos.line,
				column: originalPos.column,
				name: originalPos.name,
				codeSnippet: codeSnippet, // 数组格式更方便前端渲染高亮
			},
		});
	} catch (error) {
		console.error("SourceMap还原失败:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
};
