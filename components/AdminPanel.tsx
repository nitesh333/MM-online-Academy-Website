
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Edit, FileUp, Bell, Layout, Send, Save, X, BrainCircuit, FileText, Upload, Link, ListChecks, CheckCircle2 } from 'lucide-react';
import { Notification, SubCategory, Quiz, StudyNote, Question } from '../types';
import { generateQuizFromTopic } from '../services/geminiService';
import { dataService } from '../services/dataService';

// Define helper components OUTSIDE the main component to prevent focus loss on re-render
const AdminInput = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input 
    {...props}
    className={`w-full p-3 border border-gray-600 rounded text-sm bg-[#1a2b48] text-white focus:border-white outline-none placeholder:text-gray-400 ${className || ''}`}
  />
);

const AdminSelect = ({ children, className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select 
    {...props}
    className={`w-full p-3 border border-gray-600 rounded text-sm bg-[#1a2b48] text-white focus:border-white outline-none ${className || ''}`}
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
  const [activeTab, setActiveTab] = useState<'notifications' | 'categories' | 'quizzes' | 'uploads'>('notifications');
  const [showAddNews, setShowAddNews] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAiQuiz, setShowAiQuiz] = useState(false);
  const [showManualQuiz, setShowManualQuiz] = useState(false);
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Forms State
  const [newsForm, setNewsForm] = useState({ title: '', content: '', type: 'News' as any });
  const [categoryForm, setCategoryForm] = useState({ id: '', name: '', description: '' });
  const [quizTopic, setQuizTopic] = useState('');
  const [selectedSubForQuiz, setSelectedSubForQuiz] = useState(categories[0]?.id || '');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Manual Quiz State
  const [manualQuizForm, setManualQuizForm] = useState<{
    title: string;
    subCategoryId: string;
    questions: { text: string; options: string[]; correctAnswer: number }[];
  }>({
    title: '',
    subCategoryId: categories[0]?.id || '',
    questions: [{ text: '', options: ['', '', '', ''], correctAnswer: 0 }]
  });

  const [noteForm, setNoteForm] = useState({ title: '', url: '', subCategoryId: categories[0]?.id || '', type: 'PDF' as any });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    const list = await dataService.getNotes();
    setNotes(list);
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

  const handleGenerateQuiz = async () => {
    if (!quizTopic) return;
    setIsGenerating(true);
    const newQuiz = await generateQuizFromTopic(quizTopic, selectedSubForQuiz);
    if (newQuiz) {
      onAddQuiz(newQuiz);
      setShowAiQuiz(false);
      setQuizTopic('');
    }
    setIsGenerating(false);
  };

  // Manual Quiz Handlers
  const addQuestionToManual = () => {
    setManualQuizForm(prev => ({
      ...prev,
      questions: [...prev.questions, { text: '', options: ['', '', '', ''], correctAnswer: 0 }]
    }));
  };

  const removeQuestionFromManual = (index: number) => {
    if (manualQuizForm.questions.length <= 1) return;
    setManualQuizForm(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const updateManualQuestion = (index: number, field: string, value: any) => {
    setManualQuizForm(prev => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
      return { ...prev, questions: updatedQuestions };
    });
  };

  const updateManualOption = (qIndex: number, oIndex: number, value: string) => {
    setManualQuizForm(prev => {
      const updatedQuestions = [...prev.questions];
      const updatedOptions = [...updatedQuestions[qIndex].options];
      updatedOptions[oIndex] = value;
      updatedQuestions[qIndex] = { ...updatedQuestions[qIndex], options: updatedOptions };
      return { ...prev, questions: updatedQuestions };
    });
  };

  const handleManualQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualQuizForm.title || manualQuizForm.questions.some(q => !q.text)) {
      alert("Please fill in all quiz details.");
      return;
    }

    const newQuiz: Quiz = {
      id: `manual_${Date.now()}`,
      title: manualQuizForm.title,
      subCategoryId: manualQuizForm.subCategoryId,
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
      questions: [{ text: '', options: ['', '', '', ''], correctAnswer: 0 }]
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Only PDF files are allowed.');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setNoteForm(prev => ({ ...prev, url: base64, title: prev.title || file.name.replace('.pdf', '') }));
      setIsUploading(false);
    };
    reader.onerror = () => {
      alert('Error reading file.');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteForm.url) {
      alert('Please provide a URL or upload a PDF.');
      return;
    }
    const newNote: StudyNote = { id: Date.now().toString(), ...noteForm };
    const updated = await dataService.addNote(newNote);
    setNotes(updated);
    setNoteForm({ ...noteForm, title: '', url: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteNote = async (id: string) => {
    const updated = await dataService.deleteNote(id);
    setNotes(updated);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden min-h-[600px]">
      <div className="flex bg-gray-50 border-b border-gray-200 overflow-x-auto">
        {['notifications', 'categories', 'quizzes', 'uploads'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex items-center gap-2 px-6 py-4 font-bold text-xs uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${
              activeTab === tab ? 'border-[#1a2b48] text-[#1a2b48]' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'notifications' && <Bell className="h-4 w-4" />}
            {tab === 'categories' && <Layout className="h-4 w-4" />}
            {tab === 'quizzes' && <BrainCircuit className="h-4 w-4" />}
            {tab === 'uploads' && <FileUp className="h-4 w-4" />}
            {tab.replace(/^\w/, (c) => c.toUpperCase())}
          </button>
        ))}
      </div>

      <div className="p-8">
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-[#1a2b48] uppercase tracking-tight">Active Notifications</h3>
              <button onClick={() => setShowAddNews(!showAddNews)} className="flex items-center gap-2 bg-[#1a2b48] text-white px-5 py-2.5 rounded font-bold text-xs uppercase tracking-widest hover:bg-black transition-all">
                <Plus className="h-4 w-4" /> Add News Item
              </button>
            </div>

            {showAddNews && (
              <form onSubmit={handleAddNews} className="bg-gray-100 p-6 rounded-lg border border-gray-300 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-gray-500">Headline</label>
                    <AdminInput required value={newsForm.title} onChange={(e: any) => setNewsForm({...newsForm, title: e.target.value})} placeholder="Breaking News Title" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-gray-500">Category</label>
                    <AdminSelect value={newsForm.type} onChange={(e: any) => setNewsForm({...newsForm, type: e.target.value as any})}>
                      <option value="News">News</option>
                      <option value="Result">Result</option>
                      <option value="Test Date">Test Date</option>
                    </AdminSelect>
                  </div>
                </div>
                <div className="space-y-1 mb-6">
                  <label className="text-[10px] font-bold uppercase text-gray-500">Details</label>
                  <textarea 
                    required 
                    value={newsForm.content} 
                    onChange={e => setNewsForm({...newsForm, content: e.target.value})} 
                    rows={3} 
                    className="w-full p-3 border border-gray-600 rounded text-sm bg-[#1a2b48] text-white focus:border-white outline-none placeholder:text-gray-400" 
                    placeholder="Enter notification content..."
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setShowAddNews(false)} className="px-6 py-2 text-xs font-bold uppercase text-gray-400">Cancel</button>
                  <button type="submit" className="bg-green-600 text-white px-8 py-2 rounded font-bold text-xs uppercase tracking-widest hover:bg-green-700">Publish</button>
                </div>
              </form>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <tbody className="divide-y divide-gray-100">
                  {notifications.map(n => (
                    <tr key={n.id} className="hover:bg-gray-50">
                      <td className="py-4 px-2 text-xs font-bold text-gray-400">{n.date}</td>
                      <td className="py-4 px-2 text-sm font-bold text-gray-800">{n.title}</td>
                      <td className="py-4 px-2 text-right">
                        <button onClick={() => onDeleteNotification(n.id)} className="p-2 text-gray-300 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
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
              <h3 className="text-xl font-black text-[#1a2b48] uppercase tracking-tight">Study Modules</h3>
              <button onClick={() => setShowAddCategory(!showAddCategory)} className="flex items-center gap-2 bg-[#1a2b48] text-white px-5 py-2.5 rounded font-bold text-xs uppercase tracking-widest hover:bg-black transition-all">
                <Plus className="h-4 w-4" /> New Series
              </button>
            </div>

            {showAddCategory && (
              <form onSubmit={handleAddCategorySubmit} className="bg-gray-100 p-6 rounded-lg border border-gray-300 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <AdminInput required value={categoryForm.id} onChange={(e: any) => setCategoryForm({...categoryForm, id: e.target.value})} placeholder="Syllabus ID (e.g. gat-law)" />
                  <AdminInput required value={categoryForm.name} onChange={(e: any) => setCategoryForm({...categoryForm, name: e.target.value})} placeholder="Display Name (e.g. Law GAT)" />
                </div>
                <AdminInput required value={categoryForm.description} onChange={(e: any) => setCategoryForm({...categoryForm, description: e.target.value})} placeholder="Brief Description" className="mb-4" />
                <button type="submit" className="w-full bg-green-600 text-white py-3 rounded font-bold text-xs uppercase">Save Series</button>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map(c => (
                <div key={c.id} className="p-6 border border-gray-100 rounded bg-[#f9f9f9] flex justify-between items-center hover:border-[#1a2b48] transition-all">
                  <div><h4 className="font-bold text-gray-800 uppercase text-xs">{c.name}</h4><p className="text-[10px] text-gray-400 mt-1 uppercase">{c.id}</p></div>
                  <button onClick={() => onDeleteCategory(c.id)} className="p-1.5 text-gray-300 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'quizzes' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 className="text-xl font-black text-[#1a2b48] uppercase tracking-tight">Assessment Hub</h3>
              <div className="flex gap-2 w-full sm:w-auto">
                <button onClick={() => { setShowAiQuiz(!showAiQuiz); setShowManualQuiz(false); }} className="flex-grow sm:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all">
                  <BrainCircuit className="h-4 w-4" /> AI Generator
                </button>
                <button onClick={() => { setShowManualQuiz(!showManualQuiz); setShowAiQuiz(false); }} className="flex-grow sm:flex-none flex items-center justify-center gap-2 bg-[#1a2b48] text-white px-5 py-2.5 rounded font-bold text-xs uppercase tracking-widest hover:bg-black transition-all">
                  <ListChecks className="h-4 w-4" /> Manual Create
                </button>
              </div>
            </div>

            {showAiQuiz && (
              <div className="bg-blue-50 p-6 rounded-lg border-2 border-dashed border-blue-400 mb-8 animate-in slide-in-from-top-4 duration-300">
                <h4 className="text-xs font-black uppercase text-blue-800 mb-4 flex items-center gap-2">
                  <BrainCircuit className="h-4 w-4" /> AI-Powered Quiz Generation
                </h4>
                <AdminInput value={quizTopic} onChange={(e: any) => setQuizTopic(e.target.value)} placeholder="Topic: e.g. Contract Act 1872" className="mb-4" />
                <AdminSelect value={selectedSubForQuiz} onChange={(e: any) => setSelectedSubForQuiz(e.target.value)} className="mb-4">
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </AdminSelect>
                <button onClick={handleGenerateQuiz} disabled={isGenerating} className="w-full bg-blue-600 text-white py-3 rounded font-bold uppercase text-xs">
                  {isGenerating ? 'Gemini AI is crafting your test...' : 'Generate 5 MCQs Now'}
                </button>
              </div>
            )}

            {showManualQuiz && (
              <form onSubmit={handleManualQuizSubmit} className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8 animate-in slide-in-from-top-4 duration-300">
                <h4 className="text-xs font-black uppercase text-[#1a2b48] mb-4 flex items-center gap-2">
                  <ListChecks className="h-4 w-4" /> Manual Quiz Creator
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-gray-500">Quiz Title</label>
                    <AdminInput required value={manualQuizForm.title} onChange={(e: any) => setManualQuizForm({...manualQuizForm, title: e.target.value})} placeholder="e.g. Legal Ethics Final" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-gray-500">Subject Category</label>
                    <AdminSelect value={manualQuizForm.subCategoryId} onChange={(e: any) => setManualQuizForm({...manualQuizForm, subCategoryId: e.target.value})}>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </AdminSelect>
                  </div>
                </div>

                <div className="space-y-8">
                  {manualQuizForm.questions.map((q, qIdx) => (
                    <div key={`q-container-${qIdx}`} className="p-5 bg-white border border-gray-200 rounded-md relative shadow-sm">
                      <button 
                        type="button" 
                        onClick={() => removeQuestionFromManual(qIdx)}
                        className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      
                      <div className="mb-4">
                        <label className="text-[10px] font-black uppercase text-[#1a2b48] block mb-2">Question {qIdx + 1}</label>
                        <AdminInput 
                          required 
                          value={q.text} 
                          onChange={(e: any) => updateManualQuestion(qIdx, 'text', e.target.value)} 
                          placeholder="Type question text here..." 
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {q.options.map((opt, oIdx) => (
                          <div key={`opt-container-${qIdx}-${oIdx}`} className="relative group">
                            <AdminInput 
                              required 
                              value={opt} 
                              onChange={(e: any) => updateManualOption(qIdx, oIdx, e.target.value)} 
                              placeholder={`Option ${String.fromCharCode(65 + oIdx)}`} 
                              className={q.correctAnswer === oIdx ? 'border-green-500 ring-1 ring-green-500' : ''}
                            />
                            <button 
                              type="button"
                              onClick={() => updateManualQuestion(qIdx, 'correctAnswer', oIdx)}
                              className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded transition-all ${q.correctAnswer === oIdx ? 'text-green-500' : 'text-gray-300 hover:text-green-400'}`}
                              title="Mark as correct answer"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-8">
                  <button 
                    type="button" 
                    onClick={addQuestionToManual}
                    className="flex-grow py-3 border-2 border-dashed border-[#1a2b48] text-[#1a2b48] font-bold text-[10px] uppercase rounded hover:bg-[#1a2b48] hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="h-3 w-3" /> Add Another Question
                  </button>
                  <button 
                    type="submit" 
                    className="flex-grow py-3 bg-green-600 text-white font-bold text-[10px] uppercase rounded hover:bg-green-700 transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <Save className="h-3 w-3" /> Save & Publish Quiz
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Manage Existing Tests</h4>
              {quizzes.map(q => (
                <div key={q.id} className="p-4 bg-white border border-gray-100 rounded flex justify-between items-center hover:border-gray-300 transition-all shadow-sm">
                  <div>
                    <h4 className="font-bold text-gray-800 uppercase text-sm">{q.title}</h4>
                    <p className="text-[10px] text-gray-400 uppercase tracking-tight">
                      {q.questions.length} MCQs • {categories.find(c => c.id === q.subCategoryId)?.name || 'General'}
                    </p>
                  </div>
                  <button onClick={() => onDeleteQuiz(q.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'uploads' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-[#1a2b48] uppercase tracking-tight">Document Center</h3>
            </div>
            
            <form onSubmit={handleAddNote} className="bg-gray-100 p-6 rounded-lg border border-gray-300 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                   <label className="text-[10px] font-bold uppercase text-gray-500">Note Title</label>
                   <AdminInput required value={noteForm.title} onChange={(e: any) => setNoteForm({...noteForm, title: e.target.value})} placeholder="e.g. Civil Procedure Code" />
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-bold uppercase text-gray-500">Target Syllabus</label>
                   <AdminSelect value={noteForm.subCategoryId} onChange={(e: any) => setNoteForm({...noteForm, subCategoryId: e.target.value})}>
                     {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                   </AdminSelect>
                </div>
              </div>

              <div className="bg-white p-6 rounded border border-gray-200 shadow-inner">
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="flex-grow w-full">
                    <label className="text-[10px] font-bold uppercase text-[#1a2b48] mb-2 flex items-center gap-2">
                      <Link className="h-3 w-3" /> External PDF URL
                    </label>
                    <AdminInput 
                      value={noteForm.url.startsWith('data:') ? '' : noteForm.url} 
                      onChange={(e: any) => setNoteForm({...noteForm, url: e.target.value})} 
                      placeholder="https://example.com/notes.pdf" 
                    />
                  </div>
                  
                  <div className="flex-shrink-0 flex flex-col items-center">
                    <span className="text-[9px] font-bold text-gray-400 uppercase my-2">OR</span>
                    <input 
                      type="file" 
                      accept="application/pdf" 
                      onChange={handleFileChange} 
                      className="hidden" 
                      ref={fileInputRef} 
                    />
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      className={`flex items-center gap-2 px-6 py-3 rounded text-[10px] font-bold uppercase tracking-widest transition-all ${
                        noteForm.url.startsWith('data:') 
                          ? 'bg-green-600 text-white' 
                          : 'bg-gray-100 text-[#1a2b48] border border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {isUploading ? 'Processing...' : (noteForm.url.startsWith('data:') ? 'PDF Uploaded ✓' : 'Upload PDF File')}
                      <Upload className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full bg-[#1a2b48] text-white py-4 rounded font-bold uppercase text-xs flex items-center justify-center gap-3 hover:bg-black transition-all shadow-md">
                <Save className="h-4 w-4" /> Add Note to Repository
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notes.map(n => (
                <div key={n.id} className="p-4 bg-white border border-gray-200 rounded flex justify-between items-center shadow-sm">
                  <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-red-500" />
                    <div className="max-w-[180px] sm:max-w-xs">
                      <h4 className="font-bold text-gray-800 text-xs uppercase truncate">{n.title}</h4>
                      <p className="text-[9px] text-gray-400 uppercase tracking-widest">{categories.find(c => c.id === n.subCategoryId)?.name || n.subCategoryId} • {n.url.startsWith('data:') ? 'Stored Offline' : 'Web Link'}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteNote(n.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
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
