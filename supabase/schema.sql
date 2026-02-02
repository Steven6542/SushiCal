-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- STORAGE BUCKET FOR BRAND LOGOS
-- =============================================
-- Create storage bucket for brand logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-logos', 'brand-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access for brand logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload brand logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own brand logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own brand logos" ON storage.objects;

-- Storage policies for brand-logos bucket
-- Allow public read access
CREATE POLICY "Public read access for brand logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'brand-logos');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload brand logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'brand-logos' 
  AND auth.role() = 'authenticated'
);

-- Allow users to update their own uploads
CREATE POLICY "Users can update their own brand logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'brand-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete their own brand logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'brand-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =============================================
-- USER PROFILES TABLE
-- =============================================
-- Extends Supabase auth.users with additional profile information
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  currency TEXT DEFAULT 'CNY',
  language TEXT DEFAULT 'zh',
  theme TEXT DEFAULT 'system',
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Grant table-level permissions
GRANT SELECT, UPDATE ON public.user_profiles TO authenticated;
GRANT INSERT ON public.user_profiles TO authenticated;

CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);


-- =============================================
-- BRANDS TABLE
-- =============================================
CREATE TABLE public.brands (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  plates JSONB DEFAULT '[]'::jsonb,
  side_dishes JSONB DEFAULT '[]'::jsonb,
  default_service_charge JSONB DEFAULT '{"type": "percent", "value": 10}'::jsonb,
  tags TEXT[], -- Array of strings
  region TEXT, -- 'mainland', 'hk', 'macau'
  is_shared BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own brands" ON public.brands;
DROP POLICY IF EXISTS "Users can view shared brands" ON public.brands;
DROP POLICY IF EXISTS "Authenticated users can view brands" ON public.brands;
DROP POLICY IF EXISTS "Anonymous users can view shared brands" ON public.brands;
DROP POLICY IF EXISTS "Users can insert own brands" ON public.brands;
DROP POLICY IF EXISTS "Users can update own brands" ON public.brands;
DROP POLICY IF EXISTS "Users can delete own brands" ON public.brands;
DROP POLICY IF EXISTS "Allow authenticated users to view all brands" ON public.brands;
DROP POLICY IF EXISTS "Allow anon users to view shared brands" ON public.brands;
DROP POLICY IF EXISTS "Users can manage own brands" ON public.brands;

-- RLS Policies
-- Authenticated users can view shared brands OR their own brands
CREATE POLICY "Authenticated users can view brands"
  ON public.brands FOR SELECT
  TO authenticated
  USING (is_shared = true OR auth.uid() = user_id);

-- Anonymous users can view shared brands (for guest mode)
CREATE POLICY "Anonymous users can view shared brands"
  ON public.brands FOR SELECT
  TO anon
  USING (is_shared = true);

-- Users can insert their own brands
CREATE POLICY "Users can insert own brands"
  ON public.brands FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own brands OR admins can update shared brands
CREATE POLICY "Users can update own brands or shared (if admin)"
  ON public.brands FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id 
    OR (is_shared = true AND EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = true))
  );

-- Users can delete their own brands OR admins can delete shared brands
CREATE POLICY "Users can delete own brands or shared (if admin)"
  ON public.brands FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR (is_shared = true AND EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = true))
  );

-- Grant table-level permissions (CRITICAL!)
GRANT SELECT ON public.brands TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.brands TO authenticated;

-- =============================================
-- MEAL RECORDS TABLE
-- =============================================
CREATE TABLE public.meal_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  brand_name TEXT NOT NULL,
  brand_logo TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  total_plates INTEGER NOT NULL,
  region TEXT NOT NULL,
  currency_symbol TEXT NOT NULL,
  service_charge_amount DECIMAL(10, 2),
  service_charge_rule JSONB,
  head_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.meal_records ENABLE ROW LEVEL SECURITY;

-- Policies for meal_records
CREATE POLICY "Users can view own meal records"
  ON public.meal_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meal records"
  ON public.meal_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meal records"
  ON public.meal_records FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meal records"
  ON public.meal_records FOR DELETE
  USING (auth.uid() = user_id);

-- Grant table-level permissions
GRANT ALL ON public.meal_records TO authenticated;

-- =============================================
-- MEAL ITEMS TABLE
-- =============================================
CREATE TABLE public.meal_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  meal_record_id UUID REFERENCES public.meal_records(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('plate', 'side')),
  color TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.meal_items ENABLE ROW LEVEL SECURITY;

-- Policies for meal_items (inherit from meal_records)
CREATE POLICY "Users can view own meal items"
  ON public.meal_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.meal_records
      WHERE meal_records.id = meal_items.meal_record_id
      AND meal_records.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own meal items"
  ON public.meal_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.meal_records
      WHERE meal_records.id = meal_items.meal_record_id
      AND meal_records.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own meal items"
  ON public.meal_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.meal_records
      WHERE meal_records.id = meal_items.meal_record_id
      AND meal_records.user_id = auth.uid()
    )
  );

