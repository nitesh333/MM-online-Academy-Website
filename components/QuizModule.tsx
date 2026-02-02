
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, RefreshCw, ChevronRight, FileText, Youtube, MessageSquare, Send, Mail, User, Quote, Star } from 'lucide-react';
import { Quiz, QuizFeedback, SubCategory } from '../types';
import { dataService } from '../services/dataService';

interface QuizModuleProps {
  quiz: Quiz;
  categories: SubCategory[];
  onComplete: (score: number) => void;
}

const QuizModule: React.FC<QuizModuleProps> = ({ quiz, categories, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(quiz.questions.length).fill(null));
  const [isFinished, setIsFinished] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  // Feedback State
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ name: '', email: '', comment: '' });
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const percentage = Math.round((correctCount / quiz.questions.length) * 100);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackForm.comment.trim() || !feedbackForm.name.trim()) return;
    
    setIsSubmittingFeedback(true);
    const feedback: QuizFeedback = {
      id: Date.now().toString(),
      quizId: quiz.id,
      quizTitle: quiz.title,
      studentName: feedbackForm.name,
      studentEmail: feedbackForm.email || 'anonymous@student.pk',
      comment: feedbackForm.comment,
      date: new Date().toLocaleDateString(),
      isVisible: false // Admin must approve it
    };

    await dataService.saveQuizFeedback(feedback);
    setFeedbackSubmitted(true);
    setIsSubmittingFeedback(false);
  };

  if (isFinished) {
    return (
      <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="bg-pakgreen dark:bg-pakgreen-dark rounded-[40px] shadow-2xl border-4 border-gold/20 p-8 sm:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 islamic-pattern opacity-10"></div>
          <div className="relative z-10">
            <div className="mb-8 inline-flex p-6 rounded-[32px] bg-gold/20 border border-gold/40 shadow-2xl">
              <CheckCircle className="h-12 w-12 text-gold-light" />
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 uppercase tracking-tighter">Assessment Complete!</h2>
            <p className="text-gold-light/60 text-[11px] font-black uppercase tracking-[0.4em] mb-12">Institutional Performance Statement</p>
            
            <div className="mb-14 p-12 bg-white/5 dark:bg-pakgreen-deepest border-2 border-gold/20 rounded-[48px] shadow-inner flex flex-col items-center">
               <span className="block text-[11px] uppercase font-black tracking-[0.5em] mb-4 text-gold-light/80">Preparation Grade</span>
               <span className="text-7xl sm:text-9xl font-black text-white dark:text-gold-light tracking-tighter">{percentage}%</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              <button 
                onClick={() => window.location.reload()}
                className="flex-grow py-6 bg-gold-light text-pakgreen rounded-2xl font-black uppercase tracking-[0.3em] hover:bg-white transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-95 text-xs"
              >
                <RefreshCw className="h-5 w-5" /> Retake Mock Assessment
              </button>
              <button 
                onClick={() => window.location.hash = ''}
                className="flex-grow py-6 bg-white/10 text-white rounded-2xl font-black uppercase tracking-[0.3em] hover:bg-white hover:text-pakgreen transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-95 text-xs border border-white/20"
              >
                Back to Campus
              </button>
            </div>
          </div>
        </div>

        {/* FEEDBACK SECTION */}
        <div className="bg-white dark:bg-pakgreen-dark/40 rounded-[40px] shadow-2xl border border-pakgreen/10 dark:border-gold/10 p-8 sm:p-16 relative overflow-hidden">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-12 w-12 rounded-2xl bg-gold-light/10 border border-gold-light/20 flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-gold-light" />
            </div>
            <div>
              <h3 className="text-xl font-black text-pakgreen dark:text-gold-light uppercase tracking-tighter">Student Feedback</h3>
              <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Submit your academic experience</p>
            </div>
          </div>

          {!feedbackSubmitted ? (
            <form onSubmit={handleFeedbackSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Full Name</label>
                  <input 
                    required 
                    value={feedbackForm.name} 
                    onChange={e => setFeedbackForm({...feedbackForm, name: e.target.value})} 
                    className="w-full bg-zinc-50 dark:bg-pakgreen-deepest border-2 border-zinc-200 dark:border-gold/10 p-5 rounded-2xl text-xs font-black uppercase tracking-widest outline-none focus:border-gold-light transition-all" 
                    placeholder="e.g. Abdullah Khan" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Email (Optional)</label>
                  <input 
                    type="email" 
                    value={feedbackForm.email} 
                    onChange={e => setFeedbackForm({...feedbackForm, email: e.target.value})} 
                    className="w-full bg-zinc-50 dark:bg-pakgreen-deepest border-2 border-zinc-200 dark:border-gold/10 p-5 rounded-2xl text-xs font-black uppercase tracking-widest outline-none focus:border-gold-light transition-all" 
                    placeholder="student@email.com" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Assessment Comments</label>
                <textarea 
                  required 
                  value={feedbackForm.comment} 
                  onChange={e => setFeedbackForm({...feedbackForm, comment: e.target.value})} 
                  rows={4} 
                  className="w-full bg-zinc-50 dark:bg-pakgreen-deepest border-2 border-zinc-200 dark:border-gold/10 p-6 rounded-2xl text-xs font-black uppercase tracking-widest outline-none focus:border-gold-light transition-all" 
                  placeholder="Share your experience with this quiz..."
                />
              </div>
              <button 
                type="submit" 
                disabled={isSubmittingFeedback}
                className="w-full py-5 bg-pakgreen dark:bg-gold-light text-white dark:text-pakgreen rounded-2xl font-black uppercase text-[10px] tracking-[0.4em] flex items-center justify-center gap-4 hover:scale-[1.02] transition-all shadow-xl disabled:opacity-50"
              >
                {isSubmittingFeedback ? 'Submitting to Registry...' : 'Submit Feedback'} <Send className="h-4 w-4" />
              </button>
            </form>
          ) : (
            <div className="py-12 text-center animate-in zoom-in-95">
               <div className="h-20 w-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                 <CheckCircle className="h-10 w-10 text-emerald-500" />
               </div>
               <h4 className="text-2xl font-black text-pakgreen dark:text-white uppercase tracking-tighter">Feedback Received</h4>
               <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-3 uppercase font-bold tracking-widest">Thank you for contributing to our academic standards.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const selectedAnswer = answers[currentQuestionIndex];

  return (
    <div className="max-w-4xl mx-auto px-4 animate-in fade-in duration-500">
      <div className="mb-12 border-b-4 border-gold/20 pb-8 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-pakgreen dark:text-gold-light uppercase tracking-tighter">{quiz.title}</h2>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-black uppercase tracking-[0.4em] mt-2">Item {currentQuestionIndex + 1} / {quiz.questions.length}</p>
        </div>
        <div className="bg-pakgreen dark:bg-gold-light/10 px-6 py-2 rounded-full text-[10px] font-black text-white dark:text-gold-light uppercase tracking-widest border border-gold/30">
          Academic Audit
        </div>
      </div>

      <div className="bg-white dark:bg-pakgreen-dark/40 rounded-[40px] shadow-2xl border border-pakgreen/10 dark:border-gold/10 p-8 sm:p-16">
        <p className="text-xl sm:text-2xl text-pakgreen dark:text-white font-black mb-14 leading-tight border-l-8 border-gold-light pl-10">
          {currentQuestion.text}
        </p>

        <div className="grid grid-cols-1 gap-6">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedAnswer === idx;
            const isCorrect = idx === currentQuestion.correctAnswer;
            
            let btnStyle = "w-full p-6 sm:p-8 text-left border-2 rounded-2xl text-[14px] sm:text-base font-black transition-all flex justify-between items-center group relative ";
            
            if (selectedAnswer === null) {
              btnStyle += "bg-zinc-50 dark:bg-pakgreen-deepest border-zinc-200 dark:border-gold/10 hover:border-pakgreen dark:hover:border-gold-light hover:shadow-xl text-zinc-700 dark:text-zinc-300";
            } else if (isSelected) {
              btnStyle += isCorrect ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 border-rose-500 text-rose-500";
            } else if (isCorrect) {
              btnStyle += "bg-emerald-500/5 border-emerald-500/50 text-emerald-500/60 dark:text-emerald-400/60";
            } else {
              btnStyle += "opacity-30 border-zinc-200 dark:border-zinc-800";
            }

            return (
              <button
                key={idx}
                disabled={selectedAnswer !== null}
                onClick={() => {
                  const newAnswers = [...answers];
                  newAnswers[currentQuestionIndex] = idx;
                  setAnswers(newAnswers);
                  if (idx === currentQuestion.correctAnswer) setCorrectCount(prev => prev + 1);
                }}
                className={btnStyle}
              >
                <div className="flex items-center gap-6">
                  <div className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center font-black transition-all ${isSelected ? 'bg-current text-white border-current' : 'border-zinc-300 dark:border-gold/20 text-zinc-400 dark:text-gold-light/40'}`}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="tracking-tight uppercase">{option}</span>
                </div>
              </button>
            );
          })}
        </div>
        
        {selectedAnswer !== null && (
          <div className="mt-14 flex justify-end">
            <button
              onClick={() => {
                if (currentQuestionIndex < quiz.questions.length - 1) setCurrentQuestionIndex(prev => prev + 1);
                else setIsFinished(true);
              }}
              className="bg-pakgreen dark:bg-gold-light text-white dark:text-pakgreen px-12 py-6 rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] flex items-center gap-4 hover:scale-105 transition-all shadow-2xl"
            >
              {currentQuestionIndex === quiz.questions.length - 1 ? 'Final Statement' : 'Continue Preparation'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizModule;
