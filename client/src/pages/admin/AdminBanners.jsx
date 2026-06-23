import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, X, Upload, Eye, EyeOff } from 'lucide-react';
import axios from '../../api/axios';
import { toast } from 'sonner';

const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [image, setImage] = useState('');
  const [link, setLink] = useState('');
  const [buttonText, setButtonText] = useState('Claim Your Offer');
  const [type, setType] = useState('hero');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchBanners = async () => {
    try {
      const { data } = await axios.get('/banners/all');
      setBanners(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch banners');
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openAddModal = () => {
    setEditingBanner(null);
    setTitle('');
    setSubtitle('');
    setImage('');
    setLink('');
    setButtonText('Claim Your Offer');
    setType('hero');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (banner) => {
    setEditingBanner(banner);
    setTitle(banner.title || '');
    setSubtitle(banner.subtitle || '');
    setImage(banner.image || '');
    setLink(banner.link || '');
    setButtonText(banner.buttonText || 'Claim Your Offer');
    setType(banner.type || 'hero');
    setIsActive(banner.isActive);
    setIsModalOpen(true);
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    const toastId = toast.loading('Uploading banner image...');
    try {
      const { data } = await axios.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Banner image uploaded!', { id: toastId });
      setImage(data.url);
    } catch (err) {
      console.error(err);
      toast.error('Image upload failed', { id: toastId });
    }
  };

  const handleSaveBanner = async (e) => {
    e.preventDefault();
    if (!title || !image) {
      toast.error('Title and banner image are required.');
      return;
    }

    const payload = { title, subtitle, image, link, buttonText, type, isActive };

    setLoading(true);
    try {
      if (editingBanner) {
        await axios.put(`/banners/${editingBanner._id}`, payload);
        toast.success('Banner updated successfully!');
      } else {
        await axios.post('/banners', payload);
        toast.success('Banner created successfully!');
      }
      setIsModalOpen(false);
      fetchBanners();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save banner');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBanner = async (id) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;
    try {
      await axios.delete(`/banners/${id}`);
      toast.success('Banner removed successfully!');
      fetchBanners();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete banner');
    }
  };

  const handleToggleActive = async (banner) => {
    try {
      const updatedStatus = !banner.isActive;
      await axios.put(`/banners/${banner._id}`, { isActive: updatedStatus });
      toast.success(updatedStatus ? 'Banner activated!' : 'Banner deactivated!');
      fetchBanners();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-poppins font-black text-white tracking-tight">Homepage Banners</h1>
          <p className="text-slate-500 text-sm font-medium mt-0.5">Manage the main hero carousel on the storefront</p>
        </div>
        <button 
          onClick={openAddModal}
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-primary-600/30"
        >
          <Plus size={18} />
          Add Banner
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {banners.length > 0 ? (
          banners.map((banner, i) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={banner._id}
              className="group flex flex-col md:flex-row gap-4 bg-[#0d1526] border border-white/[0.06] p-4 rounded-2xl hover:border-white/[0.12] transition-colors"
            >
              <div className="md:w-64 h-32 rounded-xl overflow-hidden bg-white/5 border border-white/10 shrink-0 relative">
                <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
              </div>
              
              <div className="flex-1 flex flex-col justify-between py-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-bold text-lg leading-tight">{banner.title}</h3>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${banner.type === 'promo' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-primary-500/10 text-primary-400 border border-primary-500/20'}`}>
                          {banner.type === 'promo' ? 'Promo / Ad' : 'Hero Slider'}
                        </span>
                      </div>
                      {banner.subtitle && <p className="text-slate-500 text-xs font-medium mt-0.5">{banner.subtitle}</p>}
                    </div>
                    <button 
                      onClick={() => handleToggleActive(banner)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all
                        ${banner.isActive ? 'text-emerald-400 bg-emerald-400/10 hover:bg-emerald-400/20' : 'text-slate-400 bg-white/10 hover:bg-white/20'}`}
                    >
                      {banner.isActive ? (
                        <><Eye size={12} /> Active</>
                      ) : (
                        <><EyeOff size={12} /> Hidden</>
                      )}
                    </button>
                  </div>
                  {banner.link && (
                    <p className="text-slate-400 text-sm font-medium mb-3">
                      Links to: <span className="text-primary-400 font-mono text-xs">{banner.link}</span>
                    </p>
                  )}
                </div>
                
                <div className="flex items-center justify-end gap-2 border-t border-white/[0.06] pt-3">
                  <button 
                    onClick={() => openEditModal(banner)}
                    className="px-3 py-1.5 text-slate-300 bg-white/5 hover:bg-white/10 hover:text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 border border-white/[0.05]"
                  >
                    <Edit size={14} /> Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteBanner(banner._id)}
                    className="px-3 py-1.5 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg text-xs font-bold transition-colors border border-rose-500/20"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="bg-[#0d1526] border border-white/[0.06] p-12 text-center text-slate-500 font-medium rounded-2xl">
            No homepage banners registered. Click "Add Banner" to upload one!
          </div>
        )}
      </div>

      {/* Upload Banner Modal */}
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
              <form onSubmit={handleSaveBanner}>
                <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
                  <h2 className="text-xl font-poppins font-bold text-white">
                    {editingBanner ? 'Edit Banner' : 'Create Homepage Banner'}
                  </h2>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 space-y-5">
                  <div className="flex gap-4">
                    <div className="w-full h-36 bg-white/5 border border-white/10 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-colors cursor-pointer border-dashed relative overflow-hidden group shrink-0 md:w-48">
                      {image ? (
                        <>
                          <img src={image} alt="Banner Preview" className="w-full h-full object-cover" />
                          <button 
                            type="button" 
                            onClick={(e) => { e.stopPropagation(); setImage(''); }}
                            className="absolute top-2 right-2 p-1 bg-black/60 rounded-md text-white hover:bg-red-500 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <Upload size={24} className="mb-2" />
                          <span className="text-[10px] font-bold text-center px-2">Upload Banner</span>
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleUploadImage}
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                          />
                        </>
                      )}
                    </div>
                    
                    <div className="flex-grow space-y-2">
                      <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-widest">- OR -</label>
                      <input 
                        type="text" 
                        placeholder="Paste Image URL directly" 
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        className="w-full bg-[#0f172a] border border-white/10 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary-500/50"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Banner Title (Primary Headline)</label>
                    <input 
                      type="text" 
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Grand Marathi Book Festival" 
                      className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50" 
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Subtitle (Description Text)</label>
                    <input 
                      type="text" 
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="e.g. Flat 20% Off On All New eBooks and Audiobooks" 
                      className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50" 
                    />
                  </div>

                  {type === 'promo' && (
                    <div>
                      <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Button Text (CTA Label)</label>
                      <input 
                        type="text" 
                        value={buttonText}
                        onChange={(e) => setButtonText(e.target.value)}
                        placeholder="e.g. Claim Your Offer" 
                        className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50" 
                      />
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Banner Type/Placement</label>
                      <select 
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50"
                      >
                        <option value="hero">Hero Slider (Top Carousel)</option>
                        <option value="promo">Promo Banner (Advertise Banner)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Link URL (Optional)</label>
                      <input 
                        type="text" 
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        placeholder="e.g. /shop" 
                        className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50" 
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 pt-2">
                    <label className="flex items-center gap-2 text-sm text-slate-300 font-medium cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="w-4 h-4 rounded border-white/20 bg-white/5 accent-primary-500" 
                      />
                      Active / Visible
                    </label>
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
                    {loading ? 'Saving...' : 'Save Banner'}
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

export default AdminBanners;
