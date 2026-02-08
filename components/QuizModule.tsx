import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, RefreshCw, MessageSquare, Send, Star, Info, ChevronRight } from 'lucide-react';
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

  // Shuffling logic: runs on load and on retake
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
  }, [quiz]);

  useEffect(() => { initQuiz(); }, [initQuiz]);

  const [quizFeedbacks, setQuizFeedbacks] = useState<QuizFeedback[]>([]);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ name: '', email: '', comment: '' });
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const loadFeedbacks = useCallback(async () => {
    try {
      const all = await dataService.getQuizFeedbacks();
      if (all && Array.isArray(all)) {
        const visible = all.filter(f => f.quizId === quiz.id && (f.isVisible === true || String(f.isVisible) === '1'));
        setQuizFeedbacks(visible);
      }
    } catch (err) {
      console.error("Feedback error", err);
    }
  }, [quiz.id]);

  useEffect(() => { if (isFinished) loadFeedbacks(); }, [isFinished, loadFeedbacks]);

  const percentage = Math.round((correctCount / shuffledQuestions.length) * 100);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackForm.comment.trim() || !feedbackForm.name.trim()) return;
    setIsSubmittingFeedback(true);
    const feedback: QuizFeedback = {
      id: `fb_${Date.now()}`,
      quizId: quiz.id,
      quizTitle: quiz.title,
      studentName: feedbackForm.name.trim(),
      studentEmail: feedbackForm.email.trim() || 'student@mmacademy.pk',
      comment: feedbackForm.comment.trim(),
      date: new Date().toLocaleDateString(),
      isVisible: false 
    };
    try {
      await dataService.saveQuizFeedback(feedback);
      setFeedbackSubmitted(true);
    } catch (err) {
      alert("Error saving review.");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

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
            <div className="flex flex-col sm:flex-row gap-6">
              <button onClick={initQuiz} className="flex-grow py-6 bg-gold-light text-pakgreen rounded-2xl font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 shadow-2xl">
                <RefreshCw className="h-5 w-5" /> Retake Track
              </button>
              <button onClick={() => window.location.hash = '#home'} className="flex-grow py-6 bg-white/10 text-white rounded-2xl font-black uppercase tracking-[0.3em] border border-white/20">
                Exit Track
              </button>
            </div>
          </div>
        </div>

        <AdSlot placement="content" />

        {/* FEEDBACK LIST - Visible to students */}
        <div className="bg-white dark:bg-pakgreen-dark/20 p-8 sm:p-12 rounded-[40px] border border-gold/10">
          <h3 className="text-xl font-black text-pakgreen dark:text-gold-light uppercase tracking-tighter mb-10 flex items-center gap-3">
             <Star className="h-5 w-5 text-gold-light" /> Student Experience
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quizFeedbacks.length > 0 ? quizFeedbacks.map(f => (
              <div key={f.id} className="p-6 bg-zinc-50 dark:bg-pakgreen-deepest rounded-3xl border border-zinc-200 dark:border-gold/5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-8 w-8 rounded-full bg-pakgreen text-white flex items-center justify-center font-black text-[10px]">{f.studentName.charAt(0)}</div>
                  <span className="text-xs font-black text-pakgreen dark:text-white uppercase">{f.studentName}</span>
                </div>
                <p className="text-zinc-600 dark:text-zinc-300 text-xs italic">"{f.comment}"</p>
              </div>
            )) : <p className="text-[10px] font-black uppercase text-zinc-400">No verified reviews yet.</p>}
          </div>
        </div>

        {/* FEEDBACK FORM */}
        <div className="bg-white dark:bg-pakgreen-dark/40 rounded-[40px] shadow-2xl border border-gold/10 p-8 sm:p-16">
          <h3 className="text-xl font-black text-pakgreen dark:text-gold-light uppercase mb-10">Submit Experience</h3>
          {!feedbackSubmitted ? (
            <form onSubmit={handleFeedbackSubmit} className="space-y-6">
              <input required value={feedbackForm.name} onChange={e => setFeedbackForm({...feedbackForm, name: e.target.value})} className="w-full bg-zinc-50 dark:bg-pakgreen-deepest border-2 border-zinc-200 dark:border-gold/10 p-5 rounded-2xl text-sm outline-none dark:text-white" placeholder="Name" />
              <textarea required value={feedbackForm.comment} onChange={e => setFeedbackForm({...feedbackForm, comment: e.target.value})} rows={4} className="w-full bg-zinc-50 dark:bg-pakgreen-deepest border-2 border-zinc-200 dark:border-gold/10 p-6 rounded-2xl text-sm outline-none dark:text-white" placeholder="Comments..." />
              <button type="submit" disabled={isSubmittingFeedback} className="w-full py-5 bg-pakgreen dark:bg-gold-light text-white dark:text-pakgreen rounded-2xl font-black uppercase text-[10px] tracking-[0.4em] shadow-xl">
                {isSubmittingFeedback ? 'Syncing...' : 'Register Feedback'}
              </button>
            </form>
          ) : (
            <div className="text-center py-6"><h4 className="font-black text-pakgreen dark:text-white uppercase">Feedback Registered Successfully</h4></div>
          )}
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
            {currentQuestion.explanation && (
              <div className="w-full mb-8 p-6 bg-gold/5 border border-gold/10 rounded-2xl animate-in zoom-in-95">
                <div className="text-gold-dark dark:text-gold-light font-black text-[10px] uppercase mb-2">Rationale</div>
                <p className="text-zinc-600 dark:text-zinc-300 text-xs italic">{currentQuestion.explanation}</p>
              </div>
            )}
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