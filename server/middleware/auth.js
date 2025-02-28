import User from '../models/User.js';

export const auth = async (req, res, next) => {
  try {
    // Simple session-based auth check
    if (!req.headers.authorization) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Extract user ID from authorization header
    const userId = req.headers.authorization;
    
    if (!userId) {
      return res.status(401).json({ message: 'Invalid authentication' });
    }

    // Find user in database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Set user info in request object
    req.user = { userId: user._id, role: user.role };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};

export const adminAuth = async (req, res, next) => {
  try {
    // Simple admin check
    if (!req.headers.authorization) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Extract user ID from authorization header
    const userId = req.headers.authorization;
    
    if (!userId) {
      return res.status(401).json({ message: 'Invalid authentication' });
    }

    // Find user in database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    req.user = { userId: user._id, role: user.role };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};