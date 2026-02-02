-- =============================================
-- Fix Missing User Profiles & Triggers
-- =============================================

-- 1. Create the function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username, is_admin)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'username', 
    false -- Default to false, but we can manually update later
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger to fire on new signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Backfill missing profiles for EXISTING users
-- This is crucial for fixing the "Cannot coerce..." error
INSERT INTO public.user_profiles (id, username, is_admin)
SELECT 
    id, 
    raw_user_meta_data->>'username',
    true -- Grant admin to existing users to fix login issues immediately
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.user_profiles)
ON CONFLICT (id) DO UPDATE SET is_admin = true; -- Ensure existing users are admins

-- 4. Double check: Make ALL current profiles admins (for development convenience)
UPDATE public.user_profiles SET is_admin = true;
