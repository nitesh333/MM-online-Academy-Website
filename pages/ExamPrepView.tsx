import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Target, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ArticleType } from '../types';

const ExamPrepView: React.FC = () => {
  const navigate = useNavigate();
  const { articles } = useData();

  const examGuides = useMemo(() => {
    return articles.filter(a => a.type === ArticleType.EXAM_GUIDE);
  }, [articles]);

  return (
    <div className="min-h-screen bg-white dark:bg-pakgreen-deepest pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-gold font-black uppercase text-xs tracking-[0.5em] mb-4 block">Strategic Preparation</span>
            <h1 className="text-5xl md:text-7xl font-heading font-black text-pakgreen dark:text-white uppercase tracking-tight mb-8">Exam Preparation</h1>
            <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed font-medium">
              Specialized preparation tracks for Pakistan's most competitive entrance and recruitment exams. Our structured approach ensures you focus on the most relevant topics and exam patterns.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {examGuides.map((guide, idx) => (
            <motion.div
              key={guide.id}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-12 bg-pakgreen dark:bg-pakgreen-dark rounded-[60px] border-8 border-gold/10 relative overflow-hidden group"
            >
              <div className="absolute inset-0 islamic-pattern opacity-10" />
              <div className="relative z-10">
                <Target className="h-16 w-16 text-gold mb-8" />
                <h3 className="text-white text-3xl font-heading font-black uppercase mb-4">{guide.title}</h3>
                <p className="text-zinc-300 text-sm leading-relaxed mb-8">
                  {guide.content.substring(0, 150)}...
                </p>
                <button onClick={() => navigate(`/article/${guide.id}`)} className="px-8 py-4 bg-gold text-pakgreen rounded-xl font-black uppercase text-xs tracking-widest flex items-center gap-2">
                  Start Prep Track <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
          {examGuides.length === 0 && (
            <div className="col-span-full text-center py-20 bg-gold/5 rounded-[40px] border border-gold/10">
              <p className="text-zinc-500 font-black uppercase text-xs tracking-widest">No exam preparation tracks available yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamPrepView;
