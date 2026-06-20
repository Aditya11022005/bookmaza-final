import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Upload, Camera, Globe, Twitter, Instagram, CreditCard, Lock, Save, Loader } from 'lucide-react';
import { toast } from 'sonner';
import axios from '../../api/axios';
import useAuthStore from '../../store/authStore';

const AuthorProfile = () => {
  const { user, login } = useAuthStore();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    website: '',
    twitter: '',
    instagram: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    panCard: '',
    upiId: '',
    profileImage: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get('/users/profile');
        login({ ...data, token: user?.token });
      } catch (err) {
        console.error(err);
        toast.error('Failed to load author profile details');
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchProfile();
    }
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        website: user.website || '',
        twitter: user.twitter || '',
        instagram: user.instagram || '',
        bankName: user.bankName || '',
        accountNumber: user.accountNumber || '',
        ifscCode: user.ifscCode || '',
        panCard: user.panCard || '',
        upiId: user.upiId || '',
        profileImage: user.profileImage || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadPayload = new FormData();
    uploadPayload.append('image', file);

    setUploading(true);
    try {
      const { data } = await axios.post('/upload/image', uploadPayload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setFormData(prev => ({ ...prev, profileImage: data.url }));
      toast.success('Image uploaded successfully! Remember to save changes.');
    } catch (err) {
      console.error(err);
      toast.error('Image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = { ...formData };
      
      // If updating password
      if (activeTab === 'security') {
        if (newPassword !== confirmPassword) {
          setIsSaving(false);
          return toast.error('Passwords do not match');
        }
        if (newPassword.length < 6) {
          setIsSaving(false);
          return toast.error('Password must be at least 6 characters long');
        }
        payload.password = newPassword;
      }

      const { data } = await axios.put('/users/profile', payload);
      login({ ...data, token: user?.token });
      toast.success('Author profile updated successfully!');
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update profile settings.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader className="animate-spin text-primary-600" size={32} />
        <span className="text-slate-500 font-bold text-sm uppercase tracking-wider">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-poppins font-black text-white tracking-tight">Author Profile</h1>
        <p className="text-slate-500 text-sm font-medium mt-0.5">Manage your public persona and payment details</p>
      </div>

      <div className="bg-[#0d1526] border border-white/[0.06] rounded-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 bg-white/[0.02] border-b md:border-b-0 md:border-r border-white/[0.06] p-4 shrink-0">
          <div className="flex flex-row md:flex-col gap-2 overflow-x-auto custom-scrollbar pb-2 md:pb-0">
            <button 
              type="button"
              onClick={() => setActiveTab('general')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${activeTab === 'general' ? 'bg-amber-500/10 text-amber-500' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <User size={18} /> General Info
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('social')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${activeTab === 'social' ? 'bg-amber-500/10 text-amber-500' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <Globe size={18} /> Social Links
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('payment')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${activeTab === 'payment' ? 'bg-amber-500/10 text-amber-500' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <CreditCard size={18} /> Payout Details
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${activeTab === 'security' ? 'bg-amber-500/10 text-amber-500' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <Lock size={18} /> Security
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6">
          <form onSubmit={handleSave}>
            
            {activeTab === 'general' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  <div className="relative group cursor-pointer">
                    <div className="w-24 h-24 rounded-full bg-[#0f172a] border-2 border-white/10 overflow-hidden flex items-center justify-center relative">
                      {uploading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : formData.profileImage ? (
                        <img src={formData.profileImage} alt={formData.name} className="w-full h-full object-cover" />
                      ) : (
                        <User size={40} className="text-slate-500" />
                      )}
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera size={20} className="text-white" />
                      </div>
                    </div>
                    <label className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-amber-500 border-2 border-[#0d1526] flex items-center justify-center text-[#0d1526] shadow-lg cursor-pointer">
                      <Upload size={14} />
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleImageUpload} 
                        disabled={uploading}
                      />
                    </label>
                  </div>
                  <div className="flex-1 space-y-1 text-center sm:text-left">
                    <h3 className="text-white font-bold">Profile Picture</h3>
                    <p className="text-slate-500 text-xs">JPG, GIF or PNG. Recommended ratio 1:1.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 mt-4">
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Full Name (Pen Name)</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500/50 transition-colors" required />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input type="email" name="email" value={formData.email} disabled className="w-full bg-white/[0.02] border border-white/5 text-slate-500 text-sm rounded-xl pl-10 pr-4 py-3 cursor-not-allowed" />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Contact support to change your login email.</p>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Author Bio</label>
                    <textarea rows="4" name="bio" value={formData.bio} onChange={handleChange} className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500/50 transition-colors resize-none"></textarea>
                    <p className="text-[10px] text-slate-500 mt-1">This will be displayed on your public author page.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'social' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                <h3 className="text-lg font-bold text-white mb-2">Connect Your Audience</h3>
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Personal Website</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input type="text" name="website" value={formData.website} onChange={handleChange} placeholder="https://" className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-amber-500/50 transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Twitter Handle</label>
                  <div className="relative">
                    <Twitter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input type="text" name="twitter" value={formData.twitter} onChange={handleChange} placeholder="@username" className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-amber-500/50 transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Instagram Handle</label>
                  <div className="relative">
                    <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input type="text" name="instagram" value={formData.instagram} onChange={handleChange} placeholder="@username" className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-amber-500/50 transition-colors" />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'payment' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
                  <h4 className="text-amber-500 font-bold text-sm flex items-center gap-2"><CreditCard size={16}/> Payout Information</h4>
                  <p className="text-amber-500/70 text-xs mt-1">This information is strictly used for monthly royalty payouts and is encrypted securely.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Bank Name</label>
                    <input type="text" name="bankName" value={formData.bankName} onChange={handleChange} placeholder="e.g. State Bank of India" className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500/50 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">IFSC Code</label>
                    <input type="text" name="ifscCode" value={formData.ifscCode} onChange={handleChange} placeholder="e.g. SBIN0001234" className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500/50 transition-colors" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Account Number</label>
                    <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleChange} className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500/50 transition-colors" />
                  </div>
                </div>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-[#0d1526] px-3 text-xs font-bold text-slate-500 uppercase tracking-widest">OR USE UPI</span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">UPI ID (VPA)</label>
                  <input type="text" name="upiId" value={formData.upiId} onChange={handleChange} placeholder="e.g. username@okicici" className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500/50 transition-colors" />
                </div>
                
                <div className="mt-4 pt-4 border-t border-white/10">
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">PAN Card Number (For Tax Purposes)</label>
                  <input type="text" name="panCard" value={formData.panCard} onChange={handleChange} placeholder="ABCDE1234F" className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500/50 transition-colors uppercase" />
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">New Password</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500/50 transition-colors" />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Confirm New Password</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500/50 transition-colors" />
                </div>
              </motion.div>
            )}

            <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
              <button 
                type="submit" 
                disabled={isSaving}
                className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-amber-600/20 transition-all disabled:opacity-70"
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><Save size={18} /> Save Changes</>
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default AuthorProfile;
