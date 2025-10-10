const fetch = require('node-fetch');

async function fixCreatorFolderNames() {
  try {
    console.log('Fixing creator folder names...');
    
    const response = await fetch('http://localhost:5000/api/content/fix-folder-names', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ ${result.message}`);
      console.log(`Fixed ${result.fixed} creators`);
    } else {
      console.error('❌ Failed to fix creator names:', result.message);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the fix
fixCreatorFolderNames();
