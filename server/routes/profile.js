const express = require('express');
const { body, validationResult } = require('express-validator');
const supabase = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { generateInitials } = require('../utils/helpers');

const router = express.Router();

// Update user profile
router.put('/update', [
  authenticateToken,
  body('fullName').optional().trim().isLength({ min: 2 }),
  body('bio').optional().trim(),
  body('avatarUrl').optional().isURL()
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

    const userId = req.user.id;
    const updates = {};

    // Build update object
    if (req.body.fullName) updates.full_name = req.body.fullName;
    if (req.body.bio !== undefined) updates.bio = req.body.bio;
    if (req.body.avatarUrl !== undefined) updates.avatar_url = req.body.avatarUrl;

    updates.updated_at = new Date().toISOString();

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Update profile error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update profile'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: profile.id,
          email: profile.email,
          fullName: profile.full_name,
          role: profile.role,
          bio: profile.bio,
          avatarUrl: profile.avatar_url,
          initials: generateInitials(profile.full_name),
          updatedAt: profile.updated_at
        }
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user profile
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = req.user;

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          bio: user.bio,
          avatarUrl: user.avatar_url,
          initials: generateInitials(user.full_name),
          createdAt: user.created_at,
          updatedAt: user.updated_at
        }
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;