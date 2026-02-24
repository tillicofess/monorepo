# 并行上传功能实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**目标:** 将单文件上传扩展为多文件并行上传，支持一次选择多个文件、共享并发池上传、各文件独立进度显示。

**架构:** 基于现有分片上传逻辑，新增 UploadFile 类型管理多文件状态，使用全局 semaphore 控制并发数。

**技术栈:** React, TypeScript, Ant Design, SparkMD5

---

### Task 1: 定义 UploadFile 类型

**Files:**
- Modify: `src/views/File/hooks/useFileUpload.ts:1-10`

**Step 1: 添加类型定义**

```typescript
export type UploadStatus = 'pending' | 'uploading' | 'completed' | 'failed' | 'cancelled';

export interface UploadFile {
  id: string;
  file: File;
  fileHash?: string;
  progress: number;
  status: UploadStatus;
  error?: string;
  uploadedChunks?: number[];
}
```

**Step 2: Commit**

```bash
git add src/views/File/hooks/useFileUpload.ts
git commit -m "feat: add UploadFile type definitions"
```

---

### Task 2: 修改 useFileUpload 状态管理

**Files:**
- Modify: `src/views/File/hooks/useFileUpload.ts:10-30`

**Step 1: 替换单文件状态为文件数组**

```typescript
// 替换
const [selectedFile, setSelectedFile] = useState<File | null>(null);
// 改为
const [files, setFiles] = useState<UploadFile[]>([]);
const [uploading, setUploading] = useState<boolean>(false);

// 添加 uuid 生成函数
const generateId = () => Math.random().toString(36).substring(2, 15);
```

**Step 2: Commit**

```bash
git add src/views/File/hooks/useFileUpload.ts
git commit -m "feat: refactor state to support multiple files"
```

---

### Task 3: 实现文件选择和文件列表管理

**Files:**
- Modify: `src/views/File/hooks/useFileUpload.ts:30-60`

**Step 1: 添加 handleFilesSelect 支持多选**

```typescript
const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  const fileList = e.target.files;
  if (!fileList) return;
  
  const newFiles: UploadFile[] = Array.from(fileList).map(file => ({
    id: generateId(),
    file,
    progress: 0,
    status: 'pending',
  }));
  
  setFiles(prev => [...prev, ...newFiles]);
  e.target.value = '';
};

const removeFile = (id: string) => {
  setFiles(prev => prev.filter(f => f.id !== id));
};

const clearAllFiles = () => {
  setFiles([]);
};
```

**Step 2: Commit**

```bash
git add src/views/File/hooks/useFileUpload.ts
git commit -m "feat: add multi-file selection and management"
```

---

### Task 4: 添加 lib/file.ts 并发控制优化

**Files:**
- Modify: `src/lib/file.ts:1-10`

**Step 1: 添加全局并发控制 semaphore**

```typescript
const GLOBAL_MAX_CONCURRENT = 6;
let currentConcurrent = 0;

export const semaphore = async () => {
  while (currentConcurrent >= GLOBAL_MAX_CONCURRENT) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  currentConcurrent++;
};

export const release = () => {
  currentConcurrent--;
};
```

**Step 2: Commit**

```bash
git add src/lib/file.ts
git commit -m "feat: add global concurrency control semaphore"
```

---

### Task 5: 添加批量秒传检查 API

**Files:**
- Modify: `src/lib/file.ts:60-80`

**Step 1: 添加批量检查函数**

```typescript
export const checkBatchFileExist = async (
  files: { fileHash: string; fileName: string }[]
) => {
  const res = await http.post('/largeFile/batchCheck', { files });
  return res.data.data;
};
```

**Step 2: Commit**

```bash
git add src/lib/file.ts
git commit -m "feat: add batch file existence check"
```

---

### Task 6: 实现并行上传核心逻辑

**Files:**
- Modify: `src/views/File/hooks/useFileUpload.ts:60-120`

**Step 1: 添加上传函数**

