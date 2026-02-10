import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Trash2, Loader2, Database, Activity, FileText, CheckCircle2, UploadCloud, MessageSquare, Image as ImageIcon, Plus, Settings, Eye, EyeOff, LogOut, Download, FolderTree } from 'lucide-react';
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
  const [parsedQuestions, setParsedQuestions] = useState<Partial<Question>[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const newsAttachmentRef = useRef<HTMLInputElement>(null);
  const [isPublishingNews, setIsPublishingNews] = useState(false);
  const [newsForm, setNewsForm] = useState<{title: string; content: string; type: Notification['type']; attachmentUrl: string; linkedQuizId: string}>({ 
    title: '', content: '', type: 'News', attachmentUrl: '', linkedQuizId: '' 
  });

  const [catForm, setCatForm] = useState({ name: '', description: '' });
  const [topicForm, setTopicForm] = useState({ name: '', categoryId: '' });

  const [manualQuizForm, setManualQuizForm] = useState<{
    title: string;
    subCategoryId: string;
    topicId: string;
    videoUrl: string;
    questions: { text: string; options: string[]; correctAnswer: number; explanation?: string }[];
  }>({
    title: '',
    subCategoryId: '',
    topicId: '',
    videoUrl: '',
    questions: [{ text: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }]
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
      setParsingStep('Extracting...');
      const aiResults = await parseQuizFromText(text);
      if (aiResults.length === 0) {
        const fbResults = parserService.parseMCQs(text);
        if (fbResults.length === 0) throw new Error("No items found.");
        setParsedQuestions(fbResults);
        populateQuizForm(fbResults);
      } else {
        setParsedQuestions(aiResults);
        populateQuizForm(aiResults);
      }
    } catch (err: any) { setParseError(err.message); }
    finally { setIsParsing(false); setParsingStep(''); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const handleNoteFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setNoteForm(prev => ({ ...prev, fileData: event.target?.result as string }));
    reader.readAsDataURL(file);
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
    <div className="bg-slate-900 rounded-2xl border border-slate-800 min-h-[600px] flex flex-col shadow-2xl overflow-hidden">
      <div className="flex bg-slate-950/50 border-b border-slate-800 overflow-x-auto">
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
              setIsPublishingNews(true);
              try {
                const newNotif: Notification = { id: `news_${Date.now()}`, date: new Date().toLocaleDateString(), ...newsForm };
                await onAddNotification(newNotif); 
                setNewsForm({ title: '', content: '', type: 'News', attachmentUrl: '', linkedQuizId: '' });
                alert("News Published.");
              } catch (err) { alert("Failed."); } finally { setIsPublishingNews(false); }
            }} className="bg-slate-800/30 p-6 rounded-xl border border-slate-700 space-y-4">
               <AdminInput value={newsForm.title} onChange={e => setNewsForm({...newsForm, title: e.target.value})} placeholder="Title" required />
               <AdminSelect value={newsForm.linkedQuizId} onChange={e => setNewsForm({...newsForm, linkedQuizId: e.target.value})}>
                  <option value="">No Quiz Shortcut</option>
                  {quizzes.map(q => <option key={q.id} value={q.id}>{q.title}</option>)}
               </AdminSelect>
               <textarea value={newsForm.content} onChange={e => setNewsForm({...newsForm, content: e.target.value})} className="w-full p-3 bg-slate-800 text-white rounded text-sm border border-slate-700 outline-none" rows={3} placeholder="Content" required />
               <div className="flex items-center gap-4">
                  <button type="button" onClick={() => newsAttachmentRef.current?.click()} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">Banner Image</button>
                  <input type="file" ref={newsAttachmentRef} onChange={handleNewsAttachment} className="hidden" accept="image/*" />
                  {newsForm.attachmentUrl && <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">Image Loaded</span>}
               </div>
               <button type="submit" disabled={isPublishingNews} className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-3 rounded font-black text-[10px] uppercase">Publish News</button>
            </form>
            <div className="divide-y divide-slate-800">
               {notifications.map(n => (
                 <div key={n.id} className="py-4 flex justify-between items-center group">
                    <div>
                      <h5 className="text-white font-bold text-sm uppercase">{n.title}</h5>
                      <p className="text-[9px] text-slate-500 font-black uppercase">{n.date} • {n.type}</p>
                    </div>
                    <button onClick={() => onDeleteNotification(n.id)} className="text-slate-600 hover:text-rose-500"><Trash2 className="h-4 w-4" /></button>
                 </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-8 animate-in fade-in">
            <form onSubmit={(e) => { 
              e.preventDefault(); 
              onAddCategory({ id: catForm.name.toLowerCase().replace(/\s+/g, '-'), ...catForm });
              setCatForm({ name: '', description: '' });
            }} className="bg-slate-800/30 p-6 rounded-xl border border-slate-700 space-y-4">
               <AdminInput value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} placeholder="Category Name" required />
               <textarea value={catForm.description} onChange={e => setCatForm({...catForm, description: e.target.value})} className="w-full p-3 bg-slate-800 text-white rounded text-sm border border-slate-700 outline-none" rows={2} placeholder="Description" required />
               <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-3 rounded font-black text-[10px] uppercase flex items-center gap-2"><Plus className="h-4 w-4" /> Create Track</button>
            </form>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {categories.map(c => (
                 <div key={c.id} className="p-4 bg-slate-800/20 border border-slate-700 rounded-xl flex justify-between items-start group">
                    <div>
                       <h5 className="text-white font-black text-sm uppercase">{c.name}</h5>
                       <p className="text-[10px] text-slate-500 font-bold uppercase">{c.description}</p>
                    </div>
                    <button onClick={() => onDeleteCategory(c.id)} className="text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="h-4 w-4" /></button>
                 </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === 'topics' && (
          <div className="space-y-8 animate-in fade-in">
             <form onSubmit={(e) => {
               e.preventDefault();
               onAddTopic({ id: `topic_${Date.now()}`, ...topicForm });
               setTopicForm({ name: '', categoryId: categories[0]?.id || '' });
             }} className="bg-slate-800/30 p-6 rounded-xl border border-slate-700 space-y-4">
               <h4 className="text-white font-black text-xs uppercase">Create Sub-Category</h4>
               <AdminSelect value={topicForm.categoryId} onChange={e => setTopicForm({...topicForm, categoryId: e.target.value})}>
                 {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
               </AdminSelect>
               <AdminInput value={topicForm.name} onChange={e => setTopicForm({...topicForm, name: e.target.value})} placeholder="Sub-Category Name (e.g. English, Math)" required />
               <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-3 rounded font-black text-[10px] uppercase flex items-center gap-2"><FolderTree className="h-4 w-4" /> Add Sub-Category</button>
             </form>
             <div className="divide-y divide-slate-800">
               {topics.map(t => (
                 <div key={t.id} className="py-4 flex justify-between items-center group">
                   <div>
                     <h5 className="text-white font-bold text-sm uppercase">{t.name}</h5>
                     <p className="text-[9px] text-slate-500 font-black uppercase">Under: {categories.find(c => c.id === t.categoryId)?.name || 'Unknown'}</p>
                   </div>
                   <button onClick={() => onDeleteTopic(t.id)} className="text-slate-600 hover:text-rose-500"><Trash2 className="h-4 w-4" /></button>
                 </div>
               ))}
             </div>
          </div>
        )}

        {activeTab === 'quizzes' && (
          <div className="space-y-10 animate-in fade-in">
            <div className="bg-slate-800/40 border-2 border-dashed border-slate-700 rounded-3xl p-10 text-center hover:border-blue-500 transition-all">
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.docx" />
              <UploadCloud className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-white font-black text-lg uppercase mb-2">Automated Assessment Engine</h3>
              <button onClick={() => fileInputRef.current?.click()} disabled={isParsing} className="bg-blue-600 hover:bg-blue-500 text-white px-12 py-3 rounded-xl font-black text-[10px] uppercase shadow-xl transition-all">
                {isParsing ? <><Loader2 className="h-4 w-4 animate-spin inline mr-2" />{parsingStep}</> : "Upload Document"}
              </button>
              {parseError && <p className="mt-2 text-rose-500 text-[10px] font-black uppercase">{parseError}</p>}
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              onAddQuiz({ 
                id: `q_${Date.now()}`, 
                title: manualQuizForm.title,
                subCategoryId: manualQuizForm.subCategoryId,
                topicId: manualQuizForm.topicId,
                videoUrl: manualQuizForm.videoUrl,
                questions: manualQuizForm.questions.map((q, i) => ({ id: `qi_${i}_${Date.now()}`, ...q })) 
              });
              setManualQuizForm({ title: '', subCategoryId: categories[0]?.id || '', topicId: '', videoUrl: '', questions: [{ text: '', options: ['', '', '', ''], correctAnswer: 0 }] });
              alert("Published Successfully.");
            }} className="bg-slate-800/30 p-8 rounded-2xl border border-slate-700 space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <AdminInput value={manualQuizForm.title} onChange={e => setManualQuizForm({...manualQuizForm, title: e.target.value})} placeholder="Title" required />
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 font-bold uppercase">Main Category</label>
                    <AdminSelect value={manualQuizForm.subCategoryId} onChange={e => setManualQuizForm({...manualQuizForm, subCategoryId: e.target.value, topicId: ''})}>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </AdminSelect>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 font-bold uppercase">Sub-Category (Topic)</label>
                    <AdminSelect value={manualQuizForm.topicId} onChange={e => setManualQuizForm({...manualQuizForm, topicId: e.target.value})}>
                      <option value="">-- General / None --</option>
                      {topics.filter(t => t.categoryId === manualQuizForm.subCategoryId).map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </AdminSelect>
                  </div>
               </div>
               <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {manualQuizForm.questions.map((q, idx) => (
                    <div key={idx} className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-4">
                        <AdminInput value={q.text} onChange={e => { const n = [...manualQuizForm.questions]; n[idx].text = e.target.value; setManualQuizForm({...manualQuizForm, questions: n}); }} placeholder={`Question ${idx + 1}`} />
                        <div className="grid grid-cols-2 gap-4">
                           {q.options.map((o, oi) => <AdminInput key={oi} value={o} onChange={e => { const n = [...manualQuizForm.questions]; n[idx].options[oi] = e.target.value; setManualQuizForm({...manualQuizForm, questions: n}); }} placeholder={`Option ${oi + 1}`} />)}
                        </div>
                    </div>
                  ))}
               </div>
               <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-2xl">Publish Assessment</button>
            </form>

            <div className="space-y-4 mt-12 border-t border-slate-800 pt-8">
              <h4 className="text-white font-black text-xs uppercase tracking-widest">Existing Assessments</h4>
              <div className="divide-y divide-slate-800">
                {quizzes && quizzes.length > 0 ? quizzes.map(q => (
                  <div key={q.id} className="py-4 flex justify-between items-center group">
                    <div className="flex-grow">
                      <h5 className="text-white font-bold text-sm uppercase">{q.title}</h5>
                      <p className="text-[9px] text-slate-500 font-black uppercase">
                        {categories.find(c => c.id === q.subCategoryId)?.name || 'Track'} 
                        {q.topicId ? ` / ${topics.find(t => t.id === q.topicId)?.name}` : ''} • {q.questions?.length || 0} Items
                      </p>
                    </div>
                    <button onClick={() => onDeleteQuiz(q.id)} className="text-slate-600 hover:text-rose-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="h-4 w-4" /></button>
                  </div>
                )) : <p className="text-slate-500 text-[10px] font-black uppercase">No Assessments recorded in database.</p>}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-8 animate-in fade-in">
             <form onSubmit={async (e) => {
               e.preventDefault();
               if (!noteForm.fileData) { alert("Please select a PDF file."); return; }
               setIsUploadingNote(true);
               try {
                 await onAddNote({
                   id: `note_${Date.now()}`,
                   title: noteForm.title,
                   subCategoryId: noteForm.subCategoryId,
                   topicId: noteForm.topicId,
                   url: noteForm.fileData,
                   type: 'PDF'
                 });
                 setNoteForm({ title: '', subCategoryId: categories[0]?.id || '', topicId: '', fileData: '' });
                 if (noteFileRef.current) noteFileRef.current.value = '';
                 alert("Note Uploaded.");
               } catch (err) { alert("Failed to upload note."); }
               finally { setIsUploadingNote(false); }
             }} className="bg-slate-800/30 p-8 rounded-2xl border border-slate-700 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <AdminInput value={noteForm.title} onChange={e => setNoteForm({...noteForm, title: e.target.value})} placeholder="Note Title" required />
                   <div className="space-y-1">
                     <label className="text-[9px] text-slate-400 font-bold uppercase">Main Category</label>
                     <AdminSelect value={noteForm.subCategoryId} onChange={e => setNoteForm({...noteForm, subCategoryId: e.target.value, topicId: ''})}>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                     </AdminSelect>
                   </div>
                   <div className="space-y-1">
                     <label className="text-[9px] text-slate-400 font-bold uppercase">Sub-Category</label>
                     <AdminSelect value={noteForm.topicId} onChange={e => setNoteForm({...noteForm, topicId: e.target.value})}>
                        <option value="">-- General --</option>
                        {topics.filter(t => t.categoryId === noteForm.subCategoryId).map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                     </AdminSelect>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <button type="button" onClick={() => noteFileRef.current?.click()} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">Select PDF Note</button>
                   <input type="file" ref={noteFileRef} onChange={handleNoteFileChange} className="hidden" accept=".pdf" />
                   {noteForm.fileData && <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Ready for Upload</span>}
                </div>
                <button type="submit" disabled={isUploadingNote} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-5 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-2xl">
                   {isUploadingNote ? <><Loader2 className="h-4 w-4 animate-spin inline mr-2" /> Saving...</> : "Publish Note to Track"}
                </button>
             </form>

             <div className="space-y-4 mt-12 border-t border-slate-800 pt-8">
                <h4 className="text-white font-black text-xs uppercase tracking-widest">Repository Management</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   {notes && notes.length > 0 ? notes.map(n => (
                      <div key={n.id} className="p-6 bg-slate-800/40 border border-slate-700 rounded-2xl flex justify-between items-center group">
                         <div className="flex-grow min-w-0">
                            <h5 className="text-white font-bold text-sm uppercase truncate">{n.title}</h5>
                            <p className="text-[9px] text-slate-500 font-black uppercase">
                               {categories.find(c => c.id === n.subCategoryId)?.name || 'General'}
                               {n.topicId ? ` / ${topics.find(t => t.id === n.topicId)?.name}` : ''}
                            </p>
                         </div>
                         <div className="flex items-center gap-3">
                            <button onClick={() => onDeleteNote(n.id)} className="text-slate-500 hover:text-rose-500 p-2"><Trash2 className="h-4 w-4" /></button>
                         </div>
                      </div>
                   )) : <p className="text-slate-500 text-[10px] font-black uppercase">No academic notes found in registry.</p>}
                </div>
             </div>
          </div>
        )}

        {activeTab === 'moderation' && (
          <div className="space-y-6 animate-in fade-in">
            <h3 className="text-white font-black text-xs uppercase flex items-center gap-2 mb-6"><MessageSquare className="h-4 w-4 text-gold-light" /> Registry</h3>
            <div className="grid grid-cols-1 gap-4">
               {feedbacks.map(f => {
                 const isVis = f.isVisible === true || String(f.isVisible) === '1';
                 return (
                 <div key={f.id} className={`p-6 rounded-2xl border transition-all ${isVis ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-800/30 border-slate-700'} flex justify-between items-center`}>
                    <div className="flex-grow min-w-0">
                       <div className="flex items-center gap-2 mb-2"><span className="text-white font-black text-xs uppercase truncate">{f.studentName}</span> <span className="text-slate-600 text-[9px]">({f.quizTitle})</span></div>
                       <p className="text-slate-400 text-[11px] italic">"{f.comment}"</p>
                    </div>
                    <div className="flex items-center gap-3">
                       <button onClick={() => toggleFeedback(f)} className={`p-3 rounded-xl ${isVis ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-500'}`}>{isVis ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
                       <button onClick={() => dataService.deleteQuizFeedback(f.id).then(loadFeedbacks)} className="p-3 bg-slate-700 text-rose-500 rounded-xl"><Trash2 className="h-4 w-4" /></button>
                    </div>
                 </div>
               )})}
            </div>
          </div>
        )}

        {activeTab === 'account' && (
          <div className="text-center py-20 bg-slate-800/20 rounded-[40px] border border-slate-800">
             <Activity className="h-16 w-16 text-emerald-400 mx-auto mb-6" />
             <p className="text-slate-500 text-xs font-black uppercase mb-10">Institutional Core: <span className="text-emerald-400">{dbStatus}</span></p>
             <button onClick={() => { setIsRepairing(true); dataService.repairDatabase().then(() => { setIsRepairing(false); checkHealth(); }); }} className="bg-slate-700 hover:bg-slate-600 text-white px-12 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl">Restore Academic Registry</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;