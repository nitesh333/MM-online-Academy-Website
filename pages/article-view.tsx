
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Article } from '../types';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, Share2, Tag, Clock, ChevronRight } from 'lucide-react';
import { handleShareArticle } from '../utils/share';
import ReactMarkdown from 'react-markdown';

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
    <div className="min-h-screen bg-zinc-50 dark:bg-pakgreen-deepest pb-24">
      {/* Hero Header */}
      <section className="relative py-24 lg:py-32 bg-pakgreen dark:bg-pakgreen-dark overflow-hidden">
        <div className="absolute inset-0 islamic-pattern opacity-10 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/40 to-transparent" />
        
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gold-light font-black uppercase text-[10px] tracking-[0.3em] mb-12 hover:gap-4 transition-all"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Registry
          </motion.button>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <span className="px-4 py-1.5 bg-gold/20 border border-gold/30 rounded-full text-gold-light text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                {article.category}
              </span>
              <div className="flex items-center gap-2 text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                <Calendar className="h-3 w-3 text-gold" /> {article.date}
              </div>
              <div className="flex items-center gap-2 text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                <User className="h-3 w-3 text-gold" /> {article.author || 'MM Academy Staff'}
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-heading font-black text-white uppercase tracking-tight leading-[0.9] mb-10 drop-shadow-2xl">
              {article.title}
            </h1>
            
            <div className="flex items-center gap-6">
              <button 
                onClick={() => handleShareArticle(article)}
                className="flex items-center gap-3 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white text-[10px] font-black uppercase tracking-widest transition-all backdrop-blur-md"
              >
                <Share2 className="h-4 w-4 text-gold" /> Share Insight
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-6 -mt-16 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-pakgreen-dark/60 backdrop-blur-3xl p-8 md:p-16 rounded-[40px] md:rounded-[60px] shadow-[0_40px_80px_rgba(0,0,0,0.15)] border border-gold/10"
        >
          {article.imageUrl && (
            <div className="w-full aspect-video rounded-[32px] overflow-hidden mb-12 border-4 border-gold/10 shadow-2xl">
              <img src={article.imageUrl} className="w-full h-full object-cover" alt={article.title} />
            </div>
          )}
          
          <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-heading prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-p:text-zinc-600 dark:prose-p:text-zinc-300 prose-p:leading-relaxed prose-strong:text-pakgreen dark:prose-strong:text-gold-light">
            <ReactMarkdown>{article.content}</ReactMarkdown>
          </div>

          {article.seoKeywords && (
            <div className="mt-12 flex flex-wrap gap-3">
              {article.seoKeywords.split(',').map((tag, i) => (
                <span key={i} className="flex items-center gap-2 px-4 py-2 bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-gold transition-colors cursor-default">
                  <Tag className="h-3 w-3 text-gold" /> {tag.trim()}
                </span>
              ))}
            </div>
          )}
          
          <div className="mt-20 pt-12 border-t border-zinc-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-pakgreen dark:bg-gold rounded-full flex items-center justify-center text-white dark:text-pakgreen font-black">MM</div>
              <div>
                <p className="text-pakgreen dark:text-white font-black uppercase text-[11px] tracking-widest">MM Academy Editorial</p>
                <p className="text-zinc-400 text-[9px] font-bold uppercase tracking-widest">Verified Content</p>
              </div>
            </div>
            <button 
              onClick={() => handleShareArticle(article)}
              className="p-4 bg-zinc-50 dark:bg-white/5 hover:bg-gold/10 rounded-2xl transition-all group"
            >
              <Share2 className="h-6 w-6 text-zinc-400 group-hover:text-gold" />
            </button>
          </div>
        </motion.div>
        
        {/* Related Articles / Next Steps */}
        <div className="mt-24 space-y-12">
           <div className="flex items-center justify-between">
              <h3 className="text-2xl font-heading font-black text-pakgreen dark:text-white uppercase tracking-tight">More Insights</h3>
              <button onClick={() => navigate('/')} className="text-[10px] font-black text-gold uppercase tracking-[0.3em] flex items-center gap-2 hover:gap-4 transition-all">
                View All <ChevronRight className="h-4 w-4" />
              </button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {articles.filter(a => a.id !== article.id).slice(0, 2).map(a => (
                <div 
                  key={a.id}
                  onClick={() => navigate(`/article/${a.id}`)}
                  className="bg-white dark:bg-pakgreen-dark/30 p-8 rounded-[40px] border border-gold/10 hover:border-gold-light transition-all cursor-pointer group"
                >
                  <span className="text-[9px] font-black text-gold uppercase tracking-widest mb-4 block">{a.category}</span>
                  <h4 className="text-lg font-heading font-black text-pakgreen dark:text-white uppercase mb-6 group-hover:text-gold transition-colors line-clamp-2">{a.title}</h4>
                  <div className="flex items-center gap-2 text-[10px] font-black text-gold-light uppercase tracking-widest">
                    Read Article <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleView;
