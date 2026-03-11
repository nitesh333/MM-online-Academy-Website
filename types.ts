
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

export interface Topic {
  id: string;
  name: string;
  categoryId: string; // Links to SubCategory.id (e.g., 'lat')
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
  topicId?: string; // Optional link to a specific sub-category topic
  questions: Question[];
  videoUrl?: string; // Optional YouTube video link for the result page
  orderNumber?: number; // Numerical order for series arrangement
  seoKeywords?: string;
  seoTags?: string;
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
  topicId?: string;
  type: 'PDF' | 'Image';
  seoKeywords?: string;
  seoTags?: string;
}

export interface Notification {
  id: string;
  title: string;
  date: string;
  content: string;
  type: 'Test Date' | 'Result' | 'News';
  attachmentUrl?: string; // Base64 image
  linkedQuizId?: string; // ID of quiz to link to this news
  seoKeywords?: string;
  seoTags?: string;
}

export interface PrivateAd {
  id: string;
  imageUrl: string;
  text: string;
  clickUrl: string;
  isVisible: boolean;
  placement: 'header' | 'sidebar' | 'content' | 'footer';
}

export interface Article {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  category: string;
  date: string;
  author?: string;
  seoKeywords?: string;
  seoTags?: string;
}

export interface AppState {
  view: 'home' | 'category' | 'quiz' | 'admin' | 'notifications' | 'contact';
  selectedSubCategory?: string;
  selectedQuiz?: string;
  selectedNewsId?: string;
  isAdmin: boolean;
}