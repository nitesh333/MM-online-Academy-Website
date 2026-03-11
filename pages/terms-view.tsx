
import React from 'react';
import { Scale, FileCheck, AlertTriangle, Copyright } from 'lucide-react';

const TermsView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24 animate-in fade-in slide-in-from-bottom-10">
      <div className="text-center mb-16">
        <div className="h-20 w-20 bg-gold/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-gold/20">
          <Scale className="h-10 w-10 text-gold" />
        </div>
        <h1 className="text-5xl font-heading font-black text-pakgreen dark:text-white uppercase tracking-tight mb-4">Terms & Conditions</h1>
        <p className="text-[11px] font-black text-gold-light uppercase tracking-[0.5em]">Usage Agreement</p>
      </div>

      <div className="bg-white dark:bg-pakgreen-dark/40 backdrop-blur-xl p-10 sm:p-16 rounded-[50px] shadow-2xl border border-zinc-100 dark:border-white/10 space-y-12 text-zinc-600 dark:text-zinc-300">
        <section className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <FileCheck className="h-6 w-6 text-gold" />
            <h2 className="text-2xl font-heading font-black text-pakgreen dark:text-white uppercase">Acceptance of Terms</h2>
          </div>
          <p className="leading-relaxed font-medium">
            By accessing and using MM Academy (mmtestpreparation.com), you accept and agree to be bound by the terms and provision of this agreement. In addition, when using this website's particular services, you shall be subject to any posted guidelines or rules applicable to such services.
          </p>
          <p className="leading-relaxed font-medium">
            Any participation in this service will constitute acceptance of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <Copyright className="h-6 w-6 text-gold" />
            <h2 className="text-2xl font-heading font-black text-pakgreen dark:text-white uppercase">Intellectual Property Rights</h2>
          </div>
          <p className="leading-relaxed font-medium">
            The Site and its original content, features, and functionality are owned by MM Academy and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
          </p>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <AlertTriangle className="h-6 w-6 text-gold" />
            <h2 className="text-2xl font-heading font-black text-pakgreen dark:text-white uppercase">Termination</h2>
          </div>
          <p className="leading-relaxed font-medium">
            We may terminate your access to the Site, without cause or notice, which may result in the forfeiture and destruction of all information associated with you. All provisions of this Agreement that by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
          </p>
        </section>

        <div className="pt-12 border-t border-zinc-100 dark:border-white/10 text-center">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Effective Date: March 2026</p>
        </div>
      </div>
    </div>
  );
};

export default TermsView;
