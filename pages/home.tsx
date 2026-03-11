
import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../context/DataContext';
import AdSlot from '../components/ad-banner';
import QuizSlider from '../components/quiz-slider';
import QuestionOfTheDay from '../components/question-of-the-day';
import { Megaphone, BookOpen, Star, ArrowRight, Share2, Sparkles, PlayCircle, ChevronRight, Search, Filter, Activity, Users, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { handleShareNews } from '../utils/share';
import { motion, AnimatePresence } from 'framer-motion';

interface HomeProps {
  setActiveImage: (url: string | null) => void;
}

const Home: React.FC<HomeProps> = ({ setActiveImage }) => {
  const { notifications, categories, ads, articles, quizzes, isLoading } = useData();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllArticles, setShowAllArticles] = useState(false);

  // Live Stats Simulation
  const [liveStats, setLiveStats] = useState({ active: 1240, solved: 45892, success: 98 });
  
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        active: prev.active + (Math.random() > 0.5 ? 1 : -1),
        solved: prev.solved + Math.floor(Math.random() * 5),
        success: 98
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Prioritize specific categories and filter by search
  const filteredAndSortedCategories = useMemo(() => {
    const priorityIds = ['spsc', 'hec', 'sts', 'pphi', 'mcat', 'ecat'];
    
    let list = [...categories];

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      list = list.filter(cat => 
        cat.name.toLowerCase().includes(query) || 
        cat.description.toLowerCase().includes(query)
      );
    }

    // Sort: Priority first, then others
    return list.sort((a, b) => {
      const aIndex = priorityIds.indexOf(a.id.toLowerCase());
      const bIndex = priorityIds.indexOf(b.id.toLowerCase());
      
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      
      return a.name.localeCompare(b.name);
    });
  }, [categories, searchQuery]);

  return (
    <div className="overflow-hidden">
      {/* LIVE PULSE TICKER */}
      <div className="bg-pakgreen dark:bg-black py-2 border-b border-gold/20 overflow-hidden whitespace-nowrap relative z-50">
        <div className="flex animate-marquee items-center gap-12">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-12">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[9px] font-black text-white/70 uppercase tracking-[0.2em]">Live Preparation Pulse:</span>
                <span className="text-[9px] font-black text-gold uppercase tracking-[0.2em]">{liveStats.active.toLocaleString()} Students Active</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-3 w-3 text-gold" />
                <span className="text-[9px] font-black text-white/70 uppercase tracking-[0.2em]">Questions Solved Today:</span>
                <span className="text-[9px] font-black text-gold uppercase tracking-[0.2em]">{liveStats.solved.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-3 w-3 text-gold" />
                <span className="text-[9px] font-black text-white/70 uppercase tracking-[0.2em]">Success Rate:</span>
                <span className="text-[9px] font-black text-gold uppercase tracking-[0.2em]">{liveStats.success}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <section className="relative py-12 lg:py-20 bg-white dark:bg-pakgreen-deepest border-b border-gold/10 overflow-hidden scanline">
        {/* Futuristic Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full islamic-pattern opacity-5 pointer-events-none" />
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-pakgreen/10 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-gold/5 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '2s' }} />

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="flex flex-col mb-6">
              <span className="text-sm font-serif font-bold text-pakgreen dark:text-gold-light mb-2 md:hidden" style={{ direction: 'rtl' }}>ربِّ زِدْنِي عِلْماً</span>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-pakgreen/5 dark:bg-gold/5 border border-gold/20 rounded-full shadow-sm backdrop-blur-sm w-fit">
                <Star className="h-3 w-3 text-gold-light fill-current animate-spin-slow" />
                <span className="text-[9px] font-black text-pakgreen dark:text-gold-light uppercase tracking-[0.2em]">Pakistan's Elite Test Preparation Portal</span>
              </div>
            </div>
            <h1 className="text-5xl sm:text-7xl font-heading font-black text-pakgreen dark:text-white uppercase tracking-tight mb-6 leading-[0.9] drop-shadow-2xl">
              Master Your <br/>
              <span className="text-gold glow-text-gold">Competitive Exams</span>
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 text-base mb-8 max-w-lg leading-relaxed font-medium">
              MM Academy is Pakistan's premier digital learning platform for SPSC, MDCAT, ECAT, and HEC test preparation. Expert-curated MCQs and mock tests designed for your success.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => navigate('/category/lat')} 
                className="group relative px-8 py-4 bg-pakgreen dark:bg-gold text-white dark:text-pakgreen rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-lg transition-all hover:scale-105 hover:-translate-y-1 active:scale-95 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
                <span className="relative z-10 flex items-center gap-2">
                  Start Preparation <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
                </span>
              </button>
              <button 
                onClick={() => navigate('/news')} 
                className="px-8 py-4 border-2 border-pakgreen/20 dark:border-gold/20 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] transition-all hover:bg-pakgreen/5 dark:hover:bg-gold/5 dark:text-gold-light hover:border-gold/40 shadow-sm"
              >
                News Registry
              </button>
              <button 
                onClick={() => navigate('/registry')} 
                className="px-8 py-4 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-gold/10 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] transition-all hover:bg-gold hover:text-pakgreen dark:hover:bg-gold dark:hover:text-pakgreen shadow-sm"
              >
                Full Registry
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: 'backOut' }}
            className="hidden lg:block relative"
          >
            <div className="w-full aspect-[4/3] bg-pakgreen dark:bg-pakgreen-dark rounded-[60px] border-8 border-gold/10 flex flex-col p-10 shadow-[0_40px_80px_rgba(0,0,0,0.3)] relative overflow-hidden group">
              <div className="absolute inset-0 islamic-pattern opacity-10 group-hover:opacity-20 transition-opacity"></div>
              <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-transparent to-gold/10"></div>
              
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <BookOpen className="h-20 w-20 text-gold-light mb-6 relative z-10 drop-shadow-[0_0_20px_rgba(212,175,55,0.5)]" />
              </motion.div>
              
              <h3 className="text-white text-4xl font-heading font-black uppercase relative z-10 leading-none mb-3">MM Academy</h3>
              <div className="h-1 w-16 bg-gold-light mb-6 relative z-10" />
              <p className="text-gold-light/80 font-black text-[12px] uppercase tracking-[0.4em] mt-auto relative z-10">Gateway to Excellence</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PREPARATION TRACKS SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-24">
         <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-xl"
            >
              <span className="text-gold font-black uppercase text-[12px] tracking-[0.5em] mb-4 block glow-text-gold">Test Preparation</span>
              <h3 className="text-5xl font-heading font-black text-pakgreen dark:text-white uppercase tracking-tight mb-6">Preparation Tracks</h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-[0.2em] leading-relaxed">
                Proprietary preparation modules engineered for maximum performance in national entrance examinations.
              </p>
            </motion.div>

            {/* Search Bar */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative w-full lg:max-w-md"
            >
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-gold/50 to-pakgreen/50 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex items-center bg-white dark:bg-pakgreen-dark/80 backdrop-blur-xl border border-gold/20 rounded-2xl overflow-hidden shadow-2xl">
                  <div className="pl-6 text-gold">
                    <Search className="h-5 w-5" />
                  </div>
                  <input 
                    type="text"
                    placeholder="SEARCH FOR SPSC, STS, HEC..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-6 py-5 bg-transparent text-[11px] font-black uppercase tracking-widest text-pakgreen dark:text-white placeholder:text-zinc-400 focus:outline-none"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="pr-6 text-zinc-400 hover:text-gold transition-colors text-[10px] font-black uppercase tracking-widest"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode='popLayout'>
              {filteredAndSortedCategories.map((sub, idx) => (
                <motion.div 
                  key={sub.id} 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  onClick={() => navigate(`/category/${sub.id}`)} 
                  className="group p-10 bg-white dark:bg-pakgreen-dark/30 backdrop-blur-xl border border-gold/10 rounded-[40px] hover:border-gold-light transition-all cursor-pointer shadow-2xl relative overflow-hidden hover:-translate-y-3"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Sparkles className="h-20 w-20 text-gold" />
                  </div>
                  <div className="bg-pakgreen/5 dark:bg-gold/5 w-14 h-14 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-gold-light group-hover:text-pakgreen transition-all shadow-inner border border-gold/10">
                      <BookOpen className="h-7 w-7" />
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    {['spsc', 'hec', 'sts', 'pphi'].includes(sub.id.toLowerCase()) && (
                      <span className="px-3 py-1 bg-gold/10 border border-gold/20 rounded-full text-[8px] font-black text-gold uppercase tracking-widest">Priority</span>
                    )}
                    <h3 className="font-heading font-black text-pakgreen dark:text-gold-light text-3xl uppercase tracking-normal leading-none">{sub.name}</h3>
                  </div>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest leading-relaxed line-clamp-2 mb-8">{sub.description}</p>
                  <div className="flex items-center gap-3 text-gold font-black text-[10px] uppercase tracking-[0.3em] group-hover:translate-x-2 transition-transform">
                      Explore Track <ArrowRight className="h-4 w-4" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {filteredAndSortedCategories.length === 0 && (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-gold/10 rounded-[40px]">
                <p className="text-zinc-400 font-black uppercase tracking-[0.4em] text-[11px]">No matching preparation tracks found.</p>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="mt-6 text-gold font-black uppercase text-[10px] tracking-widest underline underline-offset-4"
                >
                  Clear Search
                </button>
              </div>
            )}
         </div>
      </section>
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        <QuestionOfTheDay />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <AdSlot placement="content" privateAds={ads} />
      </div>

      <section className="max-w-7xl mx-auto px-6 py-24 border-t border-gold/10">
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-gold font-black uppercase text-[12px] tracking-[0.5em] mb-4 block glow-text-gold">Expert Insights</span>
              <h3 className="text-5xl font-heading font-black text-pakgreen dark:text-white uppercase tracking-tight">Preparation Guides</h3>
            </motion.div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-[0.2em] max-w-sm leading-relaxed">
              In-depth articles and strategic roadmaps for Pakistan's most competitive entrance and recruitment examinations.
            </p>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {articles.length > 0 ? (showAllArticles ? articles : articles.slice(0, 3)).map((art, idx) => (
              <motion.div 
                key={art.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => navigate(`/article/${art.id}`)}
                className="bg-white dark:bg-pakgreen-dark/40 p-8 rounded-[40px] border border-gold/10 shadow-xl hover:border-gold-light transition-all group cursor-pointer flex flex-col"
              >
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[9px] font-black text-gold uppercase tracking-widest">{art.category}</span>
                  <span className="text-[9px] text-zinc-400 font-bold uppercase">{art.date}</span>
                </div>
                <h4 className="text-xl font-heading font-black text-pakgreen dark:text-white uppercase mb-4 group-hover:text-gold transition-colors leading-tight line-clamp-2">{art.title}</h4>
                
                {/* Article Segment/Snippet */}
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed mb-8 line-clamp-3">
                  {art.content.replace(/[#*`]/g, '').substring(0, 160)}...
                </p>

                <div className="mt-auto flex items-center gap-2 text-[10px] font-black text-gold-light uppercase tracking-widest group-hover:text-gold transition-colors">
                  See Full Article <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
                </div>
              </motion.div>
            )) : (
              <div className="col-span-full py-12 text-center text-zinc-400 font-black uppercase tracking-[0.4em] text-[10px] opacity-50 border-2 border-dashed border-gold/10 rounded-[40px]">
                Educational insights will be published soon.
              </div>
            )}
         </div>

         {articles.length > 3 && (
           <div className="mt-16 flex justify-center">
             <button 
               onClick={() => setShowAllArticles(!showAllArticles)}
               className="px-10 py-4 bg-pakgreen dark:bg-gold text-white dark:text-pakgreen rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] shadow-xl hover:scale-105 transition-all flex items-center gap-3"
             >
               {showAllArticles ? 'Show Less' : 'See More Articles'}
               <ChevronRight className={`h-4 w-4 transition-transform ${showAllArticles ? 'rotate-90' : ''}`} />
             </button>
           </div>
         )}
      </section>

      {/* HOME NEWS SECTION */}
      <section className="bg-zinc-100 dark:bg-pakgreen-deepest/50 py-32 border-y border-gold/10 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-full islamic-pattern opacity-5 pointer-events-none" />
         <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between mb-20 gap-8">
               <div className="flex items-center gap-6">
                  <div className="bg-gold-light p-4 rounded-[24px] shadow-[0_10px_30px_rgba(212,175,55,0.3)] animate-float">
                     <Megaphone className="h-10 w-10 text-pakgreen" />
                  </div>
                  <h2 className="text-5xl sm:text-6xl font-heading font-black text-pakgreen dark:text-white uppercase tracking-tight">Institutional News</h2>
               </div>
               <button 
                onClick={() => navigate('/news')} 
                className="px-10 py-5 bg-white dark:bg-white/5 border border-zinc-200 dark:border-gold/20 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] text-pakgreen dark:text-gold-light hover:bg-pakgreen hover:text-white dark:hover:bg-gold-light dark:hover:text-pakgreen transition-all shadow-xl"
               >
                 View All Bulletins
               </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
               {notifications.length > 0 ? notifications.slice(0, 3).map((n, idx) => (
                  <motion.div 
                    key={n.id} 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white dark:bg-pakgreen-dark/40 backdrop-blur-2xl p-10 rounded-[50px] border border-gold/10 shadow-2xl flex flex-col h-full group overflow-hidden hover:border-gold/40 transition-all"
                  >
                     <div className="flex justify-between items-center mb-8">
                       <span className="text-[10px] font-black text-gold-light uppercase tracking-[0.3em] bg-pakgreen/10 dark:bg-gold/10 px-4 py-2 rounded-full border border-gold/10">{n.type}</span>
                       <div className="flex items-center gap-4">
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{n.date}</span>
                           <button 
                             onClick={(e) => { e.stopPropagation(); handleShareNews(n); }} 
                             className="p-4 -m-4 text-zinc-400 hover:text-gold-light transition-all hover:scale-125 flex items-center justify-center"
                             aria-label="Share News"
                           >
                             <Share2 className="h-6 w-6" />
                           </button>
                       </div>
                     </div>
                     {n.attachmentUrl && n.attachmentUrl.length > 5 && (
                       <div 
                         className="w-full h-64 overflow-hidden rounded-[32px] mb-8 border border-gold/10 bg-zinc-50 cursor-zoom-in relative group/img shadow-inner"
                         onClick={() => setActiveImage(n.attachmentUrl || null)}
                       >
                          <img src={n.attachmentUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={n.title} />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                             <Sparkles className="h-10 w-10 text-gold-light animate-pulse" />
                          </div>
                       </div>
                     )}
                      <h3 className="text-2xl font-heading font-black text-pakgreen dark:text-white mb-6 uppercase tracking-normal line-clamp-2 leading-tight group-hover:text-gold transition-colors">{n.title}</h3>
                     <p className="text-[13px] text-zinc-500 dark:text-zinc-300 line-clamp-3 leading-relaxed mb-10 flex-grow font-medium">{n.content}</p>
                     {n.linkedQuizId && n.linkedQuizId.length > 1 && (
                       <div className="mt-2 flex justify-center">
                         <QuizSlider quizId={n.linkedQuizId} />
                       </div>
                     )}
                  </motion.div>
               )) : isLoading ? (
                 [1, 2, 3].map((i) => (
                   <div key={i} className="bg-white dark:bg-pakgreen-dark/40 backdrop-blur-2xl p-10 rounded-[50px] border border-gold/10 shadow-2xl flex flex-col h-full animate-pulse">
                     <div className="flex justify-between items-center mb-8">
                       <div className="h-6 w-24 bg-zinc-200 dark:bg-white/10 rounded-full" />
                       <div className="h-6 w-16 bg-zinc-200 dark:bg-white/10 rounded-full" />
                     </div>
                     <div className="w-full h-64 bg-zinc-200 dark:bg-white/10 rounded-[32px] mb-8" />
                     <div className="h-8 w-full bg-zinc-200 dark:bg-white/10 rounded-lg mb-4" />
                     <div className="h-4 w-3/4 bg-zinc-200 dark:bg-white/10 rounded-lg mb-2" />
                     <div className="h-4 w-1/2 bg-zinc-200 dark:bg-white/10 rounded-lg" />
                   </div>
                 ))
               ) : (
                 <div className="col-span-3 py-24 text-center text-zinc-400 font-black uppercase tracking-[0.4em] text-xs opacity-50 border-2 border-dashed border-gold/10 rounded-[50px]">No recent announcements from academy center.</div>
               )}
            </div>
         </div>
      </section>
    </div>
  );
};

export default Home;
