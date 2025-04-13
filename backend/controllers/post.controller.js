import {Post} from '../models/post.model.js';
import {Room} from '../models/room.model.js';
import cloudinary from '../utils/cloudinary.js';


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

// DELETE /api/v1/post/comment/:commentId
export const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const {userId} = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    console.log('Attempting to delete comment:', { postId, commentId, userId });
    console.log('Post found:', post);
    console.log('Comment found:', comment);
    if (comment.userId.toString() !== userId) {
      console.log('Unauthorized attempt to delete comment by userId:', userId);
      return res.status(403).json({ message: "Unauthorized to delete this comment" });
    }

    post.comments.pull({ _id: commentId });
    await post.save();

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a post
export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if user is the owner of the post
        if (post.userId.toString() !== req.userId.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this post' });
        }

        // Delete file from Cloudinary if it exists
        if (post.fileUrl) {
            try {
                const publicId = post.fileUrl.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            } catch (cloudinaryError) {
                console.error('Error deleting file from Cloudinary:', cloudinaryError);
                // Continue with post deletion even if Cloudinary deletion fails
            }
        }

        await Post.findByIdAndDelete(req.params.postId);
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error in deletePost:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update a post
export const updatePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if user is the owner of the post
        if (post.userId.toString() !== req.userId.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this post' });
        }

        // Update the content if provided
        if (req.body.content) {
            post.content = req.body.content;
        }

        // Handle file update if new file was uploaded
        if (req.file) {
            // Delete old file from Cloudinary if exists
            if (post.fileUrl) {
                try {
                    const publicId = post.fileUrl.split('/').pop().split('.')[0];
                    await cloudinary.uploader.destroy(publicId);
                } catch (cloudinaryError) {
                    console.error('Error deleting file from Cloudinary:', cloudinaryError);
                }
            }
            post.fileUrl = req.file.path;
            post.type = req.file.mimetype.startsWith('image/') ? 'image' : 'video';
        }

        await post.save();
        res.json(post);
    } catch (error) {
        console.error('Error in updatePost:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
