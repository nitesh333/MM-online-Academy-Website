
import React from 'react';
import { BookOpen, GraduationCap, Target, MapPin, Mail, Phone } from 'lucide-react';

const AboutView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24 animate-in fade-in slide-in-from-bottom-10">
      <div className="text-center mb-16">
        <div className="h-20 w-20 bg-gold/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-gold/20">
          <BookOpen className="h-10 w-10 text-gold" />
        </div>
        <h1 className="text-5xl font-heading font-black text-pakgreen dark:text-white uppercase tracking-tight mb-4">About MM Academy</h1>
        <p className="text-xs font-black text-gold-light uppercase tracking-[0.5em]">Pakistan's Elite Test Preparation Portal</p>
      </div>

      <div className="bg-white dark:bg-pakgreen-dark/40 backdrop-blur-xl p-10 sm:p-16 rounded-[50px] shadow-2xl border border-zinc-100 dark:border-white/10 space-y-12 text-zinc-600 dark:text-zinc-300">
        <section className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <GraduationCap className="h-6 w-6 text-gold" />
            <h2 className="text-2xl font-heading font-black text-pakgreen dark:text-white uppercase">Our Story & Mission</h2>
          </div>
          <p className="leading-relaxed font-medium">
            MM Academy (mmtestpreparation.com) was established with a clear vision: to democratize high-quality test preparation for every student in Pakistan. We understand the challenges of competitive exams like SPSC, MDCAT, and ECAT, and we are here to bridge the gap between hard work and success.
          </p>
          <p className="leading-relaxed font-medium">
            Our mission is to provide a comprehensive, user-friendly, and highly effective digital learning environment. We believe that with the right guidance and resources, every student has the potential to excel in their chosen field.
          </p>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <Target className="h-6 w-6 text-gold" />
            <h2 className="text-2xl font-heading font-black text-pakgreen dark:text-white uppercase">Why Choose MM Academy?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 bg-zinc-50 dark:bg-white/5 rounded-3xl border border-gold/10">
              <h4 className="font-black uppercase text-xs text-gold mb-2">Expert Curated Content</h4>
              <p className="text-xs leading-relaxed">Our MCQs and notes are designed by subject matter experts with years of experience in Pakistani competitive exams.</p>
            </div>
            <div className="p-6 bg-zinc-50 dark:bg-white/5 rounded-3xl border border-gold/10">
              <h4 className="font-black uppercase text-xs text-gold mb-2">Real-Time Mock Tests</h4>
              <p className="text-xs leading-relaxed">Experience the actual exam environment with our timed practice tests and instant performance analysis.</p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-zinc-100 dark:border-white/10">
          <div className="text-center space-y-2">
            <MapPin className="h-6 w-6 text-gold mx-auto" />
            <p className="text-xs font-black uppercase text-zinc-400">Location</p>
            <p className="text-xs font-bold text-pakgreen dark:text-white">Mirpurkhas, Sindh</p>
          </div>
          <div className="text-center space-y-2">
            <Mail className="h-6 w-6 text-gold mx-auto" />
            <p className="text-xs font-black uppercase text-zinc-400">Email</p>
            <p className="text-xs font-bold text-pakgreen dark:text-white">mmonlineacademy26@gmail.com</p>
          </div>
          <div className="text-center space-y-2">
            <Phone className="h-6 w-6 text-gold mx-auto" />
            <p className="text-xs font-black uppercase text-zinc-400">Phone</p>
            <p className="text-xs font-bold text-pakgreen dark:text-white">+92-318-2990927</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutView;
