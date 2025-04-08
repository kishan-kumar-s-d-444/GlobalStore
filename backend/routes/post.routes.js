import express from 'express';
import { createPost,getPostsByRoom,likePost,addComment,getAllPosts } from '../controllers/post.controller.js';
import upload from '../middlewares/upload.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const router = express.Router();

router.post('/addPost', verifyToken, (req, res, next) => {next();},upload.postFile, (req, res, next) => {}, createPost);
router.get('/room/:roomId', verifyToken, getPostsByRoom);
router.post('/:postId/like', verifyToken, likePost);
router.post('/:postId/comment', verifyToken, addComment);
router.get('/all', verifyToken, getAllPosts);
export default router;