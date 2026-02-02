-- =============================================
-- SushiCalc 完整重置脚本 (COMPLETE RESET)
-- =============================================
-- ⚠️ 警告：这将删除所有现有数据！
-- 执行此脚本将：
-- 1. 删除所有现有表
-- 2. 重新创建全新的表结构 (关联表模式)
-- 3. 导入预置品牌数据

-- =============================================
-- 1. 清理旧数据 (DROP TABLES)
-- =============================================
DROP TABLE IF EXISTS public.brand_side_dishes CASCADE;
DROP TABLE IF EXISTS public.brand_plates CASCADE;
DROP TABLE IF EXISTS public.meal_items CASCADE;
DROP TABLE IF EXISTS public.meal_records CASCADE;
DROP TABLE IF EXISTS public.brands CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;

-- =============================================
-- 2. 创建表结构 (CREATE TABLES)
-- =============================================

-- 用户资料表
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

-- 品牌表 (主表，不再包含plates/sides JSON)
CREATE TABLE public.brands (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  default_service_charge JSONB DEFAULT '{"type": "percent", "value": 10}'::jsonb,
  tags TEXT[], 
  region TEXT,
  is_shared BOOLEAN DEFAULT false,
  -- 保留原有JSON列作为兼容性或者以后扩展，或是直接移除
  -- 为了保持服务代码兼容性，这里我们移除plates/sides列，或者设为空
  -- 服务端现在已经重构为读取关联表，但为了安全起见，先不创建JSON列
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 品牌碟子表 (关联表)
CREATE TABLE public.brand_plates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id TEXT REFERENCES public.brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  price NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 品牌小菜表 (关联表)
CREATE TABLE public.brand_side_dishes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id TEXT REFERENCES public.brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 餐饮记录表
CREATE TABLE public.meal_records (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_name TEXT NOT NULL,
  brand_logo TEXT,
  date TIMESTAMPTZ DEFAULT NOW(),
  total_price NUMERIC NOT NULL,
  total_plates INTEGER NOT NULL,
  head_count INTEGER DEFAULT 1,
  service_charge_amount NUMERIC DEFAULT 0,
  service_charge_rule JSONB,
  currency_symbol TEXT DEFAULT '¥',
  region TEXT DEFAULT 'mainland',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 餐饮明细表
CREATE TABLE public.meal_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_record_id TEXT REFERENCES public.meal_records(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  quantity INTEGER NOT NULL,
  type TEXT NOT NULL, -- 'plate' or 'side'
  color TEXT, -- for plates
  icon TEXT, -- for sides
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. 安全策略 (RLS & GRANTS)
-- =============================================

-- 启用RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_plates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_side_dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_items ENABLE ROW LEVEL SECURITY;

-- 授予基础权限 (CRITICAL!)
GRANT SELECT, UPDATE ON public.user_profiles TO authenticated;
GRANT INSERT ON public.user_profiles TO authenticated;

GRANT SELECT ON public.brands TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.brands TO authenticated;

GRANT SELECT ON public.brand_plates TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.brand_plates TO authenticated;

GRANT SELECT ON public.brand_side_dishes TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.brand_side_dishes TO authenticated;

GRANT ALL ON public.meal_records TO authenticated;
GRANT ALL ON public.meal_items TO authenticated;

-- RLS 策略

-- User Profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Brands
CREATE POLICY "Authenticated users can view brands" ON public.brands FOR SELECT TO authenticated USING (is_shared = true OR auth.uid() = user_id);
CREATE POLICY "Anonymous users can view shared brands" ON public.brands FOR SELECT TO anon USING (is_shared = true);
CREATE POLICY "Users can insert own brands" ON public.brands FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own brands" ON public.brands FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own brands" ON public.brands FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Brand Plates
CREATE POLICY "Public read brand_plates" ON public.brand_plates FOR SELECT USING (true);
CREATE POLICY "Users manage own brand_plates" ON public.brand_plates FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.brands WHERE brands.id = brand_plates.brand_id AND brands.user_id = auth.uid())
);

-- Brand Side Dishes
CREATE POLICY "Public read brand_side_dishes" ON public.brand_side_dishes FOR SELECT USING (true);
CREATE POLICY "Users manage own brand_side_dishes" ON public.brand_side_dishes FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.brands WHERE brands.id = brand_side_dishes.brand_id AND brands.user_id = auth.uid())
);

-- Meal Records & Items
CREATE POLICY "Users manage own meal records" ON public.meal_records FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own meal items" ON public.meal_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.meal_records WHERE meal_records.id = meal_items.meal_record_id AND meal_records.user_id = auth.uid())
);

-- =============================================
-- 4. 导入预置数据 (SEED DATA)
-- =============================================

