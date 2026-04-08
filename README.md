# JobWiz AI

## 项目介绍

JobWiz AI 是一个基于 React 和 TypeScript 开发的 AI 驱动职业分析平台，旨在帮助求职者通过 AI 技术优化简历、预测面试问题并提升求职竞争力。

## 技术栈

- **前端框架**：React 19.0.0 + TypeScript
- **构建工具**：Vite
- **样式框架**：Tailwind CSS
- **认证和数据库**：Supabase
- **AI 服务**：DeepSeek（国产大模型）
- **路由管理**：React Router
- **图标库**：Lucide React
- **动画效果**：Motion

## 核心功能

1. **用户认证**：支持邮箱密码登录和 Google 第三方登录
2. **简历分析**：上传简历并输入岗位信息，AI 进行深度分析
3. **匹配度分析**：评估简历与岗位的匹配度，提供详细的技能对齐度分析
4. **优化建议**：针对简历提供具体的优化建议和改进方向
5. **面试预测**：基于岗位和公司文化，预测可能的面试问题
6. **记录管理**：管理求职记录和面试记录，跟踪求职进度

## 快速开始

### 环境要求

- Node.js 16.0 或更高版本
- npm 或 yarn 包管理器

### 安装依赖

```bash
npm install
```

### 配置环境变量

复制 `.env.example` 文件为 `.env`，并填写以下配置：

```env
# DeepSeek AI Configuration
VITE_DEEPSEEK_API_KEY="YOUR_DEEPSEEK_API_KEY"

# Supabase Configuration
VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
```

### 运行开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

## 数据库配置

1. 在 Supabase 控制台创建新项目
2. 在 SQL Editor 中运行 `supabase-init.sql` 脚本初始化数据库
3. 配置 Authentication，启用 Email/Password 和 Google 登录
4. 获取项目的 URL 和匿名密钥，填入 `.env` 文件

## 部署

### Vercel

1. 登录 Vercel 控制台
2. 点击 "New Project"
3. 选择 GitHub 仓库
4. 配置构建命令：`npm run build`
5. 配置输出目录：`dist`
6. 点击 "Deploy"
7. 在 Vercel 项目设置中添加环境变量（与 `.env` 文件相同）

## 项目结构

```
src/
├── components/          # 组件目录
│   └── Layout.tsx       # 布局组件
├── lib/                # 工具库
│   ├── aiService.ts     # AI 服务
│   └── utils.ts        # 工具函数
├── pages/              # 页面目录
│   ├── Home.tsx        # 首页
│   ├── Login.tsx       # 登录页面
│   ├── Dashboard.tsx   # 仪表盘
│   ├── NewAnalysis.tsx # 新分析页面
│   ├── AnalysisResult.tsx # 分析结果页面
│   └── Records.tsx     # 记录页面
├── App.tsx             # 应用主组件
├── supabase.ts         # Supabase 配置
├── types.ts            # 类型定义
└── main.tsx            # 应用入口
```

## 许可证

MIT
