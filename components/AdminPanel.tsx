
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Trash2, Loader2, Database, Activity, RefreshCw, FileUp, FileText, CheckCircle2, AlertCircle, UploadCloud, Sparkles, Eye, EyeOff, MessageSquare, Image as ImageIcon } from 'lucide-react';
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

  const [newsForm, setNewsForm] = useState<{title: string; content: string; type: Notification['type']; attachmentUrl: string}>({ 
    title: '', 
    content: '', 
    type: 'News',
    attachmentUrl: '' 
  });
  
  const [manualQuizForm, setManualQuizForm] = useState<{
    title: string;
    subCategoryId: string;
    videoUrl: string;
    questions: { text: string; options: string[]; correctAnswer: number; explanation?: string }[];
  }>({
    title: '',
    subCategoryId: categories[0]?.id || 'lat',
    videoUrl: '',
    questions: [{ text: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }]
  });

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
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setNewsForm(prev => ({ ...prev, attachmentUrl: result }));
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
      setParsingStep('AI Original Engine: Extracting...');
      const aiResults = await parseQuizFromText(text);
      if (aiResults.length === 0) {
        setParsingStep('Fallback pattern matching...');
        const fbResults = parserService.parseMCQs(text);
        if (fbResults.length === 0) throw new Error("No MCQs identified.");
        setParsedQuestions(fbResults);
        populateForm(fbResults);
      } else {
        setParsedQuestions(aiResults);
        populateForm(aiResults);
      }
    } catch (err: any) { setParseError(err.message || "Engine failure."); }
    finally { setIsParsing(false); setParsingStep(''); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const populateForm = (qs: Partial<Question>[]) => {
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
      <div className="flex bg-slate-950/50 border-b border-slate-800 overflow-x-auto">
        {['notifications', 'categories', 'quizzes', 'moderation', 'account'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-8 py-4 font-black text-[10px] uppercase tracking-widest border-b-2 transition-all ${activeTab === tab ? 'border-gold text-gold bg-slate-900' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
            {tab === 'notifications' ? 'News' : tab === 'quizzes' ? 'Assessments' : tab}
          </button>
        ))}
      </div>

      <div className="p-8 flex-grow">
        {activeTab === 'notifications' && (
          <div className="space-y-8">
            <form onSubmit={(e) => { 
              e.preventDefault(); 
              onAddNotification({ 
                id: Date.now().toString(), 
                date: new Date().toLocaleDateString(), 
                ...newsForm 
              }); 
              setNewsForm({ title: '', content: '', type: 'News', attachmentUrl: '' });
              if (newsAttachmentRef.current) newsAttachmentRef.current.value = '';
            }} className="bg-slate-800/30 p-6 rounded-xl border border-slate-700 space-y-4">
               <AdminInput value={newsForm.title} onChange={e => setNewsForm({...newsForm, title: e.target.value})} placeholder="Title" required />
               <AdminSelect value={newsForm.type} onChange={e => setNewsForm({...newsForm, type: e.target.value as any})}><option value="News">News</option><option value="Result">Result</option><option value="Test Date">Test Date</option></AdminSelect>
               <textarea value={newsForm.content} onChange={e => setNewsForm({...newsForm, content: e.target.value})} className="w-full p-3 bg-slate-800 text-white rounded text-sm border border-slate-700" rows={3} placeholder="Statement" required />
               
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Attachment (PDF or Image)</label>
                 <div className="flex items-center gap-3">
                   <button type="button" onClick={() => newsAttachmentRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">
                     <FileUp className="h-4 w-4" /> {newsForm.attachmentUrl ? 'Change File' : 'Upload File'}
                   </button>
                   <input type="file" ref={newsAttachmentRef} onChange={handleNewsAttachment} className="hidden" accept=".pdf,image/*" />
                   {newsForm.attachmentUrl && (
                     <span className="text-emerald-400 text-[9px] font-black uppercase flex items-center gap-1">
                       <CheckCircle2 className="h-3 w-3" /> Ready
                     </span>
                   )}
                 </div>
               </div>

               <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded font-black text-[10px] uppercase">Publish News</button>
            </form>
            <div className="divide-y divide-slate-800">
               {notifications.map(n => (
                 <div key={n.id} className="py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                       {n.attachmentUrl && (
                         <div className="p-2 bg-slate-800 rounded-lg text-gold-light">
                           {n.attachmentUrl.includes('application/pdf') ? <FileText className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
                         </div>
                       )}
                       <div>
                         <h5 className="text-white font-bold text-sm uppercase">{n.title}</h5>
                         <p className="text-[9px] text-slate-500 uppercase font-black">{n.date}</p>
                       </div>
                    </div>
                    <button onClick={() => onDeleteNotification(n.id)} className="text-slate-600 hover:text-red-500 p-2"><Trash2 className="h-4 w-4" /></button>
                 </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === 'quizzes' && (
          <div className="space-y-10">
            <div className="bg-slate-800/40 border-2 border-dashed border-slate-700 rounded-3xl p-10 text-center hover:border-blue-500 transition-all">
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.docx" />
              <UploadCloud className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-white font-black text-lg uppercase mb-2">Institutional Engine</h3>
              <p className="text-slate-500 text-[10px] font-black uppercase mb-6 tracking-widest">Original Extraction Logic</p>
              <button onClick={() => fileInputRef.current?.click()} disabled={isParsing} className="bg-blue-600 text-white px-12 py-3 rounded-xl font-black text-[10px] uppercase shadow-xl disabled:opacity-50">
                {isParsing ? <><Loader2 className="h-4 w-4 animate-spin mr-2 inline" />{parsingStep}</> : "Upload Document"}
              </button>
              {parseError && <div className="mt-6 text-red-500 font-black text-[10px] uppercase">{parseError}</div>}
              {parsedQuestions.length > 0 && <div className="mt-6 text-emerald-400 font-black text-[10px] uppercase">{parsedQuestions.length} Questions Ready</div>}
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!manualQuizForm.title) return alert("Title required.");
              const nQuiz: Quiz = {
                id: `q_${Date.now()}`,
                title: manualQuizForm.title,
                subCategoryId: manualQuizForm.subCategoryId,
                videoUrl: manualQuizForm.videoUrl,
                questions: manualQuizForm.questions.map((q, i) => ({ id: `qi_${i}_${Date.now()}`, ...q }))
              };
              onAddQuiz(nQuiz);
              alert("Assessment Deployed.");
              setManualQuizForm({ title: '', subCategoryId: categories[0]?.id || 'lat', videoUrl: '', questions: [{ text: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }] });
              setParsedQuestions([]);
            }} className="bg-slate-800/30 p-8 rounded-2xl border border-slate-700 space-y-8">
               <AdminInput value={manualQuizForm.title} onChange={e => setManualQuizForm({...manualQuizForm, title: e.target.value})} placeholder="Quiz Title" required />
               <AdminSelect value={manualQuizForm.subCategoryId} onChange={e => setManualQuizForm({...manualQuizForm, subCategoryId: e.target.value})}>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</AdminSelect>
               <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {manualQuizForm.questions.map((q, idx) => (
                    <div key={idx} className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-4 shadow-inner">
                        <AdminInput value={q.text} onChange={e => { const n = [...manualQuizForm.questions]; n[idx].text = e.target.value; setManualQuizForm({...manualQuizForm, questions: n}); }} placeholder={`Item ${idx+1}`} />
                        <div className="grid grid-cols-2 gap-4">
                           {q.options.map((o, oi) => (
                             <AdminInput key={oi} value={o} onChange={e => { const n = [...manualQuizForm.questions]; n[idx].options[oi] = e.target.value; setManualQuizForm({...manualQuizForm, questions: n}); }} placeholder={`Option ${oi+1}`} />
                           ))}
                        </div>
                    </div>
                  ))}
               </div>
               <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-xl font-black uppercase text-[10px] tracking-widest">Deploy Assessment</button>
            </form>
          </div>
        )}

        {activeTab === 'moderation' && (
          <div className="space-y-6">
            <h3 className="text-white font-black text-xs uppercase flex items-center gap-2 mb-6"><MessageSquare className="h-4 w-4 text-gold-light" /> Review Moderation</h3>
            <div className="grid grid-cols-1 gap-4">
               {feedbacks.length > 0 ? feedbacks.map(f => {
                 const isVis = f.isVisible === true || String(f.isVisible) === '1';
                 return (
                 <div key={f.id} className={`p-6 rounded-2xl border transition-all ${isVis ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-800/30 border-slate-700'} flex justify-between items-center`}>
                    <div className="flex-grow min-w-0">
                       <div className="flex items-center gap-2 mb-2"><span className="text-white font-black text-xs uppercase truncate">{f.studentName}</span><span className="px-2 py-0.5 rounded bg-slate-700 text-slate-400 text-[8px] font-black uppercase tracking-widest">{f.quizTitle}</span></div>
                       <p className="text-slate-400 text-[11px] italic">"{f.comment}"</p>
                    </div>
                    <div className="flex items-center gap-3">
                       <button onClick={() => toggleFeedback(f)} title={isVis ? "Hide" : "Approve"} className={`p-3 rounded-xl transition-all ${isVis ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-500 hover:text-white'}`}>{isVis ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
                       <button onClick={() => { if(confirm("Delete?")) dataService.deleteQuizFeedback(f.id).then(loadFeedbacks); }} className="p-3 bg-slate-700 text-rose-500 rounded-xl hover:bg-rose-600 hover:text-white"><Trash2 className="h-4 w-4" /></button>
                    </div>
                 </div>
               )}) : <div className="py-20 text-center text-slate-500 uppercase font-black text-[10px]">Registry Empty.</div>}
            </div>
          </div>
        )}

        {activeTab === 'account' && (
          <div className="text-center py-20 bg-slate-800/20 rounded-[40px] border border-slate-800">
             <Activity className="h-16 w-16 text-emerald-400 mx-auto mb-6" />
             <p className="text-slate-500 text-xs font-black uppercase mb-10">System: <span className="text-emerald-400">{dbStatus}</span></p>
             <button onClick={() => { setIsRepairing(true); dataService.repairDatabase().then(() => { setIsRepairing(false); window.location.reload(); }); }} disabled={isRepairing} className="bg-slate-700 text-white px-12 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-600 transition-all shadow-xl">
                {isRepairing ? "Synchronizing..." : "Sync Institutional Database"}
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
