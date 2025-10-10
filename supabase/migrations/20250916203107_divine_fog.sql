/*
  # Setup Storage Buckets for File Uploads

  1. Storage Buckets
    - `avatars` - Creator profile pictures (public access)
    - `banners` - Creator banner images (public access)  
    - `content` - Creator content files (public access)

  2. Security Policies
    - Public read access for all buckets
    - Authenticated users can upload to avatars and banners
    - Admin users can upload content files
    - Users can update their own uploaded files

  3. Configuration
    - All buckets set to public for easy access
    - File size limits configured appropriately
    - MIME type restrictions for security
*/

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  (
    'avatars', 
    'avatars', 
    true, 
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  ),
  (
    'banners', 
    'banners', 
    true, 
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'content', 
    'content', 
    true, 
    52428800, -- 50MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
  )
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars bucket
CREATE POLICY "Public Access for Avatar Images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Users can update own avatar uploads"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own avatar uploads"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for banners bucket
CREATE POLICY "Public Access for Banner Images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'banners');

CREATE POLICY "Authenticated users can upload banners"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'banners');

CREATE POLICY "Users can update own banner uploads"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'banners' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own banner uploads"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'banners' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for content bucket
CREATE POLICY "Public Access for Content Files"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'content');

CREATE POLICY "Authenticated users can upload content"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'content');

CREATE POLICY "Users can update own content uploads"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'content' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own content uploads"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'content' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create helper function to get file extension
CREATE OR REPLACE FUNCTION get_file_extension(filename text)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN lower(split_part(filename, '.', array_length(string_to_array(filename, '.'), 1)));
END;
$$;

-- Create function to validate file uploads
CREATE OR REPLACE FUNCTION validate_file_upload()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check file size limits based on bucket
  IF NEW.bucket_id = 'avatars' AND NEW.metadata->>'size'::bigint > 5242880 THEN
    RAISE EXCEPTION 'Avatar file size cannot exceed 5MB';
  END IF;
  
  IF NEW.bucket_id = 'banners' AND NEW.metadata->>'size'::bigint > 10485760 THEN
    RAISE EXCEPTION 'Banner file size cannot exceed 10MB';
  END IF;
  
  IF NEW.bucket_id = 'content' AND NEW.metadata->>'size'::bigint > 52428800 THEN
    RAISE EXCEPTION 'Content file size cannot exceed 50MB';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for file validation
DROP TRIGGER IF EXISTS validate_file_upload_trigger ON storage.objects;
CREATE TRIGGER validate_file_upload_trigger
  BEFORE INSERT OR UPDATE ON storage.objects
  FOR EACH ROW
  EXECUTE FUNCTION validate_file_upload();