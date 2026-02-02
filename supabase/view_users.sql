-- =============================================
-- 查看所有注册用户
-- =============================================

-- 方式一：通过Supabase Dashboard
-- 进入 Authentication → Users 可以看到所有注册用户的：
-- - Email
-- - User ID
-- - 注册时间
-- - 最后登录时间

-- 方式二：通过SQL查询
-- 查看用户基本信息（来自auth.users系统表）
SELECT 
  id as 用户ID,
  email as 邮箱,
  created_at as 注册时间,
  last_sign_in_at as 最后登录,
  email_confirmed_at as 邮箱确认时间
FROM auth.users
ORDER BY created_at DESC;

-- 查看用户配置信息（来自我们创建的user_profiles表）
SELECT 
  p.id as 用户ID,
  u.email as 邮箱,
  p.username as 用户名,
  p.language as 语言,
  p.currency as 货币,
  p.created_at as 创建时间
FROM public.user_profiles p
JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC;

-- 联合查询：完整的用户信息
SELECT 
  u.id as 用户ID,
  u.email as 邮箱,
  u.created_at as 注册时间,
  u.last_sign_in_at as 最后登录,
  p.username as 用户名,
  p.language as 语言,
  p.currency as 货币,
  (SELECT COUNT(*) FROM public.brands WHERE user_id = u.id AND is_shared = false) as 自定义品牌数,
  (SELECT COUNT(*) FROM public.meal_records WHERE user_id = u.id) as 餐饮记录数
FROM auth.users u
LEFT JOIN public.user_profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- =============================================
-- 注意事项
-- =============================================
-- 
-- 1. 密码不会显示：Supabase会加密存储密码，无法查看明文
-- 2. auth.users是系统表：由Supabase Auth自动管理
-- 3. user_profiles是扩展表：存储额外的用户配置
-- 4. 新用户注册时会自动：
--    - 在auth.users中创建账号
--    - 在user_profiles中创建配置（通过authService.ts）
