
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Trash2, Loader2, Database, Activity, FileText, CheckCircle2, UploadCloud, MessageSquare, Image as ImageIcon, Plus, Settings, Eye, EyeOff, LogOut, Download, FolderTree, ListOrdered, Edit3, XCircle, Trash, Type as TypeIcon, Sparkles, Image as ImageLucide, Megaphone, ChevronRight, Clock, Mail, Layout } from 'lucide-react';
import { Notification, SubCategory, Topic, Quiz, Question, QuizFeedback, StudyNote, PrivateAd, Article, ArticleType, HomepageSettings } from '../types';
import { dataService } from '../services/dataService';
import { parserService } from '../services/parserService';
import { parseQuizFromText, humanizeContent } from '../services/geminiService';

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

const TagInput = ({ value, onChange, placeholder }: { value: string, onChange: (val: string) => void, placeholder?: string }) => {
  const [inputValue, setInputValue] = useState('');
  const tags = value ? value.split(',').map(t => t.trim()).filter(t => t !== '') : [];

  const addTag = (val: string) => {
    const trimmed = val.trim().replace(/,$/, '');
    if (trimmed && !tags.includes(trimmed)) {
      const newTags = [...tags, trimmed];
      onChange(newTags.join(', '));
    }
    setInputValue('');
  };

  const removeTag = (index: number) => {
    const newTags = tags.filter((_, i) => i !== index);
    onChange(newTags.join(', '));
  };

  return (
    <div className="flex flex-wrap gap-2 p-3 bg-slate-800 border border-slate-700 rounded-xl min-h-[44px] items-center focus-within:border-gold/50 transition-all">
      {tags.map((tag, i) => (
        <span key={i} className="bg-gold/10 text-gold-light px-3 py-1 rounded-full text-[9px] font-black uppercase flex items-center gap-2 border border-gold/20">
          {tag}
          <button type="button" onClick={() => removeTag(i)} className="hover:text-white transition-colors">
            <XCircle className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => {
          const val = e.target.value;
          if (val.endsWith(',')) {
            addTag(val);
          } else {
            setInputValue(val);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            addTag(inputValue);
          } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
            removeTag(tags.length - 1);
          }
        }}
        onBlur={() => addTag(inputValue)}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="flex-grow bg-transparent outline-none text-white text-xs min-w-[120px] placeholder:text-zinc-500"
      />
    </div>
  );
};

interface AdminPanelProps {
  notifications: Notification[];
  categories: SubCategory[];
  topics?: Topic[];
  quizzes: Quiz[];
  notes: StudyNote[];
  onAddNotification: (n: Notification) => Promise<void>;
  onDeleteNotification: (id: string) => void;
  onAddCategory: (c: SubCategory) => void;
  onDeleteCategory: (id: string) => void;
  onAddTopic?: (t: Topic) => void;
  onDeleteTopic?: (id: string) => void;
  onAddQuiz: (q: Quiz) => void;
  onDeleteQuiz: (id: string) => void;
  onAddNote: (n: StudyNote) => Promise<void>;
  onDeleteNote: (id: string) => void;
  ads: PrivateAd[];
  onAddAd: (ad: PrivateAd) => Promise<void>;
  onDeleteAd: (id: string) => Promise<void>;
  onUpdateAd: (id: string, updates: Partial<PrivateAd>) => Promise<void>;
  articles: Article[];
  onAddArticle: (a: Article) => Promise<void>;
  onDeleteArticle: (id: string) => Promise<void>;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  notifications, categories, topics = [], quizzes, notes,
  onAddNotification, onDeleteNotification,
  onAddCategory, onDeleteCategory,
  onAddTopic = () => {}, onDeleteTopic = () => {},
  onAddQuiz, onDeleteQuiz,
  onAddNote, onDeleteNote,
  ads, onAddAd, onDeleteAd, onUpdateAd,
  articles, onAddArticle, onDeleteArticle
}) => {
  const [activeTab, setActiveTab] = useState<'notifications' | 'categories' | 'topics' | 'quizzes' | 'notes' | 'articles' | 'exam-prep' | 'study-guides' | 'moderation' | 'inquiries' | 'ads' | 'account' | 'homepage'>('notifications');
  const [isRepairing, setIsRepairing] = useState(false);
  const [dbStatus, setDbStatus] = useState<string>('Testing...');
  const [feedbacks, setFeedbacks] = useState<QuizFeedback[]>([]);
  
  const [isParsing, setIsParsing] = useState(false);
  const [isHumanizing, setIsHumanizing] = useState(false);
  const [humanizerData, setHumanizerData] = useState<{
    original: string;
    humanized: string;
    onApply: (val: string) => void;
  } | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [parsingStep, setParsingStep] = useState<string>('');
  const [parseError, setParseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const newsAttachmentRef = useRef<HTMLInputElement>(null);
  const [isPublishingNews, setIsPublishingNews] = useState(false);
  const [newsForm, setNewsForm] = useState<{title: string; content: string; type: Notification['type']; attachmentUrl: string; linkedQuizId: string; seoKeywords: string; seoTags: string}>({ 
    title: '', content: '', type: 'News', attachmentUrl: '', linkedQuizId: '', seoKeywords: '', seoTags: '' 
  });

  const [catForm, setCatForm] = useState({ name: '', description: '' });
  const [topicForm, setTopicForm] = useState({ name: '', categoryId: '' });

  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [editingNotificationId, setEditingNotificationId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [manualQuizForm, setManualQuizForm] = useState<{
    title: string;
    subCategoryId: string;
    topicId: string;
    orderNumber: number;
    videoUrl: string;
    questions: Question[];
    seoKeywords: string;
    seoTags: string;
  }>({
    title: '',
    subCategoryId: '',
    topicId: '',
    orderNumber: 0,
    videoUrl: '',
    questions: [{ id: `q_init_${Date.now()}`, text: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }],
    seoKeywords: '',
    seoTags: ''
  });

  const [noteForm, setNoteForm] = useState<{ title: string; subCategoryId: string; topicId: string; fileData: string; seoKeywords: string; seoTags: string }>({
    title: '', subCategoryId: '', topicId: '', fileData: '', seoKeywords: '', seoTags: ''
  });
  const [isUploadingNote, setIsUploadingNote] = useState(false);
  const noteFileRef = useRef<HTMLInputElement>(null);

  const [adForm, setAdForm] = useState<{imageUrl: string; text: string; clickUrl: string; placement: PrivateAd['placement']}>({
    imageUrl: '', text: '', clickUrl: '', placement: 'content'
  });
  const [isPublishingAd, setIsPublishingAd] = useState(false);
  const adImageRef = useRef<HTMLInputElement>(null);
  const [editingAdId, setEditingAdId] = useState<string | null>(null);

  const [articleForm, setArticleForm] = useState<{title: string; content: string; category: string; type: ArticleType; imageUrl: string; seoKeywords: string; seoTags: string}>({
    title: '', content: '', category: '', type: ArticleType.ARTICLE, imageUrl: '', seoKeywords: '', seoTags: ''
  });
  const [isPublishingArticle, setIsPublishingArticle] = useState(false);
  const articleImageRef = useRef<HTMLInputElement>(null);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);

  const [homepageForm, setHomepageForm] = useState<HomepageSettings>({
    heroTitle: 'Master Your Future with MM Academy',
    heroDescription: 'The ultimate educational platform for Law and Admission test preparation. Access premium study materials, expert guides, and interactive assessments.',
    footerDescription: 'MM Academy is a premier educational platform dedicated to helping students excel in their academic pursuits. We provide high-quality study materials, expert-led courses, and comprehensive test preparation resources.',
    ctaText: 'Start Learning Now',
    ctaLink: '/subjects'
  });
  const [isSavingHomepage, setIsSavingHomepage] = useState(false);

  useEffect(() => {
    const settings = articles.find(a => a.id === 'homepage_settings');
    if (settings) {
      try {
        const parsed = JSON.parse(settings.content);
        setHomepageForm(parsed);
      } catch (e) {
        console.error("Failed to parse homepage settings", e);
      }
    }
  }, [articles]);

  useEffect(() => {
    if (categories.length > 0) {
      if (!manualQuizForm.subCategoryId) setManualQuizForm(prev => ({ ...prev, subCategoryId: categories[0].id }));
      if (!noteForm.subCategoryId) setNoteForm(prev => ({ ...prev, subCategoryId: categories[0].id }));
      if (!topicForm.categoryId) setTopicForm(prev => ({ ...prev, categoryId: categories[0].id }));
    }
  }, [categories]);

  // Handle series number auto-continuation for specific Portions
  useEffect(() => {
    if (activeTab === 'quizzes' && !editingQuizId && manualQuizForm.subCategoryId) {
      const portionQuizzes = quizzes.filter(q => 
        q.subCategoryId === manualQuizForm.subCategoryId && 
        q.topicId === manualQuizForm.topicId
      );
      const maxOrder = portionQuizzes.reduce((max, q) => Math.max(max, Number(q.orderNumber) || 0), 0);
      setManualQuizForm(prev => ({ ...prev, orderNumber: maxOrder + 1 }));
    }
  }, [manualQuizForm.subCategoryId, manualQuizForm.topicId, activeTab, quizzes.length]);

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
    const reader = new FileReader();
    reader.onload = (event) => setNewsForm(prev => ({ ...prev, attachmentUrl: event.target?.result as string }));
    reader.readAsDataURL(file);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsParsing(true);
    setParseError(null);
    setParsingStep('Reading File...');
    try {
      const content = await parserService.extractTextFromFile(file);
      
      // If it's an image (base64 string), process it multimodally
      if (content.startsWith('data:image/')) {
        await processContent('', content);
      } else {
        await processContent(content);
      }
    } catch (err: any) { 
      setParseError(err.message); 
      setIsParsing(false);
    } finally { 
      if (fileInputRef.current) fileInputRef.current.value = ''; 
    }
  };

  const processContent = async (text: string, imageBase64?: string) => {
    setParsingStep(imageBase64 ? 'Analyzing Image...' : 'Extracting MCQs...');
    try {
      const aiResults = await parseQuizFromText(text, imageBase64);
      console.log("AI Parsing Results:", aiResults);
      
      if (!aiResults || aiResults.length === 0) {
        console.warn("AI returned no results. Text length:", text?.length);
        if (imageBase64) throw new Error("The AI could not find any MCQs in this image. Please ensure the image is clear and contains questions with options.");
        
        setParsingStep('Running Local Scan...');
        const fbResults = parserService.parseMCQs(text);
        console.log("Local Parser Results:", fbResults);
        if (!fbResults || fbResults.length === 0) {
          throw new Error("We couldn't detect a clear question-and-answer structure in this document. Please ensure your document follows a standard format (e.g., Q1. Question text followed by a) b) c) d) options).");
        }
        populateQuizForm(fbResults);
      } else {
        const hasEmptyQuestions = aiResults.some(r => !r.text || r.text.trim() === "");
        if (hasEmptyQuestions) {
          alert("Warning: Some questions appear to be empty. This often happens with complex Word equations. For best results with math, please upload a screenshot (image) of the document instead.");
        }
        populateQuizForm(aiResults);
      }
    } catch (err: any) {
      if (text) {
        const fbResults = parserService.parseMCQs(text);
        if (fbResults.length > 0) populateQuizForm(fbResults);
        else setParseError(err.message || "Parsing Failed");
      } else {
        setParseError(err.message || "Parsing Failed");
      }
    } finally {
      setIsParsing(false);
      setParsingStep('');
    }
  };

  const populateQuizForm = (qs: Partial<Question>[]) => {
    const cleanFormatting = (s: string) => s.replace(/\*\*/g, '').replace(/[✅✔️☑️]/g, '').trim();
    const cleanLabel = (s: string) => s.replace(/^[A-D][\.\)\s\-]+/i, '').trim();
    
    setManualQuizForm(prev => ({ 
      ...prev, 
      questions: qs.map((q, idx) => ({
        id: q.id || `q_parse_${Date.now()}_${idx}`,
        text: q.text ? cleanFormatting(q.text) : '',
        options: q.options && q.options.length >= 2 
          ? q.options.map((o: string) => cleanLabel(cleanFormatting(o)))
          : ['', '', '', ''],
        correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : 0,
        explanation: q.explanation ? cleanFormatting(q.explanation) : ''
      })).map(q => {
        const opts = [...q.options];
        while (opts.length < 4) opts.push('');
        return { ...q, options: opts.slice(0, 4) };
      })
    }));
  };

  const startEditingQuiz = (quiz: Quiz) => {
    const questions = Array.isArray(quiz.questions) ? quiz.questions : [];
    setEditingQuizId(quiz.id);
    setManualQuizForm({
      title: quiz.title,
      subCategoryId: quiz.subCategoryId,
      topicId: quiz.topicId || '',
      orderNumber: quiz.orderNumber || 0,
      videoUrl: quiz.videoUrl || '',
      questions: questions.map((q: Question) => ({
        id: q.id,
        text: q.text,
        options: Array.isArray(q.options) ? [...q.options] : ['', '', '', ''],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || ''
      })),
      seoKeywords: quiz.seoKeywords || '',
      seoTags: quiz.seoTags || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditing = () => {
    setEditingQuizId(null);
    setManualQuizForm({ 
      title: '', 
      subCategoryId: categories[0]?.id || '', 
      topicId: '', 
      orderNumber: 0, 
      videoUrl: '', 
      questions: [{ id: `q_reset_${Date.now()}`, text: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }],
      seoKeywords: '',
      seoTags: ''
    });
  };

  const addManualQuestion = () => {
    setManualQuizForm(prev => ({
      ...prev,
      questions: [...prev.questions, { id: `q_man_${Date.now()}`, text: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }]
    }));
  };

  const removeManualQuestion = (index: number) => {
    if (manualQuizForm.questions.length <= 1) {
       setManualQuizForm(prev => ({
         ...prev,
         questions: [{ id: `q_res_${Date.now()}`, text: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }]
       }));
       return;
    }
    setManualQuizForm(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const toggleFeedback = async (fb: QuizFeedback) => {
    const vis = fb.isVisible === true || String(fb.isVisible) === '1';
    await dataService.updateQuizFeedback(fb.id, { isVisible: !vis });
    loadFeedbacks();
  };

  const handleNoteFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setNoteForm(prev => ({ ...prev, fileData: event.target?.result as string }));
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 min-h-[600px] flex flex-col shadow-2xl overflow-hidden">
      <div className="flex bg-slate-950/50 border-b border-slate-800 overflow-x-auto no-scrollbar">
        {[
          { id: 'notifications', label: 'Bulletins' },
          { id: 'categories', label: 'Categories' },
          { id: 'topics', label: 'Sub Categories' },
          { id: 'quizzes', label: 'Assessments' },
          { id: 'notes', label: 'Study Library' },
          { id: 'exam-prep', label: 'Exam Prep' },
          { id: 'study-guides', label: 'Study Guides' },
          { id: 'articles', label: 'Articles' },
          { id: 'homepage', label: 'Homepage' },
          { id: 'ads', label: 'Private Ads' },
          { id: 'moderation', label: 'Reviews' },
          { id: 'inquiries', label: 'Inquiries' },
          { id: 'account', label: 'Settings' }
        ].map((tab) => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id as any)} 
            className={`px-6 py-4 font-black text-[10px] uppercase tracking-widest border-b-2 transition-all whitespace-nowrap shrink-0 ${activeTab === tab.id ? 'border-gold text-gold bg-slate-900' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-8 flex-grow overflow-y-auto">
        {activeTab === 'notifications' && (
          <div className="space-y-8 animate-in fade-in">
            <form onSubmit={async (e) => { 
              e.preventDefault(); 
              if (!newsForm.title || !newsForm.content) return;
              setIsPublishingNews(true);
              try {
                const localDate = new Date().toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
                const newNotif: Notification = { id: editingNotificationId || `news_${Date.now()}`, date: localDate, ...newsForm };
                await onAddNotification(newNotif); 
                setNewsForm({ title: '', content: '', type: 'News', attachmentUrl: '', linkedQuizId: '', seoKeywords: '', seoTags: '' });
                setEditingNotificationId(null);
                alert("Bulletin Broadcasted.");
              } catch (err) { alert("Failed."); } finally { setIsPublishingNews(false); }
            }} className="bg-slate-800/30 p-8 rounded-3xl border border-slate-700 space-y-6">
               <h4 className="text-white font-heading font-black text-xs uppercase tracking-normal flex justify-between items-center mb-2">
                  <span className="flex items-center gap-2"><Megaphone className="h-4 w-4 text-gold-light" /> institutional dispatch</span>
                  {editingNotificationId && <button type="button" onClick={() => { setEditingNotificationId(null); setNewsForm({ title: '', content: '', type: 'News', attachmentUrl: '', linkedQuizId: '', seoKeywords: '', seoTags: '' }); }} className="text-rose-500 text-[9px]">Cancel Edit</button>}
               </h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-400 font-bold uppercase ml-1">Title</label>
                    <AdminInput value={newsForm.title} onChange={e => setNewsForm({...newsForm, title: e.target.value})} placeholder="Bulletin Headline" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-400 font-bold uppercase ml-1">Type</label>
                    <AdminSelect value={newsForm.type} onChange={e => setNewsForm({...newsForm, type: e.target.value as any})}>
                       <option value="News">News</option>
                       <option value="Test Date">Test Date</option>
                       <option value="Result">Result</option>
                    </AdminSelect>
                  </div>
               </div>
               <div className="space-y-1">
                  <label className="text-[9px] text-zinc-400 font-bold uppercase ml-1">Shortcut Link</label>
                  <AdminSelect value={newsForm.linkedQuizId} onChange={e => setNewsForm({...newsForm, linkedQuizId: e.target.value})}>
                     <option value="">No Link</option>
                     {quizzes.map(q => <option key={q.id} value={q.id}>{q.title}</option>)}
                  </AdminSelect>
               </div>
               <div className="space-y-1">
                  <label className="text-[9px] text-zinc-400 font-bold uppercase ml-1 flex justify-between items-center">
                    Message Content
                      <button 
                        type="button" 
                        onClick={async () => {
                          if (!newsForm.content) return;
                          setIsHumanizing(true);
                          const h = await humanizeContent(newsForm.content);
                          setHumanizerData({
                            original: newsForm.content,
                            humanized: h,
                            onApply: (val) => setNewsForm(prev => ({ ...prev, content: val }))
                          });
                          setIsHumanizing(false);
                        }}
                        disabled={isHumanizing || !newsForm.content}
                        className="text-gold-light hover:text-gold flex items-center gap-1 transition-all disabled:opacity-50"
                      >
                        {isHumanizing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                        Humanize Content
                      </button>
                  </label>
                  <textarea value={newsForm.content} onChange={e => setNewsForm({...newsForm, content: e.target.value})} className="w-full p-4 bg-slate-800 text-white rounded-xl text-sm border border-slate-700 outline-none" rows={4} placeholder="Full message details..." required />
               </div>
               <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                  <button type="button" onClick={() => newsAttachmentRef.current?.click()} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2">
                     <ImageLucide className="h-4 w-4" /> Upload Banner
                  </button>
                  <input type="file" ref={newsAttachmentRef} onChange={handleNewsAttachment} className="hidden" accept="image/*" />
                  {newsForm.attachmentUrl && (
                    <div className="relative group h-24 w-40 rounded-lg overflow-hidden border border-slate-700">
                       <img src={newsForm.attachmentUrl} className="w-full h-full object-cover" alt="Preview" />
                       <button type="button" onClick={() => setNewsForm({...newsForm, attachmentUrl: ''})} className="absolute top-1 right-1 bg-rose-600 p-1 rounded-full text-white"><Trash className="h-3 w-3" /></button>
                    </div>
                  )}
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-400 font-bold uppercase ml-1">SEO Keywords</label>
                    <TagInput value={newsForm.seoKeywords} onChange={val => setNewsForm({...newsForm, seoKeywords: val})} placeholder="Type and press comma..." />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-400 font-bold uppercase ml-1">SEO Tags</label>
                    <TagInput value={newsForm.seoTags} onChange={val => setNewsForm({...newsForm, seoTags: val})} placeholder="Type and press comma..." />
                  </div>
               </div>
               <button type="submit" disabled={isPublishingNews} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl transition-all">
                 {isPublishingNews ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Broadcast Dispatch"}
               </button>
            </form>

            <div className="space-y-4 mt-8">
               <h4 className="text-white font-black text-xs uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
                  <Megaphone className="h-4 w-4" /> Active Bulletins
               </h4>
               <div className="grid grid-cols-1 gap-4">
                  {notifications.map(n => (
                     <div key={n.id} className="p-4 bg-slate-800/40 rounded-xl border border-slate-700 flex justify-between items-center group">
                        <div className="flex flex-col">
                           <h6 className="text-white font-bold text-sm uppercase">{n.title}</h6>
                           <span className="text-[9px] text-zinc-500 uppercase font-black">{n.date} • {n.type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <button onClick={() => {
                              setEditingNotificationId(n.id);
                              setNewsForm({
                                 title: n.title,
                                 content: n.content,
                                 type: n.type,
                                 attachmentUrl: n.attachmentUrl || '',
                                 linkedQuizId: n.linkedQuizId || '',
                                 seoKeywords: n.seoKeywords || '',
                                 seoTags: n.seoTags || ''
                              });
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                           }} className="p-2 text-indigo-400 hover:bg-indigo-400/10 rounded-lg">
                              <Edit3 className="h-4 w-4" />
                           </button>
                           <button onClick={() => { if(window.confirm('Delete this bulletin?')) onDeleteNotification(n.id); }} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg">
                              <Trash2 className="h-4 w-4" />
                           </button>
                        </div>
                     </div>
                  ))}
                  {notifications.length === 0 && <p className="text-center py-4 text-zinc-600 font-black uppercase text-[9px]">No bulletins in registry</p>}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-8 animate-in fade-in">
             <form onSubmit={e => { e.preventDefault(); if (catForm.name) { onAddCategory({ id: catForm.name.toLowerCase().replace(/\s+/g, '-'), ...catForm }); setCatForm({ name: '', description: '' }); }}} className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700 space-y-4">
                <h4 className="text-white font-heading font-black text-xs uppercase tracking-normal">Register Category</h4>
                <AdminInput value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} placeholder="Category Name" required />
                <textarea value={catForm.description} onChange={e => setCatForm({...catForm, description: e.target.value})} className="w-full p-4 bg-slate-800 text-white rounded-xl text-sm border border-slate-700 outline-none" rows={3} placeholder="Category Info..." />
                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest">Create Category</button>
             </form>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map(c => (
                  <div key={c.id} className="p-5 bg-slate-800/50 rounded-2xl border border-slate-700 flex flex-col justify-between group">
                    <div className="mb-4">
                      <h5 className="text-white font-black uppercase text-sm mb-1">{c.name}</h5>
                      <p className="text-[10px] text-zinc-400 mt-2 line-clamp-2">{c.description}</p>
                    </div>
                    <div className="flex justify-end pt-4 border-t border-slate-700">
                      <button onClick={() => { if(window.confirm(`Permanently delete ${c.name}?`)) onDeleteCategory(c.id); }} className="text-rose-500 hover:bg-rose-500/10 p-2 rounded-xl">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'quizzes' && (
          <div className="space-y-8 animate-in fade-in">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                   <div className="bg-slate-800/30 p-8 rounded-3xl border border-slate-700">
                      <h4 className="text-white font-heading font-black text-xs uppercase tracking-normal mb-6 flex items-center gap-2"><Sparkles className="h-4 w-4 text-gold-light" /> AI Document Parser</h4>
                      <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-700 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-gold/40 hover:bg-gold/5 transition-all text-center">
                         {isParsing ? <Loader2 className="h-10 w-10 text-gold animate-spin mb-4" /> : <UploadCloud className="h-10 w-10 text-slate-500 mb-4" />}
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{isParsing ? parsingStep : "Upload PDF, DOCX or Image"}</p>
                         <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.docx,.jpg,.jpeg,.png" />
                      </div>
                      {parseError && <p className="mt-4 text-rose-500 text-[10px] font-black uppercase text-center">{parseError}</p>}
                   </div>
                   
                   <form onSubmit={e => { 
                      e.preventDefault(); 
                      if (!manualQuizForm.title) return alert("Please enter an Assessment Title.");
                      const q: Quiz = { id: editingQuizId || `q_${Date.now()}`, ...manualQuizForm };
                      onAddQuiz(q);
                      cancelEditing();
                      alert("Assessment Saved Successfully.");
                   }} className="bg-slate-800/30 p-8 rounded-3xl border border-slate-700 space-y-6">
                      <h4 className="text-white font-heading font-black text-xs uppercase tracking-normal flex justify-between">Assessment Builder {editingQuizId && <button type="button" onClick={cancelEditing} className="text-rose-500 text-[9px]">Cancel Edit</button>}</h4>
                      
                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                          <AdminInput value={manualQuizForm.title} onChange={e => setManualQuizForm({...manualQuizForm, title: e.target.value})} placeholder="Assessment Title" required />
                        </div>
                        <div>
                          <AdminInput type="number" value={manualQuizForm.orderNumber} onChange={e => setManualQuizForm({...manualQuizForm, orderNumber: parseInt(e.target.value) || 0})} placeholder="Series No." />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-400 font-bold uppercase ml-1">Solution Video URL (YouTube)</label>
                        <AdminInput value={manualQuizForm.videoUrl} onChange={e => setManualQuizForm({...manualQuizForm, videoUrl: e.target.value})} placeholder="https://www.youtube.com/watch?v=..." />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                         <AdminSelect value={manualQuizForm.subCategoryId} onChange={e => setManualQuizForm({...manualQuizForm, subCategoryId: e.target.value, topicId: ''})}>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                         </AdminSelect>
                         <AdminSelect value={manualQuizForm.topicId} onChange={e => setManualQuizForm({...manualQuizForm, topicId: e.target.value})}>
                            <option value="">General Material</option>
                            {topics.filter(t => t.categoryId === manualQuizForm.subCategoryId).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                         </AdminSelect>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] text-zinc-400 font-bold uppercase ml-1">SEO Keywords</label>
                          <TagInput value={manualQuizForm.seoKeywords} onChange={val => setManualQuizForm({...manualQuizForm, seoKeywords: val})} placeholder="Type and press comma..." />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-zinc-400 font-bold uppercase ml-1">SEO Tags</label>
                          <TagInput value={manualQuizForm.seoTags} onChange={val => setManualQuizForm({...manualQuizForm, seoTags: val})} placeholder="Type and press comma..." />
                        </div>
                      </div>
                      <div className="space-y-6 max-h-[400px] overflow-y-auto p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                         {manualQuizForm.questions.map((q, idx) => (
                           <div key={idx} className="p-5 bg-slate-800 border border-slate-700 rounded-2xl space-y-4 relative group/q shadow-lg">
                             <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Question {idx + 1}</span>
                                <button type="button" onClick={() => removeManualQuestion(idx)} className="text-rose-500 opacity-50 hover:opacity-100 transition-opacity"><XCircle className="h-5 w-5" /></button>
                             </div>
                             
                             <textarea value={q.text} onChange={e => { const newQs = [...manualQuizForm.questions]; newQs[idx].text = e.target.value; setManualQuizForm({...manualQuizForm, questions: newQs}); }} className="w-full bg-slate-900 text-white p-3 rounded-xl text-xs border border-slate-700 outline-none focus:border-blue-500" rows={2} placeholder="Question Statement..." required />
                             
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                               {q.options.map((opt: string, optIdx: number) => (
                                 <div key={optIdx} className={`flex gap-2 items-center bg-slate-900 p-2 rounded-xl border transition-colors ${q.correctAnswer === optIdx ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-700'}`}>
                                    <input type="radio" name={`correct_${idx}`} checked={q.correctAnswer === optIdx} onChange={() => { const newQs = [...manualQuizForm.questions]; newQs[idx].correctAnswer = optIdx; setManualQuizForm({...manualQuizForm, questions: newQs}); }} className="w-4 h-4 accent-emerald-500" />
                                    <input value={opt} onChange={e => { const newQs = [...manualQuizForm.questions]; newQs[idx].options[optIdx] = e.target.value; setManualQuizForm({...manualQuizForm, questions: newQs}); }} className="w-full bg-transparent text-white p-1 text-[11px] outline-none" placeholder={`Option ${String.fromCharCode(65 + optIdx)}`} required />
                                 </div>
                               ))}
                             </div>
                             <div className="space-y-1">
                                <label className="text-[9px] text-zinc-400 font-bold uppercase ml-1 flex justify-between items-center">
                                  Explanation (Optional)
                                  <button 
                                    type="button" 
                                    onClick={async () => {
                                      if (!q.explanation) return;
                                      setIsHumanizing(true);
                                      const h = await humanizeContent(q.explanation);
                                      setHumanizerData({
                                        original: q.explanation,
                                        humanized: h,
                                        onApply: (val) => {
                                          const newQs = [...manualQuizForm.questions];
                                          newQs[idx].explanation = val;
                                          setManualQuizForm({...manualQuizForm, questions: newQs});
                                        }
                                      });
                                      setIsHumanizing(false);
                                    }}
                                    disabled={isHumanizing || !q.explanation}
                                    className="text-gold-light hover:text-gold flex items-center gap-1 transition-all disabled:opacity-50"
                                  >
                                    {isHumanizing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                                    Humanize
                                  </button>
                                </label>
                                <AdminInput value={q.explanation || ''} onChange={e => { const newQs = [...manualQuizForm.questions]; newQs[idx].explanation = e.target.value; setManualQuizForm({...manualQuizForm, questions: newQs}); }} placeholder="Explanation (Optional)" className="!p-2 !text-[10px] !bg-slate-900 !border-slate-800" />
                             </div>
                           </div>
                         ))}
                         <button type="button" onClick={addManualQuestion} className="w-full py-4 border-2 border-dashed border-slate-700 text-zinc-500 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:border-gold/30 hover:text-gold transition-all bg-slate-900/50"><Plus className="h-4 w-4" /> Add Question</button>
                      </div>
                      <button type="submit" className="w-full py-6 bg-gold text-pakgreen font-black uppercase text-[11px] tracking-[0.3em] rounded-2xl shadow-2xl hover:scale-[1.02] transition-all">Publish Final Assessment</button>
                   </form>
                </div>

                <div className="space-y-12">
                   <h4 className="text-white font-heading font-black text-xs uppercase tracking-normal flex items-center gap-2 border-b border-slate-800 pb-2"><ListOrdered className="h-4 w-4" /> Registry Portions</h4>
                   <div className="space-y-10">
                      {categories.map(cat => {
                        const catQuizzes = quizzes.filter(q => q.subCategoryId === cat.id);
                        if (catQuizzes.length === 0) return null;
                        
                        const catTopics = topics.filter(t => t.categoryId === cat.id);
                        
                        return (
                          <div key={cat.id} className="space-y-6">
                            <div className="flex items-center gap-3">
                              <FolderTree className="h-5 w-5 text-gold" />
                              <h5 className="text-white font-black uppercase text-base">{cat.name}</h5>
                            </div>
                            
                            {catTopics.map(topic => {
                              const topicQuizzes = catQuizzes.filter(q => q.topicId === topic.id).sort((a,b) => (Number(a.orderNumber) || 0) - (Number(b.orderNumber) || 0));
                              if (topicQuizzes.length === 0) return null;
                              return (
                                <div key={topic.id} className="ml-6 space-y-4 border-l border-slate-700 pl-6">
                                   <div className="flex items-center gap-2 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                                      <ChevronRight className="h-3 w-3" /> {topic.name} Portion
                                   </div>
                                   {topicQuizzes.map(q => (
                                     <div key={q.id} className="p-4 bg-slate-800/40 rounded-xl border border-slate-700 flex justify-between items-center group shadow-md">
                                        <div className="flex items-center gap-4">
                                           <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center text-[10px] font-black text-gold-light border border-gold/20 shrink-0">{q.orderNumber || 0}</div>
                                           <h6 className="text-white font-bold text-sm uppercase">{q.title}</h6>
                                        </div>
                                        <div className="flex items-center gap-2">
                                           <button onClick={() => startEditingQuiz(q)} className="p-2 text-indigo-400 hover:bg-indigo-400/10 rounded-lg"><Edit3 className="h-4 w-4" /></button>
                                           <button onClick={() => {if(window.confirm('Delete this?')) onDeleteQuiz(q.id);}} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                                        </div>
                                     </div>
                                   ))}
                                </div>
                              );
                            })}
                            
                            {/* Test Material portion */}
                            {catQuizzes.filter(q => !q.topicId).length > 0 && (
                               <div className="ml-6 space-y-4 border-l border-slate-700 pl-6">
                                  <div className="flex items-center gap-2 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                                     <ChevronRight className="h-3 w-3" /> General Material Portion
                                  </div>
                                  {catQuizzes.filter(q => !q.topicId).map(q => (
                                     <div key={q.id} className="p-4 bg-slate-800/40 rounded-xl border border-slate-700 flex justify-between items-center group shadow-md">
                                        <h6 className="text-white font-bold text-sm uppercase ml-4">{q.title}</h6>
                                        <div className="flex items-center gap-2">
                                           <button onClick={() => startEditingQuiz(q)} className="p-2 text-indigo-400 hover:bg-indigo-400/10 rounded-lg"><Edit3 className="h-4 w-4" /></button>
                                           <button onClick={() => {if(window.confirm('Delete this?')) onDeleteQuiz(q.id);}} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                                        </div>
                                     </div>
                                  ))}
                               </div>
                            )}
                          </div>
                        );
                      })}
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'topics' && (
          <div className="space-y-8 animate-in fade-in">
             <form onSubmit={e => { e.preventDefault(); if (topicForm.name) { onAddTopic({ id: `top_${Date.now()}`, ...topicForm }); setTopicForm({ name: '', categoryId: categories[0]?.id || '' }); }}} className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700 space-y-4">
                <h4 className="text-white font-heading font-black text-xs uppercase tracking-normal">Sub Category Entry</h4>
                <AdminInput value={topicForm.name} onChange={e => setTopicForm({...topicForm, name: e.target.value})} placeholder="Sub Category Name" required />
                <AdminSelect value={topicForm.categoryId} onChange={e => setTopicForm({...topicForm, categoryId: e.target.value})}>
                   {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </AdminSelect>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest">Register Sub Category</button>
             </form>
             <div className="space-y-3">
                {topics.map(t => (
                  <div key={t.id} className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 flex justify-between items-center group">
                    <div><h5 className="text-white font-bold uppercase text-sm">{t.name}</h5><p className="text-[9px] text-indigo-400 uppercase font-black">{categories.find(c => c.id === t.categoryId)?.name || 'Unknown'}</p></div>
                    <button onClick={() => { if(window.confirm('Delete sub category?')) onDeleteTopic(t.id); }} className="text-rose-500 p-2 rounded-lg hover:bg-rose-500/10 transition-colors"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-8 animate-in fade-in">
             <form onSubmit={async (e) => { 
                e.preventDefault(); if (!noteForm.title || !noteForm.fileData) return;
                setIsUploadingNote(true);
                try {
                  await onAddNote({ id: editingNoteId || `note_${Date.now()}`, title: noteForm.title, url: noteForm.fileData, subCategoryId: noteForm.subCategoryId, topicId: noteForm.topicId, type: 'PDF', seoKeywords: noteForm.seoKeywords, seoTags: noteForm.seoTags });
                  setNoteForm({ title: '', subCategoryId: categories[0]?.id || '', topicId: '', fileData: '', seoKeywords: '', seoTags: '' });
                  setEditingNoteId(null);
                  alert("Library Updated.");
                } catch (err) { alert("Failed."); } finally { setIsUploadingNote(false); }
             }} className="bg-slate-800/30 p-8 rounded-3xl border border-slate-700 space-y-4">
                <h4 className="text-white font-heading font-black text-xs uppercase tracking-normal flex justify-between items-center">
                   <span className="flex items-center gap-2"><FileText className="h-4 w-4 text-rose-500" /> Study Library Entry</span>
                   {editingNoteId && <button type="button" onClick={() => { setEditingNoteId(null); setNoteForm({ title: '', subCategoryId: categories[0]?.id || '', topicId: '', fileData: '', seoKeywords: '', seoTags: '' }); }} className="text-rose-500 text-[9px]">Cancel Edit</button>}
                </h4>
                <AdminInput value={noteForm.title} onChange={e => setNoteForm({...noteForm, title: e.target.value})} placeholder="Resource Title" required />
                <AdminSelect value={noteForm.subCategoryId} onChange={e => setNoteForm({...noteForm, subCategoryId: e.target.value, topicId: ''})}>
                   {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </AdminSelect>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-400 font-bold uppercase ml-1">SEO Keywords</label>
                    <TagInput value={noteForm.seoKeywords} onChange={val => setNoteForm({...noteForm, seoKeywords: val})} placeholder="Type and press comma..." />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-400 font-bold uppercase ml-1">SEO Tags</label>
                    <TagInput value={noteForm.seoTags} onChange={val => setNoteForm({...noteForm, seoTags: val})} placeholder="Type and press comma..." />
                  </div>
                </div>
                <button type="button" onClick={() => noteFileRef.current?.click()} className="px-6 py-3 bg-slate-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Select PDF Document</button>
                <input type="file" ref={noteFileRef} onChange={handleNoteFileChange} className="hidden" accept=".pdf" />
                <button type="submit" disabled={isUploadingNote} className="w-full bg-rose-600 hover:bg-rose-500 text-white py-5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">
                  {isUploadingNote ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Publish to Library"}
                </button>
             </form>

             <div className="space-y-6">
                <h4 className="text-white font-heading font-black text-xs uppercase tracking-normal border-b border-slate-800 pb-2 flex items-center gap-2">
                   <FileText className="h-4 w-4" /> Library Registry
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {notes.map(note => (
                      <div key={note.id} className="p-4 bg-slate-800/40 rounded-xl border border-slate-700 flex justify-between items-center group">
                         <div className="flex flex-col">
                            <h6 className="text-white font-bold text-sm uppercase">{note.title}</h6>
                            <span className="text-[9px] text-indigo-400 uppercase font-black">
                               {categories.find(c => c.id === note.subCategoryId)?.name || 'General Material'}
                            </span>
                         </div>
                         <div className="flex items-center gap-2">
                            <button onClick={() => {
                               setEditingNoteId(note.id);
                               setNoteForm({
                                  title: note.title,
                                  subCategoryId: note.subCategoryId,
                                  topicId: note.topicId || '',
                                  fileData: note.url,
                                  seoKeywords: note.seoKeywords || '',
                                  seoTags: note.seoTags || ''
                               });
                               window.scrollTo({ top: 0, behavior: 'smooth' });
                            }} className="p-2 text-indigo-400 hover:bg-indigo-400/10 rounded-lg">
                               <Edit3 className="h-4 w-4" />
                            </button>
                            <button onClick={() => { if(window.confirm('Delete this resource?')) onDeleteNote(note.id); }} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg">
                               <Trash2 className="h-4 w-4" />
                            </button>
                         </div>
                      </div>
                   ))}
                   {notes.length === 0 && <p className="text-center py-4 text-zinc-600 font-black uppercase text-[9px]">Library is empty</p>}
                </div>
             </div>
          </div>
        )}

        {activeTab === 'homepage' && (
          <div className="space-y-8 animate-in fade-in">
             <form onSubmit={async (e) => { 
                e.preventDefault();
                setIsPublishingArticle(true);
                try {
                  const settingsArticle: Article = {
                    id: 'homepage_settings',
                    title: 'Homepage Configuration',
                    content: JSON.stringify(homepageForm),
                    category: 'System',
                    type: ArticleType.ARTICLE,
                    date: new Date().toISOString(),
                    author: 'System'
                  };
                  await onAddArticle(settingsArticle);
                  alert("Homepage Settings Updated.");
                } catch (err) { alert("Failed to update settings."); } finally { setIsPublishingArticle(false); }
             }} className="bg-slate-800/30 p-8 rounded-3xl border border-slate-700 space-y-6">
                <h4 className="text-white font-heading font-black text-xs uppercase tracking-normal flex items-center gap-2 mb-2">
                   <Layout className="h-4 w-4 text-indigo-400" /> Homepage Visuals & Content
                </h4>
                
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-400 font-bold uppercase ml-1">Hero Title</label>
                    <AdminInput value={homepageForm.heroTitle} onChange={e => setHomepageForm({...homepageForm, heroTitle: e.target.value})} placeholder="Main headline on homepage" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-400 font-bold uppercase ml-1">Hero Description</label>
                    <textarea value={homepageForm.heroDescription} onChange={e => setHomepageForm({...homepageForm, heroDescription: e.target.value})} className="w-full p-4 bg-slate-800 text-white rounded-xl text-sm border border-slate-700 outline-none" rows={3} placeholder="Sub-headline text..." required />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-400 font-bold uppercase ml-1">CTA Button Text</label>
                      <AdminInput value={homepageForm.ctaText} onChange={e => setHomepageForm({...homepageForm, ctaText: e.target.value})} placeholder="e.g. Start Learning" required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-400 font-bold uppercase ml-1">CTA Button Link</label>
                      <AdminInput value={homepageForm.ctaLink} onChange={e => setHomepageForm({...homepageForm, ctaLink: e.target.value})} placeholder="e.g. /subjects" required />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-400 font-bold uppercase ml-1">Footer Description</label>
                    <textarea value={homepageForm.footerDescription} onChange={e => setHomepageForm({...homepageForm, footerDescription: e.target.value})} className="w-full p-4 bg-slate-800 text-white rounded-xl text-sm border border-slate-700 outline-none" rows={3} placeholder="Text shown in the footer area..." required />
                  </div>
                </div>

                <button type="submit" disabled={isPublishingArticle} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl transition-all">
                  {isPublishingArticle ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Save Homepage Settings"}
                </button>
             </form>
          </div>
        )}

        {(activeTab === 'articles' || activeTab === 'exam-prep' || activeTab === 'study-guides') && (
          <div className="space-y-8 animate-in fade-in">
             <form onSubmit={async (e) => { 
                e.preventDefault(); if (!articleForm.title || !articleForm.content) return;
                setIsPublishingArticle(true);
                try {
                  const localDate = new Date().toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
                  const type = activeTab === 'exam-prep' ? ArticleType.EXAM_GUIDE : 
                               activeTab === 'study-guides' ? ArticleType.STUDY_GUIDE : 
                               articleForm.type;
                  const newArt: Article = { id: editingArticleId || `art_${Date.now()}`, date: localDate, ...articleForm, type };
                  await onAddArticle(newArt); 
                  setArticleForm({ title: '', content: '', category: '', type: ArticleType.ARTICLE, imageUrl: '', seoKeywords: '', seoTags: '' });
                  setEditingArticleId(null);
                  alert(`${activeTab === 'exam-prep' ? 'Exam Prep' : activeTab === 'study-guides' ? 'Study Guide' : 'Article'} Published.`);
                } catch (err) { alert("Failed."); } finally { setIsPublishingArticle(false); }
             }} className="bg-slate-800/30 p-8 rounded-3xl border border-slate-700 space-y-6">
                <h4 className="text-white font-heading font-black text-xs uppercase tracking-normal flex justify-between items-center mb-2">
                   <span className="flex items-center gap-2">
                     <FileText className={`h-4 w-4 ${activeTab === 'exam-prep' ? 'text-gold' : activeTab === 'study-guides' ? 'text-blue-500' : 'text-emerald-500'}`} /> 
                     {activeTab === 'exam-prep' ? 'Exam Preparation Desk' : activeTab === 'study-guides' ? 'Study Guide Desk' : 'Editorial Desk'}
                   </span>
                   {editingArticleId && <button type="button" onClick={() => { setEditingArticleId(null); setArticleForm({ title: '', content: '', category: '', type: ArticleType.ARTICLE, imageUrl: '', seoKeywords: '', seoTags: '' }); }} className="text-rose-500 text-[9px]">Cancel Edit</button>}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="md:col-span-2 space-y-1">
                     <label className="text-[9px] text-zinc-400 font-bold uppercase ml-1">Title</label>
                     <AdminInput value={articleForm.title} onChange={e => setArticleForm({...articleForm, title: e.target.value})} placeholder={`${activeTab === 'exam-prep' ? 'Exam Prep' : activeTab === 'study-guides' ? 'Study Guide' : 'Article'} Headline`} required />
                   </div>
                   <div className="space-y-1">
                     <label className="text-[9px] text-zinc-400 font-bold uppercase ml-1">Type</label>
                     <AdminSelect 
                       value={activeTab === 'exam-prep' ? ArticleType.EXAM_GUIDE : activeTab === 'study-guides' ? ArticleType.STUDY_GUIDE : articleForm.type} 
                       onChange={e => setArticleForm({...articleForm, type: e.target.value as ArticleType})}
                       disabled={activeTab !== 'articles'}
                     >
                        {Object.values(ArticleType).map(t => <option key={t} value={t}>{t}</option>)}
                     </AdminSelect>
                   </div>
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] text-zinc-400 font-bold uppercase ml-1">Category / Subject</label>
                   <AdminInput value={articleForm.category} onChange={e => setArticleForm({...articleForm, category: e.target.value})} placeholder="e.g. Law, General Knowledge" required />
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] text-zinc-400 font-bold uppercase ml-1 flex justify-between items-center">
                     Content (Markdown Supported)
                       <button 
                         type="button" 
                         onClick={async () => {
                           if (!articleForm.content) return;
                           setIsHumanizing(true);
                           const h = await humanizeContent(articleForm.content);
                           setHumanizerData({
                             original: articleForm.content,
                             humanized: h,
                             onApply: (val) => setArticleForm(prev => ({ ...prev, content: val }))
                           });
                           setIsHumanizing(false);
                         }}
                         disabled={isHumanizing || !articleForm.content}
                         className="text-gold-light hover:text-gold flex items-center gap-1 transition-all disabled:opacity-50"
                       >
                         {isHumanizing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                         Humanize Content
                       </button>
                   </label>
                   <textarea value={articleForm.content} onChange={e => setArticleForm({...articleForm, content: e.target.value})} className="w-full p-4 bg-slate-800 text-white rounded-xl text-sm border border-slate-700 outline-none font-mono" rows={10} placeholder="Write your content here..." required />
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                   <button type="button" onClick={() => articleImageRef.current?.click()} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" /> Feature Image
                   </button>
                   <input type="file" ref={articleImageRef} onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (event) => setArticleForm(prev => ({ ...prev, imageUrl: event.target?.result as string }));
                      reader.readAsDataURL(file);
                   }} className="hidden" accept="image/*" />
                   {articleForm.imageUrl && (
                     <div className="relative group h-24 w-40 rounded-lg overflow-hidden border border-slate-700">
                        <img src={articleForm.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                        <button type="button" onClick={() => setArticleForm({...articleForm, imageUrl: ''})} className="absolute top-1 right-1 bg-rose-600 p-1 rounded-full text-white"><Trash className="h-3 w-3" /></button>
                     </div>
                   )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-1">
                     <label className="text-[9px] text-zinc-400 font-bold uppercase ml-1">SEO Keywords</label>
                     <TagInput value={articleForm.seoKeywords} onChange={val => setArticleForm({...articleForm, seoKeywords: val})} placeholder="Type and press comma..." />
                   </div>
                   <div className="space-y-1">
                     <label className="text-[9px] text-zinc-400 font-bold uppercase ml-1">SEO Tags</label>
                     <TagInput value={articleForm.seoTags} onChange={val => setArticleForm({...articleForm, seoTags: val})} placeholder="Type and press comma..." />
                   </div>
                </div>
                <button type="submit" disabled={isPublishingArticle} className={`w-full py-5 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl transition-all ${activeTab === 'exam-prep' ? 'bg-gold text-pakgreen' : activeTab === 'study-guides' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'}`}>
                  {isPublishingArticle ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : `Publish ${activeTab === 'exam-prep' ? 'Exam Prep' : activeTab === 'study-guides' ? 'Study Guide' : 'Article'}`}
                </button>
             </form>

             <div className="space-y-4 mt-8">
                <h4 className="text-white font-black text-xs uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
                   <FileText className="h-4 w-4" /> {activeTab === 'exam-prep' ? 'Exam Prep Registry' : activeTab === 'study-guides' ? 'Study Guide Registry' : 'Article Registry'}
                </h4>
                <div className="grid grid-cols-1 gap-4">
                   {articles.filter(a => a.id !== 'homepage_settings' && (
                     activeTab === 'exam-prep' ? a.type === ArticleType.EXAM_GUIDE :
                     activeTab === 'study-guides' ? a.type === ArticleType.STUDY_GUIDE :
                     a.type === ArticleType.ARTICLE
                   )).map(a => (
                      <div key={a.id} className="p-4 bg-slate-800/40 rounded-xl border border-slate-700 flex justify-between items-center group">
                         <div className="flex flex-col">
                            <h6 className="text-white font-bold text-sm uppercase">{a.title}</h6>
                            <span className="text-[9px] text-zinc-500 uppercase font-black">{a.date} • {a.category}</span>
                         </div>
                         <div className="flex items-center gap-2">
                            <button onClick={() => {
                               setEditingArticleId(a.id);
                               setArticleForm({
                                  title: a.title,
                                  content: a.content,
                                  category: a.category,
                                  type: a.type || ArticleType.ARTICLE,
                                  imageUrl: a.imageUrl || '',
                                  seoKeywords: a.seoKeywords || '',
                                  seoTags: a.seoTags || ''
                               });
                               window.scrollTo({ top: 0, behavior: 'smooth' });
                            }} className="p-2 text-indigo-400 hover:bg-indigo-400/10 rounded-lg">
                               <Edit3 className="h-4 w-4" />
                            </button>
                            <button onClick={() => { if(window.confirm('Delete this?')) onDeleteArticle(a.id); }} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg">
                               <Trash2 className="h-4 w-4" />
                            </button>
                         </div>
                      </div>
                   ))}
                   {articles.filter(a => a.id !== 'homepage_settings' && (
                     activeTab === 'exam-prep' ? a.type === ArticleType.EXAM_GUIDE :
                     activeTab === 'study-guides' ? a.type === ArticleType.STUDY_GUIDE :
                     a.type === ArticleType.ARTICLE
                   )).length === 0 && <p className="text-center py-4 text-zinc-600 font-black uppercase text-[9px]">Registry is empty</p>}
                </div>
             </div>
          </div>
        )}

        {activeTab === 'ads' && (
          <div className="space-y-8 animate-in fade-in">
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!adForm.imageUrl) return alert("Image is required.");
              setIsPublishingAd(true);
              try {
                const ad: PrivateAd = {
                  id: editingAdId || `ad_${Date.now()}`,
                  ...adForm,
                  isVisible: editingAdId ? ads.find((a: PrivateAd) => a.id === editingAdId)?.isVisible ?? false : false
                };
                await onAddAd(ad);
                setAdForm({ imageUrl: '', text: '', clickUrl: '', placement: 'content' });
                setEditingAdId(null);
                alert("Advertisement Saved.");
              } catch (err) { alert("Failed to save ad."); } finally { setIsPublishingAd(false); }
            }} className="bg-slate-800/30 p-8 rounded-3xl border border-slate-700 space-y-6">
               <h4 className="text-white font-heading font-black text-xs uppercase tracking-normal flex justify-between items-center mb-2">
                  <span className="flex items-center gap-2"><Megaphone className="h-4 w-4 text-gold-light" /> Private Advertisement</span>
                  {editingAdId && <button type="button" onClick={() => { setEditingAdId(null); setAdForm({ imageUrl: '', text: '', clickUrl: '', placement: 'content' }); }} className="text-rose-500 text-[9px]">Cancel Edit</button>}
               </h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-400 font-bold uppercase ml-1">Ad Label / Text</label>
                    <AdminInput value={adForm.text} onChange={e => setAdForm({...adForm, text: e.target.value})} placeholder="e.g. Special Offer" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-400 font-bold uppercase ml-1">Placement</label>
                    <AdminSelect value={adForm.placement} onChange={e => setAdForm({...adForm, placement: e.target.value as any})}>
                       <option value="content">Content (Home)</option>
                       <option value="header">Header</option>
                       <option value="sidebar">Sidebar</option>
                       <option value="footer">Footer</option>
                    </AdminSelect>
                  </div>
               </div>
               <div className="space-y-1">
                  <label className="text-[9px] text-zinc-400 font-bold uppercase ml-1">Click Destination URL</label>
                  <AdminInput value={adForm.clickUrl} onChange={e => setAdForm({...adForm, clickUrl: e.target.value})} placeholder="https://example.com/..." required />
               </div>
               <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                  <button type="button" onClick={() => adImageRef.current?.click()} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2">
                     <ImageLucide className="h-4 w-4" /> Upload Ad Banner
                  </button>
                  <input type="file" ref={adImageRef} onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (event) => setAdForm(prev => ({ ...prev, imageUrl: event.target?.result as string }));
                    reader.readAsDataURL(file);
                  }} className="hidden" accept="image/*" />
                  {adForm.imageUrl && (
                    <div className="relative group h-24 w-40 rounded-lg overflow-hidden border border-slate-700">
                       <img src={adForm.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                       <button type="button" onClick={() => setAdForm({...adForm, imageUrl: ''})} className="absolute top-1 right-1 bg-rose-600 p-1 rounded-full text-white"><Trash className="h-3 w-3" /></button>
                    </div>
                  )}
               </div>
               <button type="submit" disabled={isPublishingAd} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl transition-all">
                 {isPublishingAd ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Save Advertisement"}
               </button>
            </form>

            <div className="space-y-4 mt-8">
               <h4 className="text-white font-black text-xs uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
                  <Megaphone className="h-4 w-4" /> Ad Registry
               </h4>
               <div className="grid grid-cols-1 gap-4">
                  {ads.map((ad: PrivateAd) => (
                     <div key={ad.id} className="p-4 bg-slate-800/40 rounded-xl border border-slate-700 flex justify-between items-center group">
                        <div className="flex items-center gap-4">
                           <div className="w-16 h-10 rounded border border-slate-700 overflow-hidden">
                              <img src={ad.imageUrl} className="w-full h-full object-cover" alt="" />
                           </div>
                           <div className="flex flex-col">
                              <h6 className="text-white font-bold text-sm uppercase">{ad.text}</h6>
                              <span className="text-[9px] text-zinc-500 uppercase font-black">{ad.placement} • {ad.clickUrl}</span>
                           </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <button onClick={async () => {
                             const vis = ad.isVisible === true || String(ad.isVisible) === '1';
                             await onUpdateAd(ad.id, { isVisible: !vis });
                           }} className={`p-2 rounded-lg transition-all ${ad.isVisible ? 'text-emerald-500 bg-emerald-500/10' : 'text-slate-500 bg-slate-700'}`}>
                              {ad.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                           </button>
                           <button onClick={() => {
                              setEditingAdId(ad.id);
                              setAdForm({
                                 imageUrl: ad.imageUrl,
                                 text: ad.text,
                                 clickUrl: ad.clickUrl,
                                 placement: ad.placement
                              });
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                           }} className="p-2 text-indigo-400 hover:bg-indigo-400/10 rounded-lg">
                              <Edit3 className="h-4 w-4" />
                           </button>
                           <button onClick={() => { if(window.confirm('Delete this advertisement?')) onDeleteAd(ad.id); }} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg">
                              <Trash2 className="h-4 w-4" />
                           </button>
                        </div>
                     </div>
                  ))}
                  {ads.length === 0 && <p className="text-center py-4 text-zinc-600 font-black uppercase text-[9px]">No advertisements in registry</p>}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'moderation' && (
          <div className="space-y-6 animate-in fade-in">
             <h4 className="text-white font-heading font-black text-xs uppercase tracking-normal border-b border-slate-800 pb-2">Institutional Reviews</h4>
             {feedbacks.filter(fb => fb.quizId !== 'academic_inquiry').length > 0 ? feedbacks.filter(fb => fb.quizId !== 'academic_inquiry').map(fb => (
                <div key={fb.id} className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700 flex flex-col md:flex-row justify-between gap-6">
                   <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-2">
                         <span className="text-[10px] font-black text-gold uppercase bg-gold/10 px-3 py-1 rounded-full">{fb.quizTitle}</span>
                         <span className="text-[9px] text-zinc-500 font-black uppercase">{fb.date}</span>
                      </div>
                      <p className="text-white font-bold text-sm mb-1">{fb.studentName}</p>
                      <p className="text-zinc-300 text-sm italic">"{fb.comment}"</p>
                   </div>
                   <div className="flex items-center gap-3">
                      <button onClick={() => toggleFeedback(fb)} className={`p-3 rounded-xl border transition-all ${fb.isVisible ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-slate-700 border-slate-600 text-slate-400'}`}>
                         {fb.isVisible ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                      </button>
                      <button onClick={async () => { if(window.confirm('Delete review?')) { await dataService.deleteQuizFeedback(fb.id); loadFeedbacks(); } }} className="p-3 bg-rose-500/10 border border-rose-500 text-rose-500 rounded-xl"><Trash2 className="h-5 w-5" /></button>
                   </div>
                </div>
             )) : <p className="text-center py-8 text-zinc-600 font-black uppercase text-[9px]">No reviews in queue</p>}
          </div>
        )}

        {activeTab === 'inquiries' && (
          <div className="space-y-6 animate-in fade-in">
             <h4 className="text-white font-heading font-black text-xs uppercase tracking-normal border-b border-slate-800 pb-2">Student Inquiries</h4>
             {feedbacks.filter(fb => fb.quizId === 'academic_inquiry').length > 0 ? feedbacks.filter(fb => fb.quizId === 'academic_inquiry').map(fb => (
                <div key={fb.id} className="bg-slate-800/40 p-8 rounded-[32px] border border-slate-700 flex flex-col gap-6 shadow-xl">
                   <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                           <span className="text-[10px] font-black text-indigo-400 uppercase bg-indigo-400/10 px-3 py-1 rounded-full border border-indigo-400/20">Inquiry</span>
                           <span className="text-[9px] text-zinc-500 font-black uppercase flex items-center gap-1"><Clock className="h-3 w-3" /> {fb.date}</span>
                        </div>
                        <h5 className="text-xl font-heading font-black text-white uppercase tracking-normal">{fb.studentName}</h5>
                        <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold">
                           <Mail className="h-4 w-4 text-gold" /> {fb.studentEmail || 'No Email Provided'}
                        </div>
                      </div>
                      <button onClick={async () => { if(window.confirm('Delete this inquiry?')) { await dataService.deleteQuizFeedback(fb.id); loadFeedbacks(); } }} className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all"><Trash2 className="h-5 w-5" /></button>
                   </div>
                   <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
                      <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">{fb.comment}</p>
                   </div>
                </div>
             )) : <p className="text-center py-12 text-zinc-600 font-black uppercase text-[10px] tracking-widest opacity-50">No inquiries received yet.</p>}
          </div>
        )}

        {activeTab === 'account' && (
          <div className="max-w-2xl mx-auto py-10 animate-in fade-in space-y-12">
             <div className="bg-slate-800/30 p-10 rounded-[40px] border border-slate-700 text-center space-y-10 shadow-2xl">
                <Database className={`h-24 w-24 mx-auto ${dbStatus === 'Operational' ? 'text-emerald-500' : 'text-rose-500 animate-pulse'}`} />
                <h4 className="text-3xl font-heading font-black text-white uppercase tracking-normal">System Engine</h4>
                <div className="space-y-4">
                   <button 
                     onClick={async () => { 
                       setIsRepairing(true); 
                       try { 
                         const res = await dataService.repairDatabase(); 
                         setDbStatus(res.success ? 'Operational' : 'Fault');
                         alert("Core Sync Restored."); 
                       } catch { alert("Engine Failure."); } finally { setIsRepairing(false); }
                     }} 
                     disabled={isRepairing}
                     className="w-full py-6 bg-slate-700 hover:bg-slate-600 text-white font-black uppercase text-[11px] tracking-[0.4em] rounded-2xl flex items-center justify-center gap-4 transition-all"
                   >
                     {isRepairing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Settings className="h-5 w-5" />} Reset System Core
                   </button>
                </div>
             </div>

             <div className="bg-slate-800/30 p-10 rounded-[40px] border border-slate-700 space-y-8 shadow-2xl">
                <div className="flex items-center gap-4 border-b border-slate-700 pb-4">
                   <LogOut className="h-8 w-8 text-gold" />
                   <h4 className="text-2xl font-heading font-black text-white uppercase tracking-normal">Security Access</h4>
                </div>
                <form onSubmit={async (e) => {
                   e.preventDefault();
                   const form = e.target as HTMLFormElement;
                   const newPass = (form.elements.namedItem('newPassword') as HTMLInputElement).value;
                   const confirmPass = (form.elements.namedItem('confirmPassword') as HTMLInputElement).value;
                   
                   if (newPass !== confirmPass) return alert("Passwords do not match.");
                   if (newPass.length < 6) return alert("Password too short.");

                   try {
                      // Admin ID is 1 by default in api.php
                      await dataService.request('/login/1', 'PUT', { password: newPass });
                      alert("Security credentials updated successfully.");
                      form.reset();
                   } catch (err) {
                      alert("Failed to update credentials.");
                   }
                }} className="space-y-6">
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">New Password</label>
                      <AdminInput name="newPassword" type="password" placeholder="••••••••" required />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                      <AdminInput name="confirmPassword" type="password" placeholder="••••••••" required />
                   </div>
                   <button type="submit" className="w-full py-6 bg-gold text-pakgreen font-black uppercase text-[11px] tracking-[0.4em] rounded-2xl shadow-xl hover:scale-[1.02] transition-all">Update Security Key</button>
                </form>
             </div>
          </div>
        )}
      </div>

      {/* Humanizer Comparison Modal */}
      {humanizerData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-[32px] w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gold/10 rounded-lg">
                  <Sparkles className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <h3 className="text-xl font-heading font-black text-white uppercase tracking-tight">Humanize Content</h3>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Review and apply AI humanization</p>
                </div>
              </div>
              <button onClick={() => setHumanizerData(null)} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-zinc-400"><XCircle className="h-6 w-6" /></button>
            </div>

            <div className="flex-grow overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-zinc-700" /> Original Content
                </label>
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-zinc-400 h-[400px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {humanizerData.original}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gold uppercase tracking-widest flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gold animate-pulse" /> Humanized Version
                </label>
                <div className="p-4 bg-slate-950 border border-gold/20 rounded-2xl text-sm text-white h-[400px] overflow-y-auto whitespace-pre-wrap leading-relaxed ring-1 ring-gold/5">
                  {humanizerData.humanized}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-4">
              <button 
                onClick={() => setHumanizerData(null)}
                className="px-8 py-3 text-zinc-400 font-black uppercase text-[10px] tracking-widest hover:text-white transition-colors"
              >
                Discard
              </button>
              <button 
                onClick={() => {
                  humanizerData.onApply(humanizerData.humanized);
                  setHumanizerData(null);
                  setShowSuccessToast(true);
                  setTimeout(() => setShowSuccessToast(false), 3000);
                }}
                className="px-10 py-3 bg-gold text-pakgreen font-black uppercase text-[10px] tracking-widest rounded-xl hover:scale-105 transition-all shadow-lg shadow-gold/10"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed bottom-8 right-8 z-[110] animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-400/50">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-black uppercase text-[10px] tracking-widest">Content Humanized Successfully!</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
