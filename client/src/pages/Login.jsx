import { useState, useEffect } from 'react';
import usePageMeta from '../hooks/usePageMeta';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, BookOpen, ChevronRight, Check } from 'lucide-react';
import axios from '../api/axios';

const Login = () => {
  usePageMeta('Login', 'Sign in to your Pustak Maza account to access your books, orders, and library.');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await axios.post('/users/login', { email, password });
      login(data);
      toast.success('Welcome back to Pustak Maza!');
      navigate('/profile');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleCredentialResponse = async (response) => {
    setIsLoading(true);
    try {
      const { data } = await axios.post('/users/google-login', { idToken: response.credential });
      login(data);
      toast.success('Logged in with Google successfully!');
      navigate('/profile');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Google login failed');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let intervalId;
    const initializeGoogle = () => {
      if (window.google && window.google.accounts) {
        const btnElement = document.getElementById("google-signin-btn");
        if (btnElement) {
          window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "217402764320-1u4j6cmr7gfti55ojs5f887jifl0u7h7.apps.googleusercontent.com",
            callback: handleGoogleCredentialResponse,
          });
          window.google.accounts.id.renderButton(
            btnElement,
            { theme: "outline", size: "large", width: 380 }
          );
          if (intervalId) clearInterval(intervalId);
        }
      }
    };

    initializeGoogle();
    intervalId = setInterval(initializeGoogle, 500);
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

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
          <div className="absolute inset-0 bg-gradient-to-br from-[#6A0DAD] via-[#8B31CB] to-[#580b94] z-0"></div>
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] z-0 mix-blend-overlay"></div>
          
          <motion.div 
            animate={{ scale: [1, 1.05, 1], rotate: [0, 2, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-white/5 rounded-full blur-3xl z-0"
          ></motion.div>
          
          <motion.div 
            animate={{ scale: [1, 1.1, 1], rotate: [0, -2, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[-10%] right-[-20%] w-[80%] h-[80%] flex bg-primary-300/20 rounded-full blur-3xl z-0"
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
                 <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                 <span className="text-xs font-bold text-white/80 uppercase tracking-widest">Premium Platform</span>
              </div>
              <h1 className="text-4xl xl:text-5xl font-poppins font-extrabold leading-[1.15] text-white mb-6">
                Unlock a<br/>World of<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-100 to-primary-300">Imagination.</span>
              </h1>
              <p className="text-lg text-primary-50/80 font-inter leading-relaxed max-w-sm">
                Your sanctuary for knowledge, stories, and growth. Join the most elegant publishing network today.
              </p>
            </motion.div>
          </div>

          {/* Abstract Quote or UI Element */}
          <div className="relative z-10 p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <p className="text-white/80 text-sm italic font-inter leading-relaxed">
              "A reader lives a thousand lives before he dies."
            </p>
            <p className="text-white/50 text-xs font-bold mt-3 uppercase tracking-wider">— George R.R. Martin</p>
          </div>
        </div>

        {/* Right Side - Form (60%) */}
        <div className="w-full lg:w-7/12 p-8 sm:p-14 lg:p-20 flex flex-col justify-center bg-white relative">
          
          <div className="max-w-md w-full mx-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-10 text-center lg:text-left"
            >
              <h2 className="text-3xl sm:text-4xl font-poppins font-black text-[#1e293b] mb-3">Welcome Back</h2>
              <p className="text-[#64748b] font-inter text-lg">Sign in to continue your reading journey</p>
            </motion.div>

            <form onSubmit={submitHandler} className="space-y-6">
              
              {/* Form Fields wrapped in a subtle container */}
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-[#334155] ml-1">Email address</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#94a3b8] group-focus-within:text-primary-600 transition-colors">
                      <Mail size={20} />
                    </div>
                    <input
                      type="email"
                      required
                      className="w-full pl-12 pr-4 py-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all font-inter text-[15px] shadow-sm shadow-gray-100/50"
                      placeholder="you@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-sm font-bold text-[#334155]">Password</label>
                    <Link to="/forgot-password" className="text-sm font-bold text-primary-600 hover:text-primary-800 transition-colors">
                      Forgot?
                    </Link>
                  </div>
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

              <label className="flex items-center cursor-pointer group w-max">
                <div className="relative flex items-center justify-center w-5 h-5 rounded-[6px] border-2 border-[#cbd5e1] group-hover:border-primary-500 transition-colors mr-3 bg-white">
                  <input type="checkbox" className="peer sr-only" />
                  <div className="absolute inset-[-2px] bg-primary-600 rounded-[6px] scale-0 peer-checked:scale-100 transition-transform origin-center"></div>
                  <Check size={14} className="text-white relative z-10 opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3.5}/>
                </div>
                <span className="text-[15px] font-medium text-[#64748b] select-none group-hover:text-[#1e293b] transition-colors">Remember me for 30 days</span>
              </label>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full relative overflow-hidden group bg-primary-600 text-white font-bold py-4 rounded-2xl shadow-[0_8px_20px_-6px_rgba(106,13,173,0.5)] hover:shadow-[0_12px_25px_-6px_rgba(106,13,173,0.6)] hover:bg-primary-700 hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary-500/30 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex justify-center text-[15px]"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                <span className="flex items-center gap-2 relative z-10">
                  {isLoading ? 'Signing In...' : 'Sign In'} 
                  {!isLoading && <ChevronRight size={18} className="group-hover:translate-x-1.5 transition-transform duration-300" />}
                </span>
              </button>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-400 font-semibold tracking-wide uppercase text-xs">Or continue with</span>
                </div>
              </div>

              <div id="google-signin-btn" className="w-full flex justify-center mt-2"></div>
            </form>

            <div className="mt-10 text-center lg:text-left">
              <p className="text-[#64748b] font-medium text-[15px]">
                Don't have an account?{' '}
                <Link to="/register" className="font-bold text-primary-600 hover:text-primary-800 transition-colors relative inline-block after:content-[''] after:absolute after:w-full after:h-[2px] after:bg-primary-600 after:left-0 after:bottom-[-2px] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left lg:ml-1">
                  Create Account
                </Link>
              </p>
            </div>
            
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
