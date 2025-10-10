const express = require('express');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const supabase = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { generateUsername } = require('../utils/helpers');
const fs = require('fs');
const multer = require('multer');
const path = require('path');

// Configure multer storage for creator avatars with per-creator folders
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // For new creator creation, we'll use a temporary folder initially
    // The file will be moved to the creator's specific folder after creation
    const uploadPath = path.join(__dirname, '..', 'uploads', 'temp');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    cb(null, `temp-avatar-${timestamp}-${random}${ext}`);
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

const router = express.Router();

// Helper to generate a reasonably strong temporary password
function generateTempPassword() {
  // 12+ chars with mixed classes
  const core = crypto.randomBytes(9).toString('base64'); // ~12 chars
  return core.replace(/[^a-zA-Z0-9]/g, 'A') + 'a1!';
}

// Helper to move file to creator-specific folder with name-based folder
function moveFileToCreatorFolder(tempFilePath, creatorId, creatorName, fileType = 'avatar') {
  const tempFileName = path.basename(tempFilePath);
  const ext = path.extname(tempFileName);
  
  // Generate folder name: creator name + 4 unique characters
  const sanitizedName = creatorName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);
  const uniqueSuffix = crypto.randomBytes(2).toString('hex'); // 4 hex characters
  const folderName = `${sanitizedName}-${uniqueSuffix}`;
  
  const creatorFolderPath = path.join(__dirname, '..', 'uploads', 'creators', folderName);
  fs.mkdirSync(creatorFolderPath, { recursive: true });
  
  const newFileName = `${fileType}${ext}`;
  const newFilePath = path.join(creatorFolderPath, newFileName);
  
  // Move file from temp to creator folder
  fs.renameSync(tempFilePath, newFilePath);
  
  // Return the relative URL for serving and the folder name
  return {
    url: `/uploads/creators/${folderName}/${newFileName}`,
    folderName: folderName
  };
}

// POST /api/admin/creators/provision
// Creates: auth user -> profile (ensures/upserts) -> creator row
router.post(
  '/creators/provision',
  [
    authenticateToken,
    requireAdmin,
    body('email').isEmail().normalizeEmail(),
    body('fullName').trim().isLength({ min: 2 }),
    body('displayName').trim().isLength({ min: 2 }),
    body('password').optional().isLength({ min: 6 }),
    body('bio').optional().trim(),
    body('location').optional().trim(),
    body('avatarUrl').optional().isURL(),
  ],
  async (req, res) => {
    try {
      // Validate inputs
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { email, fullName, displayName, password, bio, location, avatarUrl } = req.body;
      console.log(`Provisioning new creator details: ${req.body}`);
      // 1) Ensure email not already used
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (existingProfile) {
        return res.status(409).json({
          success: false,
          message: 'A user with this email already exists',
        });
      }

      // 2) Create Auth user (service role)
      const tempPassword = password || generateTempPassword();
      const username = generateUsername(email);

      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          username,
        },
      });

      if (authError) {
        console.error('Provision - auth.createUser error:', authError);
        return res.status(500).json({
          success: false,
          message: 'Failed to create auth user',
        });
      }

      const userId = authData.user.id;

      // 3) Ensure profile row exists and set role=creator (upsert in case trigger already ran)
      const { error: profileUpsertError } = await supabase
        .from('profiles')
        .upsert(
          [
            {
              id: userId,
              email,
              full_name: fullName,
              role: 'creator',
              updated_at: new Date().toISOString(),
            },
          ],
          { onConflict: 'id' }
        );

      if (profileUpsertError) {
        console.error('Provision - profiles upsert error:', profileUpsertError);
        // cleanup auth user
        await supabase.auth.admin.deleteUser(userId).catch(() => {});
        return res.status(500).json({
          success: false,
          message: 'Failed to create user profile',
        });
      }

      // 4) Create creators row linked to this user
      const { data: creator, error: creatorError } = await supabase
        .from('creators')
        .insert([
          {
            user_id: userId,
            display_name: displayName,
            bio: bio || null,
            location: location || null,
            avatar_url: avatarUrl || null,
            total_subscribers: 0,
            total_revenue: 0.0,
            is_active: true,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (creatorError) {
        console.error('Provision - creators insert error:', creatorError);
        // cleanup to avoid orphans
        await supabase.from('profiles').delete().eq('id', userId).catch(() => {});
        await supabase.auth.admin.deleteUser(userId).catch(() => {});
        return res.status(500).json({
          success: false,
          message: 'Failed to create creator profile',
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Creator provisioned successfully',
        data: {
          user: { id: userId, email },
          profile: { id: userId, fullName, role: 'creator' },
          creator,
          // Return tempPassword only if we generated it (useful for studio to record credentials)
          ...(password ? {} : { tempPassword }),
        },
      });
    } catch (error) {
      console.error('Provision creator unexpected error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

// Configure multer for handling both avatar and banner uploads
const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
}).fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'banner', maxCount: 1 }
]);

