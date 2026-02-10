import React, { useState, useEffect } from 'react';
import { Search, Menu, X, BookOpen, Facebook, Twitter, Youtube, Phone, Mail, ChevronRight, Sun, Moon, Star, Instagram, Linkedin, Music as TiktokIcon } from 'lucide-react';
import { AppState } from '../types';

interface NavbarProps {
  onNavigate: (view: AppState['view'], subId?: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Default to 'dark' if no preference is saved
  const [theme, setTheme] = useState<'dark' | 'light'>(
    () => (localStorage.getItem('theme') as 'dark' | 'light') || 'dark'
  );

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const navItems = [
    { label: 'Home', view: 'home' as const },
    { label: 'LAT Series', view: 'category' as const, subId: 'lat' },
    { label: 'Law GAT Series', view: 'category' as const, subId: 'law-gat' },
    { label: 'LLB Notes', view: 'category' as const, subId: 'llb-s1' },
    { label: 'News', view: 'notifications' as const },
    { label: 'Contact', view: 'contact' as const }
  ];

  const handleNavClick = (view: AppState['view'], subId?: string) => {
    onNavigate(view, subId);
    setIsMenuOpen(false);
  };

  return (
    <div className="flex flex-col w-full bg-white dark:bg-pakgreen-deepest/95 backdrop-blur-md relative shadow-sm border-b border-pakgreen/10 dark:border-gold/10 transition-colors z-[100]">
      {/* Top Info Bar */}
      <div className="bg-pakgreen dark:bg-pakgreen-dark border-b border-gold/30 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex justify-between items-center text-[10px] font-black text-white uppercase tracking-widest">
          <div className="flex items-center gap-4">
            <a href="tel:03182990927" className="flex items-center gap-1.5 hover:text-gold-light transition-colors"><Phone className="h-3 w-3 text-gold-light" /> +92 318 2990927</a>
            <a href="mailto:mmonlineacademy26@gmail.com" className="flex items-center gap-1.5 border-l border-white/20 pl-4 hover:text-gold-light transition-colors uppercase"><Mail className="h-3 w-3 text-gold-light" /> mmonlineacademy26@gmail.com</a>
          </div>
          <div className="flex items-center gap-4">
             <span className="flex items-center gap-2"><Star className="h-2.5 w-2.5 text-gold-light fill-current" /> National Academic Standard</span>
            <div className="flex items-center gap-3 border-l border-white/20 pl-4">
              <a href="https://www.facebook.com/MirpurkhasAliTalpurTown/" target="_blank" rel="noopener noreferrer" title="Facebook"><Facebook className="h-3.5 w-3.5 cursor-pointer hover:text-gold-light transition-colors" /></a>
              <a href="https://www.instagram.com/majid.maqsood01/?hl=en" target="_blank" rel="noopener noreferrer" title="Instagram"><Instagram className="h-3.5 w-3.5 cursor-pointer hover:text-gold-light transition-colors" /></a>
              <a href="https://www.linkedin.com/in/majid-maqsood-633444374/" target="_blank" rel="noopener noreferrer" title="LinkedIn"><Linkedin className="h-3.5 w-3.5 cursor-pointer hover:text-gold-light transition-colors" /></a>
              <a href="https://www.tiktok.com/@majid.maqsood8" target="_blank" rel="noopener noreferrer" title="TikTok"><TiktokIcon className="h-3.5 w-3.5 cursor-pointer hover:text-gold-light transition-colors" /></a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-3 md:py-6 flex justify-between items-center gap-4">
        <div 
          className="flex items-center cursor-pointer select-none group min-w-0"
          onClick={() => handleNavClick('home')}
        >
          <div className="relative shrink-0">
            <div className="bg-pakgreen dark:bg-pakgreen-light p-3 rounded-2xl mr-2 md:mr-4 shadow-xl group-hover:scale-105 transition-transform flex items-center justify-center w-12 h-12 md:w-20 md:h-20 border-2 border-gold/20">
              <BookOpen className="h-full w-full text-white dark:text-gold-light" />
            </div>
            <Star className="absolute -top-1 -right-1 h-4 w-4 text-gold-light fill-current animate-pulse-subtle" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <h1 className="text-base sm:text-lg md:text-3xl font-black text-pakgreen dark:text-gold-light leading-none uppercase tracking-tight truncate">MM Academy</h1>
            <p className="text-[7px] sm:text-[9px] md:text-xs font-black text-zinc-500 dark:text-zinc-400 mt-1 tracking-[0.2em] uppercase truncate">Gateway to Legal Excellence</p>
          </div>
        </div>

        {/* ARABIC INVOCATION */}
        <div className="flex-grow flex justify-center items-center pointer-events-none px-4">
          <span className="hidden lg:block text-4xl xl:text-5xl font-serif font-bold text-pakgreen dark:text-gold-light opacity-90 whitespace-nowrap drop-shadow-lg" style={{ direction: 'rtl' }}>
            ربِّ زِدْنِي عِلْماً
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <button 
            onClick={toggleTheme}
            className="p-2 md:p-3 rounded-xl bg-zinc-100 dark:bg-pakgreen-dark/50 text-pakgreen dark:text-gold-light hover:bg-gold-light dark:hover:bg-gold-light hover:text-white dark:hover:text-pakgreen transition-all border border-zinc-200 dark:border-gold/20 shadow-lg"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 md:h-5 md:w-5" /> : <Moon className="h-4 w-4 md:h-5 md:w-5" />}
          </button>

          <button 
            className="lg:hidden p-2 text-pakgreen dark:text-gold-light hover:bg-zinc-100 dark:hover:bg-pakgreen-dark rounded-xl transition-colors z-[110]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <nav className="bg-pakgreen dark:bg-pakgreen-dark/80 backdrop-blur-md border-y border-gold/10 sticky top-0 z-50 shadow-lg hidden lg:block">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex justify-start items-center">
            {navItems.map((item) => (
              <button 
                key={item.label}
                onClick={() => handleNavClick(item.view, item.subId)}
                className="text-white/90 hover:text-gold-light hover:bg-white/5 px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all border-r border-white/10 last:border-r-0 hover:shadow-[0_0_20px_rgba(212,175,55,0.2)]"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`lg:hidden fixed inset-0 z-[100] transition-all duration-300 ${isMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
        <div className={`absolute left-0 top-0 bottom-0 w-[85%] max-w-[300px] bg-white dark:bg-pakgreen-deepest shadow-2xl transition-transform duration-300 ease-out flex flex-col ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-8 border-b border-zinc-200 dark:border-gold/10 flex flex-col gap-6 bg-zinc-50 dark:bg-pakgreen-dark/50">
             <div className="flex items-center gap-3">
                <BookOpen className="h-6 w-6 text-pakgreen dark:text-gold-light" />
                <span className="text-pakgreen dark:text-gold-light font-black text-sm uppercase tracking-tighter">Navigation</span>
             </div>
             <div className="text-center">
               <span className="text-2xl font-serif font-bold text-pakgreen dark:text-gold-light" style={{ direction: 'rtl' }}>ربِّ زِدْنِي عِلْماً</span>
             </div>
          </div>
          
          <div className="flex-grow overflow-y-auto py-4">
             {navItems.map((item) => (
               <button
                 key={item.label}
                 onClick={() => handleNavClick(item.view, item.subId)}
                 className="w-full text-left px-8 py-5 text-zinc-600 dark:text-zinc-300 hover:text-pakgreen dark:hover:text-gold-light hover:bg-zinc-50 dark:hover:bg-white/5 flex items-center justify-between group transition-all border-l-8 border-transparent hover:border-pakgreen dark:hover:border-gold"
               >
                 <span className="text-[11px] font-black uppercase tracking-[0.2em]">{item.label}</span>
                 <ChevronRight className="h-4 w-4 opacity-30 group-hover:opacity-100 transition-all" />
               </button>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;