import express from 'express';
// import { checkJwt } from '../middleware/checkJwt.js';
const router = express.Router();

import * as errorLogController from '../controllers/errorLogController.js';

router.post('/create', errorLogController.createLog);
router.get('/all', errorLogController.getAllLogs);
router.get('/appNames', errorLogController.getAppNames);
router.get('/urls/:appName', errorLogController.getUrlsByApp);
router.get('/pagePerformance', errorLogController.getPagePerformance);
router.get('/waterfall', errorLogController.getWaterfallByAppAndUrl);



export default router;
