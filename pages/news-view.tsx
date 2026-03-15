
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Megaphone, Calendar, Share2, PlayCircle, Clock, Sparkles, Tag } from 'lucide-react';
import { handleShareNews } from '../utils/share';
import QuizSlider from '../components/quiz-slider';
import { motion, AnimatePresence } from 'framer-motion';

interface NewsViewProps {
  setActiveImage: (url: string | null) => void;
}

const NewsView: React.FC<NewsViewProps> = ({ setActiveImage }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { notifications, isLoading } = useData();
  
  const filteredNotifications = id 
    ? notifications.filter(n => n.id === id) 
    : notifications;

  React.useEffect(() => {
    if (id && filteredNotifications.length === 1) {
      const n = filteredNotifications[0];
      document.title = `${n.title} - MM Academy News`;
      
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', n.content.substring(0, 150) + '...');
      }

      if (n.seoKeywords) {
        let metaKeywords = document.querySelector('meta[name="keywords"]');
        if (!metaKeywords) {
          metaKeywords = document.createElement('meta');
          metaKeywords.setAttribute('name', 'keywords');
          document.head.appendChild(metaKeywords);
        }
        metaKeywords.setAttribute('content', n.seoKeywords);
      }
    }
    return () => {
      document.title = 'MM Academy - Pakistan\'s Elite Legal Portal';
    };
  }, [id, filteredNotifications]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-24 overflow-hidden">
       <motion.div 
         initial={{ opacity: 0, y: -20 }}
         animate={{ opacity: 1, y: 0 }}
         className="text-center mb-20"
       >
          <span className="text-gold font-black uppercase text-[13px] tracking-[0.6em] mb-6 block">Neural Archive</span>
          <h2 className="text-6xl font-heading font-black text-pakgreen dark:text-white uppercase tracking-tight flex items-center justify-center gap-8">
             <Megaphone className="h-16 w-16 text-gold-light animate-pulse" /> News Registry
          </h2>
          {id && (
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/news')}
              className="mt-10 px-10 py-4 bg-pakgreen dark:bg-gold text-white dark:text-pakgreen rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] shadow-2xl transition-all border border-gold/20"
            >
              View All Bulletins
            </motion.button>
          )}
       </motion.div>

       <div className="space-y-16">
          <AnimatePresence mode="popLayout">
            {filteredNotifications.length > 0 ? filteredNotifications.map((n, idx) => (
               <motion.div 
                 key={n.id} 
                 initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: idx * 0.1 }}
                 className="bg-white dark:bg-pakgreen-dark/50 backdrop-blur-xl border-l-[16px] border-gold-light p-12 rounded-r-[60px] shadow-[0_30px_60px_rgba(0,0,0,0.1)] flex flex-col gap-10 overflow-hidden hover:shadow-gold/20 transition-all group relative"
               >
                  <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Sparkles className="h-40 w-40 text-gold" />
                  </div>
                  
                  <div className="flex flex-wrap justify-between items-center gap-6 relative z-10">
                     <div className="flex items-center gap-6">
                        <span className="text-[11px] font-black text-gold-light uppercase tracking-[0.4em] bg-pakgreen/10 dark:bg-gold/10 px-6 py-2 rounded-full border border-gold/20">{n.type}</span>
                        <div className="flex items-center gap-3 text-zinc-400">
                           <Calendar className="h-5 w-5" />
                           <span className="text-[11px] font-bold uppercase tracking-[0.4em]">{n.date}</span>
                        </div>
                     </div>
                     <motion.button 
                       whileHover={{ scale: 1.05 }}
                       whileTap={{ scale: 0.95 }}
                       onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleShareNews(n); }} 
                       className="flex items-center gap-4 text-zinc-500 hover:text-gold-light text-[12px] font-black uppercase tracking-[0.3em] bg-zinc-50 dark:bg-white/5 px-8 py-5 rounded-2xl transition-all border border-transparent hover:border-gold/20 shadow-lg"
                     >
                       <Share2 className="h-6 w-6" /> Broadcast News
                     </motion.button>
                  </div>

                  {n.attachmentUrl && n.attachmentUrl.length > 5 && (
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="w-full rounded-[48px] overflow-hidden border-8 border-gold/10 shadow-2xl cursor-zoom-in group/nimg relative z-10"
                      onClick={() => setActiveImage(n.attachmentUrl || null)}
                    >
                       <img src={n.attachmentUrl} className="w-full h-auto transition-transform duration-700 group-hover/nimg:scale-110" alt={n.title} />
                       <div className="absolute inset-0 bg-gold/10 opacity-0 group-hover/nimg:opacity-100 transition-opacity" />
                    </motion.div>
                  )}

                  <div className="relative z-10">
                    <h3 className="text-4xl font-heading font-black text-pakgreen dark:text-white uppercase tracking-tight mb-8 leading-none">{n.title}</h3>
                    <p className="text-zinc-600 dark:text-zinc-300 text-xl leading-relaxed font-medium whitespace-pre-wrap border-l-4 border-zinc-100 dark:border-white/10 pl-8">{n.content}</p>
                    
                    {n.seoKeywords && (
                      <div className="mt-8 flex flex-wrap gap-x-4 gap-y-2 pl-8">
                        {n.seoKeywords.split(',').map((tag, i) => (
                          <span key={i} className="text-[10px] font-black uppercase tracking-widest text-gold-light hover:text-gold transition-colors cursor-default">
                            #{tag.trim().replace(/\s+/g, '')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {n.linkedQuizId && n.linkedQuizId.length > 1 && (
                    <div className="pt-10 border-t-2 border-zinc-100 dark:border-white/10 relative z-10 flex justify-center">
                       <QuizSlider quizId={n.linkedQuizId} />
                    </div>
                  )}
               </motion.div>
            )) : isLoading ? (
              [1, 2].map(i => (
                <div key={i} className="bg-white dark:bg-pakgreen-dark/50 backdrop-blur-xl border-l-[16px] border-zinc-200 dark:border-white/10 p-12 rounded-r-[60px] shadow-2xl animate-pulse flex flex-col gap-10">
                  <div className="flex justify-between items-center">
                    <div className="h-8 w-32 bg-zinc-200 dark:bg-white/10 rounded-full" />
                    <div className="h-8 w-40 bg-zinc-200 dark:bg-white/10 rounded-2xl" />
                  </div>
                  <div className="w-full h-64 bg-zinc-200 dark:bg-white/10 rounded-[48px]" />
                  <div className="space-y-4">
                    <div className="h-10 w-3/4 bg-zinc-200 dark:bg-white/10 rounded-lg" />
                    <div className="h-20 w-full bg-zinc-200 dark:bg-white/10 rounded-lg" />
                  </div>
                </div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-32 bg-white dark:bg-pakgreen-dark/20 rounded-[60px] border-4 border-dashed border-zinc-200 dark:border-white/10"
              >
                 <Clock className="h-16 w-16 text-zinc-300 mx-auto mb-6 animate-pulse" />
                 <p className="text-zinc-400 font-black uppercase text-sm tracking-[0.4em]">No official bulletins found in registry.</p>
              </motion.div>
            )}
          </AnimatePresence>
       </div>
    </div>
  );
};

export default NewsView;
