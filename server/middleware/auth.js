const jwt = require('jsonwebtoken');
const supabase = require('../config/database');

// Verify JWT token middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token required' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch user from database to ensure they still exist
    const { data: user, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token or user not found' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};

// Optional authentication middleware
const optionalAuthenticate = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Fetch user from database to ensure they still exist
      const { data: user, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', decoded.userId)
        .single();

      if (!error && user) {
        req.user = user;
      }
    } catch (error) {
      // Ignore token errors for optional auth, just proceed without a user
      console.warn('Optional auth: Invalid token provided, proceeding as anonymous.');
    }
  }

  next();
};

// Admin-only middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Admin access required' 
    });
  }
  next();
};

// Check subscription status middleware
const checkSubscription = async (req, res, next) => {
  try {
    // If no user is authenticated, they are not subscribed
    if (!req.user) {
      req.isSubscribed = false;
      req.subscription = null;
      return next();
    }

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('status', 'active')
      .gte('end_date', new Date().toISOString())
      .single();

    req.isSubscribed = !!subscription && !error;
    req.subscription = subscription;
    next();
  } catch (error) {
    req.isSubscribed = false;
    req.subscription = null;
    next();
  }
};

module.exports = {
  authenticateToken,
  optionalAuthenticate,
  requireAdmin,
  checkSubscription
};