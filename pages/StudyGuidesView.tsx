import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileText, ArrowRight } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { ArticleType } from '../types';

const StudyGuidesView: React.FC = () => {
  const { articles } = useData();
  const navigate = useNavigate();

  const studyGuides = useMemo(() => {
    return articles.filter(a => a.type === ArticleType.STUDY_GUIDE);
  }, [articles]);

  return (
    <div className="min-h-screen bg-white dark:bg-pakgreen-deepest pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-gold font-black uppercase text-xs tracking-[0.5em] mb-4 block">Expert Guidance</span>
            <h1 className="text-5xl md:text-7xl font-heading font-black text-pakgreen dark:text-white uppercase tracking-tight mb-8">Study Guides</h1>
            <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed font-medium">
              Master complex topics with our in-depth study guides. Each guide is structured to provide clear explanations, key takeaways, and strategic insights for academic success.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {studyGuides.map((guide, idx) => (
            <motion.div
              key={guide.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => navigate(`/article/${guide.id}`)}
              className="bg-white dark:bg-pakgreen-dark/40 p-10 rounded-[40px] border border-gold/10 shadow-xl hover:border-gold transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-gold/10 rounded-2xl text-gold">
                  <FileText className="h-6 w-6" />
                </div>
                <span className="text-xs font-black text-gold uppercase tracking-widest">{guide.category}</span>
              </div>
              <h3 className="text-2xl font-heading font-black text-pakgreen dark:text-white uppercase mb-6 leading-tight group-hover:text-gold transition-colors">{guide.title}</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-8 line-clamp-3">
                {guide.content.substring(0, 150)}...
              </p>
              <div className="flex items-center gap-2 text-xs font-black text-gold uppercase tracking-widest">
                Read Full Guide <ArrowRight className="h-4 w-4" />
              </div>
            </motion.div>
          ))}
          {studyGuides.length === 0 && (
            <div className="col-span-full text-center py-20 bg-gold/5 rounded-[40px] border border-gold/10">
              <p className="text-zinc-500 font-black uppercase text-xs tracking-widest">No study guides available yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyGuidesView;
