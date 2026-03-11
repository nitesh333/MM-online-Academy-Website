
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import AdSlot from '../components/ad-banner';
import { ArrowRight, ListChecks, Sparkles, ChevronRight, Clock, BookOpen, FileText, Download, Search } from 'lucide-react';
import { StudyNote } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const CategoryView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { categories, topics, quizzes, notes, ads, isLoading } = useData();
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleDownloadNote = (note: StudyNote) => {
    const link = document.createElement('a');
    link.href = note.url;
    link.download = `${note.title}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const category = categories.find(c => c.id === id);
  const isLLB = id?.startsWith('llb-');

  // Filtered topics
  const filteredTopics = useMemo(() => {
    const categoryTopics = topics.filter(t => t.categoryId === id);
    if (!searchQuery.trim()) return categoryTopics;
    const query = searchQuery.toLowerCase();
    return categoryTopics.filter(t => t.name.toLowerCase().includes(query));
  }, [topics, id, searchQuery]);

  // Filtered quizzes and notes
  const filteredQuizzes = useMemo(() => {
    const base = quizzes.filter(q => q.subCategoryId === id && (selectedTopicId === 'general' ? !q.topicId : q.topicId === selectedTopicId));
    if (!searchQuery.trim()) return base;
    const query = searchQuery.toLowerCase();
    return base.filter(q => q.title.toLowerCase().includes(query));
  }, [quizzes, id, selectedTopicId, searchQuery]);

  const filteredNotes = useMemo(() => {
    const base = notes.filter(n => n.subCategoryId === id && (selectedTopicId === 'general' ? !n.topicId : n.topicId === selectedTopicId));
    if (!searchQuery.trim()) return base;
    const query = searchQuery.toLowerCase();
    return base.filter(n => n.title.toLowerCase().includes(query));
  }, [notes, id, selectedTopicId, searchQuery]);

  // Auto-select general topic if no specific topics exist for the category
  useEffect(() => {
    if (id && !selectedTopicId) {
      const categoryTopics = topics.filter(t => t.categoryId === id);
      const hasGeneralItems = quizzes.some(q => q.subCategoryId === id && !q.topicId) || 
                              notes.some(n => n.subCategoryId === id && !n.topicId);
      
      if (categoryTopics.length === 0 && hasGeneralItems) {
        setSelectedTopicId('general');
      }
    }
  }, [id, selectedTopicId, topics, quizzes, notes]);

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-black text-pakgreen dark:text-white uppercase">Category Not Found</h2>
        <button onClick={() => navigate('/')} className="mt-4 text-gold font-black uppercase text-xs">Return Home</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 overflow-hidden">
       <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
          <button onClick={() => {
            if (selectedTopicId) {
              setSelectedTopicId(null);
              setSearchQuery('');
            }
            else navigate('/');
          }} className="text-xs font-black uppercase text-zinc-400 hover:text-pakgreen dark:hover:text-gold flex items-center gap-2 mb-8 group transition-colors">
            <ArrowRight className="h-4 w-4 rotate-180 group-hover:-translate-x-1 transition-transform" /> {selectedTopicId ? 'Back to Topics' : 'Return to Portal'}
          </button>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
             <div>
                <h2 className="text-5xl font-heading font-black text-pakgreen dark:text-white uppercase tracking-tight mb-3 leading-none">
                  {category.name}
                  {selectedTopicId && <span className="text-gold glow-text-gold ml-4">/ {selectedTopicId === 'general' ? 'General Material' : topics.find(t => t.id === selectedTopicId)?.name}</span>}
                </h2>
                <p className="text-gold-light font-black uppercase text-[12px] tracking-[0.4em] opacity-80">{category.description}</p>
             </div>
             {isLLB && !selectedTopicId && (
               <div className="flex flex-wrap gap-2 p-2 bg-zinc-100 dark:bg-pakgreen-dark/50 rounded-2xl border border-gold/10 backdrop-blur-md">
                  {['llb-s1', 'llb-s2', 'llb-s3', 'llb-s4'].map(sid => (
                    <button 
                      key={sid}
                      onClick={() => navigate(`/category/${sid}`)}
                      className={`px-8 py-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${id === sid ? 'bg-pakgreen dark:bg-gold text-white dark:text-pakgreen shadow-xl scale-105' : 'text-zinc-500 hover:bg-white/10'}`}
                    >
                      Sem {sid.split('-s')[1]}
                    </button>
                  ))}
               </div>
             )}
          </div>
       </motion.div>

       {/* Search Bar for Category View */}
       <div className="mb-12">
          <div className="relative max-w-md group">
            <div className="absolute -inset-1 bg-gradient-to-r from-gold/30 to-pakgreen/30 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative flex items-center bg-white dark:bg-pakgreen-dark/60 backdrop-blur-xl border border-gold/10 rounded-2xl overflow-hidden">
              <div className="pl-6 text-gold">
                <Search className="h-4 w-4" />
              </div>
              <input 
                type="text"
                placeholder={selectedTopicId ? "SEARCH IN THIS TOPIC..." : "SEARCH SUBJECTS..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-5 py-4 bg-transparent text-[10px] font-black uppercase tracking-widest text-pakgreen dark:text-white placeholder:text-zinc-400 focus:outline-none"
              />
            </div>
          </div>
       </div>

       <AnimatePresence mode="wait">
         {!selectedTopicId ? (
           <motion.div 
             key="topics"
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: -20 }}
             className="space-y-16"
           >
             <div className="flex items-center gap-6 mb-12">
               <div className="bg-gold-light p-4 rounded-[24px] shadow-[0_10px_30px_rgba(212,175,55,0.3)] animate-float">
                 <ListChecks className="h-10 w-10 text-pakgreen" />
               </div>
               <h3 className="text-4xl font-heading font-black text-pakgreen dark:text-white uppercase tracking-tight">Select your test for preparation</h3>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {filteredTopics.length > 0 ? filteredTopics.map((topic, idx) => (
                  <motion.div 
                    key={topic.id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => {
                      setSelectedTopicId(topic.id);
                      setSearchQuery('');
                    }}
                    className="group p-12 bg-white dark:bg-pakgreen-dark/30 backdrop-blur-xl border border-gold/10 rounded-[50px] hover:border-gold-light transition-all cursor-pointer shadow-2xl relative overflow-hidden hover:-translate-y-3"
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                       <Sparkles className="h-24 w-24 text-gold" />
                    </div>
                    <div className="bg-pakgreen/5 dark:bg-gold/5 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-gold-light group-hover:text-pakgreen transition-all shadow-inner border border-gold/10">
                      <Sparkles className="h-8 w-8" />
                    </div>
                    <h4 className="font-heading font-black text-pakgreen dark:text-gold text-3xl uppercase mb-4 tracking-normal leading-none">{topic.name}</h4>
                    <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest">Explore Assessments & Notes</p>
                    <ChevronRight className="h-6 w-6 text-gold-light absolute bottom-10 right-10 opacity-20 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                  </motion.div>
                )) : isLoading ? (
                  [1, 2, 3].map(i => (
                    <div key={i} className="group p-12 bg-white dark:bg-pakgreen-dark/30 backdrop-blur-xl border border-gold/10 rounded-[50px] shadow-2xl animate-pulse">
                      <div className="bg-zinc-200 dark:bg-white/5 w-16 h-16 rounded-2xl mb-8" />
                      <div className="h-8 w-full bg-zinc-200 dark:bg-white/10 rounded-lg mb-4" />
                      <div className="h-4 w-3/4 bg-zinc-200 dark:bg-white/10 rounded-lg" />
                    </div>
                  ))
                ) : searchQuery ? (
                  <div className="col-span-full py-20 text-center border-2 border-dashed border-gold/10 rounded-[40px]">
                    <p className="text-zinc-400 font-black uppercase tracking-[0.4em] text-[11px]">No matching subjects found.</p>
                  </div>
                ) : null}
                
                {/* General Material if items exist without topic and no search query or matches search */}
                {(!searchQuery || 'general material'.includes(searchQuery.toLowerCase())) && 
                 (quizzes.some(q => q.subCategoryId === id && !q.topicId) || 
                  notes.some(n => n.subCategoryId === id && !n.topicId)) && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: filteredTopics.length * 0.05 }}
                    onClick={() => {
                      setSelectedTopicId('general');
                      setSearchQuery('');
                    }}
                    className="group p-12 bg-zinc-100 dark:bg-pakgreen-dark/20 backdrop-blur-xl border border-dashed border-zinc-300 dark:border-white/10 rounded-[50px] hover:border-gold-light transition-all cursor-pointer shadow-2xl relative overflow-hidden hover:-translate-y-3"
                  >
                    <div className="bg-zinc-200 dark:bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-gold-light group-hover:text-pakgreen transition-all shadow-inner border border-gold/10">
                      <ListChecks className="h-8 w-8" />
                    </div>
                    <h4 className="font-heading font-black text-pakgreen dark:text-gold text-3xl uppercase mb-4 tracking-normal leading-none">
                      {id === 'ielts' ? 'IELTS Resources' : 'General Material'}
                    </h4>
                    <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest">Core Preparation Resources</p>
                    <ChevronRight className="h-6 w-6 text-gold-light absolute bottom-10 right-10 opacity-20 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                  </motion.div>
                )}
              </div>
             
              {topics.filter(t => t.categoryId === id).length === 0 && 
               !quizzes.some(q => q.subCategoryId === id) && 
               !notes.some(n => n.subCategoryId === id) && !isLoading && (
                <div className="text-center py-32 bg-white dark:bg-pakgreen-dark/20 rounded-[60px] border border-dashed border-zinc-300 dark:border-white/10">
                  <Clock className="h-16 w-16 text-zinc-300 mx-auto mb-6 animate-pulse" />
                  <p className="text-zinc-400 font-black uppercase text-sm tracking-[0.4em]">Preparation track under population.</p>
                </div>
              )}
           </motion.div>
         ) : (
           <motion.div 
             key="content"
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: 20 }}
             className="grid grid-cols-1 lg:grid-cols-12 gap-16"
           >
                <div className="lg:col-span-8 space-y-20">
                   {filteredQuizzes.length > 0 && (
                     <section>
                        <h3 className="text-4xl font-heading font-black text-pakgreen dark:text-white uppercase mb-12 flex items-center gap-6"><ListChecks className="h-12 w-12 text-gold" /> Assessment Portions</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                          {filteredQuizzes
                            .sort((a, b) => (Number(a.orderNumber) || 0) - (Number(b.orderNumber) || 0))
                            .map((q, idx) => (
                              <motion.div 
                                key={q.id} 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => navigate(`/quiz/${q.id}`)} 
                                className="bg-white dark:bg-pakgreen-dark/40 p-10 rounded-[40px] flex justify-between items-center hover:border-gold border border-transparent dark:border-white/5 transition-all cursor-pointer shadow-2xl group hover:-translate-y-1"
                              >
                                 <div className="flex items-center gap-8">
                                    <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center text-lg font-black text-gold group-hover:bg-gold group-hover:text-pakgreen transition-all shadow-inner border border-gold/20">
                                      {q.orderNumber || 0}
                                    </div>
                                    <div className="flex flex-col">
                                       <h4 className="font-heading font-black text-xl uppercase text-zinc-800 dark:text-zinc-100 group-hover:text-gold transition-colors leading-none mb-2">{q.title}</h4>
                                       <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{q.questions?.length || 0} Questions</span>
                                    </div>
                                 </div>
                                 <ArrowRight className="h-6 w-6 text-gold opacity-30 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                              </motion.div>
                            ))
                          }
                        </div>
                     </section>
                   )}

                   {filteredNotes.length > 0 && (
                     <section className="mt-24">
                        <h3 className="text-4xl font-heading font-black text-pakgreen dark:text-white uppercase mb-12 flex items-center gap-6"><BookOpen className="h-12 w-12 text-gold" /> Study Materials</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                          {filteredNotes
                            .map((note, idx) => (
                              <motion.div 
                                key={note.id} 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-white dark:bg-pakgreen-dark/40 p-12 rounded-[60px] border border-gold/10 shadow-2xl flex flex-col gap-10 group hover:border-gold transition-all"
                              >
                                 <div className="flex items-center gap-8">
                                   <div className="bg-rose-500/10 p-6 rounded-[24px] text-rose-500 shadow-inner border border-rose-500/20"><FileText className="h-10 w-10" /></div>
                                   <div className="flex flex-col">
                                      <h4 className="text-2xl font-heading font-black text-pakgreen dark:text-white uppercase tracking-normal leading-none mb-2">{note.title}</h4>
                                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Official Academy PDF</span>
                                   </div>
                                 </div>
                                 <button 
                                   onClick={() => handleDownloadNote(note)}
                                   className="group relative w-full flex items-center justify-center gap-4 py-6 bg-pakgreen dark:bg-gold text-white dark:text-pakgreen rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] shadow-2xl transition-all hover:scale-[1.02] active:scale-95 overflow-hidden"
                                 >
                                   <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
                                   <Download className="h-6 w-6 relative z-10" /> <span className="relative z-10">Download Resource</span>
                                 </button>
                              </motion.div>
                            ))
                          }
                        </div>
                     </section>
                   )}

                   {searchQuery && filteredQuizzes.length === 0 && filteredNotes.length === 0 && (
                     <div className="text-center py-20 border-2 border-dashed border-gold/10 rounded-[40px]">
                        <p className="text-zinc-400 font-black uppercase tracking-[0.4em] text-[11px]">No matching assessments or notes found.</p>
                     </div>
                   )}
                </div>
              <aside className="lg:col-span-4"><AdSlot placement="sidebar" privateAds={ads} /></aside>
           </motion.div>
         )}
       </AnimatePresence>
    </div>
  );
};

export default CategoryView;
