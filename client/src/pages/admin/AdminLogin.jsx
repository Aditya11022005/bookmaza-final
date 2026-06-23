import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, AlertCircle, ChevronRight, BookOpen } from 'lucide-react';
import useAdminAuthStore from '../../store/adminAuthStore';
import usePageMeta from '../../hooks/usePageMeta';

const AdminLogin = () => {
  usePageMeta('Admin Login | Pustak Maza', 'Secure admin login for Pustak Maza administrators.', true);

  const { admin, login } = useAdminAuthStore();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Already logged in → go to dashboard
  if (admin) return <Navigate to="/admin/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(form.email, form.password);
      if (result.success) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        setError(result.message);
        setLoading(false);
      }
    } catch (err) {
      setError('An error occurred during authentication.');
      setLoading(false);
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
          <div className="absolute inset-0 bg-gradient-to-br from-[#1e1b4b] via-[#311066] to-[#0f172a] z-0"></div>
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
                 <span className="text-xs font-bold text-white/80 uppercase tracking-widest">Secure Admin Access</span>
              </div>
              <h1 className="text-4xl xl:text-5xl font-poppins font-extrabold leading-[1.15] text-white mb-6">
                System<br/>Control &<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-100 to-primary-300">Management.</span>
              </h1>
              <p className="text-lg text-primary-50/80 font-inter leading-relaxed max-w-sm">
                Access system settings, manage books, users, categories, track withdrawals, royalty rates, and platform operations.
              </p>
            </motion.div>
          </div>

          {/* Warning / Notice */}
          <div className="relative z-10 p-6 rounded-3xl bg-red-500/10 border border-red-500/20 backdrop-blur-sm">
            <p className="text-white/80 text-sm font-semibold font-inter leading-relaxed flex items-center gap-2">
               <AlertCircle size={16} className="text-red-400 shrink-0"/> Restricted Access Notice
            </p>
            <p className="text-white/60 text-xs font-bold mt-2 font-inter">Authorized administrative personnel only. All access attempts are logged and monitored.</p>
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
              <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mb-5 mx-auto lg:mx-0 border border-primary-100 shadow-inner">
                <ShieldCheck size={28} className="text-primary-600" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-poppins font-black text-[#1e293b] mb-3">Admin Portal</h2>
              <p className="text-[#64748b] font-inter text-lg">Sign in to control dashboard operations</p>
            </motion.div>

            {/* Error Banner */}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-50 border border-red-150 text-red-700 rounded-xl px-4 py-3 mb-6 flex items-center gap-3 text-sm font-bold"
              >
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Form Fields */}
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-[#334155] ml-1">Admin Email Address</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#94a3b8] group-focus-within:text-primary-600 transition-colors">
                      <Mail size={20} />
                    </div>
                    <input
                      id="admin-email"
                      type="email"
                      required
                      autoComplete="email"
                      className="w-full pl-12 pr-4 py-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all font-inter text-[15px] shadow-sm shadow-gray-100/50"
                      placeholder="admin@pustakmaza.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
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
                      id="admin-password"
                      type={showPass ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      className="w-full pl-12 pr-12 py-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all font-inter text-[15px] shadow-sm shadow-gray-100/50"
                      placeholder="Enter admin password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#94a3b8] hover:text-primary-600 transition-colors focus:outline-none"
                    >
                      {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full relative overflow-hidden group bg-[#1e293b] text-white font-bold py-4 rounded-2xl shadow-[0_8px_20px_-6px_rgba(30,41,59,0.5)] hover:shadow-[0_12px_25px_-6px_rgba(30,41,59,0.6)] hover:bg-[#111827] hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary-500/30 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex justify-center text-[15px]"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                <span className="flex items-center gap-2 relative z-10">
                  {loading ? 'Authenticating...' : 'Sign In to Dashboard'} 
                  {!loading && <ChevronRight size={18} className="group-hover:translate-x-1.5 transition-transform duration-300" />}
                </span>
              </button>
            </form>


            
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
