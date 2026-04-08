import React from 'react';
import { motion } from 'motion/react';
import { Plus, Sparkles, CheckCircle2, ChevronRight, Building2, Briefcase, Clock, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/src/lib/utils';

export default function Dashboard() {
  const recentRecords = [
    { id: '1', company: 'Tencent · 微信事业群', position: 'UX 设计师', date: '3天前', score: 88, status: '简历已投递', color: 'blue' },
    { id: '2', company: 'Alibaba · 蚂蚁集团', position: '资深交互专家', date: '5天前', score: 91, status: '流程已结束', color: 'orange' },
    { id: '3', company: 'Meituan · 核心外卖', position: '界面设计师', date: '1周前', score: 82, status: '正在沟通', color: 'yellow' },
  ];

  return (
    <main className="min-h-screen p-8 lg:p-12 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-on-surface">下午好，小明</h2>
          <p className="text-on-surface-variant mt-2 font-medium">今天有 4 个新的职位与您的背景高度匹配。</p>
        </div>
        <Link 
          to="/analysis" 
          className="flex items-center gap-2 px-6 py-4 bg-gradient-to-br from-primary to-primary-container text-white rounded-xl font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>新建求职申请</span>
        </Link>
      </header>

      {/* Bento Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Active Application Card (Hero Card) */}
        <section className="col-span-12 lg:col-span-8 bg-surface-container-lowest p-8 rounded-2xl flex flex-col justify-between relative overflow-hidden shadow-sm border border-outline-variant/10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-secondary/10 text-secondary text-xs font-bold rounded-full">进行中</span>
              <span className="text-on-surface-variant text-sm">更新于 2 小时前</span>
            </div>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold text-on-surface">Senior PM</h3>
                <p className="text-on-surface-variant text-lg mt-1 font-medium">ByteDance · 北京</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-extrabold text-primary font-headline">94<span className="text-sm font-bold ml-1">匹配度</span></div>
                <div className="w-24 h-1.5 bg-surface-container-highest rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '94%' }}></div>
                </div>
              </div>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="p-4 bg-surface-container-low rounded-xl">
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold mb-1">当前阶段</p>
                <p className="text-sm font-bold text-on-surface">2nd Interview</p>
              </div>
              <div className="p-4 bg-surface-container-low rounded-xl">
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold mb-1">关键技能</p>
                <p className="text-sm font-bold text-on-surface">Data, Strategy</p>
              </div>
              <div className="p-4 bg-surface-container-low rounded-xl">
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold mb-1">下个行动</p>
                <p className="text-sm font-bold text-on-surface">回顾业务案例</p>
              </div>
            </div>
          </div>
          <div className="mt-8 flex items-center justify-between border-t border-outline-variant/10 pt-6">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <img 
                  key={i}
                  alt="recruiter" 
                  className="w-8 h-8 rounded-full border-2 border-white" 
                  src={`https://picsum.photos/seed/person${i}/40/40`}
                  referrerPolicy="no-referrer"
                />
              ))}
              <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">+3</div>
            </div>
            <Link 
              to="/analysis/result"
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              <span>快速跳转</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* AI Insight */}
        <section className="col-span-12 lg:col-span-4 bg-surface-container-low p-8 rounded-2xl border border-outline-variant/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-5 h-5 text-primary fill-primary" />
              <h3 className="font-bold text-on-surface">AI 职业洞察</h3>
            </div>
            <div className="space-y-6">
              <div>
                <p className="text-sm text-on-surface-variant mb-3">简历竞争力在“数据驱动”领域提升了</p>
                <div className="text-3xl font-extrabold text-on-surface font-headline">15%</div>
              </div>
              <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-white shadow-sm">
                <p className="text-xs font-bold text-secondary mb-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  建议操作
                </p>
                <p className="text-xs leading-relaxed text-on-surface-variant">
                  基于您最近的记录，建议在简历中强化 <b>"Python 自动化"</b> 相关的项目描述。
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-6 group cursor-pointer border-t border-outline-variant/5 pt-4">
            <span className="text-xs font-bold text-on-surface-variant group-hover:text-primary transition-colors">查看详细周报</span>
            <ChevronRight className="w-4 h-4 text-on-surface-variant group-hover:translate-x-1 transition-transform" />
          </div>
        </section>

        {/* Recent Records Section */}
        <section className="col-span-12 mt-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-on-surface">最近求职记录</h3>
            <Link to="/records" className="text-primary text-sm font-bold hover:underline">查看全部</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentRecords.map(record => (
              <Link 
                key={record.id}
                to="/records"
                className="bg-surface-container-lowest p-6 rounded-2xl hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer border border-outline-variant/10 group relative block"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    record.color === 'blue' ? "bg-blue-50 text-blue-600" : 
                    record.color === 'orange' ? "bg-orange-50 text-orange-600" : 
                    "bg-yellow-50 text-yellow-600"
                  )}>
                    <Building2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-xs font-medium text-on-surface-variant">{record.date}</span>
                </div>
                <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors">{record.company}</h4>
                <p className="text-xs text-on-surface-variant mt-1">{record.position}</p>
                <div className="mt-5 flex items-center gap-2">
                  <span className="px-2 py-1 bg-primary/5 text-primary text-[10px] font-bold rounded">匹配 {record.score}%</span>
                  <span className="px-2 py-1 bg-surface-container-low text-on-surface-variant text-[10px] font-bold rounded">{record.status}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Job Search Funnel Section */}
        <section className="col-span-12 mt-4 bg-surface-container-lowest p-8 rounded-2xl relative overflow-hidden border border-outline-variant/10 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="font-bold text-lg text-on-surface">求职漏斗分析</h3>
              <p className="text-xs text-on-surface-variant mt-1">过去 30 天的申请转化概览与效率分析</p>
            </div>
            <div className="flex gap-1 bg-surface-container-low p-1 rounded-lg">
              <button className="px-4 py-1.5 text-xs font-bold bg-white shadow-sm rounded-md text-on-surface transition-all">月度</button>
              <button className="px-4 py-1.5 text-xs font-bold text-on-surface-variant hover:text-on-surface rounded-md transition-colors">季度</button>
            </div>
          </div>
          
          <div className="flex items-end justify-between h-56 gap-8 px-4 relative">
            {/* Funnel Bars */}
            {[
              { label: '已投递简历', value: 42, height: '85%', sub: '基准值: 100%' },
              { label: '面试环节', value: 18, height: '45%', sub: '转化率: 43%', highlight: true },
              { label: '录用意向', value: 6, height: '15%', sub: '成功率: 14%' },
              { label: '最终入职', value: 3, height: '8%', sub: '最终转化: 7%', success: true },
            ].map((item, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                <div className="w-full bg-surface-container-low rounded-xl relative overflow-hidden h-44 cursor-help">
                  <div className={cn(
                    "absolute bottom-0 left-0 w-full rounded-t-lg transition-all duration-700 ease-out",
                    item.success ? "bg-secondary" : "bg-primary",
                    item.highlight ? "opacity-70" : item.success ? "opacity-80" : "opacity-100"
                  )} style={{ height: item.height }}></div>
                  <div className="absolute inset-0 flex items-center justify-center text-white font-bold font-headline text-xl drop-shadow-sm">
                    {item.value}
                  </div>
                </div>
                <div className="text-center">
                  <span className="text-[11px] font-bold text-on-surface">{item.label}</span>
                  <p className={cn(
                    "text-[10px] mt-0.5",
                    item.highlight ? "text-secondary font-bold" : "text-on-surface-variant"
                  )}>{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
