import express from 'express';
import { createPost,getPostsByRoom,likePost,addComment,getAllPosts } from '../controllers/post.controller.js';
import upload from '../middlewares/upload.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const router = express.Router();

router.post('/addPost', 
    verifyToken, 
    (req, res, next) => {
        console.log('Post route hit - /addPost (before file upload)');
        console.log('Request headers:', req.headers);
        next();
    },
    upload.postFile, 
    (req, res, next) => {
        console.log('Post route hit - /addPost (after file upload)');
        console.log('Request body:', req.body);
        console.log('Request file:', req.file);
        next();
    }, 
    createPost
);
router.get('/room/:roomId', verifyToken, getPostsByRoom);
router.post('/:postId/like', verifyToken, likePost);
router.post('/:postId/comment', verifyToken, addComment);
router.get('/all', verifyToken, getAllPosts);
export default router;