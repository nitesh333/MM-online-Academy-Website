import React from 'react';
import { PrivateAd } from '../types';

interface AdSlotProps {
  placement: 'header' | 'sidebar' | 'content' | 'footer';
  className?: string;
  privateAds?: PrivateAd[];
}

const AdSlot: React.FC<AdSlotProps> = ({ placement, className = "", privateAds = [] }) => {
  const activeAd = privateAds.find(ad => ad.placement === placement && (ad.isVisible === true || String(ad.isVisible) === '1'));

  const placementStyles = {
    header: "w-full max-w-7xl mx-auto my-4 h-[90px] sm:h-[120px]",
    sidebar: "w-full min-h-[250px] mb-8",
    content: "w-full my-12 min-h-[100px] sm:min-h-[150px]",
    footer: "w-full max-w-7xl mx-auto mt-12 mb-6 min-h-[90px]"
  };

  if (activeAd) {
    return (
      <a 
        href={activeAd.clickUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className={`relative block overflow-hidden group ${placementStyles[placement]} ${className} rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-[1.01]`}
      >
        <img src={activeAd.imageUrl} alt={activeAd.text} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <span className="text-[10px] font-black text-white uppercase tracking-widest">{activeAd.text}</span>
        </div>
        <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-md px-2 py-1 rounded text-[7px] text-white/60 font-black uppercase tracking-widest">Sponsored</div>
      </a>
    );
  }

  return (
    <div className={`relative bg-zinc-100 dark:bg-pakgreen-dark/20 border border-dashed border-zinc-300 dark:border-gold/10 overflow-hidden flex items-center justify-center group ${placementStyles[placement]} ${className} rounded-2xl`}>
      {/* AdSense Unit Structure */}
      <ins className="adsbygoogle"
           style={{ display: 'block', textAlign: 'center' }}
           data-ad-layout="in-article"
           data-ad-format="fluid"
           data-ad-client="ca-pub-PLACEHOLDER"
           data-ad-slot="PLACEHOLDER"></ins>
      
      <div className="flex flex-col items-center justify-center opacity-40 group-hover:opacity-60 transition-opacity p-4">
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-gold-light/40 mb-2">Advertisement</span>
        <div className="text-[10px] font-bold text-zinc-300 dark:text-gold-light/20 text-center uppercase tracking-widest">
          Google AdSense Placement
        </div>
      </div>
      
      <div className="absolute top-1 right-2 text-[7px] text-zinc-300 dark:text-gold-light/20 font-bold uppercase">
        Ad Slot
      </div>
    </div>
  );
};

export default AdSlot;