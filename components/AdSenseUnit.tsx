
import React, { useEffect } from 'react';

interface AdSenseUnitProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Reusable Google AdSense Unit.
 * Replace ca-pub-XXXXXXXXXXXXXXXX with your actual publisher ID.
 */
const AdSenseUnit: React.FC<AdSenseUnitProps> = ({ slot, format = 'auto', className = '', style }) => {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense failed to load:', e);
    }
  }, [slot]);

  return (
    <div className={`adsense-container my-8 flex justify-center ${className}`} style={style}>
      <ins 
        className="adsbygoogle"
        style={{ display: 'block', minWidth: '250px', minHeight: '90px', ...style }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
};

export default AdSenseUnit;
