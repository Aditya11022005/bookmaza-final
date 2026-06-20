import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Ticket, Edit, Trash2, Copy, Check, X, Loader } from 'lucide-react';
import axios from '../../api/axios';
import { toast } from 'sonner';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [form, setForm] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: 0,
    minPurchaseAmount: 0,
    usageLimit: 100,
    expiryDate: '',
    isActive: true
  });

  const [submitting, setSubmitting] = useState(false);

  const fetchCoupons = async () => {
    try {
      const { data } = await axios.get('/coupons');
      setCoupons(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCopy = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success('Code copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setForm({
      code: coupon.code,
      discountType: coupon.discountType || 'percentage',
      discountValue: coupon.discountValue || 0,
      minPurchaseAmount: coupon.minPurchaseAmount || 0,
      usageLimit: coupon.usageLimit || 100,
      expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : '',
      isActive: coupon.isActive !== undefined ? coupon.isActive : true
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await axios.delete(`/coupons/${id}`);
      toast.success('Coupon deleted successfully');
      fetchCoupons();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to delete coupon');
    }
  };

  const handleOpenCreateModal = () => {
    setEditingCoupon(null);
    setForm({
      code: '',
      discountType: 'percentage',
      discountValue: 0,
      minPurchaseAmount: 0,
      usageLimit: 100,
      expiryDate: '',
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code) return toast.error('Coupon code is required');
    setSubmitting(true);
    try {
      if (editingCoupon) {
        await axios.put(`/coupons/${editingCoupon._id}`, form);
        toast.success('Coupon updated successfully');
      } else {
        await axios.post('/coupons', form);
        toast.success('Coupon created successfully');
      }
      setIsModalOpen(false);
      fetchCoupons();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save coupon');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCoupons = coupons.filter(c =>
    (c.code || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-poppins font-black text-white tracking-tight">Coupons & Discounts</h1>
          <p className="text-slate-500 text-sm font-medium mt-0.5">Manage promotional codes and special offers</p>
        </div>
        <button 
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-primary-600/30"
        >
          <Plus size={18} />
          Create Coupon
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search coupons by code..."
            className="w-full bg-[#0d1526] border border-white/[0.06] text-white text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all placeholder:text-slate-600"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader className="animate-spin text-primary-600" size={32} />
          <span className="text-slate-500 font-bold text-sm uppercase tracking-wider">Loading coupons...</span>
        </div>
      ) : (
        <div className="bg-[#0d1526] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  <th className="px-5 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Code</th>
                  <th className="px-5 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Discount</th>
                  <th className="px-5 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Usage Status</th>
                  <th className="px-5 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Status</th>
                  <th className="px-5 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Expiry</th>
                  <th className="px-5 py-4 text-right text-[11px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoupons.length > 0 ? (
                  filteredCoupons.map((coupon, i) => (
                    <motion.tr
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      key={coupon._id}
                      className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-500/10 border border-primary-500/20 text-primary-400 font-mono font-bold rounded-lg text-sm">
                            <Ticket size={14} />
                            {coupon.code}
                          </span>
                          <button 
                            onClick={() => handleCopy(coupon.code, coupon._id)}
                            className="p-1.5 text-slate-400 hover:text-white transition-colors"
                            title="Copy Code"
                          >
                            {copiedId === coupon._id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-white font-bold text-sm whitespace-nowrap">
                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                      </td>
                      <td className="px-5 py-4">
                        <div className="w-full max-w-[120px]">
                          <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                            <span>{coupon.usedCount || 0}</span>
                            <span>{coupon.usageLimit || '∞'}</span>
                          </div>
                          {coupon.usageLimit && (
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${coupon.usedCount >= coupon.usageLimit ? 'bg-rose-500' : 'bg-primary-500'}`} 
                                style={{ width: `${Math.min(((coupon.usedCount || 0) / coupon.usageLimit) * 100, 100)}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest
                          ${coupon.isActive && new Date(coupon.expiryDate) > new Date() ? 'text-emerald-400 bg-emerald-400/10' : 'text-rose-400 bg-rose-400/10'}`}>
                          {coupon.isActive && new Date(coupon.expiryDate) > new Date() ? 'Active' : 'Expired/Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-xs font-medium whitespace-nowrap text-ellipsis">
                        {new Date(coupon.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEdit(coupon)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(coupon._id)}
                            className="p-1.5 text-rose-400 hover:text-white hover:bg-rose-500/20 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-5 py-12 text-center text-slate-500 font-medium">
                      No discount coupons registered.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Coupon Modal */}
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
                  {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Coupon Code</label>
                    <input 
                      type="text" 
                      required
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value })}
                      placeholder="e.g. SUMMER50" 
                      className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50 uppercase" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Discount Type</label>
                      <select 
                        value={form.discountType}
                        onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                        className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (₹)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Discount Value</label>
                      <input 
                        type="number" 
                        required
                        value={form.discountValue}
                        onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
                        placeholder="50" 
                        className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50" 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Max Uses</label>
                      <input 
                        type="number" 
                        required
                        value={form.usageLimit}
                        onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })}
                        placeholder="100" 
                        className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50" 
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Expiry Date</label>
                      <input 
                        type="date" 
                        required
                        value={form.expiryDate}
                        onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                        className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50" 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Min Purchase Amount</label>
                      <input 
                        type="number" 
                        required
                        value={form.minPurchaseAmount}
                        onChange={(e) => setForm({ ...form, minPurchaseAmount: Number(e.target.value) })}
                        placeholder="0" 
                        className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50" 
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Status</label>
                      <select 
                        value={form.isActive}
                        onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}
                        className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50"
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
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
                    {submitting ? 'Saving...' : 'Save Coupon'}
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

export default AdminCoupons;
