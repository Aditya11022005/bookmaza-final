import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, Users, ShoppingBag, UserCog,
  TrendingUp, TrendingDown, ArrowRight,
  Package, CheckCircle2, Clock, XCircle,
  Star, Eye, Loader, IndianRupee
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';

// Tiny SVG sparkline
const Sparkline = ({ data, up }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const h = 36;
  const w = 80;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * h;
    return `${x},${y}`;
  }).join(' ');
  const color = up ? '#34d399' : '#f87171';
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="opacity-80">
      <polyline fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={pts} />
    </svg>
  );
};

// SVG Doughnut Chart for Order Status
const DoughnutChart = ({ data, total }) => {
  let cumulativePercent = 0;

  const getCoordinatesForPercent = (percent) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg viewBox="-1 -1 2 2" className="w-full h-full transform -rotate-90">
        {data.map((slice) => {
          if (slice.pct === 0) return null;
          const startPercent = cumulativePercent;
          const [startX, startY] = getCoordinatesForPercent(startPercent);
          cumulativePercent += slice.pct / 100;
          const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
          
          const largeArcFlag = slice.pct > 50 ? 1 : 0;
          const pathData = [
            `M ${startX} ${startY}`, // Move
            `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`, // Arc
            `L 0 0`, // Line
          ].join(' ');

          return (
            <motion.path
              key={slice.label}
              d={pathData}
              fill={slice.hex}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="hover:opacity-80 transition-opacity cursor-pointer stroke-[#0d1526] stroke-[0.05]"
            />
          );
        })}
        {/* Inner circle for doughnut effect */}
        <circle cx="0" cy="0" r="0.65" fill="#0d1526" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-white font-black text-xl">{total}</span>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Orders</span>
      </div>
    </div>
  );
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const statusColors = {
  Delivered: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  Paid: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  Processing: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  Pending: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  Cancelled: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
};

