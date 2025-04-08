import {Post} from '../models/post.model.js';
import {Room} from '../models/room.model.js';


// Create a new post
export const createPost = async (req, res) => {
    try {
        console.log('Create post - Request body:', req.body);
        console.log('Create post - Request files:', req.files);
        
        // Extract data from the request
        const content = req.body.content || '';
        const type = req.body.type || 'text';
        const roomId = req.body.roomId;
        
        console.log('Extracted data:', { content, type, roomId });
        
        if (!roomId) {
            return res.status(400).json({ message: 'Room ID is required' });
        }
        
        // Check if room exists and user is a member
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        if (!room.members.includes(req.userId)) {
            return res.status(403).json({ message: 'You are not a member of this room' });
        }

        let fileUrl = '';
        if (req.files && req.files.file && req.files.file[0]) {
            fileUrl = req.files.file[0].path;
            console.log('File URL:', fileUrl);
        }

        // Create new post
        const post = new Post({
            content,
            type,
            fileUrl,
            roomId,
            userId: req.userId,
            likes: [],
            comments: []
        });

        await post.save();
        console.log('Post saved successfully:', post);

        res.status(201).json(post);
    } catch (error) {
        console.error('Error in createPost:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getPostsByRoom = async (req, res) => {
    try {
      const { roomId } = req.params;
  
      // Check if room exists and user is a member
      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }
  
      // Get posts with user details and populated comments
      const posts = await Post.find({ roomId })
        .populate('userId', 'username')
        .populate({
          path: 'comments.userId',
          select: 'username'
        })
        .sort({ createdAt: -1 });
  
      res.status(200).json(posts);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  // Like/unlike a post
  export const likePost = async (req, res) => {
    try {
      const { postId } = req.params;
      const { userId } = req.body;
  
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
  
      const likeIndex = post.likedBy.indexOf(userId);
      if (likeIndex === -1) {
        post.likedBy.push(userId);
      } else {
        post.likedBy.splice(likeIndex, 1);
      }
  
      await post.save();
      res.status(200).json(post);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  // Add comment to a post
  export const addComment = async (req, res) => {
    try {
      const { postId } = req.params;
      const { userId, content } = req.body;
  
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
  
      const newComment = {
        userId,
        content
      };
  
      post.comments.push(newComment);
      await post.save();
  
      // Populate the user details for the new comment
      const populatedPost = await Post.populate(post, {
        path: 'comments.userId',
        select: 'username'
      });
  
      // Return the last comment (the one just added)
      const addedComment = populatedPost.comments[populatedPost.comments.length - 1];
      res.status(201).json(addedComment);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('userId', 'username')
            .populate('roomId', 'roomName roomImage members')
            .populate({
                path: 'comments.userId',
                select: 'username'
            })
            .sort({ createdAt: -1 })
            .limit(50); // Limit to 50 most recent posts

        res.status(200).json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};