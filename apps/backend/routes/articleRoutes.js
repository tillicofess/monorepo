import express from 'express';
// import { checkJwt } from '../middleware/checkJwt.js';
import { checkPermissions } from '../middleware/checkPermissions.js';
const router = express.Router();

import * as articleController from '../controllers/articleController.js';

// get article list
router.get('/list', articleController.getBlogList);
// get article detail
router.get('/detail/:id', articleController.getArticleById);
// get latest 6 articles
router.get('/latest', articleController.getLatestArticles);
// publish article
router.post('/publish', checkPermissions(['admin']), articleController.publishArticle);
// update article
router.put('/update/:id', checkPermissions(['admin']), articleController.updateArticle);
// delete article
router.delete('/delete/:id', checkPermissions(['admin']), articleController.deleteArticle);

export default router;