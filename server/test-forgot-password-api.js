const http = require('http');

// Test the forgot password API endpoint
async function testForgotPasswordAPI() {
  console.log('🧪 Testing Forgot Password API Endpoint');
  console.log('=' .repeat(50));
  
  const postData = JSON.stringify({
    email: 'kimberlytichenor48@gmail.com'
  });
  
  const options = {
    hostname: 'localhost',
    port: 5001,
    path: '/api/auth/forgot-password',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  return new Promise((resolve, reject) => {
    console.log('📤 Making POST request to /api/auth/forgot-password');
    console.log('📧 Email:', 'kimberlytichenor48@gmail.com');
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('\n📨 Response:');
        console.log('Status Code:', res.statusCode);
        console.log('Response Body:', data);
        
        try {
          const responseData = JSON.parse(data);
          if (responseData.success) {
            console.log('\n✅ Forgot password API test successful!');
            console.log('💌 Check your email for the reset link');
          } else {
            console.log('\n❌ API returned error:', responseData.message);
          }
          resolve(responseData);
        } catch (err) {
          console.log('\n❌ Failed to parse response:', data);
          reject(err);
        }
      });
    });
    
    req.on('error', (err) => {
      console.log('\n🔌 Connection error - make sure the server is running on port 5001');
      console.log('Error:', err.message);
      console.log('\n💡 To start the server:');
      console.log('   cd server');
      console.log('   node server.js');
      reject(err);
    });
    
    req.write(postData);
    req.end();
  });
}

// Run the test
testForgotPasswordAPI()
  .then(() => {
    console.log('\n🎉 Test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test failed:', error.message);
    process.exit(1);
  });
