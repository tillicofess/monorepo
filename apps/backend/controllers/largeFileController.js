import fse from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/db.js';

// ----------------------
// 上传文件保存目录
// ----------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.resolve(__dirname, '../uploads');
const TMP_CHUNK_DIR = path.resolve(UPLOAD_DIR, 'tmp');

// 确保目录存在
fse.ensureDirSync(UPLOAD_DIR);
fse.ensureDirSync(TMP_CHUNK_DIR);

// 工具：提取文件后缀
const extractExt = (fileName) => path.extname(fileName);

/**
 * 检查文件是否已存在
 * @param {string} fileHash 文件 hash
 * @param {string} fileName 原始文件名（用于后缀）
 */
export const checkFile = async (req, res, next) => {
  const { fileHash, fileName } = req.body;
  const filePath = path.resolve(UPLOAD_DIR, fileHash + path.extname(fileName));

  // 秒传：文件已存在
  if (fse.existsSync(filePath)) {
    return res.json({ status: true, data: { shouldUpload: false } });
  }

  const chunkDir = path.resolve(TMP_CHUNK_DIR, fileHash);
  let uploadedChunks = [];
  if (fse.existsSync(chunkDir)) {
    const files = await fse.readdir(chunkDir);
    uploadedChunks = files
      .map((file) => parseInt(file.split('-')[1], 10))
      .filter((index) => !isNaN(index))
      .sort((a, b) => a - b);
  }

  res.json({
    status: true,
    data: {
      shouldUpload: true,
      uploadedChunks,
    },
  });
};

/**
 * 批量检查文件是否已存在
 * @param {Array} files - 文件数组 [{ fileHash, fileName }]
 */
export const checkBatchFile = async (req, res, next) => {
  const { files } = req.body;

  if (!Array.isArray(files) || files.length === 0) {
    return res.status(400).json({ status: false, message: '缺少文件列表' });
  }

  const results = files.map(({ fileHash, fileName }) => {
    const filePath = path.resolve(UPLOAD_DIR, fileHash + path.extname(fileName));
    const shouldUpload = !fse.existsSync(filePath);

    let uploadedChunks = [];
    if (shouldUpload) {
      const chunkDir = path.resolve(TMP_CHUNK_DIR, fileHash);
      if (fse.existsSync(chunkDir)) {
        uploadedChunks = fse.readdirSync(chunkDir);
      }
    }

    return {
      fileHash,
      fileName,
      shouldUpload,
      uploadedChunks,
    };
  });

  res.json({
    status: true,
    data: results,
  });
};

/**
 * 上传文件分片接口
 * @param {string} filehash 文件 hash
 * @param {string} chunkhash 分片 hash
 * @param {Buffer} file 分片文件
 */
export const uploadChunk = async (req, res) => {
  try {
    const chunkFile = req.file;
    const { filehash, chunkhash } = req.body;

    if (!filehash || !chunkhash || !chunkFile) {
      return res.status(400).json({
        status: false,
        message: '缺少 filehash / chunkhash 或文件',
      });
    }

    // 创建分片目录 uploads/tmp/<filehash>
    const chunkDir = path.resolve(TMP_CHUNK_DIR, filehash);
    fse.ensureDirSync(chunkDir);

    // 目标路径（例如：uploads/tmp/abc123/abc123-0）
    const chunkPath = path.resolve(chunkDir, chunkhash);

    // 将 multer 的临时文件移动到目标分片目录
    await fse.move(chunkFile.path, chunkPath, { overwrite: true });

    return res.json({ status: true, message: '分片上传成功' });
  } catch (err) {
    console.error('uploadChunk error:', err);
    return res.status(500).json({ status: false, message: '服务器错误' });
  }
};

/**
 * 合并分片接口
 * @param {string} fileHash 文件 hash
 * @param {string} fileName 原始文件名（用于后缀）
 * @param {number} size 分片大小（字节）
 */
