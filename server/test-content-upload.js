const http = require('http');
const fs = require('fs');
const path = require('path');

// Simple multipart form data creation
function createMultipartData(fields, files) {
  const boundary = '----WebKitFormBoundary' + Math.random().toString(16).substring(2);
  let body = '';
  
  // Add text fields
  for (const [key, value] of Object.entries(fields)) {
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="${key}"\r\n\r\n`;
    body += `${value}\r\n`;
  }
  
  // Add file fields
  for (const [key, filePath] of Object.entries(files)) {
    const fileContent = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="${key}"; filename="${fileName}"\r\n`;
    body += `Content-Type: image/jpeg\r\n\r\n`;
    body += fileContent.toString('binary');
    body += '\r\n';
  }
  
  body += `--${boundary}--\r\n`;
  
  return {
    body: Buffer.from(body, 'binary'),
    contentType: `multipart/form-data; boundary=${boundary}`
  };
}

async function testContentUpload() {
  console.log('🧪 Testing content upload...\n');
  
  try {
    // Create a test image file
    console.log('1. Creating test image...');
    const testImagePath = path.join(__dirname, 'test-upload.jpg');
    
    // Create a minimal JPEG file
    const minimalJpeg = Buffer.from([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48,
      0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08,
      0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
      0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20, 0x24, 0x2E, 0x27, 0x20,
      0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29, 0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27,
      0x39, 0x3D, 0x38, 0x32, 0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x11, 0x08, 0x00, 0x01,
      0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01, 0xFF, 0xC4, 0x00, 0x14,
      0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x08, 0xFF, 0xC4, 0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xDA, 0x00, 0x0C, 0x03, 0x01, 0x00, 0x02,
      0x11, 0x03, 0x11, 0x00, 0x3F, 0x00, 0xB2, 0xC0, 0x07, 0xFF, 0xD9
    ]);
    
    fs.writeFileSync(testImagePath, minimalJpeg);
    console.log('✅ Test image created');
    
    // Use the first creator ID from the diagnosis
    const creatorId = '7fa78969-bb75-4f25-8a4f-c1fb134b05d0'; // myha jane
    
    // Prepare form data
    console.log('2. Preparing upload data...');
    const formData = createMultipartData(
      {
        creatorId: creatorId,
        title: 'Test Content Upload',
        description: 'Testing content upload functionality',
        isPremium: 'true'
      },
      {
        contentFile: testImagePath
      }
    );
    
    console.log('3. Uploading content...');
    
    // Make the request
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/content/upload',
      method: 'POST',
      headers: {
        'Content-Type': formData.contentType,
        'Content-Length': formData.body.length
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          
          if (result.success) {
            console.log('✅ Content upload successful!');
            console.log('📄 Content details:');
            console.log(`   ID: ${result.data.id}`);
            console.log(`   Title: ${result.data.title}`);
            console.log(`   URL: ${result.data.content_url}`);
            console.log(`   Type: ${result.data.content_type}`);
          } else {
            console.log('❌ Content upload failed:', result.message);
          }
        } catch (e) {
          console.log('❌ Failed to parse response:', data);
        }
        
        // Cleanup
        try {
          fs.unlinkSync(testImagePath);
          console.log('🧹 Test file cleaned up');
        } catch (err) {
          console.log('⚠️ Could not clean up test file');
        }
      });
    });
    
    req.on('error', (err) => {
      console.log('❌ Request failed:', err.message);
    });
    
    req.write(formData.body);
    req.end();
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testContentUpload();