const AdminDashboard = () => {
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [booksRes, usersRes, ordersRes] = await Promise.all([
          axios.get('/books?all=true'),
          axios.get('/users'),
          axios.get('/orders')
        ]);
        setBooks(booksRes.data);
        setUsers(usersRes.data);
        setOrders(ordersRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader className="animate-spin text-primary-600" size={40} />
        <span className="text-slate-500 font-bold text-sm uppercase tracking-wider">Loading Dashboard Metrics...</span>
      </div>
    );
  }

  const totalBooks = books.length;
  const totalAuthors = users.filter(u => u.role === 'author').length;
  const totalOrders = orders.length;
  const totalUsers = users.filter(u => u.role === 'customer').length;

  const paidOrders = orders.filter(o => o.isPaid);
  const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  const recentOrders = orders.slice(0, 5);
  const recentBooks = [...books].reverse().slice(0, 4);

  // Status breakdown
  const deliveredCount = orders.filter(o => o.isDelivered).length;
  const paidProcessingCount = orders.filter(o => o.isPaid && !o.isDelivered).length;
  const unpaidCount = orders.filter(o => !o.isPaid).length;

  const deliveredPct = totalOrders ? Math.round((deliveredCount / totalOrders) * 100) : 0;
  const processingPct = totalOrders ? Math.round((paidProcessingCount / totalOrders) * 100) : 0;
  const unpaidPct = totalOrders ? (100 - deliveredPct - processingPct) : 0;

  const orderStatus = [
    { label: 'Delivered', count: deliveredCount, pct: deliveredPct, color: 'bg-emerald-500', hex: '#10b981' },
    { label: 'Processing', count: paidProcessingCount, pct: processingPct, color: 'bg-amber-400', hex: '#fbbf24' },
    { label: 'Unpaid / Pending', count: unpaidCount, pct: unpaidPct, color: 'bg-rose-500', hex: '#f43f5e' },
  ];

  const STATS = [
    {
      label: 'Total Books',
      value: totalBooks,
      change: `+${books.filter(b => {
        const createdDate = new Date(b.createdAt);
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        return createdDate > oneMonthAgo;
      }).length}`,
      changeLabel: 'this month',
      up: true,
      icon: BookOpen,
      color: 'from-violet-600 to-purple-700',
      bg: 'bg-violet-500/10',
      text: 'text-violet-400',
      sparkline: [40, 55, 45, 60, 75, 65, 80, 90, 85, 100],
    },
    {
      label: 'Total Authors',
      value: totalAuthors,
      change: '+0',
      changeLabel: 'this month',
      up: true,
      icon: Users,
      color: 'from-sky-600 to-blue-700',
      bg: 'bg-sky-500/10',
      text: 'text-sky-400',
      sparkline: [30, 40, 35, 50, 45, 55, 60, 65, 55, 70],
    },
    {
      label: 'Total Orders',
      value: totalOrders,
      change: `+${orders.length}`,
      changeLabel: 'all time',
      up: true,
      icon: ShoppingBag,
      color: 'from-emerald-600 to-teal-700',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      sparkline: [60, 70, 65, 80, 75, 90, 85, 95, 100, 110],
    },
    {
      label: 'Total Users',
      value: totalUsers,
      change: `+${users.filter(u => {
        const createdDate = new Date(u.createdAt);
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        return u.role === 'customer' && createdDate > oneMonthAgo;
      }).length}`,
      changeLabel: 'this month',
      up: true,
      icon: UserCog,
      color: 'from-rose-600 to-pink-700',
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      sparkline: [30, 40, 50, 60, 65, 70, 75, 85, 90, 100],
    },
  ];

  return (
    <div className="space-y-8 pb-10">

      {/* ── Page header ─────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-poppins font-black text-white tracking-tight">Dashboard</h1>
          <p className="text-slate-500 text-sm font-medium mt-0.5">{today}</p>
        </div>
        <span className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-lg">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Platform Live
        </span>
      </motion.div>

      {/* ── Stat Cards ──────────────────────────────────────── */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} variants={fadeUp} className="relative bg-[#0d1526] border border-white/[0.06] rounded-2xl p-6 overflow-hidden hover:border-white/[0.12] transition-all group">
              <div className={`absolute top-0 right-0 w-28 h-28 bg-gradient-to-br ${stat.color} opacity-10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none`} />

              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 ${stat.bg} rounded-xl flex items-center justify-center`}>
                  <Icon size={22} className={stat.text} />
                </div>
                <Sparkline data={stat.sparkline} up={stat.up} />
              </div>

              <p className="text-slate-500 text-[12px] font-bold uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-3xl font-poppins font-black text-white mb-3">{stat.value}</p>

              <div className="flex items-center gap-1.5 text-[12px] font-bold">
                {stat.up ? (
                  <TrendingUp size={13} className="text-emerald-400" />
                ) : (
                  <TrendingDown size={13} className="text-rose-400" />
                )}
                <span className={stat.up ? 'text-emerald-400' : 'text-rose-400'}>{stat.change}</span>
                <span className="text-slate-600">{stat.changeLabel}</span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ── Charts Row ──────────────────────────────────────── */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Revenue bar chart */}
        <motion.div variants={fadeUp} className="lg:col-span-2 bg-[#0d1526] border border-white/[0.06] rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-white font-poppins font-bold text-[15px]">Revenue Overview</h2>
              <p className="text-slate-500 text-xs font-medium mt-0.5">Total accrued paid sales revenue</p>
            </div>
            <span className="text-emerald-400 font-black text-xl flex items-center gap-1">
              <IndianRupee size={18} /> {totalRevenue.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex items-end gap-3 h-40 pt-4">
            {/* Displaying simple status visual block */}
            <div className="w-full flex gap-2">
              <div className="bg-emerald-500/20 border border-emerald-500/30 p-4 rounded-xl flex-1 text-center">
                <span className="text-slate-400 text-xs font-bold block mb-1">Delivered Sales</span>
                <span className="text-emerald-400 font-black text-lg">
                  ₹{orders.filter(o => o.isDelivered && o.isPaid).reduce((s, o) => s + o.totalPrice, 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="bg-amber-500/20 border border-amber-500/30 p-4 rounded-xl flex-1 text-center">
                <span className="text-slate-400 text-xs font-bold block mb-1">Processing Sales</span>
                <span className="text-amber-400 font-black text-lg">
                  ₹{orders.filter(o => !o.isDelivered && o.isPaid).reduce((s, o) => s + o.totalPrice, 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-white/[0.05] flex items-center gap-2 text-xs text-slate-600 font-medium">
            <TrendingUp size={13} className="text-emerald-400" />
            Live payment analytics synced with payment gateways.
          </div>
        </motion.div>

        {/* Order status with Pie Chart */}
        <motion.div variants={fadeUp} className="bg-[#0d1526] border border-white/[0.06] rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-white font-poppins font-bold text-[15px] mb-1">Order Status</h2>
            <p className="text-slate-500 text-xs font-medium mb-6">Distribution of {totalOrders} total orders</p>
          </div>

          <div className="flex-1 flex flex-col justify-center mb-6">
            <DoughnutChart data={orderStatus} total={totalOrders} />
          </div>

          <div className="space-y-3">
            {orderStatus.map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${s.color}`} />
                  <span className="text-slate-400 text-sm font-semibold">{s.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-white font-bold">{s.count}</span>
                  <span className="text-[10px] text-slate-500 font-bold w-8 text-right">{s.pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* ── Recent Orders ────────────────────────────────────── */}
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-poppins font-bold text-[15px]">Recent Orders</h2>
        </div>
        <div className="bg-[#0d1526] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['Order ID', 'Customer', 'Items Count', 'Paid Status', 'Amount', 'Delivery Status', 'Date'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-[10px] font-black text-slate-600 uppercase tracking-widest whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.length > 0 ? (
                  recentOrders.map((order, i) => (
                    <motion.tr
                      key={order._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-5 py-4 text-primary-400 font-mono text-xs whitespace-nowrap">
                        {order._id.substring(order._id.length - 8).toUpperCase()}
                      </td>
                      <td className="px-5 py-4 text-slate-300 text-sm font-medium whitespace-nowrap">
                        {order.user?.name || 'Guest User'}
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-sm font-medium">
                        {order.orderItems?.length || 0} Books
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border
                          ${order.isPaid ? statusColors.Paid : statusColors.Pending}`}>
                          {order.isPaid ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-white font-bold text-sm whitespace-nowrap">
                        ₹{order.totalPrice}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border
                          ${order.isDelivered ? statusColors.Delivered : statusColors.Processing}`}>
                          {order.isDelivered ? 'Delivered' : 'Processing'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-600 text-xs font-medium whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-5 py-12 text-center text-slate-500 font-medium">
                      No orders placed yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* ── Recent Books ─────────────────────────────────────── */}
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-poppins font-bold text-[15px]">Recent Books</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {recentBooks.length > 0 ? (
            recentBooks.map((book, i) => (
              <motion.div
                key={book._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.07 }}
                className="group bg-[#0d1526] border border-white/[0.06] rounded-2xl p-4 flex gap-4 hover:border-white/[0.14] transition-all"
              >
                <div className="w-14 h-20 rounded-xl overflow-hidden shrink-0 bg-white/5 border border-white/[0.06] shadow-lg">
                  <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="min-w-0 flex flex-col justify-between flex-grow">
                  <div>
                    <p className="text-white font-bold text-sm leading-tight truncate">{book.title}</p>
                    <p className="text-slate-500 text-xs font-medium mt-0.5 truncate">By {book.authorName || 'Unknown'}</p>
                    <span className="inline-block mt-1.5 text-[9px] font-black uppercase tracking-widest bg-primary-500/10 text-primary-400 border border-primary-500/20 px-2 py-0.5 rounded">
                      {book.category?.name || 'Uncategorized'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-white font-black text-sm">
                      ₹{book.formats?.hardcopy?.price || book.formats?.ebook?.price || 0}
                    </span>
                    <span className="flex items-center gap-1 text-amber-400 text-[11px] font-bold">
                      <Star size={10} fill="currentColor" /> {book.rating || 4.5}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full bg-[#0d1526] border border-white/[0.06] p-8 text-center text-slate-500 font-medium rounded-2xl">
              No books registered.
            </div>
          )}
        </div>
      </motion.div>

    </div>
  );
};

export default AdminDashboard;