export const mergeChunks = async (req, res) => {
  try {
    const { fileHash, fileName, fileSize, parentId } = req.body;

    if (!fileHash || !fileName || !fileSize || fileSize === undefined) {
      return res.status(400).json({ status: false, message: '缺少参数' });
    }

    const completeFilePath = path.resolve(UPLOAD_DIR, `${fileHash}${extractExt(fileName)}`);
    const chunkDir = path.resolve(TMP_CHUNK_DIR, fileHash);

    if (!fse.existsSync(chunkDir)) {
      return res.status(400).json({ status: false, message: '分片目录不存在' });
    }

    // 1. 读取所有分片并按序号排序
    const chunkFiles = await fse.readdir(chunkDir);
    chunkFiles.sort((a, b) => parseInt(a.split('-')[1]) - parseInt(b.split('-')[1]));

    // 2. 流式合并
    for (let i = 0; i < chunkFiles.length; i++) {
      const chunkPath = path.resolve(chunkDir, chunkFiles[i]);

      // 流式读取 + 追加写入
      await new Promise((resolve, reject) => {
        const readStream = fse.createReadStream(chunkPath);
        const writeStream = fse.createWriteStream(completeFilePath, { flags: 'a' }); // a = append

        readStream.pipe(writeStream);

        readStream.on('end', async () => {
          // 分片写入完成后删除（检查文件是否存在，避免并发冲突）
          if (fse.existsSync(chunkPath)) {
            await fse.unlink(chunkPath).catch(() => {});
          }
          resolve();
        });

        readStream.on('error', (err) => reject(err));
        writeStream.on('error', (err) => reject(err));
      });
    }

    // 3. 删除分片目录
    await fse.remove(chunkDir);

    await saveFileMetadata(req, res, { fileHash, fileName, fileSize, parentId, completeFilePath });
  } catch (err) {
    console.error('mergeChunks error:', err);
    res.status(500).json({ status: false, message: '服务器错误' });
  }
};

// 保存文件元数据到数据库
const saveFileMetadata = async (
  req,
  res,
  { fileHash, fileName, fileSize, parentId, completeFilePath },
) => {
  const newFileId = uuidv4();
  const currentTimestamp = new Date();

  let connection;
  try {
    connection = await pool.getConnection();

    const [existingFile] = await connection.query(
      `SELECT id FROM files_metadata WHERE parent_id <=> ? AND name = ? AND is_directory = FALSE`,
      [parentId, fileName],
    );

    if (existingFile.length > 0) {
      // 如果文件已存在，则可能需要更新其信息或者直接返回成功
      // 在这里，我们选择直接返回成功，表示文件已被处理过。
      // 注意：这只是一个简单的处理，实际业务可能需要更复杂的逻辑，例如版本管理、覆盖等
      console.log(`文件 ${fileName} (ID: ${existingFile[0].id}) 已存在于数据库，跳过插入。`);
      return res.json({ status: true, message: '文件已存在，无需重复上传及记录。' });
    }

    const insertQuery = `
            INSERT INTO files_metadata
                (id, name, is_directory, parent_id, size, file_hash, storage_path, created_at, updated_at)
            VALUES
                (?, ?, FALSE, ?, ?, ?, ?, ?, ?);
        `;

    const params = [
      newFileId,
      fileName,
      parentId,
      fileSize,
      fileHash,
      completeFilePath,
      currentTimestamp,
      currentTimestamp,
    ];

    await connection.query(insertQuery, params);

    res.json({ status: true, message: '文件合并成功并已记录元数据。', fileId: newFileId });
  } catch (error) {
    console.error('保存文件元数据到数据库失败:', error);
    // 如果是数据库操作失败，需要回滚之前的物理文件操作（可选，复杂）
    // 或者至少删除已合并的文件，以免留下脏数据
    if (fse.existsSync(completeFilePath)) {
      await fse.remove(completeFilePath);
      console.log(`由于数据库写入失败，已删除物理文件: ${completeFilePath}`);
    }
    throw error; // 抛出错误，让上层 mergeChunks catch
  } finally {
    if (connection) connection.release();
  }
};

/**
 *
 * @param {string | null} parentId 父目录ID，null表示根目录
 */