-- 插入品牌 (Brands)
-- 插入品牌 (Brands)
INSERT INTO public.brands (id, name, description, logo_url, tags, default_service_charge, region, is_shared) VALUES
('sushiro', '寿司郎', '人气No.1回转寿司', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJZkgYhNbeMOlKFLuORNl8E--9q6Yq04GXfglrc6Vp4V3nrRFh7dA_sC64SwnIzZR5dEBnS6c2ulA63moB95MIzNCi6O_pt_YrfpAVYvMQMzpSLi4z8ofQ-6aReLF1O6G7mjxK2FpmWCiWoHQL6K7QFf6VIAwDkU6_INmTNezFyjsa7KsNgt-LgLhSJHGvTBn-aNEATl3sVVmllqMiqNbHGjOiUynibRMlnbXoGhqSVOMi3pQYHLPX8uZTrCshVbdySoYhO8xw3Cs', ARRAY['hot'], '{"type":"percent","value":10}', 'hk', true),
('kura', '藏寿司', '100%无添加', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDvdLQ2EcKEAvO4fgr-8i0hJZUWqod4xdPNVvmnFCpg8eQWCESVnYiyeJInP5gnbDEKO3VzkYPLUUD_muW-Xm4qQNvURbtAte1iVTueajFygrKCLIrjps4D2u5bUvWGPMhRh6zrAIyfi73K4T_8dzAxF6wrUGdPo0AYQUbXsWdRS_0K3iy89xiEm2LUipqNAZlGYMytDkX2o6g0sQH0jkpkkDwa_YbdmlfgA21SsXR0DYossTm4DfLcEbIREvrWOleFDmat1cnF0rI', ARRAY['new'], '{"type":"percent","value":10}', 'hk', true),
('genki', '元气寿司', '经典选择', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJd9j8NBLCeiehzQqhNK7fUPtI8pfM4EKf_zlvQdSa2haz2hb1MhZGC0wvtHzBtCx7xLRz9F1mcVEaTAR3K-zg8i0QH0cZ0bep74lnWLTlHZsI5iOyYYpZChd9PU6T784Y1rGmPqKPiwqa5zlAbkvm73dYJGaEOHdIpzOFBCVMmj0sgC5zURNn2ClZXcWdz7Fy7uBQSufl_SoDFblfzHYJ5Zjb8_34WebJQQLV7AVhVPlkhXDznT9v_RXxZYfW08SWKlgQQtN_3z4', ARRAY[]::TEXT[], '{"type":"percent","value":10}', 'hk', true),
('sushi_express', '争鲜', '高性价比', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCPVjS2grA8SyqmGJly4ZqAzisbCMqWgh4Lijjk945fmz8Dk0ua89sCow1uMINTVFMzQuI6KisFqnGeNeydoOtckezMTltcvTwFZKCfsU1I163IgtW_5Wbgq8GWygQyk7_mEkSNzdH24VO6v3xVYjKrtB9Yi0im357-tmSvKs_Kl1swsdyaoKJf15svmkSTyApD5HKXqJe8Aa7gr_4SLo7lgSunY1YpM3ta8RiBSjSVPFbf_DYdWqUruyFoizPTop7-ExfpXReUGLk', ARRAY[]::TEXT[], '{"type":"none","value":0}', 'hk', true),
('hama', '滨寿司', '家庭聚餐', 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2fUg53B0wJA_EOB-Io4fY4jX-_AUFUXvRVA5cOCyr0nF5P7P6sh7ZKqw0Vw2SQITx2Sbk5yWTGIyHrJK349NsePMfwcvT6pX4Z1Qzy4V2V4wV3TlsU6CzubRzd0BE8CLIClwrpD4JF7T2JTLnDzCTnmrYrTh7gKrpLc__d19uyHjikWaM5nBWwUoNzD6btiHxUZSm00OW7uXCtPG0R_dWXvWC7ZvUZ0ocxewlFh4RpAV2GsIOim8L0eYRby6vSnwyfQNCskZ3HV0', ARRAY[]::TEXT[], '{"type":"percent","value":10}', 'hk', true),
('itamae', '板前寿司', '职人手作', 'https://lh3.googleusercontent.com/aida-public/AB6AXuADSNxrW04V5iFbafCzFDaWDRkZd758FJuI2VXqqHq-2utOL-VWlS_DUvkw2Am9Qr2Lg_4BgczdLWb092zoj6_g4sgy8LeJL1K2FR_O4C2T5bJTL2U0Mgunshi0N62QDBWOphS1CUQMs4GDrGpcxz6G0yh3Cab-5EA-9AtU6si0MQHPIVqXoqUQELJTZ6HsVFKBejpcve8okj8c_N9EaPvY1cURk4KPEPU4wEowgeOx4NDTm7p6KEfO9iRnDH-QWgMt6K7MlODhNQU', ARRAY[]::TEXT[], '{"type":"percent","value":10}', 'hk', true);

-- 创建 Storage Bucket (确保图片上传功能正常)
INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-logos', 'brand-logos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read access for brand logos" ON storage.objects;
CREATE POLICY "Public read access for brand logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'brand-logos');

DROP POLICY IF EXISTS "Authenticated users can upload brand logos" ON storage.objects;
CREATE POLICY "Authenticated users can upload brand logos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'brand-logos' AND auth.role() = 'authenticated');

-- 插入碟子 (Brand Plates)
INSERT INTO public.brand_plates (brand_id, name, color, price) VALUES
-- Sushiro
('sushiro', '红碟', '#EF4444', 12),
('sushiro', '银碟', '#D1D5DB', 17),
('sushiro', '金碟', '#EAB308', 22),
('sushiro', '黑碟', '#111827', 27),
-- Kura
('kura', '普通碟', '#3B82F6', 12),
('kura', '特殊碟', '#EF4444', 24),
-- Genki
('genki', '绿碟', '#22C55E', 10),
('genki', '红碟', '#EF4444', 14),
-- Sushi Express
('sushi_express', '粉碟', '#F472B6', 6),
-- Hama
('hama', '标准', '#3B82F6', 10),
-- Itamae
('itamae', '黑金', '#000000', 35);

-- 插入小菜 (Brand Side Dishes)
INSERT INTO public.brand_side_dishes (brand_id, name, price, icon) VALUES
-- Sushiro
('sushiro', '拉面 / 乌冬', 32, 'ramen_dining'),
('sushiro', '天妇罗 / 炸物', 27, 'tapas'),
('sushiro', '饮料 / 酒类', 18, 'local_bar'),
-- Kura
('kura', '味噌汤', 18, 'soup_kitchen');

