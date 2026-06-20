import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, DollarSign, Award, TrendingUp, Plus, FileText, Download, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import useAuthStore from '../../store/authStore';
import { toast } from 'sonner';

const AuthorDashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [booksCount, setBooksCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      try {
        const [statsRes, booksRes] = await Promise.all([
          axios.get('/royalties/stats'),
          axios.get(`/books?author=${user._id}&all=true`)
        ]);
        setStats(statsRes.data);
        setBooksCount(booksRes.data.length);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader className="animate-spin text-primary-600" size={32} />
        <span className="text-slate-500 font-bold text-sm uppercase tracking-wider">Loading dashboard...</span>
      </div>
    );
  }

  // Calculate certificates dynamically
  const certificates = [];
  if (booksCount >= 1) {
    certificates.push({
      id: 'debut',
      title: 'Debut Author Award',
      desc: 'Awarded for publishing your first title on Pustak Maza.',
      icon: BookOpen,
      color: 'text-blue-400',
      border: 'border-blue-500/20',
      bg: 'bg-blue-500/5'
    });
  }
  if ((stats?.lifetimeEarnings || 0) >= 5000 || (stats?.salesCount || 0) >= 10) {
    certificates.push({
      id: 'bestseller',
      title: 'Bestseller Award',
      desc: 'Awarded for crossing major sales milestones on Pustak Maza.',
      icon: Award,
      color: 'text-amber-400',
      border: 'border-amber-500/20',
      bg: 'bg-amber-500/5'
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-poppins font-black text-white tracking-tight">Author Overview</h1>
          <p className="text-slate-500 text-sm font-medium mt-0.5">Welcome back, {user?.name || 'Author'}! Here's your publishing summary.</p>
        </div>
        <Link to="/author/upload" className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-600/30">
          <Plus size={18} />
          Publish New Book
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0d1526] border border-white/[0.06] rounded-2xl p-5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
            <BookOpen size={20} />
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Books Published</p>
          <p className="text-2xl font-black text-white">{booksCount}</p>
        </div>
        <div className="bg-[#0d1526] border border-white/[0.06] rounded-2xl p-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
            <DollarSign size={20} />
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Wallet Balance</p>
          <p className="text-2xl font-black text-white">₹{stats?.walletBalance?.toLocaleString() || '0'}</p>
        </div>
        <div className="bg-[#0d1526] border border-white/[0.06] rounded-2xl p-5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
            <TrendingUp size={20} />
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Lifetime Earnings</p>
          <p className="text-2xl font-black text-white">₹{stats?.lifetimeEarnings?.toLocaleString() || '0'}</p>
        </div>
        <div className="bg-[#0d1526] border border-white/[0.06] rounded-2xl p-5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
            <Award size={20} />
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Total Sales</p>
          <p className="text-2xl font-black text-white">{stats?.salesCount || 0} Units</p>
        </div>
      </div>

      {/* Royalties Breakdown */}
      <h2 className="text-lg font-poppins font-bold text-white pt-2">Royalties Breakdown</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-emerald-900/30 to-[#0d1526] border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
          <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1">Monthly Earnings</p>
          <p className="text-3xl font-black text-white">₹{stats?.monthlyEarnings?.toLocaleString() || '0'}</p>
          <p className="text-slate-400 text-xs mt-2">
            Royalty earnings accumulated in the last 30 days.
          </p>
          <DollarSign className="absolute -right-4 -bottom-4 text-emerald-500/10 group-hover:scale-110 transition-transform" size={100} />
        </div>
        <div className="bg-gradient-to-br from-purple-900/30 to-[#0d1526] border border-purple-500/20 rounded-2xl p-6 relative overflow-hidden group hover:border-purple-500/40 transition-colors">
          <p className="text-purple-400 text-xs font-bold uppercase tracking-widest mb-1">Lifetime Earnings</p>
          <p className="text-3xl font-black text-white">₹{stats?.lifetimeEarnings?.toLocaleString() || '0'}</p>
          <p className="text-slate-400 text-xs mt-2">
            Total historical royalty earnings split since registration.
          </p>
          <DollarSign className="absolute -right-4 -bottom-4 text-purple-500/10 group-hover:scale-110 transition-transform" size={100} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sales Activity */}
        <div className="lg:col-span-2 bg-[#0d1526] border border-white/[0.06] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-poppins font-bold text-white">Recent Sales Activity</h2>
            <Link to="/author/earnings" className="text-sm font-bold text-primary-400 hover:text-primary-300">View Earnings</Link>
          </div>
          <div className="space-y-4">
            {stats?.history?.slice(0, 4).map((item) => (
              <div key={item._id} className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.02] transition-colors">
                <div className="w-10 h-10 bg-primary-500/10 rounded-lg flex items-center justify-center text-primary-400 shrink-0">
                  <BookOpen size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-sm truncate">{item.book?.title || 'Unknown Title'}</h3>
                  <p className="text-slate-500 text-xs mt-0.5">Sale Price: ₹{item.salesPrice} • Date: {new Date(item.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-emerald-400 font-bold text-sm">+₹{item.royaltyAmount}</p>
                  <p className="text-slate-500 text-[10px] uppercase tracking-wider font-bold">Royalty ({item.royaltyPercentage}%)</p>
                </div>
              </div>
            ))}
            {(!stats?.history || stats.history.length === 0) && (
              <div className="text-center py-12 text-slate-500 font-medium">No sales recorded yet.</div>
            )}
          </div>
        </div>

        {/* Certificates & Achievements */}
        <div className="bg-[#0d1526] border border-white/[0.06] rounded-2xl p-6">
          <h2 className="text-lg font-poppins font-bold text-white mb-6">My Achievements</h2>
          
          <div className="space-y-4">
            {certificates.map((cert) => {
              const Icon = cert.icon;
              return (
                <div key={cert.id} className={`p-4 rounded-xl border ${cert.border} ${cert.bg} relative overflow-hidden group`}>
                  <div className="absolute -right-4 -bottom-4 opacity-10 transform group-hover:scale-110 transition-transform">
                    <Icon size={80} className={cert.color} />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                      <Icon size={20} className={cert.color} />
                      <h3 className={`${cert.color} font-bold text-sm`}>{cert.title}</h3>
                    </div>
                    <p className="text-slate-400 text-xs mb-4">{cert.desc}</p>
                    <button 
                      onClick={() => window.print()}
                      className={`flex items-center gap-2 text-xs font-bold text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors border ${cert.border}`}
                    >
                      <Download size={14} /> Print Certificate
                    </button>
                  </div>
                </div>
              );
            })}
            {certificates.length === 0 && (
              <div className="text-center py-12 text-slate-500 font-medium border border-dashed border-white/10 rounded-2xl">
                Publish a book to earn your debut certificate!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorDashboard;
