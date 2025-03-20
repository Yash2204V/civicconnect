import express from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, address, bio } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = await User.create({
      name,
      email,
      password,
      phone,
      address,
      bio
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user to MongoDB
    await user.save();

    // Return user ID for simple authentication
    res.json({ 
      userId: user._id, 
      name: user.name, 
      email: user.email,
      phone: user.phone,
      address: user.address,
      bio: user.bio,
      role: user.role,
      message: 'Registration successful' 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // For development/demo purposes, allow login with test credentials
    if (email === 'user@example.com' && password === 'admin123') {
      return res.json({ 
        userId: 'demo-user-id', 
        name: 'Demo User', 
        email: 'user@example.com',
        phone: '123-456-7890',
        address: '123 Demo Street, Demo City',
        bio: 'Demo user bio',
        role: 'user',
        message: 'Login successful' 
      });
    }

    if (email === 'admin@example.com' && password === 'admin123@') {
      return res.json({ 
        userId: 'admin-user-id', 
        name: 'Admin User', 
        email: 'admin@example.com',
        phone: '987-654-3210',
        address: '456 Admin Avenue, Admin City',
        bio: 'Admin user bio',
        role: 'admin',
        message: 'Login successful' 
      });
    }

    // Find user in database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Convert profile pic to base64 if it exists
    let profilePicUrl;
    if (user.profilePic && user.profilePic.data) {
      const base64 = Buffer.from(user.profilePic.data).toString('base64');
      profilePicUrl = `data:${user.profilePic.contentType};base64,${base64}`;
    }

    // Return user info for simple authentication
    res.json({ 
      userId: user._id, 
      name: user.name, 
      email: user.email,
      phone: user.phone,
      address: user.address,
      bio: user.bio,
      role: user.role,
      profilePicUrl,
      message: 'Login successful' 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Convert profile pic to base64 if it exists
    let profilePicUrl;
    if (user.profilePic && user.profilePic.data) {
      const base64 = Buffer.from(user.profilePic.data).toString('base64');
      profilePicUrl = `data:${user.profilePic.contentType};base64,${base64}`;
    }

    res.json({
      ...user.toObject(),
      profilePicUrl
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.patch('/update-profile', auth, async (req, res) => {
  try {
    const { name, email, phone, address, bio } = req.body;
    
    // Find user and update
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update only provided fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (bio) user.bio = bio;

    await user.save();

    // Convert profile pic to base64 if it exists
    let profilePicUrl;
    if (user.profilePic && user.profilePic.data) {
      const base64 = Buffer.from(user.profilePic.data).toString('base64');
      profilePicUrl = `data:${user.profilePic.contentType};base64,${base64}`;
    }

    // Return updated user info
    res.json({
      userId: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      bio: user.bio,
      role: user.role,
      profilePicUrl,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update profile picture
router.patch('/update-profile-pic', auth, upload.single('profilePic'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update profile picture
    user.profilePic = {
      data: req.file.buffer,
      contentType: req.file.mimetype
    };

    await user.save();

    // Convert profile pic to base64
    const base64 = Buffer.from(user.profilePic.data).toString('base64');
    const profilePicUrl = `data:${user.profilePic.contentType};base64,${base64}`;

    res.json({
      userId: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      bio: user.bio,
      role: user.role,
      profilePicUrl,
      message: 'Profile picture updated successfully'
    });
  } catch (error) {
    console.error('Profile picture update error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Test route to check database connection
router.get('/test-db', async (req, res) => {
  try {
    // Try to count users to verify DB connection
    const count = await User.countDocuments();
    res.json({ 
      message: 'Database connection successful', 
      userCount: count,
      mongoStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ 
      message: 'Database connection error', 
      error: error.message 
    });
  }
});

export default router;