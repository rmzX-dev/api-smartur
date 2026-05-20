import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import upload from '../middleware/multer.js';
import UserContentController from '../controllers/userContentController.js';

const router = express.Router();

/** Multer fusiona campos en req.body; si viene undefined (p. ej. solo multipart), hay que inicializar. */
function ensureMultipartBody(req, res, next) {
    if (req.body == null || typeof req.body !== 'object' || Array.isArray(req.body)) {
        req.body = {};
    }
    next();
}

router.get('/me/favorites', verifyToken, UserContentController.getFavorites);
router.post('/me/favorites', verifyToken, UserContentController.postFavorite);
router.delete('/me/favorites/:kind/:placeId', verifyToken, UserContentController.deleteFavorite);

router.get('/me/visits', verifyToken, UserContentController.getVisits);
router.post('/me/visits', verifyToken, UserContentController.postVisit);

router.get('/community/posts', UserContentController.getCommunityPosts);
router.post(
    '/community/posts',
    verifyToken,
    ensureMultipartBody,
    upload.single('photo'),
    UserContentController.postCommunityPost,
);
router.delete('/community/posts/:postId', verifyToken, UserContentController.deleteCommunityPost);
router.delete('/community/posts/:postId/admin', verifyToken, UserContentController.adminDeleteCommunityPost);

export default router;
