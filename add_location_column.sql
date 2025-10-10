-- SQL Script to Add Location Column to Creators Table
-- Run this in your Supabase SQL Editor Dashboard

-- Add location column to creators table
ALTER TABLE creators ADD COLUMN IF NOT EXISTS location TEXT;

-- Verify the change
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'creators' 
AND column_name = 'location';
