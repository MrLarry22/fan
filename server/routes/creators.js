const express = require('express');
const { body, validationResult } = require('express-validator');
const supabase = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { getRandomState, getRandomOnlineStatus } = require('../utils/helpers');
// Add multer and filesystem utilities for local uploads
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const router = express.Router();

// Configure multer storage for creator avatars with per-creator folders
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const creatorId = req.params.id;
      if (!creatorId) {
        return cb(new Error('Creator ID is required'));
      }

      // Get creator's folder name from database
      const { data: creator, error } = await supabase.from('creators')
        .select('folder_name, display_name')
        .eq('id', creatorId)
        .single();

      if (error || !creator) {
        return cb(new Error('Creator not found'));
      }

      let folderName = creator.folder_name;
      
      // If no folder name exists, create one (for existing creators)
      if (!folderName) {
        const sanitizedName = creator.display_name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);
        const uniqueSuffix = crypto.randomBytes(2).toString('hex');
        folderName = `${sanitizedName}-${uniqueSuffix}`;
        
        // Update creator with folder name
        await supabase.from('creators')
          .update({ folder_name: folderName })
          .eq('id', creatorId);
      }

      const uploadPath = path.join(__dirname, '..', 'uploads', 'creators', folderName);
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, png, webp, gif) are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Get all active creators (public)
router.get('/', async (req, res) => {
  try {
    console.log('Fetching creators from database...');
    const { data: creators, error } = await supabase
      .from('creators')
      .select('*')
      .eq('is_active', true)
      .order('total_subscribers', { ascending: false });
    
    console.log('Creators query result:', { creators: creators?.length, error });

    if (error) {
      console.error('Fetch creators error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch creators'
      });
    }

    // Add random online status to each creator
    const creatorsWithStatus = creators.map(creator => ({
      ...creator,
      isOnline: getRandomOnlineStatus(),
      lastSeen: getRandomOnlineStatus() ? 'Online' : `${Math.floor(Math.random() * 60) + 1}m ago`
    }));

    res.json({
      success: true,
      data: creatorsWithStatus
    });

  } catch (error) {
    console.error('Get creators error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get single creator by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: creator, error } = await supabase
      .from('creators')
      .select(`
        *,
        profiles (
          full_name,
          avatar_url
        )
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error || !creator) {
      return res.status(404).json({
        success: false,
        message: 'Creator not found'
      });
    }

    // Add online status
    const creatorWithStatus = {
      ...creator,
      isOnline: getRandomOnlineStatus(),
      lastSeen: getRandomOnlineStatus() ? 'Online' : `${Math.floor(Math.random() * 60) + 1}m ago`
    };

    res.json({
      success: true,
      data: creatorWithStatus
    });

  } catch (error) {
    console.error('Get creator error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new creator (Admin only) - avatar is REQUIRED
router.post('/', [
  authenticateToken,
  requireAdmin,
  body('displayName').trim().isLength({ min: 2 }),
  body('bio').optional().trim(),
  body('location').optional().trim(),
  body('avatarUrl').isURL().withMessage('avatarUrl is required and must be a valid URL')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { displayName, bio, avatarUrl, userId, location } = req.body;

    if (!avatarUrl) {
      return res.status(400).json({ success: false, message: 'Avatar is required for creator accounts' });
    }

    // Create creator
    const { data: creator, error } = await supabase
      .from('creators')
      .insert([{
        user_id: userId || req.user.id,
        display_name: displayName,
        bio: bio || null,
        location: location || null,
        avatar_url: avatarUrl,
        total_subscribers: 0,
        total_revenue: 0.00,
        is_active: true,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Create creator error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create creator'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Creator created successfully',
      data: creator
    });

  } catch (error) {
    console.error('Create creator error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update creator (Admin only) - cannot activate without an avatar
router.put('/:id', [
  authenticateToken,
  requireAdmin,
  body('displayName').optional().trim().isLength({ min: 2 }),
  body('bio').optional().trim(),
  body('avatarUrl').optional().isURL(),
  body('isActive').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updates = {};

    // Build update object
    if (req.body.displayName) updates.display_name = req.body.displayName;
    if (req.body.bio !== undefined) updates.bio = req.body.bio;
    if (req.body.avatarUrl !== undefined) updates.avatar_url = req.body.avatarUrl;
    if (req.body.isActive !== undefined) updates.is_active = req.body.isActive;

    // If attempting to activate creator, ensure avatar exists (either incoming or existing)
    if (req.body.isActive === true) {
      const { data: existingCreator } = await supabase
        .from('creators')
        .select('avatar_url')
        .eq('id', id)
        .single();

      const effectiveAvatar = updates.avatar_url ?? existingCreator?.avatar_url;
      if (!effectiveAvatar) {
        return res.status(400).json({
          success: false,
          message: 'Cannot activate creator without a profile picture (avatar)'
        });
      }
    }

    updates.updated_at = new Date().toISOString();

    const { data: creator, error } = await supabase
      .from('creators')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update creator error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update creator'
      });
    }

    if (!creator) {
      return res.status(404).json({
        success: false,
        message: 'Creator not found'
      });
    }

    res.json({
      success: true,
      message: 'Creator updated successfully',
      data: creator
    });

  } catch (error) {
    console.error('Update creator error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Upload/replace creator avatar (Admin only) - multipart/form-data with field name "avatar"
router.post('/:id/avatar', authenticateToken, requireAdmin, upload.single('avatar'), async (req, res) => {
  try {
    const { id } = req.params;

    // Validate file presence
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Use form-data with field name "avatar".'
      });
    }

    // Ensure creator exists and fetch current avatar
    const { data: creator, error: fetchError } = await supabase
      .from('creators')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !creator) {
      // Cleanup uploaded file if creator not found
      try { fs.unlinkSync(req.file.path); } catch (_) {}
      return res.status(404).json({ success: false, message: 'Creator not found' });
    }

    const filename = req.file.filename;
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/creators/${filename}`;

    // Optionally remove previous local avatar file if it was stored locally
    if (creator.avatar_url) {
      try {
        const prevUrl = new URL(creator.avatar_url);
        if (prevUrl.pathname.startsWith('/uploads/creators/')) {
          const localPath = path.join(__dirname, '..', prevUrl.pathname.replace(/^\/uploads\//, 'uploads/'));
          if (fs.existsSync(localPath)) {
            fs.unlinkSync(localPath);
          }
        }
      } catch (_) {
        // Ignore if avatar_url is not a valid URL or not local
      }
    }

    const { data: updated, error: updateError } = await supabase
      .from('creators')
      .update({ avatar_url: fileUrl, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      // Cleanup uploaded file on failure
      try { fs.unlinkSync(req.file.path); } catch (_) {}
      return res.status(500).json({ success: false, message: 'Failed to update creator avatar' });
    }

    return res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: updated
    });

  } catch (error) {
    console.error('Upload avatar error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get creator by display name (public) - using display name as identifier for now
router.get('/username/:username', async (req, res) => {
  try {
    const { username } = req.params;
    console.log(`Fetching creator by username: ${username}`);

    // Get all creators and find the best match
    const { data: allCreators, error } = await supabase
      .from('creators')
      .select('*');

    if (error) {
      console.error('Fetch creators error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch creators'
      });
    }

    // Try to find a matching creator
    let creator = null;
    
    // First try exact display name match (case insensitive)
    creator = allCreators.find(c => 
      c.display_name.toLowerCase() === username.toLowerCase()
    );
    
    // If no exact match, try partial match (removes spaces and special chars)
    if (!creator) {
      const cleanUsername = username.toLowerCase().replace(/[^a-z0-9]/g, '');
      creator = allCreators.find(c => {
        const cleanDisplayName = c.display_name.toLowerCase().replace(/[^a-z0-9]/g, '');
        return cleanDisplayName === cleanUsername;
      });
    }
    
    // If still no match, try contains match
    if (!creator) {
      creator = allCreators.find(c => 
        c.display_name.toLowerCase().includes(username.toLowerCase())
      );
    }

    if (!creator) {
      console.log(`Creator not found for username: ${username}`);
      console.log('Available creators:', allCreators.map(c => c.display_name));
      return res.status(404).json({
        success: false,
        message: 'Creator not found'
      });
    }

    console.log(`Found creator: ${creator.display_name} for username: ${username}`);

    // Get subscriber count
    const { count: subscriberCount } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact' })
      .eq('creator_id', creator.id)
      .eq('status', 'active');

    // Get total likes count
    const { count: totalLikes } = await supabase
      .from('content_likes')
      .select('*', { count: 'exact' })
      .eq('creator_id', creator.id);

    // Get content count
    const { count: contentCount } = await supabase
      .from('content')
      .select('*', { count: 'exact' })
      .eq('creator_id', creator.id);

    const creatorWithStats = {
      ...creator,
      subscriber_count: subscriberCount || 0,
      total_likes: totalLikes || 0,
      content_count: contentCount || 0
    };

    res.json({
      success: true,
      data: creatorWithStats
    });

  } catch (error) {
    console.error('Error fetching creator by username:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch creator'
    });
  }
});

module.exports = router;