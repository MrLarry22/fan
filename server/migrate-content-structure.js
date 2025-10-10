const fs = require('fs');
const path = require('path');

// Migration script to move content from /uploads/content/creatorname/ to /uploads/creators/creatorname/content/

function migrateContentStructure() {
  console.log('🚀 Starting content structure migration...\n');
  
  const uploadsDir = path.join(__dirname, 'uploads');
  const oldContentDir = path.join(uploadsDir, 'content');
  const creatorsDir = path.join(uploadsDir, 'creators');
  
  // Check if old content directory exists
  if (!fs.existsSync(oldContentDir)) {
    console.log('ℹ️  No old content directory found. Migration not needed.');
    return;
  }
  
  // Get list of creator folders from old content directory
  const creatorFolders = fs.readdirSync(oldContentDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  if (creatorFolders.length === 0) {
    console.log('ℹ️  No creator folders found in old content directory.');
    return;
  }
  
  console.log(`📁 Found ${creatorFolders.length} creator folders to migrate:`);
  creatorFolders.forEach(folder => console.log(`   - ${folder}`));
  console.log();
  
  let migratedCount = 0;
  let skippedCount = 0;
  
  // Process each creator folder
  for (const creatorFolder of creatorFolders) {
    console.log(`📂 Processing creator: ${creatorFolder}`);
    
    const oldCreatorContentPath = path.join(oldContentDir, creatorFolder);
    const newCreatorDir = path.join(creatorsDir, creatorFolder);
    const newCreatorContentDir = path.join(newCreatorDir, 'content');
    
    try {
      // Create the new creator directory if it doesn't exist
      if (!fs.existsSync(newCreatorDir)) {
        console.log(`   📁 Creating creator directory: ${creatorFolder}`);
        fs.mkdirSync(newCreatorDir, { recursive: true });
      }
      
      // Create the content subdirectory
      if (!fs.existsSync(newCreatorContentDir)) {
        console.log(`   📁 Creating content directory: ${creatorFolder}/content`);
        fs.mkdirSync(newCreatorContentDir, { recursive: true });
      }
      
      // Get list of files to move
      const files = fs.readdirSync(oldCreatorContentPath, { withFileTypes: true })
        .filter(dirent => dirent.isFile())
        .map(dirent => dirent.name);
      
      if (files.length === 0) {
        console.log(`   ⚠️  No files found in ${creatorFolder}`);
        skippedCount++;
        continue;
      }
      
      console.log(`   📄 Moving ${files.length} files...`);
      
      // Move each file
      for (const file of files) {
        const oldFilePath = path.join(oldCreatorContentPath, file);
        const newFilePath = path.join(newCreatorContentDir, file);
        
        // Check if file already exists in destination
        if (fs.existsSync(newFilePath)) {
          console.log(`   ⚠️  File already exists, skipping: ${file}`);
          continue;
        }
        
        // Move the file
        fs.renameSync(oldFilePath, newFilePath);
        console.log(`   ✅ Moved: ${file}`);
      }
      
      // Remove the old creator content directory if it's empty
      const remainingFiles = fs.readdirSync(oldCreatorContentPath);
      if (remainingFiles.length === 0) {
        fs.rmdirSync(oldCreatorContentPath);
        console.log(`   🗑️  Removed empty directory: ${creatorFolder}`);
      }
      
      migratedCount++;
      console.log(`   ✅ Successfully migrated creator: ${creatorFolder}\n`);
      
    } catch (error) {
      console.error(`   ❌ Error migrating ${creatorFolder}:`, error.message);
      skippedCount++;
    }
  }
  
  // Clean up empty old content directory
  try {
    const remainingItems = fs.readdirSync(oldContentDir);
    if (remainingItems.length === 0) {
      fs.rmdirSync(oldContentDir);
      console.log('🗑️  Removed empty old content directory\n');
    } else {
      console.log(`⚠️  Old content directory still contains ${remainingItems.length} items\n`);
    }
  } catch (error) {
    console.error('❌ Error cleaning up old content directory:', error.message);
  }
  
  // Summary
  console.log('📊 Migration Summary:');
  console.log(`   ✅ Successfully migrated: ${migratedCount} creators`);
  console.log(`   ⚠️  Skipped: ${skippedCount} creators`);
  console.log(`   📁 New structure: /uploads/creators/{creatorname}/content/`);
  
  if (migratedCount > 0) {
    console.log('\n🎉 Content structure migration completed successfully!');
    console.log('💡 You may need to update any database records that reference the old content URLs.');
  }
}

// Run the migration
if (require.main === module) {
  migrateContentStructure();
}

module.exports = { migrateContentStructure };
