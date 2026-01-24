
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
}

export interface Quiz {
  id: string;
  title: string;
  subCategoryId: string;
  questions: Question[];
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
}

export interface AppState {
  view: 'home' | 'category' | 'quiz' | 'admin' | 'notifications';
  selectedSubCategory?: string;
  selectedQuiz?: string;
  isAdmin: boolean;
}