```typescript
const updateFileProgress = (id: string, progress: number, status?: UploadStatus) => {
  setFiles(prev => prev.map(f => 
    f.id === id ? { ...f, progress, status: status || f.status } : f
  ));
};

const uploadSingleFile = async (
  uploadFile: UploadFile,
  shouldUpload: boolean,
  controller: AbortController
) => {
  const { file } = uploadFile;
  
  if (!shouldUpload) {
    updateFileProgress(uploadFile.id, 100, 'completed');
    return;
  }

  updateFileProgress(uploadFile.id, 0, 'uploading');
  
  try {
    await semaphore();
    
    const chunks = createChunks(file);
    const fileHash = await calculateFileHash(chunks);
    
    const { shouldUpload: needUpload, uploadedChunks } = await checkFileExist(
      fileHash, 
      file.name
    );
    
    if (!needUpload) {
      updateFileProgress(uploadFile.id, 100, 'completed');
      release();
      return;
    }

    const uploadChunks = uploadedChunks.length > 0
      ? chunks.filter((_, index) => !uploadedChunks.includes(index))
      : chunks;

    await uploadFileChunks({
      fileHash,
      fileName: file.name,
      fileSize: file.size,
      parentId: currentFolderId,
      uploadChunks,
      abortControllers: { current: [controller] },
      setProgress: (percent) => updateFileProgress(uploadFile.id, percent),
    });

    updateFileProgress(uploadFile.id, 100, 'completed');
  } catch (error: any) {
    if (error?.message === 'Upload aborted') {
      updateFileProgress(uploadFile.id, uploadFile.progress, 'cancelled');
    } else {
      updateFileProgress(uploadFile.id, uploadFile.progress, 'failed');
    }
  } finally {
    release();
  }
};

const uploadAll = async () => {
  if (files.length === 0) {
    message.warning('请先选择文件');
    return;
  }
  
  setUploading(true);
  
  try {
    // 批量计算 hash 和秒传检查
    const fileInfos = await Promise.all(
      files
        .filter(f => f.status !== 'completed')
        .map(async f => {
          const chunks = createChunks(f.file);
          const fileHash = await calculateFileHash(chunks);
          return { ...f, fileHash };
        })
    );
    
    const checkResults = await checkBatchFileExist(
      fileInfos.map(f => ({ fileHash: f.fileHash!, fileName: f.file.name }))
    );
    
    // 并行上传
    const uploadTasks = fileInfos.map((f, index) => {
      const controller = new AbortController();
      return uploadSingleFile(f, checkResults[index].shouldUpload, controller);
    });
    
    await Promise.allSettled(uploadTasks);
  } catch (error) {
    message.error('上传过程出错');
  } finally {
    setUploading(false);
  }
};
```

**Step 2: Commit**

```bash
git add src/views/File/hooks/useFileUpload.ts
git commit -m "feat: implement parallel upload core logic"
```

---

### Task 7: 添加单个文件操作功能

**Files:**
- Modify: `src/views/File/hooks/useFileUpload.ts:120-150`

**Step 1: 添加取消、重试、删除功能**

```typescript
const cancelFile = (id: string) => {
  // 标记为 cancelled，实际取消由 AbortController 处理
  setFiles(prev => prev.map(f => 
    f.id === id ? { ...f, status: 'cancelled' } : f
  ));
};

const retryFile = (id: string) => {
  setFiles(prev => prev.map(f => 
    f.id === id ? { ...f, status: 'pending', progress: 0, error: undefined } : f
  ));
};

const cancelAll = () => {
  abortControllers.current.forEach(c => c.abort());
  setFiles(prev => prev.map(f => 
    f.status === 'uploading' ? { ...f, status: 'cancelled' } : f
  ));
  setUploading(false);
};
```

**Step 2: Commit**

```bash
git add src/views/File/hooks/useFileUpload.ts
git commit -m "feat: add single file operations (cancel/retry)"
```

---

### Task 8: 更新 Hook 返回值

**Files:**
- Modify: `src/views/File/hooks/useFileUpload.ts:150-180`

**Step 1: 更新返回值**

```typescript
return {
  fileInputRef,
  files,
  uploading,
  handleFilesSelect,
  uploadAll,
  cancelAll,
  removeFile,
  retryFile,
  clearAllFiles,
};
```

**Step 2: Commit**

```bash
git add src/views/File/hooks/useFileUpload.ts
git commit -m "feat: update hook return values"
```

---

### Task 9: 创建 UploadPanel UI 组件

**Files:**
- Create: `src/views/File/components/UploadPanel.tsx`

**Step 1: 创建上传面板组件**

