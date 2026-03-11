
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, CheckCircle2, XCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Question } from '../types';

const QuestionOfTheDay: React.FC = () => {
  const { quizzes } = useData();
  const [dailyQuestion, setDailyQuestion] = useState<{ question: Question; quizTitle: string } | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    if (quizzes.length > 0) {
      // Seeded random based on date to keep it "daily"
      const today = new Date().toDateString();
      let hash = 0;
      for (let i = 0; i < today.length; i++) {
        hash = today.charCodeAt(i) + ((hash << 5) - hash);
      }
      
      const quizIndex = Math.abs(hash) % quizzes.length;
      const quiz = quizzes[quizIndex];
      
      if (quiz.questions && quiz.questions.length > 0) {
        const questionIndex = Math.abs(hash * 31) % quiz.questions.length;
        setDailyQuestion({
          question: quiz.questions[questionIndex],
          quizTitle: quiz.title
        });
      }
    }
  }, [quizzes]);

  const handleOptionSelect = (idx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    const correct = idx === dailyQuestion?.question.correctAnswer;
    setIsCorrect(correct);
    setShowExplanation(true);
  };

  if (!dailyQuestion) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-pakgreen dark:bg-pakgreen-deepest p-8 md:p-12 rounded-[40px] border border-gold/20 shadow-2xl relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
        <HelpCircle className="h-40 w-40 text-gold" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-gold/20 p-3 rounded-2xl border border-gold/30">
            <Sparkles className="h-6 w-6 text-gold-light" />
          </div>
          <div>
            <span className="text-gold font-black uppercase text-[10px] tracking-[0.4em] block mb-1">Daily Challenge</span>
            <h3 className="text-white font-heading font-black text-2xl uppercase tracking-tight">Question of the Day</h3>
          </div>
        </div>

        <div className="mb-10">
          <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-4">Topic: {dailyQuestion.quizTitle}</p>
          <h4 className="text-white text-xl md:text-2xl font-medium leading-relaxed mb-8">{dailyQuestion.question.text}</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dailyQuestion.question.options.map((opt: string, idx: number) => (
              <button
                key={idx}
                disabled={selectedOption !== null}
                onClick={() => handleOptionSelect(idx)}
                className={`p-5 rounded-2xl border text-left transition-all flex items-center justify-between group/opt ${
                  selectedOption === idx 
                    ? (isCorrect ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-rose-500/20 border-rose-500 text-rose-400')
                    : selectedOption !== null && idx === dailyQuestion.question.correctAnswer
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                      : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-gold/30'
                }`}
              >
                <span className="text-sm font-medium">{opt}</span>
                {selectedOption === idx && (
                  isCorrect ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />
                )}
                {selectedOption !== null && idx === dailyQuestion.question.correctAnswer && selectedOption !== idx && (
                  <CheckCircle2 className="h-5 w-5" />
                )}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {showExplanation && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="pt-8 border-t border-white/10"
            >
              <div className={`p-6 rounded-2xl mb-6 ${isCorrect ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-rose-500/10 border border-rose-500/20'}`}>
                <h5 className={`text-[10px] font-black uppercase tracking-widest mb-2 ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isCorrect ? 'Excellent Work!' : 'Not Quite Right'}
                </h5>
                <p className="text-white/80 text-sm leading-relaxed">
                  {dailyQuestion.question.explanation || "The correct answer is " + dailyQuestion.question.options[dailyQuestion.question.correctAnswer] + ". Keep practicing to master this topic!"}
                </p>
              </div>
              <button 
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 text-gold font-black text-[10px] uppercase tracking-[0.3em] hover:text-white transition-colors"
              >
                Try Another Topic <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default QuestionOfTheDay;
