
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from './components/Navbar';
import QuizModule from './components/QuizModule';
import AdminPanel from './components/AdminPanel';
import AdSlot from './components/AdBanner';
import { LAW_SUBCATEGORIES, GENERAL_SUBCATEGORIES } from './constants';
import { dataService } from './services/dataService';
import { AppState, Notification, Quiz, SubCategory, Topic, StudyNote, QuizFeedback, PrivateAd } from './types';
import { 
  LogOut, Megaphone, BookOpen, FileText, X, Phone, Mail, Settings, ArrowRight, Star, ListChecks, Instagram, Linkedin, Music as TiktokIcon, ShieldAlert, Loader2, Share2, PlayCircle, Sparkles, MapPin, Send, Facebook, ChevronRight, Download, Calendar, Clock, CheckCircle, Search
} from 'lucide-react';
import { BrowserRouter, Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';

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
          <h2 className="text-4xl font-heading font-black text-pakgreen dark:text-gold-light uppercase tracking-wide mb-12">Institutional Access</h2>
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

const AppContent: React.FC = () => {
  const mainRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  
  const [state, setState] = useState<AppState>(() => {
    const isSub = typeof window !== 'undefined' && window.location.hostname.startsWith('admin.');
    return { view: 'home', isAdmin: isSub };
  });

  // Sync state with URL
  useEffect(() => {
    const path = location.pathname;
    const isSub = window.location.hostname.startsWith('admin.');
    
    if (path.startsWith('/category/')) {
      const id = path.split('/category/')[1];
      setState(p => ({ ...p, view: 'category', selectedSubCategory: id, isAdmin: isSub }));
    } else if (path.startsWith('/quiz/')) {
      const id = path.split('/quiz/')[1];
      setState(p => ({ ...p, view: 'quiz', selectedQuiz: id, isAdmin: isSub }));
    } else if (path === '/news' || path === '/notifications') {
      setState(p => ({ ...p, view: 'notifications', isAdmin: isSub }));
    } else if (path.startsWith('/news/')) {
      const id = path.split('/news/')[1];
      setState(p => ({ ...p, view: 'notifications', selectedNewsId: id, isAdmin: isSub }));
    } else if (path === '/contact') {
      setState(p => ({ ...p, view: 'contact', isAdmin: isSub }));
    } else if (path === '/admin') {
      setState(p => ({ ...p, view: 'admin', isAdmin: isSub }));
    } else {
      setState(p => ({ ...p, view: isSub ? 'admin' : 'home', isAdmin: isSub }));
    }
  }, [location.pathname]);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => localStorage.getItem('admin_auth') === 'true');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [categories, setCategories] = useState<SubCategory[]>([...LAW_SUBCATEGORIES, ...GENERAL_SUBCATEGORIES]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [feedbacks, setFeedbacks] = useState<QuizFeedback[]>([]);
  const [ads, setAds] = useState<PrivateAd[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState<'all' | 'quiz' | 'note'>('all');
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactStatus, setContactStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [cats, tops, notifs, qs, nts, fbs, adsData] = await Promise.all([
        dataService.getCategories().catch(() => []),
        dataService.getTopics().catch(() => []),
        dataService.getNotifications().catch(() => []),
        dataService.getQuizzes().catch(() => []),
        dataService.getNotes().catch(() => []),
        dataService.getQuizFeedbacks().catch(() => []),
        dataService.getPrivateAds().catch(() => [])
      ]);
      
      const mergedCategories = [...LAW_SUBCATEGORIES, ...GENERAL_SUBCATEGORIES];
      if (cats && cats.length > 0) {
        cats.forEach((dbCat: SubCategory) => {
          const index = mergedCategories.findIndex(c => c.id === dbCat.id);
          if (index !== -1) {
            mergedCategories[index] = dbCat;
          } else {
            mergedCategories.push(dbCat);
          }
        });
      }
      setCategories(mergedCategories);
      setTopics(tops || []);
      setNotifications(notifs && notifs.length > 0 ? notifs : []);
      setQuizzes((qs || []).map((q: any) => ({
        ...q,
        questions: Array.isArray(q.questions) ? q.questions : []
      })));
      setNotes(nts || []);
      setFeedbacks(fbs || []);
      setAds(adsData || []);
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
    setSelectedTopicId(null); // Reset topic selection on navigation
    
    let path = '/';
    if (view === 'category') path = `/category/${sub}`;
    else if (view === 'quiz') path = `/quiz/${qId}`;
    else if (view === 'notifications') path = '/news';
    else if (view === 'contact') path = '/contact';
    else if (view === 'admin') path = '/admin';
    
    navigate(path);
    
    if (view !== 'home' && mainRef.current) {
      setTimeout(() => {
        mainRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleShareNews = async (n: Notification) => {
    // Construct a clean share URL
    const shareUrl = `${window.location.origin}/news/${n.id}`;
    const shareText = `${n.title}\n\n${n.content.substring(0, 160)}...`;
    
    // Check for native share support
    if (navigator.share) {
      try {
        // Prepare share data
        const shareData: any = {
          title: n.title,
          text: shareText,
          url: shareUrl,
        };

        // Attempt to add image if available, but keep it optional to avoid breaking the share dialog
        if (n.attachmentUrl && n.attachmentUrl.startsWith('data:')) {
          try {
            const parts = n.attachmentUrl.split(',');
            const mime = parts[0].match(/:(.*?);/)?.[1];
            if (mime) {
              const bstr = atob(parts[1]);
              let n_len = bstr.length;
              const u8arr = new Uint8Array(n_len);
              while (n_len--) {
                u8arr[n_len] = bstr.charCodeAt(n_len);
              }
              const file = new File([u8arr], 'news-image.png', { type: mime });
              if (navigator.canShare && navigator.canShare({ files: [file] })) {
                shareData.files = [file];
              }
            }
          } catch (e) {
            console.error("Image attachment failed, sharing text only", e);
          }
        }

        await navigator.share(shareData);
        return;
      } catch (err) {
        // If the share was cancelled by user, don't show fallback
        if (err instanceof Error && err.name === 'AbortError') return;
        
        console.error("Native share failed, falling back to clipboard", err);
      }
    }

    // Fallback: Clipboard copy
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("Link copied to clipboard. You can now paste it to share.");
    } catch (e) {
      // Final fallback if clipboard also fails
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        alert("Link copied to clipboard.");
      } catch (err) {
        alert("Share link: " + shareUrl);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleDownloadNote = (note: StudyNote) => {
    const link = document.createElement('a');
    link.href = note.url;
    link.download = `${note.title}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddAd = async (ad: PrivateAd) => {
    await dataService.addPrivateAd(ad);
    loadData();
  };

  const handleDeleteAd = async (id: string) => {
    await dataService.deletePrivateAd(id);
    loadData();
  };

  const handleUpdateAd = async (id: string, updates: Partial<PrivateAd>) => {
    await dataService.updatePrivateAd(id, updates);
    loadData();
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.message) return;
    setContactStatus('sending');
    try {
      await dataService.saveQuizFeedback({
        id: `inq_${Date.now()}`,
        quizId: 'academic_inquiry',
        quizTitle: 'General Academic Inquiry',
        studentName: contactForm.name || 'Anonymous Student',
        studentEmail: contactForm.email,
        comment: contactForm.message,
        date: new Date().toLocaleDateString(),
        isVisible: false
      });
      setContactStatus('sent');
      setContactForm({ name: '', email: '', message: '' });
      setTimeout(() => setContactStatus('idle'), 5000);
    } catch (err) {
      alert('Failed to send inquiry. Please try again.');
      setContactStatus('idle');
    }
  };

  const filteredQuizzes = quizzes.filter(q => {
    const matchesQuery = q.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesQuery;
  });

  const filteredNotes = notes.filter(n => {
    const matchesQuery = n.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesQuery;
  });

  const marqueeText = notifications.length > 0 
    ? notifications.slice(0, 5).map(n => `NEWS: ${n.title}`).join(" | ") + " | Welcome to MM Academy - Pakistan's Elite Legal Portal"
    : "Welcome to MM Academy - We Conduct LAW GAT and LAT Preparation | SPSC | IBA Sukkur | ECAT | MDCAT | HEC/ETC | LEARN with EXCELLENCE";

  const isLLB = state.selectedSubCategory?.startsWith('llb-');

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-pakgreen-deepest transition-colors islamic-pattern">
      {activeImage && <ImageLightbox url={activeImage} onClose={() => setActiveImage(null)} />}
      <Navbar 
        onNavigate={handleNavigate} 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchFilter={searchFilter}
        setSearchFilter={setSearchFilter}
      />
      
      <div className="w-full bg-gold py-2 overflow-hidden border-y border-gold-dark shadow-md z-40">
        <div className="news-ticker">
          <div className="ticker-content text-pakgreen font-black uppercase text-[10px] sm:text-xs tracking-widest">
            {marqueeText} &nbsp; • &nbsp; {marqueeText}
          </div>
        </div>
      </div>

      <AdSlot placement="header" privateAds={ads} />

      <main ref={mainRef} className="flex-grow w-full relative">
        {/* GLOBAL SEARCH RESULTS OVERLAY */}
        {searchQuery.length > 0 && (
          <div className="fixed inset-0 z-[60] bg-zinc-50/95 dark:bg-pakgreen-deepest/95 backdrop-blur-xl overflow-y-auto animate-in fade-in duration-300">
            <div className="max-w-7xl mx-auto px-6 py-24">
              <div className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-gold/10 rounded-2xl flex items-center justify-center text-gold">
                    <Search className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-heading font-black text-pakgreen dark:text-white uppercase">Search Results</h2>
                    <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Found {filteredQuizzes.length + filteredNotes.length} matches for "{searchQuery}"</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="p-4 bg-zinc-200 dark:bg-white/5 rounded-2xl text-zinc-500 hover:text-pakgreen dark:hover:text-gold transition-all"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {(searchFilter === 'all' || searchFilter === 'quiz') && (
                  <div className="space-y-6">
                    <h3 className="text-sm font-black text-gold uppercase tracking-[0.3em] flex items-center gap-2">
                      <ListChecks className="h-4 w-4" /> Assessments
                    </h3>
                    <div className="space-y-4">
                      {filteredQuizzes.map(q => (
                        <div key={q.id} onClick={() => {handleNavigate('quiz', undefined, q.id); setSearchQuery('');}} className="bg-white dark:bg-pakgreen-dark/40 p-6 rounded-3xl border border-gold/5 hover:border-gold-light transition-all cursor-pointer flex justify-between items-center group shadow-lg">
                          <div className="flex items-center gap-4">
                            <div className="bg-gold/10 p-3 rounded-xl text-gold"><ListChecks className="h-5 w-5" /></div>
                            <div>
                              <h4 className="text-sm font-heading font-black text-pakgreen dark:text-white uppercase">{q.title}</h4>
                              <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">Assessment • {categories.find(c => c.id === q.subCategoryId)?.name}</p>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gold-light opacity-0 group-hover:opacity-100 transition-all" />
                        </div>
                      ))}
                      {filteredQuizzes.length === 0 && <p className="text-zinc-400 text-xs italic">No assessments found.</p>}
                    </div>
                  </div>
                )}

                {(searchFilter === 'all' || searchFilter === 'note') && (
                  <div className="space-y-6">
                    <h3 className="text-sm font-black text-gold uppercase tracking-[0.3em] flex items-center gap-2">
                      <BookOpen className="h-4 w-4" /> Study Notes
                    </h3>
                    <div className="space-y-4">
                      {filteredNotes.map(n => (
                        <div key={n.id} onClick={() => {handleDownloadNote(n); setSearchQuery('');}} className="bg-white dark:bg-pakgreen-dark/40 p-6 rounded-3xl border border-gold/5 hover:border-gold-light transition-all cursor-pointer flex justify-between items-center group shadow-lg">
                          <div className="flex items-center gap-4">
                            <div className="bg-rose-500/10 p-3 rounded-xl text-rose-500"><FileText className="h-5 w-5" /></div>
                            <div>
                              <h4 className="text-sm font-heading font-black text-pakgreen dark:text-white uppercase">{n.title}</h4>
                              <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">Note • {categories.find(c => c.id === n.subCategoryId)?.name}</p>
                            </div>
                          </div>
                          <Download className="h-4 w-4 text-gold-light opacity-0 group-hover:opacity-100 transition-all" />
                        </div>
                      ))}
                      {filteredNotes.length === 0 && <p className="text-zinc-400 text-xs italic">No study notes found.</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {state.view === 'home' && (
          <div className="animate-in fade-in duration-700">
            <section className="relative py-10 bg-white dark:bg-pakgreen-dark/40 border-b border-gold/5 overflow-hidden">
              <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-pakgreen dark:bg-pakgreen-light border border-gold/30 rounded mb-4 shadow-sm">
                    <Star className="h-2 w-2 text-gold-light fill-current" />
                    <span className="text-[9px] font-black text-white uppercase tracking-[0.1em]">Pakistan Academic Portal</span>
                  </div>
                  <h1 className="text-4xl sm:text-6xl font-heading font-black text-pakgreen dark:text-white uppercase tracking-normal mb-6 leading-none drop-shadow-lg">Elite <span className="text-gold">Legal</span> Portal</h1>
                  <p className="text-zinc-600 dark:text-zinc-300 text-base mb-8 max-w-lg leading-relaxed font-medium">
                    Pakistan Academic Portal is an online platform for preparation of competitive and comparative exams across Pakistan, offering structured courses, practice tests, and expert guidance for student success.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button onClick={() => handleNavigate('category', 'lat')} className="bg-pakgreen text-white dark:bg-gold-light dark:text-pakgreen px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl transition-all hover:scale-105 hover:shadow-gold/20">Start Track</button>
                    <button onClick={() => handleNavigate('notifications')} className="border-2 border-pakgreen dark:border-gold-light px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all hover:bg-zinc-100 dark:hover:bg-pakgreen-dark dark:text-gold-light">News Updates</button>
                  </div>
                </div>
                <div className="hidden lg:block relative">
                   <div className="absolute -top-10 -right-10 w-64 h-64 bg-gold/10 blur-3xl rounded-full"></div>
                  <div className="w-full aspect-square bg-pakgreen rounded-[60px] border-4 border-gold/20 flex flex-col p-12 shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 islamic-pattern opacity-10"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                    <BookOpen className="h-24 w-24 text-gold-light mb-8 relative z-10 transition-transform group-hover:scale-110" />
                    <h3 className="text-white text-5xl font-heading font-black uppercase relative z-10">MM Academy</h3>
                    <p className="text-gold-light/80 font-black text-[12px] uppercase tracking-[0.5em] mt-auto relative z-10">Gateway to legal excellence</p>
                  </div>
                </div>
              </div>
            </section>

            {/* PREPARATION TRACKS SECTION - MOVED UP */}
            <section className="max-w-7xl mx-auto px-6 py-12">
               <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                  <div>
                    <span className="text-gold font-black uppercase text-[11px] tracking-[0.4em] mb-2 block">Available Tracks</span>
                    <h3 className="text-3xl font-heading font-black text-pakgreen dark:text-white uppercase tracking-normal">Academic Preparation</h3>
                  </div>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest max-w-sm">Structured modules designed for success in high-stakes entrance examinations.</p>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map(sub => (
                    <div key={sub.id} onClick={() => handleNavigate('category', sub.id)} className="group p-10 bg-white dark:bg-pakgreen-dark/30 backdrop-blur-sm border border-gold/10 rounded-[40px] hover:border-gold-light transition-all cursor-pointer shadow-xl relative overflow-hidden hover:transform hover:-translate-y-2">
                       <div className="bg-pakgreen/5 dark:bg-white/5 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-gold-light/20 transition-colors">
                          <BookOpen className="h-6 w-6 text-pakgreen dark:text-gold-light" />
                       </div>
                       <h3 className="font-heading font-black text-pakgreen dark:text-gold-light text-lg uppercase mb-3 tracking-normal">{sub.name}</h3>
                       <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest leading-relaxed line-clamp-2">{sub.description}</p>
                       <div className="mt-6 flex items-center gap-2 text-gold font-black text-[9px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                          Explore Track <ArrowRight className="h-3 w-3" />
                       </div>
                       <ChevronRight className="h-5 w-5 text-gold-light absolute bottom-8 right-8 opacity-20 group-hover:opacity-100 transition-all" />
                    </div>
                  ))}
               </div>
            </section>
            
            <div className="max-w-7xl mx-auto px-6 py-8">
              <AdSlot placement="content" privateAds={ads} />
            </div>

            <div className="max-w-7xl mx-auto px-6"><AdSlot placement="content" privateAds={ads} /></div>

            {/* HOME NEWS SECTION */}
            <section className="bg-zinc-100 dark:bg-pakgreen-deepest/50 py-24 border-y border-gold/10 relative">
               <div className="max-w-7xl mx-auto px-6">
                  <div className="flex items-center justify-between mb-16">
                     <div className="flex items-center gap-4">
                        <div className="bg-gold-light p-3 rounded-2xl shadow-lg">
                           <Megaphone className="h-8 w-8 text-pakgreen animate-bounce-subtle" />
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-heading font-black text-pakgreen dark:text-white uppercase tracking-normal">Institutional News</h2>
                     </div>
                     <button onClick={() => handleNavigate('notifications')} className="px-6 py-3 border border-pakgreen/20 dark:border-gold/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-pakgreen dark:text-gold-light hover:bg-pakgreen hover:text-white dark:hover:bg-gold-light dark:hover:text-pakgreen transition-all">View All Bulletins</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     {notifications.length > 0 ? notifications.slice(0, 3).map(n => (
                        <div key={n.id} className="bg-white dark:bg-pakgreen-dark/40 backdrop-blur-md p-8 rounded-[40px] border border-gold/10 shadow-xl flex flex-col h-full group overflow-hidden hover:border-gold/40 hover:shadow-2xl transition-all">
                           <div className="flex justify-between items-center mb-6">
                             <span className="text-[9px] font-black text-gold-light uppercase tracking-widest bg-pakgreen/10 dark:bg-gold/5 px-3 py-1.5 rounded-full border border-gold/10">{n.type}</span>
                             <div className="flex items-center gap-3">
                                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{n.date}</span>
                                 <button 
                                   onClick={(e) => { e.stopPropagation(); handleShareNews(n); }} 
                                   className="p-3 -m-3 text-zinc-400 hover:text-gold-light transition-colors flex items-center justify-center"
                                   aria-label="Share News"
                                 >
                                   <Share2 className="h-5 w-5" />
                                 </button>
                             </div>
                           </div>
                           {n.attachmentUrl && n.attachmentUrl.length > 5 && (
                             <div 
                               className="w-full h-52 overflow-hidden rounded-3xl mb-6 border border-gold/5 bg-zinc-50 cursor-zoom-in relative group/img"
                               onClick={() => setActiveImage(n.attachmentUrl || null)}
                             >
                                <img src={n.attachmentUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={n.title} />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                   <Sparkles className="h-8 w-8 text-gold-light" />
                                </div>
                             </div>
                           )}
                            <h3 className="text-xl font-heading font-black text-pakgreen dark:text-white mb-4 uppercase tracking-normal line-clamp-2 leading-tight">{n.title}</h3>
                           <p className="text-[12px] text-zinc-500 dark:text-zinc-300 line-clamp-3 leading-relaxed mb-8 flex-grow">{n.content}</p>
                           {n.linkedQuizId && n.linkedQuizId.length > 1 && (
                             <button onClick={() => handleNavigate('quiz', undefined, n.linkedQuizId)} className="w-full flex items-center justify-center gap-3 py-5 bg-pakgreen dark:bg-gold text-white dark:text-pakgreen rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg mt-2 hover:bg-pakgreen-light dark:hover:bg-gold-light transition-all">
                               <PlayCircle className="h-5 w-5" /> Start Assessment Shortcut
                             </button>
                           )}
                        </div>
                     )) : (
                       <div className="col-span-3 py-12 text-center text-zinc-400 font-black uppercase tracking-[0.2em] text-xs opacity-50">No recent announcements from academy center.</div>
                     )}
                  </div>
               </div>
            </section>


          </div>
        )}

        {state.view === 'category' && (
          <div className="max-w-7xl mx-auto px-6 py-12 animate-in fade-in">
             <div className="mb-12">
                <button onClick={() => {
                  if (selectedTopicId) setSelectedTopicId(null);
                  else window.history.back();
                }} className="text-xs font-black uppercase text-zinc-400 hover:text-pakgreen flex items-center gap-2 mb-6">
                  <ArrowRight className="h-4 w-4 rotate-180" /> {selectedTopicId ? 'Back to Topics' : 'Return'}
                </button>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                   <div>
                      <h2 className="text-4xl font-heading font-black text-pakgreen dark:text-white uppercase tracking-normal mb-2">
                        {categories.find(c => c.id === state.selectedSubCategory)?.name}
                        {selectedTopicId && <span className="text-gold ml-4">/ {topics.find(t => t.id === selectedTopicId)?.name}</span>}
                      </h2>
                      <p className="text-gold-light font-black uppercase text-[10px] tracking-[0.3em]">{categories.find(c => c.id === state.selectedSubCategory)?.description}</p>
                   </div>
                   {isLLB && !selectedTopicId && (
                     <div className="flex flex-wrap gap-2 p-1.5 bg-zinc-100 dark:bg-pakgreen-dark/50 rounded-2xl border border-gold/10">
                        {['llb-s1', 'llb-s2', 'llb-s3', 'llb-s4'].map(sid => (
                          <button 
                            key={sid}
                            onClick={() => handleNavigate('category', sid)}
                            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${state.selectedSubCategory === sid ? 'bg-pakgreen text-white shadow-lg' : 'text-zinc-500 hover:bg-white/10'}`}
                          >
                            Sem {sid.split('-s')[1]}
                          </button>
                        ))}
                     </div>
                   )}
                </div>
             </div>

             {!selectedTopicId ? (
               <div className="space-y-12">
                 <div className="flex items-center gap-4 mb-8">
                   <div className="bg-gold-light p-3 rounded-2xl shadow-lg">
                     <ListChecks className="h-8 w-8 text-pakgreen" />
                   </div>
                   <h3 className="text-2xl font-heading font-black text-pakgreen dark:text-white uppercase tracking-normal">Select Subject Portion</h3>
                 </div>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                   {topics.filter(t => t.categoryId === state.selectedSubCategory).map(topic => (
                     <div 
                       key={topic.id} 
                       onClick={() => setSelectedTopicId(topic.id)}
                       className="group p-10 bg-white dark:bg-pakgreen-dark/30 backdrop-blur-sm border border-gold/10 rounded-[40px] hover:border-gold-light transition-all cursor-pointer shadow-xl relative overflow-hidden"
                     >
                       <div className="bg-pakgreen/5 dark:bg-white/5 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-gold-light/20 transition-colors">
                         <Sparkles className="h-6 w-6 text-pakgreen dark:text-gold-light" />
                       </div>
                       <h4 className="font-heading font-black text-pakgreen dark:text-gold-light text-lg uppercase mb-2 tracking-normal">{topic.name}</h4>
                       <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Explore assessments and notes</p>
                       <ChevronRight className="h-5 w-5 text-gold-light absolute bottom-8 right-8 opacity-20 group-hover:opacity-100 transition-all" />
                     </div>
                   ))}
                   
                   {/* Test Material if items exist without topic */}
                   {(quizzes.some(q => q.subCategoryId === state.selectedSubCategory && !q.topicId) || 
                     notes.some(n => n.subCategoryId === state.selectedSubCategory && !n.topicId)) && (
                     <div 
                       onClick={() => setSelectedTopicId('general')}
                       className="group p-10 bg-zinc-100 dark:bg-pakgreen-dark/20 backdrop-blur-sm border border-dashed border-zinc-300 dark:border-white/10 rounded-[40px] hover:border-gold-light transition-all cursor-pointer shadow-xl relative overflow-hidden"
                     >
                       <div className="bg-zinc-200 dark:bg-white/5 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-gold-light/20 transition-colors">
                         <ListChecks className="h-6 w-6 text-zinc-500 dark:text-zinc-400" />
                       </div>
                       <h4 className="font-heading font-black text-zinc-500 dark:text-zinc-400 text-lg uppercase mb-2 tracking-normal">
                         {state.selectedSubCategory === 'ielts' ? 'Notes for IELTS' : 'Test Material'}
                       </h4>
                       <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Miscellaneous resources</p>
                       <ChevronRight className="h-5 w-5 text-gold-light absolute bottom-8 right-8 opacity-20 group-hover:opacity-100 transition-all" />
                     </div>
                   )}
                 </div>
                 
                 {topics.filter(t => t.categoryId === state.selectedSubCategory).length === 0 && 
                  !quizzes.some(q => q.subCategoryId === state.selectedSubCategory) && 
                  !notes.some(n => n.subCategoryId === state.selectedSubCategory) && (
                   <div className="text-center py-20 bg-white dark:bg-pakgreen-dark/20 rounded-[40px] border border-dashed border-zinc-300 dark:border-white/10">
                     <Clock className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
                     <p className="text-zinc-400 font-black uppercase text-xs tracking-[0.2em]">This academic track is currently being populated.</p>
                   </div>
                 )}
               </div>
             ) : (
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                  <div className="lg:col-span-8 space-y-12">
                     <section>
                        <h3 className="text-xl font-heading font-black text-pakgreen dark:text-white uppercase mb-8 flex items-center gap-4"><ListChecks className="h-8 w-8 text-gold-light" /> Assessment Portions</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {quizzes
                            .filter(q => q.subCategoryId === state.selectedSubCategory && (selectedTopicId === 'general' ? !q.topicId : q.topicId === selectedTopicId))
                            .sort((a, b) => (Number(a.orderNumber) || 0) - (Number(b.orderNumber) || 0))
                            .map(q => (
                              <div key={q.id} onClick={() => handleNavigate('quiz', undefined, q.id)} className="bg-white dark:bg-pakgreen-dark/40 p-8 rounded-[32px] flex justify-between items-center hover:border-gold-light border border-transparent dark:border-white/5 transition-all cursor-pointer shadow-lg group">
                                 <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-sm font-black text-gold group-hover:bg-gold group-hover:text-pakgreen transition-all shadow-inner border border-gold/20">
                                      {q.orderNumber || 0}
                                    </div>
                                    <div className="flex flex-col">
                                       <h4 className="font-heading font-black text-base uppercase text-zinc-800 dark:text-zinc-100 group-hover:text-gold-light transition-colors">{q.title}</h4>
                                       <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{q.questions?.length || 0} Questions</span>
                                    </div>
                                 </div>
                                 <ArrowRight className="h-6 w-6 text-gold-light opacity-30 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                              </div>
                            ))
                          }
                          {quizzes.filter(q => q.subCategoryId === state.selectedSubCategory && (selectedTopicId === 'general' ? !q.topicId : q.topicId === selectedTopicId)).length === 0 && (
                            <p className="text-zinc-400 dark:text-zinc-500 text-xs font-black uppercase italic py-8">No assessments available for this portion.</p>
                          )}
                        </div>
                     </section>

                     <section className="mt-16">
                        <h3 className="text-xl font-heading font-black text-pakgreen dark:text-white uppercase mb-8 flex items-center gap-4"><BookOpen className="h-8 w-8 text-gold-light" /> Study Materials</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {notes
                            .filter(n => n.subCategoryId === state.selectedSubCategory && (selectedTopicId === 'general' ? !n.topicId : n.topicId === selectedTopicId))
                            .map(note => (
                              <div key={note.id} className="bg-white dark:bg-pakgreen-dark/40 p-10 rounded-[48px] border border-gold/10 shadow-xl flex flex-col gap-8 group hover:border-gold transition-all">
                                 <div className="flex items-center gap-6">
                                   <div className="bg-rose-500/10 p-5 rounded-3xl text-rose-500 shadow-inner border border-rose-500/20"><FileText className="h-8 w-8" /></div>
                                   <div className="flex flex-col">
                                      <h4 className="text-xl font-heading font-black text-pakgreen dark:text-white uppercase tracking-normal">{note.title}</h4>
                                      <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Official Academy PDF</span>
                                   </div>
                                 </div>
                                 <button 
                                   onClick={() => handleDownloadNote(note)}
                                   className="w-full flex items-center justify-center gap-4 py-6 bg-pakgreen dark:bg-gold text-white dark:text-pakgreen rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl transition-all hover:scale-[1.02] hover:shadow-gold/20"
                                 >
                                   <Download className="h-5 w-5" /> Download Study Resource
                                 </button>
                              </div>
                            ))
                          }
                          {notes.filter(n => n.subCategoryId === state.selectedSubCategory && (selectedTopicId === 'general' ? !n.topicId : n.topicId === selectedTopicId)).length === 0 && (
                            <p className="text-zinc-400 dark:text-zinc-500 text-xs font-black uppercase italic py-8">No study materials available for this portion.</p>
                          )}
                        </div>
                     </section>
                  </div>
                  <aside className="lg:col-span-4"><AdSlot placement="sidebar" privateAds={ads} /></aside>
               </div>
             )}
          </div>
        )}

        {state.view === 'quiz' && activeQuiz && <QuizModule quiz={activeQuiz} quizzes={quizzes} categories={categories} onComplete={() => loadData()} />}

        {state.view === 'notifications' && (
          <div className="max-w-4xl mx-auto px-6 py-20 animate-in slide-in-from-bottom-10">
             <div className="text-center mb-16">
                <span className="text-gold font-black uppercase text-[12px] tracking-[0.5em] mb-4 block">Archive</span>
                <h2 className="text-5xl font-heading font-black text-pakgreen dark:text-white uppercase tracking-normal flex items-center justify-center gap-6">
                   <Megaphone className="h-12 w-12 text-gold-light" /> News Registry
                </h2>
                {state.selectedNewsId && (
                  <button 
                    onClick={() => handleNavigate('notifications')}
                    className="mt-8 px-8 py-3 bg-pakgreen dark:bg-gold text-white dark:text-pakgreen rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:scale-105 transition-all"
                  >
                    View All Bulletins
                  </button>
                )}
             </div>
             <div className="space-y-12">
                {(state.selectedNewsId ? notifications.filter(n => n.id === state.selectedNewsId) : notifications).length > 0 ? (state.selectedNewsId ? notifications.filter(n => n.id === state.selectedNewsId) : notifications).map(n => (
                   <div key={n.id} className="bg-white dark:bg-pakgreen-dark/50 backdrop-blur-md border-l-[12px] border-gold-light p-12 rounded-r-[50px] shadow-2xl flex flex-col gap-8 overflow-hidden hover:shadow-gold/10 transition-shadow">
                      <div className="flex flex-wrap justify-between items-center gap-4">
                         <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black text-gold-light uppercase tracking-[0.3em] bg-pakgreen/10 dark:bg-gold/10 px-4 py-1.5 rounded-full border border-gold/20">{n.type}</span>
                            <div className="flex items-center gap-2 text-zinc-400">
                               <Calendar className="h-4 w-4" />
                               <span className="text-[10px] font-bold uppercase tracking-widest">{n.date}</span>
                            </div>
                         </div>
                         <button 
                           onClick={(e) => { e.stopPropagation(); handleShareNews(n); }} 
                           className="flex items-center gap-3 text-zinc-400 hover:text-gold-light text-[11px] font-black uppercase tracking-widest bg-zinc-50 dark:bg-white/5 px-6 py-4 rounded-2xl transition-all border border-transparent hover:border-gold/20 active:scale-95"
                         >
                           <Share2 className="h-5 w-5" /> Broadcast News
                         </button>
                      </div>
                      {n.attachmentUrl && n.attachmentUrl.length > 5 && (
                        <div 
                          className="w-full rounded-[40px] overflow-hidden border-4 border-gold/10 shadow-2xl cursor-zoom-in group/nimg"
                          onClick={() => setActiveImage(n.attachmentUrl || null)}
                        >
                           <img src={n.attachmentUrl} className="w-full h-auto transition-transform group-hover/nimg:scale-105" alt={n.title} />
                        </div>
                      )}
                      <div>
                        <h3 className="text-3xl font-heading font-black text-pakgreen dark:text-white uppercase tracking-normal mb-6 leading-tight">{n.title}</h3>
                        <p className="text-zinc-600 dark:text-zinc-300 text-lg leading-relaxed font-medium whitespace-pre-wrap">{n.content}</p>
                      </div>
                      {n.linkedQuizId && n.linkedQuizId.length > 1 && (
                        <div className="pt-8 border-t border-zinc-100 dark:border-white/10">
                           <button onClick={() => handleNavigate('quiz', undefined, n.linkedQuizId)} className="flex items-center gap-4 px-12 py-6 bg-pakgreen dark:bg-gold text-white dark:text-pakgreen rounded-2xl text-[12px] font-black uppercase tracking-widest shadow-2xl transition-all hover:scale-105">
                             <PlayCircle className="h-6 w-6" /> Open Related Assessment
                           </button>
                        </div>
                      )}
                   </div>
                )) : (
                  <div className="text-center py-20 bg-white dark:bg-pakgreen-dark/20 rounded-[40px] border border-dashed border-zinc-300 dark:border-white/10">
                     <Clock className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
                     <p className="text-zinc-400 font-black uppercase text-xs tracking-[0.2em]">No official bulletins found in registry.</p>
                  </div>
                )}
             </div>
          </div>
        )}

        {state.view === 'contact' && (
          <div className="max-w-7xl mx-auto px-6 py-24 animate-in fade-in">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                <div className="space-y-12">
                   <div>
                      <h2 className="text-5xl font-heading font-black text-pakgreen dark:text-white uppercase tracking-normal mb-6">Connect with <span className="text-gold">Academy</span></h2>
                      <p className="text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed max-w-md">Our specialized support team is available to assist with registration and module navigation.</p>
                   </div>
                   <div className="space-y-6">
                      <div className="flex items-start gap-6 p-8 bg-white dark:bg-pakgreen-dark/40 backdrop-blur-sm rounded-3xl border border-gold/10 shadow-lg group hover:border-gold-light transition-all">
                         <div className="p-4 bg-pakgreen rounded-2xl text-gold-light group-hover:scale-110 transition-transform shadow-lg"><Phone className="h-6 w-6" /></div>
                         <div><p className="text-[10px] font-black uppercase text-zinc-400 mb-1">Direct Helpline</p><p className="text-xl font-black text-pakgreen dark:text-white">+92 318 2990927</p></div>
                      </div>
                      <div className="flex items-start gap-6 p-8 bg-white dark:bg-pakgreen-dark/40 backdrop-blur-sm rounded-3xl border border-gold/10 shadow-lg group hover:border-gold-light transition-all">
                         <div className="p-4 bg-pakgreen rounded-2xl text-gold-light group-hover:scale-110 transition-transform shadow-lg"><Mail className="h-6 w-6" /></div>
                         <div><p className="text-[10px] font-black uppercase text-zinc-400 mb-1">Electronic Mail</p><p className="text-xl font-black text-pakgreen dark:text-white uppercase truncate">mmonlineacademy26@gmail.com</p></div>
                      </div>
                      <div className="flex items-start gap-6 p-8 bg-white dark:bg-pakgreen-dark/40 backdrop-blur-sm rounded-3xl border border-gold/10 shadow-lg group hover:border-gold-light transition-all">
                         <div className="p-4 bg-pakgreen rounded-2xl text-gold-light group-hover:scale-110 transition-transform shadow-lg"><MapPin className="h-6 w-6" /></div>
                         <div><p className="text-[10px] font-black uppercase text-zinc-400 mb-1">Location Center</p><p className="text-xl font-black text-pakgreen dark:text-white uppercase">Mirpurkhas, Sindh, Pakistan</p></div>
                      </div>
                   </div>
                   <div className="flex justify-start gap-6 pt-12 border-t border-gold/10">
                     {socialLinks.map(s => <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" title={s.label} className={`p-5 bg-white dark:bg-pakgreen-dark text-pakgreen dark:text-gold-light rounded-2xl shadow-xl hover:scale-110 transition-all border border-gold/10 ${s.color}`}><s.icon className="h-7 w-7" /></a>)}
                   </div>
                </div>
                <div className="bg-white dark:bg-pakgreen-dark/50 backdrop-blur-lg p-12 rounded-[60px] shadow-2xl border-4 border-gold/20 relative overflow-hidden">
                   <div className="absolute inset-0 islamic-pattern opacity-10"></div>
                    <h3 className="relative z-10 text-3xl font-heading font-black text-pakgreen dark:text-white uppercase mb-10 tracking-normal">Academic Inquiry</h3>
                    <form className="relative z-10 space-y-6" onSubmit={handleContactSubmit}>
                       <div className="space-y-1">
                         <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Full Name</label>
                         <input 
                           required
                           value={contactForm.name}
                           onChange={e => setContactForm({...contactForm, name: e.target.value})}
                           className="w-full p-6 bg-zinc-50 dark:bg-pakgreen-deepest rounded-2xl border border-zinc-200 dark:border-gold/10 text-sm outline-none dark:text-white transition-all focus:border-gold focus:ring-4 focus:ring-gold/5" 
                           placeholder="Enter student name" 
                         />
                       </div>
                       <div className="space-y-1">
                         <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Email Address</label>
                         <input 
                           required
                           type="email"
                           value={contactForm.email}
                           onChange={e => setContactForm({...contactForm, email: e.target.value})}
                           className="w-full p-6 bg-zinc-50 dark:bg-pakgreen-deepest rounded-2xl border border-zinc-200 dark:border-gold/10 text-sm outline-none dark:text-white transition-all focus:border-gold focus:ring-4 focus:ring-gold/5" 
                           placeholder="student@example.com" 
                         />
                       </div>
                       <div className="space-y-1">
                         <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Message Body</label>
                         <textarea 
                           required
                           value={contactForm.message}
                           onChange={e => setContactForm({...contactForm, message: e.target.value})}
                           className="w-full p-6 bg-zinc-50 dark:bg-pakgreen-deepest rounded-2xl border border-zinc-200 dark:border-gold/10 text-sm outline-none dark:text-white transition-all focus:border-gold focus:ring-4 focus:ring-gold/5" 
                           rows={5} 
                           placeholder="How can our counselors help you today?" 
                         />
                       </div>
                       <button 
                         type="submit"
                         disabled={contactStatus !== 'idle'}
                         className="w-full py-7 bg-pakgreen dark:bg-gold text-white dark:text-pakgreen font-black uppercase text-[12px] tracking-[0.4em] rounded-2xl shadow-2xl flex items-center justify-center gap-4 hover:scale-[1.02] transition-all disabled:opacity-50"
                       >
                         {contactStatus === 'idle' && <>Submit Inquiry <Send className="h-5 w-5" /></>}
                         {contactStatus === 'sending' && <>Processing... <Loader2 className="h-5 w-5 animate-spin" /></>}
                         {contactStatus === 'sent' && <>Inquiry Sent Successfully <CheckCircle className="h-5 w-5" /></>}
                       </button>
                    </form>
                </div>
             </div>
          </div>
        )}

        {state.view === 'admin' && state.isAdmin && (
          <>{!isAuthenticated ? <AdminLogin onLogin={() => {setIsAuthenticated(true); localStorage.setItem('admin_auth', 'true'); loadData();}} /> : (
            <div className="max-w-7xl mx-auto px-6 py-12">
              <div className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-4">
                  <div className="bg-pakgreen p-3 rounded-xl shadow-lg">
                    <Settings className="h-8 w-8 text-gold-light" />
                  </div>
                  <h2 className="text-4xl font-heading font-black text-pakgreen dark:text-gold-light uppercase tracking-normal">Console Control</h2>
                </div>
                <button onClick={() => {setIsAuthenticated(false); localStorage.removeItem('admin_auth');}} className="flex items-center gap-2 px-6 py-3 bg-zinc-100 dark:bg-white/5 text-zinc-500 font-black text-[10px] uppercase hover:text-pakgreen dark:hover:text-gold rounded-xl transition-all border border-transparent hover:border-current"><LogOut className="h-4 w-4" /> Terminate Session</button>
              </div>
              <AdminPanel 
                notifications={notifications} 
                categories={categories} 
                topics={topics}
                quizzes={quizzes} 
                notes={notes}
                ads={ads}
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
                onAddAd={handleAddAd}
                onDeleteAd={handleDeleteAd}
                onUpdateAd={handleUpdateAd}
              />
            </div>
          )}</>
        )}
      </main>

      <footer className="bg-white dark:bg-pakgreen-dark/95 backdrop-blur-md border-t-4 border-gold-light py-12 mt-auto">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 items-center gap-10">
            <div className="text-center md:text-left font-black text-[10px] sm:text-xs uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
               © 2026 Academic Integrity Reserved By <span className="text-pakgreen dark:text-gold">MM Academy</span>
            </div>
            <div className="flex flex-col items-center gap-4">
               <div className="flex items-center gap-3">
                  <BookOpen className="h-10 w-10 text-pakgreen dark:text-gold-light" />
                  <span className="text-3xl font-heading font-black uppercase text-pakgreen dark:text-gold-light tracking-normal">MM Academy</span>
               </div>
               <div className="flex gap-4">
                  {socialLinks.map(s => <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-gold transition-colors"><s.icon className="h-5 w-5" /></a>)}
               </div>
            </div>
            <div className="text-center md:text-right font-black text-[10px] sm:text-xs uppercase tracking-widest text-zinc-500 dark:text-zinc-400 leading-loose">
               Architected & Developed By <br />
               <a href="https://marketingclub.com.pk" target="_blank" rel="noopener noreferrer" className="text-pakgreen dark:text-gold-light hover:text-gold transition-colors underline decoration-2 underline-offset-4 font-black">marketing club</a>
            </div>
         </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
