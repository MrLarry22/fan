-- Add location column to creators table
ALTER TABLE creators ADD COLUMN IF NOT EXISTS location TEXT;
