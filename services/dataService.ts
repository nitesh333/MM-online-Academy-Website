
import { Notification, SubCategory, Quiz, StudyNote } from '../types';
import { LAW_SUBCATEGORIES, GENERAL_SUBCATEGORIES, INITIAL_NOTIFICATIONS, MOCK_QUIZ } from '../constants';

const API_BASE_URL = ''; 

export const dataService = {
  async request(endpoint: string, method: string = 'GET', body?: any) {
    if (!API_BASE_URL) {
      return this.handleLocalFallback(endpoint, method, body);
    }
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    });
    return response.json();
  },

  handleLocalFallback(endpoint: string, method: string, body?: any) {
    const key = endpoint.split('/')[1];
    const data = localStorage.getItem(`pa_${key}`);
    let list = data ? JSON.parse(data) : this.getDefaultData(key);

    if (method === 'GET') return list;
    if (method === 'POST') {
      const newList = [body, ...list];
      localStorage.setItem(`pa_${key}`, JSON.stringify(newList));
      return newList;
    }
    if (method === 'DELETE') {
      const id = endpoint.split('/').pop();
      const newList = list.filter((item: any) => item.id !== id);
      localStorage.setItem(`pa_${key}`, JSON.stringify(newList));
      return newList;
    }
  },

  getDefaultData(key: string) {
    if (key === 'notifications') return INITIAL_NOTIFICATIONS;
    if (key === 'categories') return [...LAW_SUBCATEGORIES, ...GENERAL_SUBCATEGORIES];
    if (key === 'quizzes') return [MOCK_QUIZ];
    if (key === 'notes') return [
      { id: 'note1', title: 'Pakistan Constitution Overview', url: 'https://www.pakistanconstitutionlaw.com/wp-content/uploads/2015/05/Constitution-of-Pakistan-1973.pdf', subCategoryId: 'law-gat', type: 'PDF' }
    ];
    return [];
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
};
