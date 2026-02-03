import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, FileUp, Bell, Layout, Save, X, FileText, Upload, Link, ListChecks, CheckCircle, Youtube, MessageSquare, Mail, User, Eye, EyeOff, FileType, AlertCircle, Loader2, ShieldCheck, Key, UserPlus, Database, Activity, RefreshCw, Cpu } from 'lucide-react';
import { Notification, SubCategory, Quiz, StudyNote, QuizFeedback, Question } from '../types';
import { dataService } from '../services/dataService';
import mammoth from 'mammoth';
import * as pdfjs from 'pdfjs-dist';

// Configure PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.mjs`;

const AdminInput = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input 
    {...props}
    className={`w-full p-3 border border-slate-700 rounded text-sm bg-slate-800 text-white focus:border-blue-500 outline-none placeholder:text-slate-500 transition-all ${className || ''}`}
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
  onAddNotification: (n: Notification) => void;
  onDeleteNotification: (id: string) => void;
  onAddCategory: (c: SubCategory) => void;
  onDeleteCategory: (id: string) => void;
  onAddQuiz: (q: Quiz) => void;
  onDeleteQuiz: (id: string) => void;
}

interface TempQuestion {
  text: string;
  options: string[];
  correctAnswer: number;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  notifications, 
  categories, 
  quizzes,
  onAddNotification, 
  onDeleteNotification,
  onAddCategory,
  onDeleteCategory,
  onAddQuiz,
  onDeleteQuiz
}) => {
  const [activeTab, setActiveTab] = useState<'notifications' | 'categories' | 'quizzes' | 'uploads' | 'feedback' | 'word-converter' | 'account'>('notifications');
  const [showAddNews, setShowAddNews] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showManualQuiz, setShowManualQuiz] = useState(false);
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [feedbacks, setFeedbacks] = useState<QuizFeedback[]>([]);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [dbStatus, setDbStatus] = useState<{status: string, message: string} | null>(null);
  const [isRepairing, setIsRepairing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  
  const [newsForm, setNewsForm] = useState({ title: '', content: '', type: 'News' as any });
  const [categoryForm, setCategoryForm] = useState({ id: '', name: '', description: '' });
  
  // Doc Converter State
  const [isParsing, setIsParsing] = useState(false);
  const [parsedQuestions, setParsedQuestions] = useState<Question[]>([]);
  const [converterQuizTitle, setConverterQuizTitle] = useState('');
  const [converterCategoryId, setConverterCategoryId] = useState(categories[0]?.id || '');

  // Account State
  const [newAdmin, setNewAdmin] = useState({ username: '', password: '' });
  const [updatingPass, setUpdatingPass] = useState<{ id: string, pass: string } | null>(null);

  const [manualQuizForm, setManualQuizForm] = useState<{
    title: string;
    subCategoryId: string;
    videoUrl: string;
    questions: { text: string; options: string[]; correctAnswer: number }[];
  }>({
    title: '',
    subCategoryId: categories[0]?.id || '',
    videoUrl: '',
    questions: [{ text: '', options: ['', '', '', ''], correctAnswer: 0 }]
  });

  const [noteForm, setNoteForm] = useState({ title: '', url: '', subCategoryId: categories[0]?.id || '', type: 'PDF' as any });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (categories.length > 0) {
      if (!manualQuizForm.subCategoryId) setManualQuizForm(prev => ({ ...prev, subCategoryId: categories[0].id }));
      if (!noteForm.subCategoryId) setNoteForm(prev => ({ ...prev, subCategoryId: categories[0].id }));
      if (!converterCategoryId) setConverterCategoryId(categories[0].id);
    }
  }, [categories]);

  useEffect(() => {
    loadNotes();
    loadFeedbacks();
    loadAdminUsers();
    checkHealth();
  }, []);

  const checkHealth = async () => {
    const res = await dataService.testConnection();
    if (res.success) setDbStatus({ status: 'Connected', message: `Database: ${res.database || 'Active'}` });
    else setDbStatus({ status: 'Error', message: res.error || 'Connection Failed' });
  };

  const handleRepair = async () => {
    if (!confirm("This will recreate all missing tables. Your existing data will be safe. Proceed?")) return;
    setIsRepairing(true);
    const res = await dataService.repairDatabase();
    setIsRepairing(false);
    if (res.success) {
      alert("Database Repair Successful! All tables are ready.");
      window.location.reload();
    } else {
      alert("Repair Failed: " + (res.error || "Unknown Error"));
    }
  };

  const loadNotes = async () => {
    const list = await dataService.getNotes();
    setNotes(list || []);
  };

  const loadFeedbacks = async () => {
    const list = await dataService.getQuizFeedbacks();
    setFeedbacks(list || []);
  };

  const loadAdminUsers = async () => {
    const list = await dataService.getAdmins();
    setAdminUsers(list || []);
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdmin.username || !newAdmin.password) return;
    const res = await dataService.addAdmin(newAdmin.username, newAdmin.password);
    if (res.success) {
      await loadAdminUsers();
      setNewAdmin({ username: '', password: '' });
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingPass || !updatingPass.pass) return;
    const res = await dataService.updateAdminPassword(updatingPass.id, updatingPass.pass);
    if (res.success) {
      await loadAdminUsers();
      setUpdatingPass(null);
      alert("Password updated successfully.");
    }
  };

  const handleDeleteAdmin = async (id: string) => {
    if (adminUsers.length <= 1) {
      alert("Cannot delete the last administrator.");
      return;
    }
    if (!confirm("Remove this administrator account?")) return;
    const res = await dataService.deleteAdmin(id);
    if (res.success) await loadAdminUsers();
  };

  // --- ADVANCED PARSER LOGIC ---
  const extractQuestionsFromText = (text: string): Question[] => {
    const questions: Question[] = [];
    // Split by common question patterns: "1. ", "Q1.", "Question 1:", "(1)"
    const questionBlocks = text.split(/(?=\n\s*\d+[\.\)\-\s])|(?=\n\s*Q\d+[\.\)\-\s])|(?=\n\s*Question\s*\d+[\.\)\-\s:])/i);

    questionBlocks.forEach((block, index) => {
      const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length < 2) return;

      // Extract text: remove leading numbers like "1."
      let qText = lines[0].replace(/^(\d+|Q\d+|Question\s*\d+)[\.\)\-\s:]+\s*/i, '').trim();
      let options: string[] = [];
      let correctAnswer = 0;

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        
        // Match options starting with A, B, C, D or (A), (B)...
        const optionMatch = line.match(/^[\[\(\s]*([A-Da-d])[\.\)\-\s\]]+\s*(.*)/);
        if (optionMatch) {
          options.push(optionMatch[2].trim());
        }

        // Match answer keys like "Ans: A", "Correct: B"
        const answerMatch = line.match(/(?:Answer|Ans|Correct|Key)(?:\s+is)?[\s:]*([A-Da-d])/i);
        if (answerMatch) {
          const letter = answerMatch[1].toUpperCase();
          correctAnswer = letter.charCodeAt(0) - 65;
        }
      }

      // If we found a question and at least 2 options, add it
      if (qText && options.length >= 2) {
        questions.push({
          id: `doc_${Date.now()}_${index}`,
          text: qText,
          options: options.slice(0, 4),
          correctAnswer: correctAnswer >= 0 && correctAnswer < 4 ? correctAnswer : 0
        });
      }
    });

    return questions;
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setActiveTab('word-converter');
    
    let extractedText = "";

    try {
      if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        extractedText = result.value;
      } 
      else if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        let text = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item: any) => item.str).join(' ') + '\n';
        }
        extractedText = text;
      } else {
        alert("Unsupported file format. Please use PDF or DOCX.");
        setIsParsing(false);
        return;
      }

      const questions = extractQuestionsFromText(extractedText);
      if (questions.length === 0) {
        alert("No clear question/option pattern detected. Please ensure your document lists questions followed by options A, B, C, D.");
      } else {
        setParsedQuestions(questions);
        if (!converterQuizTitle) setConverterQuizTitle(file.name.split('.')[0]);
      }
    } catch (err) {
      console.error("Parser Error:", err);
      alert("Failed to read document contents.");
    } finally {
      setIsParsing(false);
      if (docInputRef.current) docInputRef.current.value = '';
    }
  };

  const saveConvertedQuiz = () => {
    if (!converterQuizTitle || parsedQuestions.length === 0) {
      alert("Please provide a title.");
      return;
    }
    const newQuiz: Quiz = {
      id: `doc_quiz_${Date.now()}`,
      title: converterQuizTitle,
      subCategoryId: converterCategoryId,
      questions: parsedQuestions
    };
    onAddQuiz(newQuiz);
    setParsedQuestions([]);
    setConverterQuizTitle('');
    setActiveTab('quizzes');
  };

  const handleManualQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualQuizForm.questions.some(q => !q.text || q.options.some(o => !o))) {
      alert("Please fill in all question fields.");
      return;
    }
    const newQuiz: Quiz = {
      id: `manual_${Date.now()}`,
      title: manualQuizForm.title,
      subCategoryId: manualQuizForm.subCategoryId,
      videoUrl: manualQuizForm.videoUrl,
      questions: manualQuizForm.questions.map((q, idx) => ({
        id: `q_${Date.now()}_${idx}`,
        ...q
      }))
    };
    onAddQuiz(newQuiz);
    setShowManualQuiz(false);
    setManualQuizForm({
      title: '',
      subCategoryId: categories[0]?.id || '',
      videoUrl: '',
      questions: [{ text: '', options: ['', '', '', ''], correctAnswer: 0 }]
    });
  };

  const addManualQuestion = () => {
    setManualQuizForm(prev => ({
      ...prev,
      questions: [...prev.questions, { text: '', options: ['', '', '', ''], correctAnswer: 0 }]
    }));
  };

  const handleAddNews = (e: React.FormEvent) => {
    e.preventDefault();
    onAddNotification({
      id: Date.now().toString(),
      ...newsForm,
      date: new Date().toISOString().split('T')[0]
    });
    setShowAddNews(false);
    setNewsForm({ title: '', content: '', type: 'News' });
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddCategory({ ...categoryForm });
    setShowAddCategory(false);
    setCategoryForm({ id: '', name: '', description: '' });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') return;
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      setNoteForm(prev => ({ ...prev, url: event.target?.result as string, title: prev.title || file.name.replace('.pdf', '') }));
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    const newNote: StudyNote = { id: Date.now().toString(), ...noteForm };
    const res = await dataService.addNote(newNote);
    if (res.success) {
      await loadNotes();
      setNoteForm({ ...noteForm, title: '', url: '' });
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm("Delete this document?")) return;
    const res = await dataService.deleteNote(id);
    if (res.success) await loadNotes();
  };

  const handleToggleFeedbackVisibility = async (id: string, currentVisible: boolean) => {
    const res = await dataService.updateQuizFeedback(id, { isVisible: !currentVisible });
    if (res.success) await loadFeedbacks();
  };

  const handleDeleteFeedback = async (id: string) => {
    if (!window.confirm("Are you sure?")) return;
    const res = await dataService.deleteQuizFeedback(id);
    if (res.success) await loadFeedbacks();
  };

  return (
    <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-800 overflow-hidden min-h-[500px] flex flex-col">
      <div className="flex bg-slate-950/50 border-b border-slate-800 overflow-x-auto no-scrollbar scroll-smooth">
        {[
          { id: 'notifications', label: 'Alerts', icon: <Bell className="h-4 w-4" /> },
          { id: 'categories', label: 'Categories', icon: <Layout className="h-4 w-4" /> },
          { id: 'quizzes', label: 'Quizzes', icon: <ListChecks className="h-4 w-4" /> },
          { id: 'word-converter', label: 'Doc to Quiz', icon: <Cpu className="h-4 w-4" /> },
          { id: 'uploads', label: 'Repo', icon: <FileUp className="h-4 w-4" /> },
          { id: 'feedback', label: 'Feedback', icon: <MessageSquare className="h-4 w-4" /> },
          { id: 'account', label: 'Account', icon: <ShieldCheck className="h-4 w-4" /> }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-8 py-4 font-bold text-xs uppercase tracking-widest transition-all border-b-2 whitespace-nowrap shrink-0 ${
              activeTab === tab.id ? 'border-blue-500 text-blue-400 bg-slate-900' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4 sm:p-6 md:p-8 flex-grow">
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-white uppercase tracking-tight">System Alerts</h3>
              <button onClick={() => setShowAddNews(!showAddNews)} className="bg-[#1a2b48] text-white px-5 py-3 rounded font-bold text-[10px] uppercase tracking-widest">
                <Plus className="h-4 w-4" /> New Announcement
              </button>
            </div>
            {showAddNews && (
              <form onSubmit={handleAddNews} className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 mb-8 animate-in slide-in-from-top-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <AdminInput required value={newsForm.title} onChange={(e: any) => setNewsForm({...newsForm, title: e.target.value})} placeholder="Title" />
                  <AdminSelect value={newsForm.type} onChange={(e: any) => setNewsForm({...newsForm, type: e.target.value as any})}>
                    <option value="News">News</option>
                    <option value="Result">Result</option>
                    <option value="Test Date">Test Date</option>
                  </AdminSelect>
                </div>
                <textarea required value={newsForm.content} onChange={e => setNewsForm({...newsForm, content: e.target.value})} rows={4} className="w-full p-3 border border-slate-700 rounded text-sm bg-slate-800 text-white" />
                <button type="submit" className="mt-4 bg-green-600 text-white px-8 py-3 rounded font-bold text-[10px] uppercase">Publish Now</button>
              </form>
            )}
            <div className="overflow-x-auto rounded-lg">
              <table className="w-full text-left">
                <tbody className="divide-y divide-slate-800">
                  {notifications.map(n => (
                    <tr key={n.id} className="hover:bg-slate-800/20">
                      <td className="py-4 px-3 text-[10px] font-bold text-slate-500">{n.date}</td>
                      <td className="py-4 px-3 text-sm font-bold text-slate-200">{n.title}</td>
                      <td className="py-4 px-3 text-right">
                        <button onClick={() => onDeleteNotification(n.id)} className="p-2 text-slate-600 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Academic Categories</h3>
              <button onClick={() => setShowAddCategory(!showAddCategory)} className="bg-[#1a2b48] text-white px-5 py-3 rounded font-bold text-[10px] uppercase tracking-widest">
                <Plus className="h-4 w-4" /> Add Category
              </button>
            </div>
            {showAddCategory && (
              <form onSubmit={handleAddCategorySubmit} className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 mb-8 space-y-4">
                <AdminInput required value={categoryForm.id} onChange={e => setCategoryForm({...categoryForm, id: e.target.value})} placeholder="Category ID (e.g. lat, law-gat)" />
                <AdminInput required value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} placeholder="Display Name" />
                <textarea required value={categoryForm.description} onChange={e => setCategoryForm({...categoryForm, description: e.target.value})} rows={3} className="w-full p-3 border border-slate-700 rounded text-sm bg-slate-800 text-white" placeholder="Description..." />
                <button type="submit" className="bg-green-600 text-white px-8 py-3 rounded font-bold text-[10px] uppercase">Save Category</button>
              </form>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map(c => (
                <div key={c.id} className="p-5 bg-slate-800/20 border border-slate-800 rounded-xl flex justify-between items-start group hover:border-slate-600">
                  <div>
                    <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">{c.id}</span>
                    <h4 className="font-bold text-slate-200 text-xs uppercase mt-1">{c.name}</h4>
                  </div>
                  <button onClick={() => onDeleteCategory(c.id)} className="text-slate-600 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'quizzes' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Question Bank</h3>
              <div className="flex gap-4">
                <button onClick={() => setActiveTab('word-converter')} className="bg-blue-600 text-white px-5 py-3 rounded font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Word Import
                </button>
                <button onClick={() => setShowManualQuiz(!showManualQuiz)} className="bg-slate-800 text-white px-5 py-3 rounded font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Manual Add
                </button>
              </div>
            </div>

            {showManualQuiz && (
              <form onSubmit={handleManualQuizSubmit} className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700 mb-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AdminInput required value={manualQuizForm.title} onChange={e => setManualQuizForm({...manualQuizForm, title: e.target.value})} placeholder="Quiz Title" />
                  <AdminSelect value={manualQuizForm.subCategoryId} onChange={e => setManualQuizForm({...manualQuizForm, subCategoryId: e.target.value})}>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </AdminSelect>
                </div>
                <div className="space-y-6">
                  {manualQuizForm.questions.map((q, qIdx) => (
                    <div key={qIdx} className="p-6 bg-slate-900 rounded-2xl border border-slate-700 space-y-4">
                      <AdminInput value={q.text} onChange={e => {
                        const qs = [...manualQuizForm.questions];
                        qs[qIdx].text = e.target.value;
                        setManualQuizForm({...manualQuizForm, questions: qs});
                      }} placeholder={`Question ${qIdx + 1}`} />
                      <div className="grid grid-cols-2 gap-4">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="flex gap-2">
                            <AdminInput value={opt} onChange={e => {
                              const qs = [...manualQuizForm.questions];
                              qs[qIdx].options[oIdx] = e.target.value;
                              setManualQuizForm({...manualQuizForm, questions: qs});
                            }} placeholder={`Option ${String.fromCharCode(65+oIdx)}`} />
                            <button type="button" onClick={() => {
                              const qs = [...manualQuizForm.questions];
                              qs[qIdx].correctAnswer = oIdx;
                              setManualQuizForm({...manualQuizForm, questions: qs});
                            }} className={`px-4 rounded border ${q.correctAnswer === oIdx ? 'bg-green-600 text-white border-green-600' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                              {String.fromCharCode(65+oIdx)}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={addManualQuestion} className="w-full py-4 border-2 border-dashed border-slate-700 rounded-2xl text-slate-500 font-bold uppercase text-[10px]">
                    + Add Question
                  </button>
                </div>
                <button type="submit" className="w-full bg-green-600 text-white py-4 rounded-xl font-black uppercase text-[10px] shadow-xl">Deploy Quiz</button>
              </form>
            )}

            <div className="space-y-2">
              {quizzes.map(q => (
                <div key={q.id} className="p-4 bg-slate-800/20 border border-slate-800 rounded-xl flex justify-between items-center group">
                  <div>
                    <h4 className="font-bold text-slate-200 uppercase text-[11px]">{q.title}</h4>
                    <p className="text-[8px] text-slate-500 uppercase font-bold">{q.questions.length} Items</p>
                  </div>
                  <button onClick={() => onDeleteQuiz(q.id)} className="p-2 text-slate-600 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'uploads' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Study Repository</h3>
            </div>
            <form onSubmit={handleAddNote} className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AdminInput required value={noteForm.title} onChange={e => setNoteForm({...noteForm, title: e.target.value})} placeholder="Document Title" />
                <AdminSelect value={noteForm.subCategoryId} onChange={e => setNoteForm({...noteForm, subCategoryId: e.target.value})}>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </AdminSelect>
              </div>
              <div className="p-10 border-2 border-dashed border-slate-700 rounded-2xl text-center bg-slate-900/50">
                <input type="file" accept=".pdf" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
                {isUploading ? (
                  <Loader2 className="h-10 w-10 text-blue-500 animate-spin mx-auto" />
                ) : (
                  <>
                    <FileUp className="h-10 w-10 text-slate-600 mx-auto mb-4" />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="text-blue-400 font-bold uppercase text-[10px] tracking-widest hover:underline">
                      {noteForm.url ? 'File Ready - Click to Change' : 'Select PDF Document'}
                    </button>
                  </>
                )}
              </div>
              <button type="submit" disabled={!noteForm.url} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest disabled:opacity-50">Upload to Server</button>
            </form>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notes.map(note => (
                <div key={note.id} className="p-5 bg-slate-800/20 border border-slate-800 rounded-2xl flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-red-500/10 rounded-lg flex items-center justify-center text-red-500"><FileText className="h-5 w-5" /></div>
                    <span className="text-xs font-bold text-slate-200 uppercase truncate max-w-[200px]">{note.title}</span>
                  </div>
                  <button onClick={() => handleDeleteNote(note.id)} className="p-2 text-slate-600 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'feedback' && (
          <div className="space-y-6">
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Student Testimonials</h3>
            <div className="space-y-4">
              {feedbacks.map(f => (
                <div key={f.id} className="p-6 bg-slate-800/20 border border-slate-800 rounded-3xl space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-blue-600/20 rounded-xl flex items-center justify-center font-black text-blue-400">{f.studentName[0]}</div>
                      <div>
                        <h4 className="text-xs font-black text-slate-200 uppercase">{f.studentName}</h4>
                        <p className="text-[8px] text-slate-500 uppercase">{f.quizTitle} • {f.date}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleToggleFeedbackVisibility(f.id, f.isVisible)} className={`p-2 rounded-lg transition-colors ${f.isVisible ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-700 text-slate-500'}`}>
                        {f.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                      <button onClick={() => handleDeleteFeedback(f.id)} className="p-2 bg-rose-500/10 text-rose-500 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed italic">"{f.comment}"</p>
                </div>
              ))}
              {feedbacks.length === 0 && (
                <div className="p-12 border border-dashed border-slate-800 rounded-3xl text-center text-slate-500 text-[10px] font-black uppercase">No feedback records found</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'word-converter' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-top-2">
            <div className="bg-indigo-600/10 border border-indigo-500/20 p-6 rounded-2xl flex items-start gap-4">
              <Cpu className="h-6 w-6 text-indigo-400 shrink-0 mt-1" />
              <div>
                <h4 className="text-indigo-400 font-bold text-sm uppercase mb-1 tracking-tight">AI Doc-to-Quiz Engine v3.0</h4>
                <p className="text-slate-400 text-xs leading-relaxed">Extract questions from any **PDF** or **Word** file. Standard format: Question text followed by options A, B, C, D.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="p-10 border-2 border-dashed border-slate-700 rounded-3xl bg-slate-800/20 flex flex-col items-center justify-center text-center group hover:border-indigo-500 transition-all cursor-pointer" onClick={() => docInputRef.current?.click()}>
                  <input type="file" accept=".docx,.pdf" onChange={handleDocUpload} ref={docInputRef} className="hidden" />
                  <div className="h-20 w-20 bg-indigo-600/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    {isParsing ? <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" /> : <Upload className="h-10 w-10 text-indigo-500" />}
                  </div>
                  <h3 className="text-white font-black uppercase text-sm mb-2 tracking-tight">Upload Assessment Document</h3>
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Supports PDF and Word (DOCX)</p>
                </div>
                {parsedQuestions.length > 0 && (
                  <div className="bg-slate-800/30 p-8 rounded-3xl border border-slate-700 space-y-6">
                    <h4 className="text-white font-black text-xs uppercase tracking-widest">Quiz Configuration</h4>
                    <AdminInput value={converterQuizTitle} onChange={e => setConverterQuizTitle(e.target.value)} placeholder="Quiz Title" />
                    <AdminSelect value={converterCategoryId} onChange={e => setConverterCategoryId(e.target.value)}>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </AdminSelect>
                    <button onClick={saveConvertedQuiz} className="w-full bg-green-600 hover:bg-green-500 text-white py-4 rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-3 shadow-xl">
                      <Save className="h-4 w-4" /> Add to Question Bank
                    </button>
                    <button onClick={() => setParsedQuestions([])} className="w-full bg-slate-800 text-slate-400 py-3 rounded-xl font-black uppercase text-[9px]">Discard Results</button>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <h4 className="text-white font-black text-xs uppercase tracking-widest flex items-center justify-between">
                  Extraction Preview 
                  <span className="px-3 py-1 bg-slate-800 rounded-full text-[9px]">{parsedQuestions.length} Items found</span>
                </h4>
                <div className="max-h-[550px] overflow-y-auto space-y-4 pr-2 custom-scrollbar border border-slate-800 p-4 rounded-2xl bg-slate-950/50">
                  {parsedQuestions.length === 0 && !isParsing && (
                    <div className="p-12 text-center text-slate-600 text-[10px] font-black uppercase">
                      Upload a document to begin analysis
                    </div>
                  )}
                  {isParsing && (
                    <div className="p-12 text-center">
                       <Loader2 className="h-8 w-8 text-indigo-500 animate-spin mx-auto mb-4" />
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Neural Parsing in Progress...</span>
                    </div>
                  )}
                  {parsedQuestions.map((q, idx) => (
                    <div key={idx} className="bg-slate-900 border border-slate-700 p-6 rounded-2xl animate-in fade-in slide-in-from-right-2" style={{ animationDelay: `${idx * 50}ms` }}>
                      <p className="text-slate-200 text-xs font-bold mb-4">{idx + 1}. {q.text}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className={`p-2 rounded text-[9px] uppercase font-bold border ${q.correctAnswer === oIdx ? 'bg-green-600/10 border-green-600/30 text-green-400' : 'bg-slate-800/50 border-slate-700 text-slate-500'}`}>
                            {String.fromCharCode(65 + oIdx)}. {opt}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'account' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-top-2">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                   <div className="bg-slate-800/20 border border-slate-700 p-8 rounded-3xl">
                      <h4 className="text-white font-black text-xs uppercase tracking-widest mb-6 flex items-center gap-2"><Activity className="h-4 w-4 text-emerald-400" /> System Health</h4>
                      <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 flex items-center justify-between mb-6">
                         <div>
                            <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Database Status</span>
                            <span className={`block text-xs font-bold uppercase ${dbStatus?.status === 'Connected' ? 'text-emerald-400' : 'text-rose-400'}`}>{dbStatus?.status || 'Testing...'}</span>
                         </div>
                         <button onClick={checkHealth} className="p-2 text-slate-500 hover:text-white transition-colors"><RefreshCw className="h-4 w-4" /></button>
                      </div>
                      <button onClick={handleRepair} disabled={isRepairing} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-3 border border-slate-700">
                         {isRepairing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />} Repair & Initialize Tables
                      </button>
                   </div>
                   <div className="bg-slate-800/20 border border-slate-700 p-8 rounded-3xl">
                      <h4 className="text-white font-black text-xs uppercase tracking-widest mb-6 flex items-center gap-2"><UserPlus className="h-4 w-4 text-blue-400" /> Authorized Personnel</h4>
                      <form onSubmit={handleAddAdmin} className="space-y-4">
                         <AdminInput value={newAdmin.username} onChange={e => setNewAdmin({...newAdmin, username: e.target.value})} placeholder="New Username" />
                         <AdminInput type="password" value={newAdmin.password} onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} placeholder="Master Password" />
                         <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all">Grant Access</button>
                      </form>
                   </div>
                </div>
                <div className="space-y-4">
                   <h4 className="text-white font-black text-xs uppercase tracking-widest mb-4">Registry of Administrators</h4>
                   <div className="space-y-3">
                      {adminUsers.map(admin => (
                         <div key={admin.id} className="p-5 bg-slate-800/20 border border-slate-800 rounded-2xl flex justify-between items-center group hover:border-slate-600">
                            <div className="flex items-center gap-4">
                               <div className="h-10 w-10 bg-slate-700 rounded-lg flex items-center justify-center text-blue-400"><User className="h-5 w-5" /></div>
                               <span className="text-sm font-bold text-slate-200 uppercase tracking-tight">{admin.username}</span>
                            </div>
                            <div className="flex items-center gap-2">
                               <button onClick={() => setUpdatingPass({ id: admin.id, pass: '' })} className="p-2 text-slate-500 hover:text-blue-400 transition-colors"><Key className="h-4 w-4" /></button>
                               <button onClick={() => handleDeleteAdmin(admin.id)} className="p-2 text-slate-500 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;