import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Wallet, ArrowUpRight, Clock, CheckCircle, XCircle, Send } from 'lucide-react';
import axios from '../../api/axios';
import useAuthStore from '../../store/authStore';
import { toast } from 'sonner';

const AuthorEarnings = () => {
  const { user, login } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [upiId, setUpiId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchEarningsData = async () => {
    try {
      const [statsRes, withdrawalsRes] = await Promise.all([
        axios.get('/royalties/stats'),
        axios.get('/royalties/withdrawals')
      ]);
      setStats(statsRes.data);
      setWithdrawals(withdrawalsRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch royalty details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarningsData();
  }, []);

  useEffect(() => {
    if (user) {
      setBankName(user.bankName || '');
      setAccountNumber(user.accountNumber || '');
      setIfscCode(user.ifscCode || '');
      setUpiId(user.upiId || '');
    }
  }, [user]);

  const handleWithdrawRequest = async (e) => {
    e.preventDefault();
    const amountNum = parseFloat(withdrawAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return toast.error('Enter a valid amount');
    }

    if (amountNum > (stats?.walletBalance || 0)) {
      return toast.error('Insufficient wallet balance');
    }

    setSubmitting(true);
    try {
      await axios.post('/royalties/withdraw', {
        amount: amountNum,
        bankName,
        accountNumber,
        ifscCode,
        upiId
      });

      toast.success('Withdrawal request submitted successfully!');
      
      // Update local and store user state
      if (user) {
        login({
          ...user,
          walletBalance: (user.walletBalance || 0) - amountNum
        });
      }

      setWithdrawAmount('');
      setBankName('');
      setAccountNumber('');
      setIfscCode('');
      setUpiId('');
      fetchEarningsData(); // refresh list
    } catch (err) {
      toast.error(err.response?.data?.message || 'Withdrawal request failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-xl font-bold animate-pulse text-white">Syncing Wallet & Royalty Statements...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-poppins font-black text-white tracking-tight">Royalty Wallet</h1>
        <p className="text-slate-500 text-sm font-medium mt-0.5">Manage your publisher royalties and withdraw your earnings securely.</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-primary-950/40 to-slate-900 border border-primary-500/20 rounded-3xl p-6 flex items-center justify-between shadow-2xl relative overflow-hidden group">
          <div className="z-10">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Available Balance</p>
            <p className="text-3xl font-black text-white">₹{stats?.walletBalance?.toLocaleString() || '0'}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-primary-500/10 text-primary-400 flex items-center justify-center z-10">
            <Wallet size={24} />
          </div>
          <DollarSign className="absolute -right-6 -bottom-6 text-primary-500/5 group-hover:scale-105 transition-transform" size={120} />
        </div>

        <div className="bg-[#0d1526] border border-white/[0.06] rounded-3xl p-6 flex items-center justify-between shadow-2xl relative overflow-hidden group">
          <div className="z-10">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Lifetime Earnings</p>
            <p className="text-3xl font-black text-white">₹{stats?.lifetimeEarnings?.toLocaleString() || '0'}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center z-10">
            <ArrowUpRight size={24} />
          </div>
          <DollarSign className="absolute -right-6 -bottom-6 text-emerald-500/5 group-hover:scale-105 transition-transform" size={120} />
        </div>

        <div className="bg-[#0d1526] border border-white/[0.06] rounded-3xl p-6 flex items-center justify-between shadow-2xl relative overflow-hidden group">
          <div className="z-10">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Total Sales</p>
            <p className="text-3xl font-black text-white">{stats?.salesCount || 0} Units</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center z-10">
             <DollarSign size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Withdraw Request Form */}
        <div className="bg-[#0d1526] border border-white/[0.06] rounded-3xl p-6 sm:p-8">
          <h2 className="text-lg font-poppins font-bold text-white mb-6">Request Payout</h2>
          <form onSubmit={handleWithdrawRequest} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Amount to Withdraw (₹)</label>
              <input
                type="number"
                required
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="e.g. 5000"
                className="w-full bg-[#111a2e] border border-white/[0.06] rounded-xl px-4 py-3.5 mt-1.5 text-white font-bold placeholder-slate-600 focus:outline-none focus:border-primary-500"
              />
            </div>

            <div className="border-t border-white/[0.04] pt-4 mt-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Payout Method Details</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Bank Name</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="SBI, HDFC, etc."
                    className="w-full bg-[#111a2e] border border-white/[0.06] rounded-xl px-4 py-3 mt-1 text-white text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Account Number</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="1234567890"
                    className="w-full bg-[#111a2e] border border-white/[0.06] rounded-xl px-4 py-3 mt-1 text-white text-sm font-medium"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">IFSC Code</label>
                  <input
                    type="text"
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value)}
                    placeholder="SBIN0001234"
                    className="w-full bg-[#111a2e] border border-white/[0.06] rounded-xl px-4 py-3 mt-1 text-white text-sm font-medium"
                  />
                </div>
                <div className="sm:col-span-2">
                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-white/[0.04]"></div>
                    <span className="flex-shrink mx-4 text-slate-500 text-[10px] font-bold uppercase">OR</span>
                    <div className="flex-grow border-t border-white/[0.04]"></div>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">UPI ID</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="username@okaxis"
                    className="w-full bg-[#111a2e] border border-white/[0.06] rounded-xl px-4 py-3 mt-1 text-white text-sm font-medium"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3.5 rounded-xl mt-6 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-600/20 disabled:opacity-50"
            >
              <Send size={16} /> {submitting ? 'Submitting...' : 'Request Withdrawal'}
            </button>
          </form>
        </div>

        {/* Payout Logs */}
        <div className="bg-[#0d1526] border border-white/[0.06] rounded-3xl p-6 sm:p-8 flex flex-col">
          <h2 className="text-lg font-poppins font-bold text-white mb-6">Payout History</h2>
          <div className="space-y-4 flex-grow overflow-y-auto max-h-[460px] pr-2">
            {withdrawals.length === 0 ? (
              <div className="text-center py-20 text-slate-500 font-medium">No payout requests submitted yet.</div>
            ) : (
              withdrawals.map((withdraw) => (
                <div key={withdraw._id} className="flex items-center justify-between p-4 border border-white/[0.04] bg-white/[0.01] rounded-2xl">
                  <div className="space-y-1">
                    <p className="text-white font-bold text-sm">₹{withdraw.amount.toLocaleString()}</p>
                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                      Requested: {new Date(withdraw.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    {withdraw.status === 'pending' && (
                      <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/10">
                        <Clock size={12} /> Pending
                      </span>
                    )}
                    {withdraw.status === 'approved' && (
                      <span className="inline-flex items-center gap-1 bg-green-500/10 text-green-400 text-xs font-bold px-3 py-1 rounded-full border border-green-500/10">
                        <CheckCircle size={12} /> Approved
                      </span>
                    )}
                    {withdraw.status === 'rejected' && (
                      <span className="inline-flex items-center gap-1 bg-red-500/10 text-red-400 text-xs font-bold px-3 py-1 rounded-full border border-red-500/10">
                        <XCircle size={12} /> Rejected
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Accrued Royalties Table / History */}
      <div className="bg-[#0d1526] border border-white/[0.06] rounded-3xl p-6 sm:p-8">
        <h2 className="text-lg font-poppins font-bold text-white mb-6">Recent Sales & Royalties</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06] text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="pb-3 pl-2">Book Title</th>
                <th className="pb-3">Sale Date</th>
                <th className="pb-3 text-right">Sale Price</th>
                <th className="pb-3 text-right">Royalty Split</th>
                <th className="pb-3 text-right pr-2">Your Earnings (25%)</th>
              </tr>
            </thead>
            <tbody>
              {stats?.history?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-slate-500 font-medium">No sales recorded yet.</td>
                </tr>
              ) : (
                stats?.history?.map((item) => (
                  <tr key={item._id} className="border-b border-white/[0.03] text-sm hover:bg-white/[0.01]">
                    <td className="py-4 pl-2 text-white font-bold">{item.book?.title || 'Unknown Title'}</td>
                    <td className="py-4 text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td className="py-4 text-right text-slate-400">₹{item.salesPrice}</td>
                    <td className="py-4 text-right text-slate-400">{item.royaltyPercentage}%</td>
                    <td className="py-4 text-right text-emerald-400 font-bold pr-2">₹{item.royaltyAmount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AuthorEarnings;
