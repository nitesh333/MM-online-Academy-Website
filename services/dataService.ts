import { Notification, SubCategory, Quiz, StudyNote, QuizFeedback } from '../types';

/**
 * CONFIGURATION:
 * Pointing to your live Hoster PK domain.
 */
const API_BASE_URL = 'https://mmtestpreparation.com/api.php'; 

export const dataService = {
  async request(endpoint: string, method: string = 'GET', body?: any) {
    const segments = endpoint.split('/').filter(Boolean);
    const route = segments[0];
    const id = segments[1];
    
    let url = `${API_BASE_URL}?route=${route}`;
    if (id) url += `&id=${id}`;

    try {
      const response = await fetch(url, {
        method,
        mode: 'cors', // Explicitly enable CORS
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: body ? JSON.stringify(body) : undefined
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }

      const data = await response.json();
      if (method === 'GET' && !id) {
        return Array.isArray(data) ? data : [];
      }
      return data;
    } catch (error) {
      console.error("API Request Failed:", error);
      // Return empty structures to avoid app crashes
      if (method === 'GET' && !id) return [];
      return null;
    }
  },

  getNotifications: () => dataService.request('/notifications'),
  addNotification: (n: Notification) => dataService.request('/notifications', 'POST', n),
  deleteNotification: (id: string) => dataService.request(`/notifications/${id}`, 'DELETE'),

  getCategories: () => dataService.request('/categories'),
  addCategory: (c: SubCategory) => dataService.request('/categories', 'POST', c),
  deleteCategory: (id: string) => dataService.request(`/categories/${id}`, 'DELETE'),

  getQuizzes: () => dataService.request('/quizzes'),
  addQuiz: (q: Quiz) => dataService.request('/quizzes', 'POST', q),
  deleteQuiz: (id: string) => dataService.request(`/quizzes/${id}`, 'DELETE'),
  
  getNotes: () => dataService.request('/notes'),
  addNote: (n: StudyNote) => dataService.request('/notes', 'POST', n),
  deleteNote: (id: string) => dataService.request(`/notes/${id}`, 'DELETE'),

  saveQuizFeedback: (f: QuizFeedback) => dataService.request('/feedback', 'POST', f),
  getQuizFeedbacks: () => dataService.request('/feedback'),
  updateQuizFeedback: (id: string, updates: Partial<QuizFeedback>) => dataService.request(`/feedback/${id}`, 'PUT', updates),
  deleteQuizFeedback: (id: string) => dataService.request(`/feedback/${id}`, 'DELETE'),
};