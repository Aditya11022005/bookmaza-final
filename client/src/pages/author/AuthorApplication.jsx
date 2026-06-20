import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, User, Lock, FileText, Link as LinkIcon, ArrowLeft, Send, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import axios from '../../api/axios';

const AuthorApplication = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    experience: 'new',
    portfolioUrl: '',
    about: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      return toast.error('Please fill in Name, Email and Password');
    }
    setIsSubmitting(true);
    try {
      await axios.post('/users', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'author',
        bio: formData.about,
        website: formData.portfolioUrl
      });
      toast.success('Registration successful! Your author profile is now pending admin approval.');
      navigate('/author/login');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-[#f8fafc] p-4 sm:p-8 relative overflow-hidden py-12">
      
      {/* Background Ambient Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-200/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-primary-400/10 blur-[100px] rounded-full pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-6xl bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(106,13,173,0.1)] border border-gray-100/80 overflow-hidden flex flex-col lg:flex-row relative z-10"
      >
        {/* Left Side - Brand & Visual (40%) */}
        <div className="hidden lg:flex w-5/12 bg-[#6A0DAD] relative flex-col justify-between p-14 overflow-hidden group">
          {/* Animated Background Gradients & Patterns */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#5c0e98] via-[#6A0DAD] to-[#3a0664] z-0"></div>
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] z-0 mix-blend-overlay"></div>
          
          <motion.div 
            animate={{ scale: [1, 1.05, 1], rotate: [0, 2, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-white/5 rounded-full blur-3xl z-0"
          ></motion.div>

          <div className="relative z-10">
            <Link to="/" className="flex items-center gap-3 w-max">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-lg group-hover:bg-white/20 transition-all duration-500">
                <BookOpen size={24} className="text-white" />
              </div>
              <span className="text-2xl font-poppins font-bold tracking-tight text-white/90 group-hover:text-white transition-colors duration-500">Pustak Maza</span>
            </Link>
          </div>

          <div className="relative z-10 mb-8 mt-20">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 mb-8">
                 <ShieldCheck size={14} className="text-green-400" />
                 <span className="text-xs font-bold text-white/80 uppercase tracking-widest">Join our Creator Network</span>
              </div>
              <h1 className="text-4xl xl:text-5xl font-poppins font-extrabold leading-[1.15] text-white mb-6">
                Publishing<br/>Partnership<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-100 to-primary-300">Program.</span>
              </h1>
              <p className="text-lg text-primary-50/80 font-inter leading-relaxed max-w-sm">
                Get up to 75% author royalties, track reader engagements, and publish digital ebooks or print-on-demand books.
              </p>
            </motion.div>
          </div>

          {/* Slogan */}
          <div className="relative z-10 p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <p className="text-white/80 text-sm font-semibold font-inter leading-relaxed flex items-center gap-2">
               Approval terms
            </p>
            <p className="text-white/60 text-xs font-bold mt-2 font-inter">All registrations are subject to admin review. You will receive an email notice when verified.</p>
          </div>
        </div>

        {/* Right Side - Form (60%) */}
        <div className="w-full lg:w-7/12 p-8 sm:p-14 lg:p-16 flex flex-col justify-center bg-white relative">
          
          <div className="max-w-xl w-full mx-auto">
            <Link to="/author/login" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary-600 transition-colors text-sm font-bold mb-6">
              <ArrowLeft size={16} /> Back to Login
            </Link>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-center lg:text-left mb-8"
            >
              <h2 className="text-3xl font-poppins font-black text-[#1e293b] mb-2">Apply for Publishing</h2>
              <p className="text-[#64748b] font-inter text-md">Register as a verified author to start publishing</p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-[#334155] ml-1">Pen Name / Full Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#94a3b8] group-focus-within:text-primary-600 transition-colors">
                      <User size={18} />
                    </div>
                    <input
                      type="text"
                      name="name"
                      required
                      className="w-full pl-11 pr-4 py-3.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all font-inter text-[14px]"
                      placeholder="e.g. Jane Doe"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-[#334155] ml-1">Email Address</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#94a3b8] group-focus-within:text-primary-600 transition-colors">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      name="email"
                      required
                      className="w-full pl-11 pr-4 py-3.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all font-inter text-[14px]"
                      placeholder="author@example.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#334155] ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#94a3b8] group-focus-within:text-primary-600 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={6}
                    className="w-full pl-11 pr-4 py-3.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all font-inter text-[14px]"
                    placeholder="Choose a strong password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-[#334155] ml-1">Writing Experience</label>
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-[#1e293b] focus:outline-none focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all font-inter text-[14px] cursor-pointer"
                  >
                    <option value="new">New Writer / Debut Author</option>
                    <option value="published">Self-Published Author</option>
                    <option value="pro">Traditionally Published Author</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-[#334155] ml-1">Portfolio Link (Optional)</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#94a3b8] group-focus-within:text-primary-600 transition-colors">
                      <LinkIcon size={18} />
                    </div>
                    <input
                      type="url"
                      name="portfolioUrl"
                      className="w-full pl-11 pr-4 py-3.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all font-inter text-[14px]"
                      placeholder="https://..."
                      value={formData.portfolioUrl}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#334155] ml-1">Brief bio & what you write</label>
                <div className="relative group">
                  <div className="absolute left-4 top-3.5 pointer-events-none text-[#94a3b8] group-focus-within:text-primary-600 transition-colors">
                    <FileText size={18} />
                  </div>
                  <textarea
                    name="about"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all font-inter text-[14px] h-20 resize-none"
                    placeholder="Briefly describe your writing background, genre, and publishing expectations..."
                    value={formData.about}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full relative overflow-hidden group bg-primary-600 text-white font-bold py-4 rounded-xl shadow-[0_8px_20px_-6px_rgba(106,13,173,0.5)] hover:shadow-[0_12px_25px_-6px_rgba(106,13,173,0.6)] hover:bg-primary-700 hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary-500/30 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex justify-center text-[15px] mt-2"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                <span className="flex items-center gap-2 relative z-10">
                  {isSubmitting ? 'Submitting Application...' : 'Register as Author'} 
                  {!isSubmitting && <Send size={16} className="group-hover:translate-x-0.5 transition-transform duration-300" />}
                </span>
              </button>
            </form>

            <p className="text-[11px] text-center text-slate-400 mt-5 max-w-sm mx-auto font-inter">
              By registering, you agree to Pustak Maza terms. Applications are usually reviewed within 24 hours.
            </p>
            
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthorApplication;