export const getFileList = async (req, res) => {
  let connection;
  try {
    const parentId = req.query.parentId || null;

    connection = await pool.getConnection();

    // 2. 构建 SQL 查询
    // 查询当前用户的文件元数据，is_directory = FALSE 表示只查文件
    // 假设您只查询根目录下的文件 (parentId IS NULL)，如果需要查询特定目录，请根据 parentId 进行过滤
    const query = `
            SELECT
                id,
                name,
                is_directory AS isDir,
                size,
                created_at AS uploadTime
            FROM
                files_metadata
            WHERE
                parent_id <=> ?
            ORDER BY
                is_directory DESC, name ASC; -- 文件夹优先，然后按名称排序
        `;

    // 3. 执行查询
    const [rows] = await connection.query(query, [parentId]);

    // 4. 格式化数据并返回
    const files = rows.map((row) => ({
      id: row.id,
      name: row.name,
      size: row.size,
      uploadTime: row.uploadTime,
      isDir: row.isDir,
    }));

    res.json({
      status: true,
      data: files,
    });
  } catch (err) {
    console.error('getFileList error (Database):', err);
    // 如果是数据库错误，应返回 500
    res.status(500).json({ status: false, message: '查询文件列表失败' });
  } finally {
    if (connection) connection.release();
  }
};

/**
 * @description 创建文件夹
 * @param {string} name 文件夹名称
 * @param {string | null} parentId 父目录ID，null表示根目录
 */
export const createFolder = async (req, res) => {
  const { name, parentId } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ code: 1, message: 'Folder name cannot be empty.' });
  }

  // 安全检查：如果 parentId 不是 null，则检查父目录是否存在且为目录
  if (parentId !== null) {
    let parentFolderConnection;
    try {
      parentFolderConnection = await pool.getConnection();
      const [parentRows] = await parentFolderConnection.query(
        `SELECT id, is_directory FROM files_metadata WHERE id = ? AND is_directory = TRUE`,
        [parentId],
      );
      if (parentRows.length === 0) {
        return res
          .status(404)
          .json({ code: 1, message: 'Parent folder not found or not a directory.' });
      }
    } catch (error) {
      console.error('Error checking parent folder:', error);
      return res.status(500).json({ code: 1, message: 'Failed to check parent folder.' });
    } finally {
      if (parentFolderConnection) parentFolderConnection.release();
    }
  }

  let connection;
  try {
    connection = await pool.getConnection();
    const newFolderId = uuidv4(); // 生成新的 UUID
    const currentTimestamp = new Date();
    const insertQuery = `
            INSERT INTO files_metadata
                (id, name, is_directory, parent_id, size, created_at, updated_at)
            VALUES
                (?, ?, TRUE, ?, 0, ?, ?);
        `;
    const params = [newFolderId, name.trim(), parentId, currentTimestamp, currentTimestamp];

    await connection.query(insertQuery, params);

    res.status(201).json({
      code: 0,
      message: 'Folder created successfully.',
      data: {
        id: newFolderId,
        name: name.trim(),
        isDir: true,
        size: 0,
        uploadTime: currentTimestamp.toISOString(), // 返回 ISO 格式给前端
      },
    });
  } catch (error) {
    console.error('Error creating folder:', error);
    // 考虑更细致的错误处理，例如名称重复 (通过唯一索引可以防止)
    if (error.code === 'ER_DUP_ENTRY') {
      // MySQL 唯一约束冲突错误码
      return res.status(409).json({
        code: 1,
        message: 'A folder with this name already exists in the current directory.',
      });
    }
    res.status(500).json({ code: 1, message: 'Failed to create folder.' });
  } finally {
    if (connection) connection.release();
  }
};

/**
 * @description 重命名文件或文件夹
 * @param {string} id - 文件或文件夹的ID
 * @param {string} name - 新的名称
 */
