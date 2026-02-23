import express from 'express';
import { uploadMiddleware } from "../middleware/uploadMiddleware.js";
// import { checkJwt } from '../middleware/checkJwt.js';
import { checkPermissions } from '../middleware/checkPermissions.js';
const router = express.Router();

import * as largeFileController from '../controllers/largeFileController.js';

router.post('/check', largeFileController.checkFile);
router.get("/list", largeFileController.getFileList);
router.get("/download/:id", largeFileController.downloadFile);
router.post("/upload",  checkPermissions(['admin']), uploadMiddleware, largeFileController.uploadChunk);
router.post("/merge",  checkPermissions(['admin']), largeFileController.mergeChunks);
router.post("/createFolder",  checkPermissions(['admin']), largeFileController.createFolder);
router.delete("/delete/:id",  checkPermissions(['admin']), largeFileController.deleteFileOrFolder);
router.post("/rename",  checkPermissions(['admin']), largeFileController.renameFolderOrFile);
router.post("/move",  checkPermissions(['admin']), largeFileController.moveFileOrFolder);


export default router;
