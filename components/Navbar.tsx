
import React, { useState } from 'react';
import { Search, Menu, X, BookOpen, Facebook, Twitter, Youtube, Phone, Mail, ChevronRight } from 'lucide-react';
import { AppState } from '../types';

interface NavbarProps {
  onNavigate: (view: AppState['view'], subId?: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState('');

  const navItems = [
    { label: 'Home', view: 'home' as const },
    { label: 'LAT Series', view: 'category' as const, subId: 'lat' },
    { label: 'Law GAT Series', view: 'category' as const, subId: 'law-gat' },
    { label: 'LLB Notes', view: 'category' as const, subId: 'llb-s1' },
    { label: 'News', view: 'notifications' as const },
    { label: 'Results', view: 'notifications' as const },
    { label: 'Contact Us', view: 'home' as const }
  ];

  const handleNavClick = (view: AppState['view'], subId?: string) => {
    onNavigate(view, subId);
    setIsMenuOpen(false);
  };

  return (
    <div className="flex flex-col w-full bg-white relative shadow-sm border-b border-gray-100">
      {/* Top Info Bar - Hidden on small screens */}
      <div className="bg-gray-50 border-b border-gray-100 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><Phone className="h-3 w-3 text-[#1a2b48]" /> +92 300 1234567</span>
            <span className="flex items-center gap-1.5 border-l pl-4"><Mail className="h-3 w-3 text-[#1a2b48]" /> INFO@MMONLINEACADEMY.COM</span>
          </div>
          <div className="flex items-center gap-3">
            <Facebook className="h-3.5 w-3.5 cursor-pointer hover:text-[#1a2b48] transition-colors" />
            <Twitter className="h-3.5 w-3.5 cursor-pointer hover:text-[#1a2b48] transition-colors" />
            <Youtube className="h-3.5 w-3.5 cursor-pointer hover:text-[#1a2b48] transition-colors" />
          </div>
        </div>
      </div>

      {/* Main Header Logo Area */}
      <div className="max-w-7xl mx-auto w-full px-4 py-4 md:py-6 flex justify-between items-center">
        <div 
          className="flex items-center cursor-pointer select-none group"
          onClick={() => handleNavClick('home')}
        >
          <div className="bg-[#1a2b48] p-2 md:p-3 rounded-lg mr-3 shadow-md group-hover:scale-105 transition-transform shrink-0">
            <BookOpen className="h-7 w-7 md:h-10 md:w-10 text-white" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <h1 className="text-base md:text-3xl font-black text-[#1a2b48] leading-none uppercase tracking-tight truncate">Professional Academy</h1>
            <p className="text-[7px] md:text-xs font-bold text-gray-400 mt-0.5 md:mt-1 tracking-[0.1em] md:tracking-[0.15em] uppercase truncate">Gateway to Legal Excellence</p>
          </div>
        </div>

        {/* Desktop Search */}
        <div className="hidden lg:flex items-center bg-gray-100 rounded-md px-3 py-2 group border border-transparent focus-within:border-[#1a2b48] transition-all">
          <input 
            type="text" 
            placeholder="Search resources..." 
            className="bg-transparent text-xs text-gray-700 placeholder-gray-400 border-none outline-none w-48 xl:w-64"
          />
          <Search className="h-4 w-4 text-gray-400 group-hover:text-[#1a2b48] cursor-pointer" />
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="lg:hidden p-2 text-[#1a2b48] hover:bg-gray-100 rounded-md transition-colors z-[110]"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="h-6 w-6 md:h-7 md:w-7" /> : <Menu className="h-6 w-6 md:h-7 md:w-7" />}
        </button>
      </div>

      {/* Desktop Navigation Bar */}
      <nav className="main-nav-bg sticky top-0 z-50 shadow-lg hidden lg:block">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-start items-center">
            {navItems.map((item) => (
              <button 
                key={item.label}
                onClick={() => handleNavClick(item.view, item.subId)}
                className="text-white hover:bg-white/10 px-5 py-4 text-[11px] font-bold uppercase tracking-widest transition-colors border-r border-white/5 last:border-r-0"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`lg:hidden fixed inset-0 z-[100] transition-all duration-300 ${isMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
        <div className={`absolute left-0 top-0 bottom-0 w-[85%] max-w-[320px] bg-[#1a2b48] shadow-2xl transition-transform duration-300 ease-out flex flex-col ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-6 border-b border-white/10 flex flex-col gap-4">
             <div className="flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-white" />
                <span className="text-white font-black text-sm uppercase tracking-tighter">Navigation</span>
             </div>
             {/* Mobile Search Input */}
             <div className="flex items-center bg-white/10 rounded-md px-3 py-2.5 border border-white/5 focus-within:border-blue-400 transition-all">
                <input 
                  type="text" 
                  value={mobileSearch}
                  onChange={(e) => setMobileSearch(e.target.value)}
                  placeholder="Search resources..." 
                  className="bg-transparent text-xs text-white placeholder-white/40 border-none outline-none w-full"
                />
                <Search className="h-4 w-4 text-white/40" />
             </div>
          </div>
          
          <div className="flex-grow overflow-y-auto py-2">
             {navItems.map((item) => (
               <button
                 key={item.label}
                 onClick={() => handleNavClick(item.view, item.subId)}
                 className="w-full text-left px-6 py-4 text-white hover:bg-white/10 flex items-center justify-between group transition-colors border-l-4 border-transparent hover:border-blue-400"
               >
                 <span className="text-[11px] font-bold uppercase tracking-[0.2em]">{item.label}</span>
                 <ChevronRight className="h-4 w-4 text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all" />
               </button>
             ))}
          </div>

          <div className="p-6 border-t border-white/10 bg-black/20">
             <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-4">Support & Social</p>
             <div className="flex flex-col gap-3 mb-6">
                <a href="tel:+923001234567" className="text-white text-xs font-bold flex items-center gap-3 hover:text-blue-300 transition-colors">
                   <Phone className="h-4 w-4 text-blue-400" /> +92 300 1234567
                </a>
                <a href="mailto:info@mmonlineacademy.com" className="text-white text-xs font-bold flex items-center gap-3 hover:text-blue-300 transition-colors">
                   <Mail className="h-4 w-4 text-blue-400" /> Email Support
                </a>
             </div>
             <div className="flex gap-4">
                <Facebook className="h-5 w-5 text-white/40 hover:text-white transition-colors" />
                <Twitter className="h-5 w-5 text-white/40 hover:text-white transition-colors" />
                <Youtube className="h-5 w-5 text-white/40 hover:text-white transition-colors" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
