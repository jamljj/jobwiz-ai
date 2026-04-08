export interface JobRecord {
  id: string;
  company: string;
  position: string;
  date: string;
  status: '已投递' | '面试中' | '已结束' | '正在沟通' | '已面试';
  matchScore: number;
  logo?: string;
}

export interface AnalysisResult {
  id: string;
  jobTitle: string;
  company: string;
  department: string;
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
