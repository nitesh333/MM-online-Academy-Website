
import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { PlayCircle, ChevronRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuizSliderProps {
  quizId: string;
}

const QuizSlider: React.FC<QuizSliderProps> = ({ quizId }) => {
  const navigate = useNavigate();
  const x = useMotionValue(0);
  const [isComplete, setIsComplete] = useState(false);
  
  // The width of the slider track minus the handle width
  const sliderWidth = 240; 
  const handleWidth = 64;
  const dragRange = sliderWidth - handleWidth;

  const opacity = useTransform(x, [0, dragRange * 0.5], [1, 0]);
  const bgOpacity = useTransform(x, [0, dragRange], [0.1, 0.3]);
  const scale = useTransform(x, [0, dragRange], [1, 1.1]);

  const handleDragEnd = () => {
    if (x.get() >= dragRange * 0.9) {
      setIsComplete(true);
      setTimeout(() => {
        navigate(`/quiz/${quizId}`);
      }, 300);
    } else {
      x.set(0);
    }
  };

  return (
    <div className="relative w-full max-w-[280px] h-16 bg-zinc-100 dark:bg-white/5 rounded-2xl border border-gold/20 overflow-hidden group shadow-inner">
      <motion.div 
        style={{ opacity: bgOpacity }}
        className="absolute inset-0 bg-gold pointer-events-none"
      />
      
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.span 
          style={{ opacity }}
          className="text-[10px] font-black text-pakgreen dark:text-gold-light uppercase tracking-[0.3em] flex items-center gap-2"
        >
          Slide to Start Quiz <ChevronRight className="h-3 w-3 animate-pulse" />
        </motion.span>
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: dragRange }}
        dragElastic={0.1}
        style={{ x }}
        onDragEnd={handleDragEnd}
        className="absolute left-1 top-1 bottom-1 w-14 bg-pakgreen dark:bg-gold rounded-xl shadow-xl flex items-center justify-center cursor-grab active:cursor-grabbing z-10 border border-white/20 glow-gold"
      >
        <PlayCircle className={`h-6 w-6 ${isComplete ? 'animate-ping' : ''} text-white dark:text-pakgreen`} />
        {isComplete && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-white dark:text-pakgreen animate-spin" />
          </div>
        )}
      </motion.div>

      {/* Progress Bar */}
      <motion.div 
        style={{ width: x }}
        className="absolute left-0 top-0 bottom-0 bg-gold/20 pointer-events-none"
      />
    </div>
  );
};

export default QuizSlider;
