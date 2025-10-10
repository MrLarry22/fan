const http = require('http');
const fs = require('fs');
const path = require('path');

async function uploadForDifferentCreator() {
  try {
    console.log('📸 Uploading content for Alicia...\n');
    
    const imagePath = path.join(__dirname, 'test-image.jpg');
    const creatorId = 'ade7e373-098d-4cce-a8c5-925b8ec386fd'; // Alicia
    
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substr(2, 9);
    const imageContent = fs.readFileSync(imagePath);
    
    let body = '';
    
    // Add form fields
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="creatorId"\r\n\r\n`;
    body += `${creatorId}\r\n`;
    
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="title"\r\n\r\n`;
    body += `Fashion Portrait Session\r\n`;
    
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="description"\r\n\r\n`;
    body += `Behind the scenes from my latest fashion photoshoot. Get exclusive access to professional modeling content and styling tips!\r\n`;
    
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="isPremium"\r\n\r\n`;
    body += `true\r\n`;
    
    // Add file
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="contentFile"; filename="fashion.jpg"\r\n`;
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
        const response = JSON.parse(data);
        console.log('Response:', response);
        
        if (response.success) {
          console.log('\n✅ Content uploaded successfully!');
          console.log('🔗 URL:', response.data.content_url);
          console.log('🏷️ Title:', response.data.title);
          console.log('📝 Description:', response.data.description);
          console.log('💎 Premium:', response.data.is_premium);
        }
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

uploadForDifferentCreator();
