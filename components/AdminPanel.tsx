import React, { useState, useEffect } from 'react';
import { Trash2, Loader2, Database, Activity, RefreshCw } from 'lucide-react';
import { Notification, SubCategory, Quiz } from '../types';
import { dataService } from '../services/dataService';

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

  const handleManualQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newQuiz: Quiz = {
      id: `q_${Date.now()}`,
      title: manualQuizForm.title,
      subCategoryId: manualQuizForm.subCategoryId,
      videoUrl: manualQuizForm.videoUrl,
      questions: manualQuizForm.questions.map((q, idx) => ({ id: `q_${idx}_${Date.now()}`, ...q }))
    };
    onAddQuiz(newQuiz);
    alert(`Quiz Deployed to ${manualQuizForm.subCategoryId.toUpperCase()} Track.`);
    setManualQuizForm({
      title: '',
      subCategoryId: categories[0]?.id || 'lat',
      videoUrl: '',
      questions: [{ text: '', options: ['', '', '', ''], correctAnswer: 0 }]
    });
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
          <div className="space-y-8">
            <form onSubmit={handleManualQuizSubmit} className="bg-slate-800/30 p-8 rounded-2xl border border-slate-700 space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AdminInput value={manualQuizForm.title} onChange={e => setManualQuizForm({...manualQuizForm, title: e.target.value})} placeholder="Assessment Title" required />
                  <AdminSelect value={manualQuizForm.subCategoryId} onChange={e => setManualQuizForm({...manualQuizForm, subCategoryId: e.target.value})}>
                     {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </AdminSelect>
               </div>
               {manualQuizForm.questions.map((q, idx) => (
                 <div key={idx} className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-4 shadow-inner">
                    <AdminInput value={q.text} onChange={e => {
                      const nq = [...manualQuizForm.questions];
                      nq[idx].text = e.target.value;
                      setManualQuizForm({...manualQuizForm, questions: nq});
                    }} placeholder={`Question Statement ${idx + 1}`} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       {q.options.map((o, oidx) => (
                         <AdminInput key={oidx} value={o} onChange={e => {
                           const nq = [...manualQuizForm.questions];
                           nq[idx].options[oidx] = e.target.value;
                           setManualQuizForm({...manualQuizForm, questions: nq});
                         }} placeholder={`Option ${String.fromCharCode(65+oidx)}`} />
                       ))}
                    </div>
                 </div>
               ))}
               <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl">Deploy Assessment</button>
            </form>
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