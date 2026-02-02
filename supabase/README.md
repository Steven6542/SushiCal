# Supabase Setup Instructions

# Supabase 数据库设置指南

## ⚠️ 核心概念说明

**项目中的 `.sql` 文件只是脚本代码，不会自动同步到数据库！**

您必须**手动**将这些文件的内容复制到 [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql) 中点击 **Run** 执行，它们才会生效。

## 🚀 脚本执行顺序

### 1. 首次全新安装 (Full Setup)
如果您是第一次配置，或者想清空重来，请按顺序执行：

1. **`schema.sql`** - 创建所有表、安全策略(RLS)和权限
2. **`refactor_to_tables.sql`** - (重要) 升级到表格化管理结构
3. **`insert_brands.sql`** - 导入预置品牌数据（如寿司郎、藏寿司）

### 2. 现有项目升级 (Migration)
如果您已经运行过之前的版本，现在只需要执行：

- **`refactor_to_tables.sql`** 
  - 作用：将JSON数据结构重构为关联表
  - 目的：让您能在后台表格中直接编辑碟子价格

## 📂 脚本文件说明

| 文件名 | 用途 | 是否必须 |
|--------|------|----------|
| `schema.sql` | 核心数据库架构 | ✅ 必须 (最先运行) |
| `refactor_to_tables.sql` | **新功能升级**：启用后台表格管理 | ✅ 必须 (现在运行) |
| `insert_brands.sql` | 导入初始品牌数据 | ⚪️选 |
| `make_admin.sql` | 将用户设为管理员 | ❌ 已废弃 (不再需要) |

### 1. 访问 Supabase SQL Editor

1. 登录到你的 Supabase 项目
2. 在左侧导航栏点击 "SQL Editor"
3. 点击 "+ New Query" 创建新查询

### 2. 执行数据库架构和种子数据

1. 打开本地文件 `schema.sql`
2. 复制全部内容
3. 粘贴到 Supabase SQL Editor
4. 点击 "Run" 执行

期望结果：
- 创建4个表：user_profiles, brands, meal_records, meal_items
- 创建多个索引
- 启用 Row Level Security (RLS)
- 创建安全策略
- 导入6个预置的寿司品牌（寿司郎、藏寿司、元气寿司等）

### 3. 验证设置

在 Supabase 控制台中验证：

1. **Table Editor**
   - 检查是否有以下表：user_profiles, brands, meal_records, meal_items
   - 查看 brands 表，应该有6条记录

2. **Authentication**
   - 确认 Auth 已启用
   - 邮箱认证应该是默认方式

3. **API Settings**
   - 复制 Project URL
   - 复制 anon/public API key
   - 更新前端 `.env.local` 文件

## 常见问题

### Q: 执行 schema.sql 时报错 "extension does not exist"
**A**: 确保你有创建扩展的权限。UUID 扩展通常已经在 Supabase 中启用。

### Q: RLS 策略创建失败
**A**: 确保先创建表，再启用 RLS，最后创建策略。按照 schema.sql 的顺序执行。

### Q: 种子数据导入失败
**A**: 确保先执行 schema.sql 创建表结构，再执行 seed.sql。

### Q: 用户注册后无法看到品牌
**A**: 检查 brands 表的 is_shared 字段，共享品牌应该为 true。

## 数据库维护

### 清空测试数据

```sql
-- 清空用户数据（保留共享品牌）
TRUNCATE TABLE meal_items CASCADE;
TRUNCATE TABLE meal_records CASCADE;
DELETE FROM brands WHERE user_id IS NOT NULL;
-- 不要删除 user_profiles，Supabase Auth 会自动管理
```

### 添加新的共享品牌

```sql
INSERT INTO public.brands (id, user_id, name, description, logo_url, tags, default_service_charge, plates, side_dishes, region, is_shared)
VALUES (
  'brand_id',
  NULL,  -- NULL 表示系统品牌
  '品牌名称',
  '品牌描述',
  'logo_url',
  ARRAY['hot'],  -- 或 ARRAY['new'] 或 ARRAY[]::TEXT[]
  '{"type":"percent","value":10}'::jsonb,
  '[{"id":"p1","name":"红碟","color":"#EF4444","price":12}]'::jsonb,
  '[]'::jsonb,
  'hk',
  true  -- 设置为共享
);
```

## 品牌Logo管理

### 最简单的方式：直接在Table Editor中编辑

执行完 `schema.sql` 后：

1. **进入Supabase Dashboard**
   - Tables → brands 表

2. **直接编辑logo_url列**
   - 找到要修改的品牌行（如：sushiro）
   - 点击 `logo_url` 列的单元格
   - 粘贴新的URL
   - 保存

### Logo来源选项

**选项一：使用Supabase Storage**
1. 进入 Storage → brand-logos
2. 上传图片（如：sushiro.png）
3. 点击文件获取公开URL
4. 在Table Editor中粘贴URL

**选项二：使用外部URL**
- 直接在Table Editor中粘贴任何图片URL
- 当前使用的是Google Storage的URL

**选项三：使用辅助函数（SQL方式）**
```sql
-- 如果图片已上传到Storage，使用函数快速更新
UPDATE public.brands 
SET logo_url = get_brand_logo_url('sushiro')
WHERE id = 'sushiro';
```

### 查看所有品牌logo
```sql
SELECT id, name, logo_url 
FROM public.brands 
WHERE is_shared = true 
ORDER BY id;
```

### Logo规格建议
- 格式：PNG或JPG
- 尺寸：200x200px以上（正方形）
- 大小：< 500KB

详细说明请查看：[LOGO_MANAGEMENT.md](LOGO_MANAGEMENT.md)

## 安全提醒

- ⚠️ 不要将 Supabase service_role key 用在前端
- ✅ 只使用 anon/public key
- ✅ 依赖 RLS 策略保护数据
- ✅ 定期检查安全策略是否正确
