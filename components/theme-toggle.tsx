
import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

interface ThemeToggleProps {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, toggleTheme }) => {
  return (
    <button
      onClick={toggleTheme}
      className="relative w-16 h-8 rounded-full bg-zinc-200 dark:bg-pakgreen-dark/80 border border-zinc-300 dark:border-gold/30 p-1 flex items-center cursor-pointer transition-colors duration-500 shadow-inner group"
      aria-label="Toggle Theme"
    >
      <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-gold/5 to-gold/10 pointer-events-none" />
      
      <motion.div
        animate={{
          x: theme === 'dark' ? 32 : 0,
          rotate: theme === 'dark' ? 360 : 0
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="z-10 w-6 h-6 rounded-full bg-white dark:bg-gold shadow-lg flex items-center justify-center text-pakgreen dark:text-pakgreen-deepest"
      >
        {theme === 'dark' ? (
          <Moon className="h-3.5 w-3.5 fill-current" />
        ) : (
          <Sun className="h-3.5 w-3.5 fill-current" />
        )}
      </motion.div>
      
      <div className="flex-grow flex justify-around items-center px-1">
        <Sun className={`h-3 w-3 transition-opacity duration-500 ${theme === 'dark' ? 'opacity-30' : 'opacity-0'}`} />
        <Moon className={`h-3 w-3 transition-opacity duration-500 ${theme === 'light' ? 'opacity-30' : 'opacity-0'}`} />
      </div>
    </button>
  );
};

export default ThemeToggle;
