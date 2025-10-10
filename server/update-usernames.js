const supabase = require('./config/database');

async function updateCreatorsWithUsernames() {
  try {
    console.log('Fetching creators...');
    const { data: creators, error } = await supabase.from('creators').select('*');
    if (error) throw error;
    
    console.log('Creators found:', creators.map(c => ({id: c.id, name: c.display_name})));
    
    // Update each creator with username manually
    for (let i = 0; i < creators.length; i++) {
      const creator = creators[i];
      const username = creator.display_name.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      console.log(`Attempting to update creator ${creator.id} with username: ${username}`);
      
      const { error: updateError } = await supabase
        .from('creators')
        .update({ username: username })
        .eq('id', creator.id);
        
      if (updateError) {
        console.log('Update error for', creator.id, ':', updateError.message);
      } else {
        console.log('Successfully updated', creator.display_name, 'with username:', username);
      }
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

updateCreatorsWithUsernames();
