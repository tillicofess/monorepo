import { randomUUID } from "crypto";
import pool from "../config/db.js";

export const getFileList = async (req, res) => {
	let connection;
	try {
		const { parentId } = req.query;
		const targetParentId = parentId === "null" || !parentId ? null : parentId;

		connection = await pool.getConnection();
		const [rows] = await connection.execute(
			`SELECT id, name, is_directory AS isDirectory, parent_id AS parentId,
			        cos_key AS cosKey, file_hash AS fileHash, status, size,
			        file_type AS fileType, created_at AS createdAt, updated_at AS updatedAt
			 FROM files
			 WHERE parent_id ${targetParentId === null ? "IS NULL" : "= ?"} AND status = 1`,
			targetParentId === null ? [] : [targetParentId],
		);

		const files = rows.map((row) => ({
			id: row.id,
			name: row.name,
			isDir: row.isDirectory === 1,
			size: row.size,
			cosKey: row.cosKey,
			fileHash: row.fileHash,
			fileType: row.fileType,
			parentId: row.parentId,
			uploadTime: row.createdAt,
			createdAt: row.createdAt,
			updatedAt: row.updatedAt,
		}));

		res.send({
			code: 0,
			message: "success",
			data: files,
		});
	} catch (err) {
		console.error("getFileList error", err);
		res
			.status(500)
			.send({ code: 1, message: "获取文件列表失败", error: err.message });
	} finally {
		if (connection) connection.release();
	}
};

export const createFolder = async (req, res) => {
	let connection;
	try {
		const { parentId, name } = req.body;

		if (!name) {
			res.status(400).send({ code: 1, message: "请传入文件夹名称" });
			return;
		}

		connection = await pool.getConnection();
		const folderId = randomUUID();

		await connection.execute(
			`INSERT INTO files (id, name, is_directory, parent_id, status, size, file_type)
			 VALUES (?, ?, 1, ?, 1, 0, NULL)`,
			[folderId, name, parentId || null],
		);

		const [rows] = await connection.execute(
			"SELECT id, name, is_directory, parent_id, created_at FROM files WHERE id = ?",
			[folderId],
		);

		const folder = rows[0];

		res.send({
			code: 0,
			message: "success",
			data: {
				id: folder.id,
				name: folder.name,
				isDir: true,
				parentId: folder.parent_id,
				createdAt: folder.created_at,
			},
		});
	} catch (err) {
		console.error("createFolder error", err);
		res
			.status(500)
			.send({ code: 1, message: "创建文件夹失败", error: err.message });
	} finally {
		if (connection) connection.release();
	}
};

export const renameFile = async (req, res) => {
	let connection;
	try {
		const { id, name } = req.body;

		if (!id || !name) {
			res.status(400).send({ code: 1, message: "请传入文件ID和新名称" });
			return;
		}

		connection = await pool.getConnection();

		const [rows] = await connection.execute(
			"SELECT name FROM files WHERE id = ?",
			[id],
		);

		if (rows.length === 0) {
			res.status(404).send({ code: 1, message: "文件不存在" });
			return;
		}

		await connection.execute("UPDATE files SET name = ? WHERE id = ?", [
			name,
			id,
		]);

		res.send({
			code: 0,
			message: "success",
			data: { id, name },
		});
	} catch (err) {
		console.error("renameFile error", err);
		res
			.status(500)
			.send({ code: 1, message: "重命名失败", error: err.message });
	} finally {
		if (connection) connection.release();
	}
};

export const deleteFile = async (req, res) => {
	let connection;
	try {
		const { id } = req.params;

		if (!id) {
			res.status(400).send({ code: 1, message: "请传入文件ID" });
			return;
		}

		connection = await pool.getConnection();

		const [rows] = await connection.execute(
			"SELECT is_directory FROM files WHERE id = ?",
			[id],
		);

		if (rows.length === 0) {
			res.status(404).send({ code: 1, message: "文件不存在" });
			return;
		}

		const markAsDeleted = async (targetId) => {
			const [itemRows] = await connection.execute(
				"SELECT is_directory FROM files WHERE id = ?",
				[targetId],
			);

			if (itemRows.length === 0) return;

			const item = itemRows[0];

			if (item.is_directory === 1) {
				const [children] = await connection.execute(
					"SELECT id FROM files WHERE parent_id = ?",
					[targetId],
				);

				for (const child of children) {
					await markAsDeleted(child.id);
				}
			}

			await connection.execute("UPDATE files SET status = 2 WHERE id = ?", [
				targetId,
			]);
		};

		await markAsDeleted(id);

		res.send({
			code: 0,
			message: "success",
		});
	} catch (err) {
		console.error("deleteFile error", err);
		res.status(500).send({ code: 1, message: "删除失败", error: err.message });
	} finally {
		if (connection) connection.release();
	}
};

export const moveFileOrFolder = async (req, res) => {
	let connection;
	try {
		const { draggedId, newParentId } = req.body;

		if (!draggedId) {
			res.status(400).send({ code: 1, message: "请传入被移动的ID" });
			return;
		}

		connection = await pool.getConnection();

		if (newParentId !== null) {
			const [parentRows] = await connection.execute(
				"SELECT is_directory FROM files WHERE id = ?",
				[newParentId],
			);

			if (parentRows.length === 0) {
				res.status(404).send({ code: 1, message: "目标文件夹不存在" });
				return;
			}

			const parent = parentRows[0];
			if (parent.is_directory !== 1) {
				res.status(400).send({ code: 1, message: "目标不是文件夹" });
				return;
			}
		}

		await connection.execute("UPDATE files SET parent_id = ? WHERE id = ?", [
			newParentId,
			draggedId,
		]);

		res.send({
			code: 0,
			message: "success",
		});
	} catch (err) {
		console.error("moveFileOrFolder error", err);
		res
			.status(500)
			.send({ code: 1, message: "移动文件或文件夹失败", error: err.message });
	} finally {
		if (connection) connection.release();
	}
};