-- Grant table-level permissions
GRANT ALL ON public.meal_items TO authenticated;

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_brands_user_id ON public.brands(user_id);
CREATE INDEX idx_brands_is_shared ON public.brands(is_shared);
CREATE INDEX idx_meal_records_user_id ON public.meal_records(user_id);
CREATE INDEX idx_meal_records_date ON public.meal_records(date DESC);
CREATE INDEX idx_meal_items_meal_record_id ON public.meal_items(meal_record_id);

-- =============================================
-- FUNCTIONS
-- =============================================
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brands_updated_at
  BEFORE UPDATE ON public.brands
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_records_updated_at
  BEFORE UPDATE ON public.meal_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- BRAND LOGO HELPER FUNCTIONS
-- =============================================
-- Helper function to generate brand logo URL from Supabase Storage
-- Usage: SELECT get_brand_logo_url('sushiro');
-- Returns: https://vswxbbxjhsmgoztpkqnj.supabase.co/storage/v1/object/public/brand-logos/sushiro.png

CREATE OR REPLACE FUNCTION get_brand_logo_url(brand_id TEXT, filename TEXT DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
  project_url TEXT := 'https://vswxbbxjhsmgoztpkqnj.supabase.co';
  file_name TEXT;
BEGIN
  file_name := COALESCE(filename, brand_id || '.png');
  RETURN project_url || '/storage/v1/object/public/brand-logos/' || file_name;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- LOGO MANAGEMENT INSTRUCTIONS
-- =============================================
-- 
-- 方式一：在Supabase Table Editor中直接编辑
-- 1. 进入 Tables → brands
-- 2. 找到要修改的品牌行
-- 3. 点击 logo_url 列直接编辑
-- 4. 粘贴新的URL或使用 get_brand_logo_url('brand_id') 函数
--
-- 方式二：使用SQL更新
-- UPDATE public.brands 
-- SET logo_url = get_brand_logo_url('sushiro')
-- WHERE id = 'sushiro';
--
-- 查看当前logo状态：
-- SELECT id, name, logo_url FROM public.brands WHERE is_shared = true;
--
-- =============================================

-- =============================================
-- SEED DATA - Shared Brands
-- =============================================
-- These brands are shared across all users (is_shared = true)
-- user_id is NULL for system/shared brands

INSERT INTO public.brands (id, user_id, name, description, logo_url, tags, default_service_charge, plates, side_dishes, region, is_shared)
VALUES
  -- 寿司郎 (Sushiro)
  (
    'sushiro',
    NULL,
    '寿司郎',
    '日本人气No.1回转寿司',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCJZkgYhNbeMOlKFLuORNl8E--9q6Yq04GXfglrc6Vp4V3nrRFh7dA_sC64SwnIzZR5dEBnS6c2ulA63moB95MIzNCi6O_pt_YrfpAVYvMQMzpSLi4z8ofQ-6aReLF1O6G7mjxK2FpmWCiWoHQL6K7QFf6VIAwDkU6_INmTNezFyjsa7KsNgt-LgLhSJHGvTBn-aNEATl3sVVmllqMiqNbHGjOiUynibRMlnbXoGhqSVOMi3pQYHLPX8uZTrCshVbdySoYhO8xw3Cs',
    ARRAY['hot'],
    '{"type":"percent","value":10}'::jsonb,
    '[
      {"id":"p1","name":"红碟","color":"#EF4444","price":12},
      {"id":"p2","name":"银碟","color":"#D1D5DB","price":17},
      {"id":"p3","name":"金碟","color":"#EAB308","price":22},
      {"id":"p4","name":"黑碟","color":"#111827","price":27}
    ]'::jsonb,
    '[
      {"id":"s1","name":"拉面 / 乌冬","price":32,"icon":"ramen_dining"},
      {"id":"s2","name":"天妇罗 / 炸物","price":27,"icon":"tapas"},
      {"id":"s3","name":"饮料 / 酒类","price":18,"icon":"local_bar"}
    ]'::jsonb,
    'hk',
    true
  ),
  
  -- 藏寿司 (Kura Sushi)
  (
    'kura',
    NULL,
    '藏寿司',
    '坚持100%无添加',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDvdLQ2EcKEAvO4fgr-8i0hJZUWqod4xdPNVvmnFCpg8eQWCESVnYiyeJInP5gnbDEKO3VzkYPLUUD_muW-Xm4qQNvURbtAte1iVTueajFygrKCLIrjps4D2u5bUvWGPMhRh6zrAIyfi73K4T_8dzAxF6wrUGdPo0AYQUbXsWdRS_0K3iy89xiEm2LUipqNAZlGYMytDkX2o6g0sQH0jkpkkDwa_YbdmlfgA21SsXR0DYossTm4DfLcEbIREvrWOleFDmat1cnF0rI',
    ARRAY['new'],
    '{"type":"percent","value":10}'::jsonb,
    '[
      {"id":"k1","name":"普通碟","color":"#3B82F6","price":12},
      {"id":"k2","name":"特殊碟","color":"#EF4444","price":24}
    ]'::jsonb,
    '[
      {"id":"s1","name":"味噌汤","price":18,"icon":"soup_kitchen"}
    ]'::jsonb,
    'hk',
    true
  ),
  
  -- 元气寿司 (Genki Sushi)
  (
    'genki',
    NULL,
    '元气寿司',
    '大众喜爱的经典选择',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBJd9j8NBLCeiehzQqhNK7fUPtI8pfM4EKf_zlvQdSa2haz2hb1MhZGC0wvtHzBtCx7xLRz9F1mcVEaTAR3K-zg8i0QH0cZ0bep74lnWLTlHZsI5iOyYYpZChd9PU6T784Y1rGmPqKPiwqa5zlAbkvm73dYJGaEOHdIpzOFBCVMmj0sgC5zURNn2ClZXcWdz7Fy7uBQSufl_SoDFblfzHYJ5Zjb8_34WebJQQLV7AVhVPlkhXDznT9v_RXxZYfW08SWKlgQQtN_3z4',
    ARRAY[]::TEXT[],
    '{"type":"percent","value":10}'::jsonb,
    '[
      {"id":"g1","name":"绿碟","color":"#22C55E","price":10},
      {"id":"g2","name":"红碟","color":"#EF4444","price":14}
    ]'::jsonb,
    '[]'::jsonb,
    'hk',
    true
  ),
  
  -- 争鲜 (Sushi Express)
  (
    'sushi_express',
    NULL,
    '争鲜',
    '高性价比的美味',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCPVjS2grA8SyqmGJly4ZqAzisbCMqWgh4Lijjk945fmz8Dk0ua89sCow1uMINTVFMzQuI6KisFqnGeNeydoOtckezMTltcvTwFZKCfsU1I163IgtW_5Wbgq8GWygQyk7_mEkSNzdH24VO6v3xVYjKrtB9Yi0im357-tmSvKs_Kl1swsdyaoKJf15svmkSTyApD5HKXqJe8Aa7gr_4SLo7lgSunY1YpM3ta8RiBSjSVPFbf_DYdWqUruyFoizPTop7-ExfpXReUGLk',
    ARRAY[]::TEXT[],
    '{"type":"none","value":0}'::jsonb,
    '[
      {"id":"se1","name":"粉碟","color":"#F472B6","price":6}
    ]'::jsonb,
    '[]'::jsonb,
    'hk',
    true
  ),
  
  -- 滨寿司 (Hama Sushi)
  (
    'hama',
    NULL,
    '滨寿司',
    '适合家庭聚餐',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuB2fUg53B0wJA_EOB-Io4fY4jX-_AUFUXvRVA5cOCyr0nF5P7P6sh7ZKqw0Vw2SQITx2Sbk5yWTGIyHrJK349NsePMfwcvT6pX4Z1Qzy4V2V4wV3TlsU6CzubRzd0BE8CLIClwrpD4JF7T2JTLnDzCTnmrYrTh7gKrpLc__d19uyHjikWaM5nBWwUoNzD6btiHxUZSm00OW7uXCtPG0R_dWXvWC7ZvUZ0ocxewlFh4RpAV2GsIOim8L0eYRby6vSnwyfQNCskZ3HV0',
    ARRAY[]::TEXT[],
    '{"type":"percent","value":10}'::jsonb,
    '[
      {"id":"h1","name":"标准","color":"#3B82F6","price":10}
    ]'::jsonb,
    '[]'::jsonb,
    'hk',
    true
  ),
  
  -- 板前寿司 (Itamae Sushi)
  (
    'itamae',
    NULL,
    '板前寿司',
    '职人手作精选',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuADSNxrW04V5iFbafCzFDaWDRkZd758FJuI2VXqqHq-2utOL-VWlS_DUvkw2Am9Qr2Lg_4BgczdLWb092zoj6_g4sgy8LeJL1K2FR_O4C2T5bJTL2U0Mgunshi0N62QDBWOphS1CUQMs4GDrGpcxz6G0yh3Cab-5EA-9AtU6si0MQHPIVqXoqUQELJTZ6HsVFKBejpcve8okj8c_N9EaPvY1cURk4KPEPU4wEowgeOx4NDTm7p6KEfO9iRnDH-QWgMt6K7MlODhNQU',
    ARRAY[]::TEXT[],
    '{"type":"percent","value":10}'::jsonb,
    '[
      {"id":"i1","name":"黑金","color":"#000000","price":35}
    ]'::jsonb,
    '[]'::jsonb,
    'hk',
    true
  )
ON CONFLICT (id) DO NOTHING;
