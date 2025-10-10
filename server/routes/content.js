const express = require('express');
const { body, validationResult } = require('express-validator');
const supabase = require('../config/database');
const { authenticateToken, optionalAuthenticate, requireAdmin, checkSubscription } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Configure multer storage for content uploads - use temp directory first
const contentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Use a temporary directory first, then move to proper creator folder after we have the creator ID
    const uploadPath = path.join(__dirname, '..', 'uploads', 'temp');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    cb(null, `content-${timestamp}-${random}${ext}`);
  }
});

const contentFileFilter = (req, file, cb) => {
  // Allow images and videos
  if (/^(image|video)\/(jpeg|png|webp|gif|mp4|mov|avi|mkv)$/.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed'));
  }
};

const contentUpload = multer({
  storage: contentStorage,
  fileFilter: contentFileFilter,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB for videos
});

const router = express.Router();

// Helper function to ensure creator has a folder name
async function ensureCreatorFolderName(creatorId, displayName) {
  try {
    // Check if creator already has a folder name
    const { data: creator, error } = await supabase
      .from('creators')
      .select('folder_name')
      .eq('id', creatorId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking creator folder name:', error);
      // Fallback: generate folder name from creator info
      const sanitizedName = displayName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);
      const uniqueSuffix = creatorId.substring(0, 8);
      return `${sanitizedName}-${uniqueSuffix}`;
    }

    if (creator && creator.folder_name) {
      return creator.folder_name;
    }

    // Generate new folder name
    const sanitizedName = displayName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);
    const uniqueSuffix = crypto.randomBytes(2).toString('hex');
    const folderName = `${sanitizedName}-${uniqueSuffix}`;

    // Try to update creator with folder name
    try {
      const { error: updateError } = await supabase
        .from('creators')
        .update({ folder_name: folderName })
        .eq('id', creatorId);

      if (updateError) {
        console.log('Could not update creator folder name, using generated name:', updateError.message);
      }
      
      return folderName;
    } catch (err) {
      console.log('Error updating creator folder name:', err.message);
      return folderName;
    }

    return creator.folder_name;
  } catch (err) {
    // Fallback: generate folder name from creator info
    console.log('Fallback: generating folder name from creator ID');
    const sanitizedName = displayName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);
    const uniqueSuffix = creatorId.substring(0, 8);
    return `${sanitizedName}-${uniqueSuffix}`;
  }
}