```tsx
import React from 'react';
import { Button, Progress, Space, Typography, Empty } from 'antd';
import { 
  DeleteOutlined, 
  CloseCircleOutlined, 
  SyncOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  InboxOutlined
} from '@ant-design/icons';
import { UploadFile } from '../hooks/useFileUpload';

const { Text } = Typography;

interface UploadPanelProps {
  files: UploadFile[];
  uploading: boolean;
  onUpload: () => void;
  onCancel: () => void;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
  onClear: () => void;
}

const formatSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
    case 'failed':
      return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
    case 'uploading':
      return <LoadingOutlined />;
    case 'cancelled':
      return <CloseCircleOutlined style={{ color: '#faad14' }} />;
    default:
      return null;
  }
};

export const UploadPanel: React.FC<UploadPanelProps> = ({
  files,
  uploading,
  onUpload,
  onCancel,
  onRemove,
  onRetry,
  onClear,
}) => {
  const pendingCount = files.filter(f => f.status === 'pending').length;
  const completedCount = files.filter(f => f.status === 'completed').length;

  return (
    <div style={{ padding: '16px', background: '#fff', borderRadius: '8px' }}>
      <Space style={{ marginBottom: '16px' }}>
        <Button 
          type="primary" 
          onClick={onUpload} 
          loading={uploading}
          disabled={pendingCount === 0}
        >
          开始上传
        </Button>
        {uploading && (
          <Button danger onClick={onCancel}>
            取消全部
          </Button>
        )}
        {files.length > 0 && !uploading && (
          <Button onClick={onClear}>
            清空列表
          </Button>
        )}
        <Text type="secondary">
          已完成 {completedCount}/{files.length}
        </Text>
      </Space>

      {files.length === 0 ? (
        <Empty 
          image={<InboxOutlined style={{ fontSize: 48, color: '#ccc' }} />}
          description="请选择要上传的文件"
        />
      ) : (
        <div style={{ maxHeight: '300px', overflow: 'auto' }}>
          {files.map(file => (
            <div 
              key={file.id}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '8px 0',
                borderBottom: '1px solid #f0f0f0'
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text ellipsis style={{ display: 'block' }}>
                  {file.file.name}
                </Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {formatSize(file.file.size)}
                </Text>
              </div>
              
              <div style={{ width: '120px', margin: '0 16px' }}>
                {file.status === 'uploading' && (
                  <Progress percent={file.progress} size="small" />
                )}
              </div>
              
              <div style={{ width: '60px', textAlign: 'center' }}>
                {getStatusIcon(file.status)}
              </div>
              
              <Space style={{ marginLeft: '8px' }}>
                {file.status === 'failed' && (
                  <Button 
                    type="text" 
                    size="small" 
                    icon={<SyncOutlined />}
                    onClick={() => onRetry(file.id)}
                  />
                )}
                {(file.status === 'pending' || file.status === 'failed') && (
                  <Button 
                    type="text" 
                    size="small" 
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => onRemove(file.id)}
                  />
                )}
              </Space>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

**Step 2: Commit**

```bash
git add src/views/File/components/UploadPanel.tsx
git commit -m "feat: create UploadPanel component"
```

---

### Task 10: 在 File 页面集成新上传组件

**Files:**
- Modify: `src/views/File/index.tsx`

**Step 1: 查找并修改 File 页面**

```typescript
// 找到使用 useFileUpload 的位置
import { useFileUpload } from './hooks/useFileUpload';
import { UploadPanel } from './components/UploadPanel';

// 在组件中使用
const { 
  files, 
  uploading, 
  handleFilesSelect, 
  uploadAll,
  cancelAll,
  removeFile,
  retryFile,
  clearAllFiles 
} = useFileUpload({ 
  currentFolderId, 
  onSuccess: refreshFileList 
});

// 修改 input 支持多选
<input
  type="file"
  multiple
  onChange={handleFilesSelect}
  ref={fileInputRef}
  style={{ display: 'none' }}
/>

// 替换原有的上传UI为 UploadPanel
<UploadPanel
  files={files}
  uploading={uploading}
  onUpload={uploadAll}
  onCancel={cancelAll}
  onRemove={removeFile}
  onRetry={retryFile}
  onClear={clearAllFiles}
/>
```

**Step 2: Commit**

```bash
git add src/views/File/index.tsx
git commit -m "feat: integrate UploadPanel into File page"
```

---

### Task 11: 运行类型检查和 lint

**Step 1: 运行检查**

```bash
pnpm typecheck
pnpm lint
```

**Step 2: 修复任何错误**

---

### Task 12: 测试功能

**Step 1: 启动开发服务器**

```bash
pnpm dev
```

**Step 2: 手动测试**
1. 选择多个文件上传
2. 观察进度条
3. 测试秒传功能
4. 测试取消单个/全部
5. 测试失败重试

---

**Plan complete and saved to `docs/plans/2026-02-24-parallel-upload-plan.md`. Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
