# 品牌Logo管理文档

## 概述

本文档说明如何为SushiCalc应用中的共享品牌管理logo图片。

**最简单的方法：执行schema.sql后，直接在Supabase Table Editor中编辑brands表！**

## Storage结构

- **Bucket名称**: `brand-logos`
- **访问权限**: 公开读取，认证用户可上传
- **URL格式**: `https://[project-id].supabase.co/storage/v1/object/public/brand-logos/[filename]`

## ⭐️ 推荐方式：Table Editor直接编辑

这是最直观、最简单的方法！

### 步骤：

1. **执行schema.sql**
   - 在Supabase SQL Editor中执行完整的schema.sql
   - 这会创建所有表和6个预置品牌

2. **进入Table Editor**
   - 在Supabase Dashboard左侧点击 **Table Editor**
   - 选择 **brands** 表

3. **直接编辑logo_url**
   - 找到要修改的品牌行（例如：id = 'sushiro'）
   - 点击该行的 **logo_url** 列
   - 直接粘贴新的URL
   - 按Enter保存

**就这么简单！**

## 其他管理方式

### 方式一：使用Supabase Storage上传

如果你想使用Supabase自己的Storage：

1. 在Dashboard进入 **Storage** → **brand-logos**
2. 点击 **Upload file** 上传图片（如sushiro.png）
3. 上传后点击文件，复制 **公开URL**
4. 在 **Table Editor** → **brands** 表中，粘贴URL到对应品牌的logo_url列

### 方式二：使用外部URL

直接使用任何公开的图片URL：

1. 准备好图片URL（如Google Storage、CDN等）
2. 在 **Table Editor** → **brands** 表中，粘贴URL到logo_url列

当前预置品牌使用的就是Google Storage的URL。

### 方式三：使用SQL命令

如果你更喜欢SQL：

**手动更新：**
```sql
UPDATE public.brands 
SET logo_url = 'https://你的URL'
WHERE id = 'sushiro';
```

**使用辅助函数（如果图片已上传到Storage）：**
```sql
UPDATE public.brands 
SET logo_url = get_brand_logo_url('sushiro')
WHERE id = 'sushiro';
```

## 完整工作流示例

## 当前品牌列表

| 品牌ID | 品牌名称 | 建议文件名 |
|--------|---------|-----------|
| sushiro | 寿司郎 | sushiro.png |
| kura | 藏寿司 | kura.png |
| genki | 元气寿司 | genki.png |
| sushi_express | 争鲜 | sushi_express.png |
| hama | 滨寿司 | hama.png |
| itamae | 板前寿司 | itamae.png |

## Logo规格建议

### 尺寸
- 推荐：400x400px（正方形）
- 最小：200x200px
- 格式：PNG（支持透明）或JPG

### 文件大小
- 推荐：< 200KB
- 最大：< 500KB

### 设计建议
- 使用品牌官方logo
- 透明背景（PNG）
- 高分辨率
- 居中对齐

## 查询命令

### 查看所有共享品牌logo状态
```sql
SELECT 
  id,
  name,
  logo_url,
  CASE 
    WHEN logo_url IS NULL THEN '❌ 未设置'
    WHEN logo_url LIKE '%supabase.co/storage%' THEN '✅ Supabase Storage'
    WHEN logo_url LIKE 'http%' THEN '⚠️ 外部URL'
    ELSE '❓ 未知'
  END as logo_status
FROM public.brands
WHERE is_shared = true
ORDER BY id;
```

### 查看Storage中的所有文件
```sql
SELECT 
  name as 文件名,
  metadata->>'size' as 大小_字节,
  created_at as 上传时间
FROM storage.objects
WHERE bucket_id = 'brand-logos'
ORDER BY created_at DESC;
```

## 清理和维护

### 删除未使用的logo文件

1. 查看所有Storage文件
2. 对比brands表中实际使用的URL
3. 在Dashboard中手动删除未使用的文件

### 重置为外部URL

如果Storage有问题，可以暂时使用外部URL（如Google Storage）：

```sql
-- 执行 manage_brand_logos.sql 中的重置脚本部分
-- 取消注释即可恢复使用Google存储的原始logo
```

## API接口（开发用）

虽然前端不使用，但提供了完整的Storage API（`services/storageService.ts`）：

```typescript
// 上传logo
const logoUrl = await uploadBrandLogo(file, 'sushiro');

// 更新数据库
await updateBrandLogoUrl('sushiro', logoUrl);

// 完整流程
const newUrl = await uploadAndUpdateBrandLogo(file, 'sushiro', oldUrl);
```

## 故障排除

### Q: 上传后图片不显示
**A**: 检查：
1. Storage bucket是否设置为public
2. URL是否正确
3. 文件是否成功上传（检查Storage Dashboard）

### Q: 无法上传文件
**A**: 确认：
1. 已执行schema.sql中的Storage bucket创建语句
2. Storage policies已正确设置
3. 用户已登录（认证状态）

### Q: 如何批量替换logo
**A**: 
1. 准备所有logo文件（统一命名）
2. 在Dashboard批量上传
3. 执行 `manage_brand_logos.sql` 中的批量更新脚本

## 权限说明

- ✅ **读取**: 所有人（公开）
- ✅ **上传**: 已认证用户
- ✅ **更新/删除**: 文件所有者
- ⚠️ **管理员**: 通过SQL可以更新任何品牌的logo_url字段

## 下一步

1. 在Supabase执行更新后的 `schema.sql`（包含Storage配置）
2. 准备6个品牌的logo图片
3. 上传到 `brand-logos` bucket
4. 使用 `manage_brand_logos.sql` 更新数据库
