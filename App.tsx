
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
import { AppState, Notification } from './types';
import { 
  ChevronRight, 
  Bell, 
  BookOpen, 
  GraduationCap, 
  ArrowRight, 
  Newspaper, 
  MessageCircle, 
  Download, 
  ExternalLink,
  Search,
  Lock,
  LogOut,
  Clock,
  Star,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Megaphone
} from 'lucide-react';
import { generateStudySummary } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    view: 'home',
    isAdmin: false
  });
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#admin') {
        setState(prev => ({ ...prev, view: 'admin', isAdmin: true }));
      } else if (hash.startsWith('#/category')) {
        const subId = hash.split('?id=')[1];
        setState(prev => ({ ...prev, view: 'category', selectedSubCategory: subId, isAdmin: false }));
      } else if (hash === '#/notifications') {
        setState(prev => ({ ...prev, view: 'notifications', isAdmin: false }));
      } else if (hash.startsWith('#/quiz')) {
        setState(prev => ({ ...prev, view: 'quiz', isAdmin: false }));
      } else {
        setState(prev => ({ ...prev, view: 'home', isAdmin: false }));
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (view: AppState['view'], subCatId?: string) => {
    let hash = '';
    if (view === 'category') hash = subCatId ? `#/category?id=${subCatId}` : '#/category';
    else if (view === 'notifications') hash = '#/notifications';
    else if (view === 'quiz') hash = '#/quiz';
    else hash = '';
    
    window.location.hash = hash;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAiHelp = async (topic: string) => {
    setAiSummary("Consulting AI Intelligence...");
    const result = await generateStudySummary(topic);
    setAiSummary(result);
  };

  if (state.view === 'admin') {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
        <header className="bg-[#1a2b48] text-white px-8 py-4 flex justify-between items-center shadow-md">
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5" />
            <h1 className="text-lg font-bold uppercase tracking-tight">System Admin</h1>
          </div>
          <button 
            onClick={() => { window.location.hash = ''; }}
            className="flex items-center gap-2 bg-red-600 px-4 py-2 rounded text-xs font-bold hover:bg-red-700 transition-all uppercase"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </header>
        <main className="flex-grow p-8 max-w-7xl mx-auto w-full">
          <AdminPanel 
            notifications={notifications} 
            categories={[...LAW_SUBCATEGORIES, ...GENERAL_SUBCATEGORIES]} 
            onAddNotification={(n) => setNotifications([n, ...notifications])}
            onDeleteNotification={(id) => setNotifications(notifications.filter(n => n.id !== id))}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onNavigate={(v) => handleNavigate(v as any)} />

      {/* Floating WhatsApp */}
      <a 
        href="https://wa.me/923001234567" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-[100] bg-[#25d366] text-white p-4 rounded-full shadow-lg hover:scale-105 transition-transform"
      >
        <MessageCircle className="h-6 w-6" />
      </a>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8">
        {state.view === 'home' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* ENLARGED TOP AD SPACE */}
              <div className="w-full bg-white p-6 rounded-md shadow-sm border border-gray-200 h-48 flex flex-col items-center justify-center text-gray-300 italic font-bold text-sm uppercase tracking-widest border-dashed">
                <div className="text-center">
                  <span className="block mb-2">Advertisement (728 x 180 Leaderboard)</span>
                  <div className="w-48 h-1 bg-gray-100 mx-auto rounded-full"></div>
                </div>
              </div>

              {/* LATEST EDUCATION NEWS SECTION */}
              <section className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-red-600 text-white px-6 py-3 font-bold text-lg uppercase tracking-tight flex items-center gap-3">
                  <Megaphone className="h-5 w-5" /> Latest Education News
                </div>
                <div className="p-0 divide-y divide-gray-100">
                  {notifications.filter(n => n.type === 'News' || n.type === 'Test Date').map(n => (
                    <div 
                      key={n.id} 
                      className="p-6 hover:bg-gray-50 transition-colors cursor-pointer group"
                      onClick={() => handleNavigate('notifications')}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold text-[#1a2b48] uppercase tracking-[0.2em]">{n.date}</span>
                        <span className="text-[9px] font-black bg-red-50 text-red-600 px-2 py-0.5 rounded border border-red-100 uppercase">Breaking</span>
                      </div>
                      <h3 className="font-bold text-gray-800 text-base group-hover:text-[#1a2b48] transition-colors">{n.title}</h3>
                      <p className="text-gray-500 text-xs mt-2 line-clamp-2 leading-relaxed">{n.content}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* LAT SERIES Section */}
              <section className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
                <div className="section-title-bg text-white px-6 py-3 font-bold text-lg uppercase tracking-tight">
                  Law Admission Test (LAT) Series
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {LAW_SUBCATEGORIES.filter(s => s.id === 'lat' || s.id.startsWith('llb')).map(sub => (
                    <div 
                      key={sub.id} 
                      onClick={() => handleNavigate('category', sub.id)}
                      className="group p-4 bg-[#f9f9f9] border-l-4 border-gray-200 hover:border-[#1a2b48] transition-all cursor-pointer"
                    >
                      <h3 className="font-bold text-[#333] group-hover:text-[#1a2b48] transition-colors">{sub.name}</h3>
                      <p className="text-[11px] text-gray-500 mt-1 uppercase font-bold tracking-wider">Complete Study Material</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* LAW GAT SERIES Section */}
              <section className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
                <div className="section-title-bg text-white px-6 py-3 font-bold text-lg uppercase tracking-tight">
                  LAW GAT Series & Notes
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {LAW_SUBCATEGORIES.filter(s => s.id === 'law-gat').map(sub => (
                    <div 
                      key={sub.id} 
                      onClick={() => handleNavigate('category', sub.id)}
                      className="group p-4 bg-[#f9f9f9] border-l-4 border-gray-200 hover:border-[#1a2b48] transition-all cursor-pointer"
                    >
                      <h3 className="font-bold text-[#333] group-hover:text-[#1a2b48] transition-colors">{sub.name}</h3>
                      <p className="text-[11px] text-gray-500 mt-1 uppercase font-bold tracking-wider">Past Papers & MCQs</p>
                    </div>
                  ))}
                  <div className="group p-4 bg-[#f9f9f9] border-l-4 border-gray-200 hover:border-[#1a2b48] transition-all cursor-pointer">
                    <h3 className="font-bold text-[#333] group-hover:text-[#1a2b48]">Criminal Law Notes</h3>
                    <p className="text-[11px] text-gray-500 mt-1 uppercase font-bold tracking-wider">Interactive Test Included</p>
                  </div>
                </div>
              </section>

              {/* ENLARGED MID-PAGE AD */}
              <div className="w-full bg-white p-6 rounded-md shadow-sm border border-gray-200 h-40 flex items-center justify-center text-gray-300 italic font-bold text-sm uppercase tracking-widest border-dashed">
                Large Inline Content Ad Slot
              </div>

              {/* GENERAL ADMISSIONS Section */}
              <section className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
                <div className="section-title-bg text-white px-6 py-3 font-bold text-lg uppercase tracking-tight">
                  Entry Test Preparation
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {GENERAL_SUBCATEGORIES.map(sub => (
                    <div 
                      key={sub.id} 
                      onClick={() => handleNavigate('category', sub.id)}
                      className="group p-4 bg-[#f9f9f9] border-l-4 border-gray-200 hover:border-[#1a2b48] transition-all cursor-pointer"
                    >
                      <h3 className="font-bold text-[#333] group-hover:text-[#1a2b48] transition-colors">{sub.name}</h3>
                      <p className="text-[11px] text-gray-500 mt-1 uppercase font-bold tracking-wider">Practice MCQs Online</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar (Right) */}
            <aside className="lg:col-span-4 space-y-8">
              
              {/* Search Widget */}
              <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
                <h3 className="text-sm font-bold text-[#1a2b48] uppercase mb-4 border-b-2 pb-2 inline-block">Search Library</h3>
                <div className="relative flex">
                  <input 
                    type="text" 
                    placeholder="Search site..." 
                    className="w-full bg-[#f9f9f9] border border-gray-200 py-3 px-4 text-xs font-medium focus:outline-none focus:border-[#1a2b48]" 
                  />
                  <button className="bg-[#1a2b48] text-white px-4 py-2 hover:bg-black transition-colors">
                    <Search className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* AI Assistant Widget */}
              <div className="bg-[#1a2b48] text-white p-6 rounded-md shadow-lg">
                <h3 className="text-sm font-bold uppercase mb-2">Smart Study Assistant</h3>
                <p className="text-[11px] text-blue-100 mb-4 font-medium italic leading-relaxed">Get instant summaries for any legal topic or test syllabus.</p>
                <div className="space-y-3">
                  <button 
                    onClick={() => handleAiHelp("How to prepare for LAT 2026 exam in Pakistan?")}
                    className="w-full text-left bg-white/10 hover:bg-white/20 p-3 rounded text-[11px] font-bold uppercase tracking-wider transition-all"
                  >
                    LAT Preparation Tips
                  </button>
                  <button 
                    onClick={() => handleAiHelp("Core topics for Law GAT assessment")}
                    className="w-full text-left bg-white/10 hover:bg-white/20 p-3 rounded text-[11px] font-bold uppercase tracking-wider transition-all"
                  >
                    GAT Syllabus Recap
                  </button>
                </div>
                {aiSummary && (
                  <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded text-[10px] italic leading-relaxed animate-in fade-in">
                    {aiSummary}
                    <button onClick={() => setAiSummary(null)} className="block mt-2 text-white/40 hover:text-white uppercase font-black tracking-widest">Close</button>
                  </div>
                )}
              </div>

              {/* SIDEBAR AD */}
              <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200 h-96 flex flex-col items-center justify-center text-gray-300 italic font-bold text-xs uppercase tracking-widest border-dashed text-center">
                <div className="p-4">
                  <div className="w-full h-full border border-gray-100 flex items-center justify-center">
                    Bigger Sidebar Ad Unit (300 x 600)
                  </div>
                </div>
              </div>

              {/* Recent Notifications Widget */}
              <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
                <h3 className="text-sm font-bold text-[#1a2b48] uppercase mb-6 border-b-2 pb-2 inline-block">Latest Announcements</h3>
                <div className="space-y-4">
                  {notifications.map(n => (
                    <div 
                      key={n.id} 
                      className="group cursor-pointer border-b border-gray-50 pb-3 last:border-0"
                      onClick={() => handleNavigate('notifications')}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-bold text-gray-400 uppercase">{n.date}</span>
                        <span className={`h-1.5 w-1.5 rounded-full ${n.type === 'Result' ? 'bg-red-500' : 'bg-[#1a2b48]'}`}></span>
                      </div>
                      <h4 className="text-xs font-bold text-gray-800 group-hover:text-[#1a2b48] leading-snug transition-colors">{n.title}</h4>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => handleNavigate('notifications')}
                  className="w-full mt-6 py-3 bg-[#f9f9f9] text-[#1a2b48] text-[10px] font-bold uppercase tracking-widest hover:bg-[#1a2b48] hover:text-white transition-all"
                >
                  View All Notifications
                </button>
              </div>

            </aside>
          </div>
        )}

        {state.view === 'category' && (
          <div className="max-w-4xl mx-auto py-8">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-black text-[#1a2b48] uppercase tracking-tight mb-2">
                {state.selectedSubCategory ? 
                  LAW_SUBCATEGORIES.find(s => s.id === state.selectedSubCategory)?.name || 
                  GENERAL_SUBCATEGORIES.find(s => s.id === state.selectedSubCategory)?.name : 
                  'All Courses'}
              </h2>
              <div className="w-16 h-1 bg-[#1a2b48] mx-auto rounded-full"></div>
            </div>

            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(testNum => (
                <div 
                  key={testNum}
                  onClick={() => handleNavigate('quiz', state.selectedSubCategory)}
                  className="bg-white p-6 rounded-md border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer flex justify-between items-center group"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-[#f9f9f9] rounded flex items-center justify-center text-[#1a2b48] font-bold group-hover:bg-[#1a2b48] group-hover:text-white transition-all">
                      {testNum}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 uppercase text-sm">Online Practice Test - Set {testNum}</h3>
                      <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Updated Syllabus MCQ Series</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-[#1a2b48] transition-colors" />
                </div>
              ))}
            </div>
          </div>
        )}

        {state.view === 'quiz' && (
          <div className="py-8 max-w-4xl mx-auto">
            <QuizModule 
              quiz={MOCK_QUIZ} 
              onComplete={(score) => console.log("Quiz completed:", score)} 
            />
          </div>
        )}

        {state.view === 'notifications' && (
          <div className="max-w-4xl mx-auto py-8">
             <h2 className="text-3xl font-black text-[#1a2b48] uppercase tracking-tight mb-10 border-b-4 border-[#1a2b48] pb-2">Academy News & Notifications</h2>
             <div className="space-y-6">
               {notifications.map(n => (
                 <div key={n.id} className="bg-white p-8 rounded-md shadow-sm border border-gray-200 group">
                   <div className="flex justify-between items-center mb-4">
                     <span className={`px-4 py-1.5 rounded text-[9px] font-bold uppercase tracking-widest ${
                       n.type === 'Result' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                     }`}>
                       {n.type}
                     </span>
                     <span className="text-xs text-gray-400 font-bold">{n.date}</span>
                   </div>
                   <h3 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-[#1a2b48] transition-colors">{n.title}</h3>
                   <p className="text-gray-600 leading-relaxed text-sm mb-6">{n.content}</p>
                   <button className="bg-[#1a2b48] text-white px-6 py-2.5 rounded text-[10px] font-bold uppercase tracking-widest shadow-md hover:bg-black transition-all flex items-center gap-2">
                     <Download className="h-4 w-4" /> Download Official Circular
                   </button>
                 </div>
               ))}
             </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#111] text-white pt-16 pb-8 mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-[0.2em] mb-8 border-l-4 border-[#1a2b48] pl-4">About MM Online Academy</h4>
              <p className="text-gray-400 text-xs leading-loose font-medium">
                Professional Academy is Pakistan's leading digital platform offering high-quality legal notes, entry test prep, and latest job updates. We follow the pklawnotes tradition of accuracy and dedication.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-[0.2em] mb-8 border-l-4 border-[#1a2b48] pl-4">Useful Links</h4>
              <ul className="space-y-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                <li className="hover:text-white cursor-pointer flex items-center gap-2"><ChevronRight className="h-3 w-3" /> LAT Prep Material</li>
                <li className="hover:text-white cursor-pointer flex items-center gap-2"><ChevronRight className="h-3 w-3" /> Law GAT Preparation</li>
                <li className="hover:text-white cursor-pointer flex items-center gap-2"><ChevronRight className="h-3 w-3" /> LLB Semesters</li>
                <li className="hover:text-white cursor-pointer flex items-center gap-2"><ChevronRight className="h-3 w-3" /> Education News</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-[0.2em] mb-8 border-l-4 border-[#1a2b48] pl-4">Connect With Us</h4>
              <p className="text-gray-400 text-xs mb-6">Join our social networks for instant exam updates and guidance.</p>
              <div className="flex gap-4">
                {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                  <div key={i} className="h-10 w-10 bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-[#1a2b48] transition-all">
                    <Icon className="h-4 w-4" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            <p>© 2026 PROFESSIONAL ACADEMY - MM ONLINE. ALL RIGHTS RESERVED.</p>
            <div className="flex gap-8">
              <span className="hover:text-white cursor-pointer">Privacy Policy</span>
              <span className="hover:text-white cursor-pointer">Contact Us</span>
              <span 
                onClick={() => { window.location.hash = '#admin'; }}
                className="hover:text-white cursor-pointer opacity-20"
              >
                Admin Panel
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
