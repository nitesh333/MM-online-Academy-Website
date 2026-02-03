
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import QuizModule from './components/QuizModule';
import AdminPanel from './components/AdminPanel';
import AdBanner from './components/AdBanner';
import { 
  MOCK_QUIZ 
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
  Music,
  Lock,
  User,
  ShieldAlert,
  Loader2,
  MessageCircle,
  Hash,
  MapPin
} from 'lucide-react';

const AdminLogin: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [debug, setDebug] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError('');
    setDebug('');
    
    const cleanUser = username.trim();
    const cleanPass = password.trim();

    try {
      if (!cleanUser || !cleanPass) {
        setError("Missing credentials.");
        setIsVerifying(false);
        return;
      }

      const response = await dataService.login(cleanUser, cleanPass);
      if (response && response.success) {
        onLogin();
      } else {
        setError(response.error || 'Authentication Failed');
        if (response.debug) setDebug(response.debug);
      }
    } catch (err: any) {
      setError('Connection Error');
      setDebug(err.message || 'Server unreachable');
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
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input 
                  type="text" 
                  autoComplete="username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-pakgreen-deepest border-2 border-zinc-200 dark:border-gold/10 p-4 pl-14 rounded-2xl text-sm font-medium outline-none focus:border-gold-light transition-all text-zinc-800 dark:text-zinc-100" 
                  placeholder="admin@academy.pk"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-zinc-400 tracking-widest ml-1">Secure Password</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input 
                  type="password" 
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-pakgreen-deepest border-2 border-zinc-200 dark:border-gold/10 p-4 pl-14 rounded-2xl text-sm font-medium outline-none focus:border-gold-light transition-all text-zinc-800 dark:text-zinc-100" 
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
                <p className="text-red-500 text-[10px] font-black uppercase text-center">{error}</p>
                {debug && <p className="text-zinc-400 text-[8px] mt-2 text-center uppercase tracking-widest">{debug}</p>}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isVerifying}
              className="w-full py-5 bg-pakgreen dark:bg-gold-light text-white dark:text-pakgreen rounded-2xl font-black uppercase text-[10px] tracking-[0.4em] flex items-center justify-center gap-4 hover:scale-[1.02] transition-all shadow-xl mt-8 disabled:opacity-70"
            >
              {isVerifying ? (
                <>Verifying... <Loader2 className="h-4 w-4 animate-spin" /></>
              ) : (
                <>Secure Entrance <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </form>
          
          <p className="mt-8 text-[8px] font-bold text-zinc-400 uppercase tracking-widest">
            By entering, you agree to the National Academic Security Protocol.
          </p>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const isSubdomain = window.location.hostname.startsWith('admin.');
    return {
      view: isSubdomain ? 'admin' : 'home',
      isAdmin: isSubdomain
    };
  });
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('admin_auth') === 'true';
  });
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [categories, setCategories] = useState<SubCategory[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [feedbacks, setFeedbacks] = useState<QuizFeedback[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [viewingNote, setViewingNote] = useState<StudyNote | null>(null);

  const loadAllData = async () => {
    try {
      const [notifs, cats, quizList, noteList, feedbackList] = await Promise.all([
        dataService.getNotifications(),
        dataService.getCategories(),
        dataService.getQuizzes(),
        dataService.getNotes(),
        dataService.getQuizFeedbacks()
      ]);
      setNotifications(notifs || []);
      setCategories(cats || []);
      setQuizzes(quizList || []);
      setNotes(noteList || []);
      setFeedbacks(feedbackList || []);
    } catch (err) {
      console.error("Data loading failed", err);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    const handleHashChange = async () => {
      const hash = window.location.hash;
      const isSubdomain = window.location.hostname.startsWith('admin.');
      
      if ((hash === '#/admin' || hash === '#admin') && isSubdomain) {
        setState({ view: 'admin', isAdmin: true });
        return;
      } else if ((hash === '#/admin' || hash === '#admin') && !isSubdomain) {
        window.location.hash = '#home';
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
        const quizList = await dataService.getQuizzes();
        const found = quizList.find((q: Quiz) => q.id === quizId) || MOCK_QUIZ;
        setActiveQuiz(found);
        setState(prev => ({ ...prev, view: 'quiz', selectedQuiz: quizId, isAdmin: isSubdomain }));
      } else if (hash === '' || hash === '#/' || hash === '#home') {
        setState(prev => ({ ...prev, view: isSubdomain ? 'admin' : 'home', isAdmin: isSubdomain }));
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (view: AppState['view'], subCatId?: string, quizId?: string) => {
    let hash = '';
    if (view === 'category') hash = subCatId ? `#/category?id=${subCatId}` : '#/category';
    else if (view === 'notifications') hash = '#/notifications';
    else if (view === 'contact') hash = '#/contact';
    else if (view === 'quiz') hash = quizId ? `#/quiz?id=${quizId}` : '#/quiz';
    else if (view === 'admin' && state.isAdmin) hash = '#/admin';
    else hash = '#home';
    
    window.location.hash = hash;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    localStorage.setItem('admin_auth', 'true');
  };

  const exitAdminConsole = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_auth');
    const mainDomain = window.location.hostname.replace('admin.', '');
    window.location.href = `${window.location.protocol}//${mainDomain}`;
  };

  const approvedFeedbacks = feedbacks.filter(f => f.isVisible);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-pakgreen-deepest text-zinc-900 dark:text-zinc-100 pb-20 sm:pb-32 overflow-x-hidden transition-colors islamic-pattern">
      <Navbar onNavigate={handleNavigate} />
      
      {viewingNote && <PdfViewer note={viewingNote} onClose={() => setViewingNote(null)} />}

      <AdBanner />

      <main className="flex-grow w-full">
        {state.view === 'home' && (
          <div className="animate-in fade-in duration-1000">
            {/* Islamic Ayat Section */}
            <div className="bg-white dark:bg-pakgreen-deepest py-6 border-b border-gold/10 overflow-hidden">
               <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
                  <div className="mb-4">
                     <img src="https://i.ibb.co/3sX8N5s/ayat.png" alt="Rabbi Zidni Ilma" className="h-16 md:h-24 object-contain invert dark:invert-0 grayscale-0" />
                  </div>
                  <h2 className="text-pakgreen dark:text-gold-light font-black text-lg md:text-2xl uppercase tracking-tighter italic">"My Lord, Increase me in Knowledge"</h2>
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em] mt-2">The Spiritual Foundation of MM Online Academy</p>
               </div>
            </div>

            {/* Hero Section */}
            <section className="relative min-h-[600px] flex items-center overflow-hidden bg-white dark:bg-pakgreen-dark border-b border-gold/20 transition-all shadow-inner">
              <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-pakgreen/5 via-transparent to-gold/5 dark:from-gold-light/5 dark:via-pakgreen-dark/40 dark:to-transparent"></div>
                <div className="absolute inset-0 islamic-pattern opacity-40"></div>
              </div>

              <div className="max-w-7xl mx-auto w-full px-6 sm:px-12 grid grid-cols-1 lg:grid-cols-2 gap-20 relative z-10 py-24">
                <div className="flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold/10 border border-gold/30 text-gold-dark dark:text-gold-light font-black text-[10px] uppercase tracking-[0.3em] mb-10 w-fit">
                    <Star className="h-4 w-4 fill-current" /> Pakistan's Academic Standard
                  </div>
                  <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-pakgreen dark:text-white leading-[0.95] tracking-tighter mb-10 uppercase">
                    Elite <span className="text-transparent bg-clip-text bg-gradient-to-r from-pakgreen to-gold-dark dark:from-gold-light dark:to-yellow-300">Legal</span> &<br /> 
                    Admission Portal
                  </h1>
                  <p className="text-zinc-600 dark:text-zinc-300 text-sm sm:text-lg max-w-xl leading-relaxed mb-12 font-medium tracking-tight">
                    MM Online Academy provides a state-of-the-art preparation environment for LAT, LAW GAT, MCAT, and superior legal studies across Pakistan.
                  </p>
                  
                  <div className="flex flex-wrap gap-6">
                    <button onClick={() => handleNavigate('category', 'lat')} className="bg-pakgreen text-white dark:bg-gold-light dark:text-pakgreen px-12 py-6 rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] flex items-center gap-4 hover:scale-105 transition-all shadow-2xl active:scale-95">
                      Get Started <ArrowRight className="h-5 w-5" />
                    </button>
                    <button onClick={() => document.getElementById('syllabus-section')?.scrollIntoView({ behavior: 'smooth' })} className="bg-white dark:bg-transparent text-pakgreen dark:text-white border-2 border-pakgreen dark:border-gold/30 px-12 py-6 rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] hover:bg-pakgreen/5 dark:hover:bg-gold-light/10 transition-all active:scale-95">
                      Explore Syllabus
                    </button>
                  </div>
                </div>

                <div className="hidden lg:flex items-center justify-center relative">
                   <div className="relative w-full aspect-square max-w-lg bg-pakgreen rounded-[60px] border-4 border-gold/20 shadow-2xl overflow-hidden p-2 group">
                      <div className="w-full h-full bg-zinc-50 dark:bg-pakgreen-deepest rounded-[56px] flex flex-col p-12 relative overflow-hidden transition-all group-hover:scale-105">
                         <div className="absolute inset-0 islamic-pattern opacity-10"></div>
                         <div className="flex items-center justify-between mb-16 relative z-10">
                            <div className="flex items-center gap-4">
                               <div className="h-14 w-14 rounded-2xl bg-gold flex items-center justify-center shadow-xl overflow-hidden">
                                  <img src="https://i.ibb.co/1fWNV4p/logo.png" alt="Logo" className="w-full h-full object-contain p-2" />
                               </div>
                               <span className="text-sm font-black uppercase tracking-[0.3em] text-pakgreen dark:text-gold-light">MM Online Academy</span>
                            </div>
                            <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-widest">Active Enrollment</div>
                         </div>
                         <div className="space-y-8 relative z-10">
                            <div className="h-4 bg-pakgreen/10 dark:bg-gold/10 w-3/4 rounded-full"></div>
                            <div className="h-4 bg-pakgreen/5 dark:bg-gold/5 w-full rounded-full"></div>
                            <div className="h-4 bg-pakgreen/5 dark:bg-gold/5 w-1/2 rounded-full"></div>
                         </div>
                         <div className="mt-auto relative z-10 flex items-center justify-between">
                            <div className="flex -space-x-3">
                               <div className="h-10 w-10 rounded-full border-2 border-white bg-zinc-200"></div>
                               <div className="h-10 w-10 rounded-full border-2 border-white bg-zinc-300"></div>
                               <div className="h-10 w-10 rounded-full border-2 border-white bg-zinc-400"></div>
                            </div>
                            <Star className="h-16 w-16 text-gold/10" />
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </section>

            <div className="bg-pakgreen dark:bg-pakgreen-dark py-4 border-y border-gold/20">
               <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-around items-center gap-8 text-[10px] font-black text-gold-light uppercase tracking-[0.4em]">
                  <span className="flex items-center gap-3 opacity-90"><ShieldCheck className="h-4 w-4" /> National Integrity</span>
                  <span className="flex items-center gap-3 opacity-90"><Award className="h-4 w-4" /> Merit Based Excellence</span>
                  <span className="flex items-center gap-3 opacity-90"><Star className="h-4 w-4" /> Higher Education Approved</span>
               </div>
            </div>

            <div className="max-w-7xl mx-auto w-full px-6 sm:px-12 py-24 lg:py-32">
              <div className="flex flex-col lg:grid lg:grid-cols-12 gap-20">
                <div className="lg:col-span-12 space-y-24">
                  <section>
                    <div className="flex items-center justify-between mb-12">
                       <h2 className="text-2xl sm:text-4xl font-black text-pakgreen dark:text-white uppercase tracking-tighter flex items-center gap-5">
                          <Megaphone className="h-8 w-8 text-gold-light" /> Institutional Gazette
                       </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                      {(notifications || []).filter(n => n.type === 'News' || n.type === 'Test Date').slice(0, 3).map(n => (
                        <div key={n.id} className="group bg-white dark:bg-pakgreen-dark/40 rounded-[32px] border border-pakgreen/5 dark:border-gold/10 hover:border-gold/40 transition-all cursor-pointer p-10 sm:p-14 shadow-xl hover:shadow-gold/5" onClick={() => handleNavigate('notifications')}>
                          <div className="flex justify-between items-start mb-6">
                            <span className="px-4 py-1 rounded-lg bg-pakgreen/5 dark:bg-gold-light/10 text-pakgreen dark:text-gold-light text-[9px] font-black uppercase tracking-widest">{n.type}</span>
                            <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{n.date}</span>
                          </div>
                          <h3 className="text-xl sm:text-2xl font-black text-pakgreen dark:text-zinc-100 mb-6 group-hover:text-gold-light transition-colors tracking-tight">{n.title}</h3>
                          <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed line-clamp-2 font-medium">{n.content}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section id="syllabus-section">
                    <h3 className="text-4xl sm:text-6xl font-black text-pakgreen dark:text-white uppercase tracking-tighter mb-16 border-l-8 border-gold-light pl-10">Preparation Tracks</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                      {(categories || []).map(sub => (
                        <div key={sub.id} onClick={() => handleNavigate('category', sub.id)} className="group p-12 bg-white dark:bg-pakgreen-dark/30 border border-pakgreen/10 dark:border-gold/10 rounded-[40px] hover:border-gold hover:bg-pakgreen/5 dark:hover:bg-gold/5 transition-all cursor-pointer shadow-2xl flex flex-col min-h-[250px] relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                             <BookOpen className="h-24 w-24 text-pakgreen dark:text-gold-light" />
                          </div>
                          <h3 className="font-black text-pakgreen dark:text-gold-light group-hover:text-gold-light transition-colors text-lg uppercase tracking-tight mb-6">{sub.name}</h3>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-bold uppercase tracking-widest line-clamp-3">{sub.description}</p>
                          <div className="mt-auto flex items-center gap-3 text-[10px] font-black uppercase text-pakgreen dark:text-gold-light opacity-0 group-hover:opacity-100 transition-all">
                             View Syllabus <ChevronRight className="h-4 w-4" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Wall of Excellence / Approved Feedback */}
                  {approvedFeedbacks.length > 0 && (
                    <section>
                       <h3 className="text-2xl sm:text-4xl font-black text-pakgreen dark:text-white uppercase tracking-tighter mb-12 flex items-center gap-4">
                          <Award className="h-8 w-8 text-gold-light" /> Wall of Excellence
                       </h3>
                       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                         {approvedFeedbacks.map(f => (
                           <div key={f.id} className="bg-white dark:bg-pakgreen-dark/40 p-10 rounded-[40px] border border-gold/10 shadow-2xl relative group hover:border-gold-light/40 transition-all">
                             <Quote className="h-10 w-10 text-gold-light/10 absolute top-8 right-8 group-hover:text-gold-light/20 transition-all" />
                             <div className="flex items-center gap-4 mb-6">
                               <div className="h-12 w-12 rounded-2xl bg-gold-light/10 flex items-center justify-center font-black text-gold-light text-xl border border-gold/20">
                                 {f.studentName.charAt(0)}
                               </div>
                               <div>
                                 <h4 className="text-sm font-black text-pakgreen dark:text-zinc-100 uppercase tracking-tight">{f.studentName}</h4>
                                 <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{f.quizTitle}</p>
                               </div>
                             </div>
                             <p className="text-zinc-600 dark:text-zinc-300 text-[13px] leading-relaxed italic font-medium">"{f.comment}"</p>
                           </div>
                         ))}
                       </div>
                    </section>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {state.view === 'category' && (
          <div className="max-w-7xl mx-auto px-6 sm:px-12 py-12 animate-in fade-in duration-500">
             <div className="mb-12 border-b border-gold/20 pb-8 flex justify-between items-end">
                <div>
                   <h2 className="text-3xl font-black text-pakgreen dark:text-gold-light uppercase tracking-tighter">{categories.find(c => c.id === state.selectedSubCategory)?.name || 'Study Track'}</h2>
                   <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-black uppercase tracking-[0.4em] mt-2">National Standardized Curriculum</p>
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
                         {(quizzes || []).filter(q => q.subCategoryId === state.selectedSubCategory).map(q => (
                            <div key={q.id} onClick={() => handleNavigate('quiz', undefined, q.id)} className="bg-white dark:bg-pakgreen-dark/30 border border-pakgreen/10 dark:border-gold/10 p-6 rounded-2xl flex justify-between items-center hover:border-gold-light transition-all cursor-pointer group shadow-lg">
                               <div className="flex items-center gap-4">
                                  <div className="h-12 w-12 rounded-xl bg-pakgreen/5 dark:bg-gold-light/5 flex items-center justify-center text-pakgreen dark:text-gold-light group-hover:bg-gold-light group-hover:text-pakgreen transition-all">
                                     <FileText className="h-5 w-5" />
                                  </div>
                                  <div>
                                     <h4 className="font-black text-sm uppercase tracking-tight text-zinc-800 dark:text-zinc-100">{q.title}</h4>
                                     <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{q.questions.length} Items</p>
                                  </div>
                               </div>
                               <ArrowRight className="h-5 w-5 text-gold-light opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0" />
                            </div>
                         ))}
                      </div>
                   </section>

                   <section>
                      <h3 className="text-xl font-black text-pakgreen dark:text-white uppercase mb-8 flex items-center gap-3">
                         <BookOpen className="h-6 w-6 text-gold-light" /> Study Repository
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         {(notes || []).filter(n => n.subCategoryId === state.selectedSubCategory).map(n => (
                            <div key={n.id} onClick={() => setViewingNote(n)} className="bg-white dark:bg-pakgreen-dark/30 border border-pakgreen/10 dark:border-gold/10 p-6 rounded-2xl flex flex-col gap-4 hover:border-gold-light transition-all cursor-pointer shadow-lg group">
                               <div className="flex justify-between items-start">
                                  <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                                     <FileText className="h-5 w-5" />
                                  </div>
                                  <span className="text-[8px] font-black uppercase text-zinc-400 dark:text-zinc-500">PDF Document</span>
                               </div>
                               <h4 className="font-black text-xs uppercase tracking-tight text-zinc-800 dark:text-zinc-100 line-clamp-1">{n.title}</h4>
                            </div>
                         ))}
                      </div>
                   </section>
                </div>

                <aside className="lg:col-span-4">
                   <div className="bg-white dark:bg-pakgreen-dark/50 p-8 rounded-3xl border border-pakgreen/10 dark:border-gold/10 shadow-2xl">
                      <h3 className="font-black text-pakgreen dark:text-gold-light uppercase text-sm mb-6 flex items-center gap-2">
                         <GraduationCap className="h-5 w-5" /> Track Overview
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium uppercase tracking-tight mb-8">
                         {categories.find(c => c.id === state.selectedSubCategory)?.description || "Institutional preparation track for professional excellence."}
                      </p>
                      <div className="space-y-4">
                         <div className="p-4 bg-zinc-50 dark:bg-pakgreen-deepest/50 rounded-xl border border-zinc-200 dark:border-gold/5 flex items-center gap-4">
                            <Clock className="h-4 w-4 text-gold-light" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400">Lifetime Access</span>
                         </div>
                         <div className="p-4 bg-zinc-50 dark:bg-pakgreen-deepest/50 rounded-xl border border-zinc-200 dark:border-gold/5 flex items-center gap-4">
                            <ShieldCheck className="h-4 w-4 text-gold-light" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400">Verified Content</span>
                         </div>
                      </div>
                   </div>
                </aside>
             </div>
          </div>
        )}

        {state.view === 'quiz' && activeQuiz && (
          <div className="py-12">
            <QuizModule 
              quiz={activeQuiz} 
              categories={categories}
              onComplete={(score) => {
                console.log('Quiz finished with score:', score);
                loadAllData();
              }}
            />
          </div>
        )}

        {state.view === 'notifications' && (
           <div className="max-w-4xl mx-auto px-6 py-12 animate-in slide-in-from-bottom-6 duration-700">
              <h2 className="text-4xl font-black text-pakgreen dark:text-gold-light uppercase tracking-tighter mb-12 flex items-center gap-4">
                 <Megaphone className="h-10 w-10 text-gold-light" /> Institutional Gazette
              </h2>
              <div className="space-y-8">
                 {(notifications || []).map(n => (
                    <div key={n.id} className="bg-white dark:bg-pakgreen-dark/40 border-l-8 border-gold-light p-10 rounded-r-3xl shadow-2xl">
                       <div className="flex justify-between items-center mb-6">
                          <span className="text-[10px] font-black text-gold-light uppercase tracking-[0.3em]">{n.type}</span>
                          <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase">{n.date}</span>
                       </div>
                       <h3 className="text-2xl font-black text-pakgreen dark:text-white mb-6 uppercase tracking-tight">{n.title}</h3>
                       <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed font-medium">{n.content}</p>
                    </div>
                 ))}
              </div>
           </div>
        )}

        {state.view === 'contact' && (
          <div className="max-w-7xl mx-auto px-6 sm:px-12 py-12 animate-in fade-in duration-500">
             <div className="text-center mb-16">
                <h2 className="text-4xl md:text-6xl font-black text-pakgreen dark:text-gold-light uppercase tracking-tighter">Contact Administration</h2>
                <p className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.5em] mt-4">We are here to support your excellence</p>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="bg-white dark:bg-pakgreen-dark/40 p-10 sm:p-16 rounded-[40px] border border-gold/10 shadow-2xl relative overflow-hidden">
                   <div className="absolute inset-0 islamic-pattern opacity-5"></div>
                   <div className="relative z-10 space-y-10">
                      <div className="flex items-start gap-6">
                         <div className="h-14 w-14 rounded-2xl bg-pakgreen dark:bg-gold-light flex items-center justify-center text-white dark:text-pakgreen shadow-xl"><Phone className="h-6 w-6" /></div>
                         <div>
                            <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">Direct Helpline</h4>
                            <p className="text-xl font-black text-pakgreen dark:text-white uppercase tracking-tight">+92 318 2990927</p>
                         </div>
                      </div>
                      <div className="flex items-start gap-6">
                         <div className="h-14 w-14 rounded-2xl bg-pakgreen dark:bg-gold-light flex items-center justify-center text-white dark:text-pakgreen shadow-xl"><Mail className="h-6 w-6" /></div>
                         <div>
                            <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">Official Registry</h4>
                            <p className="text-lg font-black text-pakgreen dark:text-white uppercase tracking-tight break-all">mmonlineacademy26@gmail.com</p>
                         </div>
                      </div>
                      <div className="flex items-start gap-6">
                         <div className="h-14 w-14 rounded-2xl bg-pakgreen dark:bg-gold-light flex items-center justify-center text-white dark:text-pakgreen shadow-xl"><MapPin className="h-6 w-6" /></div>
                         <div>
                            <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">Academy Campus</h4>
                            <p className="text-lg font-black text-pakgreen dark:text-white uppercase tracking-tight">Mirpurkhas, Sindh, Pakistan</p>
                         </div>
                      </div>
                   </div>
                   
                   <div className="mt-16 pt-16 border-t border-gold/10 relative z-10">
                      <a 
                        href="https://wa.me/923182990927" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full py-8 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-3xl font-black uppercase text-sm tracking-[0.4em] flex items-center justify-center gap-6 shadow-2xl transition-all hover:scale-[1.02] active:scale-95 group"
                      >
                        <MessageCircle className="h-8 w-8 group-hover:animate-bounce" /> WhatsApp Chat
                      </a>
                   </div>
                </div>

                <div className="space-y-8">
                   <div className="bg-white dark:bg-pakgreen-dark/40 p-10 rounded-[40px] border border-gold/10 shadow-2xl">
                      <h3 className="text-xl font-black text-pakgreen dark:text-gold-light uppercase tracking-tighter mb-8 flex items-center gap-3"><Hash className="h-5 w-5 text-gold-light" /> Digital Presence</h3>
                      <div className="grid grid-cols-2 gap-4">
                         <a href="https://www.facebook.com/MirpurkhasAliTalpurTown/" target="_blank" className="p-6 bg-zinc-50 dark:bg-pakgreen-deepest rounded-2xl border border-zinc-100 dark:border-gold/5 flex items-center gap-4 hover:bg-gold-light group transition-all">
                            <Facebook className="h-5 w-5 text-[#1877F2] group-hover:text-pakgreen" />
                            <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-pakgreen">Facebook</span>
                         </a>
                         <a href="https://www.tiktok.com/@majid.maqsood8" target="_blank" className="p-6 bg-zinc-50 dark:bg-pakgreen-deepest rounded-2xl border border-zinc-100 dark:border-gold/5 flex items-center gap-4 hover:bg-gold-light group transition-all">
                            <Music className="h-5 w-5 text-black dark:text-white group-hover:text-pakgreen" />
                            <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-pakgreen">TikTok</span>
                         </a>
                         <a href="https://www.instagram.com/majid.maqsood01/?hl=en" target="_blank" className="p-6 bg-zinc-50 dark:bg-pakgreen-deepest rounded-2xl border border-zinc-100 dark:border-gold/5 flex items-center gap-4 hover:bg-gold-light group transition-all">
                            <Instagram className="h-5 w-5 text-[#E4405F] group-hover:text-pakgreen" />
                            <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-pakgreen">Instagram</span>
                         </a>
                         <a href="https://www.linkedin.com/in/majid-maqsood-633444374/" target="_blank" className="p-6 bg-zinc-50 dark:bg-pakgreen-deepest rounded-2xl border border-zinc-100 dark:border-gold/5 flex items-center gap-4 hover:bg-gold-light group transition-all">
                            <Linkedin className="h-5 w-5 text-[#0A66C2] group-hover:text-pakgreen" />
                            <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-pakgreen">LinkedIn</span>
                         </a>
                      </div>
                   </div>

                   <div className="bg-pakgreen dark:bg-gold-light p-12 rounded-[40px] shadow-2xl border-4 border-gold/20 flex flex-col items-center justify-center text-center gap-6">
                      <Star className="h-14 w-14 text-gold-light dark:text-pakgreen fill-current animate-pulse-subtle" />
                      <h3 className="text-xl font-black text-white dark:text-pakgreen uppercase tracking-tighter leading-tight">Join MM Online Academy Today</h3>
                      <p className="text-[9px] font-black text-gold-light dark:text-pakgreen/70 uppercase tracking-[0.4em]">Setting the National Gold Standard in Admissions Preparation</p>
                   </div>
                </div>
             </div>
          </div>
        )}

        {state.view === 'admin' && state.isAdmin && (
          <>
            {!isAuthenticated ? (
              <AdminLogin onLogin={handleLoginSuccess} />
            ) : (
              <div className="max-w-7xl mx-auto px-6 sm:px-12 py-12 animate-in fade-in duration-500">
                <div className="flex justify-between items-center mb-12">
                  <div className="flex items-center gap-4">
                    <div className="bg-pakgreen p-3 rounded-xl border border-gold/30">
                      <Settings className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-3xl font-black text-pakgreen dark:text-gold-light uppercase tracking-tighter">Institutional Console</h2>
                  </div>
                  <button onClick={exitAdminConsole} className="flex items-center gap-2 text-zinc-500 hover:text-pakgreen dark:hover:text-gold-light transition-colors font-black text-[10px] uppercase tracking-widest">
                    <LogOut className="h-4 w-4" /> Exit Console
                  </button>
                </div>
                <AdminPanel 
                  notifications={notifications}
                  categories={categories}
                  quizzes={quizzes}
                  onAddNotification={async (n) => {
                    const res = await dataService.addNotification(n);
                    if (res.success) await loadAllData();
                  }}
                  onDeleteNotification={async (id) => {
                    const res = await dataService.deleteNotification(id);
                    if (res.success) await loadAllData();
                  }}
                  onAddCategory={async (c) => {
                    const res = await dataService.addCategory(c);
                    if (res.success) await loadAllData();
                  }}
                  onDeleteCategory={async (id) => {
                    const res = await dataService.deleteCategory(id);
                    if (res.success) await loadAllData();
                  }}
                  onAddQuiz={async (q) => {
                    const res = await dataService.addQuiz(q);
                    if (res.success) await loadAllData();
                  }}
                  onDeleteQuiz={async (id) => {
                    const res = await dataService.deleteQuiz(id);
                    if (res.success) await loadAllData();
                  }}
                />
              </div>
            )}
          </>
        )}
      </main>

      <footer className="bg-white dark:bg-pakgreen-dark text-pakgreen dark:text-white border-t-4 border-gold-light pt-24 pb-12 mt-auto transition-colors islamic-pattern shadow-[0_-20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_-20px_50px_rgba(0,0,0,0.4)]">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => handleNavigate('home')}>
              <div className="bg-pakgreen p-1 rounded-xl border border-gold/30 w-16 h-16 flex items-center justify-center overflow-hidden">
                <img src="https://i.ibb.co/1fWNV4p/logo.png" alt="MM Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-2xl font-black uppercase tracking-tighter text-pakgreen dark:text-gold-light">MM Online Academy</span>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 text-[11px] font-black leading-relaxed max-w-xs uppercase tracking-tight">
              MM ONLINE ACADEMY: Bridging the gap between national ambition and elite academic standard across Pakistan.
            </p>
            <div className="flex flex-wrap gap-4">
               <a href="https://www.facebook.com/MirpurkhasAliTalpurTown/" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-zinc-100 dark:bg-pakgreen-deepest border border-zinc-200 dark:border-gold/10 rounded-xl hover:text-gold-light transition-all text-pakgreen dark:text-gold-light"><Facebook className="h-5 w-5" /></a>
               <a href="https://www.tiktok.com/@majid.maqsood8" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-zinc-100 dark:bg-pakgreen-deepest border border-zinc-200 dark:border-gold/10 rounded-xl hover:text-gold-light transition-all text-pakgreen dark:text-gold-light"><Music className="h-5 w-5" /></a>
               <a href="https://www.instagram.com/majid.maqsood01/?hl=en" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-zinc-100 dark:bg-pakgreen-deepest border border-zinc-200 dark:border-gold/10 rounded-xl hover:text-gold-light transition-all text-pakgreen dark:text-gold-light"><Instagram className="h-5 w-5" /></a>
               <a href="https://www.linkedin.com/in/majid-maqsood-633444374/" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-zinc-100 dark:bg-pakgreen-deepest border border-zinc-200 dark:border-gold/10 rounded-xl hover:text-gold-light transition-all text-pakgreen dark:text-gold-light"><Linkedin className="h-5 w-5" /></a>
               <a href="https://wa.me/923182990927" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-zinc-100 dark:bg-pakgreen-deepest border border-zinc-200 dark:border-gold/10 rounded-xl hover:text-[#25D366] transition-all text-[#25D366]"><MessageCircle className="h-5 w-5" /></a>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <h4 className="text-[12px] font-black uppercase tracking-[0.4em] text-pakgreen dark:text-gold-light border-l-4 border-gold-light pl-4">Legal Tracks</h4>
            <div className="flex flex-col gap-5">
              <button onClick={() => handleNavigate('category', 'lat')} className="text-zinc-500 dark:text-zinc-400 hover:text-gold-light text-[11px] font-black uppercase tracking-widest text-left transition-all hover:translate-x-2 flex items-center gap-3">
                <ChevronRight className="h-4 w-4 text-gold-light" /> LAT Series
              </button>
              <button onClick={() => handleNavigate('category', 'law-gat')} className="text-zinc-500 dark:text-zinc-400 hover:text-gold-light text-[11px] font-black uppercase tracking-widest text-left transition-all hover:translate-x-2 flex items-center gap-3">
                <ChevronRight className="h-4 w-4 text-gold-light" /> Law GAT Preparation
              </button>
              <button onClick={() => handleNavigate('category', 'llb-s1')} className="text-zinc-500 dark:text-zinc-400 hover:text-gold-light text-[11px] font-black uppercase tracking-widest text-left transition-all hover:translate-x-2 flex items-center gap-3">
                <ChevronRight className="h-4 w-4 text-gold-light" /> LLB Coursework
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <h4 className="text-[12px] font-black uppercase tracking-[0.4em] text-pakgreen dark:text-gold-light border-l-4 border-gold-light pl-4">Connect</h4>
            <div className="flex flex-col gap-6">
              <a href="tel:03182990927" className="flex items-center gap-4 group">
                 <div className="p-3 bg-zinc-100 dark:bg-pakgreen-deepest rounded-2xl group-hover:bg-gold-light transition-colors border border-pakgreen/5 dark:border-gold/20"><Phone className="h-5 w-5 text-pakgreen dark:text-gold-light group-hover:text-pakgreen" /></div>
                 <div>
                    <span className="block text-[8px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Call Center</span>
                    <span className="block text-[11px] font-black text-pakgreen dark:text-zinc-200 uppercase tracking-widest">03182990927</span>
                 </div>
              </a>
              <a href="mailto:mmonlineacademy26@gmail.com" className="flex items-center gap-4 group">
                 <div className="p-3 bg-zinc-100 dark:bg-pakgreen-deepest rounded-2xl group-hover:bg-gold-light transition-colors border border-pakgreen/5 dark:border-gold/20"><Mail className="h-5 w-5 text-pakgreen dark:text-gold-light group-hover:text-pakgreen" /></div>
                 <div>
                    <span className="block text-[8px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Electronic Mail</span>
                    <span className="block text-[11px] font-black text-pakgreen dark:text-zinc-200 uppercase tracking-widest">mmonlineacademy26@gmail.com</span>
                 </div>
              </a>
            </div>
          </div>
          
          <div className="flex flex-col gap-8">
             <h4 className="text-[12px] font-black uppercase tracking-[0.4em] text-pakgreen dark:text-gold-light border-l-4 border-gold-light pl-4">Identity</h4>
             <div className="bg-pakgreen/5 dark:bg-pakgreen-deepest p-8 rounded-3xl border border-gold/10 flex flex-col items-center justify-center gap-6">
                <Star className="h-12 w-12 text-gold-light fill-current" />
                <span className="text-[10px] font-black uppercase text-center tracking-[0.3em] text-pakgreen dark:text-zinc-300">Proudly Dedicated to Pakistani Academic Excellence</span>
             </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 sm:px-12 border-t border-pakgreen/10 dark:border-gold/10 pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex items-center gap-6">
              <div className="p-2 bg-pakgreen/10 dark:bg-gold-light/10 border border-gold/20 rounded-lg">
                 <ShieldCheck className="h-5 w-5 text-pakgreen dark:text-gold-light" />
              </div>
              <p className="text-[10px] font-black text-zinc-500 dark:text-zinc-500 uppercase tracking-[0.4em]">© 2026 MM ONLINE ACADEMY — THE NATIONAL STANDARD</p>
           </div>
           <div className="flex items-center gap-8">
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest cursor-pointer hover:text-gold-light">Privacy</span>
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest cursor-pointer hover:text-gold-light">Terms</span>
              <div className="px-5 py-2 rounded-full bg-gold/10 border border-gold/30 text-gold-light text-[9px] font-black uppercase tracking-[0.3em]">
                Excellence Guaranteed
              </div>
           </div>
        </div>
      </footer>
    </div>
  );
};

const PdfViewer: React.FC<{ note: StudyNote; onClose: () => void }> = ({ note, onClose }) => {
  return (
    <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex flex-col animate-in fade-in duration-300">
      <div className="p-4 bg-pakgreen dark:bg-pakgreen-dark flex justify-between items-center border-b border-gold/20">
        <h3 className="text-white dark:text-gold-light font-black text-xs uppercase truncate pr-4">{note.title}</h3>
        <button onClick={onClose} className="text-white hover:text-gold-light transition-colors"><X className="h-6 w-6" /></button>
      </div>
      <div className="flex-grow bg-zinc-100 relative overflow-hidden">
        <iframe src={note.url} className="w-full h-full border-none" title={note.title} />
      </div>
    </div>
  );
};

export default App;
