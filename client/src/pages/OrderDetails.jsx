import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, PackageCheck, Bookmark, ShieldCheck, Download, Truck, Play, CreditCard, Wallet, ShoppingBag, MapPin, User, Mail, Phone, Home } from 'lucide-react';
import useOrderStore from '../store/orderStore';
import { toast } from 'sonner';
import usePageMeta from '../hooks/usePageMeta';
import axios from '../api/axios';

const OrderDetails = () => {
   usePageMeta('Order Details', 'View your Pustak Maza order summary, delivery status, and purchased items.');
   const { id } = useParams();
   const navigate = useNavigate();
   const { orders } = useOrderStore();
   
   const [order, setOrder] = useState(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchOrder = async () => {
         try {
            const { data } = await axios.get(`/orders/${id}`);
            setOrder(data);
         } catch (err) {
            console.error('API failed, falling back to local store:', err);
            const fallbackOrder = orders.find(o => o.id === id || o._id === id);
            if (fallbackOrder) {
               setOrder(fallbackOrder);
            } else {
               toast.error('Failed to load order details');
            }
         } finally {
            setLoading(false);
         }
      };
      fetchOrder();
   }, [id, orders]);

   if (loading) {
      return (
         <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
         </div>
      );
   }

   if (!order) {
      return (
         <div className="max-w-4xl pt-20 pb-40 mx-auto text-center font-inter">
            <h2 className="text-3xl font-poppins font-black text-[#1e293b] mb-4">Order Not Found</h2>
            <p className="text-gray-500 mb-8 font-medium">We couldn't locate this transaction in your history.</p>
            <button onClick={() => navigate('/orders')} className="px-8 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 shadow-md transition-colors">Return to My Orders</button>
         </div>
      );
   }

   // Normalize properties for both API schema and mock schema compatibility
   const orderItemsList = order.orderItems || order.items || [];
   const billingDetails = order.user && typeof order.user === 'object' ? {
      name: order.user.name,
      email: order.user.email,
      phone: order.user.phone || 'N/A'
   } : (order.billingDetails || null);

   const shippingAddress = order.shippingAddress;
   const shippingDetails = shippingAddress && typeof shippingAddress === 'object' && shippingAddress.street ? {
      address1: shippingAddress.street,
      address2: '',
      landmark: '',
      city: shippingAddress.city,
      state: shippingAddress.state,
      pincode: shippingAddress.zipCode
   } : (order.shippingDetails || null);

    const subtotalValue = order.itemsPrice ?? order.subtotal ?? order.totalAmount ?? order.total ?? 0;
    const discountValue = order.discount ?? 0;
    const shippingValue = order.shippingPrice ?? order.shipping ?? 0;
    const totalValue = order.totalPrice ?? order.totalAmount ?? order.total ?? 0;

    const taxValue = order.tax !== undefined ? order.tax : (
      Math.abs(totalValue - (subtotalValue - discountValue + shippingValue)) < 2 ? 0 : 
      Math.round((subtotalValue - discountValue) * 0.18)
    );
    const gstPercentageValue = order.gstPercentage !== undefined ? order.gstPercentage : (
      taxValue === 0 ? 0 : 18
    );
    const displayDate = order.createdAt || order.date || new Date();
    const orderStatus = order.status || (order.isPaid ? (order.isDelivered ? 'Delivered' : 'Access Granted') : (order.paymentMethod === 'COD' ? 'Processing' : 'Pending'));
    const hasPhysical = orderItemsList.some(item => ['hardcopy', 'Hardcopy'].includes(item.format));

    // Downloadable / printable HTML Invoice
   const handleDownloadInvoice = () => {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
         toast.error('Please allow popups to print/download the invoice.');
         return;
      }

      const invoiceItemsHtml = orderItemsList.map(item => `
         <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #334155;">
               <b>${item.title}</b><br>
               <small style="color: #64748b; font-weight: 500;">Format: ${item.format}</small>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #334155; text-align: center;">
               ${item.qty || item.quantity || 1}
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #334155; text-align: right;">
               ₹${(item.price || 0).toFixed(2)}
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #334155; text-align: right; font-weight: 600;">
               ₹${((item.price || 0) * (item.qty || item.quantity || 1)).toFixed(2)}
            </td>
         </tr>
      `).join('');

      const invoiceHtml = `
         <!DOCTYPE html>
         <html>
            <head>
               <title>Invoice - Pustak Maza [${order._id || order.id}]</title>
               <style>
                  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                  body { font-family: 'Inter', sans-serif; color: #1e293b; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.5; }
                  .header { display: flex; justify-content: space-between; border-bottom: 2px solid #f1f5f9; padding-bottom: 24px; margin-bottom: 30px; }
                  .logo { font-size: 26px; font-weight: 800; color: #7c3aed; letter-spacing: -0.025em; }
                  .invoice-title { font-size: 28px; font-weight: 800; color: #0f172a; margin: 0; }
                  .meta-row { font-size: 13px; color: #64748b; margin-top: 4px; }
                  .meta-row strong { color: #0f172a; }
                  .addresses { display: flex; justify-content: space-between; gap: 40px; margin-bottom: 40px; }
                  .address-block { flex: 1; background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; }
                  .address-block h4 { text-transform: uppercase; font-size: 11px; font-weight: 700; color: #64748b; margin: 0 0 10px 0; letter-spacing: 0.05em; }
                  .address-block p { font-size: 13px; font-weight: 500; color: #334155; margin: 0; line-height: 1.6; }
                  table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                  th { background-color: #f8fafc; padding: 12px; text-align: left; font-size: 12px; font-weight: 700; color: #475569; border-bottom: 1px solid #e2e8f0; text-transform: uppercase; letter-spacing: 0.05em; }
                  .totals-container { display: flex; justify-content: flex-end; }
                  .totals-table { width: 300px; font-size: 14px; }
                  .totals-table td { padding: 8px 12px; color: #475569; }
                  .totals-table tr.grand-total td { font-size: 18px; font-weight: 800; color: #7c3aed; border-top: 2px solid #e2e8f0; padding-top: 12px; }
                  .footer { border-top: 2px solid #f1f5f9; padding-top: 24px; margin-top: 60px; text-align: center; font-size: 12px; color: #94a3b8; font-weight: 500; }
                  @media print {
                     .no-print { display: none; }
                     body { margin: 0; padding: 0; }
                  }
               </style>
            </head>
            <body>
               <div class="no-print" style="margin-bottom: 30px; display: flex; justify-content: flex-end;">
                  <button onclick="window.print()" style="background-color: #7c3aed; color: white; border: none; padding: 12px 24px; border-radius: 10px; font-weight: 700; font-size: 14px; cursor: pointer; transition: background 0.2s;">
                     Print / Download PDF Invoice
                  </button>
               </div>
               
               <div class="header">
                  <div>
                     <div class="logo">Pustak Maza</div>
                     <p style="font-size: 13px; color: #64748b; margin: 4px 0 0 0; font-weight: 500;">Premium Bookstore Platform</p>
                  </div>
                  <div style="text-align: right;">
                     <h2 class="invoice-title">INVOICE</h2>
                     <div class="meta-row">Order ID: <strong>${order._id || order.id}</strong></div>
                     <div class="meta-row">Date: <strong>${new Date(displayDate).toLocaleDateString()}</strong></div>
                     <div class="meta-row">Payment: <strong>${order.paymentMethod} (${order.isPaid ? 'PAID' : 'PENDING'})</strong></div>
                  </div>
               </div>

               <div class="addresses">
                  <div class="address-block">
                     <h4>Billing Contact</h4>
                     <p>
                        <strong>${billingDetails?.name || 'Customer'}</strong><br>
                        ${billingDetails?.email || ''}<br>
                        ${billingDetails?.phone || ''}
                     </p>
                  </div>
                  <div class="address-block">
                     <h4>Shipping Details</h4>
                     <p>
                        ${shippingDetails ? `
                           ${shippingDetails.address1}<br>
                           ${shippingDetails.city}, ${shippingDetails.state}<br>
                           <strong>Pincode: ${shippingDetails.pincode}</strong>
                        ` : (shippingAddress && typeof shippingAddress === 'string' ? shippingAddress : 'Digital release - instant library unlock')}
                     </p>
                  </div>
               </div>

               <table>
                  <thead>
                     <tr>
                        <th>Item description</th>
                        <th style="text-align: center; width: 60px;">Qty</th>
                        <th style="text-align: right; width: 120px;">Rate</th>
                        <th style="text-align: right; width: 120px;">Amount</th>
                     </tr>
                  </thead>
                  <tbody>
                     ${invoiceItemsHtml}
                  </tbody>
               </table>

               <div class="totals-container">
                  <table class="totals-table">
                     <tr>
                        <td>Subtotal</td>
                        <td style="text-align: right; font-weight: 600;">₹${subtotalValue.toFixed(2)}</td>
                     </tr>
                     ${discountValue > 0 ? `
                     <tr style="color: #16a34a;">
                        <td>Discount</td>
                        <td style="text-align: right; font-weight: 600;">-₹${discountValue.toFixed(2)}</td>
                     </tr>` : ''}
                     <tr>
                        <td>GST Tax (${gstPercentageValue}%)</td>
                        <td style="text-align: right; font-weight: 600;">₹${taxValue.toFixed(2)}</td>
                     </tr>
                     <tr>
                        <td>Shipping Fee</td>
                        <td style="text-align: right; font-weight: 600;">₹${shippingValue.toFixed(2)}</td>
                     </tr>
                     <tr class="grand-total">
                        <td>Total Paid</td>
                        <td style="text-align: right;">₹${totalValue.toFixed(2)}</td>
                     </tr>
                  </table>
               </div>

               <div class="footer">
                  Thank you for your purchase from Pustak Maza!<br>
                  If you have questions, email support@pustakmaza.com or call our support lines.
               </div>
            </body>
         </html>
      `;

      printWindow.document.write(invoiceHtml);
      printWindow.document.close();
   };

   return (
      <motion.div 
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.5 }}
         className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24 font-inter text-[#475569]"
      >
         {/* Top Navigation */}
         <div className="mb-8">
            <button 
               onClick={() => navigate('/orders')} 
               className="flex items-center gap-2 text-slate-500 hover:text-primary-600 font-black text-sm uppercase tracking-widest transition-colors w-fit"
            >
               <ArrowLeft size={18} /> Back to My Orders
            </button>
         </div>

         {/* Tracking Banner */}
         {order.trackingNumber && (
            <div className="mb-8 p-5 bg-primary-50 border border-primary-100 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
               <div>
                  <h4 className="text-sm font-black text-primary-700 uppercase tracking-wider flex items-center gap-2">
                     <Truck size={16} /> Shipment Dispatched & Active
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">Your order is logged with Shiprocket. Copy tracking code below for carrier portals.</p>
               </div>
               <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-primary-100 shadow-sm">
                  <span className="text-xs text-slate-400 font-bold">Tracking / AWB:</span>
                  <span className="font-mono text-xs font-black text-[#1e293b] select-all">{order.trackingNumber}</span>
               </div>
            </div>
         )}

         {/* 1. Header Hero */}
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-gray-200">
            <div>
               <h1 className="text-3xl sm:text-4xl font-poppins font-black text-[#1e293b] mb-2 tracking-tight">Order Status Details</h1>
               <div className="flex items-center gap-3 text-[#64748b] font-medium text-sm sm:text-base">
                  Order ID: <span className="font-bold text-[#1e293b]">{order._id || order.id}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                  {new Date(displayDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
               </div>
            </div>
            
            <div className="flex items-center gap-3">
               <span className={`px-4 py-2 font-black text-xs uppercase tracking-widest rounded-xl border flex items-center gap-2 shadow-sm ${
                 orderStatus === 'Delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                 orderStatus === 'Shipped' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                 orderStatus === 'Processing' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                 'bg-gray-50 text-gray-600 border-gray-200'
               }`}>
                  <PackageCheck size={16} /> {orderStatus}
               </span>
               <button 
                  onClick={handleDownloadInvoice}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white font-bold text-[#1e293b] hover:text-primary-600 hover:border-primary-200 hover:bg-primary-50 transition-all shadow-sm"
               >
                  <Download size={18} /> Invoice
               </button>
            </div>
         </div>

         {/* Shipment Tracking Timeline (Physical Orders Only) */}
         {hasPhysical && (
            <div className="mb-10 bg-white rounded-[2.5rem] border border-[#e2e8f0] p-6 sm:p-8 shadow-sm">
               <h3 className="text-lg font-poppins font-black text-[#1e293b] mb-6 uppercase tracking-wide flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 border border-primary-100/50"><Truck size={16}/></span>
                  Shipment Tracking Status
               </h3>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-5 bg-[#f8fafc] rounded-2xl border border-gray-100">
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Courier Partner</p>
                     <p className="font-bold text-[#1e293b]">{order.courierPartner || 'Shiprocket'}</p>
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">AWB / Tracking Number</p>
                     <p className="font-mono text-sm font-black text-primary-600 select-all">{order.trackingNumber || 'Awaiting dispatch assignment'}</p>
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Last Updated Status</p>
                     <p className="font-bold text-[#1e293b]">{orderStatus}</p>
                  </div>
               </div>

               {/* Stepper Timeline */}
               <div className="relative pl-6 sm:pl-8 border-l border-[#e2e8f0] ml-3 sm:ml-4 space-y-6">
                  {order.trackingHistory && order.trackingHistory.length > 0 ? (
                     [...order.trackingHistory].reverse().map((history, idx) => (
                        <div key={idx} className="relative">
                           {/* Pulse primary dot for latest milestone, standard dot for rest */}
                           <div className={`absolute -left-[31px] sm:-left-[37px] top-1.5 w-4 h-4 rounded-full border-4 border-white ${
                              idx === 0 ? 'bg-primary-500 animate-pulse ring-4 ring-primary-500/20' : 'bg-slate-300'
                           }`} />
                           
                           <div>
                              <h4 className="font-bold text-[14px] text-[#1e293b]">{history.description}</h4>
                              <div className="flex gap-2 items-center text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                                 <span>{history.status}</span>
                                 <span>•</span>
                                 <span>{new Date(history.timestamp).toLocaleString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                           </div>
                        </div>
                     ))
                  ) : (
                     /* Default stepper milestones if tracking history doesn't exist yet */
                     <>
                        <div className="relative">
                           <div className={`absolute -left-[31px] sm:-left-[37px] top-1.5 w-4 h-4 rounded-full border-4 border-white ${
                              orderStatus === 'Pending' ? 'bg-primary-500 animate-pulse ring-4 ring-primary-500/20' : 'bg-primary-500'
                           }`} />
                           <h4 className="font-bold text-sm text-[#1e293b]">Order Placed & Confirmed</h4>
                           <p className="text-xs text-slate-500 mt-0.5">We have received your order details and payment validation.</p>
                        </div>
                        <div className="relative">
                           <div className={`absolute -left-[31px] sm:-left-[37px] top-1.5 w-4 h-4 rounded-full border-4 border-white ${
                              orderStatus === 'Processing' ? 'bg-primary-500 animate-pulse ring-4 ring-primary-500/20' : 
                              ['Shipped', 'Delivered'].includes(orderStatus) ? 'bg-primary-500' : 'bg-slate-200'
                           }`} />
                           <h4 className="font-bold text-sm text-[#1e293b]">Order Processing & Packing</h4>
                           <p className="text-xs text-slate-500 mt-0.5">The publisher is packing your book copy for shipping dispatch.</p>
                        </div>
                        <div className="relative">
                           <div className={`absolute -left-[31px] sm:-left-[37px] top-1.5 w-4 h-4 rounded-full border-4 border-white ${
                              orderStatus === 'Shipped' ? 'bg-primary-500 animate-pulse ring-4 ring-primary-500/20' : 
                              orderStatus === 'Delivered' ? 'bg-primary-500' : 'bg-slate-200'
                           }`} />
                           <h4 className="font-bold text-sm text-[#1e293b]">Dispatched via Courier</h4>
                           <p className="text-xs text-slate-500 mt-0.5">AWB generated. Shipment handed over to courier dispatch partner.</p>
                        </div>
                        <div className="relative">
                           <div className={`absolute -left-[31px] sm:-left-[37px] top-1.5 w-4 h-4 rounded-full border-4 border-white ${
                              orderStatus === 'Delivered' ? 'bg-primary-500 animate-pulse ring-4 ring-primary-500/20' : 'bg-slate-200'
                           }`} />
                           <h4 className="font-bold text-sm text-[#1e293b]">Package Delivered</h4>
                           <p className="text-xs text-slate-500 mt-0.5">Shipment successfully delivered to target address destination.</p>
                        </div>
                     </>
                  )}
               </div>
            </div>
         )}

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Left Column */}
            <div className="lg:col-span-8 flex flex-col gap-10">
               
               {/* Items Section */}
               <section>
                  <h3 className="text-lg font-poppins font-black text-[#1e293b] mb-6 uppercase tracking-wide flex items-center gap-3">
                     <span className="w-8 h-8 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 border border-primary-100/50"><ShoppingBag size={16}/></span>
                     Ordered Items
                  </h3>
                  
                  <div className="bg-white rounded-[2rem] border border-[#e2e8f0] p-6 sm:p-8 shadow-sm">
                     <div className="space-y-8">
                        {orderItemsList.map((item, idx) => (
                           <div key={`${item.book}-${item.format}-${idx}`} className="flex flex-col sm:flex-row gap-6 p-4 rounded-3xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group">
                              <div className="w-24 h-36 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0 shadow-sm flex items-center justify-center">
                                 <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              </div>
                              <div className="flex-1 flex flex-col justify-between py-1">
                                 <div>
                                    <div className="flex justify-between items-start gap-4 mb-1.5">
                                       <h4 className="text-xl font-poppins font-bold text-[#1e293b] leading-tight">{item.title}</h4>
                                       <span className="text-xl font-black text-[#1e293b]">₹{((item.price || 0) * (item.qty || item.quantity || 1)).toFixed(2)}</span>
                                    </div>
                                    <p className="text-[#64748b] text-sm font-medium mb-3">by <span className="font-bold text-[#1e293b]">Verified Author</span></p>
                                    
                                    <div className="flex items-center gap-3 mb-4">
                                      <span className="inline-block bg-primary-50 border border-primary-100 px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-widest text-primary-700">{item.format}</span>
                                      <span className="text-gray-500 font-bold text-xs uppercase tracking-widest">Qty: {item.qty || item.quantity || 1} &times; ₹{(item.price || 0).toFixed(2)}</span>
                                    </div>
                                 </div>

                                 <div className="mt-4 flex items-center gap-4">
                                    {['ebook', 'audiobook', 'Ebook', 'Audiobook'].includes(item.format) ? (
                                       <button onClick={() => navigate('/library')} className="px-5 py-2.5 rounded-xl bg-purple-50 text-purple-700 font-bold border border-purple-100 hover:bg-purple-100 transition-colors text-sm flex items-center gap-2 tracking-wide w-full sm:w-auto justify-center">
                                          <Play size={16}/> Access in Library
                                       </button>
                                    ) : (
                                       <button 
                                          onClick={() => {
                                             if (order.trackingNumber) {
                                                toast.success(`AWB: ${order.trackingNumber} copied to clipboard!`);
                                                navigator.clipboard.writeText(order.trackingNumber);
                                             } else {
                                                toast.info("Shipment registration pending. We'll update tracking details shortly.");
                                             }
                                          }} 
                                          className="px-5 py-2.5 rounded-xl bg-green-50 text-green-700 font-bold border border-green-100 hover:bg-green-100 transition-colors text-sm flex items-center gap-2 tracking-wide w-full sm:w-auto justify-center"
                                       >
                                          <Truck size={16}/> {order.trackingNumber ? 'Copy Tracking Code' : 'Shipping Initiated'}
                                       </button>
                                    )}
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </section>

               {/* Delivery & Billing Details */}
               <section>
                  <h3 className="text-lg font-poppins font-black text-[#1e293b] mb-6 uppercase tracking-wide flex items-center gap-3">
                     <span className="w-8 h-8 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 border border-primary-100/50"><Bookmark size={16}/></span>
                     Delivery & Billing Details
                  </h3>
                  
                  <div className="bg-white rounded-[2rem] border border-[#e2e8f0] p-8 shadow-sm flex flex-col md:flex-row gap-8">
                     
                     {/* Contact Information */}
                     <div className="flex-1">
                        <h4 className="font-black text-xs uppercase tracking-widest text-gray-400 mb-5 border-b border-gray-100 pb-3">Contact Information</h4>
                        {billingDetails ? (
                           <ul className="space-y-4 text-sm font-medium text-[#1e293b]">
                              <li className="flex items-center gap-3"><User size={16} className="text-gray-400"/> {billingDetails.name}</li>
                              <li className="flex items-center gap-3"><Phone size={16} className="text-gray-400"/> {billingDetails.phone}</li>
                              <li className="flex items-center gap-3"><Mail size={16} className="text-gray-400"/> {billingDetails.email}</li>
                           </ul>
                        ) : (
                           <p className="text-sm text-gray-500 italic">No contact entity mapped in order.</p>
                        )}
                     </div>

                     <div className="hidden md:block w-px bg-gray-100"></div>

                     {/* Shipping Destination */}
                     <div className="flex-1">
                        <h4 className="font-black text-xs uppercase tracking-widest text-gray-400 mb-5 border-b border-gray-100 pb-3">Destination Record</h4>
                        
                        {(!shippingAddress || shippingAddress === 'Digital Delivery') ? (
                           <div className="flex flex-col py-2 text-primary-700">
                              <div className="flex items-center gap-2 mb-2"><ShieldCheck size={20} className="text-primary-600" /><h4 className="font-black font-poppins text-[15px]">Digital Release</h4></div>
                              <p className="font-medium text-[13px] text-slate-500">No physical shipping required. Media is connected securely to your digital library vault.</p>
                           </div>
                        ) : shippingDetails ? (
                           <ul className="space-y-2 text-sm font-medium text-[#1e293b]">
                              <li className="flex items-start gap-3"><Home size={16} className="text-gray-400 shrink-0 mt-0.5"/> <div>{shippingDetails.address1}</div></li>
                              <li className="pl-7 pt-2 flex flex-wrap gap-x-1 gap-y-1">
                                 <span className="font-bold">{shippingDetails.city},</span>
                                 <span>{shippingDetails.state}</span>
                                 <span className="text-primary-600 font-black ml-1 tracking-wider">{shippingDetails.pincode}</span>
                              </li>
                           </ul>
                        ) : (
                           <div className="flex items-start gap-3 text-sm font-medium text-[#1e293b]">
                              <MapPin size={16} className="text-gray-400 shrink-0 mt-0.5" />
                              <p className="leading-relaxed text-slate-600">{typeof shippingAddress === 'string' ? shippingAddress : JSON.stringify(shippingAddress)}</p>
                           </div>
                        )}
                     </div>

                  </div>
               </section>

            </div>

            {/* Right Column: Summaries & Actions */}
            <div className="lg:col-span-4 flex flex-col gap-8 lg:sticky lg:top-10 lg:self-start">
               
               <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-[#e2e8f0]">
                  <h3 className="text-lg font-poppins font-black text-[#1e293b] uppercase tracking-wide mb-6">Payment Summary</h3>

                  <div className="space-y-4 py-2 border-b border-gray-100 mb-6">
                     <div className="flex justify-between text-[#64748b] font-medium text-[15px]">
                        <span>Subtotal</span>
                        <span className="font-bold text-[#1e293b]">₹{subtotalValue.toFixed(2)}</span>
                     </div>
                     {discountValue > 0 && (
                        <div className="flex justify-between text-green-600 font-bold text-[15px]">
                           <span>Discount Applied</span>
                           <span>-₹{discountValue.toFixed(2)}</span>
                        </div>
                     )}
                     <div className="flex justify-between text-[#64748b] font-medium text-[15px]">
                        <span>GST Tax ({gstPercentageValue}%)</span>
                        <span className="font-bold text-[#1e293b]">₹{taxValue.toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between text-[#64748b] font-medium text-[15px]">
                        <span>Shipping</span>
                        {shippingValue > 0 ? (
                           <span className="font-bold text-[#1e293b]">₹{shippingValue.toFixed(2)}</span>
                        ) : (
                           <span className="font-bold text-emerald-500">Free</span>
                        )}
                     </div>
                  </div>

                  <div className="flex justify-between items-center mb-8 bg-[#f8fafc] p-5 rounded-2xl border border-gray-100">
                     <span className="text-sm font-black text-[#64748b] uppercase tracking-widest">Total Paid</span>
                     <span className="text-3xl font-poppins font-black text-primary-600">₹{totalValue.toFixed(2)}</span>
                  </div>

                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex items-center gap-3">
                     <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm">
                        {order.paymentMethod === 'COD' ? <Wallet size={20} className="text-primary-600"/> : <CreditCard size={20} className="text-primary-600"/>}
                     </div>
                     <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#64748b] mb-0.5">Payment Method</p>
                        <p className="font-bold text-[#1e293b]">{order.paymentMethod}</p>
                     </div>
                  </div>
               </div>

               <Link to="/shop" className="w-full bg-[#1e293b] hover:bg-black text-white font-black text-[15px] uppercase tracking-widest py-4 rounded-2xl shadow-lg transition-all text-center active:scale-[0.98]">
                  Continue Shopping
               </Link>

            </div>
         </div>
      </motion.div>
   );
};

export default OrderDetails;
