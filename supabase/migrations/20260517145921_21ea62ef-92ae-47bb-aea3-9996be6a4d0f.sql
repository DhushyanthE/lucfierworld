DROP POLICY IF EXISTS "Public can read avatar files" ON storage.objects;
DROP POLICY IF EXISTS "Public can read avatar files by direct path" ON storage.objects;
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own avatar files" ON storage.objects;

CREATE POLICY "Users can read own avatar files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
