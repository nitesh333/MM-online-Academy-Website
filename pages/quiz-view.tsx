
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import QuizModule from '../components/quiz-module';

const QuizView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { quizzes, categories, loadData } = useData();
  
  const quiz = quizzes.find(q => q.id === id);

  useEffect(() => {
    if (quiz) {
      // KEYWORDS: Update dynamic targeting for this specific assessment
      document.title = `${quiz.title} - MM Academy Preparation`;
      
      const metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords) {
        metaKeywords.setAttribute('content', `${quiz.title}, mock test, assessment, ${quiz.subCategoryId}, MM Academy preparation`);
      }

      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', `Take the ${quiz.title} mock test on MM Academy. Prepare for SPSC, MDCAT, and ECAT with our expert-curated assessments.`);
      }
    }
    return () => {
      document.title = 'MM Academy - Pakistan\'s Elite Legal Portal';
    };
  }, [quiz]);

  const handleQuizComplete = () => {
    // TAGS: Track Conversion (Quiz Completion)
    // @ts-ignore
    if (typeof window.gtag === 'function') {
      // @ts-ignore
      window.gtag('event', 'quiz_complete', {
        'event_category': 'Engagement',
        'event_label': quiz?.title || 'Unknown Quiz'
      });
    }
    loadData();
  };

  if (!quiz) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-black text-pakgreen dark:text-white uppercase">Assessment Not Found</h2>
      </div>
    );
  }

  return (
    <QuizModule 
      quiz={quiz} 
      quizzes={quizzes} 
      categories={categories} 
      onComplete={handleQuizComplete} 
    />
  );
};

export default QuizView;
