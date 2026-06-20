import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Edit, Trash2, Folder, FolderOpen, X } from 'lucide-react';
import axios from '../../api/axios';
import { toast } from 'sonner';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get('/categories');
      setCategories(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch categories');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleNameChange = (val) => {
    setName(val);
    // Auto generate slug
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!name || !slug) {
      toast.error('Name and slug are required');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/categories', { name, slug });
      toast.success('Category created successfully!');
      setIsModalOpen(false);
      setName('');
      setSlug('');
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await axios.delete(`/categories/${id}`);
      toast.success('Category deleted successfully!');
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to delete category');
    }
  };

  const filteredCategories = categories.filter(cat => 
    (cat.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cat.slug || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-poppins font-black text-white tracking-tight">Categories & Genres</h1>
          <p className="text-slate-500 text-sm font-medium mt-0.5">Organize books into structured categories</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-primary-600/30"
        >
          <Plus size={18} />
          Create Category
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search categories..."
            className="w-full bg-[#0d1526] border border-white/[0.06] text-white text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all placeholder:text-slate-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((cat, i) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              key={cat._id}
              className="group bg-[#0d1526] border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.12] transition-colors flex flex-col justify-between h-full"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary-500/10 text-primary-400">
                    <FolderOpen size={24} />
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-400/10">
                    Active
                  </span>
                </div>
                
                <h3 className="text-white font-bold text-lg leading-tight mb-1">{cat.name}</h3>
                <p className="text-slate-500 text-xs font-mono mb-4">/{cat.slug}</p>
              </div>
              
              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-slate-500 text-xs">
                  ID: <span className="font-mono text-[10px]">{cat._id}</span>
                </span>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleDeleteCategory(cat._id)}
                    className="p-1.5 text-rose-400 hover:text-white hover:bg-rose-500/20 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full bg-[#0d1526] border border-white/[0.06] p-12 text-center text-slate-500 font-medium rounded-2xl">
            No categories registered. Click "Create Category" to get started!
          </div>
        )}
      </div>

      {/* Create Category Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#0d1526] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              <form onSubmit={handleCreateCategory}>
                <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
                  <h2 className="text-xl font-poppins font-bold text-white">Create Category</h2>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 space-y-5">
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Category Name</label>
                    <input 
                      type="text" 
                      required
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="e.g. Science Fiction" 
                      className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50" 
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">URL Slug</label>
                    <input 
                      type="text" 
                      required
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="e.g. science-fiction" 
                      className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50 font-mono" 
                    />
                  </div>
                </div>

                <div className="p-6 border-t border-white/10 flex items-center justify-end gap-3 bg-white/[0.02]">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-primary-600 hover:bg-primary-500 transition-colors shadow-lg shadow-primary-600/20 disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Save Category'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCategories;
