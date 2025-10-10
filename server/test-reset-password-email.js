const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const EmailService = require('./services/emailService');

async function testPasswordResetEmail() {
  console.log('🧪 Testing Password Reset Email Functionality');
  console.log('=' .repeat(50));
  
  try {
    // EmailService is already initialized as a singleton
    const emailService = EmailService;
    
    // Wait a moment for the connection test to complete
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('\n📧 Testing password reset email...');
    
    // Test email details
    const testEmail = 'kimberlytichenor48@gmail.com'; // Sending to same email for testing
    const testName = 'Kimberly';
    const testToken = 'test-reset-token-' + Date.now();
    
    console.log(`📬 Sending test reset email to: ${testEmail}`);
    console.log(`👤 Name: ${testName}`);
    console.log(`🔑 Reset Token: ${testToken}`);
    
    // Send the password reset email
    const result = await emailService.sendPasswordResetEmail(testEmail, testName, testToken);
    
    console.log('\n✅ Password reset email test completed successfully!');
    console.log('📧 Message ID:', result.messageId);
    
    // Show the reset link that would be generated
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetLink = `${baseUrl}/reset-password/${testToken}`;
    console.log('🔗 Reset link:', resetLink);
    
  } catch (error) {
    console.error('\n❌ Password reset email test failed:');
    console.error('Error:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n💡 Authentication error troubleshooting:');
      console.log('1. ✓ Make sure 2-factor authentication is enabled on Gmail');
      console.log('2. ✓ Use an App Password instead of your regular password');
      console.log('3. ✓ Generate App Password: Google Account → Security → App passwords');
      console.log('4. ✓ Use the 16-character App Password in EMAIL_PASS');
    }
    
    process.exit(1);
  }
}

// Run the test
testPasswordResetEmail().then(() => {
  console.log('\n🎉 Test completed! Check your email inbox.');
  process.exit(0);
}).catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});
