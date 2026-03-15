
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
    <div className="min-h-screen bg-white dark:bg-pakgreen-deepest pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* 1. Category Title & Intro */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button onClick={() => navigate('/subjects')} className="text-xs font-black uppercase text-zinc-400 hover:text-gold flex items-center gap-2 mb-8 mx-auto transition-colors">
              <ArrowRight className="h-4 w-4 rotate-180" /> Back to Subjects
            </button>
            <h1 className="text-5xl md:text-7xl font-heading font-black text-pakgreen dark:text-white uppercase tracking-tight mb-8">{category.name}</h1>
            <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed font-medium">
              Welcome to the {category.name} section. Here you will find specialized study materials, practice assessments, and expert guidance tailored specifically for mastering this subject area.
            </p>
          </motion.div>
        </div>

        {/* 2. Grid of Sub-categories/Topics */}
        <section className="mb-24">
          <div className="flex items-center gap-4 mb-12">
            <div className="h-1 w-12 bg-gold" />
            <h2 className="text-3xl font-heading font-black text-pakgreen dark:text-white uppercase tracking-tight">Sub-Categories & Topics</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filteredTopics.length > 0 ? filteredTopics.map((topic, idx) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setSelectedTopicId(topic.id)}
                className="p-10 bg-white dark:bg-pakgreen-dark/30 border border-gold/10 rounded-[40px] hover:border-gold transition-all cursor-pointer group shadow-xl"
              >
                <h3 className="text-2xl font-heading font-black text-pakgreen dark:text-white uppercase mb-4 group-hover:text-gold transition-colors">{topic.name}</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-8">
                  Explore specialized resources and assessments for {topic.name}.
                </p>
                <div className="flex items-center gap-2 text-gold font-black text-[10px] uppercase tracking-widest">
                  View Topic <ChevronRight className="h-4 w-4" />
                </div>
              </motion.div>
            )) : (
              <div className="col-span-full py-12 text-center border-2 border-dashed border-gold/10 rounded-[40px]">
                <p className="text-zinc-400 font-black uppercase tracking-[0.4em] text-[10px]">No sub-categories available yet.</p>
              </div>
            )}
          </div>
        </section>

        {/* 3. Featured Articles/Quizzes */}
        <section className="mb-24">
          <div className="flex items-center gap-4 mb-12">
            <div className="h-1 w-12 bg-gold" />
            <h2 className="text-3xl font-heading font-black text-pakgreen dark:text-white uppercase tracking-tight">Featured Assessments</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredQuizzes.slice(0, 4).map((q, idx) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => navigate(`/quiz/${q.id}`)}
                className="p-8 bg-zinc-50 dark:bg-pakgreen-dark/20 border border-gold/5 rounded-3xl hover:border-gold transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-pakgreen transition-all">
                    <ListChecks className="h-6 w-6" />
                  </div>
                  <h4 className="text-lg font-heading font-black text-pakgreen dark:text-white uppercase group-hover:text-gold transition-colors">{q.title}</h4>
                </div>
                <ArrowRight className="h-5 w-5 text-gold opacity-0 group-hover:opacity-100 transition-all" />
              </motion.div>
            ))}
          </div>
        </section>

        {/* 4. Category-Specific Study Resources */}
        <section className="mb-24">
          <div className="flex items-center gap-4 mb-12">
            <div className="h-1 w-12 bg-gold" />
            <h2 className="text-3xl font-heading font-black text-pakgreen dark:text-white uppercase tracking-tight">Study Resources</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filteredNotes.slice(0, 3).map((note, idx) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-8 bg-white dark:bg-pakgreen-dark/40 border border-gold/10 rounded-[40px] shadow-xl text-center group"
              >
                <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-rose-500">
                  <FileText className="h-8 w-8" />
                </div>
                <h4 className="text-xl font-heading font-black text-pakgreen dark:text-white uppercase mb-4">{note.title}</h4>
                <button onClick={() => handleDownloadNote(note)} className="text-[10px] font-black text-gold uppercase tracking-widest flex items-center gap-2 mx-auto hover:underline">
                  <Download className="h-4 w-4" /> Download PDF
                </button>
              </motion.div>
            ))}
            {filteredNotes.length === 0 && (
              <div className="col-span-full py-12 text-center border-2 border-dashed border-gold/10 rounded-[40px]">
                <p className="text-zinc-400 font-black uppercase tracking-[0.4em] text-[10px]">Resources for this category are being updated.</p>
              </div>
            )}
          </div>
        </section>

        {/* 5. Related Categories */}
        <section className="pt-12 border-t border-gold/10">
          <h3 className="text-sm font-black text-gold uppercase tracking-widest mb-8">Related Categories</h3>
          <div className="flex flex-wrap gap-4">
            {categories.filter(c => c.id !== id).slice(0, 5).map(cat => (
              <Link key={cat.id} to={`/category/${cat.id}`} className="px-6 py-3 bg-zinc-100 dark:bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-gold transition-colors">
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default CategoryView;
