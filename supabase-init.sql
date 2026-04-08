-- Supabase数据库初始化脚本

-- 步骤1: 创建基础表

-- 创建用户配置表（存储用户额外信息）
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  career_goal TEXT DEFAULT '',
  industry TEXT DEFAULT '',
  experience_years INTEGER DEFAULT 0,
  skills JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建求职记录表
CREATE TABLE IF NOT EXISTS job_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  uid UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  application_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT '已投递', -- 已投递, 面试中, 已结束, 正在沟通, 已面试
  match_score INTEGER DEFAULT 0,
  logo TEXT DEFAULT '',
  job_description TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建分析结果表
CREATE TABLE IF NOT EXISTS analysis_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  uid UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_record_id UUID REFERENCES job_records(id) ON DELETE SET NULL,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  match_score INTEGER NOT NULL,
  match_level TEXT NOT NULL,
  skill_alignment INTEGER NOT NULL,
  missing_keywords JSONB NOT NULL DEFAULT '[]',
  optimization_suggestions JSONB NOT NULL DEFAULT '[]',
  optimized_intro TEXT DEFAULT '',
  interview_questions JSONB NOT NULL DEFAULT '[]',
  resume_text TEXT DEFAULT '',
  job_description TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建面试记录表
CREATE TABLE IF NOT EXISTS interview_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  uid UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_record_id UUID REFERENCES job_records(id) ON DELETE SET NULL,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  interview_date DATE NOT NULL,
  interview_type TEXT DEFAULT '技术面试', -- 技术面试, HR面试, 终面
  status TEXT NOT NULL DEFAULT '已面试',
  qa JSONB NOT NULL DEFAULT '[]',
  reflection TEXT DEFAULT '',
  action_items JSONB NOT NULL DEFAULT '[]',
  interviewer_info TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建用户偏好设置表
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'light', -- light, dark
  email_notifications BOOLEAN DEFAULT true,
  ai_provider TEXT DEFAULT 'deepseek', -- deepseek, kimi
  language TEXT DEFAULT 'zh-CN',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建API使用记录表
CREATE TABLE IF NOT EXISTS api_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  uid UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  api_provider TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  request_time TIMESTAMP DEFAULT NOW(),
  response_time INTEGER DEFAULT 0, -- 毫秒
  status_code INTEGER DEFAULT 200,
  error_message TEXT DEFAULT '',
  token_usage INTEGER DEFAULT 0
);

-- 步骤2: 创建索引
CREATE INDEX IF NOT EXISTS idx_user_profiles_id ON user_profiles(id);
CREATE INDEX IF NOT EXISTS idx_job_records_uid ON job_records(uid);
CREATE INDEX IF NOT EXISTS idx_job_records_application_date ON job_records(application_date);
CREATE INDEX IF NOT EXISTS idx_analysis_results_uid ON analysis_results(uid);
CREATE INDEX IF NOT EXISTS idx_analysis_results_job_record_id ON analysis_results(job_record_id);
CREATE INDEX IF NOT EXISTS idx_analysis_results_created_at ON analysis_results(created_at);
CREATE INDEX IF NOT EXISTS idx_interview_records_uid ON interview_records(uid);
CREATE INDEX IF NOT EXISTS idx_interview_records_job_record_id ON interview_records(job_record_id);
CREATE INDEX IF NOT EXISTS idx_interview_records_interview_date ON interview_records(interview_date);
CREATE INDEX IF NOT EXISTS idx_user_preferences_id ON user_preferences(id);
CREATE INDEX IF NOT EXISTS idx_api_usage_uid ON api_usage(uid);
CREATE INDEX IF NOT EXISTS idx_api_usage_request_time ON api_usage(request_time);
CREATE INDEX IF NOT EXISTS idx_api_usage_api_provider ON api_usage(api_provider);

-- 步骤3: 创建函数

