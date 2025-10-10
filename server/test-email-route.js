// Test email route - add this to your routes/auth.js temporarily
router.get('/test-email', async (req, res) => {
  try {
    const emailService = require('../services/emailService');
    
    // Send a test email
    const result = await emailService.sendTestEmail('paullawrenceobuya@gmail.com');
    
    res.json({
      success: true,
      message: 'Test email sent successfully!',
      result: result
    });
    
  } catch (error) {
    console.error('Test email failed:', error);
    res.status(500).json({
      success: false,
      message: 'Test email failed',
      error: error.message
    });
  }
});
