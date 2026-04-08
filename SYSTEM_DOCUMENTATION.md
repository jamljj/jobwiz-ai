# JobWiz AI 系统文档

## 项目概述

JobWiz AI 是一个基于 React 和 TypeScript 开发的 AI 驱动职业分析平台，旨在帮助求职者通过 AI 技术优化简历、预测面试问题并提升求职竞争力。

## 技术架构

### 前端技术栈
- **React 19.0.0**：现代前端框架
- **TypeScript**：类型安全的代码开发
- **Vite**：快速构建工具
- **Tailwind CSS**：实用优先的 CSS 框架
- **Firebase**：认证和数据存储
- **React Router**：路由管理
- **Google GenAI**：AI 分析功能
- **Lucide React**：图标库
- **Motion**：动画效果

### 后端服务
- **Firebase Authentication**：用户认证
- **Firebase Firestore**：数据存储
- **Google Gemini API**：AI 分析服务

## 项目结构

```
src/
├── components/          # 组件目录
│   └── Layout.tsx       # 布局组件
├── lib/                # 工具库
│   ├── aiService.ts     # AI 服务封装
│   └── utils.ts        # 工具函数
├── pages/              # 页面目录
│   ├── Home.tsx        # 首页
│   ├── Login.tsx       # 登录页面
│   ├── Dashboard.tsx   # 仪表盘
│   ├── NewAnalysis.tsx # 新分析页面
│   ├── AnalysisResult.tsx # 分析结果页面
│   └── Records.tsx     # 记录页面
├── App.tsx             # 应用主组件
├── firebase.ts         # Firebase 配置
├── types.ts            # 类型定义
└── main.tsx            # 应用入口
```

## 核心功能

### 1. 用户认证系统
- **支持方式**：
  - Google 第三方登录
  - 邮箱密码登录
  - 邮箱密码注册
- **保护路由**：通过 `ProtectedRoute` 组件实现，确保未登录用户无法访问受限页面

### 2. 简历分析功能
- **功能描述**：用户上传简历并输入岗位信息，系统进行深度分析
- **分析内容**：
  - 简历与岗位匹配度
  - 技能对齐度
  - 缺失关键词
  - 优化建议
  - 面试问题预测
- **实现流程**：
  1. 用户上传简历文件
  2. 输入公司、岗位、JD 描述等信息
  3. 系统进行 AI 分析
  4. 展示分析结果和建议

### 3. 数据管理
- **数据存储**：使用 Firebase Firestore
- **核心数据模型**：
  - `JobRecord`：求职记录，包含公司、职位、状态等信息
  - `AnalysisResult`：分析结果，包含匹配度、技能对齐度、优化建议等
  - `InterviewRecord`：面试记录，包含问答、反思和改进项

### 4. 界面设计
- **设计风格**：现代化、简洁、专业
- **动画效果**：使用 Motion 库实现流畅的过渡动画
- **响应式设计**：适配不同屏幕尺寸
- **视觉层次**：通过卡片、阴影、渐变等元素创建层次感

## API 文档

### AI 分析 API

#### 分析简历
- **接口**：Google Gemini API
- **参数**：
  - `resume`：简历内容
  - `company`：目标公司
  - `position`：申请岗位
  - `jd`：岗位描述
  - `summary`：个人简介（可选）
- **响应**：
  - `matchScore`：匹配度（0-100）
  - `skillAlignment`：技能对齐度（0-100）
  - `missingKeywords`：缺失关键词数组
  - `optimizationSuggestions`：优化建议数组
  - `optimizedIntro`：优化后的个人简介
  - `interviewQuestions`：预测的面试问题数组

### Firebase 数据库操作

#### 分析结果
- **集合**：`analysis_results`
- **字段**：
  - `uid`：用户 ID
  - `company`：公司名称
  - `position`：职位名称
  - `matchScore`：匹配度
  - `matchLevel`：匹配等级
  - `optimizationSuggestions`：优化建议
  - `aiIntro`：AI 优化的个人简介
  - `interviewQuestions`：预测的面试问题
  - `skillsAlignment`：技能对齐度
  - `missingKeywords`：缺失关键词
  - `createdAt`：创建时间

