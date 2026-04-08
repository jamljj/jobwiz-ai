import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HelpCircle, Settings, Sparkles, LogOut, User as UserIcon } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { supabase, User } from '../supabase';

export function Navbar() {
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    // 检查用户会话
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    checkUser();

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };
  
  const navItems = [
    { name: '首页', path: '/' },
    { name: '我的分析', path: '/analysis' },
    { name: '我的记录', path: '/records' },
    { name: '仪表盘', path: '/dashboard' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-outline-variant/15 glass-effect">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="text-2xl font-bold tracking-tighter font-headline">JobWiz</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  location.pathname === item.path 
                    ? "text-primary border-b-2 border-primary pb-1" 
                    : "text-on-surface-variant"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors">
            <HelpCircle className="w-5 h-5" />
          </button>
          
          {user ? (
            <div className="flex items-center gap-4">
              <div className="group relative">
                <div className="w-9 h-9 rounded-full overflow-hidden border border-outline-variant/30 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all">
                  <img 
                    src={user.photoURL || `https://picsum.photos/seed/${user.uid}/100/100`} 
                    alt="User" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="absolute right-0 top-full mt-2 w-48 bg-surface-container-lowest border border-outline-variant/15 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-2 z-50">
                  <div className="px-3 py-2 border-b border-outline-variant/10 mb-1">
                    <p className="text-xs font-bold text-on-surface truncate">{user.displayName || '用户'}</p>
                    <p className="text-[10px] text-on-surface-variant truncate">{user.email}</p>
                  </div>
                  <button 
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-error hover:bg-error-container/10 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    退出登录
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link 
              to="/login"
              className="px-4 py-2 bg-on-surface text-surface text-sm font-bold rounded-lg hover:bg-on-surface/90 transition-all active:scale-95"
            >
              登录
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-surface-container-low border-t border-outline-variant/15 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="text-center md:text-left">
          <div className="text-xl font-bold text-outline mb-2 font-headline">JobWiz</div>
          <p className="text-xs text-on-surface-variant">© 2024 JobWiz AI. Professional Career Intelligence.</p>
        </div>
        
        <div className="flex gap-8 text-xs font-medium text-on-surface-variant">
          <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-primary transition-colors">Contact Support</a>
        </div>
      </div>
    </footer>
  );
}
