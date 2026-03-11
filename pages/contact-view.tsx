
import React, { useState } from 'react';
import { Mail, Send, Sparkles, MessageSquare, Phone, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { dataService } from '../services/dataService';

const ContactView: React.FC = () => {
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;
    
    setIsSubmitting(true);
    try {
      await dataService.saveQuizFeedback({
        id: `inquiry_${Date.now()}`,
        quizId: 'academic_inquiry',
        quizTitle: 'Contact Form Inquiry',
        studentName: contactForm.name,
        studentEmail: contactForm.email,
        comment: contactForm.message,
        date: new Date().toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' }),
        isVisible: false
      });
      setSubmitStatus('success');
      setContactForm({ name: '', email: '', message: '' });
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } catch (error) {
      console.error('Contact error:', error);
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-20 items-center animate-in slide-in-from-bottom-10">
       <div className="space-y-12">
          <div>
             <span className="text-gold font-black uppercase text-[12px] tracking-[0.5em] mb-4 block">Communication</span>
             <h2 className="text-6xl font-heading font-black text-pakgreen dark:text-white uppercase tracking-tight leading-[0.9] mb-8">
                Get In <span className="text-gold-light">Touch</span>
             </h2>
             <p className="text-xl text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed max-w-lg">
                Have questions about our preparation tracks or need technical assistance? Our team is here to help you navigate your academic journey.
             </p>
          </div>
          <div className="space-y-8">
             <div className="flex items-center gap-6 group">
                <div className="h-16 w-16 bg-pakgreen/10 dark:bg-gold/10 rounded-2xl flex items-center justify-center border border-gold/20 group-hover:scale-110 transition-transform">
                   <Mail className="h-8 w-8 text-gold-light" />
                </div>
                <div>
                   <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Email Support</p>
                   <p className="text-xl font-black text-pakgreen dark:text-white">mmacademy26@gmail.com</p>
                </div>
             </div>
             <div className="flex items-center gap-6 group">
                <div className="h-16 w-16 bg-pakgreen/10 dark:bg-gold/10 rounded-2xl flex items-center justify-center border border-gold/20 group-hover:scale-110 transition-transform">
                   <Phone className="h-8 w-8 text-gold-light" />
                </div>
                <div>
                   <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Direct Line</p>
                   <p className="text-xl font-black text-pakgreen dark:text-white">03182990927</p>
                </div>
             </div>
             <div className="flex items-center gap-6 group">
                <div className="h-16 w-16 bg-pakgreen/10 dark:bg-gold/10 rounded-2xl flex items-center justify-center border border-gold/20 group-hover:scale-110 transition-transform">
                   <MapPin className="h-8 w-8 text-gold-light" />
                </div>
                <div>
                   <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Headquarters</p>
                   <p className="text-xl font-black text-pakgreen dark:text-white">Mirpurkhas, Sindh, Pakistan</p>
                </div>
             </div>
          </div>
       </div>
       <div className="bg-white dark:bg-pakgreen-dark/50 backdrop-blur-xl p-12 rounded-[50px] shadow-2xl border border-zinc-100 dark:border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
             <MessageSquare className="h-32 w-32 text-gold" />
          </div>
          <form onSubmit={handleContactSubmit} className="space-y-8 relative z-10">
             <div className="space-y-4">
                <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest px-4">Full Name</label>
                <input 
                  type="text" 
                  required 
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  placeholder="Enter your name" 
                  className="w-full px-8 py-6 bg-zinc-50 dark:bg-white/5 border-2 border-transparent focus:border-gold/30 rounded-3xl outline-none text-pakgreen dark:text-white font-bold transition-all placeholder:text-zinc-300" 
                />
             </div>
             <div className="space-y-4">
                <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest px-4">Email Address</label>
                <input 
                  type="email" 
                  required 
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  placeholder="Enter your email" 
                  className="w-full px-8 py-6 bg-zinc-50 dark:bg-white/5 border-2 border-transparent focus:border-gold/30 rounded-3xl outline-none text-pakgreen dark:text-white font-bold transition-all placeholder:text-zinc-300" 
                />
             </div>
             <div className="space-y-4">
                <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest px-4">Your Message</label>
                <textarea 
                  required 
                  rows={5} 
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  placeholder="How can we help you?" 
                  className="w-full px-8 py-6 bg-zinc-50 dark:bg-white/5 border-2 border-transparent focus:border-gold/30 rounded-3xl outline-none text-pakgreen dark:text-white font-bold transition-all resize-none placeholder:text-zinc-300"
                ></textarea>
             </div>
             
             {submitStatus === 'success' && (
               <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-200 dark:border-emerald-500/20 animate-in fade-in slide-in-from-top-2">
                 <CheckCircle2 className="h-5 w-5" />
                 <span className="text-[11px] font-black uppercase tracking-widest">Message dispatched successfully!</span>
               </div>
             )}

             {submitStatus === 'error' && (
               <div className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl border border-rose-200 dark:border-rose-500/20 animate-in fade-in slide-in-from-top-2">
                 <AlertCircle className="h-5 w-5" />
                 <span className="text-[11px] font-black uppercase tracking-widest">Transmission failed. Please retry.</span>
               </div>
             )}

             <button 
               type="submit" 
               disabled={isSubmitting}
               className="w-full py-8 bg-pakgreen dark:bg-gold text-white dark:text-pakgreen rounded-3xl text-[14px] font-black uppercase tracking-[0.2em] shadow-2xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed group"
             >
                {isSubmitting ? (
                  <div className="h-6 w-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="h-6 w-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> 
                    Dispatch Inquiry
                  </>
                )}
             </button>
          </form>
       </div>
    </div>
  );
};

export default ContactView;
