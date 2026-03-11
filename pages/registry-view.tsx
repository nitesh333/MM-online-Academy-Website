
import React from 'react';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ListChecks, FileText, ChevronRight, BookOpen, Sparkles } from 'lucide-react';

const RegistryView: React.FC = () => {
  const { quizzes, articles, notifications, categories, isLoading } = useData();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-pakgreen-deepest">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-pakgreen-deepest pb-24">
      {/* Hero Header */}
      <section className="relative py-20 bg-pakgreen dark:bg-pakgreen-dark overflow-hidden">
        <div className="absolute inset-0 islamic-pattern opacity-10 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-gold font-black uppercase text-[12px] tracking-[0.5em] mb-4 block">Test Index</span>
            <h1 className="text-5xl md:text-7xl font-heading font-black text-white uppercase tracking-tight mb-6">
              Full Registry
            </h1>
            <p className="text-zinc-300 text-sm font-bold uppercase tracking-widest max-w-2xl mx-auto">
              A comprehensive directory of all mock tests, preparation modules, and expert insights available at MM Academy.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Quizzes Section */}
          <section>
            <div className="flex items-center gap-4 mb-10">
              <div className="h-12 w-12 bg-gold/10 rounded-2xl flex items-center justify-center text-gold">
                <ListChecks className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-3xl font-heading font-black text-pakgreen dark:text-white uppercase">Mock Assessments</h2>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Total {quizzes.length} Preparation Modules</p>
              </div>
            </div>

            <div className="space-y-4">
              {quizzes.map((q, idx) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.02 }}
                >
                  <Link 
                    to={`/quiz/${q.id}`}
                    className="flex items-center justify-between p-6 bg-white dark:bg-pakgreen-dark/40 border border-gold/5 rounded-3xl hover:border-gold-light transition-all group shadow-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-gold/5 p-3 rounded-xl text-gold group-hover:bg-gold group-hover:text-pakgreen transition-all">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-heading font-black text-pakgreen dark:text-white uppercase group-hover:text-gold transition-colors">{q.title}</h3>
                        <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">
                          {categories.find(c => c.id === q.subCategoryId)?.name || 'General Preparation'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gold-light opacity-0 group-hover:opacity-100 transition-all" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Articles Section */}
          <section>
            <div className="flex items-center gap-4 mb-10">
              <div className="h-12 w-12 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-3xl font-heading font-black text-pakgreen dark:text-white uppercase">Expert Insights</h2>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Total {articles.length} Educational Guides</p>
              </div>
            </div>

            <div className="space-y-4">
              {articles.map((a, idx) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.02 }}
                >
                  <Link 
                    to={`/article/${a.id}`}
                    className="flex items-center justify-between p-6 bg-white dark:bg-pakgreen-dark/40 border border-gold/5 rounded-3xl hover:border-gold-light transition-all group shadow-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-rose-500/5 p-3 rounded-xl text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all">
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-heading font-black text-pakgreen dark:text-white uppercase group-hover:text-gold transition-colors">{a.title}</h3>
                        <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">
                          {a.category} • {a.date}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gold-light opacity-0 group-hover:opacity-100 transition-all" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>

        </div>

        {/* News Section */}
        <section className="mt-24">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-12 w-12 bg-pakgreen/10 rounded-2xl flex items-center justify-center text-pakgreen dark:text-gold">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-3xl font-heading font-black text-pakgreen dark:text-white uppercase">Institutional News</h2>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Total {notifications.length} Bulletins Published</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notifications.map((n, idx) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02 }}
                className="p-6 bg-white dark:bg-pakgreen-dark/40 border border-gold/5 rounded-3xl hover:border-gold-light transition-all shadow-lg"
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[8px] font-black text-gold uppercase tracking-widest">{n.type}</span>
                  <span className="text-[8px] text-zinc-400 font-bold uppercase">{n.date}</span>
                </div>
                <h3 className="text-sm font-heading font-black text-pakgreen dark:text-white uppercase mb-4 line-clamp-2">{n.title}</h3>
                <Link 
                  to="/news"
                  className="text-[9px] font-black text-gold-light uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all"
                >
                  Read Bulletin <ChevronRight className="h-3 w-3" />
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default RegistryView;
