import SparkMD5 from 'spark-md5';
import { http } from '@/lib/axios';
import { globalRequestPool } from '@/lib/requestPool';
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB 每个分片的大小
/**
 * 创建文件分片 done
 * @param file 大文件
 * @returns 分片数组
 */
export const createChunks = (file: File) => {
  const chunks = [];
  for (let i = 0; i < file.size; i += CHUNK_SIZE) {
    const blob = file.slice(i, i + CHUNK_SIZE);
    chunks.push(blob);
  }
  return chunks;
};

/**
 * 大文件抽样计算文件哈希 done
 * @param chunks 文件分片数组
 * @returns 文件哈希
 */
export const calculateFileHash = async (chunks: Blob[]) => {
  return new Promise<string>((resolve) => {
    const result: Blob[] = []; //抽样分片
    const spark = new SparkMD5.ArrayBuffer();
    const fileReader = new FileReader();

    // 抽样分片：第一个分片、最后一个分片、中间分片的前、中、后各2个字节
    chunks.forEach((chunk, index) => {
      if (index === 0 || index === chunks.length - 1) {
        result.push(chunk);
      } else {
        result.push(chunk.slice(0, 2));
        result.push(chunk.slice(CHUNK_SIZE / 2, CHUNK_SIZE / 2 + 2));
        result.push(chunk.slice(CHUNK_SIZE - 2, CHUNK_SIZE));
      }
    });

    fileReader.readAsArrayBuffer(new Blob(result));
    fileReader.onload = (e) => {
      if (e.target) {
        spark.append(e.target.result as ArrayBuffer);
        resolve(spark.end());
      }
    };
  });
};

/**
 * 秒传检查 done
 * @param fileHash 文件哈希
 * @returns 秒传检查结果
 */
export const checkFileExist = async (fileHash: string, fileName: string) => {
  const res = await http.post(
    '/largeFile/check',
    {
      fileHash,
      fileName,
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
  return res.data.data;
};

/**
 * 大文件分片上传 done
 */
export const uploadFileChunks = async (
  uploadChunks: {
    fileHash: string;
    chunkHash: string;
    chunk: Blob;
    size: number;
  }[],
  onProgress: (uploaded: number) => void,
  signal: AbortSignal,
) => {
  let uploadedBytes = 0;

  const tasks = uploadChunks.map((item) => {
    return globalRequestPool.add(async () => {
      if (signal.aborted) {
        throw new Error('Upload aborted');
      }

      const formData = new FormData();
      formData.append('filehash', item.fileHash);
      formData.append('chunkhash', item.chunkHash);
      formData.append('chunk', item.chunk);

      await http.post('/largeFile/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        signal,
      });

      uploadedBytes += item.size;
      onProgress(uploadedBytes);
    });
  });

  return Promise.all(tasks);
};

/**
 * 合并文件分片
 */
export const mergeRequest = async (
  fileHash: string,
  fileName: string,
  fileSize: number,
  parentId: string | null,
) => {
  const res = await http.post(
    '/largeFile/merge',
    {
      fileHash,
      fileName,
      fileSize,
      parentId,
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
  return res.data.data;
};
