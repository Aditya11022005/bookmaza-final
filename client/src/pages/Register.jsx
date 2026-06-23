import { useState, useEffect, useRef } from 'react';
import usePageMeta from '../hooks/usePageMeta';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import axios from '../api/axios';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, BookOpen, ChevronRight, Check, User, Phone } from 'lucide-react';

const Register = () => {
  usePageMeta('Register', 'Create a new Pustak Maza account and start your reading journey today.');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const agreedRef = useRef(agreed);
  useEffect(() => {
    agreedRef.current = agreed;
  }, [agreed]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!agreed) return toast.error("Please agree to the Terms and Conditions");
    if (password !== confirmPassword) return toast.error("Passwords do not match");
    
    setIsLoading(true);
    try {
      const { data } = await axios.post('/users', { name, email, password, phone });
      login(data);
      toast.success('Registration successful! Welcome to Pustak Maza.');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleCredentialResponse = async (response) => {
    if (!agreedRef.current) {
      return toast.error("Please agree to the Terms and Conditions first");
    }
    setIsLoading(true);
    try {
      const { data } = await axios.post('/users/google-login', { idToken: response.credential });
      login(data);
      toast.success('Registration successful! Welcome to Pustak Maza.');
      navigate('/');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Google registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let intervalId;
    const initializeGoogle = () => {
      if (window.google && window.google.accounts) {
        const btnElement = document.getElementById("google-signup-btn");
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

          <div className="relative z-10 mb-8 mt-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 mb-8">
                 <span className="w-2 h-2 rounded-full bg-primary-300 animate-pulse"></span>
                 <span className="text-xs font-bold text-white/80 uppercase tracking-widest">Join our Community</span>
              </div>
              <h1 className="text-4xl xl:text-5xl font-poppins font-extrabold leading-[1.15] text-white mb-6">
                Start Your<br/>Reading<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-100 to-primary-300">Journey.</span>
              </h1>
              <p className="text-lg text-primary-50/80 font-inter leading-relaxed max-w-sm">
                Create an account to track your progress, access exclusive titles, and unlock publisher tier rewards.
              </p>
            </motion.div>
          </div>

          <div className="relative z-10 p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center gap-4">
             <div className="flex -space-x-4">
               {[1,2,3,4].map((i, idx) => (
                  <div key={i} className={`w-12 h-12 rounded-full border-2 border-[#8B31CB] bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg overflow-hidden shrink-0 z-[${5-idx}]`}>
                     <User size={18} className="text-white/60" />
                  </div>
               ))}
            </div>
            <div>
               <p className="text-white font-bold text-sm">10,000+ Active Users</p>
               <p className="text-white/60 text-xs mt-1">Join the family</p>
            </div>
          </div>
        </div>

        {/* Right Side - Form (60%) */}
        <div className="w-full lg:w-7/12 p-8 sm:p-14 lg:p-16 flex flex-col justify-center bg-white relative">
          
          <div className="max-w-xl w-full mx-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-8 text-center lg:text-left"
            >
              <h2 className="text-3xl sm:text-4xl font-poppins font-black text-[#1e293b] mb-3">Create Account</h2>
              <p className="text-[#64748b] font-inter text-lg">Set up your profile in seconds</p>
            </motion.div>

            <form onSubmit={submitHandler} className="space-y-5">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <div className="space-y-1.5">
                   <label className="text-sm font-bold text-[#334155] ml-1">Full Name *</label>
                   <div className="relative group">
                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#94a3b8] group-focus-within:text-primary-600 transition-colors">
                       <User size={20} />
                     </div>
                     <input
                       type="text"
                       required
                       className="w-full pl-12 pr-4 py-3.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all font-inter text-[15px] shadow-sm shadow-gray-100/50"
                       placeholder="John Doe"
                       value={name}
                       onChange={(e) => setName(e.target.value)}
                     />
                   </div>
                 </div>

                 <div className="space-y-1.5">
                   <label className="text-sm font-bold text-[#334155] ml-1">Email <span className="font-normal text-gray-400">*</span></label>
                   <div className="relative group">
                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#94a3b8] group-focus-within:text-primary-600 transition-colors">
                       <Mail size={20} />
                     </div>
                     <input
                       type="email"
                       required
                       className="w-full pl-12 pr-4 py-3.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all font-inter text-[15px] shadow-sm shadow-gray-100/50"
                       placeholder="you@email.com"
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                     />
                   </div>
                 </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#334155] ml-1">Phone Number <span className="text-gray-400 font-normal">(Optional)</span></label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#94a3b8] group-focus-within:text-primary-600 transition-colors">
                    <Phone size={20} />
                  </div>
                  <input
                    type="tel"
                    className="w-full pl-12 pr-4 py-3.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all font-inter text-[15px] shadow-sm shadow-gray-100/50"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <div className="space-y-1.5">
                   <label className="text-sm font-bold text-[#334155] ml-1">Password *</label>
                   <div className="relative group">
                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#94a3b8] group-focus-within:text-primary-600 transition-colors">
                       <Lock size={20} />
                     </div>
                     <input
                       type={showPassword ? "text" : "password"}
                       required
                       minLength={6}
                       className="w-full pl-12 pr-12 py-3.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all font-inter text-[15px] shadow-sm shadow-gray-100/50"
                       placeholder="••••••••"
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                     />
                     <button
                       type="button"
                       onClick={() => setShowPassword(!showPassword)}
                       className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#94a3b8] hover:text-primary-600 transition-colors focus:outline-none"
                     >
                       {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                     </button>
                   </div>
                 </div>

                 <div className="space-y-1.5">
                   <label className="text-sm font-bold text-[#334155] ml-1">Confirm Password *</label>
                   <div className="relative group">
                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#94a3b8] group-focus-within:text-primary-600 transition-colors">
                       <Lock size={20} />
                     </div>
                     <input
                       type={showConfirmPassword ? "text" : "password"}
                       required
                       minLength={6}
                       className="w-full pl-12 pr-12 py-3.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all font-inter text-[15px] shadow-sm shadow-gray-100/50"
                       placeholder="••••••••"
                       value={confirmPassword}
                       onChange={(e) => setConfirmPassword(e.target.value)}
                     />
                     <button
                       type="button"
                       onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                       className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#94a3b8] hover:text-primary-600 transition-colors focus:outline-none"
                     >
                       {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                     </button>
                   </div>
                 </div>
              </div>

              <div className="pt-2">
                 <label className="flex items-start cursor-pointer group w-max max-w-full">
                   <div className="relative flex items-center justify-center w-5 h-5 rounded-[6px] border-2 border-[#cbd5e1] group-hover:border-primary-500 transition-colors mx-1 mt-0.5 shrink-0 bg-white">
                     <input 
                        type="checkbox" 
                        className="peer sr-only" 
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                     />
                     <div className="absolute inset-[-2px] bg-primary-600 rounded-[6px] scale-0 peer-checked:scale-100 transition-transform origin-center"></div>
                     <Check size={14} className="text-white relative z-10 opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3.5}/>
                   </div>
                   <span className="text-sm font-medium text-[#64748b] leading-relaxed ml-2">
                     I agree to Pustak Maza's <Link to="/terms" className="text-[#1e293b] font-bold hover:text-primary-600 hover:underline transition-colors">Terms of Service</Link> and <Link to="/privacy" className="text-[#1e293b] font-bold hover:text-primary-600 hover:underline transition-colors">Privacy Policy</Link>.
                   </span>
                 </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full relative overflow-hidden group bg-primary-600 text-white font-bold py-4 rounded-2xl shadow-[0_8px_20px_-6px_rgba(106,13,173,0.5)] hover:shadow-[0_12px_25px_-6px_rgba(106,13,173,0.6)] hover:bg-primary-700 hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary-500/30 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex justify-center text-[15px] mt-2"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                <span className="flex items-center gap-2 relative z-10">
                  {isLoading ? 'Creating Account...' : 'Create Account'} 
                  {!isLoading && <ChevronRight size={18} className="group-hover:translate-x-1.5 transition-transform duration-300" />}
                </span>
              </button>

               <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-400 font-semibold tracking-wide uppercase text-xs">Or join with</span>
                </div>
              </div>

              <div id="google-signup-btn" className="w-full flex justify-center mt-2"></div>
            </form>

            <div className="mt-8 text-center lg:text-left">
              <p className="text-[#64748b] font-medium text-[15px]">
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-primary-600 hover:text-primary-800 transition-colors relative inline-block after:content-[''] after:absolute after:w-full after:h-[2px] after:bg-primary-600 after:left-0 after:bottom-[-2px] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left lg:ml-1">
                  Sign in
                </Link>
              </p>
            </div>
            
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
