-- Add username column to creators table
ALTER TABLE creators ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Update existing creators with usernames based on display_name
UPDATE creators 
SET username = LOWER(REGEXP_REPLACE(display_name, '[^a-zA-Z0-9]', '', 'g'))
WHERE username IS NULL;

-- Handle potential duplicates by adding numbers
DO $$
DECLARE
    creator_record RECORD;
    base_username TEXT;
    final_username TEXT;
    counter INTEGER;
BEGIN
    FOR creator_record IN 
        SELECT id, display_name 
        FROM creators 
        WHERE username IS NULL OR username = ''
    LOOP
        base_username := LOWER(REGEXP_REPLACE(creator_record.display_name, '[^a-zA-Z0-9]', '', 'g'));
        final_username := base_username;
        counter := 1;
        
        -- Check for uniqueness
        WHILE EXISTS (SELECT 1 FROM creators WHERE username = final_username AND id != creator_record.id) LOOP
            final_username := base_username || counter::TEXT;
            counter := counter + 1;
        END LOOP;
        
        UPDATE creators 
        SET username = final_username 
        WHERE id = creator_record.id;
    END LOOP;
END $$;