// Get content for a creator (with subscription check)
router.get('/creator/:creatorId', optionalAuthenticate, checkSubscription, async (req, res) => {
  try {
    const { creatorId } = req.params;
    const isSubscribed = req.isSubscribed;

    // Get all content for the creator
    const { data: content, error } = await supabase
      .from('content')
      .select(`
        *,
        creators (
          display_name,
          avatar_url
        )
      `)
      .eq('creator_id', creatorId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch content error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch content'
      });
    }

    // Filter content based on subscription status
    const filteredContent = content.map(item => {
      if (item.is_premium && !isSubscribed) {
        // Return locked preview for premium content
        return {
          ...item,
          content_url: null, // Hide actual URL
          isLocked: true,
          preview: 'Premium content - Subscribe to unlock'
        };
      }
      
      return {
        ...item,
        isLocked: false
      };
    });

    // Get likes for each content item
    const contentWithLikes = await Promise.all(
      filteredContent.map(async (item) => {
        // Get total likes
        const { count: totalLikes } = await supabase
          .from('content_likes')
          .select('*', { count: 'exact' })
          .eq('content_id', item.id);

        let userLike = null;
        // Only check for user's like if a user is authenticated
        if (req.user) {
          const { data: likeData } = await supabase
            .from('content_likes')
            .select('id')
            .eq('content_id', item.id)
            .eq('user_id', req.user.id)
            .single();
          userLike = likeData;
        }

        return {
          ...item,
          totalLikes: totalLikes || 0,
          isLikedByUser: !!userLike
        };
      })
    );

    res.json({
      success: true,
      data: {
        content: contentWithLikes,
        isSubscribed,
        subscription: req.subscription
      }
    });

  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Upload and create new content (Admin only) - with file upload
// TODO: Re-enable authentication for production
router.post('/upload', [
  // authenticateToken,
  // requireAdmin,
  contentUpload.single('contentFile'), // Handle single file upload
], async (req, res) => {
  console.log('=== Content Upload Request Received ===');
  console.log('Body:', req.body);
  console.log('File:', req.file ? {
    filename: req.file.filename,
    mimetype: req.file.mimetype,
    size: req.file.size,
    path: req.file.path
  } : 'No file uploaded');
  
  try {
    const { userId, creatorId, title, description, isPremium } = req.body;

    // Use userId if provided, fallback to creatorId for backward compatibility
    const lookupId = userId || creatorId;
    const lookupField = userId ? 'user_id' : 'id';

    console.log(`Content upload: Looking up creator by ${lookupField} = ${lookupId}`);

    // Validate required fields
    if (!lookupId || !title || !req.file) {
      // Cleanup uploaded file if validation fails
      if (req.file) {
        try { fs.unlinkSync(req.file.path); } catch (_) {}
      }
      return res.status(400).json({
        success: false,
        message: 'User ID (or Creator ID), title, and content file are required'
      });
    }

    // First, list all creators to see what's actually in the database
    const { data: allCreators, error: allError } = await supabase
      .from('creators')
      .select('id, user_id, display_name');
    
    console.log('=== ALL CREATORS IN DATABASE ===');
    console.log(JSON.stringify(allCreators, null, 2));
    console.log('All creators query error:', allError);
    console.log('================================');

    // Verify creator exists by user_id or creator id
    const { data: creator, error: creatorError } = await supabase
      .from('creators')
      .select('id, display_name, user_id')
      .eq(lookupField, lookupId)
      .single();

    console.log(`Query result for ${lookupField} = ${lookupId}:`, {
      found: !!creator,
      creator: creator,
      error: creatorError
    });

    if (creatorError || !creator) {
      console.error('Creator lookup failed:', {
        lookupField,
        lookupId,
        error: creatorError
      });
      // Cleanup uploaded file
      try { fs.unlinkSync(req.file.path); } catch (_) {}
      return res.status(404).json({
        success: false,
        message: `Creator not found with ${lookupField}: ${lookupId}`,
        debug: { lookupField, lookupId, error: creatorError?.message, allCreators }
      });
    }

    // Use the actual creator database ID
    const actualCreatorId = creator.id;
    console.log(`Using creator: ${creator.display_name} (DB ID: ${actualCreatorId}, User ID: ${creator.user_id})`);

    // Generate folder name without querying database (to avoid missing column error)
    const sanitizedName = creator.display_name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);
    const uniqueSuffix = actualCreatorId.substring(0, 8);
    const folderName = `${sanitizedName}-${uniqueSuffix}`;
    console.log('Using generated folder name:', folderName);

    // Move file from temp to creator's content directory
    const tempFilePath = req.file.path;
    const creatorContentDir = path.join(__dirname, '..', 'uploads', 'creators', folderName, 'content');
    fs.mkdirSync(creatorContentDir, { recursive: true });

    const newFilePath = path.join(creatorContentDir, req.file.filename);
    fs.renameSync(tempFilePath, newFilePath);

    // Determine content type from file mimetype
    let contentType;
    if (req.file.mimetype.startsWith('image/')) {
      contentType = 'image';
    } else if (req.file.mimetype.startsWith('video/')) {
      contentType = 'video';
    } else {
      contentType = 'text'; // Fallback, though this shouldn't happen due to fileFilter
    }
    
    console.log('Determined content type:', contentType, 'from mimetype:', req.file.mimetype);
    
    // Generate content URL - this should match the actual file location
    const contentUrl = `/uploads/creators/${folderName}/content/${req.file.filename}`;

    // Prepare content data - try WITHOUT creator_id first to test
    const contentDataTest = {
      title,
      description: description || null,
      content_url: contentUrl,
      content_type: contentType,
      is_premium: isPremium === 'true' || isPremium === true
    };

    // Full data with creator_id
    const contentData = {
      creator_id: actualCreatorId, // Use the actual creator database ID
      ...contentDataTest
    };

    console.log('Attempting to insert content with data:', {
      ...contentData,
      creator_id_type: typeof actualCreatorId,
      creator_id_value: actualCreatorId,
      creator: { id: creator.id, user_id: creator.user_id, display_name: creator.display_name }
    });

    // Validate creator_id is a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(actualCreatorId)) {
      console.error('Invalid creator_id format:', actualCreatorId);
      try { fs.unlinkSync(newFilePath); } catch (_) {}
      return res.status(400).json({
        success: false,
        message: 'Invalid creator ID format',
        debug: { creator_id: actualCreatorId }
      });
    }

    // Check the schema to understand the foreign key constraint
    const { data: fkInfo, error: fkError } = await supabase
      .from('information_schema.table_constraints')
      .select('*')
      .eq('table_name', 'content')
      .eq('constraint_type', 'FOREIGN KEY');
    
    console.log('Content table foreign key info:', { fkInfo, fkError });

    console.log('Final contentData to insert:', contentData);

    // Double-check creator exists
    const { data: verifyCreator, error: verifyError } = await supabase
      .from('creators')
      .select('id, user_id, display_name')
      .eq('id', actualCreatorId)
      .single();

    console.log('Verify creator before insert:', { verifyCreator, verifyError });

    // Check if content table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from('content')
      .select('id')
      .limit(1);

    console.log('Content table check:', { tableCheck, tableError });

    // Try inserting with explicit schema reference
    const { data: content, error } = await supabase
      .from('content')
      .insert([contentData])
      .select()
      .single();

    if (error) {
      console.error('Create content error:', error);
      console.error('Error code:', error.code);
      console.error('Error details:', error.details);
      console.error('Error hint:', error.hint);
      console.error('Error message:', error.message);
      // Cleanup uploaded file
      try { fs.unlinkSync(newFilePath); } catch (_) {}
      return res.status(500).json({
        success: false,
        message: 'Failed to create content in database',
        debug: { 
          error: error.message, 
          details: error.details, 
          hint: error.hint,
          code: error.code
        }
      });
    }

    // Increment creator's media count
    await supabase.rpc('increment_creator_media_count', {
      creator_id_in: actualCreatorId,
      amount: 1
    });

    res.status(201).json({
      success: true,
      message: 'Content uploaded and created successfully',
      data: content
    });

  } catch (error) {
    console.error('Upload content error:', error);
    console.error('Error stack:', error.stack);
    // Cleanup uploaded file
    if (req.file) {
      try { fs.unlinkSync(req.file.path); } catch (_) {}
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      debug: { error: error.message, stack: error.stack }
    });
  }
});

