
import React from 'react';
import { Shield, Lock, Eye, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24 animate-in fade-in slide-in-from-bottom-10">
      <div className="text-center mb-16">
        <div className="h-20 w-20 bg-gold/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-gold/20">
          <Shield className="h-10 w-10 text-gold" />
        </div>
        <h1 className="text-5xl font-heading font-black text-pakgreen dark:text-white uppercase tracking-tight mb-4">Privacy Policy</h1>
        <p className="text-[11px] font-black text-gold-light uppercase tracking-[0.5em]">Neural Data Protection Protocol</p>
      </div>

      <div className="bg-white dark:bg-pakgreen-dark/40 backdrop-blur-xl p-10 sm:p-16 rounded-[50px] shadow-2xl border border-zinc-100 dark:border-white/10 space-y-12 text-zinc-600 dark:text-zinc-300">
        <section className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <Eye className="h-6 w-6 text-gold" />
            <h2 className="text-2xl font-heading font-black text-pakgreen dark:text-white uppercase">Information We Collect</h2>
          </div>
          <p className="leading-relaxed font-medium">
            At MM Academy, we collect several types of information for various purposes to provide and improve our Service to you. This includes:
          </p>
          <ul className="list-disc pl-6 space-y-2 font-medium">
            <li>Log Data: Information that your browser sends whenever you visit our website.</li>
            <li>Cookies: We use cookies and similar tracking technologies to track the activity on our Service and hold certain information.</li>
            <li>Personal Data: While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you (e.g., email address for inquiries).</li>
          </ul>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <Lock className="h-6 w-6 text-gold" />
            <h2 className="text-2xl font-heading font-black text-pakgreen dark:text-white uppercase">Google AdSense & DoubleClick Cookie</h2>
          </div>
          <p className="leading-relaxed font-medium">
            Google, as a third-party vendor, uses cookies to serve ads on our Service. Google's use of the DoubleClick cookie enables it and its partners to serve ads to our users based on their visit to our Service or other websites on the Internet.
          </p>
          <p className="leading-relaxed font-medium">
            You may opt out of the use of the DoubleClick Cookie for interest-based advertising by visiting the <a href="https://www.google.com/ads/preferences/" className="text-gold hover:underline" target="_blank" rel="noopener noreferrer">Google Ads Settings</a> web page.
          </p>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <Shield className="h-6 w-6 text-gold" />
            <h2 className="text-2xl font-heading font-black text-pakgreen dark:text-white uppercase">Third-Party Privacy Policies</h2>
          </div>
          <p className="leading-relaxed font-medium">
            MM Academy's Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their practices and instructions about how to opt-out of certain options.
          </p>
        </section>

        <div className="pt-12 border-t border-zinc-100 dark:border-white/10 text-center">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Last Updated: March 2026</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
