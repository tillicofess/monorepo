import { randomUUID } from "crypto";
import path from "path";
import STS from "qcloud-cos-sts";
import pool from "../config/db.js";

const config = {
	secretId: process.env.COS_SECRET_ID,
	secretKey: process.env.COS_SECRET_KEY,
	durationSeconds: 1800,
	bucket: process.env.COS_BUCKET,
	region: process.env.COS_REGION,
	allowActions: [
		"name/cos:PutObject",
		"name/cos:HeadObject",
		"name/cos:InitiateMultipartUpload",
		"name/cos:ListMultipartUploads",
		"name/cos:ListParts",
		"name/cos:UploadPart",
		"name/cos:CompleteMultipartUpload",
	],
};

const generateCosKey = (fileHash, ext) => {
	return `file/${fileHash}${ext || ""}`;
};

export const getCosSts = async (req, res) => {
	let connection;
	try {
		const { filename, parentId, fileSize, fileHash } = req.query;

		if (!filename || !fileHash) {
			res.status(400).send({ code: 1, message: "请传入文件名和文件哈希" });
			return;
		}

		const ext = path.extname(filename);
		const cosKey = generateCosKey(fileHash, ext);
		const fileId = randomUUID();
		const size = parseInt(fileSize, 10) || 0;
		const fileType = ext.replace(".", "").toLowerCase() || null;

		connection = await pool.getConnection();
		await connection.execute(
			`INSERT INTO files (id, name, is_directory, parent_id, cos_key, file_hash, status, size, file_type)
			 VALUES (?, ?, 0, ?, ?, ?, 0, ?, ?)`,
			[fileId, filename, parentId || null, cosKey, fileHash, size, fileType],
		);

		const AppId = config.bucket.substr(config.bucket.lastIndexOf("-") + 1);
		const resource =
			"qcs::cos:" +
			config.region +
			":uid/" +
			AppId +
			":" +
			config.bucket +
			"/" +
			cosKey;

		const policy = {
			version: "2.0",
			statement: [
				{
					action: config.allowActions,
					effect: "allow",
					resource: [resource],
				},
			],
		};

		const startTime = Math.round(Date.now() / 1000);

		const tempKeys = await new Promise((resolve, reject) => {
			STS.getCredential(
				{
					secretId: config.secretId,
					secretKey: config.secretKey,
					region: config.region,
					durationSeconds: config.durationSeconds,
					policy: policy,
				},
				(err, data) => {
					if (err) {
						reject(err);
					} else {
						data.startTime = startTime;
						resolve(data);
					}
				},
			);
		});

		res.send({
			code: 0,
			message: "success",
			data: {
				...tempKeys,
				bucket: config.bucket,
				region: config.region,
				key: cosKey,
				fileId,
			},
		});
	} catch (err) {
		console.error("sts error", err);
		res
			.status(500)
			.send({ code: 1, message: "获取上传凭证失败", error: err.message });
	} finally {
		if (connection) connection.release();
	}
};

export const confirmCosUpload = async (req, res) => {
	let connection;
	try {
		const { fileId } = req.body;

		if (!fileId) {
			res.status(400).send({ code: 1, message: "请传入文件ID" });
			return;
		}

		connection = await pool.getConnection();
		const [result] = await connection.execute(
			"UPDATE files SET status = 1 WHERE id = ?",
			[fileId],
		);

		res.send({
			code: 0,
			message: "success",
			data: { affectedRows: result.affectedRows },
		});
	} catch (err) {
		console.error("confirm upload error", err);
		res
			.status(500)
			.send({ code: 1, message: "确认上传失败", error: err.message });
	} finally {
		if (connection) connection.release();
	}
};
