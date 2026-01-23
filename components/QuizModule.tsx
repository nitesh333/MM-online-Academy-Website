
import React, { useState } from 'react';
import { CheckCircle, XCircle, RefreshCw, ChevronRight, FileText } from 'lucide-react';
import { Quiz } from '../types';

interface QuizModuleProps {
  quiz: Quiz;
  onComplete: (score: number) => void;
}

const QuizModule: React.FC<QuizModuleProps> = ({ quiz, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(quiz.questions.length).fill(null));
  const [isFinished, setIsFinished] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const selectedAnswer = answers[currentQuestionIndex];

  const handleOptionSelect = (optionIndex: number) => {
    if (selectedAnswer !== null) return;

    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setAnswers(newAnswers);

    if (optionIndex === currentQuestion.correctAnswer) {
      setCorrectCount(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const percentage = Math.round((correctCount / quiz.questions.length) * 100);

  if (isFinished) {
    return (
      <div className="bg-white rounded-md shadow-sm border border-gray-200 p-10 text-center max-w-2xl mx-auto animate-in fade-in">
        <div className="mb-6 inline-flex p-4 rounded-full bg-blue-50">
          <CheckCircle className="h-12 w-12 text-[#1a2b48]" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">Assessment Completed!</h2>
        <p className="text-gray-500 text-sm mb-10 font-medium">Your preparation performance summary is below.</p>
        
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-[#f9f9f9] p-6 border-b-4 border-green-500">
            <span className="block text-3xl font-black text-gray-900">{correctCount}</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Correct Answers</span>
          </div>
          <div className="bg-[#f9f9f9] p-6 border-b-4 border-red-500">
            <span className="block text-3xl font-black text-gray-900">{quiz.questions.length - correctCount}</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Wrong Answers</span>
          </div>
        </div>

        <div className="mb-10 p-6 bg-[#1a2b48] text-white rounded-md">
           <span className="block text-[10px] uppercase font-bold tracking-[0.3em] mb-2 opacity-60">Final Success Score</span>
           <span className="text-4xl font-black">{percentage}%</span>
        </div>

        <button 
          onClick={() => window.location.reload()}
          className="w-full py-4 bg-[#1a2b48] text-white rounded font-bold uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-3 shadow-md"
        >
          <RefreshCw className="h-4 w-4" /> Restart Preparation
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex items-end justify-between border-b-2 border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-[#1a2b48] uppercase tracking-tight flex items-center gap-2">
            <FileText className="h-5 w-5" /> {quiz.title}
          </h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">Item {currentQuestionIndex + 1} of {quiz.questions.length}</p>
        </div>
        <div className="px-4 py-1.5 bg-[#f9f9f9] text-[#1a2b48] border border-gray-100 text-[9px] font-black uppercase tracking-widest">
          Time: No Limit
        </div>
      </div>

      <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-10">
          <p className="text-lg text-gray-800 font-bold mb-10 leading-relaxed border-l-4 border-[#1a2b48] pl-6">
            {currentQuestion.text}
          </p>

          <div className="grid grid-cols-1 gap-4">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedAnswer === idx;
              const isCorrect = idx === currentQuestion.correctAnswer;
              
              let btnStyle = "w-full p-5 text-left border-2 rounded text-sm font-bold transition-all flex justify-between items-center group ";
              
              if (selectedAnswer === null) {
                btnStyle += "bg-white border-gray-100 hover:border-[#1a2b48] hover:bg-[#f9f9f9]";
              } else if (isSelected) {
                btnStyle += isCorrect ? "bg-green-50 border-green-500 text-green-800" : "bg-red-50 border-red-500 text-red-800";
              } else if (isCorrect) {
                btnStyle += "bg-green-50 border-green-500 text-green-800 opacity-60";
              } else {
                btnStyle += "bg-white border-gray-100 opacity-40";
              }

              return (
                <button
                  key={idx}
                  disabled={selectedAnswer !== null}
                  onClick={() => handleOptionSelect(idx)}
                  className={btnStyle}
                >
                  <span className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] ${isSelected ? 'border-current' : 'border-gray-200'}`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    {option}
                  </span>
                  {selectedAnswer !== null && isCorrect && <CheckCircle className="h-5 w-5" />}
                  {selectedAnswer !== null && isSelected && !isCorrect && <XCircle className="h-5 w-5" />}
                </button>
              );
            })}
          </div>
        </div>

        {selectedAnswer !== null && (
          <div className="p-6 bg-[#f9f9f9] border-t border-gray-100 flex justify-end">
            <button
              onClick={nextQuestion}
              className="flex items-center gap-2 px-10 py-4 bg-[#1a2b48] text-white rounded font-bold uppercase tracking-widest hover:bg-black transition-all shadow-md"
            >
              {currentQuestionIndex === quiz.questions.length - 1 ? 'Show Final Performance' : 'Save & Next'}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      
      {/* Quiz Ad Space */}
      <div className="mt-8 w-full bg-white p-4 border border-dashed border-gray-300 text-center text-[10px] font-bold text-gray-300 uppercase italic">
        Contextual Test Ad Unit
      </div>
    </div>
  );
};

export default QuizModule;
