import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Calendar, Briefcase, CheckCircle2, Edit, Trash2, HelpCircle, Brain, TrendingUp, Plus, SortAsc, Building2, X, Save, Loader2, Sparkles, Lightbulb, MessageSquare } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Link } from 'react-router-dom';
import { supabase, handleSupabaseError, OperationType } from '../supabase';

interface QA {
  question: string;
  answer: string;
}

interface ActionItem {
  title: string;
  text: string;
}

interface InterviewRecord {
  id: string;
  company: string;
  position: string;
  date: string;
  status: string;
  qa: QA[];
  reflection: string;
  actionItems: ActionItem[];
  uid: string;
  createdAt: any;
}

interface AnalysisResult {
  id: string;
  company: string;
  position: string;
  matchScore: number;
  matchLevel: string;
  optimizationSuggestions: string[];
  aiIntro: string;
  interviewQuestions: {
    type: string;
    question: string;
    star: string;
    score: string;
  }[];
  uid: string;
  createdAt: any;
}

export default function Records() {
  const [activeTab, setActiveTab] = useState<'interview' | 'analysis'>('interview');
  const [records, setRecords] = useState<InterviewRecord[]>([]);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<InterviewRecord>>({
    company: '',
    position: '',
    date: new Date().toISOString().split('T')[0],
    status: '已面试',
    qa: [{ question: '', answer: '' }],
    reflection: '',
    actionItems: [{ title: '', text: '' }]
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch Interview Records
        const { data: interviewData, error: interviewError } = await supabase
          .from('interview_records')
          .select('*')
          .eq('uid', user.id)
          .order('interview_date', { ascending: false });

        if (interviewError) {
          handleSupabaseError(interviewError, OperationType.LIST, 'interview_records');
        } else {
          // 转换字段名以匹配UI使用的格式
          const fetchedRecords = interviewData.map((record: any) => ({
            id: record.id,
            company: record.company,
            position: record.position,
            date: record.interview_date,
            status: record.status,
            qa: record.qa || [],
            reflection: record.reflection || '',
            actionItems: record.action_items || [],
            uid: record.uid,
            createdAt: record.created_at
          })) as InterviewRecord[];
          setRecords(fetchedRecords);
          if (activeTab === 'interview' && fetchedRecords.length > 0 && !selectedId) {
            setSelectedId(fetchedRecords[0].id);
          }
        }

        // Fetch Analysis Results
        const { data: analysisData, error: analysisError } = await supabase
          .from('analysis_results')
          .select('*')
          .eq('uid', user.id)
          .order('created_at', { ascending: false });

        if (analysisError) {
          handleSupabaseError(analysisError, OperationType.LIST, 'analysis_results');
        } else {
          // 转换字段名以匹配UI使用的格式
          const fetchedResults = analysisData.map((result: any) => ({
            id: result.id,
            company: result.company,
            position: result.position,
            matchScore: result.match_score,
            matchLevel: result.match_level,
            optimizationSuggestions: result.optimization_suggestions || [],
            aiIntro: result.optimized_intro || '',
            interviewQuestions: (result.interview_questions || []).map((q: any) => ({
              type: q.type || '',
              question: q.question || '',
              star: q.starAdvice || q.star || '',
              score: q.highScorePoints || q.score || ''
            })),
            uid: result.uid,
            createdAt: result.created_at
          })) as AnalysisResult[];
          setAnalysisResults(fetchedResults);
          if (activeTab === 'analysis' && fetchedResults.length > 0 && !selectedId) {
            setSelectedId(fetchedResults[0].id);
          }
        }

        // Fetch Job Records
        const { data: jobData, error: jobError } = await supabase
          .from('job_records')
          .select('*')
          .eq('uid', user.id)
          .order('application_date', { ascending: false });

        if (jobError) {
          handleSupabaseError(jobError, OperationType.LIST, 'job_records');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchData();
    });

    return () => subscription.unsubscribe();
  }, [selectedId, activeTab]);

  const selectedRecord = records.find(r => r.id === selectedId);
  const selectedAnalysis = analysisResults.find(a => a.id === selectedId);

  const handleTabChange = (tab: 'interview' | 'analysis') => {
    setActiveTab(tab);
    setSelectedId(null); // Reset selection when switching tabs
  };

  const handleOpenModal = (record?: InterviewRecord) => {
    if (record) {
      setFormData(record);
      setIsEditing(true);
    } else {
      setFormData({
        company: '',
        position: '',
        date: new Date().toISOString().split('T')[0],
        status: '已面试',
        qa: [{ question: '', answer: '' }],
        reflection: '',
        actionItems: [{ title: '', text: '' }]
      });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setSaving(true);

    try {
      const data = {
        ...formData,
        uid: user.id,
        interview_date: formData.date,
        action_items: formData.actionItems,
        qa: formData.qa
      };

      // 删除不需要的字段
      const { id, date, actionItems, createdAt, ...finalData } = data as any;

      if (isEditing && formData.id) {
        const { error } = await supabase
          .from('interview_records')
          .update(finalData)
          .eq('id', formData.id);
        if (error) {
          console.error('更新面试记录错误:', error);
          console.error('错误详情:', error.details);
          console.error('错误代码:', error.code);
          console.error('错误提示:', error.hint);
          alert(`更新面试记录失败: ${error.message}`);
        }
      } else {
        const { data: newRecord, error } = await supabase
          .from('interview_records')
          .insert(finalData)
          .select('id')
          .single();
        if (error) {
          console.error('创建面试记录错误:', error);
          console.error('错误详情:', error.details);
          console.error('错误代码:', error.code);
          console.error('错误提示:', error.hint);
          alert(`创建面试记录失败: ${error.message}`);
        } else {
          setSelectedId(newRecord.id);
        }
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('保存面试记录失败:', error);
      handleSupabaseError(error, isEditing ? OperationType.UPDATE : OperationType.CREATE, 'interview_records');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      const collectionName = activeTab === 'interview' ? 'interview_records' : 'analysis_results';
      const { error } = await supabase
        .from(collectionName)
        .delete()
        .eq('id', deleteConfirmId);
      if (error) {
        handleSupabaseError(error, OperationType.DELETE, collectionName);
      }
      if (selectedId === deleteConfirmId) {
        const list = activeTab === 'interview' ? records : analysisResults;
        setSelectedId(list.find(r => r.id !== deleteConfirmId)?.id || null);
      }
      setDeleteConfirmId(null);
    } catch (error) {
      handleSupabaseError(error, OperationType.DELETE, activeTab === 'interview' ? 'interview_records' : 'analysis_results');
    }
  };

  const addQA = () => {
    setFormData(prev => ({
      ...prev,
      qa: [...(prev.qa || []), { question: '', answer: '' }]
    }));
  };

  const updateQA = (index: number, field: keyof QA, value: string) => {
    const newQA = [...(formData.qa || [])];
    newQA[index] = { ...newQA[index], [field]: value };
    setFormData(prev => ({ ...prev, qa: newQA }));
  };

  const addActionItem = () => {
    setFormData(prev => ({
      ...prev,
      actionItems: [...(prev.actionItems || []), { title: '', text: '' }]
    }));
  };

  const updateActionItem = (index: number, field: keyof ActionItem, value: string) => {
    const newItems = [...(formData.actionItems || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData(prev => ({ ...prev, actionItems: newItems }));
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-surface h-[calc(100vh-73px)]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <main className="flex-1 flex overflow-hidden bg-surface relative h-[calc(100vh-73px)]">
      <div className="flex flex-1 overflow-hidden w-full max-w-[1600px] mx-auto">
        {/* Left Pane: Record List */}
        <section className="w-96 border-r border-outline-variant/15 flex flex-col overflow-hidden bg-white/30 backdrop-blur-sm">
          <div className="p-6 flex flex-col gap-4 border-b border-outline-variant/10 bg-white/50">
            <div className="flex p-1 bg-surface-container-low rounded-xl mb-2">
              <button 
                onClick={() => handleTabChange('interview')}
                className={cn(
                  "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                  activeTab === 'interview' ? "bg-white shadow-sm text-primary" : "text-on-surface-variant hover:text-on-surface"
                )}
              >
                面试记录
              </button>
              <button 
                onClick={() => handleTabChange('analysis')}
                className={cn(
                  "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                  activeTab === 'analysis' ? "bg-white shadow-sm text-primary" : "text-on-surface-variant hover:text-on-surface"
                )}
              >
                分析结果
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-on-surface">{activeTab === 'interview' ? '面试列表' : '分析列表'}</h2>
                <span className="px-2 py-0.5 bg-surface-container-high rounded text-[10px] font-bold text-on-surface-variant">
                  {activeTab === 'interview' ? records.length : analysisResults.length}
                </span>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 w-4 h-4" />
              <input 
                className="w-full pl-10 pr-4 py-2 bg-white/80 border border-outline-variant/20 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none" 
                placeholder={activeTab === 'interview' ? "搜索面试公司..." : "搜索分析结果..."}
                type="text"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3">
            {activeTab === 'interview' ? (
              records.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mx-auto mb-4 text-on-surface-variant/30">
                    <Briefcase className="w-8 h-8" />
                  </div>
                  <p className="text-sm text-on-surface-variant">暂无面试记录</p>
                  <button 
                    onClick={() => handleOpenModal()}
                    className="mt-4 text-xs text-primary font-bold hover:underline"
                  >
                    立即创建第一条
                  </button>
                </div>
              ) : (
                records.map((record) => (
                  <div 
                    key={record.id}
                    onClick={() => setSelectedId(record.id)}
                    className={cn(
                      "p-4 rounded-xl transition-all cursor-pointer group border",
                      selectedId === record.id 
                        ? "bg-white shadow-md ring-1 ring-primary/20 border-l-4 border-l-primary border-outline-variant/10" 
                        : "bg-white/60 hover:bg-white border-outline-variant/10 hover:shadow-sm"
                    )}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-widest",
                        selectedId === record.id ? "text-primary" : "text-on-surface-variant/50"
                      )}>{record.date}</span>
                      <span className="px-2 py-0.5 bg-secondary-container/20 text-secondary text-[10px] font-bold rounded">{record.status}</span>
                    </div>
                    <h4 className={cn(
                      "font-bold leading-tight mb-1 transition-colors",
                      selectedId === record.id ? "text-on-surface" : "text-on-surface group-hover:text-primary"
                    )}>{record.company}</h4>
                    <p className="text-sm text-on-surface-variant">{record.position}</p>
                  </div>
                ))
              )
            ) : (
              analysisResults.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mx-auto mb-4 text-on-surface-variant/30">
                    <Brain className="w-8 h-8" />
                  </div>
                  <p className="text-sm text-on-surface-variant">暂无分析结果</p>
                  <Link 
                    to="/analysis"
                    className="mt-4 inline-block text-xs text-primary font-bold hover:underline"
                  >
                    前往开始分析
                  </Link>
                </div>
              ) : (
                analysisResults.map((result) => (
                  <div 
                    key={result.id}
                    onClick={() => setSelectedId(result.id)}
                    className={cn(
                      "p-4 rounded-xl transition-all cursor-pointer group border",
                      selectedId === result.id 
                        ? "bg-white shadow-md ring-1 ring-primary/20 border-l-4 border-l-secondary border-outline-variant/10" 
                        : "bg-white/60 hover:bg-white border-outline-variant/10 hover:shadow-sm"
                    )}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-widest",
                        selectedId === result.id ? "text-secondary" : "text-on-surface-variant/50"
                      )}>{new Date(result.createdAt).toLocaleDateString()}</span>
                      <span className="px-2 py-0.5 bg-secondary-container/20 text-secondary text-[10px] font-bold rounded">{result.matchScore}分</span>
                    </div>
                    <h4 className={cn(
                      "font-bold leading-tight mb-1 transition-colors",
                      selectedId === result.id ? "text-on-surface" : "text-on-surface group-hover:text-secondary"
                    )}>{result.company}</h4>
                    <p className="text-sm text-on-surface-variant">{result.position}</p>
                  </div>
                ))
              )
            )}
          </div>
        </section>

        {/* Right Pane: Detail View */}
        <section className="flex-1 overflow-y-auto p-10 bg-white relative no-scrollbar">
          {activeTab === 'interview' ? (
            selectedRecord ? (
              <div className="max-w-3xl mx-auto">
                {/* Action Bar */}
                <div className="flex justify-end gap-3 mb-8">
                  <button 
                    onClick={() => handleOpenModal(selectedRecord)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors border border-outline-variant/20 active:scale-95"
                  >
                    <Edit className="w-4 h-4" />
                    编辑内容
                  </button>
                  <button 
                    onClick={() => setDeleteConfirmId(selectedRecord.id)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-error hover:bg-error-container/10 rounded-lg transition-colors active:scale-95"
                  >
                    <Trash2 className="w-4 h-4" />
                    删除记录
                  </button>
                </div>

                {/* Record Header */}
                <div className="mb-12">
                  <div className="flex items-center gap-6 mb-6">
                    <div className="w-20 h-20 bg-surface-container rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-outline-variant/10">
                      <Building2 className="w-12 h-12 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-extrabold text-on-surface tracking-tight mb-2">{selectedRecord.company}</h1>
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-on-surface-variant text-sm">
                        <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-primary" /> {selectedRecord.date}</span>
                        <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-primary" /> {selectedRecord.position}</span>
                        <span className="flex items-center gap-1.5 text-secondary font-medium"><CheckCircle2 className="w-4 h-4" /> {selectedRecord.status}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Structured Content Sections */}
                <div className="space-y-12">
                  {/* Section: Q&A */}
                  <div className="relative pl-8 border-l-2 border-primary/20">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-primary shadow-sm"></div>
                    <h3 className="text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-primary" />
                      面试题目汇总 (Q&A)
                    </h3>
                    <div className="space-y-6">
                      {selectedRecord.qa.map((item, idx) => (
                        <div key={idx} className="p-6 bg-surface-container-low/40 rounded-2xl border border-outline-variant/10 hover:bg-surface-container-low/60 transition-colors">
                          <p className="text-base font-bold text-on-surface mb-4 leading-relaxed">{idx + 1}. {item.question}</p>
                          <div className="pl-4 border-l-2 border-primary/20 bg-white/50 p-4 rounded-r-xl">
                            <p className="text-[10px] font-bold text-primary mb-2 uppercase tracking-widest">我的回答记录</p>
                            <p className="text-sm text-on-surface-variant leading-relaxed">{item.answer}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section: Reflection */}
                  {selectedRecord.reflection && (
                    <div className="relative pl-8 border-l-2 border-primary/20">
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-primary shadow-sm"></div>
                      <h3 className="text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
                        <Brain className="w-5 h-5 text-primary" />
                        复盘反思 (Reflection)
                      </h3>
                      <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 italic text-on-surface-variant leading-relaxed relative overflow-hidden group">
                        <div className="relative z-10">
                          "{selectedRecord.reflection}"
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Section: Action Items */}
                  {selectedRecord.actionItems.length > 0 && (
                    <div className="relative pl-8 border-l-2 border-primary/20 pb-4">
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-primary shadow-sm"></div>
                      <h3 className="text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        后续改进 (Action Items)
                      </h3>
                      <ul className="grid grid-cols-1 gap-4">
                        {selectedRecord.actionItems.map((item, i) => (
                          <li key={i} className="flex items-start gap-3 p-4 bg-secondary-container/10 rounded-xl border border-secondary/10 hover:shadow-sm transition-all">
                            <CheckCircle2 className="w-5 h-5 text-secondary mt-0.5" />
                            <div>
                              <p className="text-sm font-semibold text-on-surface">{item.title}</p>
                              <p className="text-xs text-on-surface-variant mt-0.5">{item.text}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="h-32"></div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-on-surface-variant">
                <p>请选择左侧记录查看详情</p>
              </div>
            )
          ) : (
            selectedAnalysis ? (
              <div className="max-w-3xl mx-auto">
                {/* Action Bar */}
                <div className="flex justify-end gap-3 mb-8">
                  <button 
                    onClick={() => setDeleteConfirmId(selectedAnalysis.id)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-error hover:bg-error-container/10 rounded-lg transition-colors active:scale-95"
                  >
                    <Trash2 className="w-4 h-4" />
                    删除分析
                  </button>
                </div>

                {/* Analysis Header */}
                <div className="mb-12">
                  <div className="flex items-center gap-6 mb-6">
                    <div className="w-20 h-20 bg-secondary/10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-secondary/10">
                      <Sparkles className="w-12 h-12 text-secondary" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-extrabold text-on-surface tracking-tight mb-2">{selectedAnalysis.company}</h1>
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-on-surface-variant text-sm">
                        <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-secondary" /> {selectedAnalysis.position}</span>
                        <span className="flex items-center gap-1.5 text-secondary font-bold"><TrendingUp className="w-4 h-4" /> 匹配度: {selectedAnalysis.matchScore}% ({selectedAnalysis.matchLevel})</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analysis Content */}
                <div className="space-y-12">
                  <div className="relative pl-8 border-l-2 border-secondary/20">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-secondary shadow-sm"></div>
                    <h3 className="text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-secondary" />
                      优化建议
                    </h3>
                    <ul className="space-y-4">
                      {selectedAnalysis.optimizationSuggestions.map((s, i) => (
                        <li key={i} className="flex gap-3 p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
                          <span className="w-6 h-6 flex-shrink-0 bg-secondary/10 text-secondary text-xs font-bold rounded-full flex items-center justify-center">{i + 1}</span>
                          <p className="text-sm text-on-surface-variant leading-relaxed">{s}</p>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="relative pl-8 border-l-2 border-secondary/20">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-secondary shadow-sm"></div>
                    <h3 className="text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-secondary" />
                      AI 优化简介
                    </h3>
                    <div className="p-6 bg-secondary/5 rounded-2xl border border-secondary/10 italic text-on-surface-variant leading-relaxed">
                      {selectedAnalysis.aiIntro}
                    </div>
                  </div>

                  <div className="relative pl-8 border-l-2 border-secondary/20">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-secondary shadow-sm"></div>
                    <h3 className="text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-secondary" />
                      预测面试真题
                    </h3>
                    <div className="space-y-6">
                      {selectedAnalysis.interviewQuestions.map((q, i) => (
                        <div key={i} className="p-6 bg-surface-container-low/40 rounded-2xl border border-outline-variant/10">
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">{q.type}</span>
                          </div>
                          <p className="text-base font-bold text-on-surface mb-4">{q.question}</p>
                          <div className="space-y-3">
                            <div className="p-3 bg-white/50 rounded-lg border border-outline-variant/5">
                              <p className="text-[10px] font-bold text-primary mb-1 uppercase">STAR 建议</p>
                              <p className="text-xs text-on-surface-variant italic">{q.star}</p>
                            </div>
                            <div className="p-3 bg-secondary/5 rounded-lg border border-secondary/10">
                              <p className="text-[10px] font-bold text-secondary mb-1 uppercase">高分点</p>
                              <p className="text-xs text-on-surface-variant">{q.score}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="h-32"></div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-on-surface-variant">
                <p>请选择左侧分析结果查看详情</p>
              </div>
            )
          )}
        </section>
      </div>

      {/* FAB - Only show for interview tab */}
      {activeTab === 'interview' && (
        <button 
          onClick={() => handleOpenModal()}
          className="fixed bottom-8 right-8 flex items-center gap-3 px-6 py-4 bg-gradient-to-br from-primary to-primary-container text-white rounded-full shadow-2xl hover:shadow-primary/40 hover:-translate-y-1 active:scale-95 transition-all z-20 group"
        >
          <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
          <span className="font-bold tracking-tight">新建面试记录</span>
        </button>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmId(null)}
              className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 text-center"
            >
              <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-error" />
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-2">确认删除？</h3>
              <p className="text-on-surface-variant text-sm mb-8">此操作无法撤销，确定要永久删除这条记录吗？</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-3 text-sm font-bold text-on-surface-variant bg-surface-container-low rounded-xl hover:bg-surface-container-high transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={handleDelete}
                  className="flex-1 py-3 text-sm font-bold text-white bg-error rounded-xl hover:bg-error/90 transition-all shadow-lg shadow-error/20"
                >
                  确认删除
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Form */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container-lowest">
                <h2 className="text-xl font-bold text-on-surface">{isEditing ? '编辑面试记录' : '新建面试记录'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-surface-container-low rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">公司名称</label>
                    <input 
                      required
                      value={formData.company}
                      onChange={e => setFormData(prev => ({ ...prev, company: e.target.value }))}
                      className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/10 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="例如：腾讯"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">职位名称</label>
                    <input 
                      required
                      value={formData.position}
                      onChange={e => setFormData(prev => ({ ...prev, position: e.target.value }))}
                      className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/10 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="例如：高级产品经理"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">面试日期</label>
                    <input 
                      required
                      type="date"
                      value={formData.date}
                      onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/10 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">当前状态</label>
                    <select 
                      value={formData.status}
                      onChange={e => setFormData(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/10 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    >
                      <option>已投递</option>
                      <option>已面试</option>
                      <option>流程中</option>
                      <option>已录用</option>
                      <option>流程结束</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">面试题目 (Q&A)</label>
                    <button type="button" onClick={addQA} className="text-xs text-primary font-bold flex items-center gap-1 hover:underline">
                      <Plus className="w-3 h-3" /> 添加题目
                    </button>
                  </div>
                  {formData.qa?.map((item, idx) => (
                    <div key={idx} className="space-y-3 p-4 bg-surface-container-low rounded-2xl border border-outline-variant/5">
                      <input 
                        placeholder={`问题 ${idx + 1}`}
                        value={item.question}
                        onChange={e => updateQA(idx, 'question', e.target.value)}
                        className="w-full px-4 py-2 bg-white border border-outline-variant/10 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      <textarea 
                        placeholder="我的回答记录..."
                        value={item.answer}
                        onChange={e => updateQA(idx, 'answer', e.target.value)}
                        rows={2}
                        className="w-full px-4 py-2 bg-white border border-outline-variant/10 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">复盘反思</label>
                  <textarea 
                    value={formData.reflection}
                    onChange={e => setFormData(prev => ({ ...prev, reflection: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/10 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none text-sm"
                    placeholder="面试表现如何？有哪些可以改进的地方？"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">后续改进 (Action Items)</label>
                    <button type="button" onClick={addActionItem} className="text-xs text-primary font-bold flex items-center gap-1 hover:underline">
                      <Plus className="w-3 h-3" /> 添加项
                    </button>
                  </div>
                  {formData.actionItems?.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-3 gap-3">
                      <input 
                        placeholder="标题 (如: 业务补强)"
                        value={item.title}
                        onChange={e => updateActionItem(idx, 'title', e.target.value)}
                        className="col-span-1 px-4 py-2 bg-surface-container-low border border-outline-variant/10 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      <input 
                        placeholder="具体内容..."
                        value={item.text}
                        onChange={e => updateActionItem(idx, 'text', e.target.value)}
                        className="col-span-2 px-4 py-2 bg-surface-container-low border border-outline-variant/10 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  ))}
                </div>
              </form>

              <div className="p-6 border-t border-outline-variant/10 bg-surface-container-lowest flex justify-end gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 text-sm font-bold text-on-surface-variant hover:bg-surface-container-low rounded-xl transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="px-8 py-2.5 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  保存记录
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
