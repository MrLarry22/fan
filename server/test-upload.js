const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testContentUpload() {
  try {
    console.log('🧪 Testing content upload functionality...');
    
    // Step 1: Check if server is running
    console.log('1. Checking server health...');
    const healthResponse = await fetch('http://localhost:5000/health');
    const healthData = await healthResponse.json();
    
    if (!healthData.success) {
      throw new Error('Server is not running properly');
    }
    console.log('✅ Server is healthy');
    
    // Step 2: Fix creator folder names
    console.log('2. Fixing creator folder names...');
    const fixResponse = await fetch('http://localhost:5000/api/content/fix-folder-names', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const fixResult = await fixResponse.json();
    console.log(`✅ ${fixResult.message}`);
    
    // Step 3: Get list of creators
    console.log('3. Getting creators list...');
    const creatorsResponse = await fetch('http://localhost:5000/api/creators');
    const creatorsData = await creatorsResponse.json();
    
    if (!creatorsData.success || !creatorsData.data || creatorsData.data.length === 0) {
      throw new Error('No creators found. Please create a creator first.');
    }
    
    const firstCreator = creatorsData.data[0];
    console.log(`✅ Found ${creatorsData.data.length} creators. Using: ${firstCreator.display_name} (ID: ${firstCreator.id})`);
    
    // Step 4: Create a test image file
    console.log('4. Creating test image file...');
    const testImagePath = path.join(__dirname, 'test-image.jpg');
    
    // Create a minimal JPEG file (1x1 pixel)
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
    
    // Step 5: Test content upload
    console.log('5. Testing content upload...');
    const formData = new FormData();
    formData.append('creatorId', firstCreator.id);
    formData.append('title', 'Test Content Upload');
    formData.append('description', 'This is a test upload to verify content upload functionality');
    formData.append('isPremium', 'true');
    formData.append('contentFile', fs.createReadStream(testImagePath));
    
    const uploadResponse = await fetch('http://localhost:5000/api/content/upload', {
      method: 'POST',
      body: formData
    });
    
    const uploadResult = await uploadResponse.json();
    
    if (uploadResult.success) {
      console.log('✅ Content upload successful!');
      console.log('Content details:', {
        id: uploadResult.data.id,
        title: uploadResult.data.title,
        url: uploadResult.data.content_url,
        type: uploadResult.data.content_type
      });
    } else {
      console.error('❌ Content upload failed:', uploadResult.message);
      throw new Error(`Upload failed: ${uploadResult.message}`);
    }
    
    // Cleanup
    console.log('6. Cleaning up test files...');
    try {
      fs.unlinkSync(testImagePath);
      console.log('✅ Test files cleaned up');
    } catch (err) {
      console.log('⚠️ Could not clean up test file:', err.message);
    }
    
    console.log('\n🎉 All tests passed! Content upload is working correctly.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testContentUpload();
