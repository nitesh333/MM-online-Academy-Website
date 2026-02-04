import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Loader2, Database, Activity, RefreshCw, FileUp, FileText, CheckCircle2, AlertCircle, ChevronRight, UploadCloud } from 'lucide-react';
import { Notification, SubCategory, Quiz, Question } from '../types';
import { dataService } from '../services/dataService';
import { parserService } from '../services/parserService';

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
  onAddNotification: (n: Notification) => void;
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
  const [activeTab, setActiveTab] = useState<'notifications' | 'categories' | 'quizzes' | 'account'>('notifications');
  const [isRepairing, setIsRepairing] = useState(false);
  const [dbStatus, setDbStatus] = useState<string>('Testing connection...');

  // Parsing State
  const [isParsing, setIsParsing] = useState(false);
  const [parsedQuestions, setParsedQuestions] = useState<Partial<Question>[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newsForm, setNewsForm] = useState({ title: '', content: '', type: 'News' as any });
  const [categoryForm, setCategoryForm] = useState({ id: '', name: '', description: '' });
  const [manualQuizForm, setManualQuizForm] = useState<{
    title: string;
    subCategoryId: string;
    videoUrl: string;
    questions: { text: string; options: string[]; correctAnswer: number }[];
  }>({
    title: '',
    subCategoryId: categories[0]?.id || 'lat',
    videoUrl: '',
    questions: [{ text: '', options: ['', '', '', ''], correctAnswer: 0 }]
  });

  useEffect(() => { checkHealth(); }, []);

  const checkHealth = async () => {
    try {
      const res = await dataService.testConnection();
      setDbStatus(res.success ? 'Operational' : 'Database Offline');
    } catch {
      setDbStatus('Connection Fault');
    }
  };

  const handleRepair = async () => {
    if (!confirm("This will synchronize institutional tables and restore master credentials. Continue?")) return;
    setIsRepairing(true);
    try {
      const res = await dataService.repairDatabase();
      if (res && res.success) {
        alert("Institutional Sync: " + res.message);
        window.location.reload();
      } else {
        alert("Sync Alert: " + (res?.error || 'Registry output error.'));
      }
    } catch (e: any) {
      alert("Critical Error: " + e.message);
    } finally {
      setIsRepairing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setParseError(null);
    setParsedQuestions([]);

    try {
      const text = await parserService.extractTextFromFile(file);
      const results = parserService.parseMCQs(text);
      
      if (results.length === 0) {
        setParseError("No valid MCQs detected. Ensure questions start with 'Q1.' and options with 'A)'.");
      } else {
        setParsedQuestions(results);
        setManualQuizForm(prev => ({ ...prev, questions: results as any[] }));
      }
    } catch (err: any) {
      setParseError(err.message || "Failed to process document.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleManualQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualQuizForm.title) {
        alert("Please enter a Quiz Title");
        return;
    }
    const newQuiz: Quiz = {
      id: `q_${Date.now()}`,
      title: manualQuizForm.title,
      subCategoryId: manualQuizForm.subCategoryId,
      videoUrl: manualQuizForm.videoUrl,
      questions: manualQuizForm.questions.map((q, idx) => ({ 
          id: `q_${idx}_${Date.now()}`, 
          text: q.text,
          options: q.options,
          correctAnswer: q.correctAnswer
      }))
    };
    onAddQuiz(newQuiz);
    alert(`Institutional Deployment Success: ${newQuiz.title} live on ${manualQuizForm.subCategoryId.toUpperCase()} Track.`);
    setManualQuizForm({
      title: '',
      subCategoryId: categories[0]?.id || 'lat',
      videoUrl: '',
      questions: [{ text: '', options: ['', '', '', ''], correctAnswer: 0 }]
    });
    setParsedQuestions([]);
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden min-h-[600px] flex flex-col shadow-2xl">
      <div className="flex bg-slate-950/50 border-b border-slate-800 overflow-x-auto no-scrollbar">
        {[
          { id: 'notifications', label: 'Gazette' },
          { id: 'categories', label: 'Tracks' },
          { id: 'quizzes', label: 'Assessments' },
          { id: 'account', label: 'System' }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-8 py-4 font-black text-[10px] uppercase tracking-widest transition-all border-b-2 ${
              activeTab === tab.id ? 'border-gold text-gold bg-slate-900' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-8 flex-grow">
        {activeTab === 'notifications' && (
          <div className="space-y-8">
            <form onSubmit={(e) => { e.preventDefault(); onAddNotification({ id: Date.now().toString(), date: new Date().toLocaleDateString(), ...newsForm }); }} className="bg-slate-800/30 p-6 rounded-xl border border-slate-700 space-y-4">
               <AdminInput value={newsForm.title} onChange={e => setNewsForm({...newsForm, title: e.target.value})} placeholder="Announcement Title" required />
               <AdminSelect value={newsForm.type} onChange={e => setNewsForm({...newsForm, type: e.target.value as any})}>
                  <option value="News">News</option>
                  <option value="Result">Result</option>
                  <option value="Test Date">Test Date</option>
               </AdminSelect>
               <textarea value={newsForm.content} onChange={e => setNewsForm({...newsForm, content: e.target.value})} className="w-full p-3 bg-slate-800 text-white rounded text-sm border border-slate-700" rows={3} placeholder="Statement..." required />
               <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded font-black text-[10px] uppercase">Publish</button>
            </form>
            <div className="divide-y divide-slate-800">
               {notifications.map(n => (
                 <div key={n.id} className="py-4 flex justify-between items-center">
                    <div>
                       <h5 className="text-white font-bold text-sm uppercase tracking-tight">{n.title}</h5>
                       <p className="text-[9px] text-slate-500 uppercase font-black">{n.date} • {n.type}</p>
                    </div>
                    <button onClick={() => onDeleteNotification(n.id)} className="text-slate-600 hover:text-red-500 p-2"><Trash2 className="h-4 w-4" /></button>
                 </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-8">
            <form onSubmit={(e) => { e.preventDefault(); onAddCategory({ ...categoryForm }); }} className="bg-slate-800/30 p-6 rounded-xl border border-slate-700 space-y-4">
               <AdminInput value={categoryForm.id} onChange={e => setCategoryForm({...categoryForm, id: e.target.value})} placeholder="Track ID (lat, ecat)" required />
               <AdminInput value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} placeholder="Track Display Name" required />
               <button type="submit" className="bg-emerald-600 text-white px-8 py-3 rounded font-black text-[10px] uppercase">Deploy Track</button>
            </form>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {categories.map(c => (
                 <div key={c.id} className="p-4 bg-slate-800/20 border border-slate-800 rounded-xl flex justify-between items-center">
                    <span className="text-white font-bold text-xs uppercase">{c.name} ({c.id})</span>
                    <button onClick={() => onDeleteCategory(c.id)} className="text-slate-600 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                 </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === 'quizzes' && (
          <div className="space-y-10">
            {/* 1. DOCUMENT UPLOAD ENGINE */}
            <div className="bg-slate-800/40 border-2 border-dashed border-slate-700 rounded-3xl p-10 text-center hover:border-blue-500/50 transition-all group">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept=".pdf,.docx" 
              />
              <UploadCloud className="h-12 w-12 text-slate-600 mx-auto mb-4 group-hover:text-blue-500 transition-colors" />
              <h3 className="text-white font-black text-lg uppercase tracking-tight mb-2">Quiz Upload Engine</h3>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-6">Import MCQs from Institutional PDF or Word Documents</p>
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isParsing}
                className="bg-blue-600/10 text-blue-400 border border-blue-500/30 px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50"
              >
                {isParsing ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Analyzing Document...</span> : "Select Document"}
              </button>

              {parseError && (
                <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-black uppercase flex items-center justify-center gap-2">
                  <AlertCircle className="h-4 w-4" /> {parseError}
                </div>
              )}

              {parsedQuestions.length > 0 && (
                <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-[10px] font-black uppercase flex items-center justify-center gap-2 animate-in zoom-in-95">
                  <CheckCircle2 className="h-4 w-4" /> {parsedQuestions.length} Questions Extracted & Ready for Review
                </div>
              )}
            </div>

            {/* 2. QUIZ DEPLOYMENT FORM */}
            <form onSubmit={handleManualQuizSubmit} className="bg-slate-800/30 p-8 rounded-2xl border border-slate-700 space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Assessment Title</label>
                    <AdminInput value={manualQuizForm.title} onChange={e => setManualQuizForm({...manualQuizForm, title: e.target.value})} placeholder="e.g. Constitutional Law Mock V1" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Target Track</label>
                    <AdminSelect value={manualQuizForm.subCategoryId} onChange={e => setManualQuizForm({...manualQuizForm, subCategoryId: e.target.value})}>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </AdminSelect>
                  </div>
               </div>

               <div className="space-y-4 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                  {manualQuizForm.questions.map((q, idx) => (
                    <div key={idx} className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-4 shadow-inner">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Question Block #{idx + 1}</span>
                            <button 
                                type="button"
                                onClick={() => {
                                    const nq = manualQuizForm.questions.filter((_, i) => i !== idx);
                                    setManualQuizForm({...manualQuizForm, questions: nq});
                                }}
                                className="text-slate-600 hover:text-red-500 transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                        <AdminInput value={q.text} onChange={e => {
                          const nq = [...manualQuizForm.questions];
                          nq[idx].text = e.target.value;
                          setManualQuizForm({...manualQuizForm, questions: nq});
                        }} placeholder={`Question Statement`} />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           {q.options.map((o, oidx) => (
                             <div key={oidx} className="relative">
                                <AdminInput value={o} onChange={e => {
                                    const nq = [...manualQuizForm.questions];
                                    nq[idx].options[oidx] = e.target.value;
                                    setManualQuizForm({...manualQuizForm, questions: nq});
                                }} placeholder={`Option ${String.fromCharCode(65+oidx)}`} />
                                <button 
                                    type="button"
                                    onClick={() => {
                                        const nq = [...manualQuizForm.questions];
                                        nq[idx].correctAnswer = oidx;
                                        setManualQuizForm({...manualQuizForm, questions: nq});
                                    }}
                                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-all ${q.correctAnswer === oidx ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-500'}`}
                                >
                                    <CheckCircle2 className="h-3 w-3" />
                                </button>
                             </div>
                           ))}
                        </div>
                    </div>
                  ))}
               </div>

               <div className="flex gap-4">
                    <button 
                        type="button" 
                        onClick={() => setManualQuizForm({
                            ...manualQuizForm, 
                            questions: [...manualQuizForm.questions, { text: '', options: ['', '', '', ''], correctAnswer: 0 }]
                        })}
                        className="flex-grow bg-slate-800 text-slate-300 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest border border-slate-700 hover:bg-slate-700 transition-all"
                    >
                        Add Manual Question
                    </button>
                    <button 
                        type="submit" 
                        className="flex-[2] bg-blue-600 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl hover:bg-blue-500 transition-all"
                    >
                        Deploy Institutional Assessment
                    </button>
               </div>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {quizzes.map(q => (
                 <div key={q.id} className="p-4 bg-slate-800/20 border border-slate-800 rounded-xl flex justify-between items-center group">
                    <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                        <div>
                            <span className="text-white font-bold text-xs uppercase">{q.title}</span>
                            <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest">{q.subCategoryId} • {q.questions.length} Questions</p>
                        </div>
                    </div>
                    <button onClick={() => onDeleteQuiz(q.id)} className="text-slate-600 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                 </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === 'account' && (
          <div className="space-y-10">
            <div className="bg-slate-800/30 p-10 rounded-[32px] border border-slate-700 text-center relative overflow-hidden shadow-2xl">
               <Activity className="h-16 w-16 text-emerald-400 mx-auto mb-6" />
               <h3 className="text-white font-black text-2xl uppercase mb-2">Registry Console</h3>
               <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.4em] mb-10">System Status: <span className="text-emerald-400">{dbStatus}</span></p>
               <div className="max-w-md mx-auto space-y-4">
                 <button onClick={handleRepair} disabled={isRepairing} className="w-full bg-slate-700 hover:bg-slate-600 text-white px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-4 border border-slate-600 shadow-xl">
                    {isRepairing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Database className="h-5 w-5" />} Repair Institutional Schema
                 </button>
                 <button onClick={checkHealth} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-4 border border-slate-700 shadow-xl">
                    <RefreshCw className="h-5 w-5" /> Refresh Connection
                 </button>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;