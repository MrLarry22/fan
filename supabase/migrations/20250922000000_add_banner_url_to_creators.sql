-- Add banner_url column to creators table
ALTER TABLE creators ADD COLUMN IF NOT EXISTS banner_url TEXT;