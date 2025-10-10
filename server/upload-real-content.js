const http = require('http');
const fs = require('fs');
const path = require('path');

async function uploadRealContent() {
  try {
    console.log('🖼️ Uploading real content...\n');
    
    // Use the JPG image we created
    const imagePath = path.join(__dirname, 'test-image.jpg');
    
    if (!fs.existsSync(imagePath)) {
      console.error('Test image not found. Run create-test-image.js first');
      return;
    }

    const creatorId = '7fa78969-bb75-4f25-8a4f-c1fb134b05d0'; // myha jane
    
    // Create form data
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substr(2, 9);
    const imageContent = fs.readFileSync(imagePath);
    
    let body = '';
    
    // Add form fields
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="creatorId"\r\n\r\n`;
    body += `${creatorId}\r\n`;
    
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="title"\r\n\r\n`;
    body += `Beautiful Sunset Photo\r\n`;
    
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="description"\r\n\r\n`;
    body += `A stunning sunset captured during golden hour. This premium content showcases the beauty of natural lighting and scenic landscapes.\r\n`;
    
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="isPremium"\r\n\r\n`;
    body += `false\r\n`;
    
    // Add file
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="contentFile"; filename="sunset.jpg"\r\n`;
    body += `Content-Type: image/jpeg\r\n\r\n`;
    
    const bodyBuffer = Buffer.concat([
      Buffer.from(body),
      imageContent,
      Buffer.from(`\r\n--${boundary}--\r\n`)
    ]);

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/content/upload',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': bodyBuffer.length
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response:', JSON.parse(data));
      });
    });

    req.on('error', (error) => {
      console.error('Upload error:', error);
    });

    req.write(bodyBuffer);
    req.end();

  } catch (error) {
    console.error('Error:', error);
  }
}

uploadRealContent();