#### 面试记录
- **集合**：`interview_records`
- **字段**：
  - `uid`：用户 ID
  - `company`：公司名称
  - `position`：职位名称
  - `date`：面试日期
  - `status`：面试状态
  - `qa`：问答记录数组
  - `reflection`：复盘反思
  - `actionItems`：改进项数组
  - `createdAt`：创建时间

## 环境配置

### 环境变量

创建 `.env` 文件并配置以下变量：

```
# GEMINI_API_KEY: Required for Gemini AI API calls.
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# APP_URL: The URL where this applet is hosted.
APP_URL="http://localhost:3000"

# Firebase Configuration
VITE_FIREBASE_API_KEY="YOUR_FIREBASE_API_KEY"
VITE_FIREBASE_AUTH_DOMAIN="YOUR_FIREBASE_AUTH_DOMAIN"
VITE_FIREBASE_PROJECT_ID="YOUR_FIREBASE_PROJECT_ID"
VITE_FIREBASE_STORAGE_BUCKET="YOUR_FIREBASE_STORAGE_BUCKET"
VITE_FIREBASE_MESSAGING_SENDER_ID="YOUR_FIREBASE_MESSAGING_SENDER_ID"
VITE_FIREBASE_APP_ID="YOUR_FIREBASE_APP_ID"
VITE_FIREBASE_MEASUREMENT_ID="YOUR_FIREBASE_MEASUREMENT_ID"
```

### Firebase 配置

1. 登录 Firebase 控制台
2. 创建新项目
3. 启用 Authentication（支持 Google 和 Email/Password）
4. 创建 Firestore 数据库
5. 配置安全规则
6. 获取项目配置信息并填入 `.env` 文件

## 部署指南

### 构建项目

```bash
npm run build
```

### 部署到 Firebase Hosting

1. 安装 Firebase CLI

```bash
npm install -g firebase-tools
```

2. 登录 Firebase

```bash
firebase login
```

3. 初始化 Firebase 项目

```bash
firebase init
```

4. 选择 Hosting 服务
5. 配置部署目录为 `dist`
6. 部署项目

```bash
firebase deploy
```

### 部署到其他平台

项目可以部署到任何支持静态网站的平台，如：
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

## 安全注意事项

1. **API 密钥保护**：确保 GEMINI_API_KEY 和 Firebase 配置信息不被公开
2. **数据验证**：对用户输入进行严格验证，防止恶意输入
3. **权限控制**：确保用户只能访问自己的数据
4. **速率限制**：实施 API 调用速率限制，防止滥用
5. **数据加密**：确保敏感数据在传输和存储过程中得到保护

## 维护指南

### 日志管理
- 使用 Firebase 控制台查看 Authentication 和 Firestore 日志
- 配置错误监控和报警

### 性能监控
- 使用 Firebase Performance Monitoring 监控应用性能
- 定期分析页面加载时间和 API 响应时间

### 数据备份
- 启用 Firestore 自动备份
- 定期导出数据到安全位置

### 系统更新
- 定期更新依赖包，确保安全性
- 及时应用 Firebase 和 Google GenAI API 的更新

## 故障排除

### 常见问题

1. **API 调用失败**
   - 检查 GEMINI_API_KEY 是否正确
   - 检查网络连接
   - 检查 API 速率限制

2. **Firebase 认证失败**
   - 检查 Firebase 配置是否正确
   - 确保 Authentication 服务已启用
   - 检查安全规则是否正确配置

3. **数据加载失败**
   - 检查 Firestore 规则是否允许读取数据
   - 检查网络连接
   - 查看浏览器控制台错误信息

4. **构建失败**
   - 检查 TypeScript 类型错误
   - 确保所有依赖包已正确安装
   - 检查环境变量配置

## 联系方式

如有任何问题或建议，请联系：

- 项目维护者：[Your Name]
- 邮箱：[your.email@example.com]
- GitHub：[your-github-username/jobwiz-ai]