-- 创建函数：更新updated_at字段
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建函数：当新用户注册时自动创建用户配置和偏好设置
DROP FUNCTION IF EXISTS create_user_profile() CASCADE;
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  BEGIN
    -- 创建用户配置
    INSERT INTO user_profiles (id)
    VALUES (NEW.id)
    ON CONFLICT (id) DO NOTHING;
    
    -- 创建用户偏好设置
    INSERT INTO user_preferences (id)
    VALUES (NEW.id)
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    -- 忽略错误，确保用户注册流程不被中断
    RAISE NOTICE 'Error creating user profile: %', SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 步骤4: 创建触发器

-- 创建触发器：在更新时自动更新updated_at字段
-- 先删除已存在的触发器
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_job_records_updated_at ON job_records;
CREATE TRIGGER update_job_records_updated_at
BEFORE UPDATE ON job_records
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_analysis_results_updated_at ON analysis_results;
CREATE TRIGGER update_analysis_results_updated_at
BEFORE UPDATE ON analysis_results
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_interview_records_updated_at ON interview_records;
CREATE TRIGGER update_interview_records_updated_at
BEFORE UPDATE ON interview_records
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON user_preferences
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 创建触发器：当新用户注册时自动创建用户配置和偏好设置
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;
CREATE TRIGGER create_user_profile_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION create_user_profile();

-- 步骤5: 插入测试数据

-- 测试用户配置
INSERT INTO user_profiles (id, full_name, career_goal, industry, experience_years, skills)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  '测试用户',
  '成为高级软件工程师',
  '互联网',
  5,
  '["React", "TypeScript", "Node.js", "AWS"]'
)
ON CONFLICT (id) DO NOTHING;

-- 测试用户偏好设置
INSERT INTO user_preferences (id, theme, email_notifications, ai_provider)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'light',
  true,
  'deepseek'
)
ON CONFLICT (id) DO NOTHING;

-- 测试求职记录
INSERT INTO job_records (uid, company, position, application_date, status, match_score)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  '字节跳动',
  '高级软件工程师',
  CURRENT_DATE - INTERVAL '7 days',
  '面试中',
  92
)
ON CONFLICT DO NOTHING;

-- 测试分析结果
INSERT INTO analysis_results (uid, company, position, match_score, match_level, skill_alignment, missing_keywords, optimization_suggestions, optimized_intro, interview_questions)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  '字节跳动',
  '高级软件工程师',
  92,
  '极高匹配度',
  90,
  '["Go", "Kubernetes"]',
  '["添加更多项目经验", "强调团队协作能力"]',
  '我是一名经验丰富的软件工程师，擅长React和TypeScript，有5年工作经验，曾主导多个大型项目的开发。',
  '[{"type": "技术", "question": "什么是React hooks?", "starAdvice": "使用STAR方法回答", "highScorePoints": "解释hooks的概念和使用场景"}, {"type": "行为", "question": "如何处理团队冲突?", "starAdvice": "使用STAR方法回答", "highScorePoints": "强调沟通和解决问题的能力"}]'
)
ON CONFLICT DO NOTHING;

-- 测试面试记录
INSERT INTO interview_records (uid, company, position, interview_date, interview_type, status, qa, reflection, action_items)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  '字节跳动',
  '高级软件工程师',
  CURRENT_DATE - INTERVAL '3 days',
  '技术面试',
  '已面试',
  '[{"question": "请介绍一下你最自豪的项目", "answer": "我主导开发了一个大型电商平台的前端重构，提升了页面加载速度30%"}, {"question": "什么是闭包?", "answer": "闭包是指有权访问另一个函数作用域中变量的函数"}]',
  '面试表现良好，技术问题回答准确，但需要加强系统设计方面的准备',
  '[{"title": "系统设计学习", "text": "学习大型系统架构设计"}, {"title": "算法练习", "text": "刷LeetCode题目"}]'
)
ON CONFLICT DO NOTHING;

-- 测试API使用记录
INSERT INTO api_usage (uid, api_provider, endpoint, response_time, status_code, token_usage)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'deepseek',
  '/v1/chat/completions',
  1500,
  200,
  1200
)
ON CONFLICT DO NOTHING;
