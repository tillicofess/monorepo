import SparkMD5 from 'spark-md5';
import { http } from '@/lib/axios';

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB 每个分片的大小
const MAX_CONCURRENT = 6; // 并发上传最大并发数
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
  fileHash: string,
  uploadChunks: { chunk: Blob; size: number }[],
  fileSize: number,
  onProgress: (uploaded: number, total: number) => void,
  signal: AbortSignal,
) => {
  // 创建实际上传分片对象
  const chunkInfoList = uploadChunks.map((item, index) => ({
    fileHash,
    chunkHash: `${fileHash}-${index}`,
    chunk: item.chunk,
    size: item.size,
  }));

  // 添加到formdata中
  const formData = chunkInfoList.map((item) => {
    const formData = new FormData();
    formData.append('filehash', item.fileHash);
    formData.append('chunkhash', item.chunkHash);
    formData.append('chunk', item.chunk);
    return { formData, size: item.size };
  });

  return concurRequset(formData, MAX_CONCURRENT, fileSize, onProgress, signal);
};

const concurRequset = async (
  formdata: { formData: FormData; size: number }[],
  maxNum: number,
  fileSize: number,
  onProgress: (uploaded: number, total: number) => void,
  signal: AbortSignal,
) => {
  return new Promise<number>((resolve, reject) => {
    // 已上传字节数
    let uploadedBytes = 0;
    // 下一个请求索引
    let index = 0;
    // 是否已取消
    let isAborted = false;

    // 监听取消信号
    signal.addEventListener('abort', () => {
      isAborted = true;
      reject(new Error('Upload aborted'));
    });

    // 发送请求
    async function request() {
      if (index >= formdata.length || isAborted) return;
      const idx = index++;
      const item = formdata[idx];
      if (!item) return;

      const options: Record<string, unknown> = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent: { loaded?: number }) => {
          uploadedBytes += progressEvent.loaded || 0;
          onProgress(uploadedBytes, fileSize);
        },
        signal,
      };

      try {
        await http.post('/largeFile/upload', item.formData, options);
      } catch (err) {
        if (!isAborted) {
          console.error(err);
        }
      } finally {
        if (!isAborted) {
          if (index >= formdata.length && uploadedBytes < fileSize) {
            uploadedBytes = fileSize;
            onProgress(uploadedBytes, fileSize);
          }

          if (index >= formdata.length) {
            resolve(uploadedBytes);
          } else {
            request();
          }
        }
      }
    }

    // 启动请求
    for (let i = 0; i < maxNum; i++) {
      request();
    }
  });
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
