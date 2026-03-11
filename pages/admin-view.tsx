
import React, { useState, useEffect } from 'react';
import { Shield, Lock, User, Sparkles, LogOut, ArrowLeft, LayoutDashboard, Settings, Database, Activity } from 'lucide-react';
import AdminPanel from '../components/admin-panel';
import { useData } from '../context/DataContext';
import { motion, AnimatePresence } from 'framer-motion';

import ThemeToggle from '../components/theme-toggle';

const AdminView: React.FC = () => {
  const { 
    notifications, categories, topics, quizzes, notes, ads, articles,
    addNotification, deleteNotification, addCategory, deleteCategory,
    addTopic, deleteTopic, addQuiz, deleteQuiz, addNote, deleteNote,
    addAd, deleteAd, updateAd, addArticle, deleteArticle
  } = useData();

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved as 'dark' | 'light';
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const [adminAuth, setAdminAuth] = useState(localStorage.getItem('admin_auth') === 'true');
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState(false);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.username === 'mmonlineacademy26@gmail.com' && loginForm.password === 'mmacademy') {
      setAdminAuth(true);
      localStorage.setItem('admin_auth', 'true');
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const handleAdminLogout = () => {
    setAdminAuth(false);
    localStorage.removeItem('admin_auth');
  };

  if (!adminAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-24 bg-zinc-50 dark:bg-pakgreen-dark/20 overflow-hidden">
         <motion.div 
           initial={{ opacity: 0, scale: 0.9, y: 30 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           className="max-w-md w-full bg-white dark:bg-pakgreen-dark/50 backdrop-blur-2xl p-12 rounded-[60px] shadow-[0_40px_80px_rgba(0,0,0,0.2)] border-8 border-gold/10 relative overflow-hidden scanline"
         >
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-gold/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-pakgreen/10 rounded-full blur-3xl" />
            
            <div className="text-center mb-16 relative z-10">
               <motion.div 
                 whileHover={{ rotate: 0, scale: 1.1 }}
                 className="h-28 w-28 bg-pakgreen dark:bg-gold rounded-[40px] flex items-center justify-center mx-auto mb-10 shadow-2xl rotate-12 transition-all group"
               >
                  <Shield className="h-14 w-14 text-white dark:text-pakgreen group-hover:scale-110 transition-transform" />
               </motion.div>
               <span className="text-gold font-black uppercase text-[11px] tracking-[0.6em] mb-6 block">Neural Auth Protocol</span>
               <h2 className="text-5xl font-heading font-black text-pakgreen dark:text-white uppercase tracking-tight leading-none">
                  Admin <span className="text-gold-light">Portal</span>
               </h2>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-10 relative z-10">
               <div className="space-y-5">
                  <label className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.4em] px-6">Access Identity</label>
                  <div className="relative group">
                     <User className="absolute left-8 top-1/2 -translate-y-1/2 h-6 w-6 text-zinc-300 group-focus-within:text-gold transition-colors" />
                     <input 
                       type="text" 
                       required 
                       value={loginForm.username}
                       onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                       className="w-full pl-20 pr-10 py-7 bg-zinc-50 dark:bg-white/5 border-2 border-transparent focus:border-gold/30 rounded-[32px] outline-none text-pakgreen dark:text-white font-bold transition-all shadow-inner" 
                       placeholder="Username"
                     />
                  </div>
               </div>
               <div className="space-y-5">
                  <label className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.4em] px-6">Security Key</label>
                  <div className="relative group">
                     <Lock className="absolute left-8 top-1/2 -translate-y-1/2 h-6 w-6 text-zinc-300 group-focus-within:text-gold transition-colors" />
                     <input 
                       type="password" 
                       required 
                       value={loginForm.password}
                       onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                       className="w-full pl-20 pr-10 py-7 bg-zinc-50 dark:bg-white/5 border-2 border-transparent focus:border-gold/30 rounded-[32px] outline-none text-pakgreen dark:text-white font-bold transition-all shadow-inner" 
                       placeholder="••••••••"
                     />
                  </div>
               </div>

               <AnimatePresence>
                 {loginError && (
                   <motion.div 
                     initial={{ opacity: 0, height: 0 }}
                     animate={{ opacity: 1, height: 'auto' }}
                     exit={{ opacity: 0, height: 0 }}
                     className="p-5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl border border-rose-200 dark:border-rose-500/20 text-center overflow-hidden"
                   >
                     <span className="text-[11px] font-black uppercase tracking-[0.3em]">Access Denied: Invalid Logic</span>
                   </motion.div>
                 )}
               </AnimatePresence>

               <motion.button 
                 whileHover={{ scale: 1.02 }}
                 whileTap={{ scale: 0.98 }}
                 type="submit" 
                 className="w-full py-8 bg-pakgreen dark:bg-gold text-white dark:text-pakgreen rounded-[32px] text-[15px] font-black uppercase tracking-[0.3em] shadow-[0_20px_40px_rgba(0,0,0,0.2)] transition-all flex items-center justify-center gap-5 group relative overflow-hidden"
               >
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
                  <Lock className="h-7 w-7 group-hover:scale-110 transition-transform relative z-10" /> 
                  <span className="relative z-10">Authorize Entry</span>
               </motion.button>
            </form>
         </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-pakgreen-dark/20 overflow-hidden">
       <div className="max-w-7xl mx-auto px-6 py-16">
          <motion.div 
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap justify-between items-center gap-10 mb-16 bg-white dark:bg-pakgreen-dark/50 backdrop-blur-2xl p-10 rounded-[50px] shadow-2xl border-4 border-gold/10 relative overflow-hidden"
          >
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
             <div className="flex items-center gap-8 relative z-10">
                <motion.div 
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.8 }}
                  className="h-20 w-20 bg-pakgreen dark:bg-gold rounded-3xl flex items-center justify-center shadow-2xl"
                >
                   <LayoutDashboard className="h-10 w-10 text-white dark:text-pakgreen" />
                </motion.div>
                <div>
                   <h2 className="text-4xl font-heading font-black text-pakgreen dark:text-white uppercase tracking-tight leading-none mb-3">Command Center</h2>
                   <p className="text-[11px] font-black text-gold-light uppercase tracking-[0.5em]">Neural System Administrator</p>
                </div>
             </div>
             <div className="flex items-center gap-6 relative z-10">
                <div className="hidden lg:flex items-center gap-10 px-10 border-r-2 border-zinc-100 dark:border-white/10 mr-6">
                   <div className="text-center">
                      <p className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.4em] mb-2">System Status</p>
                      <div className="flex items-center gap-3">
                         <div className="h-3 w-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                         <span className="text-[11px] font-black text-emerald-500 uppercase tracking-widest">Active Link</span>
                      </div>
                   </div>
                   <div className="text-center">
                      <p className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.4em] mb-2">Neural Base</p>
                      <span className="text-[11px] font-black text-pakgreen dark:text-white uppercase tracking-widest">Synchronized</span>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                  <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAdminLogout} 
                    className="flex items-center gap-4 px-10 py-5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl text-[12px] font-black uppercase tracking-[0.3em] transition-all hover:bg-rose-100 dark:hover:bg-rose-500/20 shadow-lg border-2 border-rose-200 dark:border-rose-500/20"
                  >
                    <LogOut className="h-6 w-6" /> Terminate Session
                  </motion.button>
                </div>
             </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative z-10"
          >
             <AdminPanel 
               notifications={notifications}
               categories={categories}
               topics={topics}
               quizzes={quizzes}
               notes={notes}
               ads={ads}
               articles={articles}
               onAddNotification={addNotification}
               onDeleteNotification={deleteNotification}
               onAddCategory={addCategory}
               onDeleteCategory={deleteCategory}
               onAddTopic={addTopic}
               onDeleteTopic={deleteTopic}
               onAddQuiz={addQuiz}
               onDeleteQuiz={deleteQuiz}
               onAddNote={addNote}
               onDeleteNote={deleteNote}
               onAddAd={addAd}
               onDeleteAd={deleteAd}
               onUpdateAd={updateAd}
               onAddArticle={addArticle}
               onDeleteArticle={deleteArticle}
             />
          </motion.div>
       </div>
    </div>
  );
};

export default AdminView;
