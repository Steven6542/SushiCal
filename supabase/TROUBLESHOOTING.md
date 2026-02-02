# SushiCalc - 完整故障排除指南

## 问题：登录后看不到品牌（403 Permission Denied）

### 根本原因
Supabase使用**双层权限系统**：
1. **表级权限（GRANT）** - PostgreSQL基础权限
2. **行级安全（RLS）** - Supabase安全策略

如果缺少GRANT权限，即使RLS策略正确，也会出现403错误。

### 解决方案

已在`schema.sql`中添加所有必要的GRANT语句：

```sql
-- Brands表
GRANT SELECT ON public.brands TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.brands TO authenticated;

-- User Profiles表
GRANT SELECT, UPDATE ON public.user_profiles TO authenticated;
GRANT INSERT ON public.user_profiles TO authenticated;

-- Meal Records表
GRANT ALL ON public.meal_records TO authenticated;

-- Meal Items表
GRANT ALL ON public.meal_items TO authenticated;
```

### 完整设置步骤

1. **执行schema.sql**
   - 在Supabase SQL Editor中执行完整的`schema.sql`
   - 这会创建所有表、RLS策略和GRANT权限

2. **配置认证**
   - Authentication → Providers → Email
   - **关闭** "Confirm email" 选项
   - 保存

3. **验证权限**
   ```sql
   -- 检查表权限
   SELECT grantee, privilege_type 
   FROM information_schema.role_table_grants 
   WHERE table_name='brands';
   
   -- 检查RLS策略
   SELECT policyname, cmd, roles 
   FROM pg_policies 
   WHERE tablename='brands';
   ```

## 其他常见问题

### 问题：密码长度限制

**症状**: 注册允许短密码，但登录要求6位

**原因**: Supabase默认要求至少6位密码

**解决方案**: 
- 前端已添加6位密码验证
- 或在Supabase Dashboard → Authentication → Policies 中调整最小长度

### 问题：需要登录两次

**症状**: 第一次登录失败，第二次才成功

**原因**: Session未完全建立就跳转

**解决方案**: 已修复
- 登录时等待用户数据加载完成
- 添加500ms延迟确保session建立

### 问题：游客模式可以看到品牌，登录用户看不到

**症状**: 未登录可以访问，登录后403

**原因**: 缺少`authenticated`角色的GRANT权限

**解决方案**: 
```sql
GRANT SELECT ON public.brands TO authenticated;
```

## 权限架构说明

### RLS策略（行级安全）

```sql
-- 认证用户可以看到共享品牌和自己的品牌
CREATE POLICY "Authenticated users can view brands"
  ON public.brands FOR SELECT
  TO authenticated
  USING (is_shared = true OR auth.uid() = user_id);

-- 游客可以看到共享品牌
CREATE POLICY "Anonymous users can view shared brands"
  ON public.brands FOR SELECT
  TO anon
  USING (is_shared = true);
```

### 表级权限（GRANT）

```sql
-- 允许角色访问表
GRANT SELECT ON public.brands TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.brands TO authenticated;
```

### 权限检查顺序

1. **GRANT** - PostgreSQL检查角色是否有表访问权限
2. **RLS** - Supabase检查行级安全策略
3. **返回数据** - 只返回符合所有条件的数据

## 验证应用正常工作

### 1. 游客模式
- 点击"游客登录"
- 应该看到6个预置品牌

### 2. 注册新用户
- 用户名：任意（不限长度）
- 密码：至少6位
- 应该注册成功

### 3. 登录
- 使用注册的用户名密码
- 应该一次登录成功
- 应该看到6个预置品牌

### 4. 功能测试
- 选择品牌进入计算器
- 添加盘子
- 保存餐饮记录
- 查看历史记录
- 修改个人设置

## 环境要求

### Supabase配置
- 项目URL: ✅
- Anon Key: ✅ (正确的JWT格式)
- Email验证: ❌ 关闭
- 密码长度: ≥6位

### 数据库
- 表: user_profiles, brands, meal_records, meal_items
- RLS: 已启用
- GRANT: 已配置
- Storage: brand-logos bucket（可选）

### 前端
- Node.js: ✅
- 依赖: @supabase/supabase-js
- 环境变量: .env.local配置正确

## 总结

关键修复：
1. ✅ 添加GRANT权限到schema.sql
2. ✅ 修复登录流程（等待数据加载）
3. ✅ 移除调试日志
4. ✅ 配置正确的RLS策略
5. ✅ 使用正确的Supabase anon key

应用现在应该完全正常工作！
