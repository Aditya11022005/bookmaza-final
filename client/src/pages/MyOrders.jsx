import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, ExternalLink, BookOpen, Headphones, PackageCheck, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import useOrderStore from '../store/orderStore';
import usePageMeta from '../hooks/usePageMeta';
import axios from '../api/axios';
import { getOptimizedImageUrl } from '../utils/image';


const FormatBadge = ({ format }) => {
  if (format === 'Ebook') return <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-widest border border-blue-100"><BookOpen size={14}/> Ebook</span>;
  if (format === 'Audiobook') return <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-50 text-purple-600 text-xs font-black uppercase tracking-widest border border-purple-100"><Headphones size={14}/> Audio</span>;
  return <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-orange-50 text-orange-600 text-xs font-black uppercase tracking-widest border border-orange-100"><Package size={14}/> Print</span>;
};

const StatusBadge = ({ status }) => {
  let colorClass = 'bg-gray-50 text-gray-600 border-gray-100';
  if (status === 'Delivered' || status === 'Access Granted') {
    colorClass = 'bg-emerald-50 text-emerald-600 border-emerald-100';
  } else if (status === 'Shipped') {
    colorClass = 'bg-blue-50 text-blue-600 border-blue-100';
  } else if (status === 'Processing') {
    colorClass = 'bg-amber-50 text-amber-600 border-amber-100';
  } else if (status === 'Cancelled') {
    colorClass = 'bg-rose-50 text-rose-600 border-rose-100';
  }

  return (
    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${colorClass}`}>
      <PackageCheck size={14} /> {status}
    </span>
  );
};

const MyOrders = () => {
  usePageMeta('My Orders', 'Track and view all your past Pustak Maza orders, delivery status and purchase history.');
  const { orders } = useOrderStore();
  const [dbOrders, setDbOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axios.get('/orders/myorders');
        setDbOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);
  
  // Flatten orders into individual display items for the UI
  const displayItems = [];
  const sourceOrders = dbOrders;

  sourceOrders.forEach(order => {
    const items = order.orderItems || order.items || [];
    const orderId = order._id || order.id;
    const orderDate = order.createdAt || order.date;
    const paymentMethod = order.paymentMethod || 'Stripe';
    const status = order.status || (order.isPaid 
      ? (order.isDelivered ? 'Delivered' : 'Access Granted') 
      : (order.paymentMethod === 'COD' ? 'Processing' : 'Pending Payment'));

    items.forEach(item => {
      displayItems.push({
        guid: `${orderId}-${item.book || item._id}-${item.format}`,
        id: orderId,
        date: orderDate,
        total: (item.price || 0) * (item.qty || item.quantity || 1),
        status: status,
        format: item.format ? (item.format.charAt(0).toUpperCase() + item.format.slice(1).toLowerCase()) : 'Ebook',
        title: item.title,
        author: item.authorName || item.author || 'Pustak Maza Author',
        image: item.image,
        paymentStatus: order.isPaid ? `Paid via ${paymentMethod}` : `COD (Unpaid)`,
        originalOrder: order
      });
    });
  });

  const handleViewDetails = (id) => {
    navigate(`/orders/${id}`);
  };

  if (loading) {
     return (
        <div className="max-w-4xl text-center py-20 px-4">
           <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
           <p className="text-gray-500">Loading your orders...</p>
        </div>
     );
  }

  if (displayItems.length === 0) {
     return (
        <div className="max-w-4xl text-center py-20 px-4">
           <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
              <ShoppingBag size={48} />
           </div>
           <h2 className="text-3xl font-poppins font-black text-[#1e293b] mb-4">No Orders Yet</h2>
           <p className="text-gray-500 mb-8 max-w-sm mx-auto">Looks like you haven't placed any orders. Discover your next great read today!</p>
           <Link to="/shop" className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 text-white font-black rounded-xl hover:bg-primary-700 transition shadow-[0_8px_20px_-6px_rgba(106,13,173,0.5)]">
              Browse Books
           </Link>
        </div>
     )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl"
    >
      <div className="mb-8">
         <h1 className="text-3xl font-poppins font-black text-[#1e293b] mb-2">My Orders</h1>
         <p className="text-[#64748b]">Track your physical shipments and digital purchases.</p>
      </div>

      <div className="space-y-6">
        {displayItems.map((item, index) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
            key={item.guid} 
            className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-gray-100 hover:shadow-md transition-shadow group flex flex-col md:flex-row gap-8"
          >
             {/* Product Image */}
             <div className="w-full md:w-32 h-44 md:h-auto rounded-xl overflow-hidden shadow-sm shrink-0 border border-gray-100 bg-gray-50 flex items-center justify-center">
                <img src={getOptimizedImageUrl(item.image, 150)} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
             </div>

             {/* Order Info */}
             <div className="flex-1 flex flex-col justify-between">
                <div>
                   <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                         <span className="text-sm font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">{item.id}</span>
                         <FormatBadge format={item.format} />
                      </div>
                      <StatusBadge status={item.status} />
                   </div>
                   
                   <h3 className="text-2xl font-poppins font-bold text-[#1e293b] mb-1 leading-tight">{item.title}</h3>
                   <p className="text-[#64748b] font-medium mb-4">by <span className="text-[#1e293b] font-bold">{item.author}</span></p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-6 border-t border-gray-50">
                   <div>
                      <p className="text-sm text-gray-400 font-bold tracking-widest uppercase mb-1">Total Amount</p>
                      <p className="text-2xl font-black text-[#1e293b]">₹{item.total.toFixed(2)}</p>
                      <p className="text-xs text-gray-400 font-medium mt-1">{item.paymentStatus}</p>
                   </div>
                   <div>
                      <p className="text-sm text-gray-400 font-bold tracking-widest uppercase mb-1">Ordered On</p>
                      <p className="text-lg font-bold text-[#1e293b]">{new Date(item.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                   </div>
                   <button 
                      onClick={() => handleViewDetails(item.id)}
                      className="px-6 py-3 rounded-xl border-2 border-gray-100 font-bold text-[#1e293b] hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700 transition flex items-center justify-center gap-2"
                   >
                      <ExternalLink size={16} /> Details
                   </button>
                </div>
             </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default MyOrders;
