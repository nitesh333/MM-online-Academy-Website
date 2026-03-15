
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import QuizModule from '../components/quiz-module';
import { motion } from 'framer-motion';
import { Info, ChevronRight, BookOpen } from 'lucide-react';
import AdSlot from '../components/ad-banner';

const QuizView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { quizzes, categories, loadData } = useData();
  const navigate = useNavigate();
  
  const quiz = quizzes.find(q => q.id === id);

  useEffect(() => {
    if (quiz) {
      document.title = `${quiz.title} - MM Academy Preparation`;
      // ... SEO logic ...
    }
  }, [quiz]);

  const handleQuizComplete = () => {
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'quiz_complete', {
        'event_category': 'Engagement',
        'event_label': quiz?.title || 'Unknown Quiz'
      });
    }
    loadData();
  };

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-pakgreen-deepest">
        <h2 className="text-2xl font-black text-pakgreen dark:text-white uppercase">Assessment Not Found</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-pakgreen-deepest pb-24">
      {/* 1. Assessment Title */}
      <section className="pt-32 pb-12 bg-zinc-50 dark:bg-pakgreen-dark/20 border-b border-gold/10">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-gold font-black uppercase text-[10px] tracking-[0.3em] mb-4 block">Practice Assessment</span>
            <h1 className="text-4xl md:text-5xl font-heading font-black text-pakgreen dark:text-white uppercase tracking-tight mb-6">
              {quiz.title}
            </h1>
            
            {/* 2. Instructions Placeholder */}
            <div className="flex items-start gap-4 p-6 bg-gold/5 border border-gold/20 rounded-2xl max-w-2xl">
              <Info className="h-5 w-5 text-gold shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[10px] font-black text-gold uppercase tracking-widest mb-2">Instructions</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                  Please read each question carefully. You have limited time for some assessments. Ensure a stable internet connection before starting.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* 3. Quiz/Assessment Interface */}
        <main className="lg:col-span-8">
          <div className="bg-white dark:bg-pakgreen-dark/40 rounded-[40px] border border-gold/10 shadow-2xl overflow-hidden">
            <QuizModule 
              quiz={quiz} 
              quizzes={quizzes} 
              categories={categories} 
              onComplete={handleQuizComplete} 
            />
          </div>

          {/* 6. Call-to-action for further study */}
          <section className="mt-16 p-10 bg-pakgreen dark:bg-gold rounded-[40px] text-white dark:text-pakgreen flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-2xl font-heading font-black uppercase mb-2">Need more practice?</h3>
              <p className="text-sm opacity-80 font-medium">Explore our full range of study guides and resources for this subject.</p>
            </div>
            <button 
              onClick={() => navigate('/study-guides')}
              className="flex items-center gap-3 px-8 py-4 bg-white dark:bg-pakgreen text-pakgreen dark:text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-transform"
            >
              <BookOpen className="h-5 w-5" /> Explore Study Guides
            </button>
          </section>
        </main>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-12">
          <AdSlot placement="sidebar" privateAds={[]} />

          {/* 5. Related Assessments */}
          <div>
            <h3 className="text-xs font-black text-gold uppercase tracking-widest mb-8">Related Assessments</h3>
            <div className="space-y-6">
              {quizzes.filter(q => q.id !== quiz.id).slice(0, 3).map(q => (
                <div 
                  key={q.id}
                  onClick={() => navigate(`/quiz/${q.id}`)}
                  className="p-6 bg-white dark:bg-pakgreen-dark/30 border border-gold/10 rounded-3xl hover:border-gold transition-all cursor-pointer group"
                >
                  <h4 className="text-sm font-heading font-black text-pakgreen dark:text-white uppercase group-hover:text-gold transition-colors line-clamp-2">{q.title}</h4>
                  <div className="mt-4 flex items-center gap-2 text-[9px] font-black text-gold uppercase tracking-widest">
                    Take Test <ChevronRight className="h-3 w-3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default QuizView;
