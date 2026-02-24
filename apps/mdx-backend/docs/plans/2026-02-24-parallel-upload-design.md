# 并行上传设计方案

**日期**: 2026-02-24
**功能**: 多文件并行上传
**当前状态**: 用户已批准

## 1. 概述

将现有单文件上传扩展为多文件并行上传，与百度网盘用户体验一致。用户可一次选择多个文件，所有文件共享并发池同时上传。

## 2. 数据结构

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

## 3. 核心流程

```
用户选择多个文件
       ↓
添加至 files[]，每个生成 uuid
       ↓
并行遍历 files，对每个文件执行：
  ① 计算文件hash（抽样）
  ② 秒传检查 → 已存在则标记 completed
  ③ 上传分片（共享并发池）
  ④ 合并请求
       ↓
更新各文件 progress / status
```

## 4. 改动详情

### 4.1 lib/file.ts

- 新增 `checkBatchFileExist` 批量秒传检查
- 优化 `uploadFileChunks` 支持传入 AbortController
- 新增全局并发控制 semaphore

### 4.2 useFileUpload.ts

- `selectedFile: File` → `files: UploadFile[]`
- 新增 `handleFilesSelect` 支持多选
- 新增 `uploadAll` 并行上传入口
- 新增 `uploadSingleFile` 单文件上传逻辑
- 新增 `cancelFile` / `retryFile` / `removeFile` 操作

### 4.3 UI 组件

- 支持 `multiple` 文件选择
- 拖拽上传区域
- 文件列表展示（文件名、大小、进度、状态、操作）

## 5. 错误处理

| 场景 | 处理 |
|------|------|
| 秒传成功 | completed, progress=100% |
| 上传失败 | failed, 显示错误, 保留重试 |
| 用户取消 | cancelled |
| 网络中断 | failed, 可重试 |

## 6. 涉及文件

| 文件 | 改动 |
|------|------|
| src/lib/file.ts | 新增/优化 |
| src/views/File/hooks/useFileUpload.ts | 重构 |
| src/views/File/components/UploadPanel.tsx | 新增 |
| src/views/File/index.tsx | 集成 |

## 7. 验收标准

- [ ] 支持一次选择多个文件上传
- [ ] 多文件共享并发池同时上传
- [ ] 各文件独立进度显示
- [ ] 支持秒传功能
- [ ] 支持取消单个/全部上传
- [ ] 支持重试失败文件
