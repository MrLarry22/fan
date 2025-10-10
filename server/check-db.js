const supabase = require('./config/database');

async function checkDatabase() {
  console.log('🔍 Checking database connection and creators...\n');
  
  try {
    // Test database connection
    console.log('1. Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('creators')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.log('❌ Database connection failed:', testError.message);
      return;
    }
    
    console.log('✅ Database connection successful');
    
    // Check creators table
    console.log('\n2. Checking creators table...');
    const { data: creators, error: creatorsError } = await supabase
      .from('creators')
      .select('*');
    
    if (creatorsError) {
      console.log('❌ Error fetching creators:', creatorsError.message);
      return;
    }
    
    if (!creators || creators.length === 0) {
      console.log('⚠️  No creators found in database');
      console.log('   This is why content upload fails - you need at least one creator');
      console.log('   Go to your admin dashboard and create a creator first');
    } else {
      console.log(`✅ Found ${creators.length} creators:`);
      creators.forEach((creator, index) => {
        console.log(`   ${index + 1}. ${creator.display_name} (ID: ${creator.id})`);
        console.log(`      - Active: ${creator.is_active}`);
        console.log(`      - Folder: ${creator.folder_name || 'Not set'}`);
        console.log(`      - Created: ${creator.created_at}`);
      });
    }
    
    // Check if the folder_name column exists
    console.log('\n3. Checking database schema...');
    const { data: schemaTest, error: schemaError } = await supabase
      .from('creators')
      .select('folder_name')
      .limit(1);
    
    if (schemaError && schemaError.message.includes('column')) {
      console.log('❌ Database schema issue: folder_name column missing');
      console.log('   You need to run the migration to add the folder_name column');
    } else {
      console.log('✅ Database schema looks good');
    }
    
  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

checkDatabase();
