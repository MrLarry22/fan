const express = require('express');
const { body, validationResult } = require('express-validator');
const supabase = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Subscribe to creator (PayPal integration)
router.post('/subscribe', [
  authenticateToken,
  body('creatorId').notEmpty(),
  body('paypalSubscriptionId').optional().trim()
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

    const { creatorId, paypalSubscriptionId } = req.body;
    const userId = req.user.id;

    // Check if creator exists
    const { data: creator, error: creatorError } = await supabase
      .from('creators')
      .select('*')
      .eq('id', creatorId)
      .single();

    if (creatorError || !creator) {
      return res.status(404).json({
        success: false,
        message: 'Creator not found'
      });
    }

    // Check if user already has an active subscription
    const { data: existingSubscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('creator_id', creatorId)
      .eq('status', 'active')
      .single();

    if (existingSubscription) {
      return res.status(409).json({
        success: false,
        message: 'You already have an active subscription to this creator'
      });
    }

    // Create subscription record
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

    const { data: subscription, error: insertError } = await supabase
      .from('subscriptions')
      .insert([{
        user_id: userId,
        creator_id: creatorId,
        paypal_subscription_id: paypalSubscriptionId || null,
        status: 'active',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        amount: 5.00, // $5 per month
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (insertError) {
      console.error('Create subscription error:', insertError);
      return res.status(500).json({
        success: false,
        message: 'Failed to create subscription'
      });
    }

    // Update creator's subscriber count
    await supabase
      .from('creators')
      .update({ 
        total_subscribers: creator.total_subscribers + 1,
        total_revenue: creator.total_revenue + 5.00
      })
      .eq('id', creatorId);

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: {
        subscription,
        creator: {
          id: creator.id,
          displayName: creator.display_name,
          avatarUrl: creator.avatar_url
        }
      }
    });

  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user's subscriptions
router.get('/my-subscriptions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        creators (
          id,
          display_name,
          avatar_url,
          bio
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch subscriptions error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch subscriptions'
      });
    }

    res.json({
      success: true,
      data: subscriptions || []
    });

  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Cancel subscription
router.post('/cancel/:subscriptionId', authenticateToken, async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const userId = req.user.id;

    // Get subscription
    const { data: subscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    if (subscription.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Subscription is already cancelled'
      });
    }

    // Update subscription status
    const { data: updatedSubscription, error: updateError } = await supabase
      .from('subscriptions')
      .update({ 
        status: 'cancelled',
        end_date: new Date().toISOString() // End immediately
      })
      .eq('id', subscriptionId)
      .select()
      .single();

    if (updateError) {
      console.error('Cancel subscription error:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to cancel subscription'
      });
    }

    // Update creator's subscriber count
    const { data: creator } = await supabase
      .from('creators')
      .select('total_subscribers')
      .eq('id', subscription.creator_id)
      .single();

    if (creator && creator.total_subscribers > 0) {
      await supabase
        .from('creators')
        .update({ total_subscribers: creator.total_subscribers - 1 })
        .eq('id', subscription.creator_id);
    }

    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
      data: updatedSubscription
    });

  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Check subscription status for a creator
router.get('/status/:creatorId', authenticateToken, async (req, res) => {
  try {
    const { creatorId } = req.params;
    const userId = req.user.id;

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('creator_id', creatorId)
      .eq('status', 'active')
      .gte('end_date', new Date().toISOString())
      .single();

    const isSubscribed = !!subscription && !error;

    res.json({
      success: true,
      data: {
        isSubscribed,
        subscription: isSubscribed ? subscription : null
      }
    });

  } catch (error) {
    console.error('Check subscription status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;