
import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import QuizModule from './components/QuizModule';
import AdminPanel from './components/AdminPanel';
import AdSlot from './components/AdBanner';
import { LAW_SUBCATEGORIES, GENERAL_SUBCATEGORIES } from './constants';
import { dataService } from './services/dataService';
import { AppState, Notification, Quiz, SubCategory, StudyNote, QuizFeedback } from './types';
import { 
  LogOut, Megaphone, BookOpen, FileText, X, Phone, Mail, Settings, ArrowRight, GraduationCap, ShieldCheck, Award, Star, ListChecks, Instagram, Linkedin, Music as TiktokIcon, ShieldAlert, Loader2, MessageCircle, ExternalLink, ChevronRight, Facebook, Image as ImageIcon, Eye, Share2, PlayCircle, Sparkles, MapPin, Send
} from 'lucide-react';

const WelcomePopup: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-pakgreen-dark/95 backdrop-blur-2xl animate-in fade-in duration-1000"></div>
      <div className="relative w-full max-w-2xl bg-pakgreen dark:bg-pakgreen-deepest rounded-[50px] border-4 border-gold shadow-[0_0_100px_rgba(212,175,55,0.4)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-700">
        <div className="absolute inset-0 islamic-pattern opacity-10"></div>
        <div className="relative z-10 p-10 sm:p-20 text-center">
          <div className="w-24 h-24 bg-gold-light/20 rounded-3xl mx-auto mb-10 flex items-center justify-center border-2 border-gold/30 animate-pulse-subtle">
            <Sparkles className="h-12 w-12 text-gold-light" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tighter mb-6">
            Welcome to <span className="text-gold">MM Academy</span>
          </h2>
          <div className="w-20 h-1 bg-gold mx-auto mb-10 rounded-full"></div>
          <p className="text-zinc-200 text-sm sm:text-lg font-bold leading-relaxed mb-12 uppercase tracking-widest">
            Here we provide test and notes preparation of <span className="text-gold-light">SPSC, IBA Sukkur, LAW GAT, ECAT, MDCAT, HEC</span>, and many other boards.
          </p>
          <div className="flex flex-col items-center gap-4">
            <span className="text-gold-light font-black text-xl uppercase tracking-[0.3em] animate-pulse">LEARN with EXCELLENCE</span>
            <button 
              onClick={onClose}
              className="mt-8 group relative px-16 py-6 bg-gold hover:bg-gold-light text-pakgreen font-black uppercase text-xs tracking-[0.3em] rounded-2xl shadow-2xl transition-all hover:scale-105 active:scale-95 overflow-hidden"
            >
              <span className="relative z-10">Start Learning</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

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
      <div className="w-full max-w-md bg-white dark:bg-pakgreen-dark rounded-[40px] shadow-2xl border border-gold/20 p-10 sm:p-14 relative overflow-hidden animate-in zoom-in-95">
        <div className="absolute inset-0 islamic-pattern opacity-10"></div>
        <div className="relative z-10 text-center">
          <ShieldAlert className="h-10 w-10 text-gold-light mx-auto mb-8" />
          <h2 className="text-3xl font-black text-pakgreen dark:text-gold-light uppercase tracking-tighter mb-12">Institutional Access</h2>
          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-zinc-50 dark:bg-pakgreen-deepest border-2 border-zinc-200 dark:border-gold/10 p-4 rounded-2xl text-sm outline-none dark:text-white" placeholder="Authorized User" required />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-zinc-50 dark:bg-pakgreen-deepest border-2 border-zinc-200 dark:border-gold/10 p-4 rounded-2xl text-sm outline-none dark:text-white" placeholder="Password" required />
            {error && <div className="text-red-500 text-[10px] font-black uppercase text-center">{error}</div>}
            <button type="submit" disabled={isVerifying} className="w-full py-5 bg-pakgreen dark:bg-gold-light text-white dark:text-pakgreen rounded-2xl font-black uppercase text-[10px] tracking-[0.4em] shadow-xl">
              {isVerifying ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Sync Console'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const PdfViewer: React.FC<{ note: Partial<StudyNote> & { title: string; url: string; type?: string }; onClose: () => void }> = ({ note, onClose }) => {
  const isPdf = note.url?.startsWith('data:application/pdf') || note.url?.toLowerCase().endsWith('.pdf');
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-10">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-5xl h-full bg-white dark:bg-pakgreen-deepest rounded-[40px] overflow-hidden flex flex-col shadow-2xl border-4 border-gold/20 animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-gold/10 flex justify-between items-center bg-pakgreen dark:bg-pakgreen-dark">
          <h3 className="text-white font-black uppercase text-sm tracking-widest truncate mr-4">{note.title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl text-white transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-grow bg-zinc-100 dark:bg-pakgreen-deepest relative overflow-hidden">
          {isPdf ? (
            <iframe src={note.url} className="w-full h-full border-none" title={note.title} />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-8 overflow-auto">
              {note.url ? (
                <img src={note.url} alt={note.title} className="max-w-full max-h-full object-contain rounded-xl shadow-xl" />
              ) : (
                <div className="text-pakgreen dark:text-white font-black uppercase">Institutional Content Error</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const isSub = typeof window !== 'undefined' && window.location.hostname.startsWith('admin.');
    return { view: isSub ? 'admin' : 'home', isAdmin: isSub };
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => localStorage.getItem('admin_auth') === 'true');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [categories, setCategories] = useState<SubCategory[]>([...LAW_SUBCATEGORIES, ...GENERAL_SUBCATEGORIES]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [feedbacks, setFeedbacks] = useState<QuizFeedback[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [viewingNote, setViewingNote] = useState<StudyNote | null>(null);
  const [viewingNewsAttachment, setViewingNewsAttachment] = useState<Notification | null>(null);
  const [showWelcome, setShowWelcome] = useState<boolean>(() => {
    return !sessionStorage.getItem('welcome_viewed') && !window.location.hostname.startsWith('admin.');
  });

  const loadData = useCallback(async () => {
    try {
      const [cats, notifs, qs, nts, fbs] = await Promise.all([
        dataService.getCategories().catch(() => []),
        dataService.getNotifications().catch(() => []),
        dataService.getQuizzes().catch(() => []),
        dataService.getNotes().catch(() => []),
        dataService.getQuizFeedbacks().catch(() => [])
      ]);
      const mergedCats = [...LAW_SUBCATEGORIES, ...GENERAL_SUBCATEGORIES];
      if (cats && Array.isArray(cats)) {
        cats.forEach((c: SubCategory) => { if (!mergedCats.find(x => x.id === c.id)) mergedCats.push(c); });
      }
      setCategories(mergedCats);
      setNotifications(notifs || []);
      setQuizzes(qs || []);
      setNotes(nts || []);
      setFeedbacks(fbs || []);
    } catch (err) { console.error("Sync Error", err); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      const isSub = window.location.hostname.startsWith('admin.');
      if (hash.startsWith('#/category')) setState(p => ({ ...p, view: 'category', selectedSubCategory: hash.split('?id=')[1], isAdmin: isSub }));
      else if (hash.startsWith('#/quiz')) {
        const found = quizzes.find((q: Quiz) => q.id === hash.split('?id=')[1]);
        if (found) setActiveQuiz(found);
        setState(p => ({ ...p, view: 'quiz', selectedQuiz: hash.split('?id=')[1], isAdmin: isSub }));
      } else if (hash === '#/notifications') setState(p => ({ ...p, view: 'notifications', isAdmin: isSub }));
      else if (hash === '#/contact') setState(p => ({ ...p, view: 'contact', isAdmin: isSub }));
      else setState(p => ({ ...p, view: isSub ? 'admin' : 'home', isAdmin: isSub }));
    };
    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => window.removeEventListener('hashchange', handleHash);
  }, [quizzes]);

  const socialLinks = [
    { label: 'TikTok', icon: TiktokIcon, url: 'https://www.tiktok.com/@majid.maqsood8', color: 'hover:text-pink-500' },
    { label: 'Instagram', icon: Instagram, url: 'https://www.instagram.com/majid.maqsood01/?hl=en', color: 'hover:text-purple-500' },
    { label: 'LinkedIn', icon: Linkedin, url: 'https://www.linkedin.com/in/majid-maqsood-633444374/', color: 'hover:text-blue-600' },
    { label: 'Facebook', icon: Facebook, url: 'https://www.facebook.com/MirpurkhasAliTalpurTown/', color: 'hover:text-blue-500' }
  ];

  const handleNavigate = (view: AppState['view'], sub?: string, qId?: string) => {
    window.location.hash = view === 'category' ? `#/category?id=${sub}` : view === 'quiz' ? `#/quiz?id=${qId}` : view === 'notifications' ? '#/notifications' : view === 'contact' ? '#/contact' : '#home';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShareNews = async (n: Notification) => {
    const shareData = {
      title: n.title,
      text: `${n.title}: ${n.content.substring(0, 100)}...`,
      url: window.location.origin + '#/notifications'
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (err) { console.error("Share error", err); }
    } else {
      navigator.clipboard.writeText(shareData.url);
      alert("Link copied to clipboard for sharing.");
    }
  };

  const closeWelcome = () => {
    setShowWelcome(false);
    sessionStorage.setItem('welcome_viewed', 'true');
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-pakgreen-deepest transition-colors islamic-pattern">
      <Navbar onNavigate={handleNavigate} />
      <AdSlot placement="header" />

      <main className="flex-grow w-full">
        {state.view === 'home' && (
          <div className="animate-in fade-in duration-700">
            <section className="relative py-20 bg-white dark:bg-pakgreen-dark">
              <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h1 className="text-5xl sm:text-7xl font-black text-pakgreen dark:text-white uppercase tracking-tighter mb-8">Elite <span className="text-gold">Legal</span> Portal</h1>
                  <p className="text-zinc-600 dark:text-zinc-300 text-lg mb-10 max-w-lg leading-relaxed font-medium">Premier preparation environment for National Law and General Admission Tests.</p>
                  <div className="flex flex-wrap gap-4">
                    <button onClick={() => handleNavigate('category', 'lat')} className="bg-pakgreen text-white dark:bg-gold-light dark:text-pakgreen px-12 py-6 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl transition-all">Start Track</button>
                    <button onClick={() => handleNavigate('notifications')} className="border-2 border-pakgreen dark:border-gold-light px-12 py-6 rounded-2xl font-black uppercase text-xs tracking-widest transition-all">News Updates</button>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <div className="w-full aspect-square bg-pakgreen rounded-[60px] border-4 border-gold/20 flex flex-col p-12 shadow-2xl relative">
                    <div className="absolute inset-0 islamic-pattern opacity-10"></div>
                    <BookOpen className="h-20 w-20 text-gold-light mb-8" />
                    <h3 className="text-white text-3xl font-black uppercase">MM Academy</h3>
                  </div>
                </div>
              </div>
            </section>
            
            <div className="max-w-7xl mx-auto px-6"><AdSlot placement="content" /></div>

            {/* HOME NEWS SECTION - AUTO-DISPLAY IMAGES */}
            <section className="bg-zinc-100 dark:bg-pakgreen-deepest py-20 border-y border-gold/10">
               <div className="max-w-7xl mx-auto px-6">
                  <div className="flex items-center justify-between mb-12">
                     <h2 className="text-3xl font-black text-pakgreen dark:text-white uppercase tracking-tighter flex items-center gap-4">
                        <Megaphone className="h-8 w-8 text-gold-light" /> Institutional News
                     </h2>
                     <button onClick={() => handleNavigate('notifications')} className="text-xs font-black uppercase tracking-widest text-pakgreen dark:text-gold-light hover:underline">View All</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     {notifications.slice(0, 3).map(n => (
                        <div key={n.id} className="bg-white dark:bg-pakgreen-dark/40 p-8 rounded-[32px] border border-gold/10 shadow-xl flex flex-col h-full hover:border-gold-light/50 transition-all group overflow-hidden">
                           <div className="flex justify-between items-start mb-4">
                             <span className="text-[9px] font-black text-gold-light uppercase tracking-widest">{n.type} • {n.date}</span>
                             <button onClick={() => handleShareNews(n)} className="text-zinc-400 hover:text-gold-light transition-colors"><Share2 className="h-4 w-4" /></button>
                           </div>
                           
                           {/* AUTOMATIC NEWS IMAGE DISPLAY */}
                           {n.attachmentUrl && n.attachmentUrl.length > 5 && (
                             <div className="w-full h-48 overflow-hidden rounded-2xl mb-4 border border-gold/5 bg-zinc-50 flex items-center justify-center">
                                <img 
                                  src={n.attachmentUrl} 
                                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-pointer" 
                                  alt={n.title} 
                                  onClick={() => setViewingNewsAttachment(n)}
                                />
                             </div>
                           )}
                           
                           <h3 className="text-lg font-black text-pakgreen dark:text-white mb-3 uppercase tracking-tight line-clamp-2">{n.title}</h3>
                           <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed mb-6 flex-grow">{n.content}</p>
                           
                           <div className="flex flex-col gap-2 mt-auto">
                              {/* QUIZ SHORTCUT BUTTON */}
                              {n.linkedQuizId && (
                                <button onClick={() => handleNavigate('quiz', undefined, n.linkedQuizId)} className="w-full flex items-center justify-center gap-2 py-3 bg-gold text-pakgreen rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-gold-light transition-all shadow-md">
                                  <PlayCircle className="h-4 w-4" /> Start Shortcut Quiz
                                </button>
                              )}
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </section>

            <section className="max-w-7xl mx-auto px-6 py-24">
               <h3 className="text-4xl font-black text-pakgreen dark:text-white uppercase mb-16 border-l-8 border-gold-light pl-6 tracking-tighter">Preparation Tracks</h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {categories.map(sub => (
                    <div key={sub.id} onClick={() => handleNavigate('category', sub.id)} className="group p-10 bg-white dark:bg-pakgreen-dark border border-gold/10 rounded-[32px] hover:border-gold-light transition-all cursor-pointer shadow-xl relative overflow-hidden">
                       <h3 className="font-black text-pakgreen dark:text-gold-light text-lg uppercase mb-4">{sub.name}</h3>
                       <p className="text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest leading-relaxed line-clamp-3">{sub.description}</p>
                       <ChevronRight className="h-6 w-6 text-gold-light absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                  ))}
               </div>
            </section>
          </div>
        )}

        {state.view === 'category' && (
          <div className="max-w-7xl mx-auto px-6 py-12 animate-in fade-in">
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-8 space-y-12">
                   <section>
                      <h3 className="text-xl font-black text-pakgreen dark:text-white uppercase mb-8 flex items-center gap-3"><ListChecks className="h-6 w-6 text-gold-light" /> Track Assessments</h3>
                      <div className="grid grid-cols-1 gap-4">
                         {quizzes.filter(q => q.subCategoryId === state.selectedSubCategory).map(q => (
                            <div key={q.id} onClick={() => handleNavigate('quiz', undefined, q.id)} className="bg-white dark:bg-pakgreen-dark p-6 rounded-2xl flex justify-between items-center hover:border-gold-light border border-transparent transition-all cursor-pointer shadow-lg group">
                               <div className="flex items-center gap-4"><FileText className="h-5 w-5 text-gold-light" /><h4 className="font-black text-sm uppercase text-zinc-800 dark:text-zinc-100">{q.title}</h4></div>
                               <ArrowRight className="h-5 w-5 text-gold-light opacity-0 group-hover:opacity-100 transition-all" />
                            </div>
                         ))}
                      </div>
                   </section>
                   <section>
                      <h3 className="text-xl font-black text-pakgreen dark:text-white uppercase mb-8 flex items-center gap-3"><BookOpen className="h-6 w-6 text-gold-light" /> Study Repository</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         {notes.filter(n => n.subCategoryId === state.selectedSubCategory).map(n => (
                            <div key={n.id} onClick={() => setViewingNote(n)} className="bg-white dark:bg-pakgreen-dark p-6 rounded-2xl flex items-center gap-4 hover:border-gold-light shadow-lg transition-all cursor-pointer">
                               <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500"><FileText className="h-5 w-5" /></div>
                               <h4 className="font-black text-xs uppercase text-zinc-800 dark:text-zinc-100 line-clamp-1">{n.title}</h4>
                            </div>
                         ))}
                      </div>
                   </section>
                </div>
                <aside className="lg:col-span-4"><AdSlot placement="sidebar" /></aside>
             </div>
          </div>
        )}

        {state.view === 'quiz' && activeQuiz && <QuizModule quiz={activeQuiz} categories={categories} onComplete={() => loadData()} />}

        {state.view === 'notifications' && (
          <div className="max-w-4xl mx-auto px-6 py-20">
             <h2 className="text-4xl font-black text-pakgreen dark:text-gold-light uppercase tracking-tighter mb-12 flex items-center gap-4"><Megaphone className="h-10 w-10 text-gold-light" /> Institutional News</h2>
             <div className="space-y-8">
                {notifications.map(n => (
                   <div key={n.id} className="bg-white dark:bg-pakgreen-dark/40 border-l-8 border-gold-light p-10 rounded-r-3xl shadow-2xl flex flex-col gap-6 overflow-hidden">
                      <div className="flex justify-between items-center">
                         <span className="text-[10px] font-black text-gold-light uppercase tracking-[0.3em]">{n.type}</span>
                         <div className="flex items-center gap-4">
                            <button onClick={() => handleShareNews(n)} className="text-zinc-400 hover:text-gold-light flex items-center gap-2 text-[9px] font-black uppercase"><Share2 className="h-4 w-4" /> Share</button>
                            <span className="text-[10px] font-black text-zinc-400 uppercase">{n.date}</span>
                         </div>
                      </div>
                      
                      {/* AUTOMATIC NEWS IMAGE DISPLAY ON NOTIFICATIONS PAGE */}
                      {n.attachmentUrl && n.attachmentUrl.length > 5 && (
                        <div className="w-full rounded-3xl overflow-hidden border-4 border-gold/10">
                           <img src={n.attachmentUrl} className="w-full h-auto object-cover cursor-pointer hover:opacity-95 transition-opacity" alt={n.title} onClick={() => setViewingNewsAttachment(n)} />
                        </div>
                      )}

                      <h3 className="text-2xl font-black text-pakgreen dark:text-white uppercase tracking-tight">{n.title}</h3>
                      <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">{n.content}</p>
                      
                      {n.linkedQuizId && (
                        <button onClick={() => handleNavigate('quiz', undefined, n.linkedQuizId)} className="self-start flex items-center gap-3 px-10 py-5 bg-gold text-pakgreen rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all hover:scale-105">
                          <PlayCircle className="h-4 w-4" /> Start Associated Assessment
                        </button>
                      )}
                   </div>
                ))}
             </div>
          </div>
        )}

        {state.view === 'contact' && (
          <div className="max-w-7xl mx-auto px-6 py-24 animate-in fade-in">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                <div className="space-y-12">
                   <div>
                      <h2 className="text-5xl font-black text-pakgreen dark:text-white uppercase tracking-tighter mb-6">Get in <span className="text-gold">Touch</span></h2>
                      <p className="text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">Have questions about our preparation modules? Our academic support team is available 24/7 to assist you.</p>
                   </div>
                   <div className="space-y-6">
                      <div className="flex items-start gap-6 p-8 bg-white dark:bg-pakgreen-dark/40 rounded-3xl border border-gold/10 shadow-lg">
                         <div className="p-4 bg-pakgreen rounded-2xl text-gold-light"><Phone className="h-6 w-6" /></div>
                         <div><p className="text-[10px] font-black uppercase text-zinc-400 mb-1">Direct Line</p><p className="text-lg font-black text-pakgreen dark:text-white">+92 318 2990927</p></div>
                      </div>
                      <div className="flex items-start gap-6 p-8 bg-white dark:bg-pakgreen-dark/40 rounded-3xl border border-gold/10 shadow-lg">
                         <div className="p-4 bg-pakgreen rounded-2xl text-gold-light"><Mail className="h-6 w-6" /></div>
                         <div><p className="text-[10px] font-black uppercase text-zinc-400 mb-1">Email Registry</p><p className="text-lg font-black text-pakgreen dark:text-white uppercase">mmonlineacademy26@gmail.com</p></div>
                      </div>
                      <div className="flex items-start gap-6 p-8 bg-white dark:bg-pakgreen-dark/40 rounded-3xl border border-gold/10 shadow-lg">
                         <div className="p-4 bg-pakgreen rounded-2xl text-gold-light"><MapPin className="h-6 w-6" /></div>
                         <div><p className="text-[10px] font-black uppercase text-zinc-400 mb-1">Headquarters</p><p className="text-lg font-black text-pakgreen dark:text-white uppercase">Mirpurkhas, Sindh, Pakistan</p></div>
                      </div>
                   </div>
                   
                   <div className="pt-8 border-t border-gold/10">
                      <h4 className="text-sm font-black uppercase text-pakgreen dark:text-gold-light mb-8 tracking-widest text-center">Follow our Academic Updates</h4>
                      <div className="flex justify-center gap-6">
                        {socialLinks.map(s => (
                          <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" className={`p-5 bg-white dark:bg-pakgreen-dark text-pakgreen dark:text-gold-light rounded-2xl shadow-xl hover:scale-110 transition-all border border-gold/10 ${s.color}`}>
                            <s.icon className="h-7 w-7" />
                          </a>
                        ))}
                      </div>
                   </div>
                </div>
                
                <div className="bg-white dark:bg-pakgreen-dark p-12 rounded-[50px] shadow-2xl border-4 border-gold/20 relative overflow-hidden">
                   <div className="absolute inset-0 islamic-pattern opacity-10"></div>
                   <div className="relative z-10">
                      <h3 className="text-2xl font-black text-pakgreen dark:text-white uppercase mb-8">Send Academic Inquiry</h3>
                      <form className="space-y-6" onSubmit={e => e.preventDefault()}>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                           <input className="w-full p-5 bg-zinc-50 dark:bg-pakgreen-deepest rounded-2xl border border-zinc-200 dark:border-gold/10 text-sm outline-none dark:text-white" placeholder="Student Name" />
                           <input className="w-full p-5 bg-zinc-50 dark:bg-pakgreen-deepest rounded-2xl border border-zinc-200 dark:border-gold/10 text-sm outline-none dark:text-white" placeholder="Email Address" />
                         </div>
                         <textarea className="w-full p-5 bg-zinc-50 dark:bg-pakgreen-deepest rounded-2xl border border-zinc-200 dark:border-gold/10 text-sm outline-none dark:text-white" rows={5} placeholder="How can we help you achieve your goals?" />
                         <button className="w-full py-6 bg-pakgreen dark:bg-gold text-white dark:text-pakgreen font-black uppercase text-xs tracking-[0.3em] rounded-2xl shadow-xl flex items-center justify-center gap-3">Register Inquiry <Send className="h-4 w-4" /></button>
                      </form>
                   </div>
                </div>
             </div>
          </div>
        )}

        {state.view === 'admin' && state.isAdmin && (
          <>{!isAuthenticated ? <AdminLogin onLogin={() => {setIsAuthenticated(true); localStorage.setItem('admin_auth', 'true'); loadData();}} /> : (
            <div className="max-w-7xl mx-auto px-6 py-12">
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-3xl font-black text-pakgreen dark:text-gold-light uppercase tracking-tighter flex items-center gap-4"><Settings className="h-8 w-8" /> Console Control</h2>
                <button onClick={() => {setIsAuthenticated(false); localStorage.removeItem('admin_auth');}} className="flex items-center gap-2 text-zinc-500 font-black text-[10px] uppercase hover:text-pakgreen transition-colors"><LogOut className="h-4 w-4" /> Exit</button>
              </div>
              <AdminPanel notifications={notifications} categories={categories} quizzes={quizzes} onAddNotification={async (n) => { await dataService.addNotification(n); loadData(); }} onDeleteNotification={async (id) => { await dataService.deleteNotification(id); loadData(); }} onAddCategory={async (c) => { await dataService.addCategory(c); loadData(); }} onDeleteCategory={async (id) => { await dataService.deleteCategory(id); loadData(); }} onAddQuiz={async (q) => { await dataService.addQuiz(q); loadData(); }} onDeleteQuiz={async (id) => { await dataService.deleteQuiz(id); loadData(); }} />
            </div>
          )}</>
        )}
      </main>

      <footer className="bg-white dark:bg-pakgreen-dark border-t-4 border-gold-light py-20 mt-auto">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-2">
               <div className="flex items-center gap-4 mb-8"><BookOpen className="h-10 w-10 text-pakgreen dark:text-gold-light" /><span className="text-2xl font-black uppercase text-pakgreen dark:text-gold-light tracking-tighter">MM Academy</span></div>
               <p className="text-zinc-500 dark:text-zinc-400 max-w-sm uppercase font-black text-[10px] tracking-widest leading-relaxed mb-8">National gateway to legal excellence and academic advancement.</p>
               <div className="flex items-center gap-4">
                  {socialLinks.map((s) => (
                    <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" className={`p-2 bg-pakgreen-deepest/5 dark:bg-white/5 rounded-lg transition-all ${s.color}`}><s.icon className="h-5 w-5" /></a>
                  ))}
               </div>
            </div>
            <div>
               <h4 className="font-black uppercase text-sm mb-6 text-pakgreen dark:text-gold-light tracking-widest">Navigation</h4>
               <ul className="space-y-4 text-xs font-bold text-zinc-400 uppercase">
                  <li className="hover:text-gold transition-colors cursor-pointer" onClick={() => handleNavigate('category', 'lat')}>LAT</li>
                  <li className="hover:text-gold transition-colors cursor-pointer" onClick={() => handleNavigate('category', 'law-gat')}>LAW GAT</li>
                  <li className="hover:text-gold transition-colors cursor-pointer" onClick={() => handleNavigate('notifications')}>News</li>
               </ul>
            </div>
            <div>
               <h4 className="font-black uppercase text-sm mb-6 text-pakgreen dark:text-gold-light tracking-widest">Connect</h4>
               <ul className="space-y-4 text-xs font-bold text-zinc-400 uppercase">
                  <li>+92 318 2990927</li>
                  <li className="break-all uppercase">mmonlineacademy26@gmail.com</li>
               </ul>
            </div>
         </div>
         <div className="max-w-7xl mx-auto px-6 text-center border-t border-gold/10 pt-12">
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">All right reserved 2026 Designed and developed by <a href="https://marketingclub.com.pk" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors underline">marketing club</a></p>
         </div>
      </footer>
      {viewingNote && <PdfViewer note={viewingNote} onClose={() => setViewingNote(null)} />}
      {viewingNewsAttachment && <PdfViewer note={{ title: viewingNewsAttachment.title, url: viewingNewsAttachment.attachmentUrl || '' }} onClose={() => setViewingNewsAttachment(null)} />}
      {showWelcome && <WelcomePopup onClose={closeWelcome} />}
    </div>
  );
};

export default App;
