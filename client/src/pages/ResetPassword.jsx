import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, ChevronRight, CheckCircle2 } from 'lucide-react';
import axios from '../api/axios';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Password must be at least 6 characters.");
    if (password !== confirmPassword) return toast.error("Passwords do not match.");
    
    const email = localStorage.getItem('resetEmail');
    const otp = localStorage.getItem('resetOTP');

    if (!email || !otp) {
      return toast.error("Session expired. Please request OTP again.");
    }

    setIsLoading(true);
    
    try {
      await axios.post('/users/resetpassword', { email, otp, password });
      toast.success("Password updated successfully!");
      localStorage.removeItem('resetEmail');
      localStorage.removeItem('resetOTP');
      navigate('/login');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-[#f8fafc] p-4 sm:p-8 relative overflow-hidden">
      {/* Background Ambient Elements */}
      <div className="absolute top-[10%] left-[10%] w-[30%] h-[30%] bg-primary-200/20 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[10%] w-[20%] h-[20%] bg-primary-400/10 blur-[80px] rounded-full pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-lg bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(106,13,173,0.1)] border border-gray-100 p-8 sm:p-12 relative z-10"
      >
        <div className="flex justify-center mb-6">
           <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center shadow-sm relative">
             <Lock size={32} strokeWidth={1.5} />
             <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                <CheckCircle2 size={14} className="text-white" />
             </div>
           </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-poppins font-black text-[#1e293b] mb-3">Reset Password</h2>
          <p className="text-[#64748b] font-inter">
            Enter your new secure password below.
          </p>
        </div>

        <form onSubmit={submitHandler} className="space-y-5">
           <div className="space-y-1.5 text-left">
             <label className="text-sm font-bold text-[#334155] ml-1">New Password</label>
             <div className="relative group">
               <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#94a3b8] group-focus-within:text-primary-600 transition-colors">
                 <Lock size={20} />
               </div>
               <input
                 type={showPassword ? "text" : "password"}
                 required
                 minLength={6}
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

           <div className="space-y-1.5 text-left">
             <label className="text-sm font-bold text-[#334155] ml-1">Confirm New Password</label>
             <div className="relative group">
               <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#94a3b8] group-focus-within:text-primary-600 transition-colors">
                 <Lock size={20} />
               </div>
               <input
                 type={showConfirmPassword ? "text" : "password"}
                 required
                 minLength={6}
                 className="w-full pl-12 pr-12 py-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all font-inter text-[15px] shadow-sm shadow-gray-100/50"
                 placeholder="••••••••"
                 value={confirmPassword}
                 onChange={(e) => setConfirmPassword(e.target.value)}
               />
               <button
                 type="button"
                 onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                 className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#94a3b8] hover:text-primary-600 transition-colors focus:outline-none"
               >
                 {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
               </button>
             </div>
           </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full relative overflow-hidden group bg-primary-600 text-white font-bold py-4 rounded-xl shadow-[0_8px_20px_-6px_rgba(106,13,173,0.5)] hover:shadow-[0_12px_25px_-6px_rgba(106,13,173,0.6)] hover:bg-primary-700 hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary-500/30 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex justify-center text-[15px] mt-2"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
            <span className="flex items-center gap-2 relative z-10">
              {isLoading ? 'Updating...' : 'Update Password'} 
              {!isLoading && <ChevronRight size={18} className="group-hover:translate-x-1.5 transition-transform duration-300" />}
            </span>
          </button>
        </form>

      </motion.div>
    </div>
  );
};

export default ResetPassword;
