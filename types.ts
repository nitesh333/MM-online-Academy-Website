
export enum CategoryType {
  LAW = 'Law',
  GENERAL = 'General/Admission',
  ADMIN = 'Admin'
}

export interface SubCategory {
  id: string;
  name: string;
  description: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number; // Index of the correct option
  explanation?: string; // Optional explanation for the answer
}

export interface Quiz {
  id: string;
  title: string;
  subCategoryId: string;
  questions: Question[];
  videoUrl?: string; // Optional YouTube video link for the result page
}

export interface QuizFeedback {
  id: string;
  quizId: string;
  quizTitle: string;
  studentName: string;
  studentEmail: string;
  comment: string;
  date: string;
  isVisible: boolean; // Controls if students can see this comment
}

export interface StudyNote {
  id: string;
  title: string;
  url: string;
  subCategoryId: string;
  type: 'PDF' | 'Image';
}

export interface Notification {
  id: string;
  title: string;
  date: string;
  content: string;
  type: 'Test Date' | 'Result' | 'News';
  pdfUrl?: string; // Attached document URL
}

export interface AppState {
  view: 'home' | 'category' | 'quiz' | 'admin' | 'notifications' | 'contact';
  selectedSubCategory?: string;
  selectedQuiz?: string;
  isAdmin: boolean;
}
