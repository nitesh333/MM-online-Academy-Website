
import { Notification, SubCategory, Quiz, StudyNote, QuizFeedback } from '../types';

// Use relative path so it works regardless of the domain name it's hosted on
const API_BASE_URL = './api.php'; 

export const dataService = {
  async request(endpoint: string, method: string = 'GET', body?: any) {
    const segments = endpoint.split('/').filter(Boolean);
    const route = segments[0];
    const id = segments[1];
    
    let url = `${API_BASE_URL}?route=${encodeURIComponent(route)}`;
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
        console.error("Non-JSON Server Response:", text);
        throw new Error("Institutional Error: Invalid response format from academic server. Ensure api.php is present and PHP is active.");
      }

      if (!response.ok) {
        throw new Error(data.error || `System Error: ${response.status}`);
      }

      return data;
    } catch (error: any) {
      console.error("[DataService.request] Critical Failure:", error);
      if (route === 'login' || route === 'db_test' || route === 'initialize_db') throw error;
      if (method === 'GET' && !id) return [];
      throw error;
    }
  },

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

  getAdmins: () => dataService.request('/admins'),
  addAdmin: (username: string, password: string) => dataService.request('/admins', 'POST', { username, password }),
  updateAdminPassword: (id: string, password: string) => dataService.request(`/admins/${id}`, 'PUT', { password }),
  deleteAdmin: (id: string) => dataService.request(`/admins/${id}`, 'DELETE'),
};
