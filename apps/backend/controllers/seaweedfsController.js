import axios from "axios";
import pool from "../config/db.js";

export const uploadSourceMap = async (req, res) => {
	try {
		// 打印 CI 传过来的参数
		console.log("--- 收到 SourceMap 上传请求 ---");
		const { debugId, releaseId, uploadId, fileName } = req.body;
		const fileBuffer = req.file.buffer;

		// 1. 转发给 SeaweedFS Filer (内部地址)
		const seaweedBaseUrl = process.env.SEAWEEDFS_FILER_URL;
		const seaweedPath = `/sourcemaps/${releaseId}/${uploadId}/${fileName}`;

		await axios.put(`${seaweedBaseUrl}${seaweedPath}`, fileBuffer, {
			headers: { "Content-Type": "application/octet-stream" },
		});
		console.log(`✅ SeaweedFS 存储成功: ${seaweedPath}`);

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
		console.log(`✅ 数据库记录成功: ${debugId}`);

		res.status(200).json({ success: true, message: "SourceMap Sync Done" });
	} catch (error) {
		console.error("❌ 上传失败:", error.message);
		res.status(500).json({ error: error.message });
	}
};
