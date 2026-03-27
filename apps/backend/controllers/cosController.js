import COS from "cos-nodejs-sdk-v5";
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
		"name/cos:DeleteObject",
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

const createCosClient = () => {
	return new COS({
		SecretId: config.secretId,
		SecretKey: config.secretKey,
	});
};

const getCosKeyRefCount = async (connection, cosKey) => {
	const [rows] = await connection.execute(
		"SELECT COUNT(*) as count FROM files WHERE cos_key = ? AND status != 2",
		[cosKey],
	);
	return rows[0].count;
};

const lazyDeleteFile = async (connection, fileId) => {
	const [rows] = await connection.execute(
		"SELECT cos_key FROM files WHERE id = ?",
		[fileId],
	);

	if (rows.length === 0) return { deleted: false, cosKeyDeleted: false };

	const file = rows[0];
	const cosKey = file.cos_key;

	const refCount = await getCosKeyRefCount(connection, cosKey);

	const [deleteResult] = await connection.execute(
		"UPDATE files SET status = 2 WHERE id = ?",
		[fileId],
	);

	if (deleteResult.affectedRows === 0) {
		return { deleted: false, cosKeyDeleted: false };
	}

	let cosKeyDeleted = false;
	if (refCount <= 1) {
		const cos = createCosClient();
		await new Promise((resolve, reject) => {
			cos.deleteObject(
				{
					Bucket: config.bucket,
					Region: config.region,
					Key: cosKey,
				},
				(err) => {
					if (err) {
						console.error(`[COS Delete Failed] Key: ${cosKey}`, err);
						reject(err);
					} else {
						console.log(`[COS Delete Success] Key: ${cosKey}`);
						resolve();
					}
				},
			);
		});
		cosKeyDeleted = true;
	}

	return { deleted: true, cosKeyDeleted };
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
		const targetParentId = parentId === "null" || !parentId ? null : parentId;

		connection = await pool.getConnection();

		const [existingRows] = await connection.execute(
			`SELECT id, file_hash, cos_key FROM files 
			 WHERE name = ? AND parent_id ${targetParentId === null ? "IS NULL" : "= ?"} AND is_directory = 0 AND status != 2`,
			targetParentId === null ? [filename] : [filename, targetParentId],
		);

		if (existingRows.length > 0) {
			const existing = existingRows[0];

			if (req.query.overwrite !== "true") {
				const [rows] = await connection.execute(
					"SELECT id, name, cos_key, file_hash, size, file_type, created_at FROM files WHERE id = ?",
					[existing.id],
				);
				const existingFile = rows[0];

				res.send({
					code: 3,
					message: "同名文件已存在，是否覆盖？",
					data: {
						conflict: true,
						isSameHash: existing.file_hash === fileHash,
						existingFile: {
							id: existingFile.id,
							name: existingFile.name,
							cosKey: existingFile.cos_key,
							fileHash: existingFile.file_hash,
							size: existingFile.size,
							fileType: existingFile.file_type,
							createdAt: existingFile.created_at,
						},
					},
				});
				return;
			}

			const { deleted, cosKeyDeleted } = await lazyDeleteFile(
				connection,
				existing.id,
			);
			console.log(
				`[Lazy Delete] fileId: ${existing.id}, deleted: ${deleted}, cosKeyDeleted: ${cosKeyDeleted}`,
			);
		}

		await connection.execute(
			`INSERT INTO files (id, name, is_directory, parent_id, cos_key, file_hash, status, size, file_type)
			 VALUES (?, ?, 0, ?, ?, ?, 0, ?, ?)`,
			[fileId, filename, targetParentId, cosKey, fileHash, size, fileType],
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
