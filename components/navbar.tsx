
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, BookOpen, Facebook, Phone, Mail, ChevronRight, Sun, Moon, Star, Instagram, Linkedin, Music as TiktokIcon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import ThemeToggle from './theme-toggle';

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchFilter: 'all' | 'quiz' | 'note';
  setSearchFilter: (filter: 'all' | 'quiz' | 'note') => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ searchQuery, setSearchQuery, searchFilter, setSearchFilter, theme, toggleTheme }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Subjects', path: '/subjects' },
    { label: 'Exam Preparation', path: '/exam-preparation' },
    { label: 'Study Guides', path: '/study-guides' },
    { label: 'Resources', path: '/resources' },
    { label: 'About Us', path: '/about' },
    { label: 'Contact Us', path: '/contact' }
  ];

  const handleNavClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
    <div className="flex flex-col w-full bg-white dark:bg-pakgreen-deepest/95 backdrop-blur-md relative shadow-sm border-b border-pakgreen/10 dark:border-gold/10 transition-colors z-[100]">
      {/* Top Info Bar */}
      <div className="bg-pakgreen dark:bg-pakgreen-dark border-b border-gold/30 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex justify-between items-center text-[10px] font-black text-white uppercase tracking-widest">
          <div className="flex items-center gap-4">
            <a href="tel:03182990927" className="flex items-center gap-1.5 hover:text-gold-light transition-colors"><Phone className="h-3 w-3 text-gold-light" /> 03182990927</a>
            <a href="mailto:mmacademy26@gmail.com" className="flex items-center gap-1.5 border-l border-white/20 pl-4 hover:text-gold-light transition-colors uppercase"><Mail className="h-3 w-3 text-gold-light" /> mmacademy26@gmail.com</a>
          </div>
          <div className="flex items-center gap-4">
             <span className="flex items-center gap-2"><Star className="h-2.5 w-2.5 text-gold-light fill-current" /> National Standard</span>
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
        <Link 
          to="/"
          className={`flex items-center cursor-pointer select-none group min-w-0 transition-all duration-300 ${isSearchFocused ? 'w-0 opacity-0 md:w-auto md:opacity-100' : 'w-auto opacity-100'}`}
          onClick={handleNavClick}
        >
          <div className="relative shrink-0">
            <div className="bg-pakgreen dark:bg-pakgreen-light p-3 rounded-2xl mr-2 md:mr-4 shadow-xl group-hover:scale-105 transition-transform flex items-center justify-center w-12 h-12 md:w-20 md:h-20 border-2 border-gold/20">
              <BookOpen className="h-full w-full text-white dark:text-gold-light" />
            </div>
            <Star className="absolute -top-1 -right-1 h-4 w-4 text-gold-light fill-current animate-pulse-subtle" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <h1 className="text-base sm:text-lg md:text-4xl font-heading font-black text-pakgreen dark:text-gold-light leading-none uppercase tracking-normal truncate">MM Academy</h1>
            <p className="text-[7px] sm:text-[9px] md:text-xs font-black text-zinc-500 dark:text-zinc-400 mt-1 tracking-[0.2em] uppercase truncate">Online Jobs Preparation Platform</p>
          </div>
        </Link>

        {/* SEARCH BAR */}
        <div className={`flex-grow transition-all duration-300 ${isSearchFocused ? 'max-w-3xl' : 'max-w-xl'} relative group`}>
          <div className={`relative flex items-center transition-all duration-300 ${isSearchFocused ? 'scale-[1.02]' : ''}`}>
            <Search className={`absolute left-4 h-4 w-4 transition-colors ${isSearchFocused ? 'text-gold' : 'text-zinc-400'}`} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              placeholder="Search academy resources..."
              className="w-full pl-12 pr-4 py-3 bg-zinc-100 dark:bg-pakgreen-dark/50 rounded-xl border border-zinc-200 dark:border-gold/10 text-xs outline-none dark:text-white focus:border-gold/50 transition-all shadow-inner"
            />
          </div>

          {/* SEARCH FILTERS - Only visible when focused */}
          {isSearchFocused && (
            <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-white dark:bg-pakgreen-deepest border border-zinc-200 dark:border-gold/20 rounded-2xl shadow-2xl z-[110] animate-in fade-in slide-in-from-top-2">
              <div className="flex gap-1">
                {(['all', 'quiz', 'note'] as const).map(f => (
                  <button 
                    key={f}
                    onClick={() => setSearchFilter(f)}
                    className={`flex-grow py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${searchFilter === f ? 'bg-pakgreen dark:bg-gold text-white dark:text-pakgreen border-transparent shadow-md' : 'bg-zinc-50 dark:bg-pakgreen-dark text-zinc-500 border-zinc-100 dark:border-gold/5 hover:bg-zinc-100'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

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
              <Link 
                key={item.label}
                to={item.path}
                className="text-white/90 hover:text-gold-light hover:bg-white/5 px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all border-r border-white/10 last:border-r-0 hover:shadow-[0_0_20px_rgba(212,175,55,0.2)]"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-[200]">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md" 
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div 
              initial={{ x: '-100%', skewX: -5 }}
              animate={{ x: 0, skewX: 0 }}
              exit={{ x: '-100%', skewX: -5 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute left-0 top-0 bottom-0 w-[85%] max-w-[320px] bg-white dark:bg-pakgreen-deepest shadow-[0_0_50px_rgba(212,175,55,0.15)] flex flex-col border-r border-gold/20 overflow-hidden"
            >
              {/* Futuristic Background Element */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              
              <div className="p-8 border-b border-zinc-200 dark:border-gold/10 flex flex-col gap-6 bg-zinc-50 dark:bg-pakgreen-dark/50 relative">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-pakgreen dark:bg-gold rounded-xl shadow-lg">
                        <BookOpen className="h-6 w-6 text-white dark:text-pakgreen" />
                      </div>
                      <span className="text-pakgreen dark:text-gold-light font-heading font-black text-lg uppercase tracking-wider">MM Academy</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black text-gold uppercase tracking-widest mb-1">Theme</span>
                        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                      </div>
                      <button 
                        onClick={() => setIsMenuOpen(false)}
                        className="p-2 rounded-full bg-zinc-200 dark:bg-white/5 text-zinc-500 dark:text-zinc-400"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                 </div>
                 <div className="flex flex-col gap-2 px-2">
                   <span className="text-sm font-serif font-bold text-pakgreen dark:text-gold-light" style={{ direction: 'rtl' }}>ربِّ زِدْنِي عِلْماً</span>
                   <span className="text-[10px] font-black text-gold uppercase tracking-[0.3em]">Institutional Portal</span>
                 </div>
              </div>
              
              <div className="flex-grow overflow-y-auto py-8 px-4 space-y-2">
                 {navItems.map((item, idx) => (
                   <motion.div
                     key={item.label}
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: 0.1 + idx * 0.05 }}
                   >
                     <Link
                       to={item.path}
                       onClick={handleNavClick}
                       className="w-full text-left px-6 py-5 text-zinc-600 dark:text-zinc-300 hover:text-pakgreen dark:hover:text-gold-light hover:bg-zinc-50 dark:hover:bg-white/5 flex items-center justify-between group transition-all rounded-2xl border border-transparent hover:border-gold/10"
                     >
                       <div className="flex items-center gap-4">
                         <div className="w-1.5 h-1.5 rounded-full bg-gold/30 group-hover:bg-gold group-hover:scale-150 transition-all" />
                         <span className="text-[12px] font-black uppercase tracking-[0.2em]">{item.label}</span>
                       </div>
                       <ChevronRight className="h-4 w-4 opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                     </Link>
                   </motion.div>
                 ))}
              </div>

              <div className="p-8 border-t border-zinc-200 dark:border-gold/10 bg-zinc-50 dark:bg-pakgreen-dark/30">
                <div className="flex justify-center gap-6">
                  <a href="https://www.facebook.com/MirpurkhasAliTalpurTown/" target="_blank" rel="noopener noreferrer" className="p-3 bg-white dark:bg-white/5 rounded-xl text-pakgreen dark:text-gold-light shadow-md hover:scale-110 transition-transform"><Facebook className="h-5 w-5" /></a>
                  <a href="https://www.instagram.com/majid.maqsood01/?hl=en" target="_blank" rel="noopener noreferrer" className="p-3 bg-white dark:bg-white/5 rounded-xl text-pakgreen dark:text-gold-light shadow-md hover:scale-110 transition-transform"><Instagram className="h-5 w-5" /></a>
                  <a href="https://www.linkedin.com/in/majid-maqsood-633444374/" target="_blank" rel="noopener noreferrer" className="p-3 bg-white dark:bg-white/5 rounded-xl text-pakgreen dark:text-gold-light shadow-md hover:scale-110 transition-transform"><Linkedin className="h-5 w-5" /></a>
                </div>
                <p className="text-center text-[8px] font-black text-zinc-400 uppercase tracking-[0.3em] mt-6 leading-relaxed">
                  MM Academy &copy; 2026<br/>Pakistan's Elite Legal Portal
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
