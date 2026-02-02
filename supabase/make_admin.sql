-- =============================================
-- 将当前用户设置为管理员
-- =============================================
-- 执行此脚本可授予自己管理共享品牌的权限

-- 1. 确保user_profiles表有is_admin列 (如果重新运行了schema.sql则已存在)
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- 2. 将特定用户设置为管理员
-- 请将下面的UUID替换为您的用户ID
UPDATE public.user_profiles
SET is_admin = true
WHERE id = auth.uid(); -- 注意：如果在SQL Editor执行，auth.uid()可能无效，需要手动指定ID

-- 或者，如果您不知道ID，可以将所有当前用户设为管理员（仅限测试环境！）
-- UPDATE public.user_profiles SET is_admin = true;

-- 3. 验证
SELECT id, username, is_admin FROM public.user_profiles;
