import { Notification, SubCategory, Topic, Quiz, StudyNote, QuizFeedback, PrivateAd, Article } from '../types';

const API_BASE_URL = 'https://mmtestpreparation.com/api.php'; 

export const dataService = {
  async request(endpoint: string, method: string = 'GET', body?: any) {
    // Convert /endpoint to ?route=endpoint
    const route = endpoint.split('/')[1];
    const id = endpoint.split('/')[2];
    
    let url = `${API_BASE_URL}?route=${route}`;
    if (id) url += `&id=${id}`;

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("JSON Parse Error. Response was:", text.substring(0, 100));
        throw new Error("Invalid server response format");
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

  getPrivateAds: () => dataService.request('/ads'),
  addPrivateAd: (ad: PrivateAd) => dataService.request('/ads', 'POST', ad),
  updatePrivateAd: (id: string, updates: Partial<PrivateAd>) => dataService.request(`/ads/${id}`, 'PUT', updates),
  deletePrivateAd: (id: string) => dataService.request(`/ads/${id}`, 'DELETE'),

  getArticles: () => dataService.request('/articles'),
  addArticle: (a: Article) => dataService.request('/articles', 'POST', a),
  deleteArticle: (id: string) => dataService.request(`/articles/${id}`, 'DELETE'),
};
