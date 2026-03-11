import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, RefreshCw, MessageSquare, Send, Youtube, ExternalLink, Lightbulb, PlayCircle, ArrowRight, Home, Sparkles } from 'lucide-react';
import { Quiz, QuizFeedback, SubCategory, Question } from '../types';
import { dataService } from '../services/dataService';
import { motion, AnimatePresence } from 'framer-motion';

interface QuizModuleProps {
  quiz: Quiz;
  quizzes: Quiz[];
  categories: SubCategory[];
  onComplete: (score: number) => void;
}

const QuizModule: React.FC<QuizModuleProps> = ({ quiz, quizzes, categories, onComplete }) => {
  const navigate = useNavigate();
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ name: '', email: '', comment: '' });

  const nextQuiz = useMemo(() => {
    if (!quiz || !quizzes.length) return null;
    
    // Series logic: Quizzes in the same sub-category portion, sorted by order number
    const siblings = quizzes.filter(q => 
      q.subCategoryId === quiz.subCategoryId && 
      q.topicId === quiz.topicId
    ).sort((a, b) => {
      const oA = Number(a.orderNumber) || 0;
      const oB = Number(b.orderNumber) || 0;
      if (oA !== oB) return oA - oB;
      return a.id.localeCompare(b.id);
    });

    const currentIndex = siblings.findIndex(s => s.id === quiz.id);
    return currentIndex !== -1 && currentIndex < siblings.length - 1 ? siblings[currentIndex + 1] : null;
  }, [quiz, quizzes]);

  const initQuiz = useCallback(() => {
    if (!quiz || !quiz.questions || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
      setShuffledQuestions([]);
      setAnswers([]);
      return;
    }

    const randomized = quiz.questions.map(q => {
      const options = (q.options && Array.isArray(q.options) && q.options.length > 0) 
        ? q.options 
        : ['A', 'B', 'C', 'D'];
      
      const originalCorrectText = options[q.correctAnswer] || options[0];
      const shuffledOptions = [...options].sort(() => Math.random() - 0.5);
      const newCorrectIndex = Math.max(0, shuffledOptions.indexOf(originalCorrectText));
      
      return { ...q, options: shuffledOptions, correctAnswer: newCorrectIndex };
    });

    setShuffledQuestions(randomized);
    setAnswers(new Array(randomized.length).fill(null));
    setCurrentQuestionIndex(0);
    setCorrectCount(0);
    setIsFinished(false);
    setFeedbackSent(false);
    setFeedbackForm({ name: '', email: '', comment: '' });
  }, [quiz]);

  useEffect(() => { initQuiz(); }, [initQuiz]);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackForm.comment) return;
    try {
      await dataService.saveQuizFeedback({
        id: `fb_${Date.now()}`,
        quizId: quiz.id,
        quizTitle: quiz.title,
        studentName: feedbackForm.name || 'Anonymous',
        studentEmail: feedbackForm.email,
        comment: feedbackForm.comment,
        date: new Date().toLocaleDateString(),
        isVisible: false
      });
      setFeedbackSent(true);
    } catch (err) { alert('Failed to send feedback.'); }
  };

  const percentage = shuffledQuestions.length > 0 ? Math.round((correctCount / shuffledQuestions.length) * 100) : 0;

  if (shuffledQuestions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-32 text-center">
        <RefreshCw className="h-16 w-16 text-gold animate-spin mx-auto mb-8" />
        <p className="text-zinc-500 dark:text-zinc-400 font-black uppercase tracking-[0.4em] text-sm">Initializing Neural Track...</p>
        <button onClick={() => navigate('/')} className="mt-12 text-gold-light font-black uppercase text-[11px] tracking-[0.3em] hover:glow-text-gold transition-all">Return to Command Center</button>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="max-w-4xl mx-auto space-y-12 pb-32 px-4 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-pakgreen dark:bg-pakgreen-dark rounded-[60px] shadow-[0_40px_80px_rgba(0,0,0,0.4)] border-8 border-gold/10 p-10 sm:p-20 text-center relative overflow-hidden scanline"
        >
          <div className="absolute inset-0 islamic-pattern opacity-10"></div>
          <div className="relative z-10">
            <h2 className="text-5xl sm:text-7xl font-heading font-black text-white mb-8 uppercase tracking-tight">Track Analysis</h2>
            <div className="mb-16 p-16 bg-white/5 border-2 border-gold/20 rounded-[60px] shadow-inner flex flex-col items-center relative group">
               <div className="absolute inset-0 bg-gold/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
               <span className="text-8xl sm:text-[12rem] font-heading font-black text-white dark:text-gold-light tracking-tighter leading-none relative z-10">{percentage}%</span>
               <span className="text-[12px] font-black text-gold-light uppercase tracking-[0.6em] mt-4 relative z-10">Accuracy Rating</span>
            </div>
            
            <div className="mb-16">
              {nextQuiz ? (
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/quiz/${nextQuiz.id}`)}
                  className="group relative w-full p-10 bg-gold-light/10 border-2 border-gold-light/40 rounded-[40px] overflow-hidden transition-all shadow-2xl"
                >
                   <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                     <PlayCircle className="h-32 w-32 text-gold-light" />
                   </div>
                   <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-10">
                      <div className="text-left">
                        <span className="text-[11px] font-black uppercase tracking-[0.5em] text-gold-light mb-3 block">Neural Link Active</span>
                        <h4 className="text-3xl font-heading font-black text-white uppercase tracking-normal">{nextQuiz.title}</h4>
                      </div>
                      <div className="px-12 py-6 bg-gold-light text-pakgreen rounded-2xl font-black uppercase text-[12px] tracking-[0.2em] flex items-center gap-4 shadow-[0_15px_30px_rgba(212,175,55,0.4)] group-hover:shadow-gold-light/60 transition-all">
                        Next Module <ArrowRight className="h-6 w-6 group-hover:translate-x-3 transition-transform" />
                      </div>
                   </div>
                </motion.button>
              ) : (
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/')}
                  className="group relative w-full p-10 bg-white/5 border-2 border-white/20 rounded-[40px] overflow-hidden transition-all shadow-2xl"
                >
                   <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-10">
                      <div className="text-left">
                        <span className="text-[11px] font-black uppercase tracking-[0.5em] text-zinc-400 mb-3 block">Track Sequence Terminated</span>
                        <h4 className="text-3xl font-heading font-black text-white uppercase tracking-normal">Series Completed</h4>
                      </div>
                      <div className="px-12 py-6 bg-white text-pakgreen rounded-2xl font-black uppercase text-[12px] tracking-[0.2em] flex items-center gap-4 shadow-2xl">
                        Return Home <Home className="h-6 w-6" />
                      </div>
                   </div>
                </motion.button>
              )}
            </div>

            <div className="mb-16 p-10 bg-gold-light/5 border-2 border-gold/10 rounded-[40px] flex flex-col items-center relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
               <Youtube className="h-12 w-12 text-red-500 mb-6 animate-pulse" />
               <h4 className="text-gold-light font-heading font-black uppercase text-lg mb-3 tracking-[0.2em]">
                 {quiz.videoUrl ? "Neural Solution Stream" : "Master Preparation"}
               </h4>
               <p className="text-[11px] font-bold text-white/60 uppercase tracking-[0.3em] mb-8 max-w-md">
                 {quiz.videoUrl ? "Access the expert-led solution lecture for this specific module." : "Access our full library of expert lectures and past paper solutions."}
               </p>
               <a 
                 href={quiz.videoUrl || "https://www.youtube.com/channel/UCM2ZBxpqZZs95L2KYxAcSaQ"} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="px-12 py-6 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-[12px] font-black uppercase tracking-[0.3em] flex items-center gap-4 transition-all shadow-[0_15px_30px_rgba(220,38,38,0.4)] hover:scale-105"
               >
                 {quiz.videoUrl ? "Watch Solution" : "YouTube Channel"} <ExternalLink className="h-5 w-5" />
               </a>
            </div>

            <div className="flex flex-col sm:flex-row gap-8">
              <button onClick={initQuiz} className="flex-grow py-7 bg-gold-light text-pakgreen rounded-2xl font-black uppercase tracking-[0.4em] flex items-center justify-center gap-5 shadow-[0_20px_40px_rgba(212,175,55,0.3)] hover:scale-105 transition-all">
                <RefreshCw className="h-6 w-6" /> Reboot Track
              </button>
              <button onClick={() => navigate('/')} className="flex-grow py-7 bg-white/5 text-white rounded-2xl font-black uppercase tracking-[0.4em] border-2 border-white/10 hover:bg-white/10 transition-all">
                Exit Portal
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = shuffledQuestions[currentQuestionIndex];
  if (!currentQuestion) return null;

  const selectedAnswer = answers[currentQuestionIndex];

  return (
    <div className="max-w-4xl mx-auto px-4 pb-32 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16 border-b-4 border-gold/10 pb-10 flex justify-between items-end"
      >
        <div>
          <h2 className="text-5xl font-heading font-black text-pakgreen dark:text-gold-light uppercase tracking-tight leading-none mb-4">{quiz.title}</h2>
          <div className="flex items-center gap-4">
            <div className="h-1.5 w-12 bg-gold rounded-full" />
            <p className="text-[13px] text-zinc-500 dark:text-zinc-400 font-black uppercase tracking-[0.5em]">Module Item {currentQuestionIndex + 1} / {shuffledQuestions.length}</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-3 bg-pakgreen dark:bg-gold-light/10 px-6 py-3 rounded-2xl text-[11px] font-black text-white dark:text-gold-light uppercase tracking-widest border border-gold/20">
          <Sparkles className="h-4 w-4 animate-pulse" /> Neural Assessment
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="bg-white dark:bg-pakgreen-dark/40 rounded-[60px] shadow-[0_40px_80px_rgba(0,0,0,0.1)] border border-gold/10 p-10 sm:p-20 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
          
          <p className="text-3xl sm:text-4xl text-pakgreen dark:text-white font-black mb-20 leading-tight border-l-[12px] border-gold-light pl-12 relative z-10">
            {currentQuestion.text}
          </p>
          
          <div className="grid grid-cols-1 gap-8 relative z-10">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedAnswer === idx;
              const isCorrect = idx === currentQuestion.correctAnswer;
              let btnStyle = "w-full p-8 sm:p-10 text-left border-2 rounded-[32px] text-[16px] sm:text-lg font-black transition-all flex justify-between items-center group relative overflow-hidden ";
              
              if (selectedAnswer === null) {
                btnStyle += "bg-zinc-50 dark:bg-pakgreen-deepest border-zinc-200 dark:border-gold/10 hover:border-gold dark:hover:border-gold-light text-zinc-700 dark:text-zinc-300 hover:scale-[1.02] hover:shadow-xl";
              } else if (isSelected) {
                btnStyle += isCorrect ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)]" : "bg-rose-500/10 border-rose-500 text-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.2)]";
              } else if (isCorrect) {
                btnStyle += "bg-emerald-500/5 border-emerald-500/50 text-emerald-500/60 dark:text-emerald-400/60";
              } else {
                btnStyle += "opacity-30 border-zinc-200 dark:border-zinc-800 scale-95";
              }

              return (
                <motion.button 
                  key={idx} 
                  whileHover={selectedAnswer === null ? { x: 10 } : {}}
                  disabled={selectedAnswer !== null} 
                  onClick={() => {
                    const n = [...answers]; n[currentQuestionIndex] = idx; setAnswers(n);
                    if (idx === currentQuestion.correctAnswer) setCorrectCount(c => c + 1);
                  }} 
                  className={btnStyle}
                >
                  <div className="flex items-center gap-8">
                    <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center font-black text-xl transition-all ${isSelected ? 'bg-current text-white border-current' : 'border-zinc-300 dark:border-gold/20 text-zinc-400'}`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className="uppercase tracking-wide">{option}</span>
                  </div>
                  {selectedAnswer !== null && isCorrect && <CheckCircle className="h-8 w-8 text-emerald-500 animate-in zoom-in" />}
                </motion.button>
              );
            })}
          </div>
          
          {selectedAnswer !== null && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-20 flex flex-col items-center w-full space-y-12"
            >
              {currentQuestion.explanation && currentQuestion.explanation.trim().length > 3 && (
                <div className="w-full text-left p-10 bg-blue-50 dark:bg-blue-900/10 border-l-[12px] border-blue-500 rounded-r-[40px] shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-6 opacity-5">
                      <Lightbulb className="h-24 w-24 text-blue-500" />
                   </div>
                   <h4 className="flex items-center gap-4 text-blue-600 dark:text-blue-400 font-heading font-black uppercase text-lg tracking-[0.2em] mb-6">
                     <Lightbulb className="h-8 w-8 fill-current animate-pulse" /> Academy Insight
                   </h4>
                   <p className="text-zinc-700 dark:text-zinc-200 text-base font-bold leading-relaxed relative z-10">
                     {currentQuestion.explanation}
                   </p>
                </div>
              )}

              <button 
                onClick={() => {
                  if (currentQuestionIndex < shuffledQuestions.length - 1) setCurrentQuestionIndex(i => i + 1);
                  else setIsFinished(true);
                }} 
                className="group relative bg-pakgreen dark:bg-gold text-white dark:text-pakgreen px-16 py-7 rounded-2xl font-black uppercase text-[12px] tracking-[0.4em] shadow-[0_20px_40px_rgba(0,0,0,0.2)] transition-all hover:scale-105 active:scale-95 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
                <span className="relative z-10 flex items-center gap-4">
                  {currentQuestionIndex === shuffledQuestions.length - 1 ? 'Finalize Analysis' : 'Next Module Item'} 
                  <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
                </span>
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default QuizModule;
