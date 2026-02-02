-- =============================================
-- 数据库重构：从JSON改为关联表
-- =============================================

-- 1. 创建 brand_plates 表
CREATE TABLE public.brand_plates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  brand_id TEXT REFERENCES public.brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  price NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 创建 brand_side_dishes 表
CREATE TABLE public.brand_side_dishes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  brand_id TEXT REFERENCES public.brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 启用 RLS
ALTER TABLE public.brand_plates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_side_dishes ENABLE ROW LEVEL SECURITY;

-- 4. 迁移现有数据 (从JSON列提取数据插入新表)
-- 迁移碟子
INSERT INTO public.brand_plates (brand_id, name, color, price)
SELECT 
  id as brand_id,
  plate->>'name',
  plate->>'color',
  (plate->>'price')::numeric
FROM public.brands,
jsonb_array_elements(plates) as plate;

-- 迁移小菜
INSERT INTO public.brand_side_dishes (brand_id, name, price, icon)
SELECT 
  id as brand_id,
  dish->>'name',
  (dish->>'price')::numeric,
  dish->>'icon'
FROM public.brands,
jsonb_array_elements(side_dishes) as dish;

-- 5. 设置权限 (与brands表一致)
-- Brand Plates
CREATE POLICY "Public read access for brand_plates"
  ON public.brand_plates FOR SELECT
  USING (true); -- 简化读取权限，反正读品牌是公开/共享的

CREATE POLICY "Authenticated users can manage own brand_plates"
  ON public.brand_plates FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.brands 
      WHERE brands.id = brand_plates.brand_id 
      AND (brands.user_id = auth.uid() OR (brands.is_shared = true AND EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = true)))
    )
  );

-- Brand Side Dishes
CREATE POLICY "Public read access for brand_side_dishes"
  ON public.brand_side_dishes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage own brand_side_dishes"
  ON public.brand_side_dishes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.brands 
      WHERE brands.id = brand_side_dishes.brand_id 
      AND (brands.user_id = auth.uid() OR (brands.is_shared = true AND EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = true)))
    )
  );

-- 6. 授予表权限
GRANT ALL ON public.brand_plates TO authenticated;
GRANT SELECT ON public.brand_plates TO anon;
GRANT ALL ON public.brand_side_dishes TO authenticated;
GRANT SELECT ON public.brand_side_dishes TO anon;

-- 7. (可选) 删除原JSON列，或者保留作为备份
-- ALTER TABLE public.brands DROP COLUMN plates;
-- ALTER TABLE public.brands DROP COLUMN side_dishes;
