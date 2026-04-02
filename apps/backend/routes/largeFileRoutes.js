import express from "express";
import {
	confirmCosUpload,
	getCosDownloadSts,
	getCosSts,
} from "../controllers/cosController.js";
import {
	createFolder,
	deleteFile,
	getFileList,
	moveFileOrFolder,
	renameFile,
} from "../controllers/fileController.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

router.get("/sts/credentials", getCosSts);
router.get("/sts/download/credentials", getCosDownloadSts);
router.post(
	"/sts/confirm",
	authenticate,
	authorize(["editor:upload", "admin:all"]),
	confirmCosUpload,
);

router.get("/list", authenticate, getFileList);
router.post(
	"/createFolder",
	authenticate,
	authorize(["editor:create", "admin:all"]),
	createFolder,
);
router.post(
	"/rename",
	authenticate,
	authorize(["editor:update", "admin:all"]),
	renameFile,
);
router.delete(
	"/delete/:id",
	authenticate,
	authorize(["editor:delete", "admin:all"]),
	deleteFile,
);
router.post(
	"/move",
	authenticate,
	authorize(["editor:update", "admin:all"]),
	moveFileOrFolder,
);

export default router;
