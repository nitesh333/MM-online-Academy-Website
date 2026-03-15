
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Article } from '../types';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Download, HelpCircle, ChevronRight, Share2, Calendar, Tag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import AdSlot from '../components/ad-banner';
import { handleShareArticle } from '../utils/share';

const StudyGuideDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { articles, isLoading } = useData();
  const [guide, setGuide] = useState<Article | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (id && articles.length > 0) {
      const found = articles.find(a => a.id === id);
      if (found) setGuide(found);
    }
  }, [id, articles]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-pakgreen-deepest">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-pakgreen-deepest p-6">
        <h2 className="text-3xl font-heading font-black text-pakgreen dark:text-white uppercase mb-6">Guide Not Found</h2>
        <button 
          onClick={() => navigate('/study-guides')}
          className="px-8 py-4 bg-pakgreen dark:bg-gold text-white dark:text-pakgreen rounded-2xl font-black uppercase text-xs tracking-widest"
        >
          Back to Study Guides
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-pakgreen-deepest pb-24">
      {/* 1. Guide Title and Subject Category */}
      <section className="pt-32 pb-16 bg-zinc-50 dark:bg-pakgreen-dark/20 border-b border-gold/10">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button 
              onClick={() => navigate('/study-guides')}
              className="flex items-center gap-2 text-[10px] font-black text-gold uppercase tracking-[0.3em] mb-8 hover:gap-4 transition-all"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Guides
            </button>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gold/10 rounded-xl text-gold">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="text-xs font-black text-gold uppercase tracking-widest">{guide.category}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-heading font-black text-pakgreen dark:text-white uppercase tracking-tight leading-tight mb-8">
              {guide.title}
            </h1>
            <div className="flex flex-wrap items-center gap-8">
              <div className="flex items-center gap-2 text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                <Calendar className="h-3 w-3 text-gold" /> Updated: {guide.date}
              </div>
              <button 
                onClick={() => handleShareArticle(guide)}
                className="flex items-center gap-2 text-[10px] font-black text-gold uppercase tracking-widest hover:underline"
              >
                <Share2 className="h-4 w-4" /> Share Guide
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Main Content Area */}
        <main className="lg:col-span-8">
          {/* 2. Introduction Placeholder */}
          <section className="mb-16 p-10 bg-zinc-50 dark:bg-pakgreen-dark/20 rounded-[40px] border border-gold/10">
            <h3 className="text-xs font-black text-gold uppercase tracking-widest mb-6">Introduction</h3>
            <p className="text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium italic">
              This study guide provides a comprehensive overview of {guide.title}. It is designed to help students understand the core principles, key terminology, and practical applications of this topic within the {guide.category} curriculum.
            </p>
          </section>

          {/* 3. Step-by-Step Guide or Structured Content */}
          <section className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-heading prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-p:text-zinc-600 dark:prose-p:text-zinc-300 prose-p:leading-relaxed prose-strong:text-pakgreen dark:prose-strong:text-gold">
            <ReactMarkdown>{guide.content}</ReactMarkdown>
          </section>

          {/* 4. Downloadable Resources Placeholder */}
          <section className="mt-16 p-10 bg-pakgreen dark:bg-gold rounded-[40px] text-white dark:text-pakgreen flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-2xl font-heading font-black uppercase mb-2">Download Study Materials</h3>
              <p className="text-sm opacity-80 font-medium">Get the offline version of this guide and extra practice sheets.</p>
            </div>
            <button className="flex items-center gap-3 px-8 py-4 bg-white dark:bg-pakgreen text-pakgreen dark:text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-transform">
              <Download className="h-5 w-5" /> Download PDF
            </button>
          </section>

          {/* 5. FAQ Section Placeholder */}
          <section className="mt-24">
            <div className="flex items-center gap-4 mb-12">
              <HelpCircle className="h-8 w-8 text-gold" />
              <h3 className="text-3xl font-heading font-black text-pakgreen dark:text-white uppercase tracking-tight">Frequently Asked Questions</h3>
            </div>
            <div className="space-y-6">
              {[
                { q: `What is the best way to study ${guide.category}?`, a: "Consistency is key. We recommend daily practice and reviewing core concepts regularly." },
                { q: "Are these materials updated for the latest exams?", a: "Yes, our team of experts ensures all content is aligned with the most recent curriculum and exam patterns." },
                { q: "Can I access these guides offline?", a: "You can download the PDF version of our study guides for offline access anytime." }
              ].map((faq, i) => (
                <div key={i} className="p-8 bg-zinc-50 dark:bg-pakgreen-dark/20 rounded-3xl border border-gold/10">
                  <h4 className="text-sm font-black text-pakgreen dark:text-gold uppercase tracking-widest mb-4">
                    {faq.q}
                  </h4>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </main>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-12">
          <div className="sticky top-32 space-y-12">
            <AdSlot placement="sidebar" privateAds={[]} />
            
            {/* 6. Related Study Guides */}
            <div>
              <h3 className="text-xs font-black text-gold uppercase tracking-widest mb-8">Related Study Guides</h3>
              <div className="space-y-6">
                {articles.filter(a => a.id !== guide.id).slice(0, 3).map(a => (
                  <div 
                    key={a.id}
                    onClick={() => navigate(`/study-guide/${a.id}`)}
                    className="p-6 bg-white dark:bg-pakgreen-dark/30 border border-gold/10 rounded-3xl hover:border-gold transition-all cursor-pointer group"
                  >
                    <span className="text-[9px] font-black text-gold uppercase tracking-widest mb-2 block">{a.category}</span>
                    <h4 className="text-sm font-heading font-black text-pakgreen dark:text-white uppercase group-hover:text-gold transition-colors line-clamp-2">{a.title}</h4>
                    <div className="mt-4 flex items-center gap-2 text-[9px] font-black text-gold uppercase tracking-widest">
                      View Guide <ChevronRight className="h-3 w-3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 bg-gold/5 border border-gold/20 rounded-[32px]">
              <h3 className="text-xs font-black text-gold uppercase tracking-widest mb-4">Need Help?</h3>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase leading-relaxed mb-6">
                Our academic advisors are available to help you with your studies.
              </p>
              <button 
                onClick={() => navigate('/contact')}
                className="w-full py-4 bg-pakgreen dark:bg-gold text-white dark:text-pakgreen rounded-xl font-black uppercase text-[10px] tracking-widest"
              >
                Contact Us
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default StudyGuideDetail;
