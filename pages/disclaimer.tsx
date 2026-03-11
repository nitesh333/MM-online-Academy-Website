
import React from 'react';
import { AlertTriangle, Info, ShieldAlert } from 'lucide-react';

const Disclaimer: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24 animate-in fade-in slide-in-from-bottom-10">
      <div className="text-center mb-16">
        <div className="h-20 w-20 bg-gold/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-gold/20">
          <AlertTriangle className="h-10 w-10 text-gold" />
        </div>
        <h1 className="text-5xl font-heading font-black text-pakgreen dark:text-white uppercase tracking-tight mb-4">Disclaimer</h1>
        <p className="text-[11px] font-black text-gold-light uppercase tracking-[0.5em]">Legal Notice & Limitations</p>
      </div>

      <div className="bg-white dark:bg-pakgreen-dark/40 backdrop-blur-xl p-10 sm:p-16 rounded-[50px] shadow-2xl border border-zinc-100 dark:border-white/10 space-y-12 text-zinc-600 dark:text-zinc-300">
        <section className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <Info className="h-6 w-6 text-gold" />
            <h2 className="text-2xl font-heading font-black text-pakgreen dark:text-white uppercase">General Information</h2>
          </div>
          <p className="leading-relaxed font-medium">
            The information contained on MM Academy (mmtestpreparation.com) is for general information purposes only. While we endeavor to keep the information up to date and correct, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability with respect to the website or the information, products, services, or related graphics contained on the website for any purpose.
          </p>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <ShieldAlert className="h-6 w-6 text-gold" />
            <h2 className="text-2xl font-heading font-black text-pakgreen dark:text-white uppercase">Educational Purpose</h2>
          </div>
          <p className="leading-relaxed font-medium">
            All materials provided on this site are for educational and preparation purposes only. We do not guarantee success in any specific examination. The results of competitive exams depend on various factors including individual effort and the specific criteria of the examining body.
          </p>
          <p className="leading-relaxed font-medium">
            MM Academy is not affiliated with any government organization, SPSC, HEC, or any other official testing agency. Any mention of these organizations is for the purpose of identifying the relevant exam preparation tracks.
          </p>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <AlertTriangle className="h-6 w-6 text-gold" />
            <h2 className="text-2xl font-heading font-black text-pakgreen dark:text-white uppercase">External Links</h2>
          </div>
          <p className="leading-relaxed font-medium">
            Through this website, you are able to link to other websites which are not under the control of MM Academy. We have no control over the nature, content, and availability of those sites. The inclusion of any links does not necessarily imply a recommendation or endorse the views expressed within them.
          </p>
        </section>

        <div className="pt-12 border-t border-zinc-100 dark:border-white/10 text-center">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Last Updated: March 2026</p>
        </div>
      </div>
    </div>
  );
};

export default Disclaimer;
