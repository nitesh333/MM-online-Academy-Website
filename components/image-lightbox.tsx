
import React from 'react';
import { X } from 'lucide-react';

interface ImageLightboxProps {
  url: string;
  onClose: () => void;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({ url, onClose }) => {
  const [isZoomed, setIsZoomed] = React.useState(false);

  return (
    <div 
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300 p-4 md:p-10" 
      onClick={onClose}
    >
      <button 
        onClick={onClose} 
        className="absolute top-6 right-6 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all shadow-2xl z-[1001]"
      >
        <X className="h-8 w-8" />
      </button>
      <div 
        className={`relative transition-all duration-500 ease-in-out ${isZoomed ? 'scale-150 cursor-zoom-out' : 'scale-100 cursor-zoom-in'} max-w-full max-h-full flex items-center justify-center`}
        onClick={(e) => {
          e.stopPropagation();
          setIsZoomed(!isZoomed);
        }}
      >
        <img 
          src={url} 
          className="max-w-full max-h-full object-contain rounded-xl shadow-[0_0_100px_rgba(212,175,55,0.2)] border-2 border-white/10" 
          alt="Full view" 
        />
      </div>
    </div>
  );
};

export default ImageLightbox;