export const renameFolderOrFile = async (req, res) => {
  const { id, name } = req.body;
  if (!id || !name || name.trim() === '') {
    return res.status(400).json({ code: 1, message: 'ID and new name are required.' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    const updateQuery = `
            UPDATE files_metadata
            SET name = ?, updated_at = ?
            WHERE id = ?
        `;
    const params = [name.trim(), new Date(), id];

    const [result] = await connection.query(updateQuery, params);
    if (result.affectedRows === 0) {
      return res.status(404).json({ code: 1, message: 'File or folder not found.' });
    }

    res.status(200).json({
      code: 0,
      message: 'File or folder renamed successfully.',
      data: null,
    });
  } catch (error) {
    console.error('Error renaming folder or file:', error);
    res.status(500).json({ code: 1, message: 'Failed to rename folder or file.' });
  } finally {
    if (connection) connection.release();
  }
};

/**
 * @description 删除文件或文件夹
 * @param {string} id - 文件或文件夹的ID
 */
export const deleteFileOrFolder = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ code: 1, message: 'ID is required.' });
  }
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction(); // 开启事务

    const [targetRows] = await connection.query(
      `SELECT id, name, is_directory, storage_path FROM files_metadata WHERE id = ?`,
      [id],
    );

    if (targetRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ code: 1, message: 'File or folder not found.' });
    }

    const targetItem = targetRows[0];

    const itemsToDelete = []; // { id, is_directory, storage_path }

    async function collectItemsToDelete(currentId) {
      const [children] = await connection.query(
        `SELECT id, is_directory, storage_path FROM files_metadata WHERE parent_id <=> ?`,
        [currentId],
      );
      for (const child of children) {
        if (child.is_directory) {
          await collectItemsToDelete(child.id); // 递归
        }
        itemsToDelete.push(child);
      }
    }

    itemsToDelete.push({
      id: targetItem.id,
      is_directory: targetItem.is_directory,
      storage_path: targetItem.storage_path,
    });

    // 如果是文件夹，则递归收集其所有子项
    if (targetItem.is_directory) {
      await collectItemsToDelete(targetItem.id);
    }

    for (const item of itemsToDelete) {
      if (!item.is_directory && item.storage_path) {
        // 确保是文件且有物理路径
        try {
          if (fse.existsSync(item.storage_path)) {
            await fse.remove(item.storage_path);
            console.log(`Deleted physical file: ${item.storage_path}`);
          }
        } catch (fileErr) {
          // 物理文件删除失败，只记录日志，不回滚数据库事务
          console.error(
            `Error deleting physical file ${item.storage_path}. Database transaction will proceed:`,
            fileErr,
          );
          // 在生产环境中，这里可能需要发送报警通知
        }
      }
    }
    // 4. 从数据库中删除所有相关元数据
    const idsToDelete = itemsToDelete.map((item) => item.id);
    if (idsToDelete.length > 0) {
      const deleteMetadataQuery = `DELETE FROM files_metadata WHERE id IN (?)`;
      await connection.query(deleteMetadataQuery, [idsToDelete]);
      console.log(`Deleted database metadata for IDs: ${idsToDelete.join(', ')}`);
    }
    await connection.commit();
    res.json({ code: 0, message: 'File(s) and folder(s) deleted successfully.' });
  } catch (error) {
    console.error('Error deleting file or folder:', error);
    await connection.rollback(); // 回滚事务
    // 如果物理文件删除成功但数据库失败，这里需要日志记录或报警
    res.status(500).json({
      code: 1,
      message: 'Failed to delete file(s) or folder(s). Transaction rolled back.',
    });
  } finally {
    if (connection) connection.release();
  }
};

/**
 * @description 移动文件或文件夹
 * @param {string} draggedId - 被移动的文件或文件夹的ID
 * @param {string} newParentId - 新的父目录ID，若移动到根目录则为 'null'
 */
