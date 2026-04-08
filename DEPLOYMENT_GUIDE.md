# JobWiz AI 部署指南

## 部署前准备

### 环境要求
- Node.js 16.0 或更高版本
- npm 或 yarn 包管理器
- Supabase 账号
- DeepSeek API 账号

### 配置文件准备

1. **创建 `.env` 文件**

```bash
cp .env.example .env
```

2. **配置环境变量**

编辑 `.env` 文件，填入以下配置：

```
# DeepSeek AI Configuration
VITE_DEEPSEEK_API_KEY="YOUR_DEEPSEEK_API_KEY"

# APP_URL: The URL where this applet is hosted.
APP_URL="http://localhost:3000"

# Supabase Configuration
VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
```

### Supabase 配置

1. **登录 Supabase 控制台**
   - 访问 [Supabase 控制台](https://supabase.com/dashboard)
   - 登录您的账号

2. **创建新项目**
   - 点击 "New project"
   - 输入项目名称（如 "jobwiz-ai"）
   - 选择数据库密码
   - 选择区域
   - 点击 "Create project"

3. **启用 Authentication**
   - 在左侧导航栏中选择 "Authentication"
   - 点击 "Providers"
   - 启用 "Email" 登录方式
   - 启用 "Google" 登录方式（可选）

4. **初始化数据库**
   - 在左侧导航栏中选择 "SQL Editor"
   - 复制 `supabase-init.sql` 文件的内容
   - 粘贴到 SQL Editor 中
   - 点击 "Run"

5. **获取 Supabase 配置**
   - 在左侧导航栏中选择 "Project Settings"
   - 在 "API" 标签中，找到 "Project API keys" 部分
   - 复制 "Project URL" 和 "anon public" 密钥到 `.env` 文件

### DeepSeek API 配置

1. **访问 DeepSeek 控制台**
   - 访问 [DeepSeek API 控制台](https://platform.deepseek.com/)
   - 登录您的账号

2. **创建 API 密钥**
   - 在左侧导航栏中选择 "API Keys"
   - 点击 "Create API Key"
   - 复制生成的 API 密钥到 `.env` 文件中的 `VITE_DEEPSEEK_API_KEY` 字段

## 构建与部署

### 构建项目

```bash
# 安装依赖
npm install

# 构建项目
npm run build
```

### 部署到 Vercel

1. **访问 Vercel 控制台**
   - 访问 [Vercel](https://vercel.com/)
   - 登录您的账号

2. **创建新项目**
   - 点击 "New Project"
   - 选择您的 Git 仓库
   - 点击 "Import"

3. **配置项目**
   - 配置构建命令：`npm run build`
   - 配置输出目录：`dist`

4. **添加环境变量**
   - 在 "Environment Variables" 部分，添加 `.env` 文件中的所有环境变量
   - 点击 "Add"

5. **部署项目**
   - 点击 "Deploy"
   - 等待部署完成

部署完成后，您将获得一个 Vercel 部署 URL，例如 `https://jobwiz-ai.vercel.app`。

## 监控系统设置

### Supabase 监控

1. **Supabase Dashboard**
   - 在 Supabase 控制台中，查看项目的使用情况和性能指标
   - 监控 API 调用次数、数据库查询和错误率

2. **Supabase Analytics**
   - 启用 Supabase Analytics 功能
   - 跟踪用户行为和系统性能

### 自定义监控

1. **API 调用监控**
   - 在 `aiService.ts` 中添加日志记录
   - 监控 API 调用次数、响应时间和错误率

2. **用户行为监控**
   - 添加用户行为事件跟踪
   - 监控页面访问、功能使用和转化率

3. **错误监控**
   - 添加全局错误处理
   - 记录和分析错误信息

## 部署后验证

### 功能验证

1. **用户认证**
   - 测试 Google 登录
   - 测试邮箱注册和登录

2. **简历分析**
   - 测试文件上传
   - 测试 AI 分析功能
   - 测试分析结果展示

3. **数据管理**
   - 测试分析结果保存
   - 测试面试记录创建、编辑和删除

### 性能验证

1. **页面加载时间**
   - 使用 Lighthouse 测试页面性能
   - 确保页面加载时间 < 3 秒

2. **API 响应时间**
   - 测试 AI 分析 API 响应时间
   - 确保响应时间 < 5 秒

3. **系统稳定性**
   - 连续执行多次分析操作
   - 测试系统是否稳定运行

### 安全验证

1. **API 密钥保护**
   - 确保 API 密钥不被公开
   - 检查网络请求中是否包含敏感信息

2. **数据安全**
   - 测试用户数据隔离
   - 确保数据传输加密

3. **输入验证**
   - 测试文件上传验证
   - 测试表单输入验证

## 维护与更新

### 定期维护

1. **依赖更新**
   - 定期更新项目依赖
   - 确保安全性和兼容性

2. **数据备份**
   - 定期导出 Supabase 数据
   - 存储备份到安全位置

3. **日志分析**
   - 定期分析监控日志
   - 识别和解决潜在问题

### 系统更新

1. **代码更新**
   - 提交代码到 Git 仓库
   - 触发 Vercel 自动部署流程

2. **配置更新**
   - 在 Vercel 项目设置中更新环境变量
   - 重新部署项目

3. **功能更新**
   - 添加新功能
   - 优化现有功能

## 故障排除

### 常见问题

1. **API 调用失败**
   - 检查 VITE_DEEPSEEK_API_KEY 是否正确
   - 检查网络连接
   - 检查 API 速率限制

2. **Supabase 认证失败**
   - 检查 Supabase 配置是否正确
   - 确保 Authentication 服务已启用
   - 检查数据库策略是否正确配置

3. **数据加载失败**
   - 检查 Supabase 数据库策略是否允许读取数据
   - 检查网络连接
   - 查看浏览器控制台错误信息

4. **构建失败**
   - 检查 TypeScript 类型错误
   - 确保所有依赖包已正确安装
   - 检查环境变量配置

### 紧急响应

1. **系统宕机**
   - 检查 Vercel 服务状态
   - 检查 Supabase 服务状态
   - 查看错误日志

2. **安全漏洞**
   - 立即更新依赖包
   - 修复安全漏洞
   - 重新部署项目

3. **性能下降**
   - 分析监控数据
   - 识别性能瓶颈
   - 优化代码和配置

## 结论

通过本指南，您可以成功部署 JobWiz AI 系统到 Vercel 平台，并设置完善的监控系统，确保系统的稳定性、安全性和性能。定期维护和更新将确保系统持续为用户提供高质量的职业分析服务。
