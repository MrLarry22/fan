const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addEmailVerificationColumns() {
  try {
    console.log('Adding email verification columns to profiles table...');
    
    // First, let's check current table structure
    const { data: tableInfo, error: tableError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('Error checking table:', tableError);
      return;
    }
    
    console.log('Current profiles table structure exists');
    
    // For now, let's update existing profiles to have email_verified = false
    // The new columns will be added manually via Supabase dashboard
    const { data: profiles, error: selectError } = await supabase
      .from('profiles')
      .select('id, email');
    
    if (selectError) {
      console.error('Error fetching profiles:', selectError);
      return;
    }
    
    console.log(`Found ${profiles?.length || 0} profiles in the database`);
    console.log('Please add the following columns to the profiles table via Supabase dashboard:');
    console.log('1. email_verified: boolean (default: false)');
    console.log('2. verification_token: text (nullable)');
    console.log('3. verification_token_expires: timestamp with time zone (nullable)');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

addEmailVerificationColumns();
