import { http } from '@/lib/axios';

/**
 * 获取文件列表
 * @param parentId 父文件夹ID
 * @returns 文件列表
 */
export const getFileList = (parentId: string | null) => {
  return http.get('/largeFile/list', {
    params: {
      parentId,
    },
  });
};

/**
 * 创建文件夹
 * @param parentId 父文件夹ID
 * @param name 文件夹名称
 * @returns 创建结果
 */
export const createFolder = (parentId: string | null, name: string) => {
  return http.post(
    '/largeFile/createFolder',
    {
      parentId,
      name,
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
};

/**
 * 重命名文件
 * @param id 文件ID
 * @param name 新文件名
 * @returns 重命名结果
 */
export const renameFile = (id: string, name: string) => {
  return http.post(
    '/largeFile/rename',
    {
      id,
      name,
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
};

/**
 * 删除文件
 * @param id 文件ID
 * @returns 删除结果
 */
export const deleteFile = (id: string) => {
  return http.delete(`/largeFile/delete/${id}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

/**
 * 移动文件或文件夹
 * @param id 文件或文件夹ID
 * @param newParentId 新父文件夹ID
 * @returns 移动结果
 */
export const moveFileOrFolder = (draggedId: string, newParentId: string | null) => {
  return http.post(
    '/largeFile/move',
    {
      draggedId,
      newParentId,
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
};

/**
 * 下载文件
 * @param id 文件ID
 * @returns 下载结果
 */
export const downloadFile = (id: string) => {
  const a = document.createElement('a');
  a.href = `https://api.ticscreek.top/largeFile/download/${id}`;
  a.download = id;
  a.click();
};
