# Schema执行说明

## 需要重新执行吗？

**是的，需要重新执行！**

我们在`schema.sql`中添加了重要的GRANT权限语句，这些权限控制着用户对表的访问。如果不执行，登录用户将无法访问品牌数据。

## 执行方式

### 方式1：执行完整的schema.sql（推荐）

1. 打开Supabase SQL Editor
2. 复制 `supabase/schema.sql` 的**完整内容**
3. 粘贴到SQL Editor
4. 点击 "Run"

**优点**: 确保所有配置一致
**注意**: 会删除并重新创建所有表和策略（数据会丢失）

### 方式2：只执行GRANT语句（保留现有数据）

如果您想保留现有数据和用户，只需执行新添加的GRANT语句：

```sql
-- Brands表权限
GRANT SELECT ON public.brands TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.brands TO authenticated;

-- User Profiles表权限  
GRANT SELECT, UPDATE ON public.user_profiles TO authenticated;
GRANT INSERT ON public.user_profiles TO authenticated;

-- Meal Records表权限
GRANT ALL ON public.meal_records TO authenticated;

-- Meal Items表权限
GRANT ALL ON public.meal_items TO authenticated;
```

**优点**: 保留现有数据
**注意**: 确保之前的表和RLS策略已正确创建

## 验证权限是否生效

执行后，运行以下查询验证：

```sql
-- 检查brands表的权限
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name='brands';
```

应该看到：
- `authenticated` - SELECT, INSERT, UPDATE, DELETE
- `anon` - SELECT

## 什么时候需要重新执行？

- ✅ 首次设置数据库
- ✅ 添加了新的GRANT权限（本次更新）
- ✅ 修改了RLS策略
- ✅ 修改了表结构
- ❌ 只修改了前端代码
- ❌ 只更新了品牌数据（用UPDATE语句）

## 当前情况

您现在应该执行方式2（只GRANT），因为：
1. 表和数据已经存在
2. 只是添加了GRANT权限
3. 可以保留现有用户和品牌数据

执行后刷新浏览器，登录应该能正常看到品牌了。
