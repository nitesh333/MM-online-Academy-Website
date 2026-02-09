
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Trash2, Loader2, Database, Activity, RefreshCw, FileUp, FileText, CheckCircle2, AlertCircle, UploadCloud, Sparkles, Eye, EyeOff, MessageSquare, Image as ImageIcon, Settings, Plus, Link as LinkIcon } from 'lucide-react';
import { Notification, SubCategory, Quiz, Question, QuizFeedback } from '../types';
import { dataService } from '../services/dataService';
import { parserService } from '../services/parserService';
import { parseQuizFromText } from '../services/geminiService';

const AdminInput = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input 
    {...props}
    className={`w-full p-3 border border-slate-700 rounded text-sm bg-slate-800 text-white focus:border-blue-500 outline-none transition-all ${className || ''}`}
  />
);

const AdminSelect = ({ children, className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select 
    {...props}
    className={`w-full p-3 border border-slate-700 rounded text-sm bg-slate-800 text-white focus:border-blue-500 outline-none transition-all ${className || ''}`}
  >
    {children}
  </select>
);

interface AdminPanelProps {
  notifications: Notification[];
  categories: SubCategory[];
  quizzes: Quiz[];
  onAddNotification: (n: Notification) => Promise<void>;
  onDeleteNotification: (id: string) => void;
  onAddCategory: (c: SubCategory) => void;
  onDeleteCategory: (id: string) => void;
  onAddQuiz: (q: Quiz) => void;
  onDeleteQuiz: (id: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  notifications, categories, quizzes,
  onAddNotification, onDeleteNotification,
  onAddCategory, onDeleteCategory,
  onAddQuiz, onDeleteQuiz
}) => {
  const [activeTab, setActiveTab] = useState<'notifications' | 'categories' | 'quizzes' | 'moderation' | 'account'>('notifications');
  const [isRepairing, setIsRepairing] = useState(false);
  const [dbStatus, setDbStatus] = useState<string>('Testing...');
  const [feedbacks, setFeedbacks] = useState<QuizFeedback[]>([]);
  
  const [isParsing, setIsParsing] = useState(false);
  const [parsingStep, setParsingStep] = useState<string>('');
  const [parsedQuestions, setParsedQuestions] = useState<Partial<Question>[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const newsAttachmentRef = useRef<HTMLInputElement>(null);
  const [isPublishingNews, setIsPublishingNews] = useState(false);
  const [newsForm, setNewsForm] = useState<{title: string; content: string; type: Notification['type']; attachmentUrl: string; linkedQuizId: string}>({ 
    title: '', content: '', type: 'News', attachmentUrl: '', linkedQuizId: '' 
  });

  const [catForm, setCatForm] = useState({ name: '', description: '' });

  const [manualQuizForm, setManualQuizForm] = useState<{
    title: string;
    subCategoryId: string;
    videoUrl: string;
    questions: { text: string; options: string[]; correctAnswer: number; explanation?: string }[];
  }>({
    title: '',
    subCategoryId: '',
    videoUrl: '',
    questions: [{ text: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }]
  });

  useEffect(() => {
    if (categories.length > 0 && !manualQuizForm.subCategoryId) {
      setManualQuizForm(prev => ({ ...prev, subCategoryId: categories[0].id }));
    }
  }, [categories]);

  const loadFeedbacks = useCallback(async () => {
    try {
      const data = await dataService.getQuizFeedbacks();
      setFeedbacks(data || []);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => { 
    checkHealth();
    loadFeedbacks();
  }, [loadFeedbacks]);

  const checkHealth = async () => {
    try {
      const res = await dataService.testConnection();
      setDbStatus(res.success ? 'Operational' : 'Offline');
    } catch { setDbStatus('Fault'); }
  };

  const handleNewsAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      alert("Only image attachments are allowed for News.");
      if (newsAttachmentRef.current) newsAttachmentRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setNewsForm(prev => ({ ...prev, attachmentUrl: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsParsing(true);
    setParseError(null);
    setParsingStep('Reading document...');
    try {
      const text = await parserService.extractTextFromFile(file);
      setParsingStep('AI Engine: Extracting...');
      const aiResults = await parseQuizFromText(text);
      if (aiResults.length === 0) {
        setParsingStep('Fallback pattern matching...');
        const fbResults = parserService.parseMCQs(text);
        if (fbResults.length === 0) throw new Error("No MCQs identified.");
        setParsedQuestions(fbResults);
        populateQuizForm(fbResults);
      } else {
        setParsedQuestions(aiResults);
        populateQuizForm(aiResults);
      }
    } catch (err: any) { setParseError(err.message || "Engine failure."); }
    finally { setIsParsing(false); setParsingStep(''); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const populateQuizForm = (qs: Partial<Question>[]) => {
    setManualQuizForm(prev => ({ 
      ...prev, 
      questions: qs.map(q => ({
        text: q.text || '',
        options: q.options && q.options.length >= 4 ? q.options.slice(0, 4) : ['', '', '', ''],
        correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : 0,
        explanation: q.explanation || ''
      }))
    }));
  };

  const toggleFeedback = async (fb: QuizFeedback) => {
    const vis = fb.isVisible === true || String(fb.isVisible) === '1';
    await dataService.updateQuizFeedback(fb.id, { isVisible: !vis });
    loadFeedbacks();
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 min-h-[600px] flex flex-col shadow-2xl">
      <div className="flex bg-slate-950/50 border-b border-slate-800 overflow-x-auto no-scrollbar">
        {[
          { id: 'notifications', label: 'News Management' },
          { id: 'categories', label: 'Categories' },
          { id: 'quizzes', label: 'Assessments' },
          { id: 'moderation', label: 'Reviews' },
          { id: 'account', label: 'System' }
        ].map((tab) => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id as any)} 
            className={`px-8 py-4 font-black text-[10px] uppercase tracking-widest border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id ? 'border-gold text-gold bg-slate-900' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-8 flex-grow">
        {activeTab === 'notifications' && (
          <div className