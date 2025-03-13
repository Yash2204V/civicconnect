import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

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
      address
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

    // Return user info for simple authentication
    res.json({ 
      userId: user._id, 
      name: user.name, 
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
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
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
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