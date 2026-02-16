import React, { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from './components/Navbar';
import QuizModule from './components/QuizModule';
import AdminPanel from './components/AdminPanel';
import AdSlot from './components/AdBanner';
import { dataService } from './services/dataService';
import { AppState, Notification, Quiz, SubCategory, Topic, StudyNote, QuizFeedback } from './types';
import { 
  LogOut, Megaphone, BookOpen, FileText, X, Phone, Mail, Settings, ArrowRight, Star, ListChecks, Instagram, Linkedin, Music as TiktokIcon, ShieldAlert, Loader2, Share2, PlayCircle, Sparkles, MapPin, Send, Facebook, ChevronRight, Download, Calendar, Clock
} from 'lucide-react';

const socialLinks = [
  { label: 'Facebook', icon: Facebook, url: 'https://www.facebook.com/MirpurkhasAliTalpurTown/', color: 'hover:text-blue-600' },
  { label: 'Instagram', icon: Instagram, url: 'https://www.instagram.com/majid.maqsood01/?hl=en', color: 'hover:text-pink-600' },
  { label: 'LinkedIn', icon: Linkedin, url: 'https://www.linkedin.com/in/majid-maqsood-633444374/', color: 'hover:text-blue-700' },
  { label: 'TikTok', icon: TiktokIcon, url: 'https://www.tiktok.com/@majid.maqsood8', color: 'hover:text-zinc-900 dark:hover:text-white' }
];

const AdminLogin: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError('');
    try {
      const res = await dataService.login(username.trim(), password.trim());
      if (res && res.success) onLogin();
      else setError(res.error || 'Access Denied');
    } catch (err: any) { setError(err.message || 'Connection Failure'); }
    finally { setIsVerifying(false); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white dark:bg-pakgreen-dark/80 backdrop-blur-xl rounded-[40px] shadow-2xl border border-gold/20 p-10 sm:p-14 relative overflow-hidden animate-in zoom-in-95">
        <div className="absolute inset-0 islamic-pattern opacity-10"></div>
        <div className="relative z-10 text-center">
          <ShieldAlert className="h-10 w-10 text-gold-light mx-auto mb-8" />
          <h2 className="text-3xl font-black text-pakgreen dark:text-gold-light uppercase tracking-tighter mb-12">Institutional Access</h2>
          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-zinc-50 dark:bg-pakgreen-deepest border-2 border-zinc-200 dark:border-gold/10 p-4 rounded-2xl text-sm outline-none dark:text-white transition-colors focus:border-gold/50" placeholder="Authorized User" required />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-zinc-50 dark:bg-pakgreen-deepest border-2 border-zinc-200 dark:border-gold/10 p-4 rounded-2xl text-sm outline-none dark:text-white transition-colors focus:border-gold/50" placeholder="Password" required />
            {error && <div className="text-red-500 text-[10px] font-black uppercase text-center">{error}</div>}
            <button type="submit" disabled={isVerifying} className="w-full py-5 bg-pakgreen dark:bg-gold-light text-white dark:text-pakgreen rounded-2xl font-black uppercase text-[10px] tracking-[0.4em] shadow-xl hover:shadow-gold/20 transition-all">
              {isVerifying ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Sync Console'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const ImageLightbox: React.FC<{ url: string; onClose: () => void }> = ({ url, onClose }) => (
  <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300 p-4 md:p-10" onClick={onClose}>
    <button onClick={onClose} className="absolute top-6 right-6 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all shadow-2xl"><X className="h-8 w-8" /></button>
    <img src={url} className="max-w-full max-h-full object-contain rounded-xl shadow-[0_0_100px_rgba(212,175,55,0.2)] border-2 border-white/10" alt="Full view" onClick={e => e.stopPropagation()} />
  </div>
);

const App: React.FC = () => {
  const mainRef = useRef<HTMLElement>(null);
  const [state, setState] = useState<AppState>(() => {
    const isSub = typeof window !== 'undefined' && window.location.hostname.startsWith('admin.');
    return { view: isSub ? 'admin' : 'home', isAdmin: isSub };
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => localStorage.getItem('admin_auth') === 'true');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [categories, setCategories] = useState<SubCategory[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [feedbacks, setFeedbacks] = useState<QuizFeedback[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const data = await dataService.getBulkData();
      if (data) {
        setCategories(data.categories || []);
        setTopics(data.topics || []);
        setNotifications(data.notifications || []);
        setQuizzes(data.quizzes || []);
        setNotes(data.notes || []);
      }
      const feedbackData = await dataService.getQuizFeedbacks();
      setFeedbacks(feedbackData || []);
    } catch (err) { console.error("Sync Error", err); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      const isSub = window.location.hostname.startsWith('admin.');
      if (hash.startsWith('#/category')) {
        setState(p => ({ ...p, view: 'category', selectedSubCategory: hash.split('?id=')[1], isAdmin: isSub }));
      } else if (hash.startsWith('#/quiz')) {
        const quizId = hash.split('?id=')[1];
        const found = quizzes.find((q: Quiz) => q.id === quizId);
        if (found) {
          setActiveQuiz(found);
          setState(p => ({ ...p, view: 'quiz', selectedQuiz: quizId, isAdmin: isSub }));
        }
      } else if (hash === '#/notifications') setState(p => ({ ...p, view: 'notifications', isAdmin: isSub }));
      else if (hash === '#/contact') setState(p => ({ ...p, view: 'contact', isAdmin: isSub }));
      else setState(p => ({ ...p, view: isSub ? 'admin' : 'home', isAdmin: isSub }));
    };
    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => window.removeEventListener('hashchange', handleHash);
  }, [quizzes]);

  const handleNavigate = (view: AppState['view'], sub?: string, qId?: string) => {
    window.location.hash = view === 'category' ? `#/category?id=${sub}` : view === 'quiz' ? `#/quiz?id=${qId}` : view === 'notifications' ? '#/notifications' : view === 'contact' ? '#/contact' : '#home';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShareNews = async (n: Notification) => {
    const shareData = { title: n.title, text: `${n.title}: ${n.content.substring(0, 100)}...`, url: window.location.origin + '#/notifications' };
    if (navigator.share) try { await navigator.share(shareData); } catch (err) { console.error("Share error", err); }
    else { navigator.clipboard.writeText(shareData.url); alert("Link copied to clipboard."); }
  };

  const marqueeText = notifications.length > 0 
    ? notifications.slice(0, 5).map(n => `NEWS: ${n.title}`).join(" | ") + " | Welcome to Professional Academy"
    : "Welcome to Professional Academy - Specialized preparation for Law Admission Tests, SPSC, IBA Sukkur, ECAT, MDCAT and many more.";

  const renderGroupedItems = (
    subCatId: string | undefined, 
    items: (Quiz | StudyNote)[], 
    renderItem: (item: any) => React.ReactNode, 
    emptyMsg: string
  ) => {
    if (!subCatId) return null;
    const catItems = items.filter(i => i.subCategoryId === subCatId);
    if (catItems.length === 0) return <p className="text-zinc-400 dark:text-zinc-500 text-xs font-black uppercase italic py-8">{emptyMsg}</p>;
    const relevantTopics = topics.filter(t => t.categoryId === subCatId);
    const grouped: Record<string, typeof items> = {};
    const generalItems: typeof items = [];

    catItems.forEach(item => {
      if (item.topicId) {
        if (!grouped[item.topicId]) grouped[item.topicId] = [];
        grouped[item.topicId].push(item);
      } else {
        generalItems.push(item);
      }
    });

    return (
      <div className="space-y-12">
        {relevantTopics.map(topic => {
           const topicItems = grouped[topic.id];
           if (!topicItems || topicItems.length === 0) return null;
           return (
             <div key={topic.id} className="space-y-4">
               <div className="flex items-center gap-3 border-b border-gold/20 pb-2 mb-4">
                 <h4 className="text-sm font-black text-gold-light uppercase tracking-widest">{topic.name}</h4>
                 <div className="h-1 flex-grow bg-gold/5"></div>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {topicItems.map(renderItem)}
               </div>
             </div>
           );
        })}
        {generalItems.length > 0 && (
          <div className="space-y-4">
             {relevantTopics.length > 0 && (
                <div className="flex items-center gap-3 border-b border-zinc-700 dark:border-white/10 pb-2 mb-4">
                   <h4 className="text-sm font-black text-zinc-400 uppercase tracking-widest">General Content</h4>
                   <div className="h-1 flex-grow bg-white/5"></div>
                </div>
             )}
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {generalItems.map(renderItem)}
             </div>
          </div>
        )}
      </div>
    );
  };

  const isLLB = state.selectedSubCategory?.startsWith('llb-');
  const availableLLBSemesters = categories.filter(c => c.id.startsWith('llb-')).map(c => c.id);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-pakgreen-deepest transition-colors islamic-pattern">
      {activeImage && <ImageLightbox url={activeImage} onClose={() => setActiveImage(null)} />}
      <Navbar onNavigate={handleNavigate} />
      
      <div className="w-full bg-gold py-2 overflow-hidden border-y border-gold-dark shadow-md z-40">
        <div className="news-ticker">
          <div className="ticker-content text-pakgreen font-black uppercase text-[10px] sm:text-xs tracking-widest">
            {marqueeText} &nbsp; • &nbsp; {marqueeText}
          </div>
        </div>
      </div>

      <AdSlot placement="header" />

      <main ref={mainRef} className="flex-grow w-full">
        {state.view === 'home' && (
          <div className="animate-in fade-in duration-700">
            <section className="relative py-20 bg-white dark:bg-pakgreen-dark/40 border-b border-gold/5 overflow-hidden">
              <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-pakgreen dark:bg-pakgreen-light border border-gold/30 rounded mb-6 shadow-sm">
                    <Star className="h-2 w-2 text-gold-light fill-current" />
                    <span className="text-[9px] font-black text-white uppercase tracking-[0.1em]">National Academic Standard</span>
                  </div>
                  <h1 className="text-5xl sm:text-7xl font-black text-pakgreen dark:text-white uppercase tracking-tighter mb-8 leading-none drop-shadow-lg">Elite <span className="text-gold">Academic</span> Portal</h1>
                  <p className="text-zinc-600 dark:text-zinc-300 text-lg mb-10 max-w-lg leading-relaxed font-medium">Pakistan's premier platform for Law Admission Tests, SPSC preparation, and standardized admissions coaching. Trusted by students nationwide.</p>
                  <div className="flex flex-wrap gap-4">
                    <button onClick={() => handleNavigate('category', 'lat')} className="bg-pakgreen text-white dark:bg-gold-light dark:text-pakgreen px-12 py-6 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl transition-all hover:scale-105">Explore Tracks</button>
                    <button onClick={() => handleNavigate('notifications')} className="border-2 border-pakgreen dark:border-gold-light px-12 py-6 rounded-2xl font-black uppercase text-xs tracking-widest transition-all hover:bg-zinc-100 dark:hover:bg-pakgreen-dark dark:text-gold-light">Bulletin Archive</button>
                  </div>
                </div>
                <div className="hidden lg:block relative">
                   <div className="absolute -top-10 -right-10 w-64 h-64 bg-gold/10 blur-3xl rounded-full"></div>
                  <div className="w-full aspect-square bg-pakgreen rounded-[60px] border-4 border-gold/20 flex flex-col p-12 shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 islamic-pattern opacity-10"></div>
                    <BookOpen className="h-24 w-24 text-gold-light mb-8 relative z-10 transition-transform group-hover:scale-110" />
                    <h3 className="text-white text-5xl font-black uppercase relative z-10 leading-tight">Professional Academy</h3>
                    <p className="text-gold-light/80 font-black text-[12px] uppercase tracking-[0.5em] mt-auto relative z-10">Gateway to legal and academic excellence</p>
                  </div>
                </div>
              </div>
            </section>
            
            <section className="max-w-7xl mx-auto px-6 py-24">
               <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                  <div>
                    <span className="text-gold font-black uppercase text-[11px] tracking-[0.4em] mb-2 block">Preparation Modules</span>
                    <h3 className="text-4xl font-black text-pakgreen dark:text-white uppercase tracking-tighter">Academic Tracks</h3>
                  </div>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {categories.map(sub => (
                    <div key={sub.id} onClick={() => handleNavigate('category', sub.id)} className="group p-12 bg-white dark:bg-pakgreen-dark/30 backdrop-blur-sm border border-gold/10 rounded-[48px] hover:border-gold-light transition-all cursor-pointer shadow-xl relative overflow-hidden hover:transform hover:-translate-y-2">
                       <div className="bg-pakgreen/5 dark:bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-gold-light/20 transition-colors">
                          <BookOpen className="h-8 w-8 text-pakgreen dark:text-gold-light" />
                       </div>
                       <h3 className="font-black text-pakgreen dark:text-gold-light text-xl uppercase mb-4 tracking-tight">{sub.name}</h3>
                       <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest leading-relaxed line-clamp-3">{sub.description}</p>
                       <div className="mt-8 flex items-center gap-2 text-gold font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                          Explore Track <ArrowRight className="h-4 w-4" />
                       </div>
                       <ChevronRight className="h-6 w-6 text-gold-light absolute bottom-10 right-10 opacity-20 group-hover:opacity-100 transition-all" />
                    </div>
                  ))}
               </div>
            </section>
          </div>
        )}

        {state.view === 'category' && (
          <div className="max-w-7xl mx-auto px-6 py-12 animate-in fade-in">
             <div className="mb-12">
                <button onClick={() => window.history.back()} className="text-xs font-black uppercase text-zinc-400 hover:text-pakgreen flex items-center gap-2 mb-6"><ArrowRight className="h-4 w-4 rotate-180" /> Return</button>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                   <div>
                      <h2 className="text-4xl font-black text-pakgreen dark:text-white uppercase tracking-tighter mb-2">{categories.find(c => c.id === state.selectedSubCategory)?.name || 'Track Registry'}</h2>
                      <p className="text-gold-light font-black uppercase text-[10px] tracking-[0.3em]">{categories.find(c => c.id === state.selectedSubCategory)?.description}</p>
                   </div>
                   {isLLB && availableLLBSemesters.length > 1 && (
                     <div className="flex flex-wrap gap-2 p-1.5 bg-zinc-100 dark:bg-pakgreen-dark/50 rounded-2xl border border-gold/10">
                        {availableLLBSemesters.map(sid => (
                          <button key={sid} onClick={() => handleNavigate('category', sid)} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${state.selectedSubCategory === sid ? 'bg-pakgreen text-white shadow-lg' : 'text-zinc-500 hover:bg-white/10'}`}>
                            Sem {sid.split('-s')[1] || sid.replace('llb-', '')}
                          </button>
                        ))}
                     </div>
                   )}
                </div>
             </div>
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-8 space-y-12">
                   <section>
                      <h3 className="text-xl font-black text-pakgreen dark:text-white uppercase mb-8 flex items-center gap-4"><ListChecks className="h-8 w-8 text-gold-light" /> Assessment Library</h3>
                      {renderGroupedItems(state.selectedSubCategory, quizzes, (q: Quiz) => (
                          <div key={q.id} onClick={() => handleNavigate('quiz', undefined, q.id)} className="bg-white dark:bg-pakgreen-dark/40 p-8 rounded-[32px] flex justify-between items-center hover:border-gold-light border border-transparent dark:border-white/5 transition-all cursor-pointer shadow-lg group">
                             <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-sm font-black text-gold group-hover:bg-gold transition-all">{q.orderNumber || 0}</div>
                                <div className="flex flex-col">
                                   <h4 className="font-black text-base uppercase text-zinc-800 dark:text-zinc-100">{q.title}</h4>
                                   <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{q.questions?.length || 0} Items</span>
                                </div>
                             </div>
                             <ArrowRight className="h-6 w-6 text-gold-light opacity-30 group-hover:opacity-100 transition-all" />
                          </div>
                        ), "No active assessments found.")}
                   </section>
                </div>
             </div>
          </div>
        )}

        {state.view === 'quiz' && activeQuiz && <QuizModule quiz={activeQuiz} categories={categories} onComplete={() => loadData()} />}

        {state.view === 'admin' && state.isAdmin && (
          <>{!isAuthenticated ? <AdminLogin onLogin={() => {setIsAuthenticated(true); loadData();}} /> : (
            <div className="max-w-7xl mx-auto px-6 py-12">
              <div className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-4"><Settings className="h-8 w-8 text-gold-light" /><h2 className="text-4xl font-black text-pakgreen dark:text-gold-light uppercase tracking-tighter">Admin Console</h2></div>
                <button onClick={() => {setIsAuthenticated(false); localStorage.removeItem('admin_auth');}} className="px-6 py-3 bg-zinc-100 dark:bg-white/5 text-zinc-500 font-black text-[10px] uppercase rounded-xl transition-all border border-transparent hover:border-current"><LogOut className="h-4 w-4" /></button>
              </div>
              <AdminPanel 
                notifications={notifications} categories={categories} topics={topics} quizzes={quizzes} notes={notes}
                onAddNotification={async (n) => { await dataService.addNotification(n); loadData(); }} 
                onDeleteNotification={async (id) => { await dataService.deleteNotification(id); loadData(); }} 
                onAddCategory={async (c) => { await dataService.addCategory(c); loadData(); }} 
                onDeleteCategory={async (id) => { await dataService.deleteCategory(id); loadData(); }} 
                onAddTopic={async (t) => { await dataService.addTopic(t); loadData(); }}
                onDeleteTopic={async (id) => { await dataService.deleteTopic(id); loadData(); }}
                onAddQuiz={async (q) => { await dataService.addQuiz(q); loadData(); }} 
                onDeleteQuiz={async (id) => { await dataService.deleteQuiz(id); loadData(); }} 
                onAddNote={async (n) => { await dataService.addNote(n); loadData(); }}
                onDeleteNote={async (id) => { await dataService.deleteNote(id); loadData(); }}
              />
            </div>
          )}</>
        )}
      </main>
    </div>
  );
};

export default App;