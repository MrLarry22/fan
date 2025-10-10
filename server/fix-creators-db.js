const supabase = require('./config/database');
const crypto = require('crypto');

async function fixCreatorsDatabase() {
  console.log('🔧 Fixing creators database schema and data...\n');
  
  try {
    // Step 1: Check if folder_name column exists
    console.log('1. Checking if folder_name column exists...');
    const { data: schemaTest, error: schemaError } = await supabase
      .from('creators')
      .select('folder_name')
      .limit(1);
    
    if (schemaError && schemaError.message.includes('column')) {
      console.log('❌ folder_name column is missing');
      console.log('⚠️  Unfortunately, we cannot add database columns through the API');
      console.log('🛠️  You need to run this SQL in your Supabase dashboard:');
      console.log('');
      console.log('   ALTER TABLE creators ADD COLUMN folder_name VARCHAR(50);');
      console.log('   CREATE INDEX idx_creators_folder_name ON creators(folder_name);');
      console.log('');
      console.log('📋 Steps to fix:');
      console.log('   1. Go to your Supabase dashboard');
      console.log('   2. Navigate to SQL Editor');
      console.log('   3. Run the SQL above');
      console.log('   4. Then run this script again');
      return;
    }
    
    console.log('✅ folder_name column exists');
    
    // Step 2: Get creators without folder names
    console.log('\n2. Checking creators without folder names...');
    const { data: creators, error: creatorsError } = await supabase
      .from('creators')
      .select('id, display_name, folder_name')
      .is('folder_name', null);
    
    if (creatorsError) {
      console.log('❌ Error fetching creators:', creatorsError.message);
      return;
    }
    
    if (!creators || creators.length === 0) {
      console.log('✅ All creators already have folder names');
      return;
    }
    
    console.log(`⚠️  Found ${creators.length} creators without folder names`);
    
    // Step 3: Fix each creator
    console.log('\n3. Adding folder names to creators...');
    let fixed = 0;
    
    for (const creator of creators) {
      try {
        const sanitizedName = creator.display_name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);
        const uniqueSuffix = crypto.randomBytes(2).toString('hex');
        const folderName = `${sanitizedName}-${uniqueSuffix}`;
        
        const { error: updateError } = await supabase
          .from('creators')
          .update({ folder_name: folderName })
          .eq('id', creator.id);
        
        if (updateError) {
          console.log(`   ❌ Failed to update ${creator.display_name}: ${updateError.message}`);
        } else {
          console.log(`   ✅ Updated ${creator.display_name} -> ${folderName}`);
          fixed++;
        }
      } catch (err) {
        console.log(`   ❌ Error processing ${creator.display_name}: ${err.message}`);
      }
    }
    
    console.log(`\n🎉 Successfully updated ${fixed} creators!`);
    console.log('💡 Content upload should now work properly');
    
  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

fixCreatorsDatabase();