// TEMPORARY: Route without auth for testing - REMOVE IN PRODUCTION
router.post(
  '/creators/provision-test',
  [
    uploadMultiple, // Handle both avatar and banner uploads
  ],
  async (req, res) => {
    try {
      // Simple test route that just creates a creator directly in Supabase
      const { displayName, bio, location, total_subscribers, total_likes, media_count } = req.body;

      if (!displayName || !req.files?.avatar?.[0]) {
        return res.status(400).json({
          success: false,
          message: 'Display name and avatar are required',
        });
      }

      // Create creator first to get the ID
      const { data: creator, error: creatorError } = await supabase
        .from('creators')
        .insert([
          {
            user_id: crypto.randomUUID(), // Generate random UUID for testing
            display_name: displayName,
            bio: bio || null,
            location: location || null,
            avatar_url: null, // Will be updated after moving file
            banner_url: null, // Will be updated if banner provided
            total_subscribers: parseInt(total_subscribers, 10) || 0,
            total_likes: parseInt(total_likes, 10) || 0,
            media_count: parseInt(media_count, 10) || 0,
            total_revenue: 0.0,
            is_active: true,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (creatorError) {
        console.error('Test creator creation error:', creatorError);
        // Cleanup uploaded files
        if (req.files?.avatar?.[0]) {
          try { fs.unlinkSync(req.files.avatar[0].path); } catch (_) {}
        }
        if (req.files?.banner?.[0]) {
          try { fs.unlinkSync(req.files.banner[0].path); } catch (_) {}
        }
        return res.status(500).json({
          success: false,
          message: 'Failed to create test creator',
        });
      }

      // Move avatar file to creator-specific folder and get URL
      const avatarFile = req.files.avatar[0];
      const avatarResult = moveFileToCreatorFolder(avatarFile.path, creator.id, displayName, 'avatar');
      const fullAvatarUrl = `../../server/${avatarResult.url}`;

      // Handle banner upload if provided
      let fullBannerUrl = null;
      if (req.files?.banner?.[0]) {
        const bannerFile = req.files.banner[0];
        const bannerResult = moveFileToCreatorFolder(bannerFile.path, creator.id, displayName, 'banner');
        fullBannerUrl = `../../server/${bannerResult.url}`;
        console.log('Banner uploaded:', bannerResult);
      }

      console.log('Avatar result:', avatarResult);
      console.log('Full avatar URL:', fullAvatarUrl);
      console.log('Full banner URL:', fullBannerUrl);
      console.log('Updating creator ID:', creator.id);

      // Update creator with avatar URL and optional banner URL
      const updateData = { 
        avatar_url: fullAvatarUrl
      };
      
      if (fullBannerUrl) {
        updateData.banner_url = fullBannerUrl;
      }

      const { data: updateResult, error: updateError } = await supabase
        .from('creators')
        .update(updateData)
        .eq('id', creator.id)
        .select(); // Return updated data

      if (updateError) {
        console.error('Failed to update creator URLs:', updateError);
        // Don't fail the request, just log the error
      } else {
        console.log('Successfully updated creator with file URLs:', updateResult);
      }

      // Return the updated creator data
      const updatedCreator = { 
        ...creator, 
        avatar_url: fullAvatarUrl,
        banner_url: fullBannerUrl,
        folder_name: avatarResult.folderName 
      };

      console.log('Final creator data being returned:', updatedCreator);

      return res.status(201).json({
        success: true,
        message: 'Test creator created successfully',
        data: { creator: updatedCreator },
      });
    } catch (error) {
      console.error('Test provision error:', error);
      // Cleanup uploaded files on error
      if (req.files?.avatar?.[0]) {
        try { fs.unlinkSync(req.files.avatar[0].path); } catch (_) {}
      }
      if (req.files?.banner?.[0]) {
        try { fs.unlinkSync(req.files.banner[0].path); } catch (_) {}
      }
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

module.exports = router;
