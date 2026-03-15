
import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../context/DataContext';
import AdSlot from '../components/ad-banner';
import QuizSlider from '../components/quiz-slider';
import QuestionOfTheDay from '../components/question-of-the-day';
import { Megaphone, BookOpen, Star, ArrowRight, Share2, Sparkles, PlayCircle, ChevronRight, Search, Filter, Activity, Users, Trophy } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { handleShareNews } from '../utils/share';
import { motion, AnimatePresence } from 'framer-motion';
import { HomepageSettings } from '../types';

interface HomeProps {
  setActiveImage: (url: string | null) => void;
}

const Home: React.FC<HomeProps> = ({ setActiveImage }) => {
  const { notifications, categories, ads, articles, quizzes, isLoading } = useData();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const homepageSettings = useMemo(() => {
    const settingsArt = articles.find(a => a.id === 'homepage_settings');
    if (settingsArt) {
      try {
        return JSON.parse(settingsArt.content) as HomepageSettings;
      } catch (e) {
        console.error("Failed to parse homepage settings", e);
        return null;
      }
    }
    return null;
  }, [articles]);

  const heroTitle = homepageSettings?.heroTitle || "MM Academy";
  const heroDescription = homepageSettings?.heroDescription || "MM Academy is a comprehensive digital learning environment designed to help students master competitive exams through expert-curated materials, real-time assessments, and strategic study guides.";
  const ctaText = homepageSettings?.ctaText || "Explore Subjects";
  const ctaLink = homepageSettings?.ctaLink || "/subjects";
  const footerDescription = homepageSettings?.footerDescription || "MM Academy is an independent educational platform dedicated to supporting students in Pakistan. Our content is designed for informational and preparatory purposes, helping learners navigate competitive examinations with confidence. We are committed to educational excellence and providing accessible resources for all.";

  return (
    <div className="overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative py-8 lg:py-12 bg-white dark:bg-pakgreen-deepest border-b border-gold/10 overflow-hidden scanline">
        <div className="absolute top-0 left-0 w-full h-full islamic-pattern opacity-5 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/5 border border-gold/20 rounded-full mb-6">
              <Star className="h-4 w-4 text-gold fill-current" />
              <span className="text-[10px] font-black text-pakgreen dark:text-gold-light uppercase tracking-widest">Pakistan's Premier Educational Portal</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-heading font-black text-pakgreen dark:text-white uppercase tracking-tight mb-6 leading-tight">
              {heroTitle}
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 text-base mb-8 max-w-2xl mx-auto leading-relaxed font-medium">
              {heroDescription}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button onClick={() => navigate(ctaLink)} className="px-8 py-4 bg-pakgreen dark:bg-gold text-white dark:text-pakgreen rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:scale-105 transition-all">
                {ctaText}
              </button>
              <button onClick={() => navigate('/exam-preparation')} className="px-8 py-4 border-2 border-pakgreen/20 dark:border-gold/20 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all hover:bg-gold/5">
                Exam Preparation
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 1.5 LATEST NEWS & NOTIFICATIONS */}
      <section className="bg-gold/5 py-12 border-b border-gold/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gold/20 rounded-lg text-gold">
                <Megaphone className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-heading font-black text-pakgreen dark:text-white uppercase tracking-tight">Latest News & Updates</h2>
            </div>
            <Link to="/news" className="text-[10px] font-black text-gold uppercase tracking-widest hover:underline">View All News</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notifications.slice(0, 3).map(news => (
              <div 
                key={news.id} 
                onClick={() => navigate(`/news/${news.id}`)}
                className="p-6 bg-white dark:bg-pakgreen-dark/40 rounded-3xl border border-gold/10 hover:border-gold transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-gold/10 text-gold text-[8px] font-black uppercase tracking-widest rounded-full">
                    {news.date}
                  </span>
                  <Share2 
                    className="h-4 w-4 text-zinc-400 hover:text-gold transition-colors" 
                    onClick={(e) => { e.stopPropagation(); handleShareNews(news); }}
                  />
                </div>
                <h3 className="text-sm font-heading font-black text-pakgreen dark:text-white uppercase mb-2 group-hover:text-gold transition-colors line-clamp-2">
                  {news.title}
                </h3>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2">
                  {news.content}
                </p>
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="col-span-full text-center py-8">
                <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">No recent news available.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* QUESTION OF THE DAY */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <QuestionOfTheDay />
      </section>

      {/* 2. FEATURED CATEGORIES */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <span className="text-gold font-black uppercase text-[12px] tracking-[0.5em] mb-4 block">Discovery</span>
          <h2 className="text-4xl font-heading font-black text-pakgreen dark:text-white uppercase tracking-tight">Featured Categories</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.slice(0, 3).map((cat, idx) => (
            <div key={cat.id} className="p-10 bg-white dark:bg-pakgreen-dark/30 border border-gold/10 rounded-[40px] hover:border-gold transition-all cursor-pointer group shadow-xl">
              <div className="w-16 h-16 bg-gold/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-gold group-hover:text-pakgreen transition-all">
                <BookOpen className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-heading font-black text-pakgreen dark:text-white uppercase mb-4">{cat.name}</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-8 line-clamp-2">{cat.description}</p>
              <Link key={cat.id} to={`/category/${cat.id}`} className="flex items-center gap-2 text-gold font-black text-[10px] uppercase tracking-widest">
                View Category <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 3. POPULAR SUBJECTS */}
      <section className="bg-zinc-50 dark:bg-pakgreen-dark/20 py-24 border-y border-gold/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-16">
            <div>
              <span className="text-gold font-black uppercase text-[12px] tracking-[0.5em] mb-4 block">Knowledge Base</span>
              <h2 className="text-4xl font-heading font-black text-pakgreen dark:text-white uppercase tracking-tight">Popular Subjects</h2>
            </div>
            <Link to="/subjects" className="text-[10px] font-black text-gold uppercase tracking-widest hover:underline">View All Subjects</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.slice(3, 7).map(cat => (
              <Link key={cat.id} to={`/category/${cat.id}`} className="p-6 bg-white dark:bg-pakgreen-deepest border border-gold/5 rounded-3xl hover:border-gold transition-all text-center group">
                <h4 className="text-sm font-black text-pakgreen dark:text-white uppercase group-hover:text-gold transition-colors">{cat.name}</h4>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. STUDY RESOURCES */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-gold font-black uppercase text-[12px] tracking-[0.5em] mb-4 block">Learning Materials</span>
            <h2 className="text-5xl font-heading font-black text-pakgreen dark:text-white uppercase tracking-tight mb-8">Study Resources</h2>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-12 font-medium">
              Access a vast collection of downloadable PDF notes, interactive practice modules, and comprehensive reference materials designed to support your academic journey.
            </p>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gold/10 rounded-xl text-gold"><Sparkles className="h-5 w-5" /></div>
                <div>
                  <h4 className="text-sm font-black text-pakgreen dark:text-white uppercase mb-1">Curated PDF Notes</h4>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Expert-written summaries for quick revision.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gold/10 rounded-xl text-gold"><Activity className="h-5 w-5" /></div>
                <div>
                  <h4 className="text-sm font-black text-pakgreen dark:text-white uppercase mb-1">Interactive Modules</h4>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Engage with dynamic content for better retention.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-pakgreen dark:bg-pakgreen-dark rounded-[60px] p-12 border-8 border-gold/10 relative overflow-hidden">
            <div className="absolute inset-0 islamic-pattern opacity-10" />
            <div className="relative z-10">
              <BookOpen className="h-16 w-16 text-gold mb-8" />
              <h3 className="text-white text-3xl font-heading font-black uppercase mb-4">Resource Library</h3>
              <p className="text-zinc-300 text-xs leading-relaxed mb-8">Explore our full directory of educational assets.</p>
              <button onClick={() => navigate('/resources')} className="px-8 py-4 bg-gold text-pakgreen rounded-xl font-black uppercase text-[10px] tracking-widest">Browse Library</button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. EXAM PREPARATION GUIDES */}
      <section className="bg-pakgreen dark:bg-pakgreen-dark py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-gold font-black uppercase text-[12px] tracking-[0.5em] mb-4 block">Strategic Success</span>
            <h2 className="text-4xl font-heading font-black text-white uppercase tracking-tight">Exam Preparation Guides</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-10 bg-white/5 border border-white/10 rounded-[40px] hover:border-gold transition-all">
              <h3 className="text-2xl font-heading font-black text-gold uppercase mb-4">Preparation Strategy</h3>
              <p className="text-zinc-300 text-xs leading-relaxed mb-8">Detailed roadmaps and time-management techniques to help you navigate complex examination structures effectively.</p>
              <Link to="/study-guides" className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">Read Guide <ChevronRight className="h-4 w-4" /></Link>
            </div>
            <div className="p-10 bg-white/5 border border-white/10 rounded-[40px] hover:border-gold transition-all">
              <h3 className="text-2xl font-heading font-black text-gold uppercase mb-4">Subject Mastery</h3>
              <p className="text-zinc-300 text-xs leading-relaxed mb-8">Focused guides on core subjects, highlighting key concepts and frequently asked questions in major national exams.</p>
              <Link to="/study-guides" className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">Read Guide <ChevronRight className="h-4 w-4" /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. LATEST CONTENT */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex justify-between items-end mb-16">
          <div>
            <span className="text-gold font-black uppercase text-[12px] tracking-[0.5em] mb-4 block">Updates</span>
            <h2 className="text-4xl font-heading font-black text-pakgreen dark:text-white uppercase tracking-tight">Latest Content</h2>
          </div>
          <Link to="/registry" className="text-[10px] font-black text-gold uppercase tracking-widest hover:underline">View All Content</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.slice(0, 3).map(art => (
            <div key={art.id} onClick={() => navigate(`/article/${art.id}`)} className="bg-white dark:bg-pakgreen-dark/40 p-8 rounded-[40px] border border-gold/10 shadow-xl hover:border-gold transition-all cursor-pointer group">
              <span className="text-[9px] font-black text-gold uppercase tracking-widest mb-4 block">{art.category}</span>
              <h4 className="text-lg font-heading font-black text-pakgreen dark:text-white uppercase mb-4 group-hover:text-gold transition-colors line-clamp-2">{art.title}</h4>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-3 mb-6">{art.content.substring(0, 100)}...</p>
              <div className="flex items-center gap-2 text-[9px] font-black text-gold uppercase tracking-widest">Read More <ArrowRight className="h-3 w-3" /></div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="bg-gold p-16 rounded-[60px] text-center relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 islamic-pattern opacity-10" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-heading font-black text-pakgreen uppercase mb-8 leading-none">Ready to Excel?</h2>
            <p className="text-pakgreen/80 text-sm font-bold uppercase tracking-widest mb-12 max-w-xl mx-auto">
              Explore our extensive library of study materials and start your journey towards academic success today.
            </p>
            <button onClick={() => navigate('/subjects')} className="px-12 py-6 bg-pakgreen text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:scale-105 transition-all">
              Explore Materials
            </button>
          </div>
        </div>
      </section>

      {/* 8. INFORMATIONAL FOOTER DESCRIPTION */}
      <section className="max-w-7xl mx-auto px-6 py-12 border-t border-gold/10">
        <p className="text-[10px] text-zinc-400 font-medium text-center leading-relaxed max-w-4xl mx-auto">
          {footerDescription}
        </p>
      </section>
    </div>
  );
};

export default Home;
