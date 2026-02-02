
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, FileUp, Bell, Layout, Save, X, FileText, Upload, Link, ListChecks, CheckCircle, Youtube, MessageSquare, Mail, User, Eye, EyeOff, FileType, AlertCircle, Loader2, ShieldCheck, Key, UserPlus } from 'lucide-react';
import { Notification, SubCategory, Quiz, StudyNote, QuizFeedback, Question } from '../types';
import { dataService } from '../services/dataService';
import mammoth from 'mammoth';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wordInputRef = useRef<HTMLInputElement>(null);
  
  const [newsForm, setNewsForm] = useState({ title: '', content: '', type: 'News' as any });
  const [categoryForm, setCategoryForm] = useState({ id: '', name: '', description: '' });
  
  // Word Converter State
  const [isParsingWord, setIsParsingWord] = useState(false);
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
  }, []);

  const loadNotes = async () => {
    const list = await dataService.getNotes();
    setNotes(list);
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
    const updated = await dataService.addAdmin(newAdmin.username, newAdmin.password);
    setAdminUsers(updated);
    setNewAdmin({ username: '', password: '' });
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingPass || !updatingPass.pass) return;
    const updated = await dataService.updateAdminPassword(updatingPass.id, updatingPass.pass);
    setAdminUsers(updated);
    setUpdatingPass(null);
    alert("Password updated successfully.");
  };

  const handleDeleteAdmin = async (id: string) => {
    if (adminUsers.length <= 1) {
      alert("Cannot delete the last administrator.");
      return;
    }
    if (!confirm("Remove this administrator account?")) return;
    const updated = await dataService.deleteAdmin(id);
    setAdminUsers(updated);
  };

  const parseWordFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingWord(true);
    setActiveTab('word-converter'); 

    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value;
      
      const questions: Question[] = [];
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);

      let currentQuestion: TempQuestion | null = null;

      for (const line of lines) {
        const questionMatch = line.match(/^(?:Q|Question\s*)?(\d+)[\.\)\-\s]+(.*)/i);
        const optionMatch = line.match(/^[\(\[]?([A-Da-d])[\.\)\-\s\]]+(.*)/i);
        const answerMatch = line.match(/(?:Answer|Ans|Correct)(?:\s+is)?[\s:]*([A-Da-d])/i);

        if (questionMatch) {
          if (currentQuestion && currentQuestion.text && currentQuestion.options.length >= 2) {
            questions.push({
              id: `word_${Date.now()}_${questions.length}`,
              text: currentQuestion.text,
              options: currentQuestion.options.slice(0, 4),
              correctAnswer: currentQuestion.correctAnswer
            });
          }
          currentQuestion = {
            text: questionMatch[2].trim(),
            options: [],
            correctAnswer: 0
          };
        } else if (optionMatch && currentQuestion) {
          currentQuestion.options.push(optionMatch[2].trim());
        } else if (answerMatch && currentQuestion) {
          const letter = answerMatch[1].toUpperCase();
          currentQuestion.correctAnswer = letter.charCodeAt(0) - 65; 
        } else if (currentQuestion && !optionMatch && !answerMatch) {
          currentQuestion.text += " " + line;
        }
      }

      if (currentQuestion && currentQuestion.text && currentQuestion.options.length >= 2) {
        questions.push({
          id: `word_${Date.now()}_${questions.length}`,
          text: currentQuestion.text,
          options: currentQuestion.options.slice(0, 4),
          correctAnswer: currentQuestion.correctAnswer
        });
      }

      setParsedQuestions(questions);
      if (!converterQuizTitle) setConverterQuizTitle(file.name.replace('.docx', ''));
    } catch (err) {
      console.error("Word Parse Error:", err);
      alert("Error parsing Word file.");
    } finally {
      setIsParsingWord(false);
      if (wordInputRef.current) wordInputRef.current.value = '';
    }
  };

  const saveConvertedQuiz = () => {
    if (!converterQuizTitle || parsedQuestions.length === 0) {
      alert("Please provide a title.");
      return;
    }
    const newQuiz: Quiz = {
      id: `word_quiz_${Date.now()}`,
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
    const updated = await dataService.addNote(newNote);
    setNotes(updated);
    setNoteForm({ ...noteForm, title: '', url: '' });
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm("Delete this document?")) return;
    const updated = await dataService.deleteNote(id);
    setNotes(updated);
  };

  const handleToggleFeedbackVisibility = async (id: string, currentVisible: boolean) => {
    const updatedList = await dataService.updateQuizFeedback(id, { isVisible: !currentVisible });
    setFeedbacks(updatedList);
  };

  const handleDeleteFeedback = async (id: string) => {
    if (!window.confirm("Are you sure?")) return;
    const updatedList = await dataService.deleteQuizFeedback(id);
    setFeedbacks(updatedList);
  };

  return (
    <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-800 overflow-hidden min-h-[500px] flex flex-col">
      <div className="flex bg-slate-950/50 border-b border-slate-800 overflow-x-auto no-scrollbar scroll-smooth">
        {[
          { id: 'notifications', label: 'Alerts', icon: <Bell className="h-4 w-4" /> },
          { id: 'categories', label: 'Categories', icon: <Layout className="h-4 w-4" /> },
          { id: 'quizzes', label: 'Quizzes', icon: <ListChecks className="h-4 w-4" /> },
          { id: 'word-converter', label: 'Word to MCQ', icon: <FileType className="h-4 w-4" /> },
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
        {activeTab === 'account' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-top-2">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                   <div className="bg-slate-800/20 border border-slate-700 p-8 rounded-3xl">
                      <h4 className="text-white font-black text-xs uppercase tracking-widest mb-6 flex items-center gap-2"><UserPlus className="h-4 w-4 text-blue-400" /> Authorized Personnel</h4>
                      <form onSubmit={handleAddAdmin} className="space-y-4">
                         <AdminInput value={newAdmin.username} onChange={e => setNewAdmin({...newAdmin, username: e.target.value})} placeholder="New Username" />
                         <AdminInput type="password" value={newAdmin.password} onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} placeholder="Master Password" />
                         <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all">Grant Access</button>
                      </form>
                   </div>

                   {updatingPass && (
                      <div className="bg-slate-800/40 border border-blue-500/30 p-8 rounded-3xl animate-in zoom-in-95">
                         <h4 className="text-blue-400 font-black text-xs uppercase tracking-widest mb-6 flex items-center gap-2"><Key className="h-4 w-4" /> Reset Credentials</h4>
                         <form onSubmit={handleUpdatePassword} className="space-y-4">
                            <AdminInput autoFocus type="password" value={updatingPass.pass} onChange={e => setUpdatingPass({...updatingPass, pass: e.target.value})} placeholder="Enter New Password" />
                            <div className="flex gap-3">
                               <button type="button" onClick={() => setUpdatingPass(null)} className="flex-grow bg-slate-700 text-white py-4 rounded-xl font-black uppercase text-[10px]">Cancel</button>
                               <button className="flex-grow bg-green-600 text-white py-4 rounded-xl font-black uppercase text-[10px]">Verify & Update</button>
                            </div>
                         </form>
                      </div>
                   )}
                </div>

                <div className="space-y-4">
                   <h4 className="text-white font-black text-xs uppercase tracking-widest mb-4">Registry of Administrators</h4>
                   <div className="space-y-3">
                      {adminUsers.map(admin => (
                         <div key={admin.id} className="p-5 bg-slate-800/20 border border-slate-800 rounded-2xl flex justify-between items-center group hover:border-slate-600">
                            <div className="flex items-center gap-4">
                               <div className="h-10 w-10 bg-slate-700 rounded-lg flex items-center justify-center text-blue-400">
                                  <User className="h-5 w-5" />
                               </div>
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

        {activeTab === 'word-converter' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-top-2">
            <div className="bg-blue-600/10 border border-blue-500/20 p-6 rounded-2xl flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-blue-400 shrink-0 mt-1" />
              <div>
                <h4 className="text-blue-400 font-bold text-sm uppercase mb-1 tracking-tight">Parser Engine v2.0</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Upload a Word (.docx) file. The system will automatically detect questions and options.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="p-10 border-2 border-dashed border-slate-700 rounded-3xl bg-slate-800/20 flex flex-col items-center justify-center text-center">
                  <input type="file" accept=".docx" onChange={parseWordFile} ref={wordInputRef} className="hidden" />
                  <div className="h-20 w-20 bg-blue-600/20 rounded-full flex items-center justify-center mb-6">
                    {isParsingWord ? <Loader2 className="h-10 w-10 text-blue-500 animate-spin" /> : <FileType className="h-10 w-10 text-blue-500" />}
                  </div>
                  <h3 className="text-white font-black uppercase text-sm mb-2 tracking-tight">Convert Word Document</h3>
                  <button 
                    onClick={() => wordInputRef.current?.click()}
                    disabled={isParsingWord}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all shadow-xl disabled:opacity-50"
                  >
                    {isParsingWord ? 'Parsing Document...' : 'Upload Word File'}
                  </button>
                </div>

                {parsedQuestions.length > 0 && (
                  <div className="bg-slate-800/30 p-8 rounded-3xl border border-slate-700 space-y-6">
                    <h4 className="text-white font-black text-xs uppercase tracking-widest">Metadata</h4>
                    <div className="space-y-4">
                      <AdminInput value={converterQuizTitle} onChange={e => setConverterQuizTitle(e.target.value)} placeholder="Quiz Title" />
                      <AdminSelect value={converterCategoryId} onChange={e => setConverterCategoryId(e.target.value)}>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </AdminSelect>
                    </div>
                    <button onClick={saveConvertedQuiz} className="w-full bg-green-600 hover:bg-green-500 text-white py-4 rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-3">
                      <Save className="h-4 w-4" /> Add to Question Bank
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h4 className="text-white font-black text-xs uppercase tracking-widest">Live Parser Output ({parsedQuestions.length} items)</h4>
                <div className="max-h-[550px] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                  {parsedQuestions.length === 0 && !isParsingWord && (
                    <div className="p-12 border border-dashed border-slate-800 rounded-2xl text-center text-slate-600 text-[10px] font-black uppercase">
                      No data parsed yet
                    </div>
                  )}
                  {isParsingWord && (
                    <div className="p-12 text-center">
                       <Loader2 className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-4" />
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Analyzing Formatting...</span>
                    </div>
                  )}
                  {parsedQuestions.map((q, idx) => (
                    <div key={idx} className="bg-slate-900 border border-slate-700 p-6 rounded-2xl">
                      <p className="text-slate-200 text-xs font-bold mb-4">{idx + 1}. {q.text}</p>
                      <div className="grid grid-cols-2 gap-2">
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
              <form onSubmit={handleManualQuizSubmit} className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700 mb-8 space-y-8 animate-in slide-in-from-top-4">
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
                            }} className={`px-4 rounded border transition-all ${q.correctAnswer === oIdx ? 'bg-green-600 text-white border-green-600' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                              {String.fromCharCode(65+oIdx)}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={addManualQuestion} className="w-full py-4 border-2 border-dashed border-slate-700 rounded-2xl text-slate-500 font-bold uppercase text-[10px] hover:text-white hover:border-slate-500">
                    + Add Another Question
                  </button>
                </div>
                
                <div className="flex justify-end gap-4 pt-4">
                   <button type="button" onClick={() => setShowManualQuiz(false)} className="px-8 py-3 text-slate-500 font-black uppercase text-[10px]">Discard</button>
                   <button type="submit" className="bg-green-600 text-white px-12 py-3 rounded-xl font-black uppercase text-[10px] shadow-xl">Deploy Quiz</button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {quizzes.map(q => (
                <div key={q.id} className="p-4 bg-slate-800/20 border border-slate-800 rounded-xl flex justify-between items-center group hover:border-slate-600">
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
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Resource Directories</h3>
              <button onClick={() => setShowAddCategory(!showAddCategory)} className="bg-[#1a2b48] text-white px-5 py-3 rounded font-bold text-[10px] uppercase tracking-widest">
                <Plus className="h-4 w-4" /> Add Syllabus
              </button>
            </div>
            {showAddCategory && (
              <form onSubmit={handleAddCategorySubmit} className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 mb-8 animate-in slide-in-from-top-4">
                <AdminInput required value={categoryForm.id} onChange={(e: any) => setCategoryForm({...categoryForm, id: e.target.value})} placeholder="Slug (e.g. mcat)" />
                <div className="mt-4">
                  <AdminInput required value={categoryForm.name} onChange={(e: any) => setCategoryForm({...categoryForm, name: e.target.value})} placeholder="Title" />
                </div>
                <button type="submit" className="mt-4 w-full bg-green-600 text-white py-3.5 rounded font-bold text-[10px] uppercase">Save Directory</button>
              </form>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map(c => (
                <div key={c.id} className="p-5 border border-slate-800 rounded bg-slate-800/20 flex justify-between items-center group hover:border-slate-600 transition-colors">
                  <h4 className="font-bold text-slate-200 uppercase text-[11px] truncate">{c.name}</h4>
                  <button onClick={() => onDeleteCategory(c.id)} className="p-2 text-slate-600 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'uploads' && (
          <div className="space-y-8">
            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-6">Study Repository</h3>
            <form onSubmit={handleAddNote} className="bg-slate-800/30 p-8 rounded-3xl border border-slate-700 space-y-4">
              <AdminInput required value={noteForm.title} onChange={(e: any) => setNoteForm({...noteForm, title: e.target.value})} placeholder="Document Title" />
              <AdminSelect value={noteForm.subCategoryId} onChange={(e: any) => setNoteForm({...noteForm, subCategoryId: e.target.value})}>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </AdminSelect>
              <div className="flex flex-col items-center gap-4 py-4">
                <input type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" ref={fileInputRef} />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full bg-blue-600/10 border border-blue-500/30 text-blue-400 py-6 rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-3">
                  <Upload className="h-4 w-4" /> {isUploading ? 'Encoding PDF...' : 'Select PDF File'}
                </button>
              </div>
              <button type="submit" className="w-full bg-green-600 text-white py-4 rounded-xl font-black uppercase text-[10px] shadow-xl">Publish to Repository</button>
            </form>
          </div>
        )}

        {activeTab === 'feedback' && (
          <div className="space-y-6">
            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-6">Institutional Feedback</h3>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {feedbacks.map(f => (
                <div key={f.id} className={`bg-slate-800/20 border rounded-3xl p-6 transition-all ${f.isVisible ? 'border-emerald-500/30' : 'border-slate-800'}`}>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="font-black text-white uppercase text-xs tracking-tight">{f.studentName}</h4>
                      <p className="text-[9px] font-bold text-slate-500 uppercase">{f.studentEmail}</p>
                    </div>
                    <div className="flex items-center gap-2">
                       <button onClick={() => handleToggleFeedbackVisibility(f.id, f.isVisible)} className={`p-2 rounded-lg border transition-colors ${f.isVisible ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                         {f.isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                       </button>
                       <button onClick={() => handleDeleteFeedback(f.id)} className="p-2 bg-slate-800 border border-slate-700 text-slate-500 hover:text-red-500 rounded-lg transition-colors"><Trash2 className="h-3 w-3" /></button>
                    </div>
                  </div>
                  <p className="text-slate-300 text-xs italic font-medium leading-relaxed">"{f.comment}"</p>
                  <p className="text-[8px] font-bold text-slate-600 uppercase mt-4 tracking-widest">{f.quizTitle}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
