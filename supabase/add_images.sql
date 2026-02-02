-- =============================================
-- Admin Dashboard Feature: Add Image Support
-- =============================================

-- Add image_url to brand_plates
ALTER TABLE public.brand_plates 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add image_url to brand_side_dishes
ALTER TABLE public.brand_side_dishes 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Ensure storage policies allow image uploads (reinforced)
-- This might already be set in COMPLETE_RESET.sql but good to double check or re-apply for explicit admin bucket if needed
-- For now we use the same 'brand-logos' bucket or create a new 'menu-images' bucket?
-- 'brand-logos' is public, so it works. We can stick to it or create 'menu-items'.
-- Let's stick to 'brand-logos' for simplicity to start, or create 'menu-items' for clarity.

INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-items', 'menu-items', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for menu-items
DROP POLICY IF EXISTS "Public read access for menu items" ON storage.objects;
CREATE POLICY "Public read access for menu items"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'menu-items');

DROP POLICY IF EXISTS "Authenticated users can upload menu items" ON storage.objects;
CREATE POLICY "Authenticated users can upload menu items"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'menu-items' AND auth.role() = 'authenticated');
  
DROP POLICY IF EXISTS "Users can update their own menu items" ON storage.objects;
CREATE POLICY "Users can update their own menu items"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'menu-items' AND auth.role() = 'authenticated');
  
DROP POLICY IF EXISTS "Users can delete their own menu items" ON storage.objects;
CREATE POLICY "Users can delete their own menu items"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'menu-items' AND auth.role() = 'authenticated');
