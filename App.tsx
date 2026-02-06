
import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import QuizModule from './components/QuizModule';
import AdminPanel from './components/AdminPanel';
import AdBanner from './components/AdBanner';
import AdSenseUnit from './components/AdSenseUnit';
import { 
  LAW_SUBCATEGORIES,
  GENERAL_SUBCATEGORIES
} from './constants';
import { dataService } from './services/dataService';
import { AppState, Notification, Quiz, SubCategory, StudyNote, QuizFeedback } from './types';
import { 
  ChevronRight, 
  LogOut,
  Facebook,
  Youtube,
  Megaphone,
  BookOpen,
  FileText,
  X,
  Phone,
  Mail,
  Settings,
  ArrowRight,
  GraduationCap,
  ShieldCheck,
  Award,
  Clock,
  Star,
  ListChecks,
  Quote,
  Instagram,
  Linkedin,
  Music as TiktokIcon,
  Lock,
  User,
  ShieldAlert,
  Loader2,
  MessageCircle,
  Hash,
  MapPin,
  ExternalLink,
  Paperclip,
  ThumbsUp
} from 'lucide-react';

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
      const response = await dataService.login(username.trim(), password.trim());
      if (response && response.success) {
        onLogin();
      } else {
        setError(response.error || 'Institutional Authentication Failed');
      }
    } catch (err: any) {
      setError(err.message || 'System Connection Failure');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white dark:bg-pakgreen-dark rounded-[40px] shadow-2xl border border-gold/20 p-10 sm:p-14 relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        <div className="absolute inset-0 islamic-pattern opacity-10"></div>
        <div className="relative z-10 text-center">
          <div className="inline-flex p-5 rounded-3xl bg-gold/10 border border-gold/30 mb-8">
            <ShieldAlert className="h-10 w-10 text-gold-light" />
          </div>
          <h2 className="text-3xl font-black text-pakgreen dark:text-gold-light uppercase tracking-tighter mb-2">Institutional Access</h2>
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-12">Authorized Personnel Only</p>
          
          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-zinc-400 tracking-widest ml-1">Admin Email ID</label>
              <input 
                type="text" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-pakgreen-deepest border-2 border-zinc-200 dark:border-gold/10 p-4 rounded-2xl text-sm font-medium outline-none focus:border-gold-light transition-all dark:text-white" 
                placeholder="admin@academy.pk"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-zinc-400 tracking-widest ml-1">Secure Password</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-pakgreen-deepest border-2 border-zinc-200 dark:border-gold/10 p-4 rounded-2xl text-sm font-medium outline-none focus:border-gold-light transition-all dark:text-white" 
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-500 text-[10px] font-black uppercase text-center break-words">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isVerifying}
              className="w-full py-5 bg-pakgreen dark:bg-gold-light text-white dark:text-pakgreen rounded-2xl font-black uppercase text-[10px] tracking-[0.4em] flex items-center justify-center gap-4 shadow-xl disabled:opacity-70"
            >
              {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Access System <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const PdfViewer: React.FC<{ title: string; url: string; onClose: () => void }> = ({ title, url, onClose }) => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-10 bg-black/90 backdrop-blur-md">
      <div className="bg-white dark:bg-pakgreen-deepest w-full h-full max-w-6xl rounded-[40px] shadow-2xl flex flex-col overflow-hidden border-4 border-gold/20">
        <div className="p-6 border-b border-gold/10 flex justify-between items-center bg-pakgreen">
          <h3 className="text-lg font-black text-white uppercase truncate">{title}</h3>
          <button onClick={onClose} className="p-2 text-white"><X className="h-6 w-6" /></button>
        </div>
        <div className="flex-grow">
          <iframe src={url} className="w-full h-full border-none" title={title} />
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const isSubdomain = window.location.hostname.startsWith('admin.');
    return { view: isSubdomain ? 'admin' : 'home', isAdmin: isSubdomain };
  });
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => localStorage.getItem('admin_auth') === 'true');
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [categories, setCategories] = useState<SubCategory[]>([...LAW_SUBCATEGORIES, ...GENERAL_SUBCATEGORIES]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [feedbacks, setFeedbacks] = useState<QuizFeedback[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [viewingPdf, setViewingPdf] = useState<{ title: string; url: string } | null>(null);

  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [notifs, cats, quizList, noteList, feedbackList] = await Promise.all([
        dataService.getNotifications(),
        dataService.getCategories(),
        dataService.getQuizzes(),
        dataService.getNotes(),
        dataService.getQuizFeedbacks()
      ]);
      
      setNotifications(notifs || []);
      
      const mergedCats = [...LAW_SUBCATEGORIES, ...GENERAL_SUBCATEGORIES];
      if (cats && Array.isArray(cats)) {
        cats.forEach((c: SubCategory) => {
          if (!mergedCats.find(m => m.id === c.id)) mergedCats.push(c);
        });
      }
      setCategories(mergedCats);
      setQuizzes(quizList || []);
      setNotes(noteList || []);
      setFeedbacks(feedbackList || []);
    } catch (err) {
      console.error("Critical System Data Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const isSubdomain = window.location.hostname.startsWith('admin.');
      
      if ((hash === '#/admin' || hash === '#admin') && isSubdomain) {
        setState({ view: 'admin', isAdmin: true });
        return;
      }

      if (hash.startsWith('#/category')) {
        const subId = hash.split('?id=')[1];
        setState(prev => ({ ...prev, view: 'category', selectedSubCategory: subId, isAdmin: isSubdomain }));
      } else if (hash === '#/notifications') {
        setState(prev => ({ ...prev, view: 'notifications', isAdmin: isSubdomain }));
      } else if (hash === '#/contact') {
        setState(prev => ({ ...prev, view: 'contact', isAdmin: isSubdomain }));
      } else if (hash.startsWith('#/quiz')) {
        const quizId = hash.split('?id=')[1];
        const found = quizzes.find((q: Quiz) => q.id === quizId);
        if (found) {
          setActiveQuiz(found);
          setState(prev => ({ ...prev, view: 'quiz', selectedQuiz: quizId, isAdmin: isSubdomain }));
        } else {
          window.location.hash = '#home';
        }
      } else {
        setState(prev => ({ ...prev, view: isSubdomain ? 'admin' : 'home', isAdmin: isSubdomain }));
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [quizzes]);

  const handleNavigate = (view: AppState['view'], subCatId?: string, quizId?: string) => {
    let hash = '';
    if (view === 'category') hash = `#/category?id=${subCatId}`;
    else if (view === 'notifications') hash = '#/notifications';
    else if (view === 'contact') hash = '#/contact';
    else if (view === 'quiz') hash = `#/quiz?id=${quizId}`;
    else hash = '#home';
    
    window.location.hash = hash;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    loadAllData();
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    localStorage.setItem('admin_auth', 'true');
    loadAllData();
  };

  const exitAdminConsole = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_auth');
    const mainDomain = window.location.hostname.replace('admin.', '');
    window.location.href = `${window.location.protocol}//${mainDomain}`;
  };

  const socialLinks = [
    { label: 'TikTok', icon: TiktokIcon, url: 'https://www.tiktok.com/@majid.maqsood8', color: 'hover:text-pink-500' },
    { label: 'Instagram', icon: Instagram, url: 'https://www.instagram.com/majid.maqsood01/?hl=en', color: 'hover:text-purple-500' },
    { label: 'LinkedIn', icon: Linkedin, url: 'https://www.linkedin.com/in/majid-maqsood-633444374/', color: 'hover:text-blue-600' },
    { label: 'Facebook', icon: Facebook, url: 'https://www.facebook.com/MirpurkhasAliTalpurTown/', color: 'hover:text-blue-500' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-pakgreen-deepest text-zinc-900 dark:text-zinc-100 transition-colors islamic-pattern">
      <Navbar onNavigate={handleNavigate} />
      {viewingPdf && <PdfViewer title={viewingPdf.title} url={viewingPdf.url} onClose={() => setViewingPdf(null)} />}
      <AdBanner />

      <main className="flex-grow w-full">
        {isLoading && (
          <div className="fixed top-0 left-0 w-full h-1 bg-gold/30 z-[200]">
            <div className="h-full bg-gold animate-progress w-full origin-left"></div>
          </div>
        )}

        {state.view === 'home' && (
          <div className="animate-in fade-in duration-1000">
            <div className="bg-white dark:bg-pakgreen-deepest py-10 border-b border-gold/10 shadow-inner">
               <div className="max-w-7xl mx-auto px-6 text-center">
                  <h2 className="text-5xl md:text-7xl font-bold text-pakgreen dark:text-gold-light mb-4 tracking-tighter">رب زِدْنِي عِلْمًا</h2>
                  <p className="text-pakgreen dark:text-gold-light font-black text-xl uppercase italic tracking-widest">"My Lord, Increase me in Knowledge"</p>
               </div>
            </div>

            <section className="relative py-20 overflow-hidden bg-white dark:bg-pakgreen-dark">
              <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h1 className="text-5xl sm:text-7xl font-black text-pakgreen dark:text-white leading-tight uppercase tracking-tighter mb-8">
                    Pakistan's <span className="text-gold">Elite</span> Legal Portal
                  </h1>
                  <p className="text-zinc-600 dark:text-zinc-300 text-lg mb-10 max-w-lg leading-relaxed font-medium">
                    State-of-the-art preparation environment for LAT, LAW GAT, MCAT, and superior academic excellence.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button onClick={() => handleNavigate('category', 'lat')} className="bg-pakgreen text-white dark:bg-gold-light dark:text-pakgreen px-12 py-6 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl hover:scale-105 transition-all">
                      Start Preparation
                    </button>
                    <button onClick={() => handleNavigate('notifications')} className="border-2 border-pakgreen dark:border-gold-light px-12 py-6 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-zinc-50 dark:hover:bg-white/5 transition-all">
                      Gazette Updates
                    </button>
                  </div>
                </div>
                <div className="hidden lg:block relative">
                   <div className="w-full aspect-square bg-pakgreen rounded-[60px] border-4 border-gold/20 flex flex-col p-12 shadow-2xl overflow-hidden relative group">
                      <div className="absolute inset-0 islamic-pattern opacity-10"></div>
                      <BookOpen className="h-20 w-20 text-gold-light mb-8 group-hover:scale-110 transition-all" />
                      <h3 className="text-white text-3xl font-black uppercase mb-4">MM Online Academy</h3>
                      <div className="space-y-4 opacity-50">
                        <div className="h-4 w-3/4 bg-white rounded-full"></div>
                        <div className="h-4 w-full bg-white rounded-full"></div>
                        <div className="h-4 w-1/2 bg-white rounded-full"></div>
                      </div>
                   </div>
                </div>
              </div>
            </section>

            {/* Home Ad Slot */}
            <div className="max-w-7xl mx-auto px-6">
               <AdSenseUnit slot="home-hero-bottom" />
            </div>

            <section className="bg-zinc-100 dark:bg-pakgreen-deepest py-20 border-y border-gold/10">
               <div className="max-w-7xl mx-auto px-6">
                  <div className="flex items-center justify-between mb-12">
                     <h2 className="text-3xl font-black text-pakgreen dark:text-white uppercase tracking-tighter flex items-center gap-4">
                        <Megaphone className="h-8 w-8 text-gold-light" /> Institutional Gazette
                     </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     {notifications.slice(0, 3).map(n => (
                        <div key={n.id} className="bg-white dark:bg-pakgreen-dark/40 p-10 rounded-[32px] border border-gold/10 shadow-xl flex flex-col h-full">
                           <span className="text-[10px] font-black text-gold-light uppercase tracking-widest block mb-4">{n.type} • {n.date}</span>
                           <h3 className="text-xl font-black text-pakgreen dark:text-white mb-4 uppercase tracking-tight">{n.title}</h3>
                           <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed mb-6">{n.content}</p>
                           {n.pdfUrl && (
                             <button 
                               onClick={() => setViewingPdf({ title: n.title, url: n.pdfUrl! })}
                               className="mt-auto flex items-center gap-2 text-pakgreen dark:text-gold-light font-black text-[9px] uppercase tracking-widest hover:underline"
                             >
                               <Paperclip className="h-3 w-3" /> View Document
                             </button>
                           )}
                        </div>
                     ))}
                  </div>
               </div>
            </section>

            <section id="syllabus-section" className="max-w-7xl mx-auto px-6 py-24">
               <h3 className="text-4xl font-black text-pakgreen dark:text-white uppercase mb-16 border-l-8 border-gold-light pl-6 tracking-tighter">Preparation Tracks</h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {categories.map(sub => (
                    <div key={sub.id} onClick={() => handleNavigate('category', sub.id)} className="group p-10 bg-white dark:bg-pakgreen-dark border border-gold/10 rounded-[32px] hover:border-gold-light transition-all cursor-pointer shadow-xl relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                          <BookOpen className="h-20 w-20" />
                       </div>
                       <h3 className="font-black text-pakgreen dark:text-gold-light text-lg uppercase mb-4 tracking-tight">{sub.name}</h3>
                       <p className="text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest leading-relaxed line-clamp-3">{sub.description}</p>
                       <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase text-pakgreen dark:text-gold-light opacity-0 group-hover:opacity-100 transition-all">
                          Enter Track <ChevronRight className="h-4 w-4" />
                       </div>
                    </div>
                  ))}
               </div>
            </section>
          </div>
        )}

        {state.view === 'category' && (
          <div className="max-w-7xl mx-auto px-6 py-12 animate-in fade-in">
             <div className="mb-12 border-b border-gold/20 pb-8 flex justify-between items-end">
                <div>
                   <h2 className="text-3xl font-black text-pakgreen dark:text-gold-light uppercase tracking-tighter">
                      {categories.find(c => c.id === state.selectedSubCategory)?.name || 'Study Track'}
                   </h2>
                   <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-2">National Standard Curriculum • Track ID: {state.selectedSubCategory}</p>
                </div>
                <button onClick={() => handleNavigate('home')} className="text-xs font-black text-pakgreen dark:text-gold-light uppercase hover:underline">Back to Campus</button>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-8 space-y-12">
                   <section>
                      <h3 className="text-xl font-black text-pakgreen dark:text-white uppercase mb-8 flex items-center gap-3">
                         <ListChecks className="h-6 w-6 text-gold-light" /> Mock Assessments
                      </h3>
                      <div className="grid grid-cols-1 gap-4">
                         {quizzes.filter(q => q.subCategoryId === state.selectedSubCategory).map(q => (
                            <div key={q.id} onClick={() => handleNavigate('quiz', undefined, q.id)} className="bg-white dark:bg-pakgreen-dark p-6 rounded-2xl flex justify-between items-center hover:border-gold-light border border-transparent transition-all cursor-pointer group shadow-lg">
                               <div className="flex items-center gap-4">
                                  <FileText className="h-5 w-5 text-gold-light" />
                                  <h4 className="font-black text-sm uppercase tracking-tight text-zinc-800 dark:text-zinc-100">{q.title}</h4>
                               </div>
                               <ArrowRight className="h-5 w-5 text-gold-light opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0" />
                            </div>
                         ))}
                         {quizzes.filter(q => q.subCategoryId === state.selectedSubCategory).length === 0 && (
                            <div className="p-10 text-center border-2 border-dashed border-gold/20 rounded-3xl text-zinc-400 font-bold uppercase text-xs">
                               No assessments registered for this category ID.
                            </div>
                         )}
                      </div>
                   </section>

                   <section>
                      <h3 className="text-xl font-black text-pakgreen dark:text-white uppercase mb-8 flex items-center gap-3">
                         <BookOpen className="h-6 w-6 text-gold-light" /> Study Repository
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         {notes.filter(n => n.subCategoryId === state.selectedSubCategory).map(n => (
                            <div key={n.id} onClick={() => setViewingPdf({ title: n.title, url: n.url })} className="bg-white dark:bg-pakgreen-dark p-6 rounded-2xl flex items-center gap-4 hover:border-gold-light border border-transparent transition-all cursor-pointer shadow-lg group">
                               <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500"><FileText className="h-5 w-5" /></div>
                               <h4 className="font-black text-xs uppercase tracking-tight text-zinc-800 dark:text-zinc-100 line-clamp-1">{n.title}</h4>
                            </div>
                         ))}
                      </div>
                   </section>

                   {/* ACADEMIC FEEDBACK SECTION */}
                   <section className="bg-white dark:bg-pakgreen-dark/40 rounded-[32px] p-8 sm:p-12 border border-gold/10 shadow-2xl">
                      <div className="flex items-center justify-between mb-10">
                        <h3 className="text-xl font-black text-pakgreen dark:text-white uppercase flex items-center gap-3">
                           <MessageCircle className="h-6 w-6 text-gold-light" /> Academic Community
                        </h3>
                        <div className="bg-gold-light/10 px-4 py-1.5 rounded-full text-[10px] font-black text-gold-dark uppercase tracking-widest border border-gold/20">
                           {feedbacks.filter(f => f.isVisible && quizzes.some(q => q.id === f.quizId && q.subCategoryId === state.selectedSubCategory)).length} Reviews
                        </div>
                      </div>
                      
                      <div className="space-y-8">
                         {feedbacks.filter(f => f.isVisible && quizzes.some(q => q.id === f.quizId && q.subCategoryId === state.selectedSubCategory)).map(f => (
                            <div key={f.id} className="flex gap-6 animate-in fade-in slide-in-from-left-4">
                               <div className="h-12 w-12 rounded-full bg-pakgreen dark:bg-gold-light flex items-center justify-center text-white dark:text-pakgreen font-black text-sm shrink-0 shadow-lg">
                                  {f.studentName.charAt(0).toUpperCase()}
                               </div>
                               <div className="flex-grow">
                                  <div className="bg-zinc-50 dark:bg-pakgreen-deepest p-6 rounded-[24px] border border-zinc-200 dark:border-gold/10 shadow-inner relative">
                                     <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-sm font-black text-pakgreen dark:text-gold-light uppercase">{f.studentName}</h4>
                                        <span className="text-[9px] text-zinc-400 font-bold uppercase">{f.date}</span>
                                     </div>
                                     <span className="text-[8px] font-black bg-gold/10 text-gold-dark px-2 py-0.5 rounded border border-gold/20 mb-3 inline-block uppercase tracking-widest">Taken: {f.quizTitle}</span>
                                     <p className="text-xs text-zinc-600 dark:text-zinc-300 font-medium leading-relaxed italic">
                                        "{f.comment}"
                                     </p>
                                  </div>
                                  <div className="flex items-center gap-4 mt-2 ml-4">
                                     <button className="text-[9px] font-black text-zinc-400 hover:text-pakgreen dark:hover:text-gold-light uppercase tracking-widest flex items-center gap-1.5"><ThumbsUp className="h-3 w-3" /> Helpful</button>
                                  </div>
                               </div>
                            </div>
                         ))}
                         {feedbacks.filter(f => f.isVisible && quizzes.some(q => q.id === f.quizId && q.subCategoryId === state.selectedSubCategory)).length === 0 && (
                            <div className="text-center py-10">
                               <Quote className="h-10 w-10 text-zinc-200 dark:text-pakgreen-deepest mx-auto mb-4" />
                               <p className="text-zinc-400 font-black text-[10px] uppercase tracking-widest">No verified student reviews for this track yet.</p>
                            </div>
                         )}
                      </div>
                   </section>
                </div>
                
                <aside className="lg:col-span-4 space-y-8">
                   <div className="bg-pakgreen p-8 rounded-3xl border border-gold/10 shadow-2xl">
                      <GraduationCap className="h-10 w-10 text-gold-light mb-6" />
                      <h3 className="text-white font-black text-xl uppercase mb-4 tracking-tighter">Preparation Guide</h3>
                      <p className="text-gold-light/60 text-xs font-bold uppercase tracking-widest leading-relaxed mb-8">
                         Complete all mock tests to ensure you reach a threshold of 80% before the actual HEC or Bar exam.
                      </p>
                   </div>
                   <AdSenseUnit slot="sidebar-unit" format="rectangle" />
                </aside>
             </div>
          </div>
        )}
        
        {/* Contact, Quiz, Notifications, Admin views... logic remains identical */}
        {state.view === 'quiz' && activeQuiz && (
          <QuizModule quiz={activeQuiz} categories={categories} onComplete={() => loadAllData()} />
        )}

        {state.view === 'contact' && (
          <div className="max-w-7xl mx-auto px-6 py-20 animate-in slide-in-from-bottom-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
              <div>
                <h2 className="text-5xl font-black text-pakgreen dark:text-white uppercase tracking-tighter mb-8">Contact Administration</h2>
                <p className="text-zinc-600 dark:text-zinc-300 mb-12 text-lg">Reach out for admission queries or institutional support.</p>
                <div className="space-y-8">
                  <div className="flex items-center gap-6">
                    <div className="h-16 w-16 bg-gold/10 rounded-2xl flex items-center justify-center text-gold-dark"><Phone className="h-8 w-8" /></div>
                    <div><span className="block text-xs font-black uppercase text-zinc-400">Helpline</span><span className="text-2xl font-black text-pakgreen dark:text-white">+92 318 2990927</span></div>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-pakgreen-dark p-12 rounded-[40px] shadow-2xl border border-gold/10 flex flex-col justify-center">
                <a href="https://wa.me/923182990927" target="_blank" className="bg-[#25D366] text-white w-full py-6 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-4 shadow-xl">
                  <MessageCircle className="h-6 w-6" /> WhatsApp Support
                </a>
              </div>
            </div>
          </div>
        )}

        {state.view === 'notifications' && (
          <div className="max-w-4xl mx-auto px-6 py-20">
             <h2 className="text-4xl font-black text-pakgreen dark:text-gold-light uppercase tracking-tighter mb-12 flex items-center gap-4">
                <Megaphone className="h-10 w-10 text-gold-light" /> Institutional Gazette
             </h2>
             <div className="space-y-8">
                {notifications.map(n => (
                   <div key={n.id} className="bg-white dark:bg-pakgreen-dark/40 border-l-8 border-gold-light p-10 rounded-r-3xl shadow-2xl">
                      <h3 className="text-2xl font-black text-pakgreen dark:text-white mb-6 uppercase tracking-tight">{n.title}</h3>
                      <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed mb-6">{n.content}</p>
                      {n.pdfUrl && (
                        <button onClick={() => setViewingPdf({ title: n.title, url: n.pdfUrl! })} className="flex items-center gap-2 bg-pakgreen dark:bg-gold-light text-white dark:text-pakgreen px-6 py-3 rounded-xl font-black text-[10px] uppercase">
                          <Paperclip className="h-4 w-4" /> Open Official Document
                        </button>
                      )}
                   </div>
                ))}
             </div>
          </div>
        )}

        {state.view === 'admin' && state.isAdmin && (
          <>
            {!isAuthenticated ? (
              <AdminLogin onLogin={handleLoginSuccess} />
            ) : (
              <div className="max-w-7xl mx-auto px-6 py-12">
                <AdminPanel 
                  notifications={notifications}
                  categories={categories}
                  quizzes={quizzes}
                  onAddNotification={async (n) => { await dataService.addNotification(n); loadAllData(); }}
                  onDeleteNotification={async (id) => { await dataService.deleteNotification(id); loadAllData(); }}
                  onAddCategory={async (c) => { await dataService.addCategory(c); loadAllData(); }}
                  onDeleteCategory={async (id) => { await dataService.deleteCategory(id); loadAllData(); }}
                  onAddQuiz={async (q) => { await dataService.addQuiz(q); loadAllData(); }}
                  onDeleteQuiz={async (id) => { await dataService.deleteQuiz(id); loadAllData(); }}
                />
              </div>
            )}
          </>
        )}
      </main>

      <footer className="bg-white dark:bg-pakgreen-dark border-t-4 border-gold-light py-20 mt-auto text-center">
         <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">
           All Rights Reserved 2026 Designed and Developed by <a href="https://marketingclub.com.pk/" target="_blank" rel="noopener noreferrer" className="text-gold-light hover:underline">Marketing club</a>
         </p>
      </footer>
    </div>
  );
};

export default App;
