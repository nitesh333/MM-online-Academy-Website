
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Notification, Quiz, SubCategory, Topic, StudyNote, QuizFeedback, PrivateAd, Article } from '../types';
import { dataService } from '../services/dataService';
import { LAW_SUBCATEGORIES, GENERAL_SUBCATEGORIES } from '../constants';

interface DataContextType {
  notifications: Notification[];
  categories: SubCategory[];
  topics: Topic[];
  quizzes: Quiz[];
  notes: StudyNote[];
  feedbacks: QuizFeedback[];
  ads: PrivateAd[];
  articles: Article[];
  loadData: () => Promise<void>;
  isLoading: boolean;
  addNotification: (n: Notification) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  addCategory: (c: SubCategory) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addTopic: (t: Topic) => Promise<void>;
  deleteTopic: (id: string) => Promise<void>;
  addQuiz: (q: Quiz) => Promise<void>;
  deleteQuiz: (id: string) => Promise<void>;
  addNote: (n: StudyNote) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  addAd: (ad: PrivateAd) => Promise<void>;
  deleteAd: (id: string) => Promise<void>;
  updateAd: (id: string, updates: Partial<PrivateAd>) => Promise<void>;
  addArticle: (a: Article) => Promise<void>;
  deleteArticle: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [categories, setCategories] = useState<SubCategory[]>([...LAW_SUBCATEGORIES, ...GENERAL_SUBCATEGORIES]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [feedbacks, setFeedbacks] = useState<QuizFeedback[]>([]);
  const [ads, setAds] = useState<PrivateAd[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    // Try to load from cache first for instant UI
    const cachedData = localStorage.getItem('mm_academy_cache');
    if (cachedData) {
      try {
        const data = JSON.parse(cachedData);
        if (data) {
          updateStateWithData(data);
          // If we have cache, we can hide the spinner immediately
          setIsLoading(false);
        }
      } catch (e) {
        console.error("Cache Parse Error", e);
      }
    }

    try {
      const data = await dataService.getBulkData();
      if (data) {
        updateStateWithData(data);
        // Save to cache for next time
        localStorage.setItem('mm_academy_cache', JSON.stringify(data));
      }
    } catch (err) { 
      console.error("Sync Error", err); 
    } finally {
      setIsLoading(false);
    }
  }, []); // Removed isLoading dependency

  const updateStateWithData = (data: any) => {
    const mergedCategories = [...LAW_SUBCATEGORIES, ...GENERAL_SUBCATEGORIES];
    if (data.categories && data.categories.length > 0) {
      data.categories.forEach((dbCat: SubCategory) => {
        const index = mergedCategories.findIndex(c => c.id === dbCat.id);
        if (index !== -1) mergedCategories[index] = dbCat;
        else mergedCategories.push(dbCat);
      });
    }
    setCategories(mergedCategories);
    setTopics(data.topics || []);
    setNotifications(data.notifications || []);
    setQuizzes((data.quizzes || []).map((q: any) => ({
      ...q,
      questions: Array.isArray(q.questions) ? q.questions : []
    })));
    setNotes(data.notes || []);
    setFeedbacks(data.feedbacks || []);
    setAds(data.ads || []);
    setArticles(data.articles || []);
  };

  const addNotification = async (n: Notification) => { await dataService.addNotification(n); await loadData(); };
  const deleteNotification = async (id: string) => { await dataService.deleteNotification(id); await loadData(); };
  const addCategory = async (c: SubCategory) => { await dataService.addCategory(c); await loadData(); };
  const deleteCategory = async (id: string) => { await dataService.deleteCategory(id); await loadData(); };
  const addTopic = async (t: Topic) => { await dataService.addTopic(t); await loadData(); };
  const deleteTopic = async (id: string) => { await dataService.deleteTopic(id); await loadData(); };
  const addQuiz = async (q: Quiz) => { await dataService.addQuiz(q); await loadData(); };
  const deleteQuiz = async (id: string) => { await dataService.deleteQuiz(id); await loadData(); };
  const addNote = async (n: StudyNote) => { await dataService.addNote(n); await loadData(); };
  const deleteNote = async (id: string) => { await dataService.deleteNote(id); await loadData(); };
  const addAd = async (ad: PrivateAd) => { await dataService.addPrivateAd(ad); await loadData(); };
  const deleteAd = async (id: string) => { await dataService.deletePrivateAd(id); await loadData(); };
  const updateAd = async (id: string, updates: Partial<PrivateAd>) => { await dataService.updatePrivateAd(id, updates); await loadData(); };
  const addArticle = async (a: Article) => { await dataService.addArticle(a); await loadData(); };
  const deleteArticle = async (id: string) => { await dataService.deleteArticle(id); await loadData(); };

  useEffect(() => {
    loadData();
  }, []); // Only run once on mount

  return (
    <DataContext.Provider value={{ 
      notifications, categories, topics, quizzes, notes, feedbacks, ads, articles, loadData, isLoading,
      addNotification, deleteNotification, addCategory, deleteCategory, addTopic, deleteTopic,
      addQuiz, deleteQuiz, addNote, deleteNote, addAd, deleteAd, updateAd, addArticle, deleteArticle
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
