-- =============================================
-- FIX ALL ISSUES SCRIPT (ONE-CLICK REPAIR)
-- =============================================

-- Part 1: Ensure Regional Prices Column Exists
-- =============================================
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'brand_plates' AND column_name = 'regional_prices') THEN 
        ALTER TABLE public.brand_plates ADD COLUMN regional_prices JSONB DEFAULT NULL; 
    END IF; 

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'brand_side_dishes' AND column_name = 'regional_prices') THEN 
        ALTER TABLE public.brand_side_dishes ADD COLUMN regional_prices JSONB DEFAULT NULL; 
    END IF;
END $$;

-- Part 2: Ensure Image Columns Exist
-- =============================================
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'brand_plates' AND column_name = 'image_url') THEN 
        ALTER TABLE public.brand_plates ADD COLUMN image_url TEXT DEFAULT NULL; 
    END IF; 

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'brand_side_dishes' AND column_name = 'image_url') THEN 
        ALTER TABLE public.brand_side_dishes ADD COLUMN image_url TEXT DEFAULT NULL; 
    END IF;
END $$;

-- Part 3: Ensure Sort Order Column Exists
-- =============================================
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'brands' AND column_name = 'sort_order') THEN 
        ALTER TABLE public.brands ADD COLUMN sort_order INTEGER DEFAULT 0; 
        
        -- Default Sort Order
        UPDATE public.brands SET sort_order = 1 WHERE id = 'sushiro';
        UPDATE public.brands SET sort_order = 2 WHERE id = 'kura';
        UPDATE public.brands SET sort_order = 3 WHERE id = 'genki';
        UPDATE public.brands SET sort_order = 4 WHERE id = 'hama';
        UPDATE public.brands SET sort_order = 5 WHERE id = 'sushi_express';
        UPDATE public.brands SET sort_order = 6 WHERE id = 'itamae';
    END IF;
END $$;


-- Part 4: Fix User Profiles & Permissions
-- =============================================

-- Ensure current users have admin access
UPDATE public.user_profiles SET is_admin = true WHERE is_admin IS NOT true;

-- Backfill missing profiles if any
INSERT INTO public.user_profiles (id, username, is_admin)
SELECT 
    id, 
    raw_user_meta_data->>'username',
    true 
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.user_profiles)
ON CONFLICT (id) DO UPDATE SET is_admin = true;

-- Ensure trigger exists for future signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username, is_admin)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'username', 
    false 
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Part 5: Fix RLS Policies (Allow Admins to Edit)
-- =============================================

-- Brands
DROP POLICY IF EXISTS "Admins can manage all brands" ON public.brands;
CREATE POLICY "Admins can manage all brands"
ON public.brands
FOR ALL
TO authenticated
USING (
  (SELECT is_admin FROM public.user_profiles WHERE id = auth.uid()) = true
);

-- Plates
DROP POLICY IF EXISTS "Admins can manage all plates" ON public.brand_plates;
CREATE POLICY "Admins can manage all plates"
ON public.brand_plates
FOR ALL
TO authenticated
USING (
  (SELECT is_admin FROM public.user_profiles WHERE id = auth.uid()) = true
);

-- Side Dishes
DROP POLICY IF EXISTS "Admins can manage all side dishes" ON public.brand_side_dishes;
CREATE POLICY "Admins can manage all side dishes"
ON public.brand_side_dishes
FOR ALL
TO authenticated
USING (
  (SELECT is_admin FROM public.user_profiles WHERE id = auth.uid()) = true
);

-- Storage
DROP POLICY IF EXISTS "Admins can manage menu items" ON storage.objects;
CREATE POLICY "Admins can manage menu items"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id IN ('menu-items', 'brand-logos') AND 
  (SELECT is_admin FROM public.user_profiles WHERE id = auth.uid()) = true
);

-- Part 6: Initialize Menu Items Bucket if missing
-- =============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-items', 'menu-items', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read access for menu items" ON storage.objects;
CREATE POLICY "Public read access for menu items"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'menu-items');
