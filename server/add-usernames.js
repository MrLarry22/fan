const supabase = require('./config/database');

async function addUsernames() {
  try {
    console.log('Fetching all creators...');
    
    // First, check if username column exists
    const { data: creators, error: fetchError } = await supabase
      .from('creators')
      .select('*');

    if (fetchError) {
      console.error('Error fetching creators:', fetchError);
      return;
    }

    console.log(`Found ${creators.length} creators`);

    // Add username column if it doesn't exist (this will fail if already exists, which is fine)
    try {
      const { error: alterError } = await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE creators ADD COLUMN username TEXT UNIQUE'
      });
      if (alterError && !alterError.message.includes('already exists')) {
        console.log('Could not add username column via RPC:', alterError.message);
      } else {
        console.log('Username column added or already exists');
      }
    } catch (err) {
      console.log('Username column might already exist or cannot be added via RPC');
    }

    // Update each creator with a username
    for (const creator of creators) {
      let username = creator.display_name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 20);
      
      // Ensure uniqueness
      let finalUsername = username;
      let counter = 1;
      
      while (true) {
        const { data: existing } = await supabase
          .from('creators')
          .select('id')
          .eq('username', finalUsername)
          .single();
        
        if (!existing) break;
        
        finalUsername = `${username}${counter}`;
        counter++;
      }

      const { error: updateError } = await supabase
        .from('creators')
        .update({ username: finalUsername })
        .eq('id', creator.id);

      if (updateError) {
        console.error(`Error updating creator ${creator.id}:`, updateError);
      } else {
        console.log(`Updated creator ${creator.display_name} with username: ${finalUsername}`);
      }
    }

    console.log('Finished updating usernames');

  } catch (error) {
    console.error('Error in addUsernames:', error);
  }
}

addUsernames();