// Create new content (Admin only) - URL-based (legacy)
router.post('/', [
  authenticateToken,
  requireAdmin,
  body('creatorId').notEmpty(),
  body('title').trim().isLength({ min: 1 }),
  body('contentUrl').isURL(),
  body('contentType').isIn(['image', 'video', 'text']),
  body('isPremium').isBoolean()
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

    const { creatorId, title, description, contentUrl, contentType, isPremium } = req.body;

    // Verify creator exists
    const { data: creator, error: creatorError } = await supabase
      .from('creators')
      .select('id')
      .eq('id', creatorId)
      .single();

    if (creatorError || !creator) {
      return res.status(404).json({
        success: false,
        message: 'Creator not found'
      });
    }

    // Create content
    const { data: content, error } = await supabase
      .from('content')
      .insert([{
        creator_id: creatorId,
        title,
        description: description || null,
        content_url: contentUrl,
        content_type: contentType,
        is_premium: isPremium,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Create content error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create content'
      });
    }

    // Increment creator's media count
    await supabase.rpc('increment_creator_media_count', {
      creator_id_in: creatorId,
      amount: 1
    });

    res.status(201).json({
      success: true,
      message: 'Content created successfully',
      data: content
    });

  } catch (error) {
    console.error('Create content error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Like/Unlike content
router.post('/:contentId/like', authenticateToken, async (req, res) => {
  try {
    const { contentId } = req.params;
    const userId = req.user.id;

    // Check if content exists
    const { data: content, error: contentError } = await supabase
      .from('content')
      .select('id')
      .eq('id', contentId)
      .single();

    if (contentError || !content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Check if user already liked this content
    const { data: existingLike, error: likeError } = await supabase
      .from('content_likes')
      .select('id')
      .eq('content_id', contentId)
      .eq('user_id', userId)
      .single();

    if (existingLike) {
      // Unlike - remove the like
      const { error: deleteError } = await supabase
        .from('content_likes')
        .delete()
        .eq('id', existingLike.id);

      if (deleteError) {
        console.error('Unlike error:', deleteError);
        return res.status(500).json({
          success: false,
          message: 'Failed to unlike content'
        });
      }

      // Decrement creator's total likes
      await supabase.rpc('decrement_creator_likes', {
        creator_id_in: content.creator_id,
        amount: 1
      });

      // Get updated like count
      const { count: totalLikes } = await supabase
        .from('content_likes')
        .select('*', { count: 'exact' })
        .eq('content_id', contentId);

      res.json({
        success: true,
        message: 'Content unliked',
        data: {
          isLiked: false,
          totalLikes: totalLikes || 0
        }
      });

    } else {
      // Like - add new like
      const { error: insertError } = await supabase
        .from('content_likes')
        .insert([{
          content_id: contentId,
          user_id: userId,
          created_at: new Date().toISOString()
        }]);

      if (insertError) {
        console.error('Like error:', insertError);
        return res.status(500).json({
          success: false,
          message: 'Failed to like content'
        });
      }

      // Increment creator's total likes
      await supabase.rpc('increment_creator_likes', {
        creator_id_in: content.creator_id,
        amount: 1
      });

      // Get updated like count
      const { count: totalLikes } = await supabase
        .from('content_likes')
        .select('*', { count: 'exact' })
        .eq('content_id', contentId);

      res.json({
        success: true,
        message: 'Content liked',
        data: {
          isLiked: true,
          totalLikes: totalLikes || 0
        }
      });
    }

  } catch (error) {
    console.error('Like/Unlike error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get content likes
router.get('/:contentId/likes', async (req, res) => {
  try {
    const { contentId } = req.params;

    const { count: totalLikes, error } = await supabase
      .from('content_likes')
      .select('*', { count: 'exact' })
      .eq('content_id', contentId);

    if (error) {
      console.error('Get likes error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch likes'
      });
    }

    res.json({
      success: true,
      data: {
        totalLikes: totalLikes || 0
      }
    });

  } catch (error) {
    console.error('Get likes error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Error handling middleware for multer errors
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    console.error('Multer error:', error);
    return res.status(400).json({
      success: false,
      message: `File upload error: ${error.message}`,
      debug: { code: error.code, field: error.field }
    });
  } else if (error) {
    console.error('Unknown error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Unknown error occurred',
      debug: { error: error.toString() }
    });
  }
  next();
});

module.exports = router;