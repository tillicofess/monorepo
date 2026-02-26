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
  uploadChunks: { fileHash: string, chunkHash: string, chunk: Blob; size: number }[],
  onProgress: (uploaded: number) => void,
  signal: AbortSignal,
) => {

  // 添加到formdata中
  const formData = uploadChunks.map((item) => {
    const formData = new FormData();
    formData.append('filehash', item.fileHash);
    formData.append('chunkhash', item.chunkHash);
    formData.append('chunk', item.chunk);
    return { formData, size: item.size };
  });

  return concurRequset(formData, MAX_CONCURRENT, onProgress, signal);
};

const concurRequset = async (
  formdata: { formData: FormData; size: number }[],
  maxNum: number,
  onProgress: (uploaded: number) => void,
  signal: AbortSignal,
): Promise<number> => {
  return new Promise((resolve, reject) => {
    let uploadedBytes = 0;
    let index = 0;
    let finishedCount = 0;
    let isAborted = false;
    let isResolved = false;

    const totalChunks = formdata.length;

    const cleanup = () => {
      signal.removeEventListener('abort', handleAbort);
    };

    const handleAbort = () => {
      isAborted = true;
      cleanup();
      reject(new Error('Upload aborted'));
    };

    signal.addEventListener('abort', handleAbort);

    async function request() {
      if (isAborted) return;

      const currentIndex = index++;
      if (currentIndex >= totalChunks) return;

      const item = formdata[currentIndex];
      if (!item) return;

      try {
        await http.post('/largeFile/upload', item.formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          signal,
        });

        // ✅ 成功后才增加真实字节
        uploadedBytes += item.size;

        onProgress(uploadedBytes);

        finishedCount++;

        // 所有分片完成
        if (finishedCount === totalChunks && !isResolved) {
          isResolved = true;
          cleanup();
          resolve(uploadedBytes);
          return;
        }

        // 继续调度下一个
        request();

      } catch (err) {
        if (!isAborted && !isResolved) {
          isResolved = true;
          cleanup();
          reject(err);
        }
      }
    }

    // 启动并发
    const workerCount = Math.min(maxNum, totalChunks);
    for (let i = 0; i < workerCount; i++) {
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
