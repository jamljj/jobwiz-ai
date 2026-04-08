import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../supabase';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Sparkles, ShieldCheck, Mail, Lock, QrCode, ArrowRight, Loader2, Github } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/dashboard";

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showWechatQR, setShowWechatQR] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        navigate(from, { replace: true });
      }
    };

    checkUser();

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        navigate(from, { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, from]);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error("Google login failed:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        const { error } = await supabase.auth.signUp({
          email,
          password
        });
        if (error) {
          throw error;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) {
          throw error;
        }
      }
    } catch (error: any) {
      console.error("Email auth failed:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-4 md:p-8 bg-surface relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-3xl"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[1000px] w-full bg-white rounded-[40px] shadow-2xl border border-outline-variant/10 overflow-hidden flex flex-col md:flex-row relative z-10"
      >
        {/* Left Side: Branding/Info */}
        <div className="md:w-[45%] bg-on-surface p-10 md:p-16 text-surface flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-on-primary fill-on-primary" />
              </div>
              <span className="text-2xl font-black tracking-tighter">JobWiz AI</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-black leading-[1.1] mb-6">
              开启你的<br />
              <span className="text-primary">职场进化</span>之旅
            </h2>
            <p className="text-surface/60 text-lg leading-relaxed mb-8">
              利用最先进的 AI 技术，深度解析简历与岗位的契合度，助你精准斩获心仪 Offer。
            </p>
            
            <div className="space-y-4">
              {[
                "AI 简历深度对齐分析",
                "大厂面试真题精准预测",
                "个性化面试策略建议",
                "全链路求职进度追踪"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm font-medium">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <ArrowRight className="w-3 h-3" />
                  </div>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 pt-12 border-t border-surface/10 mt-12">
            <div className="flex items-center gap-2 text-xs text-surface/40">
              <ShieldCheck className="w-4 h-4" />
              <span>数据受企业级 AES-256 加密保护</span>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Forms */}
        <div className="flex-1 p-10 md:p-16 bg-white flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full">
            <div className="mb-10">
              <h3 className="text-3xl font-black text-on-surface mb-2">
                {isRegister ? '创建新账号' : '欢迎回来'}
              </h3>
              <p className="text-on-surface-variant text-sm">
                {isRegister ? '加入 JobWiz AI，开启智能求职' : '登录以继续您的求职加速之旅'}
              </p>
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button 
                onClick={handleGoogleLogin}
                disabled={loading}
                className="flex items-center justify-center gap-2 py-3 border border-outline-variant/20 rounded-2xl hover:bg-surface-container-low transition-all active:scale-95 text-sm font-bold"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/action/google.svg" className="w-5 h-5" alt="Google" />
                Google
              </button>
              <button 
                onClick={() => setShowWechatQR(true)}
                className="flex items-center justify-center gap-2 py-3 border border-outline-variant/20 rounded-2xl hover:bg-surface-container-low transition-all active:scale-95 text-sm font-bold"
              >
                <QrCode className="w-5 h-5 text-[#07C160]" />
                微信登录
              </button>
            </div>

            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant/10"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-on-surface-variant font-bold tracking-widest">或使用邮箱</span>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">电子邮箱</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant group-focus-within:text-primary transition-colors" />
                  <input 
                    required
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low/50 border border-outline-variant/10 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all text-sm font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">登录密码</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant group-focus-within:text-primary transition-colors" />
                  <input 
                    required
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low/50 border border-outline-variant/10 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all text-sm font-medium"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-error/5 border border-error/10 rounded-xl text-error text-xs font-medium flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-error"></div>
                  {error}
                </div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
                {isRegister ? '立即注册' : '登 录'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <button 
                onClick={() => setIsRegister(!isRegister)}
                className="text-sm font-bold text-on-surface-variant hover:text-primary transition-colors"
              >
                {isRegister ? '已有账号？立即登录' : '没有账号？创建新账号'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Wechat QR Modal Placeholder */}
      <AnimatePresence>
        {showWechatQR && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWechatQR(false)}
              className="absolute inset-0 bg-on-surface/60 backdrop-blur-md"
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-white rounded-[40px] p-12 shadow-2xl max-w-sm w-full text-center"
            >
              <div className="mb-8">
                <h4 className="text-2xl font-black text-on-surface mb-2">微信扫码登录</h4>
                <p className="text-on-surface-variant text-sm">请使用微信扫描下方二维码</p>
              </div>
              
              <div className="bg-surface-container-low p-6 rounded-3xl mb-8 relative group">
                <div className="aspect-square bg-white rounded-2xl flex items-center justify-center border border-outline-variant/10 shadow-inner">
                  <QrCode className="w-32 h-32 text-on-surface/20" />
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl">
                    <p className="text-xs font-bold text-on-surface-variant">演示环境暂不支持真实扫码</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setShowWechatQR(false)}
                className="w-full py-4 bg-surface-container-high text-on-surface rounded-2xl font-bold hover:bg-surface-container-highest transition-colors"
              >
                关 闭
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
