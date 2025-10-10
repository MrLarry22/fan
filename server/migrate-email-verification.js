const supabase = require('./config/database');

async function runEmailVerificationMigration() {
  try {
    console.log('Running email verification migration...');

    // Add email verification columns
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE profiles 
        ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS verification_token TEXT,
        ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP WITH TIME ZONE;
      `
    });

    if (alterError) {
      console.error('Error adding columns:', alterError);
      return;
    }

    console.log('Successfully added email verification columns');

    // Create index
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `CREATE INDEX IF NOT EXISTS idx_profiles_verification_token ON profiles(verification_token);`
    });

    if (indexError) {
      console.error('Error creating index:', indexError);
      return;
    }

    console.log('Successfully created verification token index');
    console.log('Email verification migration completed successfully!');

  } catch (error) {
    console.error('Migration failed:', error);
  }
}

runEmailVerificationMigration();
