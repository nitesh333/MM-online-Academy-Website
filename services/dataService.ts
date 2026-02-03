import { Notification, SubCategory, Quiz, StudyNote, QuizFeedback } from '../types';

/**
 * CONFIGURATION:
 * Pointing to your live domain API with 'www' to prevent redirection issues.
 */
const API_BASE_URL = 'https://www.mmtestpreparation.com/api.php'; 

export const dataService = {
  async request(endpoint: string, method: string = 'GET', body?: any) {
    const segments = endpoint.split('/').filter(Boolean);
    const route = segments[0];
    const id = segments[1];
    
    // Construct URL with query parameters for the PHP router
    let url = `${API_BASE_URL}?route=${encodeURIComponent(route)}`;
    if (id) url += `&id=${encodeURIComponent(id)}`;

    try {
      const response = await fetch(url, {
        method,
        mode: 'cors',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: body ? JSON.stringify(body) : undefined
      });

      // Special fallback for login if POST is converted to GET or rejected with 405
      if (route === 'login' && (response.status === 405 || response.status === 404)) {
         console.warn("POST Login failed with method error, attempting GET fallback...");
         const fallbackUrl = `${url}&username=${encodeURIComponent(body.username)}&password=${encodeURIComponent(body.password)}`;
         const fallbackResponse = await fetch(fallbackUrl);
         const fallbackText = await fallbackResponse.text();
         return JSON.parse(fallbackText);
      }

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = { error: text || `HTTP ${response.status}` };
      }

      if (!response.ok) {
        throw new Error(data.error || data.debug || `HTTP ${response.status}`);
      }

      if (method === 'GET' && !id) {
        return Array.isArray(data) ? data : [];
      }
      return data;
    } catch (error: any) {
      console.error("[DataService Error]", error);
      
      // If the error happened during a POST login, try a one-time GET fallback here as well
      if (endpoint.includes('login') && method === 'POST') {
         try {
            const fallbackUrl = `${url}&username=${encodeURIComponent(body.username)}&password=${encodeURIComponent(body.password)}`;
            const fbRes = await fetch(fallbackUrl);
            return await fbRes.json();
         } catch (innerErr) {
            return { success: false, error: "Authentication system failure.", debug: error.message };
         }
      }

      if (method === 'GET' && !id) return [];
      return { success: false, error: error.message || "Connection failed", debug: error.message };
    }
  },

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