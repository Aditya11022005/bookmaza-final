import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, BookOpen, Award, X, Loader, Edit3, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import axios from '../../api/axios';
import { toast } from 'sonner';

const AdminAuthors = () => {
  const [authors, setAuthors] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(null);
  
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '',
    royaltyPercentage: 25,
    royaltyPercentages: {
      ebook: 25,
      audiobook: 25,
      hardcopy: 25
    },
    isAuthorApproved: false
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [usersRes, booksRes] = await Promise.all([
        axios.get('/users'),
        axios.get('/books?all=true')
      ]);
      // Filter for users with role === 'author'
      const authorList = usersRes.data.filter(u => u.role === 'author');
      setAuthors(authorList);
      setBooks(booksRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load author records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleApproval = async (author) => {
    try {
      const updatedStatus = !author.isAuthorApproved;
      await axios.put(`/users/${author._id}`, { 
        isAuthorApproved: updatedStatus 
      });
      toast.success(updatedStatus ? 'Author account approved!' : 'Author account suspended!');
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update author approval');
    }
  };

  const handleEditAuthor = (author) => {
    setEditingAuthor(author);
    setForm({
      name: author.name || '',
      email: author.email || '',
      password: '', // Keep blank during edit
      royaltyPercentage: author.royaltyPercentage !== undefined ? author.royaltyPercentage : 25,
      royaltyPercentages: {
        ebook: (author.royaltyPercentages && author.royaltyPercentages.ebook !== undefined) ? author.royaltyPercentages.ebook : (author.royaltyPercentage !== undefined ? author.royaltyPercentage : 25),
        audiobook: (author.royaltyPercentages && author.royaltyPercentages.audiobook !== undefined) ? author.royaltyPercentages.audiobook : (author.royaltyPercentage !== undefined ? author.royaltyPercentage : 25),
        hardcopy: (author.royaltyPercentages && author.royaltyPercentages.hardcopy !== undefined) ? author.royaltyPercentages.hardcopy : (author.royaltyPercentage !== undefined ? author.royaltyPercentage : 25)
      },
      isAuthorApproved: author.isAuthorApproved || false
    });
    setIsModalOpen(true);
  };

  const handleOpenCreateModal = () => {
    setEditingAuthor(null);
    setForm({
      name: '',
      email: '',
      password: '',
      royaltyPercentage: 25,
      royaltyPercentages: {
        ebook: 25,
        audiobook: 25,
        hardcopy: 25
      },
      isAuthorApproved: true // default approved when admin manually adds
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      return toast.error('Name and email are required');
    }
    setSubmitting(true);
    try {
      if (editingAuthor) {
        // Edit Author details
        const updateData = {
          name: form.name,
          email: form.email,
          royaltyPercentage: form.royaltyPercentage,
          royaltyPercentages: form.royaltyPercentages,
          isAuthorApproved: form.isAuthorApproved
        };
        await axios.put(`/users/${editingAuthor._id}`, updateData);
        toast.success('Author profile updated successfully');
      } else {
        // Create Author
        if (!form.password) {
          setSubmitting(false);
          return toast.error('Password is required for new accounts');
        }
        await axios.post('/users', { 
          name: form.name,
          email: form.email,
          password: form.password,
          role: 'author',
          isAuthorApproved: form.isAuthorApproved,
          royaltyPercentage: form.royaltyPercentage,
          royaltyPercentages: form.royaltyPercentages
        });
        toast.success('Author profile registered successfully');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save author details');
    } finally {
      setSubmitting(false);
    }
  };

  const getAuthorBooksCount = (authorId) => {
    return books.filter(b => b.author === authorId || b.author?._id === authorId).length;
  };

  const filteredAuthors = authors.filter(auth =>
    (auth.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (auth.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-poppins font-black text-white tracking-tight">Authors Management</h1>
          <p className="text-slate-500 text-sm font-medium mt-0.5">Manage author approval, custom royalty rates, and credentials</p>
        </div>
        <button 
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-primary-600/30"
        >
          <Plus size={18} />
          Add Author
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search authors by name or email..."
            className="w-full bg-[#0d1526] border border-white/[0.06] text-white text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all placeholder:text-slate-600"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader className="animate-spin text-primary-600" size={32} />
          <span className="text-slate-500 font-bold text-sm uppercase tracking-wider">Loading author directory...</span>
        </div>
      ) : (
        <div className="bg-[#0d1526] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  <th className="px-5 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Author</th>
                  <th className="px-5 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Books Published</th>
                  <th className="px-5 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Royalty split</th>
                  <th className="px-5 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Approval Status</th>
                  <th className="px-5 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Joined Date</th>
                  <th className="px-5 py-4 text-right text-[11px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAuthors.length > 0 ? (
                  filteredAuthors.map((author, i) => {
                    const booksCount = getAuthorBooksCount(author._id);
                    return (
                      <motion.tr
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={author._id}
                        className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors group"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white font-bold text-sm shadow">
                              {author.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-white font-bold text-sm whitespace-nowrap">{author.name}</p>
                              <p className="text-slate-500 text-xs font-medium">{author.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-slate-300 font-bold text-sm">
                            <BookOpen size={16} className="text-primary-400" />
                            {booksCount} Books
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1 text-[11px] font-bold">
                            <span className="text-blue-400">eBook: {author.royaltyPercentages?.ebook !== undefined ? author.royaltyPercentages.ebook : (author.royaltyPercentage ?? 25)}%</span>
                            <span className="text-purple-400">Audio: {author.royaltyPercentages?.audiobook !== undefined ? author.royaltyPercentages.audiobook : (author.royaltyPercentage ?? 25)}%</span>
                            <span className="text-amber-400">Print: {author.royaltyPercentages?.hardcopy !== undefined ? author.royaltyPercentages.hardcopy : (author.royaltyPercentage ?? 25)}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {author.isAuthorApproved ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-400/10">
                                <CheckCircle2 size={11} /> Approved
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10">
                                <AlertTriangle size={11} /> Pending
                              </span>
                            )}
                            <button
                              onClick={() => handleToggleApproval(author)}
                              className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg border transition-colors
                                ${author.isAuthorApproved 
                                  ? 'text-rose-400 border-rose-500/30 hover:bg-rose-500/10' 
                                  : 'text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10'}`}
                            >
                              {author.isAuthorApproved ? 'Suspend' : 'Approve'}
                            </button>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-500 text-xs font-medium whitespace-nowrap">
                          {new Date(author.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button 
                            onClick={() => handleEditAuthor(author)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-bold"
                          >
                            <Edit3 size={14} /> Edit
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="px-5 py-12 text-center text-slate-500 font-medium">
                      No authors registered in the database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Author Modal */}
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
              className="relative w-full max-w-lg bg-[#0d1526] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
                <h2 className="text-xl font-poppins font-bold text-white">
                  {editingAuthor ? 'Edit Author Profile' : 'Add New Author'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. James Clear" 
                      className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50" 
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="e.g. james@example.com" 
                      className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50" 
                    />
                  </div>
                  {!editingAuthor && (
                    <div>
                      <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Password</label>
                      <input 
                        type="password" 
                        required
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder="••••••••" 
                        className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50" 
                      />
                    </div>
                  )}
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">eBook Royalty (%)</label>
                      <input 
                        type="number" 
                        required
                        min="0"
                        max="100"
                        value={form.royaltyPercentages?.ebook}
                        onChange={(e) => setForm({ 
                          ...form, 
                          royaltyPercentages: { ...form.royaltyPercentages, ebook: Number(e.target.value) } 
                        })}
                        placeholder="25" 
                        className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50" 
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Audiobook (%)</label>
                      <input 
                        type="number" 
                        required
                        min="0"
                        max="100"
                        value={form.royaltyPercentages?.audiobook}
                        onChange={(e) => setForm({ 
                          ...form, 
                          royaltyPercentages: { ...form.royaltyPercentages, audiobook: Number(e.target.value) } 
                        })}
                        placeholder="25" 
                        className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50" 
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Hardcopy (%)</label>
                      <input 
                        type="number" 
                        required
                        min="0"
                        max="100"
                        value={form.royaltyPercentages?.hardcopy}
                        onChange={(e) => setForm({ 
                          ...form, 
                          royaltyPercentages: { ...form.royaltyPercentages, hardcopy: Number(e.target.value) } 
                        })}
                        placeholder="25" 
                        className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">General/Fallback (%)</label>
                      <input 
                        type="number" 
                        required
                        min="0"
                        max="100"
                        value={form.royaltyPercentage}
                        onChange={(e) => setForm({ ...form, royaltyPercentage: Number(e.target.value) })}
                        placeholder="25" 
                        className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50" 
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Approval Status</label>
                      <select 
                        value={form.isAuthorApproved}
                        onChange={(e) => setForm({ ...form, isAuthorApproved: e.target.value === 'true' })}
                        className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50"
                      >
                        <option value="true">Approved</option>
                        <option value="false">Pending / Suspended</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-white/10 flex items-center justify-end gap-3 bg-white/[0.02]">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-primary-600 hover:bg-primary-500 transition-colors shadow-lg shadow-primary-600/20 disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : 'Save Details'}
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

export default AdminAuthors;
