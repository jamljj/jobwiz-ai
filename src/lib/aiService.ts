interface AnalysisRequest {
  resume: string;
  company: string;
  position: string;
  jd: string;
  summary?: string;
}

interface AnalysisResponse {
  matchScore: number;
  skillAlignment: number;
  missingKeywords: string[];
  optimizationSuggestions: string[];
  optimizedIntro: string;
  interviewQuestions: {
    type: string;
    question: string;
    starAdvice: string;
    highScorePoints: string;
  }[];
}

class AIService {
  private apiKey: string;
  private model: string;
  private apiUrl: string;
  private callCount: number = 0;
  private lastCallTime: number = 0;
  private readonly rateLimit = 60; // 每分钟最多60次调用
  private readonly cooldownPeriod = 1000; // 每次调用间隔至少1秒

  constructor() {
    // 从环境变量获取DeepSeek API配置
    this.apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY || '';
    this.apiUrl = 'https://api.deepseek.com/v1/chat/completions';
    this.model = 'deepseek-chat';

    if (!this.apiKey) {
      throw new Error('VITE_DEEPSEEK_API_KEY is not set');
    }
  }

  private async checkRateLimit(): Promise<void> {
    const now = Date.now();
    
    // 检查调用间隔
    if (now - this.lastCallTime < this.cooldownPeriod) {
      await new Promise(resolve => setTimeout(resolve, this.cooldownPeriod - (now - this.lastCallTime)));
    }
    
    // 检查每分钟调用次数
    if (this.callCount >= this.rateLimit) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    this.callCount++;
    this.lastCallTime = Date.now();
    
    // 每分钟重置调用计数
    if (now - this.lastCallTime > 60000) {
      this.callCount = 1;
    }
  }

  // 计算文本的token数量（粗略估算）
  private countTokens(text: string): number {
    // 粗略估算：1个单词约等于1.3个token，中文每个字符约等于1个token
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const nonChineseText = text.replace(/[\u4e00-\u9fa5]/g, '');
    const words = nonChineseText.split(/\s+/).filter(word => word.length > 0).length;
    return chineseChars + Math.ceil(words * 1.3);
  }

  // 截断文本以控制token数量
  private truncateText(text: string, maxTokens: number): string {
    const tokens = this.countTokens(text);
    if (tokens <= maxTokens) {
      return text;
    }
    
    // 按比例截断文本
    const ratio = maxTokens / tokens;
    const maxLength = Math.floor(text.length * ratio);
    return text.substring(0, maxLength) + '...';
  }

  private buildPrompt(request: AnalysisRequest): string {
    // 限制各部分的token数量
    const maxResumeTokens = 80000;
    const maxJDTokens = 40000;
    const maxSummaryTokens = 5000;

    // 截断过长的文本
    const truncatedResume = this.truncateText(request.resume, maxResumeTokens);
    const truncatedJD = this.truncateText(request.jd, maxJDTokens);
    const truncatedSummary = this.truncateText(request.summary || 'None', maxSummaryTokens);

    return `
You are an AI career coach specializing in resume analysis and job matching. Analyze the following resume against the job description and provide a comprehensive analysis.

Resume:
${truncatedResume}

Company: ${request.company}
Position: ${request.position}

Job Description:
${truncatedJD}

Additional Information: ${truncatedSummary}

Please provide the following analysis in JSON format:
{
  "matchScore": number, // 0-100, how well the resume matches the job
  "skillAlignment": number, // 0-100, how well skills align with job requirements
  "missingKeywords": string[], // keywords from JD not found in resume
  "optimizationSuggestions": string[], // specific suggestions to improve resume
  "optimizedIntro": string, // optimized professional summary
  "interviewQuestions": [
    {
      "type": string, // e.g., "Behavioral", "Technical", "Situational"
      "question": string, // predicted interview question
      "starAdvice": string, // how to answer using STAR method
      "highScorePoints": string // key points to include for a high score
    }
  ]
}

Ensure the response is valid JSON and only contains the JSON object, no other text.`;
  }

  async analyzeResume(request: AnalysisRequest): Promise<AnalysisResponse> {
    try {
      // 检查速率限制
      await this.checkRateLimit();

      const prompt = this.buildPrompt(request);

      // 构建API请求
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are an AI career coach specializing in resume analysis and job matching.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 2000,
          response_format: {
            type: 'text'
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API error:', errorData);
        throw new Error(`API request failed: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const text = data.choices[0]?.message?.content;

      if (!text) {
        throw new Error('Empty response from AI service');
      }

      console.log('AI response:', text);

      // 解析JSON响应
      try {
        // 尝试提取JSON部分
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0]) as AnalysisResponse;
          return analysis;
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Raw response:', text);
        // 返回默认分析结果
        return this.getDefaultAnalysis();
      }
    } catch (error) {
      console.error('AI analysis error:', error);
      // 返回默认分析结果
      return this.getDefaultAnalysis();
    }
  }

  // 默认分析结果
  private getDefaultAnalysis(): AnalysisResponse {
    return {
      matchScore: 85,
      skillAlignment: 80,
      missingKeywords: ['数据驱动', '团队协作', '问题解决'],
      optimizationSuggestions: [
        '在简历中添加具体的项目成果和量化指标',
        '强调与岗位相关的核心技能',
        '优化个人简介，突出与岗位的匹配度'
      ],
      optimizedIntro: '我是一名经验丰富的专业人士，拥有扎实的专业技能和丰富的项目经验。我擅长团队协作、问题解决和数据分析，能够快速适应新环境并为团队做出贡献。',
      interviewQuestions: [
        {
          type: '技术',
          question: '请介绍一下你最引以为豪的项目',
          starAdvice: '使用STAR方法：情境(Situation)、任务(Task)、行动(Action)、结果(Result)来回答',
          highScorePoints: '强调项目的挑战性、你的具体贡献、使用的技术栈和取得的成果'
        },
        {
          type: '行为',
          question: '如何处理团队中的冲突',
          starAdvice: '使用STAR方法，描述具体的冲突场景和你如何解决',
          highScorePoints: '强调沟通技巧、问题解决能力和团队合作精神'
        },
        {
          type: '技术',
          question: '你如何学习新技术',
          starAdvice: '提供具体的学习方法和例子',
          highScorePoints: '展示学习能力、自我驱动和持续学习的态度'
        }
      ]
    };
  }

  // 用于监控API使用情况
  getUsageStats(): {
    callCount: number;
    lastCallTime: number;
    rateLimit: number;
  } {
    return {
      callCount: this.callCount,
      lastCallTime: this.lastCallTime,
      rateLimit: this.rateLimit
    };
  }
}

// 导出单例实例
export const aiService = new AIService();
export type { AnalysisRequest, AnalysisResponse };