const express = require('express');
const { body, validationResult } = require('express-validator');
const supabase = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get wallet balance and transactions
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get or create wallet
    let { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (walletError && walletError.code === 'PGRST116') {
      // Wallet doesn't exist, create one
      const { data: newWallet, error: createError } = await supabase
        .from('wallets')
        .insert([{
          user_id: userId,
          balance: 0.00,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (createError) {
        console.error('Create wallet error:', createError);
        return res.status(500).json({
          success: false,
          message: 'Failed to create wallet'
        });
      }

      wallet = newWallet;
    } else if (walletError) {
      console.error('Fetch wallet error:', walletError);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch wallet'
      });
    }

    // Get recent transactions
    const { data: transactions, error: transError } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (transError) {
      console.error('Fetch transactions error:', transError);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch transactions'
      });
    }

    res.json({
      success: true,
      data: {
        wallet,
        transactions: transactions || []
      }
    });

  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Add credits to wallet (PayPal top-up)
router.post('/topup', [
  authenticateToken,
  body('amount').isFloat({ min: 1, max: 1000 }),
  body('paypalTransactionId').optional().trim()
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

    const { amount, paypalTransactionId } = req.body;
    const userId = req.user.id;

    // Get current wallet
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (walletError) {
      console.error('Fetch wallet error:', walletError);
      return res.status(500).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    // Update wallet balance
    const newBalance = parseFloat(wallet.balance) + parseFloat(amount);
    
    const { data: updatedWallet, error: updateError } = await supabase
      .from('wallets')
      .update({ 
        balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Update wallet error:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to update wallet balance'
      });
    }

    // Create transaction record
    const { data: transaction, error: transError } = await supabase
      .from('wallet_transactions')
      .insert([{
        user_id: userId,
        type: 'topup',
        amount: parseFloat(amount),
        description: 'PayPal Top-up',
        paypal_transaction_id: paypalTransactionId || null,
        status: 'completed',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (transError) {
      console.error('Create transaction error:', transError);
      // Don't fail the request if transaction logging fails
    }

    res.json({
      success: true,
      message: 'Wallet topped up successfully',
      data: {
        wallet: updatedWallet,
        transaction
      }
    });

  } catch (error) {
    console.error('Wallet topup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get transaction history
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { data: transactions, error } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (error) {
      console.error('Fetch transactions error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch transactions'
      });
    }

    res.json({
      success: true,
      data: {
        transactions: transactions || [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          hasMore: transactions && transactions.length === parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;