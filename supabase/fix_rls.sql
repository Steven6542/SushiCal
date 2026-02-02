-- =============================================
-- 快速修复RLS策略（如果403错误）
-- =============================================
-- 仅执行此文件来修复brands表的访问权限问题

-- 删除现有的brands表RLS策略
DROP POLICY IF EXISTS "Users can view own brands" ON public.brands;
DROP POLICY IF EXISTS "Users can view shared brands" ON public.brands;
DROP POLICY IF EXISTS "Users can insert own brands" ON public.brands;
DROP POLICY IF EXISTS "Users can update own brands" ON public.brands;
DROP POLICY IF EXISTS "Users can delete own brands" ON public.brands;
DROP POLICY IF EXISTS "Authenticated users can view brands" ON public.brands;
DROP POLICY IF EXISTS "Anonymous users can view shared brands" ON public.brands;

-- 创建新的RLS策略
-- 允许已登录用户查看共享品牌和自己的品牌
CREATE POLICY "Authenticated users can view brands"
  ON public.brands FOR SELECT
  TO authenticated
  USING (is_shared = true OR auth.uid() = user_id);

-- 允许未登录用户（游客）查看共享品牌
CREATE POLICY "Anonymous users can view shared brands"
  ON public.brands FOR SELECT
  TO anon
  USING (is_shared = true);

-- 允许用户插入自己的品牌
CREATE POLICY "Users can insert own brands"
  ON public.brands FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 允许用户更新自己的品牌
CREATE POLICY "Users can update own brands"
  ON public.brands FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- 允许用户删除自己的品牌
CREATE POLICY "Users can delete own brands"
  ON public.brands FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 验证策略
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'brands';
