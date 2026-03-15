import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Download, FileCheck, Layers, FileText } from 'lucide-react';
import { useData } from '../context/DataContext';

const ResourcesView: React.FC = () => {
  const { notes, categories } = useData();

  const groupedNotes = useMemo(() => {
    // Group notes by category for a better layout
    const groups: { [key: string]: typeof notes } = {};
    notes.forEach(note => {
      const catName = categories.find(c => c.id === note.subCategoryId)?.name || 'General Resources';
      if (!groups[catName]) groups[catName] = [];
      groups[catName].push(note);
    });
    return groups;
  }, [notes, categories]);

  return (
    <div className="min-h-screen bg-white dark:bg-pakgreen-deepest pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-gold font-black uppercase text-[12px] tracking-[0.5em] mb-4 block">Educational Assets</span>
            <h1 className="text-5xl md:text-7xl font-heading font-black text-pakgreen dark:text-white uppercase tracking-tight mb-8">Study Resources</h1>
            <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed font-medium">
              Access our curated library of educational resources, including downloadable PDF notes, interactive practice modules, and comprehensive reference materials.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          {notes.map((res, idx) => (
            <motion.div
              key={res.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="p-10 bg-white dark:bg-pakgreen-dark/30 border border-gold/10 rounded-[40px] shadow-2xl group hover:border-gold transition-all"
            >
              <div className="w-16 h-16 bg-gold/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-gold group-hover:text-pakgreen transition-all">
                <FileText className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-heading font-black text-pakgreen dark:text-white uppercase mb-4">{res.title}</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6">
                {categories.find(c => c.id === res.subCategoryId)?.name || 'General Material'} • {res.type} Resource
              </p>
              
              {/* SEO Tags */}
              <div className="flex flex-wrap gap-2 mb-8">
                {(res.seoTags || 'Study, Notes, Education').split(',').map(tag => (
                  <span key={tag} className="px-3 py-1 bg-zinc-100 dark:bg-white/5 rounded-full text-[8px] font-black text-zinc-400 uppercase tracking-widest">
                    {tag.trim()}
                  </span>
                ))}
              </div>

              <a 
                href={res.url} 
                download={`${res.title.replace(/\s+/g, '_')}.pdf`}
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full px-8 py-4 bg-pakgreen dark:bg-gold text-white dark:text-pakgreen rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" /> Download Resource
              </a>
            </motion.div>
          ))}
          {notes.length === 0 && (
            <div className="col-span-full text-center py-20 bg-gold/5 rounded-[40px] border border-gold/10">
              <p className="text-zinc-500 font-black uppercase text-xs tracking-widest">No resources available in the library yet.</p>
            </div>
          )}
        </div>

        {/* Grouped Resources Section */}
        {Object.keys(groupedNotes).length > 0 && (
          <section className="pt-24 border-t border-gold/10">
            <h3 className="text-3xl font-heading font-black text-pakgreen dark:text-white uppercase tracking-tight mb-12">Resources by Category</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(groupedNotes).map(([catName, catNotes]) => (
                <div key={catName} className="p-6 bg-zinc-50 dark:bg-pakgreen-dark/20 rounded-3xl border border-gold/10">
                  <h4 className="text-sm font-heading font-black text-pakgreen dark:text-white uppercase mb-4 text-gold">
                    {catName}
                  </h4>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{catNotes.length} Resources Available</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ResourcesView;
