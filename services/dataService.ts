import { Notification, SubCategory, Topic, Quiz, StudyNote, QuizFeedback } from '../types';

const API_BASE_URL = './api.php'; 

export const dataService = {
  async request(endpoint: string, method: string = 'GET', body?: any) {
    const segments = endpoint.split('/').filter(Boolean);
    const route = segments[0];
    const id = segments[1];
    
    // Cache busting
    const ts = Date.now();
    let url = `${API_BASE_URL}?route=${encodeURIComponent(route)}&_t=${ts}`;
    if (id) url += `&id=${encodeURIComponent(id)}`;

    try {
      const response = await fetch(url, {
        method,
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Malformed Response:", text);
        throw new Error("Server communication error.");
      }

      if (!response.ok) {
        throw new Error(data.error || `System Error: ${response.status}`);
      }

      return data;
    } catch (error: any) {
      console.error("[DataService.request] Critical Failure:", error);
      throw error;
    }
  },

  getBulkData: () => dataService.request('/bulk'),
  testConnection: () => dataService.request('/db_test'),
  repairDatabase: () => dataService.request('/initialize_db'),
  
  login: (username: string, password: string) => 
    dataService.request('/login', 'POST', { username, password }),

  getNotifications: () => dataService.request('/notifications'),
  addNotification: (n: Notification) => dataService.request('/notifications', 'POST', n),
  deleteNotification: (id: string) => dataService.request(`/notifications/${id}`, 'DELETE'),

  getCategories: () => dataService.request('/categories'),
  addCategory: (c: SubCategory) => dataService.request('/categories', 'POST', c),
  deleteCategory: (id: string) => dataService.request(`/categories/${id}`, 'DELETE'),

  // New Topics (Sub-Category) Endpoints
  getTopics: () => dataService.request('/topics'),
  addTopic: (t: Topic) => dataService.request('/topics', 'POST', t),
  deleteTopic: (id: string) => dataService.request(`/topics/${id}`, 'DELETE'),

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