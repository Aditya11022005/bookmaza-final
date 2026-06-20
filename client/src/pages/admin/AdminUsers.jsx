import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Shield, Ban, CheckCircle2, X, Loader } from 'lucide-react';
import axios from '../../api/axios';
import { toast } from 'sonner';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get('/users');
      setUsers(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      return toast.error('Please fill in all fields');
    }
    setSubmitting(true);
    try {
      await axios.post('/users', form);
      toast.success('User registered successfully');
      setIsModalOpen(false);
      setForm({ name: '', email: '', password: '' });
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-poppins font-black text-white tracking-tight">Users Management</h1>
          <p className="text-slate-500 text-sm font-medium mt-0.5">Manage all registered users and their roles</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-primary-600/30"
        >
          <Plus size={18} />
          Add New User
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search users by name or email..."
            className="w-full bg-[#0d1526] border border-white/[0.06] text-white text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all placeholder:text-slate-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select 
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-[#0d1526] border border-white/[0.06] text-slate-300 text-sm font-medium rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="author">Author</option>
            <option value="customer">Customer</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader className="animate-spin text-primary-600" size={32} />
          <span className="text-slate-500 font-bold text-sm uppercase tracking-wider">Loading user directory...</span>
        </div>
      ) : (
        <div className="bg-[#0d1526] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  <th className="px-5 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">User</th>
                  <th className="px-5 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">ID</th>
                  <th className="px-5 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Role</th>
                  <th className="px-5 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, i) => (
                    <motion.tr
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      key={user._id}
                      className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-lg">
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-bold text-sm">{user.name}</p>
                            <p className="text-slate-500 text-xs font-medium">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-400 font-mono text-xs">{user._id}</td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border
                          ${user.role === 'admin' ? 'text-purple-400 bg-purple-400/10 border-purple-400/20' : 
                            user.role === 'author' ? 'text-sky-400 bg-sky-400/10 border-sky-400/20' : 
                            'text-slate-400 bg-white/5 border-white/10'}`}>
                          {user.role === 'admin' ? <Shield size={10} /> : null}
                          {user.role || 'customer'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-500 text-xs font-medium whitespace-nowrap">
                        {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-5 py-12 text-center text-slate-500 font-medium">
                      No registered users match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
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
                <h2 className="text-xl font-poppins font-bold text-white">Add New User</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateUser}>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. John Doe" 
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
                      placeholder="e.g. john@example.com" 
                      className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50" 
                    />
                  </div>
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
                    {submitting ? 'Creating...' : 'Create User'}
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

export default AdminUsers;
