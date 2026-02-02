-- =============================================
-- Admin Dashboard Permission Fix
-- =============================================

-- 1. Brands Table: Allow Admins to Update/Delete ANY brand
DROP POLICY IF EXISTS "Admins can manage all brands" ON public.brands;
CREATE POLICY "Admins can manage all brands"
ON public.brands
FOR ALL
TO authenticated
USING (
  (SELECT is_admin FROM public.user_profiles WHERE id = auth.uid()) = true
);

-- 2. Brand Plates: Allow Admins to manage ALL plates
DROP POLICY IF EXISTS "Admins can manage all plates" ON public.brand_plates;
CREATE POLICY "Admins can manage all plates"
ON public.brand_plates
FOR ALL
TO authenticated
USING (
  (SELECT is_admin FROM public.user_profiles WHERE id = auth.uid()) = true
);

-- 3. Brand Side Dishes: Allow Admins to manage ALL side dishes
DROP POLICY IF EXISTS "Admins can manage all side dishes" ON public.brand_side_dishes;
CREATE POLICY "Admins can manage all side dishes"
ON public.brand_side_dishes
FOR ALL
TO authenticated
USING (
  (SELECT is_admin FROM public.user_profiles WHERE id = auth.uid()) = true
);

-- 4. Storage Objects: Allow Admins to manage ALL files in menu-items and brand-logos
DROP POLICY IF EXISTS "Admins can manage menu items" ON storage.objects;
CREATE POLICY "Admins can manage menu items"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id IN ('menu-items', 'brand-logos') AND 
  (SELECT is_admin FROM public.user_profiles WHERE id = auth.uid()) = true
);
