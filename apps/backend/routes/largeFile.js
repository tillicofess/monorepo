import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { uploadMiddleware } from '../middleware/uploadMiddleware.js';

const router = express.Router();

import * as largeFileController from '../controllers/largeFileController.js';

router.post('/check', largeFileController.checkFile);
router.post('/batchCheck', largeFileController.checkBatchFile);
router.get('/list', largeFileController.getFileList);
router.get('/download/:id', largeFileController.downloadFile);
router.post(
  '/upload',
  authenticate,
  authorize(['editor:upload', 'admin:all']),
  uploadMiddleware,
  largeFileController.uploadChunk,
);
router.post('/merge', authenticate, largeFileController.mergeChunks);
router.post(
  '/createFolder',
  authenticate,
  authorize(['editor:create', 'admin:all']),
  largeFileController.createFolder,
);
router.delete(
  '/delete/:id',
  authenticate,
  authorize(['editor:delete', 'admin:all']),
  largeFileController.deleteFileOrFolder,
);
router.post(
  '/rename',
  authenticate,
  authorize(['editor:update', 'admin:all:all']),
  largeFileController.renameFolderOrFile,
);
router.post(
  '/move',
  authenticate,
  authorize(['editor:update', 'admin:all:all']),
  largeFileController.moveFileOrFolder,
);

export default router;
