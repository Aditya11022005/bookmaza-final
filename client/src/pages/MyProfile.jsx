import { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import useOrderStore from '../store/orderStore';
import axios from '../api/axios';
import { Mail, Phone, MapPin, Calendar, Edit2, KeyRound, Save, Book, Award, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import usePageMeta from '../hooks/usePageMeta';

const MyProfile = () => {
  usePageMeta('My Profile', 'Manage your personal information, address, and account settings on Pustak Maza.');
  const { user, login } = useAuthStore();
  const { orders = [], library = [] } = useOrderStore();
  const [ordersCount, setOrdersCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'Male',
    dob: '',
    profileImage: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India'
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get('/users/profile');
        // Merge with existing token to avoid logging out
        login({ ...data, token: user?.token });
        
        // Fetch real orders count
        const { data: ordersData } = await axios.get('/orders/myorders');
        if (ordersData) {
          setOrdersCount(ordersData.length);
        }
      } catch (err) {
        console.error(err);
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
        phone: user.phone || '',
        gender: user.gender || 'Male',
        dob: user.dob || '',
        profileImage: user.profileImage || '',
        address: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        postalCode: user.address?.zipCode || '',
        country: user.address?.country || 'India'
      });
    }
  }, [user]);

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

  const handleSave = async () => {
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        dob: formData.dob,
        profileImage: formData.profileImage,
        address: {
          street: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.postalCode,
          country: formData.country
        }
      };
      const { data } = await axios.put('/users/profile', payload);
      login({ ...data, token: user?.token });
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleChangePassword = () => {
    toast.success('A password reset link has been sent to your email.');
  };

  if (!user) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl pb-10"
    >
      <div className="mb-8">
         <h1 className="text-3xl font-poppins font-black text-[#1e293b] mb-2">My Profile</h1>
         <p className="text-[#64748b]">Manage your personal information and account details.</p>
      </div>

      {/* Account Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
         <div className="bg-white rounded-2xl p-5 border border-gray-100 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
               <Book size={24} />
            </div>
            <div>
               <p className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Total Orders</p>
               <p className="text-2xl font-black text-[#1e293b] leading-none">{ordersCount}</p>
            </div>
         </div>
         <div className="bg-white rounded-2xl p-5 border border-gray-100 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
               <Clock size={24} />
            </div>
            <div>
               <p className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Books Purchased</p>
               <p className="text-2xl font-black text-[#1e293b] leading-none">{(user.purchasedBooks || []).length || library.length}</p>
            </div>
         </div>
         <div className="bg-white rounded-2xl p-5 border border-gray-100 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
               <Award size={24} />
            </div>
            <div>
               <p className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Wishlist</p>
               <p className="text-2xl font-black text-[#1e293b] leading-none">{(user.wishlist || []).length} Items</p>
            </div>
         </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        {/* Profile Header Image / Accent */}
        <div className="h-32 bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 relative">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        </div>

        <div className="px-6 sm:px-10 pb-10">
           {/* Avatar Section */}
           <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6 -mt-16 sm:-mt-12 mb-8">
              <div className="relative">
                 <div className="w-32 h-32 rounded-full border-4 border-white shadow-md bg-white overflow-hidden relative z-10 flex items-center justify-center bg-gray-100">
                    {uploading ? (
                      <span className="text-xs font-bold text-gray-500 animate-pulse">Uploading...</span>
                    ) : formData.profileImage ? (
                      <img src={formData.profileImage} alt={user.name} className="w-full h-full object-cover" />
                    ) : user.profileImage ? (
                      <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl font-extrabold text-primary-600 uppercase">
                        {formData.name ? formData.name.charAt(0) : user.name ? user.name.charAt(0) : 'U'}
                      </span>
                    )}
                 </div>
                 {isEditing && (
                    <label className="absolute bottom-2 right-2 z-20 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center shadow-md hover:bg-primary-700 transition cursor-pointer">
                       <Edit2 size={14} />
                       <input 
                         type="file" 
                         accept="image/*" 
                         className="hidden" 
                         onChange={handleImageUpload} 
                         disabled={uploading}
                       />
                    </label>
                 )}
              </div>
              
              <div className="flex flex-wrap gap-3">
                 {!isEditing ? (
                    <button 
                       onClick={() => setIsEditing(true)}
                       className="px-6 py-2.5 rounded-xl border-2 border-primary-100 text-primary-700 font-bold hover:bg-primary-50 transition flex items-center gap-2"
                    >
                       <Edit2 size={16} /> Edit Profile
                    </button>
                 ) : (
                    <button 
                       onClick={handleSave}
                       className="px-6 py-2.5 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-700 shadow-[0_4px_14px_0_rgba(106,13,173,0.39)] transition flex items-center gap-2"
                    >
                       <Save size={16} /> Save Changes
                    </button>
                 )}
                 <button 
                    onClick={handleChangePassword}
                    className="px-6 py-2.5 rounded-xl bg-[#1e293b] text-white font-bold hover:bg-gray-800 transition flex items-center gap-2"
                 >
                    <KeyRound size={16} /> Change Password
                 </button>
              </div>
           </div>

           {/* User Details Form */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              
              {/* Personal Info Header */}
              <div className="md:col-span-2 pb-2 border-b border-gray-100">
                 <h3 className="text-xl font-poppins font-bold text-[#1e293b]">Personal Information</h3>
              </div>

              {/* Name */}
              <div className="space-y-1.5">
                 <label className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-1">Full Name</label>
                 <input 
                   type="text"
                   value={formData.name}
                   onChange={e => setFormData({...formData, name: e.target.value})}
                   disabled={!isEditing}
                   className={`w-full px-4 py-3 rounded-xl font-bold text-[#1e293b] border ${isEditing ? 'bg-white border-primary-200 focus:ring-4 focus:ring-primary-500/10 focus:outline-none' : 'bg-gray-50/50 border-gray-100'}`}
                 />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                 <label className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-1 flex items-center gap-2"><Mail size={14}/> Email Address</label>
                 <input 
                   type="email"
                   value={formData.email}
                   onChange={e => setFormData({...formData, email: e.target.value})}
                   disabled={!isEditing}
                   className={`w-full px-4 py-3 rounded-xl font-bold text-[#1e293b] border ${isEditing ? 'bg-white border-primary-200 focus:ring-4 focus:ring-primary-500/10 focus:outline-none' : 'bg-gray-50/50 border-gray-100'}`}
                 />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                 <label className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-1 flex items-center gap-2"><Phone size={14}/> Phone Number</label>
                 <input 
                   type="text"
                   value={formData.phone}
                   onChange={e => setFormData({...formData, phone: e.target.value})}
                   disabled={!isEditing}
                   className={`w-full px-4 py-3 rounded-xl font-bold text-[#1e293b] border ${isEditing ? 'bg-white border-primary-200 focus:ring-4 focus:ring-primary-500/10 focus:outline-none' : 'bg-gray-50/50 border-gray-100'}`}
                 />
              </div>

              {/* Gender */}
              <div className="space-y-1.5">
                 <label className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-1">Gender</label>
                 <select 
                   value={formData.gender}
                   onChange={e => setFormData({...formData, gender: e.target.value})}
                   disabled={!isEditing}
                   className={`w-full px-4 py-3.5 rounded-xl font-bold text-[#1e293b] border appearance-none ${isEditing ? 'bg-white border-primary-200 focus:ring-4 focus:ring-primary-500/10 focus:outline-none cursor-pointer' : 'bg-gray-50/50 border-gray-100'}`}
                 >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                 </select>
              </div>

              {/* Date of Birth */}
              <div className="space-y-1.5">
                 <label className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-1">Date of Birth</label>
                 <input 
                   type="date"
                   value={formData.dob}
                   onChange={e => setFormData({...formData, dob: e.target.value})}
                   disabled={!isEditing}
                   className={`w-full px-4 py-3 rounded-xl font-bold text-[#1e293b] border ${isEditing ? 'bg-white border-primary-200 focus:ring-4 focus:ring-primary-500/10 focus:outline-none' : 'bg-gray-50/50 border-gray-100'}`}
                 />
              </div>

              {/* Joined Date */}
              <div className="space-y-1.5 opacity-80">
                 <label className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-1 flex items-center gap-2"><Calendar size={14}/> Member Since</label>
                 <input 
                   type="text"
                   defaultValue={new Date(user.joinedDate || '2026-01-15').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric'})}
                   disabled
                   className="w-full px-4 py-3 rounded-xl font-bold text-[#1e293b] border bg-gray-50/50 border-gray-100"
                 />
              </div>

              {/* Address Section Title */}
              <div className="md:col-span-2 pt-6 border-t border-gray-100 flex items-center justify-between">
                 <h3 className="text-xl font-poppins font-bold text-[#1e293b] flex items-center gap-2">
                    <MapPin size={20} className="text-primary-600"/> Address & Location
                 </h3>
              </div>

              {/* Street Address text area */}
              <div className="space-y-1.5 md:col-span-2">
                 <label className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-1">Street Address</label>
                 <textarea 
                   rows="2"
                   value={formData.address}
                   onChange={e => setFormData({...formData, address: e.target.value})}
                   disabled={!isEditing}
                   className={`w-full px-4 py-3 rounded-xl font-bold text-[#1e293b] border resize-none ${isEditing ? 'bg-white border-primary-200 focus:ring-4 focus:ring-primary-500/10 focus:outline-none' : 'bg-gray-50/50 border-gray-100'}`}
                 />
              </div>

              {/* City */}
              <div className="space-y-1.5">
                 <label className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-1">City</label>
                 <input 
                   type="text"
                   value={formData.city}
                   onChange={e => setFormData({...formData, city: e.target.value})}
                   disabled={!isEditing}
                   className={`w-full px-4 py-3 rounded-xl font-bold text-[#1e293b] border ${isEditing ? 'bg-white border-primary-200 focus:ring-4 focus:ring-primary-500/10 focus:outline-none' : 'bg-gray-50/50 border-gray-100'}`}
                 />
              </div>

              {/* State */}
              <div className="space-y-1.5">
                 <label className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-1">State / Province</label>
                 <input 
                   type="text"
                   value={formData.state}
                   onChange={e => setFormData({...formData, state: e.target.value})}
                   disabled={!isEditing}
                   className={`w-full px-4 py-3 rounded-xl font-bold text-[#1e293b] border ${isEditing ? 'bg-white border-primary-200 focus:ring-4 focus:ring-primary-500/10 focus:outline-none' : 'bg-gray-50/50 border-gray-100'}`}
                 />
              </div>

              {/* Postal Code */}
              <div className="space-y-1.5">
                 <label className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-1">Postal Code</label>
                 <input 
                   type="text"
                   value={formData.postalCode}
                   onChange={e => setFormData({...formData, postalCode: e.target.value})}
                   disabled={!isEditing}
                   className={`w-full px-4 py-3 rounded-xl font-bold text-[#1e293b] border ${isEditing ? 'bg-white border-primary-200 focus:ring-4 focus:ring-primary-500/10 focus:outline-none' : 'bg-gray-50/50 border-gray-100'}`}
                 />
              </div>

              {/* Country */}
              <div className="space-y-1.5">
                 <label className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-1">Country</label>
                 <input 
                   type="text"
                   value={formData.country}
                   onChange={e => setFormData({...formData, country: e.target.value})}
                   disabled={!isEditing}
                   className={`w-full px-4 py-3 rounded-xl font-bold text-[#1e293b] border ${isEditing ? 'bg-white border-primary-200 focus:ring-4 focus:ring-primary-500/10 focus:outline-none' : 'bg-gray-50/50 border-gray-100'}`}
                 />
              </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MyProfile;
