
import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import QuizModule from './components/QuizModule';
import AdminPanel from './components/AdminPanel';
import AdSlot from './components/AdBanner';
import { LAW_SUBCATEGORIES, GENERAL_SUBCATEGORIES } from './constants';
import { dataService } from './services/dataService';
import { AppState, Notification, Quiz, SubCategory, StudyNote, QuizFeedback } from './types';
import { 
  LogOut, Megaphone, BookOpen, FileText, X, Phone, Mail, Settings, ArrowRight, GraduationCap, ShieldCheck, Award, Star, ListChecks, Instagram, Linkedin, Music as TiktokIcon, ShieldAlert, Loader2, MessageCircle, ExternalLink, ChevronRight, Facebook, Image as ImageIcon, Eye
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
        <div className="flex-grow bg-zinc-100 dark:bg-pakgreen-deepest relative">
          {(note.type === 'PDF' || (note.url && note.url.includes('application/pdf'))) ? (
            <iframe src={note.url} className="w-full h-full border-none" title={note.title} />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-8 overflow-auto">
              <img src={note.url} alt={note.title} className="max-w-full max-h-full object-contain rounded-xl shadow-xl" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const isSub = window.location.hostname.startsWith('admin.');
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

  const loadData = useCallback(async () => {
    // Instant UI update from cache
    if (dataService._cache.categories) setCategories(dataService._cache.categories);
    if (dataService._cache.notifications) setNotifications(dataService._cache.notifications);

    try {
      const [cats, notifs, qs, nts, fbs] = await Promise.all([
        dataService.getCategories(),
        dataService.getNotifications(),
        dataService.getQuizzes(),
        dataService.getNotes(),
        dataService.getQuizFeedbacks()
      ]);
      if (cats && Array.isArray(cats)) {
        const m = [...LAW_SUBCATEGORIES, ...GENERAL_SUBCATEGORIES];
        cats.forEach((c: SubCategory) => { if (!m.find(x => x.id === c.id)) m.push(c); });
        setCategories(m);
      }
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

            {/* HOME NEWS SECTION */}
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
                        <div key={n.id} className="bg-white dark:bg-pakgreen-dark/40 p-10 rounded-[32px] border border-gold/10 shadow-xl flex flex-col h-full">
                           <span className="text-[10px] font-black text-gold-light uppercase tracking-widest block mb-4">{n.type} • {n.date}</span>
                           <h3 className="text-xl font-black text-pakgreen dark:text-white mb-4 uppercase tracking-tight">{n.title}</h3>
                           <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed mb-6 flex-grow">{n.content}</p>
                           {n.attachmentUrl && (
                             <button 
                               onClick={() => setViewingNewsAttachment(n)}
                               className="mt-auto flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-pakgreen dark:text-gold-light hover:underline"
                             >
                               <Eye className="h-3 w-3" /> View Attachment
                             </button>
                           )}
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

                   <AdSlot placement="content" />

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

                   <section>
                      <h3 className="text-xl font-black text-pakgreen dark:text-white uppercase mb-8 flex items-center gap-3"><Star className="h-6 w-6 text-gold-light" /> Track Reviews</h3>
                      <div className="space-y-4">
                        {feedbacks.filter(f => (f.isVisible === true || String(f.isVisible) === '1') && quizzes.some(q => q.id === f.quizId && q.subCategoryId === state.selectedSubCategory)).length > 0 ? (
                           feedbacks.filter(f => (f.isVisible === true || String(f.isVisible) === '1') && quizzes.some(q => q.id === f.quizId && q.subCategoryId === state.selectedSubCategory)).slice(0, 10).map(f => (
                             <div key={f.id} className="p-6 bg-white dark:bg-pakgreen-dark/60 rounded-3xl border border-gold/10 shadow-lg">
                               <div className="flex items-center gap-3 mb-2">
                                  <div className="h-8 w-8 rounded-full bg-gold/10 flex items-center justify-center text-gold-dark font-black text-[10px]">{f.studentName.charAt(0)}</div>
                                  <span className="text-xs font-black uppercase text-pakgreen dark:text-white">{f.studentName}</span>
                               </div>
                               <p className="text-zinc-500 dark:text-zinc-400 text-xs italic leading-relaxed">"{f.comment}"</p>
                             </div>
                           ))
                        ) : (
                          <div className="p-10 text-center text-zinc-400 uppercase font-black text-[10px] border-2 border-dashed border-zinc-200 dark:border-gold/10 rounded-2xl">Awaiting student reviews.</div>
                        )}
                      </div>
                   </section>
                </div>
                
                <aside className="lg:col-span-4">
                   <AdSlot placement="sidebar" />
                   <div className="bg-pakgreen p-8 rounded-3xl border border-gold/10 shadow-2xl sticky top-24">
                      <GraduationCap className="h-10 w-10 text-gold-light mb-6" />
                      <h3 className="text-white font-black text-xl uppercase mb-4 tracking-tighter">Preparation Guide</h3>
                      <p className="text-gold-light/60 text-xs font-bold uppercase tracking-widest leading-relaxed mb-8">Pass threshold: 80%. Ensure all study materials are completed before taking the mock final.</p>
                      <div className="space-y-3">
                         <div className="flex items-center gap-3 text-white text-[10px] font-black uppercase bg-white/5 p-4 rounded-xl"><ShieldCheck className="h-4 w-4 text-emerald-400" /> Verified Resources</div>
                         <div className="flex items-center gap-3 text-white text-[10px] font-black uppercase bg-white/5 p-4 rounded-xl"><Award className="h-4 w-4 text-gold" /> Academic Merit</div>
                      </div>
                   </div>
                </aside>
             </div>
          </div>
        )}

        {state.view === 'quiz' && activeQuiz && (
          <QuizModule quiz={activeQuiz} categories={categories} onComplete={() => loadData()} />
        )}

        {state.view === 'notifications' && (
          <div className="max-w-4xl mx-auto px-6 py-20">
             <h2 className="text-4xl font-black text-pakgreen dark:text-gold-light uppercase tracking-tighter mb-12 flex items-center gap-4">
                <Megaphone className="h-10 w-10 text-gold-light" /> Institutional News
             </h2>
             <div className="space-y-8">
                {notifications.map(n => (
                   <div key={n.id} className="bg-white dark:bg-pakgreen-dark/40 border-l-8 border-gold-light p-10 rounded-r-3xl shadow-2xl flex flex-col md:flex-row gap-8">
                      <div className="flex-grow">
                        <div className="flex justify-between items-center mb-6">
                           <span className="text-[10px] font-black text-gold-light uppercase tracking-[0.3em]">{n.type}</span>
                           <span className="text-[10px] font-black text-zinc-400 uppercase">{n.date}</span>
                        </div>
                        <h3 className="text-2xl font-black text-pakgreen dark:text-white mb-6 uppercase tracking-tight">{n.title}</h3>
                        <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed mb-6">{n.content}</p>
                        {n.attachmentUrl && (
                           <button 
                             onClick={() => setViewingNewsAttachment(n)}
                             className="flex items-center gap-2 px-6 py-3 bg-pakgreen dark:bg-gold-light text-white dark:text-pakgreen rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl"
                           >
                             <Eye className="h-4 w-4" /> View Associated Document
                           </button>
                        )}
                      </div>
                   </div>
                ))}
                {notifications.length === 0 && (
                   <div className="py-20 text-center text-zinc-400 font-black uppercase tracking-[0.2em] border-2 border-dashed border-gold/10 rounded-[40px]">
                      No news entries found.
                   </div>
                )}
             </div>
          </div>
        )}

        {state.view === 'admin' && state.isAdmin && (
          <>{!isAuthenticated ? <AdminLogin onLogin={() => {setIsAuthenticated(true); localStorage.setItem('admin_auth', 'true'); loadData();}} /> : (
            <div className="max-w-7xl mx-auto px-6 py-12">
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-3xl font-black text-pakgreen dark:text-gold-light uppercase tracking-tighter flex items-center gap-4"><Settings className="h-8 w-8" /> Console Control</h2>
                <button onClick={() => {setIsAuthenticated(false); localStorage.removeItem('admin_auth');}} className="flex items-center gap-2 text-zinc-500 font-black text-[10px] uppercase hover:text-pakgreen"><LogOut className="h-4 w-4" /> Exit</button>
              </div>
              <AdminPanel notifications={notifications} categories={categories} quizzes={quizzes} onAddNotification={async (n) => { await dataService.addNotification(n); loadData(); }} onDeleteNotification={async (id) => { await dataService.deleteNotification(id); loadData(); }} onAddCategory={async (c) => { await dataService.addCategory(c); loadData(); }} onDeleteCategory={async (id) => { await dataService.deleteCategory(id); loadData(); }} onAddQuiz={async (q) => { await dataService.addQuiz(q); loadData(); }} onDeleteQuiz={async (id) => { await dataService.deleteQuiz(id); loadData(); }} />
            </div>
          )}</>
        )}
      </main>

      <AdSlot placement="footer" />

      <footer className="bg-white dark:bg-pakgreen-dark border-t-4 border-gold-light py-20 mt-auto">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-2">
               <div className="flex items-center gap-4 mb-8"><BookOpen className="h-10 w-10 text-pakgreen dark:text-gold-light" /><span className="text-2xl font-black uppercase text-pakgreen dark:text-gold-light tracking-tighter">MM Academy</span></div>
               <p className="text-zinc-500 max-w-sm uppercase font-black text-[10px] tracking-widest leading-relaxed mb-8">National gateway to legal excellence and academic advancement.</p>
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
                  <li className="break-all">info@academy.pk</li>
               </ul>
            </div>
         </div>
         <div className="max-w-7xl mx-auto px-6 text-center border-t border-gold/10 pt-12">
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">© 2026 MM Academy | Marketing Club</p>
         </div>
      </footer>
      {viewingNote && <PdfViewer note={viewingNote} onClose={() => setViewingNote(null)} />}
      {viewingNewsAttachment && (
        <PdfViewer 
          note={{ 
            title: viewingNewsAttachment.title, 
            url: viewingNewsAttachment.attachmentUrl || ''
          }} 
          onClose={() => setViewingNewsAttachment(null)} 
        />
      )}
    </div>
  );
};

export default App;
