import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ChevronRight, BookOpen, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import axios from '../../api/axios';
import useAuthStore from '../../store/authStore';

const AuthorLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data } = await axios.post('/users/login', { email, password });
      
      if (data.role !== 'author') {
        setIsLoading(false);
        return toast.error('Access denied. This portal is only accessible to verified Authors.');
      }

      login(data);
      toast.success('Welcome back, Author!');
      navigate('/author/dashboard');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Login failed. Invalid credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-[#f8fafc] p-4 sm:p-8 relative overflow-hidden">
      
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
                 <span className="text-xs font-bold text-white/80 uppercase tracking-widest">Verified Author Portal</span>
              </div>
              <h1 className="text-4xl xl:text-5xl font-poppins font-extrabold leading-[1.15] text-white mb-6">
                Publish<br/>Manage &<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-100 to-primary-300">Earn.</span>
              </h1>
              <p className="text-lg text-primary-50/80 font-inter leading-relaxed max-w-sm">
                Log in to upload new ebooks, audiobooks, monitor real-time sales royalties, and manage your public author profile.
              </p>
            </motion.div>
          </div>

          {/* Slogan */}
          <div className="relative z-10 p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <p className="text-white/80 text-sm italic font-inter leading-relaxed">
              "Your words have value. Share your creations and start earning royalties instantly."
            </p>
            <p className="text-white/50 text-xs font-bold mt-3 uppercase tracking-wider">— Author Console</p>
          </div>
        </div>

        {/* Right Side - Form (60%) */}
        <div className="w-full lg:w-7/12 p-8 sm:p-14 lg:p-20 flex flex-col justify-center bg-white relative">
          
          <div className="max-w-md w-full mx-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-center lg:text-left mb-10"
            >
              <h2 className="text-3xl sm:text-4xl font-poppins font-black text-[#1e293b] mb-3">Author Login</h2>
              <p className="text-[#64748b] font-inter text-lg">Sign in to publish and monitor earnings</p>
            </motion.div>

            <form onSubmit={handleLogin} className="space-y-6">
              
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-[#334155] ml-1">Author Email Address</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#94a3b8] group-focus-within:text-primary-600 transition-colors">
                      <Mail size={20} />
                    </div>
                    <input
                      type="email"
                      required
                      className="w-full pl-12 pr-4 py-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all font-inter text-[15px] shadow-sm shadow-gray-100/50"
                      placeholder="author@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-[#334155] ml-1">Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#94a3b8] group-focus-within:text-primary-600 transition-colors">
                      <Lock size={20} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      className="w-full pl-12 pr-12 py-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all font-inter text-[15px] shadow-sm shadow-gray-100/50"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#94a3b8] hover:text-primary-600 transition-colors focus:outline-none"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full relative overflow-hidden group bg-primary-600 text-white font-bold py-4 rounded-2xl shadow-[0_8px_20px_-6px_rgba(106,13,173,0.5)] hover:shadow-[0_12px_25px_-6px_rgba(106,13,173,0.6)] hover:bg-primary-700 hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary-500/30 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex justify-center text-[15px]"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                <span className="flex items-center gap-2 relative z-10">
                  {isLoading ? 'Signing In...' : 'Sign In to Portal'} 
                  {!isLoading && <ChevronRight size={18} className="group-hover:translate-x-1.5 transition-transform duration-300" />}
                </span>
              </button>
            </form>

            <div className="mt-10 text-center lg:text-left border-t border-gray-100 pt-6">
              <p className="text-[#64748b] font-medium text-[15px]">
                Want to become an author?{' '}
                <Link to="/author/apply" className="font-bold text-primary-600 hover:text-primary-800 transition-colors relative inline-block after:content-[''] after:absolute after:w-full after:h-[2px] after:bg-primary-600 after:left-0 after:bottom-[-2px] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left lg:ml-1">
                  Apply for Publishing
                </Link>
              </p>
            </div>
            
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthorLogin;
