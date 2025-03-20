import express from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Vote from '../models/Vote.js';
import { auth } from '../middleware/auth.js';
import { adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).populate('user', 'name email phone address');
    
    // Get comments for each post and transform media data to base64
    const postsWithComments = await Promise.all(posts.map(async (post) => {
      const comments = await Comment.find({ post: post._id }).populate('user', 'name');

      // Convert buffer to base64 string for frontend display
      const postObj = post.toObject();
      if (postObj.media && postObj.media.data) {
        const base64 = Buffer.from(postObj.media.data).toString('base64');
        const mediaUrl = `data:${postObj.media.contentType};base64,${base64}`;
        postObj.mediaUrl = mediaUrl;
      }

      return {
        ...postObj,
        comments: comments
      };
    }));

    res.json(postsWithComments);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get post by ID
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('user', 'name email');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Get comments for the post
    const comments = await Comment.find({ post: post._id }).populate('user', 'name');

    // Convert buffer to base64 string for frontend display
    const postObj = post.toObject();
    if (postObj.media && postObj.media.data) {
      const base64 = Buffer.from(postObj.media.data).toString('base64');
      const mediaUrl = `data:${postObj.media.contentType};base64,${base64}`;
      postObj.mediaUrl = mediaUrl;
    }

    res.json({
      ...postObj,
      comments
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new post with media upload
router.post('/', auth, upload.single('media'), async (req, res) => {
  try {
    const { title, description, mediaType, category, location } = req.body;

    const newPost = new Post({
      user: req.user.userId,
      title,
      description,
      mediaType,
      category,
      location,
      status: 'posted' // Default status
    });

    // If media file was uploaded, add it to the post
    if (req.file) {
      newPost.media = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }

    await newPost.save();

    // Return the post with user info and empty comments array
    const populatedPost = await Post.findById(newPost._id).populate('user', 'name email');

    // Convert buffer to base64 string for frontend display
    const postObj = populatedPost.toObject();
    if (postObj.media && postObj.media.data) {
      const base64 = Buffer.from(postObj.media.data).toString('base64');
      const mediaUrl = `data:${postObj.media.contentType};base64,${base64}`;
      postObj.mediaUrl = mediaUrl;
    }

    res.status(201).json({
      ...postObj,
      comments: []
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update post
router.patch('/:id', auth, upload.single('media'), async (req, res) => {
  try {
    const { title, description, mediaType, category, location } = req.body;

    // Find post and verify ownership
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user owns the post
    if (post.user.toString() != req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    // Update post with media handling integrated
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        mediaType,
        category,
        location,
        ...(req.file && {
          media: {
            data: req.file.buffer,
            contentType: req.file.mimetype
          }
        })
      },
      { new: true }
    ).populate('user', 'name email');

    // Get comments
    const comments = await Comment.find({ post: updatedPost._id }).populate('user', 'name');

    // Convert media to base64 if exists
    const postObj = updatedPost.toObject();
    if (postObj.media && postObj.media.data) {
      const base64 = Buffer.from(postObj.media.data).toString('base64');
      const mediaUrl = `data:${postObj.media.contentType};base64,${base64}`;
      postObj.mediaUrl = mediaUrl;
    }

    res.json({
      ...postObj,
      comments
    });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete post
router.delete('/:id', auth, async (req, res) => {
  try {
    // Find post and verify ownership
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (!req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    // Delete associated comments and votes
    await Comment.deleteMany({ post: req.params.id });
    await Vote.deleteMany({ post: req.params.id });

    // Delete the post
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete post (admin only)
router.delete('/admin/:id', adminAuth, async (req, res) => {
  try {
    // Find post and verify ownership
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (!req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    // Delete associated comments and votes
    await Comment.deleteMany({ post: req.params.id });
    await Vote.deleteMany({ post: req.params.id });

    // Delete the post
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update post status (admin only)
router.patch('/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['posted', 'waitlist', 'in_progress', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user', 'name email');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Get comments for the post
    const comments = await Comment.find({ post: post._id }).populate('user', 'name');

    // Convert buffer to base64 string for frontend display
    const postObj = post.toObject();
    if (postObj.media && postObj.media.data) {
      const base64 = Buffer.from(postObj.media.data).toString('base64');
      const mediaUrl = `data:${postObj.media.contentType};base64,${base64}`;
      postObj.mediaUrl = mediaUrl;
    }

    res.json({
      ...postObj,
      comments
    });
  } catch (error) {
    console.error('Error updating post status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Vote on a post
router.post('/:id/vote', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user already voted
    const existingVote = await Vote.findOne({
      user: req.user.userId,
      post: req.params.id
    });

    if (existingVote) {
      // Remove vote
      await Vote.findByIdAndDelete(existingVote._id);
      post.votes = post.votes.filter(id => id.toString() !== req.user.userId);
    } else {
      // Add vote to votes collection
      const newVote = new Vote({
        user: req.user.userId,
        post: req.params.id
      });
      await newVote.save();

      // Update post votes array
      post.votes.push(req.user.userId);
    }

    await post.save();

    // Get the updated post with user info
    const updatedPost = await Post.findById(post._id).populate('user', 'name email');

    // Get comments for the post
    const comments = await Comment.find({ post: post._id }).populate('user', 'name');

    // Convert buffer to base64 string for frontend display
    const postObj = updatedPost.toObject();
    if (postObj.media && postObj.media.data) {
      const base64 = Buffer.from(postObj.media.data).toString('base64');
      const mediaUrl = `data:${postObj.media.contentType};base64,${base64}`;
      postObj.mediaUrl = mediaUrl;
    }

    res.json({
      ...postObj,
      comments
    });
  } catch (error) {
    console.error('Error voting on post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment to a post
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Create new comment in comments collection
    const newComment = new Comment({
      user: req.user.userId,
      post: req.params.id,
      text
    });

    await newComment.save();

    // Return the new comment
    const populatedComment = await Comment.findById(newComment._id).populate('user', 'name');

    res.status(201).json(populatedComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment to a post (only admin)
router.post('/admin/:id/comment', adminAuth, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Convert admin-user-id to ObjectId format
    const adminUserId = new mongoose.Types.ObjectId(process.env.ADMIN_ID);
    // console.log(adminUserId);

    // Create new comment in comments collection with proper ObjectId
    const newComment = new Comment({
      user: adminUserId,
      post: req.params.id,
      text
    });
    // console.log(newComment);
    

    await newComment.save();

    // Return the new comment with populated user info
    const populatedComment = await Comment.findById(newComment._id).populate('user', 'name');

    res.status(201).json(populatedComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's posts
router.get('/user/me', auth, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user.userId }).sort({ createdAt: -1 });

    // Get comments for each post and transform media data to base64
    const postsWithComments = await Promise.all(posts.map(async (post) => {
      const comments = await Comment.find({ post: post._id }).populate('user', 'name');

      // Convert buffer to base64 string for frontend display
      const postObj = post.toObject();
      if (postObj.media && postObj.media.data) {
        const base64 = Buffer.from(postObj.media.data).toString('base64');
        const mediaUrl = `data:${postObj.media.contentType};base64,${base64}`;
        postObj.mediaUrl = mediaUrl;
      }

      return {
        ...postObj,
        comments: comments
      };
    }));

    res.json(postsWithComments);
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;