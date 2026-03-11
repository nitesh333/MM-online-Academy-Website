
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { BookOpen, Search, X, ListChecks, FileText, ChevronRight, Download } from 'lucide-react';

// Context & Utils
import { DataProvider, useData } from './context/DataContext';
import { handleShareNews } from './utils/share';
import { socialLinks } from './constants';

// Components
import Navbar from './components/navbar';
import AdSlot from './components/ad-banner';
import ImageLightbox from './components/image-lightbox';

// Pages
import Home from './pages/home';
import CategoryView from './pages/category-view';
import QuizView from './pages/quiz-view';
import NewsView from './pages/news-view';
import ContactView from './pages/contact-view';
import PrivacyPolicy from './pages/privacy-policy';
import TermsView from './pages/terms-view';
import AboutView from './pages/about-view';
import Disclaimer from './pages/disclaimer';
import ArticleView from './pages/article-view';
import AdminView from './pages/admin-view';
import RegistryView from './pages/registry-view';

const AppContent: React.FC = () => {
  const { notifications, quizzes, notes, categories, ads, isLoading } = useData();
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState<'all' | 'quiz' | 'note'>('all');
  const location = useLocation();
  const isAdminSubdomain = window.location.hostname.startsWith('admin.');

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

  // Analytics & Scroll Management
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Update Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    const cleanPath = location.pathname === '/' ? '' : location.pathname;
    canonical.setAttribute('href', `https://mmtestpreparation.com${cleanPath}`);

    // Update OG URL
    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', `https://mmtestpreparation.com${cleanPath}`);
    }

    // Dynamic Titles
    const pageTitles: Record<string, string> = {
      '/': 'MM Academy - SPSC, MDCAT, ECAT & HEC Test Preparation Pakistan',
      '/about': 'About Us - MM Academy',
      '/contact': 'Contact Us - MM Academy',
      '/registry': 'Full Registry - MM Academy',
      '/news': 'Institutional News - MM Academy',
      '/privacy-policy': 'Privacy Policy - MM Academy',
      '/terms': 'Terms & Conditions - MM Academy',
      '/disclaimer': 'Disclaimer - MM Academy',
    };
    
    if (pageTitles[location.pathname]) {
      document.title = pageTitles[location.pathname];
    }

    // TAGS: Track Page View (Measurement)
    // @ts-ignore
    if (typeof window.gtag === 'function') {
      // @ts-ignore
      window.gtag('config', 'G-LPKN9GTC7V', {
        page_path: location.pathname + location.hash,
        page_title: document.title
      });
    }
  }, [location]);

  // TAGS: Global Event Tracker for Conversions
  const trackEvent = (action: string, category: string, label: string, value?: number) => {
    // @ts-ignore
    if (typeof window.gtag === 'function') {
      // @ts-ignore
      window.gtag('event', action, {
        'event_category': category,
        'event_label': label,
        'value': value
      });
    }
  };

  const filteredQuizzes = quizzes.filter(q => 
    q.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownloadNote = (note: any) => {
    // TAGS: Track Conversion (Note Download)
    trackEvent('download_note', 'Engagement', note.title);

    const link = document.createElement('a');
    link.href = note.url;
    link.download = `${note.title}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const marqueeText = notifications.length > 0 
    ? notifications.slice(0, 5).map(n => `NEWS: ${n.title}`).join(" | ") + " | Welcome to MM Academy - Pakistan's Elite Legal Portal"
    : "Welcome to MM Academy - We Conduct LAW GAT and LAT Preparation | SPSC | IBA Sukkur | ECAT | MDCAT | HEC/ETC | LEARN with EXCELLENCE";

  if (isAdminSubdomain) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-pakgreen-deepest transition-colors islamic-pattern">
        {activeImage && <ImageLightbox url={activeImage} onClose={() => setActiveImage(null)} />}
        <main className="flex-grow w-full relative">
          <Routes>
            <Route path="/" element={<AdminView />} />
            <Route path="*" element={<AdminView />} />
          </Routes>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-pakgreen-deepest transition-colors islamic-pattern">
      {activeImage && <ImageLightbox url={activeImage} onClose={() => setActiveImage(null)} />}
      
      <Navbar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchFilter={searchFilter}
        setSearchFilter={setSearchFilter}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      
      <div className="w-full bg-gold py-2 overflow-hidden border-y border-gold-dark shadow-md z-40">
        <div className="news-ticker">
          <div className="ticker-content text-pakgreen font-black uppercase text-[10px] sm:text-xs tracking-widest">
            {marqueeText} &nbsp; • &nbsp; {marqueeText}
          </div>
        </div>
      </div>

      <AdSlot placement="header" privateAds={ads} />

      <main className="flex-grow w-full relative">
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
                        <Link key={q.id} to={`/quiz/${q.id}`} onClick={() => setSearchQuery('')} className="bg-white dark:bg-pakgreen-dark/40 p-6 rounded-3xl border border-gold/5 hover:border-gold-light transition-all cursor-pointer flex justify-between items-center group shadow-lg">
                          <div className="flex items-center gap-4">
                            <div className="bg-gold/10 p-3 rounded-xl text-gold"><ListChecks className="h-5 w-5" /></div>
                            <div>
                              <h4 className="text-sm font-heading font-black text-pakgreen dark:text-white uppercase">{q.title}</h4>
                              <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">Assessment • {categories.find(c => c.id === q.subCategoryId)?.name}</p>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gold-light opacity-0 group-hover:opacity-100 transition-all" />
                        </Link>
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

        <Routes>
          <Route path="/" element={<Home setActiveImage={setActiveImage} />} />
          <Route path="/category/:id" element={<CategoryView />} />
          <Route path="/quiz/:id" element={<QuizView />} />
          <Route path="/news" element={<NewsView setActiveImage={setActiveImage} />} />
          <Route path="/news/:id" element={<NewsView setActiveImage={setActiveImage} />} />
          <Route path="/contact" element={<ContactView />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsView />} />
          <Route path="/about" element={<AboutView />} />
          <Route path="/disclaimer" element={<Disclaimer />} />
          <Route path="/article/:id" element={<ArticleView />} />
          <Route path="/registry" element={<RegistryView />} />
          <Route path="/admin" element={<AdminView />} />
        </Routes>
      </main>

      <footer className="bg-white dark:bg-pakgreen-dark/95 backdrop-blur-md border-t-4 border-gold-light py-12 mt-auto">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 items-center gap-10">
            <div className="text-center md:text-left font-black text-[10px] sm:text-xs uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
               © 2026 All Rights Reserved By <span className="text-pakgreen dark:text-gold">MM Academy</span>
            </div>
            <div className="flex flex-col items-center gap-6">
               <div className="flex items-center gap-3">
                  <BookOpen className="h-10 w-10 text-pakgreen dark:text-gold-light" />
                  <span className="text-3xl font-heading font-black uppercase text-pakgreen dark:text-gold-light tracking-normal">MM Academy</span>
               </div>
               <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  <Link to="/about" className="hover:text-gold transition-colors">About Us</Link>
                  <Link to="/contact" className="hover:text-gold transition-colors">Contact Us</Link>
                  <Link to="/privacy-policy" className="hover:text-gold transition-colors">Privacy Policy</Link>
                  <Link to="/terms" className="hover:text-gold transition-colors">Terms & Conditions</Link>
                  <Link to="/disclaimer" className="hover:text-gold transition-colors">Disclaimer</Link>
                  <Link to="/registry" className="hover:text-gold transition-colors">Registry</Link>
                  <a href="/sitemap.xml" target="_blank" className="hover:text-gold transition-colors">Sitemap</a>
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
      <DataProvider>
        <AppContent />
      </DataProvider>
    </BrowserRouter>
  );
};

export default App;
