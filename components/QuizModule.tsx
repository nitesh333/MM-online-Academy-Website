import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, RefreshCw, MessageSquare, Send, Star, Info, ChevronRight, Youtube, ExternalLink } from 'lucide-react';
import { Quiz, QuizFeedback, SubCategory, Question } from '../types';
import { dataService } from '../services/dataService';
import AdSlot from './AdBanner';

interface QuizModuleProps {
  quiz: Quiz;
  categories: SubCategory[];
  onComplete: (score: number) => void;
}

const QuizModule: React.FC<QuizModuleProps> = ({ quiz, categories, onComplete }) => {
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  
  // Feedback Form State
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ name: '', email: '', comment: '' });

  const initQuiz = useCallback(() => {
    const randomized = quiz.questions.map(q => {
      const originalCorrectText = q.options[q.correctAnswer];
      const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);
      const newCorrectIndex = shuffledOptions.indexOf(originalCorrectText);
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

  const percentage = Math.round((correctCount / shuffledQuestions.length) * 100);

  if (shuffledQuestions.length === 0) return null;

  if (isFinished) {
    return (
      <div className="max-w-4xl mx-auto space-y-12 pb-20 px-4 animate-in fade-in duration-500">
        <div className="bg-pakgreen dark:bg-pakgreen-dark rounded-[40px] shadow-2xl border-4 border-gold/20 p-8 sm:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 islamic-pattern opacity-10"></div>
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 uppercase tracking-tighter">Assessment Result</h2>
            <div className="mb-14 p-12 bg-white/5 border-2 border-gold/20 rounded-[48px] shadow-inner flex flex-col items-center">
               <span className="text-7xl sm:text-9xl font-black text-white dark:text-gold-light tracking-tighter">{percentage}%</span>
            </div>
            
            <div className="mb-12 p-8 bg-gold-light/10 border-2 border-gold/20 rounded-[32px] flex flex-col items-center">
               <Youtube className="h-10 w-10 text-red-500 mb-4" />
               <h4 className="text-gold-light font-black uppercase text-sm mb-2 tracking-widest">Master your preparation</h4>
               <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-6">Watch expert lectures and past paper solutions on our channel.</p>
               <a 
                 href="https://www.youtube.com/channel/UCM2ZBxpqZZs95L2KYxAcSaQ" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="px-10 py-5 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all shadow-xl hover:scale-105"
               >
                 Visit our YouTube Channel <ExternalLink className="h-4 w-4" />
               </a>
            </div>

            {/* FEEDBACK FORM - High Contrast Version */}
            {!feedbackSent ? (
              <div className="mb-12 text-left bg-white p-8 rounded-[32px] border-4 border-gold/10 shadow-xl">
                <form onSubmit={handleFeedbackSubmit}>
                  <h4 className="text-pakgreen font-black uppercase text-sm mb-6 flex items-center gap-3">
                    <div className="bg-pakgreen p-2 rounded-lg text-white"><MessageSquare className="h-4 w-4" /></div> 
                    Submit Feedback
                  </h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <input value={feedbackForm.name} onChange={e => setFeedbackForm({...feedbackForm, name: e.target.value})} placeholder="Your Name (Optional)" className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-800 text-xs outline-none focus:border-pakgreen focus:ring-2 focus:ring-pakgreen/10" />
                       <input value={feedbackForm.email} onChange={e => setFeedbackForm({...feedbackForm, email: e.target.value})} placeholder="Email (Optional)" className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-800 text-xs outline-none focus:border-pakgreen focus:ring-2 focus:ring-pakgreen/10" />
                    </div>
                    <textarea value={feedbackForm.comment} onChange={e => setFeedbackForm({...feedbackForm, comment: e.target.value})} placeholder="Help us improve. Was this quiz accurate?" required className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-800 text-xs outline-none focus:border-pakgreen focus:ring-2 focus:ring-pakgreen/10 min-h-[100px]" />
                    <button type="submit" className="w-full py-5 bg-pakgreen text-white font-black uppercase text-[11px] tracking-widest rounded-xl hover:bg-pakgreen-light transition-all shadow-lg hover:shadow-xl">
                      Send Feedback <Send className="h-3 w-3 inline ml-2" />
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="mb-12 p-8 bg-emerald-500/20 border-2 border-emerald-500/50 rounded-[32px] text-emerald-300 font-bold uppercase text-xs flex flex-col items-center animate-in zoom-in">
                <CheckCircle className="h-8 w-8 mb-4" />
                Feedback Received. Thank you for helping MM Academy!
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-6">
              <button onClick={initQuiz} className="flex-grow py-6 bg-gold-light text-pakgreen rounded-2xl font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 shadow-2xl hover:scale-105 transition-transform">
                <RefreshCw className="h-5 w-5" /> Retake Track
              </button>
              <button onClick={() => window.location.hash = '#home'} className="flex-grow py-6 bg-white/10 text-white rounded-2xl font-black uppercase tracking-[0.3em] border border-white/20 hover:bg-white/20 transition-colors">
                Exit Track
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = shuffledQuestions[currentQuestionIndex];
  const selectedAnswer = answers[currentQuestionIndex];

  return (
    <div className="max-w-4xl mx-auto px-4 animate-in fade-in duration-500 pb-20">
      <div className="mb-12 border-b-4 border-gold/20 pb-8 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-pakgreen dark:text-gold-light uppercase tracking-tighter">{quiz.title}</h2>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-black uppercase tracking-[0.4em] mt-2">Item {currentQuestionIndex + 1} / {shuffledQuestions.length}</p>
        </div>
        <div className="bg-pakgreen dark:bg-gold-light/10 px-6 py-2 rounded-full text-[10px] font-black text-white dark:text-gold-light uppercase">Mock Assessment</div>
      </div>

      <div className="bg-white dark:bg-pakgreen-dark/40 rounded-[40px] shadow-2xl border border-gold/10 p-8 sm:p-16">
        <p className="text-xl sm:text-2xl text-pakgreen dark:text-white font-black mb-14 leading-tight border-l-8 border-gold-light pl-10">{currentQuestion.text}</p>
        <div className="grid grid-cols-1 gap-6">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedAnswer === idx;
            const isCorrect = idx === currentQuestion.correctAnswer;
            let btnStyle = "w-full p-6 sm:p-8 text-left border-2 rounded-2xl text-[14px] sm:text-base font-black transition-all flex justify-between items-center group ";
            if (selectedAnswer === null) btnStyle += "bg-zinc-50 dark:bg-pakgreen-deepest border-zinc-200 dark:border-gold/10 hover:border-pakgreen dark:hover:border-gold-light text-zinc-700 dark:text-zinc-300";
            else if (isSelected) btnStyle += isCorrect ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 border-rose-500 text-rose-500";
            else if (isCorrect) btnStyle += "bg-emerald-500/5 border-emerald-500/50 text-emerald-500/60 dark:text-emerald-400/60";
            else btnStyle += "opacity-30 border-zinc-200 dark:border-zinc-800";
            return (
              <button key={idx} disabled={selectedAnswer !== null} onClick={() => {
                  const n = [...answers]; n[currentQuestionIndex] = idx; setAnswers(n);
                  if (idx === currentQuestion.correctAnswer) setCorrectCount(c => c + 1);
                }} className={btnStyle}>
                <div className="flex items-center gap-6">
                  <div className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center font-black ${isSelected ? 'bg-current text-white border-current' : 'border-zinc-300 dark:border-gold/20 text-zinc-400'}`}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="uppercase">{option}</span>
                </div>
              </button>
            );
          })}
        </div>
        {selectedAnswer !== null && (
          <div className="mt-14 flex flex-col items-center">
            <button onClick={() => {
                if (currentQuestionIndex < shuffledQuestions.length - 1) setCurrentQuestionIndex(i => i + 1);
                else setIsFinished(true);
              }} className="bg-pakgreen dark:bg-gold-light text-white dark:text-pakgreen px-12 py-6 rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] shadow-2xl">
              {currentQuestionIndex === shuffledQuestions.length - 1 ? 'View Result' : 'Next Question'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizModule;