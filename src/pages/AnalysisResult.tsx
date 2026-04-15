import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Copy, Rocket, History, Save, Sparkles, BarChart3, MessageSquare, TrendingUp, Lightbulb, Loader2, Building2, ArrowLeft, Share2 } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase, handleSupabaseError, OperationType } from '../supabase';
import { cn } from '@/src/lib/utils';
import type { AnalysisResponse } from '../lib/aiService';

interface LocationState {
  company: string;
  position: string;
  jd: string;
  summary: string;
  fileName: string;
  analysisResult: AnalysisResponse;
}

export default function AnalysisResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  
  if (!state || !state.analysisResult) {
    navigate('/analysis');
    return null;
  }

  const formData = {
    company: state.company || '目标公司',
    position: state.position || '申请岗位',
    jd: state.jd || '',
    summary: state.summary || '',
    fileName: state.fileName || 'resume.pdf'
  };

  const analysisData = state.analysisResult;
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSaveResult = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('请先登录以保存分析结果');
      return;
    }
    if (!analysisData) return;

    setSaving(true);
    try {
      // 首先保存求职记录
      const { data: jobRecord, error: jobError } = await supabase
        .from('job_records')
        .insert({
          uid: user.id,
          company: formData.company,
          position: formData.position,
          application_date: new Date().toISOString(),
          status: '已投递',
          match_score: analysisData.matchScore,
          job_description: formData.jd
        })
        .select('id')
        .single();

      if (jobError) {
        handleSupabaseError(jobError, OperationType.CREATE, 'job_records');
        alert('保存求职记录失败，请稍后重试');
        return;
      }

      // 然后保存分析结果
      const resultData = {
        uid: user.id,
        job_record_id: jobRecord.id,
        company: formData.company,
        position: formData.position,
        match_score: analysisData.matchScore,
        match_level: matchLevel,
        skill_alignment: analysisData.skillAlignment,
        missing_keywords: analysisData.missingKeywords,
        optimization_suggestions: analysisData.optimizationSuggestions,
        optimized_intro: analysisData.optimizedIntro || analysisData.aiIntro,
        interview_questions: analysisData.interviewQuestions,
        job_description: formData.jd,
        resume_text: formData.summary
      };

      const { error } = await supabase
        .from('analysis_results')
        .insert(resultData);

      if (error) {
        console.error('保存分析结果错误:', error);
        handleSupabaseError(error, OperationType.CREATE, 'analysis_results');
        alert('保存分析结果失败，请稍后重试');
      } else {
        setSaved(true);
        setTimeout(() => {
          navigate('/records');
        }, 1500);
      }
    } catch (error) {
      console.error('保存失败:', error);
      handleSupabaseError(error, OperationType.CREATE, 'analysis_results');
      alert('保存失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  // 计算匹配等级
  const getMatchLevel = (score: number): string => {
    if (score >= 90) return '极高匹配度';
    if (score >= 75) return '高度匹配';
    if (score >= 60) return '中等匹配';
    return '较低匹配';
  };

  const matchLevel = getMatchLevel(analysisData.matchScore);

  return (
    <main className="pt-12 pb-32 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <header className="mb-12 flex flex-col md:flex-row items-center justify-between gap-8 bg-white p-8 rounded-[32px] shadow-xl shadow-on-surface/5 border border-outline-variant/10">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-xs font-bold mb-4">
            <CheckCircle2 className="w-4 h-4" />
            深度对齐分析已完成
          </div>
          <h1 className="text-4xl font-black text-on-surface mb-2 tracking-tight leading-tight">{formData.position}</h1>
          <div className="flex items-center gap-4 text-on-surface-variant font-bold">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              {formData.company}
            </div>
            <div className="w-1 h-1 rounded-full bg-outline-variant"></div>
            <div className="flex items-center gap-2">
              <span className="text-xs opacity-60">简历文件:</span>
              <span className="text-xs text-primary">{formData.fileName}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-center gap-6">
          <div className="relative flex items-center justify-center">
            <div className="w-32 h-32 rounded-full flex items-center justify-center relative">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  className="text-surface-container-highest"
                />
                <motion.circle
                  initial={{ strokeDashoffset: 364 }}
                  animate={{ strokeDashoffset: 364 * (1 - analysisData.matchScore / 100) }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  cx="64"
                  cy="64"
                  r="58"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={364}
                  className="text-primary"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-on-surface">{analysisData.matchScore}</span>
                <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-black">Score</span>
              </div>
            </div>
            <div className="absolute -bottom-2 bg-on-surface text-white text-[10px] px-4 py-1 rounded-full font-black shadow-lg">
              {matchLevel}
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Resume Analysis */}
        <section className="lg:col-span-5 flex flex-col gap-8">
          <div className="bg-white p-8 rounded-[32px] border border-outline-variant/10 shadow-xl shadow-on-surface/5">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              简历匹配深度分析
            </h3>
            
            <div className="space-y-8">
              <div>
                <div className="flex justify-between text-sm mb-3">
              <span className="font-black text-on-surface">岗位硬技能对齐度</span>
              <span className="text-primary font-black">{analysisData.skillAlignment}%</span>
            </div>
            <div className="h-3 bg-surface-container-highest rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${analysisData.skillAlignment}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-primary rounded-full"
              ></motion.div>
            </div>
              </div>
              
              <div>
                <p className="text-sm font-black text-on-surface mb-4">待补充核心关键词</p>
                <div className="flex flex-wrap gap-2">
                  {analysisData.missingKeywords.map((keyword) => (
                    <span key={keyword} className="px-4 py-2 bg-error/5 text-error rounded-xl text-xs font-bold flex items-center gap-2 border border-error/10">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="pt-8 border-t border-outline-variant/10">
                <p className="text-sm font-black text-on-surface mb-6">优化策略建议</p>
                <ul className="space-y-5">
                  {analysisData.optimizationSuggestions.map((text, i) => (
                    <li key={i} className="flex gap-4 group">
                      <span className="w-7 h-7 flex-shrink-0 bg-primary/10 text-primary text-xs font-black rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">{i + 1}</span>
                      <p className="text-sm leading-relaxed text-on-surface-variant font-medium">{text}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Optimized Intro */}
        <section className="lg:col-span-7">
          <div className="bg-on-surface p-8 md:p-10 rounded-[32px] h-full flex flex-col shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            
            <div className="flex justify-between items-start mb-8 relative z-10">
              <h3 className="text-2xl font-black text-white flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-primary fill-primary" />
                AI 优化个人简介
              </h3>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(analysisData.aiIntro);
                  alert('已复制到剪贴板');
                }}
                className="flex items-center gap-2 text-xs font-black text-white/80 hover:text-white hover:bg-white/10 px-4 py-2 rounded-xl transition-all border border-white/10"
              >
                <Copy className="w-4 h-4" />
                复制全文
              </button>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl text-white/90 leading-relaxed text-lg mb-10 relative italic border border-white/5 flex-grow">
              <MessageSquare className="absolute -top-4 -left-4 text-primary/20 w-12 h-12 fill-primary/20" />
              “{analysisData.optimizedIntro}”
            </div>
            
            <div className="relative z-10">
              <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-6">修改要点解析</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-4 p-5 bg-white/5 rounded-2xl border border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-white mb-1">行业黑话对齐</p>
                    <p className="text-xs text-white/50 leading-relaxed">融入了该岗位及公司高频出现的上下文词汇，提升专业感。</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-5 bg-white/5 rounded-2xl border border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary shrink-0">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-white mb-1">结果导向重塑</p>
                    <p className="text-xs text-white/50 leading-relaxed">将描述性文字转化为数据量化的产出描述，符合面试官预期。</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Section: Interview Questions */}
        <section className="lg:col-span-12">
          <div className="bg-white p-8 md:p-10 rounded-[32px] shadow-xl shadow-on-surface/5 border border-outline-variant/10">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
              <h3 className="text-2xl font-black flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-primary" />
                高频面试真题预测 & 满分策略
              </h3>
              <div className="flex items-center gap-3 text-xs font-bold text-on-surface-variant bg-surface-container-low px-4 py-2 rounded-full">
                <span className="flex h-2.5 w-2.5 rounded-full bg-primary animate-pulse"></span>
                已针对 {formData.company} 企业文化进行针对性预测
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {analysisData.interviewQuestions.map((q, i) => (
                <div key={i} className="group p-8 rounded-[32px] border border-outline-variant/10 hover:border-primary/30 hover:bg-primary/5 transition-all flex flex-col h-full bg-surface-container-lowest">
                  <div className="flex justify-between items-start mb-6">
                    <span className="bg-on-surface text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">{q.type}</span>
                    <button className="p-2 hover:bg-primary/10 rounded-lg transition-colors">
                      <Copy className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </div>
                  <h4 className="font-black text-xl mb-4 leading-tight group-hover:text-primary transition-colors">{q.question}</h4>
                  {q.resumeBasis && (
                    <div className="p-3 bg-tertiary/5 rounded-xl border border-tertiary/10 mb-4">
                      <span className="text-[10px] font-black text-tertiary uppercase mb-1 block tracking-widest">简历依据</span>
                      <p className="text-xs text-tertiary leading-relaxed font-medium">{q.resumeBasis}</p>
                    </div>
                  )}
                  <div className="mt-auto space-y-4">
                    <div className="p-5 bg-white rounded-2xl border border-outline-variant/10 shadow-sm">
                      <span className="text-[10px] font-black text-primary uppercase mb-2 block tracking-widest">STAR 核心建议</span>
                      <p className="text-xs text-on-surface-variant leading-relaxed italic font-medium">{q.starAdvice}</p>
                    </div>
                    <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10">
                      <span className="text-[10px] font-black text-primary uppercase mb-2 block tracking-widest">高分回答点</span>
                      <p className="text-xs text-on-surface-variant leading-relaxed font-medium">{q.highScorePoints}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="flex items-center justify-center border-4 border-dashed border-outline-variant/10 rounded-[32px] p-10 bg-surface-container-low/30 cursor-pointer hover:bg-surface-container-low hover:border-primary/20 transition-all group">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                    <Lightbulb className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-sm text-on-surface font-black mb-1">生成更多题目</p>
                  <p className="text-xs text-on-surface-variant font-medium">点击生成更多针对性面试真题</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Fixed Footer Actions */}
      <footer className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl border-t border-outline-variant/10 py-6 px-8 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4 text-on-surface-variant text-sm font-bold">
            <div className="bg-primary/10 p-2 rounded-xl">
              <Sparkles className="w-5 h-5 text-primary fill-primary" />
            </div>
            <span>AI 实时建议：匹配度极高，建议立即保存分析并准备面试。</span>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <button 
              onClick={handleSaveResult}
              disabled={saving || saved}
              className={cn(
                "flex-1 md:flex-none px-8 py-3.5 rounded-2xl text-sm font-black transition-all border flex items-center justify-center gap-3",
                saved 
                  ? "bg-green-500 text-white border-green-500" 
                  : "bg-on-surface text-white hover:bg-on-surface/90 shadow-xl shadow-on-surface/20"
              )}
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : saved ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
              {saved ? '已保存到我的记录' : '保存分析结果'}
            </button>
            <button className="hidden md:flex px-6 py-3.5 rounded-2xl text-sm font-black bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-all items-center gap-3">
              <Share2 className="w-5 h-5" />
              分享报告
            </button>
          </div>
        </div>
      </footer>
    </main>
  );
}
