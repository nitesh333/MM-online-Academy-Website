
import React from 'react';
import { Search, Menu, BookOpen, Facebook, Twitter, Instagram, Youtube, Phone, Mail } from 'lucide-react';

interface NavbarProps {
  onNavigate: (view: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col w-full bg-white">
      {/* Top Header Logo Area */}
      <div className="max-w-7xl mx-auto w-full px-4 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div 
          className="flex items-center cursor-pointer select-none"
          onClick={() => onNavigate('home')}
        >
          <div className="bg-[#1a2b48] p-3 rounded-lg mr-3 shadow-md">
            <BookOpen className="h-10 w-10 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-3xl font-black text-[#1a2b48] leading-none uppercase tracking-tight">Professional Academy</h1>
            <p className="text-xs font-bold text-gray-500 mt-1 tracking-[0.2em] uppercase">Your Gateway to Legal Excellence</p>
          </div>
        </div>
        
        {/* Header Socials & Contact Area */}
        <div className="hidden md:flex items-center gap-6">
           <div className="flex flex-col items-end text-right">
              <div className="flex items-center gap-4 text-gray-400 mb-2">
                <Facebook className="h-4 w-4 cursor-pointer hover:text-[#1a2b48]" />
                <Twitter className="h-4 w-4 cursor-pointer hover:text-[#1a2b48]" />
                <Youtube className="h-4 w-4 cursor-pointer hover:text-[#1a2b48]" />
              </div>
              <div className="text-[10px] font-bold text-gray-400 flex items-center gap-3">
                <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> +92 300 1234567</span>
                <span className="flex items-center gap-1 border-l pl-3"><Mail className="h-3 w-3" /> INFO@MMONLINEACADEMY.COM</span>
              </div>
           </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="main-nav-bg sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-14">
            <div className="hidden lg:flex items-center space-x-1">
              {['Home', 'LAT Series', 'Law GAT Series', 'LLB Notes', 'News', 'Results', 'Contact Us'].map((item) => (
                <button 
                  key={item}
                  onClick={() => {
                    if (item === 'Home') onNavigate('home');
                    else if (item === 'Results' || item === 'News') onNavigate('notifications');
                    else onNavigate('category');
                  }}
                  className="text-white hover:bg-white/10 px-4 py-4 text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  {item}
                </button>
              ))}
            </div>
            
            <div className="lg:hidden flex items-center text-white p-2">
              <Menu className="h-6 w-6 cursor-pointer" />
            </div>

            <div className="flex items-center bg-white/10 rounded-md px-3 py-1.5 group">
              <input 
                type="text" 
                placeholder="Search notes..." 
                className="bg-transparent text-white text-xs placeholder-white/60 border-none outline-none w-32 md:w-48"
              />
              <Search className="h-4 w-4 text-white/60 group-hover:text-white cursor-pointer" />
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