export const moveFileOrFolder = async (req, res) => {
  const { draggedId, newParentId } = req.body;

  if (!draggedId || !newParentId) {
    return res.status(400).json({ code: 1, message: 'draggedId and newParentId are required.' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1) 检查被移动的条目是否存在
    const [draggedRows] = await connection.query(
      `SELECT id, is_directory, parent_id FROM files_metadata WHERE id = ?`,
      [draggedId],
    );
    if (draggedRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ code: 1, message: 'Dragged item not found.' });
    }
    const draggedItem = draggedRows[0];

    // 2) 处理 newParentId，标准化为 null 或实际 ID
    const normalizedParentId = newParentId === 'null' ? null : newParentId;

    // 3) 如果目标不是根目录，检查目标目录
    if (normalizedParentId !== null) {
      // 3.1) 检查目标目录是否存在
      const [targetRows] = await connection.query(
        `SELECT id, is_directory, parent_id FROM files_metadata WHERE id = ?`,
        [normalizedParentId],
      );
      if (targetRows.length === 0) {
        await connection.rollback();
        return res.status(400).json({ code: 1, message: 'Target folder not found.' });
      }
      const target = targetRows[0];

      if (!target.is_directory) {
        await connection.rollback();
        return res.status(400).json({ code: 1, message: 'Target is not a directory.' });
      }

      // 3.2) 不能把自己移动到自己
      if (String(draggedId) === String(normalizedParentId)) {
        await connection.rollback();
        return res.status(400).json({ code: 1, message: 'Cannot move item into itself.' });
      }

      // 3.3) 检查循环引用：不能将目录移动到其子目录下
      if (draggedItem.is_directory) {
        // 检查目标是否是被移动目录的子目录
        const [childCheckRows] = await connection.query(
          `WITH RECURSIVE cte AS (
                        SELECT id FROM files_metadata WHERE id = ?
                        UNION ALL
                        SELECT fm.id FROM files_metadata fm
                        JOIN cte ON fm.parent_id = cte.id
                    ) SELECT id FROM cte WHERE id = ?`,
          [draggedId, normalizedParentId],
        );

        if (childCheckRows.length > 0) {
          await connection.rollback();
          return res.status(400).json({
            code: 1,
            message:
              'Cannot create circular reference by moving directory into its own subdirectory.',
          });
        }
      }
    }

    // 4) 执行更新 parent_id（支持移动到根目录）
    await connection.query(`UPDATE files_metadata SET parent_id = ? WHERE id = ?`, [
      normalizedParentId,
      draggedId,
    ]);

    await connection.commit();
    return res.json({ code: 0, message: 'Move successful.' });
  } catch (error) {
    console.error('Error moving file/folder:', error);
    if (connection) {
      try {
        await connection.rollback();
      } catch (e) {
        console.error('Rollback error', e);
      }
    }
    return res
      .status(500)
      .json({ code: 1, message: 'Move failed due to server error.', details: error.message });
  } finally {
    if (connection) connection.release();
  }
};

/**
 * @description 下载文件
 * @param {string} id - 文件ID
 */
export const downloadFile = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ status: false, message: '缺少文件ID' });
  }

  let connection;
  try {
    connection = await pool.getConnection();

    // 1. 查询文件元数据
    const [fileRows] = await connection.query(
      `SELECT id, name, size, storage_path FROM files_metadata 
             WHERE id = ? AND is_directory = FALSE`,
      [id],
    );

    if (fileRows.length === 0) {
      return res.status(404).json({ status: false, message: '文件不存在或无权限访问' });
    }

    const file = fileRows[0];
    const filePath = file.storage_path;

    if (!fse.existsSync(filePath)) {
      return res.status(404).json({ status: false, message: '文件不存在' });
    }

    // 3. 获取文件状态信息
    const fileStat = await fse.stat(filePath);
    const fileSize = fileStat.size;

    // --- 核心修复开始 ---

    // 生成 ETag (通常由 文件大小 + 最后修改时间 组成即可满足大部分需求)
    // 也可以计算文件哈希，但对于大文件会消耗性能，stat 足够了
    const lastModified = fileStat.mtime.toUTCString();
    const etag = `W/"${fileSize}-${fileStat.mtime.getTime()}"`;

    // 设置通用响应头 (无论是否 Range 请求都需要)
    res.setHeader('Accept-Ranges', 'bytes'); // <--- 关键：告诉浏览器我支持续传
    res.setHeader('Last-Modified', lastModified); // <--- 关键：告诉浏览器文件最后修改时间
    res.setHeader('ETag', etag); // <--- 关键：文件的唯一指纹
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.name)}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    // --- 核心修复结束 ---

    // 4. 处理 Range 请求
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      if (chunkSize <= 0 || start >= fileSize) {
        return res.status(416).send('Requested range not satisfiable');
      }

      // 检查 If-Range (可选增强)：如果文件变了，需要重新下载全部
      // 大部分浏览器发现 ETag 变了会自动处理，这里可以从简

      res.status(206); // 使用 status 方法更清晰
      res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
      res.setHeader('Content-Length', chunkSize);

      // 流式传输文件片段
      const fileStream = fse.createReadStream(filePath, { start, end });
      fileStream.pipe(res);
    } else {
      // 5. 完整文件下载
      res.status(200);
      res.setHeader('Content-Length', fileSize);

      // 流式传输完整文件
      const fileStream = fse.createReadStream(filePath);
      fileStream.pipe(res);
    }
  } catch (error) {
    console.error('Error downloading file:', error);
    // 如果 header 已经发出了，就不能再发 status 500 了，这里简单处理
    if (!res.headersSent) {
      res.status(500).json({ status: false, message: '文件下载失败' });
    }
  } finally {
    if (connection) connection.release();
  }
};
