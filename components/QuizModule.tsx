
import React, { useState, useEffect } from 'react';
import { CheckCircle, RefreshCw, MessageSquare, Send } from 'lucide-react';
import { Quiz, Question, QuizFeedback, SubCategory } from '../types';
import { dataService } from '../services/dataService';
import AdSenseUnit from './AdSenseUnit';

interface QuizModuleProps {
  quiz: Quiz;
  categories: SubCategory[];
  onComplete: (score: number) => void;
}

const QuizModule: React.FC<QuizModuleProps> = ({ quiz, categories, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);

  // Shuffle Logic
  useEffect(() => {
    const shuffleArray = <T,>(array: T[]): T[] => {
      const arr = [...array];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };

    const prepared = quiz.questions.map(q => {
      const originalOptions = q.options.map((opt, i) => ({ text: opt, isCorrect: i === q.correctAnswer }));
      const shuffledOptions = shuffleArray(originalOptions);
      const newCorrectIndex = shuffledOptions.findIndex(o => o.isCorrect);

      return {
        ...q,
        options: shuffledOptions.map(o => o.text),
        correctAnswer: newCorrectIndex
      };
    });

    setShuffledQuestions(prepared);
    setAnswers(new Array(prepared.length).fill(null));
    setCurrentQuestionIndex(0);
    setCorrectCount(0);
    setIsFinished(false);
  }, [quiz]);

  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ name: '', email: '', comment: '' });
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const percentage = shuffledQuestions.length > 0 
    ? Math.round((correctCount / shuffledQuestions.length) * 100) 
    : 0;

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackForm.comment.trim() || !feedbackForm.name.trim()) return;
    setIsSubmittingFeedback(true);
    await dataService.saveQuizFeedback({
      id: Date.now().toString(),
      quizId: quiz.id,
      quizTitle: quiz.title,
      studentName: feedbackForm.name,
      studentEmail: feedbackForm.email || 'anonymous@student.pk',
      comment: feedbackForm.comment,
      date: new Date().toLocaleDateString(),
      isVisible: false
    });
    setFeedbackSubmitted(true);
    setIsSubmittingFeedback(false);
  };

  if (isFinished) {
    return (
      <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="bg-pakgreen dark:bg-pakgreen-dark rounded-[40px] shadow-2xl border-4 border-gold/20 p-8 sm:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 islamic-pattern opacity-10"></div>
          <div className="relative z-10">
            <CheckCircle className="h-16 w-16 text-gold-light mx-auto mb-8" />
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 uppercase tracking-tighter">Assessment Complete!</h2>
            <div className="mb-14 p-12 bg-white/5 dark:bg-pakgreen-deepest border-2 border-gold/20 rounded-[48px] shadow-inner flex flex-col items-center">
               <span className="block text-[11px] uppercase font-black tracking-[0.5em] mb-4 text-gold-light/80">Preparation Grade</span>
               <span className="text-7xl sm:text-9xl font-black text-white dark:text-gold-light tracking-tighter">{percentage}%</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-6">
              <button onClick={() => window.location.reload()} className="flex-grow py-6 bg-gold-light text-pakgreen rounded-2xl font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 text-xs">
                <RefreshCw className="h-5 w-5" /> Retake
              </button>
              <button onClick={() => window.location.hash = ''} className="flex-grow py-6 bg-white/10 text-white rounded-2xl font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 text-xs border border-white/20">
                Home
              </button>
            </div>
          </div>
        </div>

        {/* Ad Sense Post-Quiz Unit */}
        <AdSenseUnit slot="quiz-result-bottom" className="rounded-3xl border border-gold/10 overflow-hidden" />

        <div className="bg-white dark:bg-pakgreen-dark/40 rounded-[40px] shadow-2xl border border-pakgreen/10 dark:border-gold/10 p-8 sm:p-16">
          <div className="flex items-center gap-4 mb-10">
            <MessageSquare className="h-6 w-6 text-gold-light" />
            <h3 className="text-xl font-black text-pakgreen dark:text-gold-light uppercase tracking-tighter">Student Feedback</h3>
          </div>
          {!feedbackSubmitted ? (
            <form onSubmit={handleFeedbackSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input required value={feedbackForm.name} onChange={e => setFeedbackForm({...feedbackForm, name: e.target.value})} className="w-full bg-zinc-50 dark:bg-pakgreen-deepest border-2 border-zinc-200 dark:border-gold/10 p-5 rounded-2xl text-sm font-medium outline-none text-zinc-800 dark:text-white" placeholder="Name" />
                <input type="email" value={feedbackForm.email} onChange={e => setFeedbackForm({...feedbackForm, email: e.target.value})} className="w-full bg-zinc-50 dark:bg-pakgreen-deepest border-2 border-zinc-200 dark:border-gold/10 p-5 rounded-2xl text-sm font-medium outline-none text-zinc-800 dark:text-white" placeholder="Email (Optional)" />
              </div>
              <textarea required value={feedbackForm.comment} onChange={e => setFeedbackForm({...feedbackForm, comment: e.target.value})} rows={4} className="w-full bg-zinc-50 dark:bg-pakgreen-deepest border-2 border-zinc-200 dark:border-gold/10 p-6 rounded-2xl text-sm font-medium outline-none text-zinc-800 dark:text-white" placeholder="Comments..." />
              <button type="submit" disabled={isSubmittingFeedback} className="w-full py-5 bg-pakgreen dark:bg-gold-light text-white dark:text-pakgreen rounded-2xl font-black uppercase text-[10px] tracking-[0.4em] flex items-center justify-center gap-4">
                {isSubmittingFeedback ? 'Processing...' : 'Submit Feedback'} <Send className="h-4 w-4" />
              </button>
            </form>
          ) : (
            <div className="py-12 text-center">
               <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-6" />
               <h4 className="text-2xl font-black text-pakgreen dark:text-white uppercase">Thank you!</h4>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (shuffledQuestions.length === 0) return null;
  const currentQuestion = shuffledQuestions[currentQuestionIndex];
  const selectedAnswer = answers[currentQuestionIndex];

  return (
    <div className="max-w-4xl mx-auto px-4 animate-in fade-in">
      <div className="mb-12 border-b-4 border-gold/20 pb-8 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-pakgreen dark:text-gold-light uppercase">{quiz.title}</h2>
          <p className="text-[11px] text-zinc-500 font-black uppercase tracking-widest">Question {currentQuestionIndex + 1} / {shuffledQuestions.length}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-pakgreen-dark/40 rounded-[40px] shadow-2xl p-8 sm:p-16">
        <p className="text-xl sm:text-2xl text-pakgreen dark:text-white font-black mb-14 border-l-8 border-gold-light pl-10">{currentQuestion.text}</p>
        <div className="grid grid-cols-1 gap-6">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedAnswer === idx;
            const isCorrect = idx === currentQuestion.correctAnswer;
            let btnStyle = "w-full p-6 sm:p-8 text-left border-2 rounded-2xl font-black transition-all flex justify-between items-center ";
            if (selectedAnswer === null) btnStyle += "bg-zinc-50 dark:bg-pakgreen-deepest border-zinc-200 dark:border-gold/10 hover:border-gold-light text-zinc-700 dark:text-zinc-300";
            else if (isSelected) btnStyle += isCorrect ? "bg-emerald-500/10 border-emerald-500 text-emerald-600" : "bg-rose-500/10 border-rose-500 text-rose-500";
            else if (isCorrect) btnStyle += "bg-emerald-500/5 border-emerald-500/50 text-emerald-500/60";
            else btnStyle += "opacity-30";

            return (
              <button key={idx} disabled={selectedAnswer !== null} onClick={() => {
                const newAnswers = [...answers];
                newAnswers[currentQuestionIndex] = idx;
                setAnswers(newAnswers);
                if (idx === currentQuestion.correctAnswer) setCorrectCount(prev => prev + 1);
              }} className={btnStyle}>
                <div className="flex items-center gap-6">
                  <div className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center ${isSelected ? 'bg-current text-white' : 'text-zinc-400'}`}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            );
          })}
        </div>
        {selectedAnswer !== null && (
          <div className="mt-14 flex flex-col gap-6">
            <div className="p-6 bg-gold/10 rounded-2xl border border-gold/20">
              <span className="text-[10px] font-black uppercase tracking-widest text-gold-dark block mb-2">Explanation</span>
              <p className="text-zinc-700 dark:text-zinc-300 text-xs">{currentQuestion.explanation || "Correct answer identified."}</p>
            </div>
            <button onClick={() => { if (currentQuestionIndex < shuffledQuestions.length - 1) setCurrentQuestionIndex(prev => prev + 1); else setIsFinished(true); }} className="ml-auto bg-pakgreen dark:bg-gold-light text-white dark:text-pakgreen px-12 py-6 rounded-2xl font-black uppercase text-[11px] tracking-[0.3em]">
              {currentQuestionIndex === shuffledQuestions.length - 1 ? 'Finish' : 'Next Question'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizModule;
