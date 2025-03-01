import express from 'express';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Vote from '../models/Vote.js';
import { auth } from '../middleware/auth.js';
import { adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).populate('user', 'name email');
    
    // Get comments for each post
    const postsWithComments = await Promise.all(posts.map(async (post) => {
      const comments = await Comment.find({ post: post._id }).populate('user', 'name');
      return {
        ...post.toObject(),
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
    
    res.json({
      ...post.toObject(),
      comments
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new post
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, mediaUrl, mediaType, category, location } = req.body;
    
    const newPost = new Post({
      user: req.user.userId,
      title,
      description,
      mediaUrl,
      mediaType,
      category,
      location
    });
    
    await newPost.save();
    
    // Return the post with user info and empty comments array
    const populatedPost = await Post.findById(newPost._id).populate('user', 'name email');
    
    res.status(201).json({
      ...populatedPost.toObject(),
      comments: []
    });
  } catch (error) {
    console.error('Error creating post:', error);
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
    
    res.json({
      ...post.toObject(),
      comments
    });
  } catch (error) {
    console.error('Error updating post status:', error);
    res.status(500).json({ message: 'Server error' });
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
    
    res.json({
      ...updatedPost.toObject(),
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

// Get user's posts
router.get('/user/me', auth, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user.userId }).sort({ createdAt: -1 });
    
    // Get comments for each post
    const postsWithComments = await Promise.all(posts.map(async (post) => {
      const comments = await Comment.find({ post: post._id }).populate('user', 'name');
      return {
        ...post.toObject(),
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