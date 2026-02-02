
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info, ExternalLink } from 'lucide-react';

const AdBanner: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-[50] transition-transform duration-500 ease-in-out transform ${
        isOpen ? 'translate-y-0' : 'translate-y-[calc(100%-32px)]'
      }`}
    >
      {/* Toggle Button */}
      <div className="flex justify-center">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="bg-zinc-900 border-t border-x border-zinc-800 px-6 py-1 rounded-t-xl text-zinc-500 hover:text-indigo-400 transition-colors shadow-2xl flex items-center gap-2 group"
          aria-label={isOpen ? "Collapse Ad" : "Expand Ad"}
        >
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">{isOpen ? 'Hide' : 'Advertisement'}</span>
        </button>
      </div>

      {/* Banner Content */}
      <div className="bg-[#121214] border-t border-zinc-800 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
          <div className="relative bg-zinc-900/50 rounded-xl border border-dashed border-zinc-800 p-3 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Ad Content Placeholder */}
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="hidden sm:flex h-12 w-12 bg-indigo-600/10 rounded-xl items-center justify-center border border-indigo-500/20 shrink-0">
                <Info className="h-6 w-6 text-indigo-500" />
              </div>
              <div className="text-center sm:text-left">
                <h4 className="text-zinc-100 font-black text-xs sm:text-sm uppercase tracking-tight flex items-center justify-center sm:justify-start gap-2">
                  Academic Excellence with Confidence
                  <span className="bg-indigo-600/20 text-indigo-400 text-[8px] px-1.5 py-0.5 rounded border border-indigo-500/30">AD</span>
                </h4>
                <p className="text-zinc-500 text-[10px] font-medium mt-1 leading-tight">
                  Get premium Law GAT and LAT prep resources. Trusted by 10k+ students across Pakistan.
                </p>
              </div>
            </div>

            {/* Action Button / AdSense Slot Container */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <a 
                href="#" 
                className="flex-grow sm:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
              >
                Learn More <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <button className="hidden md:block p-2 text-zinc-700 hover:text-zinc-500">
                <Info className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Google AdSense Integration Hint */}
            <div className="absolute top-1 right-2 text-[7px] text-zinc-800 font-bold uppercase tracking-widest pointer-events-none">
              ads by google
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdBanner;
