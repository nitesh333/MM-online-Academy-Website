
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import QuizModule from './components/QuizModule';
import AdminPanel from './components/AdminPanel';
import { 
  LAW_SUBCATEGORIES, 
  GENERAL_SUBCATEGORIES, 
  INITIAL_NOTIFICATIONS, 
  MOCK_QUIZ 
} from './constants';
import { dataService } from './services/dataService';
import { AppState, Notification, Quiz, SubCategory, StudyNote } from './types';
import { 
  ChevronRight, 
  Search,
  Lock,
  LogOut,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Megaphone,
  Share2,
  Copy,
  MessageCircle,
  Download,
  BookOpen,
  FileText,
  X,
  BrainCircuit,
  Phone,
  Mail
} from 'lucide-react';
import { generateStudySummary } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    view: 'home',
    isAdmin: false
  });
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [categories, setCategories] = useState<SubCategory[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [viewingNote, setViewingNote] = useState<StudyNote | null>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [notifs, cats, quizList, noteList] = await Promise.all([
          dataService.getNotifications(),
          dataService.getCategories(),
          dataService.getQuizzes(),
          dataService.getNotes()
        ]);
        setNotifications(notifs || []);
        setCategories(cats || []);
        setQuizzes(quizList || []);
        setNotes(noteList || []);
      } catch (err) {
        console.error("Data loading failed", err);
      }
    };
    loadInitialData();

    const handleHashChange = async () => {
      const hash = window.location.hash;
      if (hash === '#admin') {
        setState(prev => ({ ...prev, view: 'admin', isAdmin: true }));
      } else if (hash.startsWith('#/category')) {
        const subId = hash.split('?id=')[1];
        setState(prev => ({ ...prev, view: 'category', selectedSubCategory: subId, isAdmin: false }));
      } else if (hash === '#/notifications') {
        setState(prev => ({ ...prev, view: 'notifications', isAdmin: false }));
      } else if (hash.startsWith('#/quiz')) {
        const quizId = hash.split('?id=')[1];
        const quizList = await dataService.getQuizzes();
        const found = quizList.find((q: Quiz) => q.id === quizId) || MOCK_QUIZ;
        setActiveQuiz(found);
        setState(prev => ({ ...prev, view: 'quiz', selectedQuiz: quizId, isAdmin: false }));
      } else {
        setState(prev => ({ ...prev, view: 'home', isAdmin: false }));
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
    else if (view === 'quiz') hash = quizId ? `#/quiz?id=${quizId}` : '#/quiz';
    else hash = '';
    
    window.location.hash = hash;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAiHelp = async (topic: string) => {
    setAiSummary("Consulting AI Intelligence...");
    const result = await generateStudySummary(topic);
    setAiSummary(result);
  };

  const handleAddNotification = async (n: Notification) => {
    const updated = await dataService.addNotification(n);
    setNotifications(updated);
  };

  const handleDeleteNotification = async (id: string) => {
    const updated = await dataService.deleteNotification(id);
    setNotifications(updated);
  };

  const handleAddQuiz = async (q: Quiz) => {
    const newList = await dataService.addQuiz(q);
    setQuizzes(newList);
  };

  const handleDeleteQuiz = async (id: string) => {
    const updated = await dataService.deleteQuiz(id);
    setQuizzes(updated);
  };

  const handleAddCategory = async (c: SubCategory) => {
    const updated = await dataService.addCategory(c);
    setCategories(updated);
  };

  const handleDeleteCategory = async (id: string) => {
    const updated = await dataService.deleteCategory(id);
    setCategories(updated);
  };

  const shareArticle = (title: string, platform: 'whatsapp' | 'facebook' | 'twitter' | 'copy') => {
    const url = window.location.href;
    const text = `${title}\n\nRead more at: ${url}`;
    
    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
        break;
    }
  };

  const ShareBar = ({ title }: { title: string }) => (
    <div className="flex items-center gap-2 md:gap-3 mt-4 pt-4 border-t border-gray-100 flex-wrap">
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1 w-full sm:w-auto mb-2 sm:mb-0">
        <Share2 className="h-3 w-3" /> Share Now:
      </span>
      <div className="flex gap-2 w-full sm:w-auto justify-start">
        <button 
          onClick={(e) => { e.stopPropagation(); shareArticle(title, 'whatsapp'); }}
          className="p-2.5 bg-[#25d366] text-white rounded-full hover:scale-110 transition-transform shadow-sm active:scale-95"
          title="Share on WhatsApp"
        >
          <MessageCircle className="h-4 w-4" />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); shareArticle(title, 'facebook'); }}
          className="p-2.5 bg-[#1877f2] text-white rounded-full hover:scale-110 transition-transform shadow-sm active:scale-95"
          title="Share on Facebook"
        >
          <Facebook className="h-4 w-4" />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); shareArticle(title, 'twitter'); }}
          className="p-2.5 bg-[#1da1f2] text-white rounded-full hover:scale-110 transition-transform shadow-sm active:scale-95"
          title="Share on Twitter"
        >
          <Twitter className="h-4 w-4" />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); shareArticle(title, 'copy'); }}
          className="p-2.5 bg-gray-500 text-white rounded-full hover:scale-110 transition-transform shadow-sm active:scale-95"
          title="Copy Link"
        >
          <Copy className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  const PdfViewer = ({ note, onClose }: { note: StudyNote; onClose: () => void }) => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 md:p-4 lg:p-8 overflow-hidden">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative bg-white w-full h-full md:max-w-6xl md:h-[90%] flex flex-col md:rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-[#1a2b48] text-white px-4 md:px-6 py-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2 md:gap-3 truncate pr-4">
            <FileText className="h-5 w-5 text-red-400 shrink-0" />
            <h3 className="text-[11px] md:text-sm font-bold uppercase tracking-widest truncate">{note.title}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors shrink-0">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-grow bg-gray-100 flex items-center justify-center overflow-hidden">
          <iframe 
            src={`${note.url}#toolbar=0&navpanes=0&scrollbar=1`} 
            className="w-full h-full border-none bg-white"
            title={note.title}
          />
        </div>
        <div className="bg-white px-4 md:px-6 py-4 flex flex-col sm:flex-row justify-between items-center border-t border-gray-200 gap-4 shrink-0">
          <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center sm:text-left">MM Online Academy - Student Repository</p>
          <div className="flex gap-2 w-full sm:w-auto">
            <a href={note.url} target="_blank" rel="noopener noreferrer" className="flex-grow sm:flex-none flex items-center justify-center gap-2 border border-[#1a2b48] text-[#1a2b48] px-5 py-2.5 rounded text-[10px] font-bold uppercase hover:bg-gray-50 transition-colors">
              Full Screen
            </a>
            <a href={note.url} download className="flex-grow sm:flex-none flex items-center justify-center gap-2 bg-[#1a2b48] text-white px-5 py-2.5 rounded text-[10px] font-bold uppercase hover:bg-black transition-colors shadow-sm">
               <Download className="h-3 w-3" /> Download
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  if (state.view === 'admin') {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
        <header className="bg-[#1a2b48] text-white px-4 md:px-8 py-4 flex justify-between items-center shadow-md">
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5" />
            <h1 className="text-sm md:text-lg font-bold uppercase tracking-tight">Admin Console</h1>
          </div>
          <button 
            onClick={() => { window.location.hash = ''; }}
            className="flex items-center gap-2 bg-red-600 px-3 py-1.5 md:px-4 md:py-2 rounded text-[10px] md:text-xs font-bold hover:bg-red-700 transition-all uppercase"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </header>
        <main className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full">
          <AdminPanel 
            notifications={notifications} 
            categories={categories}
            quizzes={quizzes}
            onAddNotification={handleAddNotification}
            onDeleteNotification={handleDeleteNotification}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
            onAddQuiz={handleAddQuiz}
            onDeleteQuiz={handleDeleteQuiz}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f2f2f2] overflow-x-hidden">
      <Navbar onNavigate={handleNavigate} />
      
      {viewingNote && <PdfViewer note={viewingNote} onClose={() => setViewingNote(null)} />}

      <a 
        href="https://wa.me/923001234567" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[100] bg-[#25d366] text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-90 transition-all shadow-[#25d366]/40"
        aria-label="Contact on WhatsApp"
      >
        <MessageCircle className="h-6 w-6 md:h-8 md:w-8" />
      </a>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 md:px-6 py-6 md:py-10">
        {state.view === 'home' && (
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:items-start">
            <div className="lg:col-span-8 space-y-8 order-2 lg:order-1">
              <section className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-red-600 text-white px-5 py-3 font-bold text-sm md:text-lg uppercase tracking-tight flex items-center gap-3">
                  <Megaphone className="h-4 w-4 md:h-5 md:w-5" /> Latest Announcements
                </div>
                <div className="p-0 divide-y divide-gray-100">
                  {notifications.filter(n => n.type === 'News' || n.type === 'Test Date').map(n => (
                    <div 
                      key={n.id} 
                      className="p-5 md:p-8 hover:bg-gray-50 transition-colors cursor-pointer group"
                      onClick={() => handleNavigate('notifications')}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-bold text-[#1a2b48] uppercase tracking-[0.2em]">{n.date}</span>
                        <span className="text-[9px] font-black bg-red-50 text-red-600 px-3 py-1 rounded-full border border-red-100 uppercase">New</span>
                      </div>
                      <h3 className="font-bold text-gray-800 text-base md:text-xl group-hover:text-[#1a2b48] transition-colors leading-tight mb-3">{n.title}</h3>
                      <p className="text-gray-500 text-xs md:text-sm mt-2 line-clamp-2 leading-relaxed">{n.content}</p>
                      <ShareBar title={n.title} />
                    </div>
                  ))}
                  {notifications.filter(n => n.type === 'News' || n.type === 'Test Date').length === 0 && (
                    <div className="p-16 text-center text-gray-400 font-bold uppercase text-[10px] tracking-widest">Updating news repository...</div>
                  )}
                </div>
              </section>

              <div className="grid grid-cols-1 gap-6 md:gap-8">
                <section className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
                  <div className="section-title-bg text-white px-5 py-3 font-bold text-sm md:text-lg uppercase tracking-tight">
                    Law Admission Test (LAT) Preparation
                  </div>
                  <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.filter(s => s.id === 'lat' || s.id.startsWith('llb')).map(sub => (
                      <div 
                        key={sub.id} 
                        onClick={() => handleNavigate('category', sub.id)}
                        className="group p-5 bg-[#f9f9f9] border-l-4 border-gray-200 hover:border-[#1a2b48] transition-all cursor-pointer shadow-sm hover:translate-y-[-2px] active:translate-y-0"
                      >
                        <h3 className="font-bold text-gray-800 group-hover:text-[#1a2b48] transition-colors text-xs md:text-sm uppercase">{sub.name}</h3>
                        <p className="text-[10px] text-gray-400 mt-2 uppercase font-black tracking-widest">Start Learning</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
                  <div className="section-title-bg text-white px-5 py-3 font-bold text-sm md:text-lg uppercase tracking-tight">
                    LAW GAT & Professional Tests
                  </div>
                  <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.filter(s => s.id === 'law-gat' || s.id === 'iba').map(sub => (
                      <div 
                        key={sub.id} 
                        onClick={() => handleNavigate('category', sub.id)}
                        className="group p-5 bg-[#f9f9f9] border-l-4 border-gray-200 hover:border-[#1a2b48] transition-all cursor-pointer shadow-sm hover:translate-y-[-2px]"
                      >
                        <h3 className="font-bold text-gray-800 group-hover:text-[#1a2b48] transition-colors text-xs md:text-sm uppercase">{sub.name}</h3>
                        <p className="text-[10px] text-gray-400 mt-2 uppercase font-black tracking-widest">Resources Hub</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>

            <aside className="lg:col-span-4 space-y-8 order-1 lg:order-2">
              <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
                <h3 className="text-[10px] font-black text-[#1a2b48] uppercase mb-5 border-b-2 border-gray-100 pb-3 block tracking-widest">Search Our Library</h3>
                <div className="relative flex">
                  <input 
                    type="text" 
                    placeholder="E.g. LLB Notes..." 
                    className="w-full bg-[#f9f9f9] border border-gray-200 py-3.5 px-4 text-xs font-medium focus:outline-none focus:border-[#1a2b48] transition-all placeholder:text-gray-400" 
                  />
                  <button className="bg-[#1a2b48] text-white px-5 py-2 hover:bg-black transition-colors shrink-0 flex items-center justify-center">
                    <Search className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="bg-[#1a2b48] text-white p-7 rounded-md shadow-xl border-l-[6px] border-blue-400 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                  <BrainCircuit className="h-24 w-24" />
                </div>
                <h3 className="text-sm md:text-base font-black uppercase mb-2 tracking-tight">AI Academic Tutor</h3>
                <p className="text-[10px] md:text-xs text-blue-100/80 mb-6 font-medium leading-relaxed uppercase tracking-wider">Get instant summaries of complex legal topics.</p>
                <div className="space-y-3 mb-4 relative z-10">
                  {["LAT 2026 Overview", "Contract Act Basics", "LLB Semester Roadmap"].map((topic) => (
                    <button 
                      key={topic}
                      onClick={() => handleAiHelp(topic)} 
                      className="w-full text-left bg-white/5 hover:bg-white/10 p-3.5 rounded text-[10px] font-bold uppercase border border-white/10 transition-all active:scale-[0.98] flex items-center justify-between"
                    >
                      {topic}
                      <ChevronRight className="h-3 w-3 opacity-30" />
                    </button>
                  ))}
                </div>
                {aiSummary && (
                  <div className="mt-6 p-5 bg-black/40 border border-white/10 rounded-md text-[11px] leading-relaxed animate-in slide-in-from-top-4 shadow-inner">
                    <div className="prose prose-invert prose-sm">
                      {aiSummary}
                    </div>
                    <button onClick={() => setAiSummary(null)} className="mt-4 block text-blue-300 hover:text-white uppercase font-black text-[9px] tracking-[0.2em] transition-colors">Close Assistant</button>
                  </div>
                )}
              </div>
            </aside>
          </div>
        )}

        {state.view === 'category' && (
          <div className="max-w-6xl mx-auto py-6 md:py-10">
            <div className="text-center mb-10 md:mb-16">
              <h2 className="text-xl md:text-3xl font-black text-[#1a2b48] uppercase tracking-tighter border-b-4 border-[#1a2b48] pb-4 inline-block px-4">
                {state.selectedSubCategory ? categories.find(s => s.id === state.selectedSubCategory)?.name : 'Study Modules'}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16">
              {/* Online Tests Column */}
              <div className="space-y-6">
                <h3 className="text-[11px] font-black text-[#1a2b48] uppercase tracking-[0.2em] mb-4 flex items-center gap-2 border-l-4 border-[#1a2b48] pl-3">
                   <BrainCircuit className="h-4 w-4" /> Interactive Practice Tests
                </h3>
                <div className="space-y-4">
                  {quizzes.filter(q => q.subCategoryId === (state.selectedSubCategory || '')).length > 0 ? (
                    quizzes.filter(q => q.subCategoryId === (state.selectedSubCategory || '')).map((q, idx) => (
                      <div 
                        key={q.id} 
                        onClick={() => handleNavigate('quiz', undefined, q.id)} 
                        className="bg-white p-5 rounded-md border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer flex justify-between items-center group active:scale-[0.98]"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 bg-[#f9f9f9] rounded flex items-center justify-center text-[#1a2b48] font-black group-hover:bg-[#1a2b48] group-hover:text-white transition-all shrink-0">
                            {idx + 1}
                          </div>
                          <h3 className="font-bold text-gray-800 uppercase text-xs md:text-sm tracking-tight">{q.title}</h3>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-[#1a2b48] shrink-0" />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-16 bg-white rounded-md border border-dashed border-gray-200">
                      <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Test repository pending update.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* PDF Notes Column */}
              <div className="space-y-6">
                <h3 className="text-[11px] font-black text-[#1a2b48] uppercase tracking-[0.2em] mb-4 flex items-center gap-2 border-l-4 border-[#1a2b48] pl-3">
                   <FileText className="h-4 w-4" /> Comprehensive Notes
                </h3>
                <div className="space-y-4">
                  {notes.filter(n => n.subCategoryId === (state.selectedSubCategory || '')).length > 0 ? (
                    notes.filter(n => n.subCategoryId === (state.selectedSubCategory || '')).map((n) => (
                      <div 
                        key={n.id} 
                        onClick={() => setViewingNote(n)} 
                        className="bg-white p-5 rounded-md border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer flex justify-between items-center group active:scale-[0.98]"
                      >
                        <div className="flex items-center gap-4 truncate mr-2">
                          <div className="h-10 w-10 bg-red-50 rounded flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all shrink-0">
                             <FileText className="h-5 w-5" />
                          </div>
                          <div className="truncate">
                            <h3 className="font-bold text-gray-800 uppercase text-xs md:text-sm tracking-tight truncate">{n.title}</h3>
                            <p className="text-[9px] text-gray-400 uppercase font-black mt-1">PDF Study Resource</p>
                          </div>
                        </div>
                        <Search className="h-5 w-5 text-gray-300 group-hover:text-[#1a2b48] shrink-0" />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-16 bg-white rounded-md border border-dashed border-gray-200">
                      <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">No documents found.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {state.view === 'quiz' && activeQuiz && (
          <div className="py-2 md:py-8 max-w-4xl mx-auto w-full">
            <QuizModule quiz={activeQuiz} onComplete={(score) => console.log("Quiz completed:", score)} />
          </div>
        )}

        {state.view === 'notifications' && (
          <div className="max-w-4xl mx-auto py-6 md:py-10">
             <h2 className="text-xl md:text-3xl font-black text-[#1a2b48] uppercase tracking-tighter mb-8 border-b-4 border-[#1a2b48] pb-4 inline-block">Notice Board</h2>
             <div className="space-y-6">
               {notifications.map(n => (
                 <div key={n.id} className="bg-white p-6 md:p-10 rounded-md shadow-sm border border-gray-200 group relative">
                   <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                     <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${n.type === 'Result' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{n.type}</span>
                     <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider">{n.date}</span>
                   </div>
                   <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-4 group-hover:text-[#1a2b48] transition-colors leading-tight">{n.title}</h3>
                   <p className="text-gray-600 leading-relaxed text-sm md:text-base mb-8 whitespace-pre-wrap">{n.content}</p>
                   <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8 pt-6 border-t border-gray-50">
                     <button className="w-full sm:w-auto bg-[#1a2b48] text-white px-8 py-3.5 rounded text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95">
                       <Download className="h-4 w-4" /> Download PDF
                     </button>
                     <ShareBar title={n.title} />
                   </div>
                 </div>
               ))}
               {notifications.length === 0 && (
                 <div className="text-center py-24 bg-white rounded-md border border-dashed border-gray-200">
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">No new notifications at this time.</p>
                 </div>
               )}
             </div>
          </div>
        )}
      </main>

      <footer className="bg-[#111] text-white pt-20 pb-10 mt-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 lg:col-span-2">
              <div className="flex items-center gap-3 mb-8">
                 <div className="bg-white p-2 rounded shadow-lg"><BookOpen className="h-6 w-6 md:h-8 md:w-8 text-[#1a2b48]" /></div>
                 <h4 className="text-xl md:text-2xl font-black uppercase tracking-tighter">Professional Academy</h4>
              </div>
              <p className="text-gray-400 text-[11px] md:text-xs leading-relaxed font-medium max-w-md uppercase tracking-wide opacity-80">
                A premium educational initiative focused on Law students and admission test candidates in Pakistan. We provide high-quality notes, automated testing, and latest news updates for academic excellence.
              </p>
            </div>
            <div>
              <h5 className="text-[11px] font-black uppercase tracking-[0.3em] mb-8 text-blue-400">Navigation</h5>
              <ul className="space-y-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                <li className="hover:text-white cursor-pointer transition-colors flex items-center gap-2" onClick={() => handleNavigate('home')}><ChevronRight className="h-3 w-3" /> Home Page</li>
                <li className="hover:text-white cursor-pointer transition-colors flex items-center gap-2" onClick={() => handleNavigate('category', 'lat')}><ChevronRight className="h-3 w-3" /> Law Series</li>
                <li className="hover:text-white cursor-pointer transition-colors flex items-center gap-2" onClick={() => handleNavigate('notifications')}><ChevronRight className="h-3 w-3" /> Notifications</li>
                <li className="hover:text-white cursor-pointer transition-colors flex items-center gap-2" onClick={() => { window.location.hash = '#admin'; }}><ChevronRight className="h-3 w-3" /> Admin Access</li>
              </ul>
            </div>
            <div>
              <h5 className="text-[11px] font-black uppercase tracking-[0.3em] mb-8 text-blue-400">Reach Us</h5>
              <div className="space-y-5">
                 <a href="tel:+923001234567" className="text-gray-500 hover:text-white text-[11px] font-bold uppercase tracking-widest block transition-colors flex items-center gap-3">
                   <Phone className="h-4 w-4" /> +92 300 1234567
                 </a>
                 <a href="mailto:info@mmonlineacademy.com" className="text-gray-500 hover:text-white text-[11px] font-bold uppercase tracking-widest block transition-colors flex items-center gap-3">
                   <Mail className="h-4 w-4" /> Support Email
                 </a>
                 <div className="flex gap-5 pt-4">
                    <Facebook className="h-5 w-5 text-gray-600 hover:text-blue-500 cursor-pointer transition-colors" />
                    <Twitter className="h-5 w-5 text-gray-600 hover:text-blue-400 cursor-pointer transition-colors" />
                    <Youtube className="h-5 w-5 text-gray-600 hover:text-red-500 cursor-pointer transition-colors" />
                 </div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-10 flex flex-col md:flex-row justify-between items-center gap-8 text-[9px] md:text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">
            <p className="text-center md:text-left">© 2026 PROFESSIONAL ACADEMY (MM ONLINE). ALL RIGHTS RESERVED. PK LAW NOTES STYLE.</p>
            <div className="flex gap-8">
              <span className="hover:text-white cursor-pointer transition-colors">PRIVACY</span>
              <span className="hover:text-white cursor-pointer transition-colors">TERMS</span>
              <span className="hover:text-white cursor-pointer transition-colors">SITEMAP</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
