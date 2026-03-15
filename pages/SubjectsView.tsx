import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';

const SubjectsView: React.FC = () => {
  const { categories } = useData();

  return (
    <div className="min-h-screen bg-white dark:bg-pakgreen-deepest pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-gold font-black uppercase text-[12px] tracking-[0.5em] mb-4 block">Academic Directory</span>
            <h1 className="text-5xl md:text-7xl font-heading font-black text-pakgreen dark:text-white uppercase tracking-tight mb-8">All Subjects</h1>
            <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed font-medium">
              Explore our comprehensive range of academic subjects, each featuring curated study materials, practice questions, and expert guides to help you master the core concepts.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="p-10 bg-white dark:bg-pakgreen-dark/30 border border-gold/10 rounded-[40px] hover:border-gold transition-all group shadow-xl"
            >
              <div className="w-16 h-16 bg-gold/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-gold group-hover:text-pakgreen transition-all">
                <BookOpen className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-heading font-black text-pakgreen dark:text-white uppercase mb-4">{cat.name}</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-8 line-clamp-3">{cat.description}</p>
              <Link to={`/category/${cat.id}`} className="flex items-center gap-2 text-gold font-black text-[10px] uppercase tracking-widest">
                Explore Subject <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubjectsView;
