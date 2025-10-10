const http = require('http');
const fs = require('fs');
const path = require('path');

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = http.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
}

async function diagnoseSystem() {
  console.log('🔍 Diagnosing Fanview Content Upload System\n');
  
  try {
    // 1. Check server health
    console.log('1. Server Health Check');
    console.log('   Checking http://localhost:5000/health...');
    
    const healthResponse = await makeRequest('http://localhost:5000/health');
    const healthData = healthResponse.data;
    
    if (healthData.success) {
      console.log('   ✅ Server is running');
      console.log(`   📊 Environment: ${healthData.environment}`);
      console.log(`   🕐 Timestamp: ${healthData.timestamp}`);
    } else {
      console.log('   ❌ Server health check failed');
      return;
    }
    
    // 2. Check creators
    console.log('\n2. Creators Check');
    console.log('   Fetching creators...');
    
    const creatorsResponse = await makeRequest('http://localhost:5000/api/creators');
    const creatorsData = creatorsResponse.data;
    
    if (creatorsData.success && creatorsData.data) {
      console.log(`   ✅ Found ${creatorsData.data.length} creators`);
      
      creatorsData.data.forEach((creator, index) => {
        console.log(`   ${index + 1}. ${creator.display_name} (ID: ${creator.id})`);
        console.log(`      - Subscribers: ${creator.total_subscribers || 0}`);
        console.log(`      - Active: ${creator.is_active ? 'Yes' : 'No'}`);
        console.log(`      - Avatar: ${creator.avatar_url ? 'Set' : 'Not set'}`);
      });
    } else {
      console.log('   ❌ No creators found or error fetching creators');
      console.log('   ℹ️  You need to create at least one creator before uploading content');
    }
    
    // 3. Check if content upload endpoint is accessible
    console.log('\n3. Content Upload Endpoint Check');
    console.log('   Testing OPTIONS request to /api/content/upload...');
    
    try {
      const optionsResponse = await makeRequest('http://localhost:5000/api/content/upload', {
        method: 'OPTIONS'
      });
      console.log(`   ✅ Content upload endpoint is accessible (Status: ${optionsResponse.status})`);
    } catch (error) {
      console.log('   ❌ Content upload endpoint is not accessible');
      console.log(`   Error: ${error.message}`);
    }
    
    // 4. Check upload directories
    console.log('\n4. Upload Directories Check');
    
    const uploadsDir = path.join(__dirname, 'uploads');
    const tempDir = path.join(uploadsDir, 'temp');
    const creatorsDir = path.join(uploadsDir, 'creators');
    
    console.log('   Checking upload directories...');
    
    [
      { name: 'uploads', path: uploadsDir },
      { name: 'uploads/temp', path: tempDir },
      { name: 'uploads/creators', path: creatorsDir }
    ].forEach(dir => {
      if (fs.existsSync(dir.path)) {
        const stats = fs.statSync(dir.path);
        console.log(`   ✅ ${dir.name} exists (${stats.isDirectory() ? 'directory' : 'file'})`);
      } else {
        console.log(`   ⚠️  ${dir.name} does not exist`);
      }
    });
    
    console.log('\n📋 Diagnosis Summary:');
    console.log('   - If server is running and creators exist, content upload should work');
    console.log('   - Check browser console for detailed error messages');
    console.log('   - Check server logs when attempting to upload');
    console.log('   - Make sure the selected creator has the correct ID');
    
  } catch (error) {
    console.error('\n❌ Diagnosis failed:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('   1. Make sure the server is running: npm start in server directory');
    console.log('   2. Check that port 5000 is not blocked');
    console.log('   3. Verify database connection');
  }
}

// Run diagnosis
diagnoseSystem();
