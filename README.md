# SushiCalc - 寿司计算器

一个全栈寿司餐饮计算和记录应用，使用 React + Supabase 构建。

## 功能特性

- 🍣 多品牌寿司价格计算
- 📊 餐饮历史记录
- 👤 用户账户系统
- 🌐 多语言支持
- 💰 多货币支持
- 📱 响应式设计

## 技术栈

- **前端**: React 19 + TypeScript + Vite
- **后端**: Supabase (PostgreSQL + Auth)
- **样式**: Tailwind CSS (通过index.html中的CDN)
- **路由**: React Router DOM

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 Supabase

#### 2.1 创建 Supabase 项目

1. 访问 [https://supabase.com](https://supabase.com)
2. 创建一个新项目
3. 等待项目初始化完成

#### 2.2 设置数据库

在 Supabase 控制台的 SQL Editor 中执行以下操作：

1. **创建数据库架构并导入初始数据**
   - 打开 `supabase/schema.sql`
   - 复制全部内容
   - 在 Supabase SQL Editor 中执行
   - 这将创建所有表、索引、安全策略，并导入6个预置的寿司品牌数据

#### 2.3 配置环境变量

1. 在 Supabase 项目设置中找到 API 凭证：
   - 进入 `Settings` → `API`
   - 复制 `Project URL` 和 `anon public` key

2. 更新 `.env.local` 文件（已配置）：
   ```
   VITE_SUPABASE_URL=你的项目URL
   VITE_SUPABASE_ANON_KEY=你的匿名密钥
   ```

### 3. 运行开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:5173` 上运行。

### 4. 构建生产版本

```bash
npm run build
npm run preview
```

## 数据库架构

### 表结构

- `user_profiles` - 用户配置信息（语言、货币等）
- `brands` - 寿司品牌配置
- `meal_records` - 餐饮历史记录
- `meal_items` - 餐饮记录中的具体项目

### Storage

- `brand-logos` - 品牌logo图片存储bucket（公开访问）

详细管理说明请查看：[supabase/LOGO_MANAGEMENT.md](supabase/LOGO_MANAGEMENT.md)

### 安全策略

使用 Row Level Security (RLS) 确保：
- 用户只能访问自己的数据
- 共享品牌对所有用户可见
- 用户配置与 Supabase Auth 绑定

## 使用说明

### 注册和登录

1. **注册账户**: 使用邮箱和密码注册
2. **登录**: 使用注册的邮箱登录
3. **访客模式**: 点击"游客登录"体验功能（数据不会保存）

### 计算餐费

1. 在首页选择寿司品牌
2. 添加不同颜色的盘子数量
3. 添加小食和饮料（如有）
4. 设置人数和服务费
5. 查看总价并保存记录

### 查看历史

- 在"历史"标签页查看所有餐饮记录
- 点击记录查看详细信息

### 自定义品牌

- 可以创建自己的品牌配置
- 设置多种颜色的盘子和价格
- 添加小食菜单

## 项目结构

```
sushicalc/
├── lib/
│   └── supabaseClient.ts      # Supabase 客户端配置
├── services/
│   ├── authService.ts         # 认证服务
│   ├── brandService.ts        # 品牌管理服务
│   └── mealService.ts         # 餐饮记录服务
├── screens/
│   ├── LoginScreen.tsx        # 登录/注册页面
│   ├── HomeScreen.tsx         # 首页（品牌列表）
│   ├── CalculatorScreen.tsx   # 计算器页面
│   ├── HistoryScreen.tsx      # 历史记录列表
│   ├── HistoryDetailScreen.tsx # 历史记录详情
│   ├── ProfileScreen.tsx      # 用户配置
│   └── BrandFormScreen.tsx    # 品牌编辑
├── supabase/
│   ├── schema.sql             # 数据库架构
│   └── seed.sql               # 种子数据
├── App.tsx                    # 主应用组件
├── types.ts                   # TypeScript 类型定义
├── constants.ts               # 常量和模拟数据
└── i18n.ts                    # 国际化配置
```

## 开发注意事项

- 所有数据操作都通过 services 层完成
- 访客模式下的数据仅保存在本地状态
- 登录用户的数据会自动同步到 Supabase
- 使用 Row Level Security 保护用户数据

## 故障排除

### 数据库连接失败

1. 检查 `.env.local` 配置是否正确
2. 确认 Supabase 项目是否正常运行
3. 检查网络连接

### 认证问题

1. 确认邮箱格式正确
2. 密码至少6位字符
3. 检查 Supabase Auth 设置

### 构建错误

1. 删除 `node_modules` 和 `package-lock.json`
2. 重新运行 `npm install`
3. 清除浏览器缓存

## 许可证

MIT
