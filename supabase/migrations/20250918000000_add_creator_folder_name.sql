-- Add folder_name column to creators table for per-creator unique folders
ALTER TABLE creators ADD COLUMN folder_name VARCHAR(50);

-- Create index for faster lookups
CREATE INDEX idx_creators_folder_name ON creators(folder_name);

-- Add comment
COMMENT ON COLUMN creators.folder_name IS 'Unique folder name for creator assets (name-based with 4 unique chars)';
