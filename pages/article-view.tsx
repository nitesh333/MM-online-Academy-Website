
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Article } from '../types';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, Share2, Tag, Clock, ChevronRight } from 'lucide-react';
import { handleShareArticle } from '../utils/share';
import ReactMarkdown from 'react-markdown';
import AdSlot from '../components/ad-banner';

const ArticleView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { articles, isLoading } = useData();
  const [article, setArticle] = useState<Article | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (id && articles.length > 0) {
      const found = articles.find(a => a.id === id);
      if (found) setArticle(found);
    }
  }, [id, articles]);

  useEffect(() => {
    if (article) {
      document.title = `${article.title} - MM Academy Insights`;
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', article.content.substring(0, 150).replace(/[#*`]/g, '') + '...');
      }
      
      // Add keywords
      if (article.seoKeywords) {
        let metaKeywords = document.querySelector('meta[name="keywords"]');
        if (!metaKeywords) {
          metaKeywords = document.createElement('meta');
          metaKeywords.setAttribute('name', 'keywords');
          document.head.appendChild(metaKeywords);
        }
        metaKeywords.setAttribute('content', article.seoKeywords);
      }
    }
    return () => {
      document.title = 'MM Academy - Pakistan\'s Elite Legal Portal';
    };
  }, [article]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-pakgreen-deepest">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-pakgreen-deepest p-6">
        <h2 className="text-3xl font-heading font-black text-pakgreen dark:text-white uppercase mb-6">Article Not Found</h2>
        <button 
          onClick={() => navigate('/')}
          className="px-8 py-4 bg-pakgreen dark:bg-gold text-white dark:text-pakgreen rounded-2xl font-black uppercase text-xs tracking-widest"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-pakgreen-deepest pb-24">
      {/* 1. Article Title, Author, and Date */}
      <section className="pt-32 pb-16 bg-zinc-50 dark:bg-pakgreen-dark/20 border-b border-gold/10">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <span className="px-4 py-1.5 bg-gold/10 border border-gold/20 rounded-full text-gold text-[10px] font-black uppercase tracking-widest">
                {article.category}
              </span>
              <div className="flex items-center gap-2 text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                <Calendar className="h-3 w-3 text-gold" /> {article.date}
              </div>
              <div className="flex items-center gap-2 text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                <User className="h-3 w-3 text-gold" /> {article.author || 'MM Academy Staff'}
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-heading font-black text-pakgreen dark:text-white uppercase tracking-tight leading-tight mb-8">
              {article.title}
            </h1>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => handleShareArticle(article)}
                className="flex items-center gap-2 text-[10px] font-black text-gold uppercase tracking-widest hover:underline"
              >
                <Share2 className="h-4 w-4" /> Share Article
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Sidebar for Table of Contents */}
        <aside className="lg:col-span-3 hidden lg:block">
          <div className="sticky top-32 p-8 bg-zinc-50 dark:bg-pakgreen-dark/20 rounded-[32px] border border-gold/10">
            <h3 className="text-xs font-black text-gold uppercase tracking-widest mb-6">Table of Contents</h3>
            <div className="space-y-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">
              <p className="cursor-pointer hover:text-gold transition-colors">Introduction</p>
              <p className="cursor-pointer hover:text-gold transition-colors">Key Concepts</p>
              <p className="cursor-pointer hover:text-gold transition-colors">Detailed Analysis</p>
              <p className="cursor-pointer hover:text-gold transition-colors">Conclusion</p>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="lg:col-span-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-heading prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-p:text-zinc-600 dark:prose-p:text-zinc-300 prose-p:leading-relaxed prose-strong:text-pakgreen dark:prose-strong:text-gold"
          >
            <ReactMarkdown>{article.content}</ReactMarkdown>
          </motion.div>

          {/* Key Takeaways Section */}
          <section className="mt-16 p-10 bg-gold/5 border-2 border-dashed border-gold/20 rounded-[40px]">
            <h3 className="text-xl font-heading font-black text-pakgreen dark:text-gold uppercase mb-6">Key Takeaways</h3>
            <ul className="space-y-4 text-sm text-zinc-600 dark:text-zinc-300 font-medium">
              <li>Comprehensive understanding of the subject matter.</li>
              <li>Practical application of key concepts in real-world scenarios.</li>
              <li>Critical analysis and expert insights for advanced learning.</li>
            </ul>
          </section>

          {/* Comments/Feedback Placeholder */}
          <section className="mt-24 pt-12 border-t border-gold/10">
            <h3 className="text-xl font-heading font-black text-pakgreen dark:text-white uppercase mb-8">Comments & Feedback</h3>
            <div className="p-12 bg-zinc-50 dark:bg-pakgreen-dark/20 rounded-[40px] text-center">
              <p className="text-xs text-zinc-400 font-black uppercase tracking-widest">
                Discussion section is currently under moderation.
              </p>
            </div>
          </section>
        </main>

        {/* Right Sidebar for Related Content */}
        <aside className="lg:col-span-3 space-y-12">
          <div>
            <h3 className="text-xs font-black text-gold uppercase tracking-widest mb-8">Related Articles</h3>
            <div className="space-y-6">
              {articles.filter(a => a.id !== article.id).slice(0, 3).map(a => (
                <div 
                  key={a.id}
                  onClick={() => navigate(`/article/${a.id}`)}
                  className="p-6 bg-white dark:bg-pakgreen-dark/30 border border-gold/10 rounded-3xl hover:border-gold transition-all cursor-pointer group"
                >
                  <h4 className="text-sm font-heading font-black text-pakgreen dark:text-white uppercase group-hover:text-gold transition-colors line-clamp-2">{a.title}</h4>
                  <div className="mt-4 flex items-center gap-2 text-[9px] font-black text-gold uppercase tracking-widest">
                    Read More <ChevronRight className="h-3 w-3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <AdSlot placement="sidebar" privateAds={[]} />
        </aside>
      </div>
    </div>
  );
};

export default ArticleView;
