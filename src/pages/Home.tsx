import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, BarChart3, HelpCircle, History, LayoutDashboard } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, User } from '../supabase';

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 检查用户会话
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    checkUser();

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleStartAnalysis = () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/analysis' } } });
    } else {
      navigate('/analysis');
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-8 py-20 lg:py-32 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="text-left">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold mb-8"
          >
            <Sparkles className="w-4 h-4 fill-primary" />
            AI 驱动的职业未来
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]"
          >
            开启职场新篇章，<br />
            <span className="text-primary">AI 助你拿下 Offer</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-on-surface-variant max-w-xl mb-12 leading-relaxed font-medium"
          >
            基于大模型的深度简历解析与面试预测，让求职更智能、更高效、更专业。你的 AI 求职助理，助你职场进阶。
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            <button 
              onClick={handleStartAnalysis}
              className="primary-gradient text-white px-10 py-5 rounded-2xl text-lg font-bold shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 transition-all inline-flex items-center gap-3 active:scale-95"
            >
              立即开始分析
              <ArrowRight className="w-5 h-5" />
            </button>
            <div className="flex -space-x-3 items-center ml-4">
              {[1, 2, 3, 4].map(i => (
                <img 
                  key={i}
                  src={`https://picsum.photos/seed/user${i}/64/64`} 
                  className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                  referrerPolicy="no-referrer"
                  alt="user"
                />
              ))}
              <div className="pl-6 text-sm font-bold text-on-surface-variant">
                10k+ 用户已加入
              </div>
            </div>
          </motion.div>
        </div>

        {/* Hero Illustration / Dashboard Preview */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full -z-10 animate-pulse"></div>
          
          {/* Mock Dashboard UI */}
          <div className="bg-surface-container-lowest rounded-3xl shadow-2xl border border-outline-variant/15 p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="px-3 py-1 bg-surface-container-low rounded-lg text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">AI Analysis Live</div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-xs font-bold text-on-surface">简历匹配度</span>
                    <span className="text-lg font-black text-primary font-headline">92%</span>
                  </div>
                  <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '92%' }}
                      transition={{ delay: 1, duration: 1.5 }}
                      className="h-full bg-primary rounded-full"
                    ></motion.div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/10">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-2">面试预测</p>
                  <div className="space-y-2">
                    <div className="h-1.5 w-full bg-outline-variant/20 rounded-full"></div>
                    <div className="h-1.5 w-3/4 bg-outline-variant/20 rounded-full"></div>
                    <div className="h-1.5 w-1/2 bg-primary/30 rounded-full"></div>
                  </div>
                </div>
                <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/10">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-2">竞争力排名</p>
                  <p className="text-xl font-black text-on-surface font-headline">Top 5%</p>
                </div>
              </div>

              <div className="p-5 bg-secondary/5 rounded-2xl border border-secondary/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                  <Sparkles className="w-12 h-12 text-secondary" />
                </div>
                <p className="text-xs font-bold text-secondary mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 fill-secondary" />
                  AI 优化建议
                </p>
                <p className="text-[11px] leading-relaxed text-on-surface-variant font-medium">
                  建议在“项目经历”中增加 3 个关于“数据驱动决策”的量化指标，可提升 12% 的匹配度。
                </p>
              </div>
            </div>
          </div>

          {/* Floating Elements */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-outline-variant/10 z-10 hidden md:block"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase">新问题预测</p>
                <p className="text-xs font-bold text-on-surface">如何处理团队冲突？</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Social Proof Section */}
      <section className="bg-surface-container-low py-16 border-y border-outline-variant/10">
        <div className="max-w-7xl mx-auto px-8">
          <p className="text-center text-on-surface-variant font-medium mb-10 tracking-widest uppercase text-sm">已助力 10,000+ 求职者斩获心仪 Offer</p>
          <div className="flex flex-wrap justify-center gap-12 opacity-60 grayscale items-center">
            <div className="text-2xl font-bold font-headline">Tencent</div>
            <div className="text-2xl font-bold font-headline">Alibaba</div>
            <div className="text-2xl font-bold font-headline">ByteDance</div>
            <div className="text-2xl font-bold font-headline">Meituan</div>
            <div className="text-2xl font-bold font-headline">NetEase</div>
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="max-w-7xl mx-auto px-8 py-32">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold mb-4">核心功能</h2>
          <p className="text-on-surface-variant text-lg">全方位的 AI 求职辅助，让你的职业竞争优势显而易见。</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main Feature */}
          <div className="md:col-span-8 bg-surface-container-lowest p-10 rounded-2xl flex flex-col justify-between group hover:shadow-xl transition-all border border-outline-variant/10">
            <div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-bold mb-4">简历匹配分析</h3>
              <p className="text-on-surface-variant text-lg max-w-md leading-relaxed">
                上传简历，智能分析与岗位的匹配度，并给出针对性的优化建议。让你的简历在 HR 面前闪闪发光。
              </p>
            </div>
            <div className="mt-12 flex flex-wrap gap-2">
              <div className="bg-secondary-container/20 text-on-secondary-container px-4 py-1.5 rounded-full text-sm font-medium border border-secondary-container/30">关键词匹配 98%</div>
              <div className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium">JD 深度理解</div>
            </div>
          </div>
          
          {/* Side Feature 1 */}
          <div className="md:col-span-4 bg-surface-container-low p-8 rounded-2xl group border border-transparent hover:border-outline-variant/30 hover:bg-surface-container-lowest transition-all">
            <div className="w-12 h-12 rounded-xl bg-secondary-container/20 flex items-center justify-center text-on-secondary-container mb-6">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold mb-4">面试问题预测</h3>
            <p className="text-on-surface-variant leading-relaxed">结合 JD 深度预测面试真题，并提供参考答案与 STAR 结构建议，助你对答如流。</p>
          </div>
          
          {/* Side Feature 2 */}
          <div className="md:col-span-4 bg-surface-container-low p-8 rounded-2xl group border border-transparent hover:border-outline-variant/30 hover:bg-surface-container-lowest transition-all">
            <div className="w-12 h-12 rounded-xl bg-tertiary-fixed flex items-center justify-center text-tertiary mb-6">
              <History className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold mb-4">求职记录复盘</h3>
            <p className="text-on-surface-variant leading-relaxed">结构化记录面试过程，自动生成 AI 反思日记，帮助你在每一次面试中不断进化。</p>
          </div>
          
          {/* Large Decorative Image Card */}
          <div className="md:col-span-8 bg-surface-container-lowest rounded-2xl overflow-hidden relative group border border-outline-variant/10">
            <img 
              alt="AI Data Connectivity" 
              className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700" 
              src="https://picsum.photos/seed/data/800/400"
              referrerPolicy="no-referrer"
            />
            <div className="relative p-10 h-full flex flex-col justify-end bg-gradient-to-t from-white via-white/80 to-transparent">
              <h4 className="text-xl font-bold mb-2">深度见解，始于数据</h4>
              <p className="text-on-surface-variant max-w-sm">利用最前沿的 LLM 技术，我们比任何人都更懂企业的用人偏好，为你精准画像。</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-8 py-20">
        <div className="primary-gradient rounded-3xl p-12 md:p-20 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] opacity-20"></div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 relative z-10">准备好迎接职业高峰了吗？</h2>
          <p className="text-white/80 text-xl mb-10 max-w-xl mx-auto relative z-10">加入 10,000+ 求职者的行列，让 AI 成为你最可靠的面试官与职业助手。</p>
          <button 
            onClick={handleStartAnalysis}
            className="inline-block bg-white text-primary px-12 py-5 rounded-xl text-xl font-bold shadow-2xl hover:-translate-y-1 hover:shadow-white/20 transition-all relative z-10"
          >
            立即开始分析
          </button>
        </div>
      </section>
    </div>
  );
}
