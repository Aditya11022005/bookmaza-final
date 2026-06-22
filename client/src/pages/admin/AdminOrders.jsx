import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Eye, Filter, CheckCircle2, Clock, XCircle, Truck, Loader, X, Calendar, MapPin, CreditCard, ShoppingBag, Mail, Phone, User as UserIcon } from 'lucide-react';
import axios from '../../api/axios';
import { toast } from 'sonner';

const statusConfig = {
  Delivered: { icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  Paid: { icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  Processing: { icon: Clock, color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
  Pending: { icon: Clock, color: 'text-slate-400 bg-slate-400/10 border-slate-400/20' },
  Shipped: { icon: Truck, color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  Cancelled: { icon: XCircle, color: 'text-rose-400 bg-rose-400/10 border-rose-400/20' },
};

const StatusBadge = ({ status }) => {
  const { icon: Icon, color } = statusConfig[status] || statusConfig.Processing;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${color}`}>
      <Icon size={12} />
      {status}
    </span>
  );
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courierPartner, setCourierPartner] = useState('Shiprocket');
  const [historyDescription, setHistoryDescription] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'hardcopy' | 'ebook' | 'audiobook'

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get('/orders');
      setOrders(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleMarkAsPaid = async (orderId) => {
    try {
      await axios.put(`/orders/${orderId}/pay`, {});
      toast.success('Order marked as paid successfully!');
      
      // Update local selectedOrder if it is currently open
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(prev => ({
          ...prev,
          isPaid: true,
          paidAt: new Date().toISOString()
        }));
      }
      fetchOrders();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update order to paid');
    }
  };

  const handleUpdateStatus = async (orderId, nextStatus, trackNum = '', courier = 'Shiprocket', desc = '') => {
    try {
      const { data } = await axios.put(`/orders/${orderId}/deliver`, { 
        status: nextStatus, 
        trackingNumber: trackNum,
        courierPartner: courier,
        historyDescription: desc
      });
      toast.success(desc ? 'Tracking log added successfully!' : `Order status updated to ${nextStatus} successfully!`);
      
      // Update local selectedOrder if it is currently open
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(prev => ({
          ...prev,
          status: nextStatus,
          isDelivered: nextStatus === 'Delivered',
          deliveredAt: nextStatus === 'Delivered' ? new Date().toISOString() : prev.deliveredAt,
          trackingNumber: trackNum,
          courierPartner: courier,
          trackingHistory: data.trackingHistory || []
        }));
      }
      setHistoryDescription('');
      fetchOrders();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const filteredOrders = orders.filter(o => {
    const searchMatch = 
      (o._id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!searchMatch) return false;

    if (activeTab === 'all') return true;
    return o.orderItems?.some(item => (item.format || '').toLowerCase() === activeTab);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-poppins font-black text-white tracking-tight">Orders Management</h1>
          <p className="text-slate-500 text-sm font-medium mt-0.5">Track, update and fulfill customer orders</p>
        </div>
      </div>

      {/* Format Categories Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/[0.06] pb-1">
        {[
          { id: 'all', label: 'All Orders', count: orders.length },
          { id: 'hardcopy', label: '📖 Hardcopy (Physical)', count: orders.filter(o => o.orderItems?.some(i => (i.format || '').toLowerCase() === 'hardcopy')).length },
          { id: 'ebook', label: '💻 E-Book', count: orders.filter(o => o.orderItems?.some(i => (i.format || '').toLowerCase() === 'ebook')).length },
          { id: 'audiobook', label: '🎧 Audiobook', count: orders.filter(o => o.orderItems?.some(i => (i.format || '').toLowerCase() === 'audiobook')).length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold uppercase tracking-wider transition-all relative ${
              activeTab === tab.id
                ? 'text-primary-400 bg-white/[0.04]'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab.label}
            <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[9px] font-black ${
              activeTab === tab.id ? 'bg-primary-500/20 text-primary-300' : 'bg-slate-800 text-slate-500'
            }`}>
              {tab.count}
            </span>
            {activeTab === tab.id && (
              <motion.div 
                layoutId="activeOrderTabBorder"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" 
              />
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search orders by ID or Customer..."
            className="w-full bg-[#0d1526] border border-white/[0.06] text-white text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all placeholder:text-slate-600"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader className="animate-spin text-primary-600" size={32} />
          <span className="text-slate-500 font-bold text-sm uppercase tracking-wider">Loading orders...</span>
        </div>
      ) : (
        <div className="bg-[#0d1526] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  <th className="px-5 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Order ID</th>
                  <th className="px-5 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Date</th>
                  <th className="px-5 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Customer</th>
                  <th className="px-5 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Payment Status</th>
                  <th className="px-5 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Amount</th>
                  <th className="px-5 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Delivery Status</th>
                  <th className="px-5 py-4 text-right text-[11px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order, i) => (
                    <motion.tr
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      key={order._id}
                      className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="px-5 py-4 text-primary-400 font-mono text-xs whitespace-nowrap">
                        {order._id.substring(order._id.length - 8).toUpperCase()}
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-xs font-medium whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-white font-bold text-sm whitespace-nowrap">{order.user?.name || 'Guest User'}</p>
                        <p className="text-slate-500 text-xs font-medium mt-0.5">{order.orderItems?.length || 0} Books</p>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <StatusBadge status={order.isPaid ? 'Paid' : 'Pending'} />
                      </td>
                      <td className="px-5 py-4 text-white font-black text-sm whitespace-nowrap">₹{order.totalPrice}</td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <StatusBadge status={order.status || (order.isDelivered ? 'Delivered' : 'Processing')} />
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => {
                              setSelectedOrder(order);
                              setTrackingNumber(order.trackingNumber || '');
                              setCourierPartner(order.courierPartner || 'Shiprocket');
                              setHistoryDescription('');
                            }}
                            className="inline-flex items-center justify-center p-2 bg-[#1b263b] hover:bg-primary-600 text-white rounded-lg transition-colors border border-white/[0.05]"
                            title="View Details"
                          >
                            <Eye size={14} />
                          </button>
                          
                          {!order.isDelivered && (
                            <button 
                              onClick={() => {
                                setSelectedOrder(order);
                                setTrackingNumber(order.trackingNumber || '');
                                setCourierPartner(order.courierPartner || 'Shiprocket');
                                setHistoryDescription('');
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors border border-emerald-500 shadow-sm"
                            >
                              <Truck size={14} />
                              Manage
                            </button>
                          )}
                          {order.isDelivered && (
                            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider pl-2">Fulfilled</span>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-5 py-12 text-center text-slate-500 font-medium">
                      No matching orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0b1329] border border-white/[0.08] rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative text-white"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-white/[0.02]">
                <div>
                  <h2 className="text-lg font-poppins font-black flex items-center gap-2">
                    <ShoppingBag className="text-primary-400" size={20} />
                    Order Details
                  </h2>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">ID: {selectedOrder._id}</p>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Left Side: Order Items */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Order Items</h3>
                    <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
                      {selectedOrder.orderItems?.map((item) => (
                        <div key={item._id} className="flex gap-4 p-3 bg-white/[0.02] border border-white/[0.04] rounded-2xl">
                          <img src={item.image} alt={item.title} className="w-12 h-16 object-cover rounded-lg bg-slate-800" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm truncate">{item.title}</h4>
                            <p className="text-xs text-slate-400 mt-1 capitalize">Format: {item.format} • Qty: {item.qty}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-black text-sm">₹{item.price * item.qty}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">₹{item.price} each</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary Pricing */}
                  <div className="p-4 bg-white/[0.02] border border-white/[0.04] rounded-2xl space-y-2.5">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Items Subtotal</span>
                      <span>₹{selectedOrder.itemsPrice}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Shipping Price</span>
                      <span>₹{selectedOrder.shippingPrice}</span>
                    </div>
                    <div className="h-px bg-white/[0.06] my-1" />
                    <div className="flex justify-between text-sm font-black">
                      <span>Total Amount</span>
                      <span className="text-primary-400">₹{selectedOrder.totalPrice}</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Customer details & Management */}
                <div className="space-y-6">
                  {/* Customer details */}
                  <div className="p-4 bg-white/[0.02] border border-white/[0.04] rounded-2xl space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <UserIcon size={14} className="text-slate-400" />
                      Customer Details
                    </h3>
                    <div className="text-sm space-y-1.5">
                      <p className="font-bold">{selectedOrder.user?.name || 'Guest User'}</p>
                      {selectedOrder.user?.email && (
                        <p className="text-slate-400 text-xs flex items-center gap-1.5">
                          <Mail size={12} /> {selectedOrder.user.email}
                        </p>
                      )}
                      {selectedOrder.user?.phone && (
                        <p className="text-slate-400 text-xs flex items-center gap-1.5">
                          <Phone size={12} /> {selectedOrder.user.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Shipping address if hardcopy */}
                  {selectedOrder.shippingAddress && selectedOrder.shippingAddress.street && (
                    <div className="p-4 bg-white/[0.02] border border-white/[0.04] rounded-2xl space-y-2">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin size={14} className="text-slate-400" />
                        Shipping Address
                      </h3>
                      <div className="text-xs text-slate-300 leading-relaxed font-medium">
                        <p>{selectedOrder.shippingAddress.street}</p>
                        <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.zipCode}</p>
                        <p>{selectedOrder.shippingAddress.country}</p>
                      </div>
                    </div>
                  )}

                  {/* Payment and Delivery Status details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/[0.02] border border-white/[0.04] rounded-2xl space-y-2">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Payment Method</p>
                      <p className="font-bold text-sm flex items-center gap-1.5">
                        <CreditCard size={14} className="text-slate-400" />
                        {selectedOrder.paymentMethod}
                      </p>
                      <div className="pt-1">
                        <StatusBadge status={selectedOrder.isPaid ? 'Paid' : 'Pending'} />
                      </div>
                      {selectedOrder.isPaid && selectedOrder.paidAt && (
                        <p className="text-[10px] text-slate-500">Paid on {new Date(selectedOrder.paidAt).toLocaleDateString()}</p>
                      )}
                    </div>

                    <div className="p-4 bg-white/[0.02] border border-white/[0.04] rounded-2xl space-y-2">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Delivery Status</p>
                      <p className="font-bold text-sm flex items-center gap-1.5">
                        <Truck size={14} className="text-slate-400" />
                        {selectedOrder.status}
                      </p>
                      <div className="pt-1">
                        <StatusBadge status={selectedOrder.status} />
                      </div>
                    </div>
                  </div>

                  {/* Actions Section */}
                  <div className="pt-4 border-t border-white/[0.06] space-y-5">
                    {/* Pay Action */}
                    {!selectedOrder.isPaid && (
                      <div className="space-y-2">
                        <p className="text-xs text-slate-400 font-bold">Mark as Paid</p>
                        <button
                          onClick={() => handleMarkAsPaid(selectedOrder._id)}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-colors shadow-[0_4px_12px_rgba(16,185,129,0.2)]"
                        >
                          Mark Order as Paid
                        </button>
                      </div>
                    )}

                    {/* Status Management Action */}
                    {(() => {
                      const hasPhysicalItems = selectedOrder.orderItems?.some(item => item.format === 'hardcopy');
                      return (
                        <>
                          {/* Courier and Shipment Updates (Physical Only) */}
                          {hasPhysicalItems ? (
                            <div className="space-y-4 pt-4 border-t border-white/[0.06]">
                              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Shipment Dispatch Configuration</p>
                              
                              {/* Courier Selector & Status */}
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="block text-[10px] text-slate-500 font-bold uppercase">Courier Partner</label>
                                  <select
                                    value={courierPartner}
                                    onChange={(e) => setCourierPartner(e.target.value)}
                                    className="w-full bg-[#0d1526] border border-white/[0.08] text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary-500/50"
                                  >
                                    <option value="Shiprocket">Shiprocket</option>
                                    <option value="Blue Dart">Blue Dart</option>
                                    <option value="Self-Managed">Self-Managed (Manual)</option>
                                  </select>
                                </div>
                                
                                <div className="space-y-1">
                                  <label className="block text-[10px] text-slate-500 font-bold uppercase">Main Order Status</label>
                                  <select
                                    value={selectedOrder.status}
                                    onChange={(e) => handleUpdateStatus(selectedOrder._id, e.target.value, trackingNumber, courierPartner)}
                                    className="w-full bg-[#0d1526] border border-white/[0.08] text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary-500/50"
                                  >
                                    <option value="Pending">Pending</option>
                                    <option value="Processing">Processing</option>
                                    <option value="Shipped">Shipped</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                  </select>
                                </div>
                              </div>

                              {/* AWB input field */}
                              <div className="space-y-2">
                                <label className="block text-[10px] text-slate-500 font-bold uppercase">Tracking Number / AWB Code</label>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    placeholder="Enter tracking number/AWB code..."
                                    value={trackingNumber}
                                    onChange={(e) => setTrackingNumber(e.target.value)}
                                    className="flex-grow bg-[#0d1526] border border-white/[0.08] text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-primary-500/50"
                                  />
                                  <button
                                    onClick={() => handleUpdateStatus(selectedOrder._id, selectedOrder.status, trackingNumber, courierPartner)}
                                    className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs rounded-xl transition-all whitespace-nowrap"
                                  >
                                    Save AWB
                                  </button>
                                </div>
                              </div>

                              {/* Self-Managed Manual log update */}
                              {courierPartner === 'Self-Managed' && (
                                <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl space-y-2.5">
                                  <p className="text-[10px] text-primary-400 font-bold uppercase tracking-wider">Manual Tracking Log Update</p>
                                  <div className="space-y-1.5">
                                    <input
                                      type="text"
                                      placeholder="Milestone description (e.g. Package arrived at Pune Hub)..."
                                      value={historyDescription}
                                      onChange={(e) => setHistoryDescription(e.target.value)}
                                      className="w-full bg-[#0d1526] border border-white/[0.08] text-white text-xs rounded-xl px-3 py-2 focus:outline-none"
                                    />
                                    <button
                                      onClick={() => {
                                        if (!historyDescription.trim()) {
                                          toast.error('Please enter a description for the tracking milestone.');
                                          return;
                                        }
                                        handleUpdateStatus(selectedOrder._id, selectedOrder.status, trackingNumber, courierPartner, historyDescription);
                                      }}
                                      className="w-full py-1.5 bg-primary-600/30 hover:bg-primary-600/40 text-primary-300 font-bold text-xs rounded-lg transition-all border border-primary-500/20"
                                    >
                                      + Post Milestone Update
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Tracking History Log/Timeline view */}
                              <div className="space-y-3">
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Tracking Timeline</p>
                                {selectedOrder.trackingHistory && selectedOrder.trackingHistory.length > 0 ? (
                                  <div className="border-l border-white/[0.06] ml-2 pl-4 space-y-4">
                                    {selectedOrder.trackingHistory.map((history, idx) => (
                                      <div key={idx} className="relative">
                                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-primary-500 border-2 border-[#0f172a] shadow" />
                                        <div className="flex justify-between items-start gap-4">
                                          <div>
                                            <p className="text-xs font-bold text-slate-200">{history.description}</p>
                                            <p className="text-[10px] text-slate-500 mt-0.5">Status: {history.status}</p>
                                          </div>
                                          <span className="text-[9px] text-slate-600 font-mono whitespace-nowrap">
                                            {new Date(history.timestamp).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-xs text-slate-500 italic py-2">
                                    No tracking checkpoints recorded yet. Updates will appear here.
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            /* Non-Physical/Digital Orders updates */
                            <div className="space-y-3 pt-4 border-t border-white/[0.06]">
                              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Update Order Status</p>
                              <select
                                value={selectedOrder.status}
                                onChange={(e) => handleUpdateStatus(selectedOrder._id, e.target.value)}
                                className="w-full bg-[#0d1526] border border-white/[0.08] text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary-500/50"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </div>
                          )}
                        </>
                      );
                    })()}

                  </div>

                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminOrders;
