import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Trash2, Loader2, Database, Activity, FileText, CheckCircle2, UploadCloud, MessageSquare, Image as ImageIcon, Plus, Settings, Eye, EyeOff, LogOut, Download, FolderTree, ListOrdered, Edit3, XCircle, Trash, Type as TypeIcon, Sparkles, Image as ImageLucide, Megaphone } from 'lucide-react';
import { Notification, SubCategory, Topic, Quiz, Question, QuizFeedback, StudyNote } from '../types';
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
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  notifications, categories, topics = [], quizzes, notes,
  onAddNotification, onDeleteNotification,
  onAddCategory, onDeleteCategory,
  onAddTopic = () => {}, onDeleteTopic = () => {},
  onAddQuiz, onDeleteQuiz,
  onAddNote, onDeleteNote
}) => {
  const [activeTab, setActiveTab] = useState<'notifications' | 'categories' | 'topics' | 'quizzes' | 'notes' | 'moderation' | 'account'>('notifications');
  const [isRepairing, setIsRepairing] = useState(false);
  const [dbStatus, setDbStatus] = useState<string>('Testing...');
  const [feedbacks, setFeedbacks] = useState<QuizFeedback[]>([]);
  
  const [isParsing, setIsParsing] = useState(false);
  const [parsingStep, setParsingStep] = useState<string>('');
  const [parseError, setParseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const newsAttachmentRef = useRef<HTMLInputElement>(null);
  const [isPublishingNews, setIsPublishingNews] = useState(false);
  const [newsForm, setNewsForm] = useState<{title: string; content: string; type: Notification['type']; attachmentUrl: string; linkedQuizId: string}>({ 
    title: '', content: '', type: 'News', attachmentUrl: '', linkedQuizId: '' 
  });

  const [catForm, setCatForm] = useState({ name: '', description: '' });
  const [topicForm, setTopicForm] = useState({ name: '', categoryId: '' });

  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [manualQuizForm, setManualQuizForm] = useState<{
    title: string;
    subCategoryId: string;
    topicId: string;
    orderNumber: number;
    videoUrl: string;
    questions: Question[];
  }>({
    title: '',
    subCategoryId: '',
    topicId: '',
    orderNumber: 0,
    videoUrl: '',
    questions: [{ id: `q_init_${Date.now()}`, text: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }]
  });

  const [noteForm, setNoteForm] = useState<{ title: string; subCategoryId: string; topicId: string; fileData: string }>({
    title: '', subCategoryId: '', topicId: '', fileData: ''
  });
  const [isUploadingNote, setIsUploadingNote] = useState(false);
  const noteFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (categories.length > 0) {
      if (!manualQuizForm.subCategoryId) setManualQuizForm(prev => ({ ...prev, subCategoryId: categories[0].id }));
      if (!noteForm.subCategoryId) setNoteForm(prev => ({ ...prev, subCategoryId: categories[0].id }));
      if (!topicForm.categoryId) setTopicForm(prev => ({ ...prev, categoryId: categories[0].id }));
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
    const reader = new FileReader();
    reader.onload = (event) => setNewsForm(prev => ({ ...prev, attachmentUrl: event.target?.result as string }));
    reader.readAsDataURL(file);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsParsing(true);
    setParseError(null);
    setParsingStep('Reading...');
    try {
      const text = await parserService.extractTextFromFile(file);
      await processContent(text);
    } catch (err: any) { setParseError(err.message); }
    finally { setIsParsing(false); setParsingStep(''); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const processContent = async (text: string) => {
    setParsingStep('Extracting MCQs...');
    const aiResults = await parseQuizFromText(text);
    if (aiResults.length === 0) {
      const fbResults = parserService.parseMCQs(text);
      if (fbResults.length === 0) throw new Error("No items found. Please check your document format.");
      populateQuizForm(fbResults);
    } else {
      populateQuizForm(aiResults);
    }
  };

  const populateQuizForm = (qs: Partial<Question>[]) => {
    const clean = (s: string) => s.replace(/\*\*/g, '').replace(/[✅✔️☑️]/g, '').replace(/^[A-D][\.\)\s]+/i, '').trim();
    setManualQuizForm(prev => ({ 
      ...prev, 
      questions: qs.map((q, idx) => ({
        id: q.id || `q_parse_${Date.now()}_${idx}`,
        text: q.text ? clean(q.text) : '',
        options: q.options && q.options.length >= 4 
          ? q.options.map(o => clean(o)).slice(0, 4) 
          : ['', '', '', ''],
        correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : 0,
        explanation: q.explanation ? clean(q.explanation) : ''
      }))
    }));
  };

  const startEditingQuiz = (quiz: Quiz) => {
    setEditingQuizId(quiz.id);
    setManualQuizForm({
      title: quiz.title,
      subCategoryId: quiz.subCategoryId,
      topicId: quiz.topicId || '',
      orderNumber: quiz.orderNumber || 0,
      videoUrl: quiz.videoUrl || '',
      questions: quiz.questions.map(q => ({
        id: q.id,
        text: q.text,
        options: [...q.options],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || ''
      }))
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
      questions: [{ id: `q_reset_${Date.now()}`, text: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }] 
    });
  };

  const addManualQuestion = () => {
    setManualQuizForm(prev => ({
      ...prev,
      questions: [...prev.questions, { id: `q_man_${Date.now()}`, text: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }]
    }));
  };

  const removeManualQuestion = (index: number) => {
    if (manualQuizForm.questions.length <= 1) return;
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

  const sortedQuizzes = [...quizzes].sort((a, b) => a.id.localeCompare(b.id));

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 min-h-[600px] flex flex-col shadow-2xl overflow-hidden">
      <div className="flex bg-slate-950/50 border-b border-slate-800 overflow-x-auto no-scrollbar">
        {[
          { id: 'notifications', label: 'News Management' },
          { id: 'categories', label: 'Categories' },
          { id: 'topics', label: 'Sub-Categories' },
          { id: 'quizzes', label: 'Assessments' },
          { id: 'notes', label: 'Study Materials' },
          { id: 'moderation', label: 'Reviews' },
          { id: 'account', label: 'System' }
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
                const newNotif: Notification = { id: `news_${Date.now()}`, date: localDate, ...newsForm };
                await onAddNotification(newNotif); 
                setNewsForm({ title: '', content: '', type: 'News', attachmentUrl: '', linkedQuizId: '' });
                alert("Bulletin Broadcasted Successfully.");
              } catch (err) { alert("Publication Failed."); } finally { setIsPublishingNews(false); }
            }} className="bg-slate-800/30 p-8 rounded-3xl border border-slate-700 space-y-6">
               <h4 className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-2 mb-2"><Megaphone className="h-4 w-4 text-gold-light" /> Draft Institutional Bulletin</h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 font-bold uppercase ml-1">Headline</label>
                    <AdminInput value={newsForm.title} onChange={e => setNewsForm({...newsForm, title: e.target.value})} placeholder="Bulletin Title" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 font-bold uppercase ml-1">Type</label>
                    <AdminSelect value={newsForm.type} onChange={e => setNewsForm({...newsForm, type: e.target.value as any})}>
                       <option value="News">Academy News</option>
                       <option value="Test Date">Important Date</option>
                       <option value="Result">Result Announcement</option>
                    </AdminSelect>
                  </div>
               </div>
               <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 font-bold uppercase ml-1">Official Shortcut (Redirect to Quiz)</label>
                  <AdminSelect value={newsForm.linkedQuizId} onChange={e => setNewsForm({...newsForm, linkedQuizId: e.target.value})}>
                     <option value="">No Direct Action</option>
                     {quizzes.map(q => <option key={q.id} value={q.id}>{q.title}</option>)}
                  </AdminSelect>
               </div>
               <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 font-bold uppercase ml-1">Bulletin Content</label>
                  <textarea value={newsForm.content} onChange={e => setNewsForm({...newsForm, content: e.target.value})} className="w-full p-4 bg-slate-800 text-white rounded-xl text-sm border border-slate-700 outline-none focus:border-blue-500 transition-colors" rows={4} placeholder="Full message details..." required />
               </div>
               <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                  <div className="flex flex-col items-center gap-3">
                    <button type="button" onClick={() => newsAttachmentRef.current?.click()} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2">
                       <ImageLucide className="h-4 w-4" /> Upload Banner
                    </button>
                    <input type="file" ref={newsAttachmentRef} onChange={handleNewsAttachment} className="hidden" accept="image/*" />
                  </div>
                  {newsForm.attachmentUrl ? (
                    <div className="relative group h-24 w-40 rounded-lg overflow-hidden border border-slate-700">
                       <img src={newsForm.attachmentUrl} className="w-full h-full object-cover" alt="Preview" />
                       <button type="button" onClick={() => setNewsForm({...newsForm, attachmentUrl: ''})} className="absolute top-1 right-1 bg-rose-600 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"><Trash className="h-3 w-3" /></button>
                    </div>
                  ) : (
                    <div className="h-24 w-40 rounded-lg border-2 border-dashed border-slate-700 flex items-center justify-center text-[8px] font-black text-slate-600 uppercase">No Banner Image</div>
                  )}
               </div>
               <button type="submit" disabled={isPublishingNews} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl transition-all">
                 {isPublishingNews ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Broadcast Official News"}
               </button>
            </form>
            <div className="space-y-4">
               <h4 className="text-white font-black text-xs uppercase tracking-widest border-b border-slate-800 pb-2">Recent Bulletins</h4>
               <div className="divide-y divide-slate-800">
                 {notifications.length > 0 ? notifications.map(n => (
                   <div key={n.id} className="py-5 flex justify-between items-center group">
                      <div className="flex items-center gap-4">
                         {n.attachmentUrl && <div className="w-12 h-12 rounded bg-slate-800 overflow-hidden border border-slate-700"><img src={n.attachmentUrl} className="w-full h-full object-cover" /></div>}
                         <div>
                           <h5 className="text-white font-bold text-sm uppercase">{n.title}</h5>
                           <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{n.date} • {n.type}</p>
                         </div>
                      </div>
                      <button onClick={() => {if(window.confirm('Delete this bulletin?')) onDeleteNotification(n.id);}} className="text-slate-600 hover:text-rose-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="h-4 w-4" /></button>
                   </div>
                 )) : <p className="text-slate-500 text-[10px] font-black uppercase py-8">News registry is currently empty.</p>}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-8 animate-in fade-in">
             <form onSubmit={e => { e.preventDefault(); if (catForm.name) { onAddCategory({ id: catForm.name.toLowerCase().replace(/\s+/g, '-'), ...catForm }); setCatForm({ name: '', description: '' }); }}} className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700 space-y-4">
                <h4 className="text-white font-black text-xs uppercase tracking-widest mb-4">Register New Academic Category</h4>
                <AdminInput value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} placeholder="Category Name (e.g., Sindh Law)" required />
                <textarea value={catForm.description} onChange={e => setCatForm({...catForm, description: e.target.value})} className="w-full p-4 bg-slate-800 text-white rounded-xl text-sm border border-slate-700 outline-none" rows={3} placeholder="Track Description..." />
                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest">Create Category</button>
             </form>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map(c => (
                  <div key={c.id} className="p-5 bg-slate-800/50 rounded-2xl border border-slate-700 flex flex-col justify-between group hover:border-gold-light transition-all shadow-lg">
                    <div className="mb-4">
                      <h5 className="text-white font-black uppercase text-sm mb-1">{c.name}</h5>
                      <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest bg-slate-900/50 px-2 py-1 rounded inline-block">{c.id}</p>
                      <p className="text-[10px] text-slate-400 mt-3 line-clamp-2 leading-relaxed">{c.description}</p>
                    </div>
                    <div className="flex justify-end pt-4 border-t border-slate-700">
                      <button onClick={() => { if(window.confirm(`Permanently delete ${c.name}? This will unlink all associated data.`)) onDeleteCategory(c.id); }} className="text-rose-500 hover:bg-rose-500/10 p-2 rounded-xl transition-all">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'topics' && (
          <div className="space-y-8 animate-in fade-in">
             <form onSubmit={e => { e.preventDefault(); if (topicForm.name) { onAddTopic({ id: `top_${Date.now()}`, ...topicForm }); setTopicForm({ name: '', categoryId: categories[0]?.id || '' }); }}} className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700 space-y-4">
                <h4 className="text-white font-black text-xs uppercase tracking-widest mb-4">Define Sub-Category</h4>
                <AdminInput value={topicForm.name} onChange={e => setTopicForm({...topicForm, name: e.target.value})} placeholder="Sub-Category Name" required />
                <AdminSelect value={topicForm.categoryId} onChange={e => setTopicForm({...topicForm, categoryId: e.target.value})}>
                   {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </AdminSelect>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest">Add Sub-Category</button>
             </form>
             <div className="space-y-3">
                {topics.map(t => (
                  <div key={t.id} className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 flex justify-between items-center group">
                    <div><h5 className="text-white font-bold uppercase text-sm">{t.name}</h5><p className="text-[9px] text-indigo-400 uppercase font-black">{categories.find(c => c.id === t.categoryId)?.name || 'Unknown'}</p></div>
                    <button onClick={() => {if(window.confirm('Delete this sub-category?')) onDeleteTopic(t.id);}} className="text-rose-500 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="h-4 w-4" /></button>
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
                      <h4 className="text-white font-black text-xs uppercase tracking-widest mb-6 flex items-center gap-2"><Sparkles className="h-4 w-4 text-gold-light" /> AI Document Parser</h4>
                      <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-700 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-gold/40 hover:bg-gold/5 transition-all text-center">
                         {isParsing ? <Loader2 className="h-10 w-10 text-gold animate-spin mb-4" /> : <UploadCloud className="h-10 w-10 text-slate-500 mb-4" />}
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{isParsing ? parsingStep : "Upload PDF or DOCX"}</p>
                         <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.docx" />
                      </div>
                   </div>
                   <form onSubmit={e => { 
                      e.preventDefault(); 
                      const q: Quiz = { id: editingQuizId || `q_${Date.now()}`, ...manualQuizForm };
                      onAddQuiz(q);
                      cancelEditing();
                      alert("Assessment Saved.");
                   }} className="bg-slate-800/30 p-8 rounded-3xl border border-slate-700 space-y-4">
                      <h4 className="text-white font-black text-xs uppercase tracking-widest mb-4 flex justify-between">Builder {editingQuizId && <button type="button" onClick={cancelEditing} className="text-rose-500">Cancel</button>}</h4>
                      <AdminInput value={manualQuizForm.title} onChange={e => setManualQuizForm({...manualQuizForm, title: e.target.value})} placeholder="Assessment Title" required />
                      <div className="grid grid-cols-2 gap-3">
                         <AdminSelect value={manualQuizForm.subCategoryId} onChange={e => setManualQuizForm({...manualQuizForm, subCategoryId: e.target.value, topicId: ''})}>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                         </AdminSelect>
                         <AdminSelect value={manualQuizForm.topicId} onChange={e => setManualQuizForm({...manualQuizForm, topicId: e.target.value})}>
                            <option value="">No Sub-Category</option>
                            {topics.filter(t => t.categoryId === manualQuizForm.subCategoryId).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                         </AdminSelect>
                      </div>
                      <button type="submit" className="w-full py-5 bg-gold text-pakgreen font-black uppercase text-[10px] tracking-widest rounded-xl shadow-xl hover:scale-105 transition-all">Publish Assessment</button>
                   </form>
                </div>
                <div className="space-y-4">
                   <h4 className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-2 border-b border-slate-800 pb-2"><ListOrdered className="h-4 w-4" /> Assessment Registry</h4>
                   <div className="space-y-3">
                      {sortedQuizzes.map((q, idx) => (
                        <div key={q.id} className="p-6 bg-slate-800/40 rounded-2xl border border-slate-700 flex justify-between items-center group">
                           <div className="flex items-center gap-4">
                              <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center text-xs font-black text-gold-light border border-gold/20 shrink-0">{idx + 1}</div>
                              <div>
                                 <h5 className="text-white font-bold text-sm uppercase">{q.title}</h5>
                                 <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{q.questions?.length || 0} ITEMS</p>
                              </div>
                           </div>
                           <div className="flex items