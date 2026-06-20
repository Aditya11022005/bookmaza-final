import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, BookOpen, ShieldCheck, Download, CreditCard, Wallet, Play } from 'lucide-react';
import useOrderStore from '../store/orderStore';
import usePageMeta from '../hooks/usePageMeta';

const OrderSuccess = () => {
  usePageMeta('Order Confirmed', 'Your Pustak Maza order has been placed successfully. Access your digital books or track your shipment.');
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('id');
  const navigate = useNavigate();
  const { orders } = useOrderStore();
  
  const order = orders.find(o => o.id === orderId);

  useEffect(() => {
     window.scrollTo(0, 0);
  }, []);

  if (!order) {
     return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] font-inter">
           <div className="text-center">
              <h1 className="text-2xl font-black mb-2 text-[#1e293b]">Order Validation Failed</h1>
              <p className="text-gray-500 mb-6">Could not locate transaction payload.</p>
              <button onClick={() => navigate('/shop')} className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold">Return to Shop</button>
           </div>
        </div>
     );
  }

  const hasDigital = order.items.some(i => i.format === 'Ebook' || i.format === 'Audiobook');
  const hasPhysical = order.items.some(i => i.format === 'hardcopy' || i.format === 'Hardcover' || i.format === 'Paperback');

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 30 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col items-center justify-center py-12 px-4 relative overflow-hidden font-inter">
      
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-400/20 blur-[150px] rounded-full pointer-events-none mix-blend-multiply"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-400/10 blur-[120px] rounded-full pointer-events-none mix-blend-multiply"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] pointer-events-none"></div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-3xl relative z-10"
      >
         
         <div className="bg-white rounded-[3rem] p-8 md:p-12 lg:p-14 text-center shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] border border-[#e2e8f0] relative overflow-hidden">
            
            {/* Success Ring Animation */}
            <motion.div 
              variants={itemVariants}
              className="w-28 h-28 mx-auto mb-8 relative flex items-center justify-center group"
            >
               <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-30"></div>
               <div className="absolute inset-2 bg-emerald-50 rounded-full border border-emerald-100 flex items-center justify-center shadow-inner"></div>
               <motion.div 
                 initial={{ scale: 0, rotate: -45 }} 
                 animate={{ scale: 1, rotate: 0 }} 
                 transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.3 }}
                 className="relative z-10 text-emerald-500 drop-shadow-sm"
               >
                 <CheckCircle size={56} strokeWidth={2.5} />
               </motion.div>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl font-poppins font-black text-[#1e293b] mb-4 tracking-tight">Payment Successful</motion.h1>
            <motion.p variants={itemVariants} className="text-lg text-[#64748b] font-medium mb-10 max-w-lg mx-auto leading-relaxed">
              Thank you for trusting Pustak Maza. Your order has been securely processed and is being finalized.
            </motion.p>

            {/* Premium Transaction Strip */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-12 bg-[#f8fafc] p-6 rounded-[2rem] border border-gray-100 relative shadow-inner">
               <div className="flex flex-col items-center">
                  <span className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-1">Transaction ID</span>
                  <span className="font-mono font-bold text-primary-600 text-lg tracking-wider bg-white px-3 py-1 rounded-lg border border-primary-100 shadow-sm">{order.id}</span>
               </div>
               <div className="hidden sm:block w-px h-12 bg-gray-200"></div>
               <div className="flex flex-col items-center">
                  <span className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-1">Amount Paid</span>
                  <span className="font-poppins font-black text-[#1e293b] text-2xl">₹{(order.totalAmount || order.total || 0).toFixed(2)}</span>
               </div>
               <div className="hidden sm:block w-px h-12 bg-gray-200"></div>
               <div className="flex flex-col items-center">
                  <span className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2">Method</span>
                  <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg border border-gray-100 shadow-sm text-sm font-bold text-[#1e293b]">
                     {order.paymentMethod === 'Card' ? <CreditCard size={16} className="text-primary-600"/> : order.paymentMethod === 'UPI' ? <Wallet size={16} className="text-primary-600"/> : <Package size={16} className="text-emerald-600"/>} 
                     {order.paymentMethod}
                  </div>
               </div>
            </motion.div>

            {/* Thumbnail Aggregation */}
            <motion.div variants={itemVariants} className="mb-12 border-t border-b border-gray-100 py-8 text-left flex flex-col items-center">
               <span className="text-[11px] font-black uppercase tracking-widest text-primary-600 mb-6 bg-primary-50 px-4 py-1.5 rounded-full border border-primary-100 inline-block">Items in this Order ({order.items.length})</span>
               <div className="flex flex-wrap justify-center gap-4">
                  {order.items.map((item, idx) => (
                     <div key={idx} className="relative group cursor-pointer w-20 h-28 shrink-0">
                        <img src={item.image} alt="cover" className="w-full h-full object-cover rounded-xl shadow-sm border border-gray-200 group-hover:scale-110 group-hover:shadow-xl group-hover:border-primary-400 transition-all duration-300 relative z-10"/>
                        <div className="absolute -bottom-2 -right-2 bg-gray-800 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center z-20 border-2 border-white shadow-md">{item.qty || item.quantity || 1}</div>
                     </div>
                  ))}
               </div>
            </motion.div>

            {/* Action Buttons Matrix */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full">
               {hasDigital && (
                  <Link to="/library" className="w-full sm:w-auto flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-4 rounded-2xl font-black shadow-[0_10px_30px_-5px_rgba(106,13,173,0.5)] hover:shadow-[0_15px_40px_-5px_rgba(106,13,173,0.6)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2 active:scale-95 group">
                     <Play size={20} className="group-hover:scale-110 transition-transform"/> Access Digital Library
                  </Link>
               )}
               {hasPhysical && !hasDigital && (
                  <Link to="/orders" className="w-full sm:w-auto flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-4 rounded-2xl font-black shadow-[0_10px_30px_-5px_rgba(106,13,173,0.5)] hover:shadow-[0_15px_40px_-5px_rgba(106,13,173,0.6)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2 active:scale-95 group">
                     <Package size={20} className="group-hover:scale-110 transition-transform"/> Track Shipment
                  </Link>
               )}
               <Link to="/shop" className="w-full sm:w-auto sm:w-64 border-2 border-[#e2e8f0] bg-white text-[#1e293b] px-8 py-4 rounded-2xl font-black hover:border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-2 transition-all active:scale-95">
                  <BookOpen size={20} className="text-gray-400"/> Continue Reading
               </Link>
            </motion.div>

         </div>

         {/* Bottom Footer Assurance */}
         <motion.div variants={itemVariants} className="mt-8 flex justify-center text-center px-4">
            <p className="text-[#64748b] text-sm font-medium max-w-md flex flex-col items-center gap-2">
               <ShieldCheck size={20} className="text-emerald-500 opacity-60"/>
               An email receipt has been sent safely to your inbox. You can manage this order directly from your Account Dashboard.
            </p>
         </motion.div>

      </motion.div>
    </div>
  );
};

export default OrderSuccess;
