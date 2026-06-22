import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { CreditCard, Wallet, Truck, ChevronRight, ShieldCheck, MapPin, PackageCheck, Tag, X, Info } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';
import useOrderStore from '../store/orderStore';
import usePageMeta from '../hooks/usePageMeta';
import axios from '../api/axios';

const Checkout = () => {
  usePageMeta('Checkout', 'Complete your Pustak Maza purchase. Secure checkout with multiple payment options.');
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { cartItems, clearCart } = useCartStore();
  const { addOrder } = useOrderStore();

  // Buy Now persistence logic
  let persistentBuyNow = null;
  try {
     const storedObj = sessionStorage.getItem('tempBuyNow');
     if (storedObj) persistentBuyNow = JSON.parse(storedObj);
  } catch(e) {}

  const activeBuyNowItem = location.state?.buyNowItem || persistentBuyNow;
  const isDirectBuy = !!activeBuyNowItem;
  const checkoutItems = isDirectBuy ? [activeBuyNowItem] : cartItems;

  const [formData, setFormData] = useState(() => {
     let draft = null;
     try { draft = JSON.parse(localStorage.getItem('checkoutFormData')); } catch(e) {}
     return draft || {
        name: user?.name || '',
        phone: user?.phone || '',
        email: user?.email || '',
        address1: '',
        address2: '',
        landmark: '',
        pincode: '',
        city: '',
        state: '',
        country: 'India'
     };
  });

  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPinLoading, setIsPinLoading] = useState(false);
  
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  useEffect(() => {
    if (checkoutItems.length === 0) {
       toast.error('No items to checkout.');
       navigate('/shop');
    }
  }, [checkoutItems, navigate]);

  // Persist form data on keystrokes
  useEffect(() => {
     localStorage.setItem('checkoutFormData', JSON.stringify(formData));
  }, [formData]);

  const handlePincodeChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    setFormData(prev => ({ ...prev, pincode: val }));

    if (val.length === 6) {
       setIsPinLoading(true);
       setTimeout(() => {
         setIsPinLoading(false);
         setFormData(prev => ({ ...prev, city: 'Mumbai', state: 'Maharashtra' }));
         toast.success('Location auto-filled successfully');
       }, 800);
    }
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    if (couponCode.toUpperCase() === 'PUSTAK20') {
      setAppliedCoupon({ code: 'PUSTAK20', discountPercent: 20 });
      toast.success('Coupon applied! 20% off.');
    } else {
      toast.error('Invalid or expired coupon code.');
      setCouponCode('');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null); setCouponCode(''); toast.info('Coupon removed.');
  };

  const [gstPercentage, setGstPercentage] = useState(18);
  const [shippingCost, setShippingCost] = useState(99);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get('/settings');
        if (data) {
          if (data.gstPercentage !== undefined) setGstPercentage(data.gstPercentage);
          if (data.shippingCost !== undefined) setShippingCost(data.shippingCost);
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const subtotal = checkoutItems.reduce((acc, item) => acc + ((item.price || 0) * (item.qty || item.quantity || 1)), 0);
  const discountAmount = appliedCoupon ? (subtotal * appliedCoupon.discountPercent) / 100 : 0;
  const afterDiscount = subtotal - discountAmount;
  const tax = Math.round(afterDiscount * (gstPercentage / 100));
  
  const hasHardcopy = checkoutItems.some(item => item.format === 'hardcopy' || item.format === 'Hardcover' || item.format === 'Paperback');
  const shipping = hasHardcopy ? shippingCost : 0;
  const total = afterDiscount + tax + shipping;

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!hasHardcopy && paymentMethod === 'COD') {
       toast.error("Cash on Delivery is available only for hardcopy orders.");
       return;
    }

    setIsProcessing(true);

    try {
      // Map frontend checkout items to backend schema format
      const orderItems = checkoutItems.map(item => ({
        book: item.book || item._id,
        title: item.title,
        format: (item.format || 'ebook').toLowerCase(), // enum: 'ebook', 'audiobook', 'hardcopy'
        qty: item.qty || item.quantity || 1,
        price: item.price,
        image: item.image || item.coverImage,
      }));

      const shippingAddressObj = hasHardcopy ? {
        street: `${formData.address1} ${formData.address2 || ''} ${formData.landmark || ''}`.trim(),
        city: formData.city,
        state: formData.state,
        zipCode: formData.pincode,
        country: formData.country,
      } : null;

      const orderPayload = {
        orderItems,
        shippingAddress: shippingAddressObj,
        paymentMethod,
        itemsPrice: subtotal,
        shippingPrice: shipping,
        gstPercentage,
        tax,
        discount: discountAmount,
        totalPrice: total
      };

      // Create the order on backend
      const { data: dbOrder } = await axios.post('/orders', orderPayload);

      // Handle COD Immediately
      if (paymentMethod === 'COD') {
        const orderData = {
          subtotal,
          discount: discountAmount,
          tax,
          shipping,
          totalAmount: total,
          paymentMethod,
          billingDetails: {
             name: formData.name,
             email: formData.email,
             phone: formData.phone
          },
          shippingDetails: hasHardcopy ? {
             address1: formData.address1,
             address2: formData.address2,
             landmark: formData.landmark,
             city: formData.city,
             state: formData.state,
             pincode: formData.pincode,
             country: formData.country
          } : null,
          shippingAddress: hasHardcopy ? `${formData.address1}, ${formData.address2 ? formData.address2 + ', ' : ''}${formData.landmark ? formData.landmark + ', ' : ''}${formData.city}, ${formData.state} - ${formData.pincode}, ${formData.country}` : 'Digital Delivery',
          status: 'Processing',
        };

        addOrder(orderData, checkoutItems, dbOrder._id);
        
        if (isDirectBuy) {
           sessionStorage.removeItem('tempBuyNow');
        } else {
           clearCart();
        }
        localStorage.removeItem('checkoutFormData');
        
        toast.success('Order placed successfully!');
        navigate(`/order-success?id=${dbOrder._id}`);
        return;
      }

      // Handle Online Payment (Razorpay)
      const { data: rzpOrder } = await axios.post('/orders/razorpay-order', { amount: total });

      const options = {
        key: rzpOrder.key,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: 'Pustak Maza',
        description: 'Book Purchase',
        order_id: rzpOrder.id,
        handler: async function (response) {
          try {
            setIsProcessing(true);
            
            // Verify payment signature on backend
            await axios.post('/orders/razorpay-verify', {
              orderId: dbOrder._id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            // Mark paid locally
            const orderData = {
              subtotal,
              discount: discountAmount,
              tax,
              shipping,
              totalAmount: total,
              paymentMethod: 'Razorpay',
              billingDetails: {
                 name: formData.name,
                 email: formData.email,
                 phone: formData.phone
              },
              shippingDetails: hasHardcopy ? {
                 address1: formData.address1,
                 address2: formData.address2,
                 landmark: formData.landmark,
                 city: formData.city,
                 state: formData.state,
                 pincode: formData.pincode,
                 country: formData.country
              } : null,
              shippingAddress: hasHardcopy ? `${formData.address1}, ${formData.address2 ? formData.address2 + ', ' : ''}${formData.landmark ? formData.landmark + ', ' : ''}${formData.city}, ${formData.state} - ${formData.pincode}, ${formData.country}` : 'Digital Delivery',
              status: hasHardcopy ? 'Processing' : 'Access Granted',
            };

            addOrder(orderData, checkoutItems, dbOrder._id);

            if (isDirectBuy) {
               sessionStorage.removeItem('tempBuyNow');
            } else {
               clearCart();
            }
            localStorage.removeItem('checkoutFormData');
            
            toast.success('Payment Successful!');
            navigate(`/order-success?id=${dbOrder._id}`);
          } catch (err) {
            toast.error(err.response?.data?.message || 'Payment verification failed');
            setIsProcessing(false);
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: '#6a0dad'
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            toast.error('Payment cancelled by user');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      toast.error(error.response?.data?.message || 'Checkout failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const inputClass = "w-full px-5 py-3.5 rounded-xl font-medium text-[15px] text-[#1e293b] border border-[#e2e8f0] bg-[#f8fafc] focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]";
  const labelClass = "text-[11px] font-bold text-gray-500 uppercase tracking-widest pl-1 mb-1.5 block";

  return (
    <div className="min-h-screen bg-[#f1f5f9] py-8 font-inter pb-24">
      
      {/* Premium Trust Strip */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 mb-8">
         <div className="bg-gradient-to-r from-primary-900 via-primary-800 to-primary-900 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between text-white shadow-xl shadow-primary-900/10 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[40px] translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div className="relative z-10 flex items-center gap-3 mb-3 md:mb-0">
               <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm"><ShieldCheck size={20} className="text-primary-100"/></div>
               <div>
                  <h3 className="font-poppins font-black text-sm tracking-wide">Trusted Publication House</h3>
                  <p className="text-primary-200 text-xs font-medium">100% Encrypted & Secure Checkout Experience</p>
               </div>
            </div>
            <div className="relative z-10 flex gap-6 text-sm font-bold text-primary-100 uppercase tracking-widest hidden sm:flex">
               <span className="flex items-center gap-1.5"><PackageCheck size={16}/> Quality Guaranteed</span>
               <span className="flex items-center gap-1.5"><ShieldCheck size={16}/> Safe Payments</span>
            </div>
         </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-10 flex flex-col items-center text-center">
           <h1 className="text-3xl md:text-5xl font-poppins font-black text-[#1e293b] tracking-tight">Complete Order</h1>
           <p className="text-[#64748b] mt-3 font-medium text-lg">Fast, secure, and encrypted payment process.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
           
           {/* Left Form Column */}
           <div className="w-full lg:w-[58%] xl:w-[62%] space-y-8">
              <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-8">
                 
                 {/* 1. Contact Info */}
                 <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-[#e2e8f0]">
                    <div className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-100">
                       <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-black font-poppins text-sm shadow-sm">1</span> 
                       <h2 className="text-xl font-poppins font-black text-[#1e293b] uppercase tracking-wide">Contact Details</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                       <div>
                          <label className={labelClass}>Full Name</label>
                          <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={inputClass} placeholder="John Doe" />
                       </div>
                       <div>
                          <label className={labelClass}>Phone Number</label>
                          <input required type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className={inputClass} placeholder="+91 90000 00000" />
                       </div>
                       <div className="md:col-span-2">
                          <label className={labelClass}>Email Address</label>
                          <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={inputClass} placeholder="john@example.com" />
                       </div>
                    </div>
                 </div>

                 {/* 2. Shipping Address */}
                 {hasHardcopy ? (
                    <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-[#e2e8f0]">
                       <div className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-100">
                          <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-black font-poppins text-sm shadow-sm">2</span> 
                          <h2 className="text-xl font-poppins font-black text-[#1e293b] uppercase tracking-wide flex items-center gap-3">Shipping Information <Truck className="text-gray-300" size={20}/></h2>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          <div className="space-y-1.5 md:col-span-1">
                             <label className={labelClass}>Pincode</label>
                             <div className="relative">
                               <input required type="text" maxLength={6} value={formData.pincode} onChange={handlePincodeChange} className={`w-full pl-11 pr-4 py-3.5 rounded-xl font-bold text-[15px] tracking-widest text-[#1e293b] border bg-[#f8fafc] focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] ${formData.pincode.length === 6 ? 'border-primary-300 bg-primary-50/20' : 'border-[#e2e8f0]'}`} placeholder="000000" />
                               <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                 {isPinLoading ? <div className="w-4 h-4 border-[3px] border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div> : <MapPin size={18}/>}
                               </div>
                             </div>
                          </div>

                          <div className="space-y-1.5 md:col-span-1">
                             <label className={labelClass}>City</label>
                             <input required type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className={`${inputClass} ${formData.city ? 'bg-primary-50/20 border-primary-200' : ''}`} placeholder="Mumbai" />
                          </div>
                          
                          <div className="space-y-1.5 md:col-span-1">
                             <label className={labelClass}>State</label>
                             <input required type="text" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className={`${inputClass} ${formData.state ? 'bg-primary-50/20 border-primary-200' : ''}`} placeholder="Maharashtra" />
                          </div>

                          <div className="space-y-1.5 md:col-span-3 pt-4">
                             <label className={labelClass}>Address Line 1 (Flat, House no., Building, Company)</label>
                             <input required type="text" value={formData.address1} onChange={e => setFormData({...formData, address1: e.target.value})} className={inputClass} placeholder="123, Street name..." />
                          </div>

                          <div className="space-y-1.5 md:col-span-3">
                             <label className={labelClass}>Address Line 2 (Area, Sector, Village) <span className="text-gray-400 lowercase font-normal">- Optional</span></label>
                             <input type="text" value={formData.address2} onChange={e => setFormData({...formData, address2: e.target.value})} className={inputClass} placeholder="Sector ABC..." />
                          </div>

                          <div className="space-y-1.5 md:col-span-3">
                             <label className={labelClass}>Landmark <span className="text-gray-400 lowercase font-normal">- Optional</span></label>
                             <input type="text" value={formData.landmark} onChange={e => setFormData({...formData, landmark: e.target.value})} className={inputClass} placeholder="near Apollo Hospital" />
                          </div>
                       </div>
                    </div>
                 ) : (
                    <div className="bg-blue-50/50 rounded-3xl p-8 shadow-sm border border-blue-100 flex items-center justify-between">
                       <div>
                          <h3 className="font-poppins font-black text-blue-900 text-lg mb-1">Instant Digital Environment</h3>
                          <p className="text-sm font-medium text-blue-800/80">Physical shipping details are not required. Products will link to your library immediately after payment clears.</p>
                       </div>
                    </div>
                 )}

                 {/* 3. Payment Method */}
                 <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-[#e2e8f0]">
                    <div className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-100">
                       <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-black font-poppins text-sm shadow-sm">{hasHardcopy ? '3' : '2'}</span> 
                       <h2 className="text-xl font-poppins font-black text-[#1e293b] uppercase tracking-wide">Payment Method</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                       
                       <label className={`relative cursor-pointer rounded-2xl border-2 p-5 flex flex-col items-center gap-3 transition-all transform hover:-translate-y-1 ${paymentMethod === 'Card' ? 'border-primary-500 bg-primary-50/50 shadow-md text-primary-700' : 'border-[#e2e8f0] hover:border-gray-300 text-gray-500 bg-white hover:shadow-sm'}`}>
                          <input type="radio" name="payment" value="Card" checked={paymentMethod === 'Card'} onChange={(e) => setPaymentMethod(e.target.value)} className="sr-only" />
                          <CreditCard size={28} />
                          <span className="font-bold text-sm">Credit/Debit</span>
                          {paymentMethod === 'Card' && <motion.div initial={{scale:0}} animate={{scale:1}} className="absolute top-3 right-3 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center shadow-sm"><div className="w-1.5 h-1.5 bg-white rounded-full"></div></motion.div>}
                       </label>

                       <label className={`relative cursor-pointer rounded-2xl border-2 p-5 flex flex-col items-center gap-3 transition-all transform hover:-translate-y-1 ${paymentMethod === 'UPI' ? 'border-primary-500 bg-primary-50/50 shadow-md text-primary-700' : 'border-[#e2e8f0] hover:border-gray-300 text-gray-500 bg-white hover:shadow-sm'}`}>
                          <input type="radio" name="payment" value="UPI" checked={paymentMethod === 'UPI'} onChange={(e) => setPaymentMethod(e.target.value)} className="sr-only" />
                          <Wallet size={28} />
                          <span className="font-bold text-sm">UPI</span>
                          {paymentMethod === 'UPI' && <motion.div initial={{scale:0}} animate={{scale:1}} className="absolute top-3 right-3 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center shadow-sm"><div className="w-1.5 h-1.5 bg-white rounded-full"></div></motion.div>}
                       </label>

                       {hasHardcopy ? (
                          <label className={`relative cursor-pointer rounded-2xl border-2 p-5 flex flex-col items-center gap-3 transition-all transform hover:-translate-y-1 ${paymentMethod === 'COD' ? 'border-primary-500 bg-primary-50/50 shadow-md text-primary-700' : 'border-[#e2e8f0] hover:border-gray-300 text-gray-500 bg-white hover:shadow-sm'}`}>
                             <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={(e) => setPaymentMethod(e.target.value)} className="sr-only" />
                             <PackageCheck size={28} />
                             <span className="font-bold text-sm text-center leading-tight">Cash on<br/>Delivery</span>
                             {paymentMethod === 'COD' && <motion.div initial={{scale:0}} animate={{scale:1}} className="absolute top-3 right-3 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center shadow-sm"><div className="w-1.5 h-1.5 bg-white rounded-full"></div></motion.div>}
                          </label>
                       ) : (
                          <div className="rounded-2xl border-2 border-gray-100 p-5 flex flex-col items-center justify-center gap-3 bg-gray-50 opacity-50 cursor-not-allowed text-gray-400 tooltip-trigger group relative">
                             <Truck size={28} />
                             <span className="font-bold text-sm text-center leading-tight">No COD<br/>(Digital)</span>
                             <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[10px] font-bold px-3 py-2 rounded-lg whitespace-nowrap shadow-lg pointer-events-none z-10">Cash on Delivery is available only for hardcopy orders</div>
                          </div>
                       )}
                    </div>

                    {paymentMethod === 'Card' && (
                       <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-6 space-y-4 bg-white p-6 rounded-2xl border border-[#e2e8f0]">
                          <div className="space-y-4">
                             <div className="relative">
                               <input type="text" placeholder="Card Number" className="w-full pl-12 pr-4 py-3.5 rounded-xl font-bold text-[15px] text-[#1e293b] border border-gray-200 outline-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] tracking-widest bg-[#f8fafc]" />
                               <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                             </div>
                             <div className="flex gap-4">
                                <input type="text" placeholder="MM/YY" className="w-1/2 px-4 py-3.5 rounded-xl font-bold text-[15px] text-[#1e293b] border border-gray-200 outline-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] text-center bg-[#f8fafc]" />
                                <input type="text" placeholder="CVC" className="w-1/2 px-4 py-3.5 rounded-xl font-bold text-[15px] text-[#1e293b] border border-gray-200 outline-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] text-center bg-[#f8fafc]" />
                             </div>
                          </div>
                       </motion.div>
                    )}
                 </div>

              </form>
           </div>

           {/* Right Summary Column (Sticky) */}
           <div className="w-full lg:w-[42%] xl:w-[38%] relative">
              <div className="bg-white rounded-[2rem] p-8 sm:p-10 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.1)] border border-[#e2e8f0] lg:sticky lg:top-24 flex flex-col">
                 
                 <h2 className="text-2xl font-poppins font-black mb-6 flex items-center justify-between pb-5 border-b border-gray-100 text-[#1e293b]">
                    Order Summary
                    <span className="text-[11px] font-black uppercase tracking-widest text-primary-700 bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-100">{checkoutItems.length} Items</span>
                 </h2>

                 {/* Items Scrollable List */}
                 <div className="space-y-5 overflow-y-auto custom-scrollbar pr-2 mb-6 max-h-[250px]">
                    {checkoutItems.map((item, index) => (
                       <div key={index} className="flex gap-4 group">
                          <div className="w-16 h-24 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0 shadow-sm relative">
                             <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          </div>
                          <div className="flex-1 flex flex-col justify-center">
                             <h4 className="font-bold text-[15px] leading-tight line-clamp-2 mb-1 text-[#1e293b]">{item.title}</h4>
                             <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">{item.format}</p>
                             <div className="flex justify-between items-center text-[#1e293b] mt-auto">
                                <span className="font-black">₹{(item.price || 0).toFixed(2)}</span>
                                <span className="text-gray-400 text-xs font-bold bg-gray-50 px-2 py-0.5 rounded border border-gray-100">Qty: {item.qty || item.quantity || 1}</span>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>

                 {/* Coupon Block */}
                 <div className="mb-6 pt-6 border-t border-gray-100">
                    <label className={labelClass}>Discount Code</label>
                    {!appliedCoupon ? (
                      <div className="flex gap-2">
                        <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="e.g. PUSTAK20" className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold uppercase disabled:bg-gray-100 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"/>
                        <button onClick={handleApplyCoupon} className="px-5 py-3 bg-[#1e293b] text-white font-bold rounded-xl text-sm hover:bg-black transition-colors">Apply</button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
                        <div className="flex items-center gap-2">
                           <Tag size={16} className="text-green-600"/>
                           <span className="font-bold text-green-800 text-sm">{appliedCoupon.code}</span>
                           <span className="text-xs font-black text-green-600 uppercase tracking-widest ml-1 bg-green-100 px-2 py-0.5 rounded">Applied</span>
                        </div>
                        <button onClick={removeCoupon} className="text-green-600 hover:text-green-800 p-1"><X size={16}/></button>
                      </div>
                    )}
                 </div>

                 {/* Pricing Block */}
                 <div className="space-y-4 py-6 border-t border-gray-100 mb-6">
                    <div className="flex justify-between text-gray-500 text-[15px] font-medium">
                       <span>Subtotal</span>
                       <span className="font-bold text-[#1e293b]">₹{subtotal.toFixed(2)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-green-600 text-[15px] font-bold">
                         <span>Discount ({appliedCoupon?.discountPercent}%)</span>
                         <span>-₹{discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-500 text-[15px] font-medium">
                       <span>GST Tax ({gstPercentage}%)</span>
                       <span className="font-bold text-[#1e293b]">₹{tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500 text-[15px] font-medium items-center">
                       <span>Shipping {hasHardcopy ? '' : '(Digital)'}</span>
                       {shipping > 0 ? (
                         <span className="font-bold text-[#1e293b]">₹{shipping.toFixed(2)}</span>
                       ) : (
                         <span className="font-black text-[10px] uppercase tracking-widest text-primary-600 bg-primary-50 px-2 py-1 rounded-md border border-primary-100">Free</span>
                       )}
                    </div>
                 </div>

                 {/* Total and CTA */}
                 <div className="mt-auto">
                    <div className="flex justify-between items-end mb-8 bg-[#f8fafc] px-6 py-5 rounded-2xl border border-[#e2e8f0] relative">
                       {(!hasHardcopy && paymentMethod === 'COD') && (
                          <div className="absolute -top-12 left-0 right-0 bg-red-50 text-red-600 border border-red-200 text-center text-xs font-bold py-2 rounded-xl flex justify-center items-center gap-2 shadow-sm"><Info size={14}/> COD is not available for Digital Items</div>
                       )}
                       <span className="text-sm font-black text-[#1e293b] uppercase tracking-widest">Total Pay</span>
                       <span className="text-3xl font-black text-primary-600 font-poppins leading-none">
                         ₹{total.toFixed(2)}
                       </span>
                    </div>

                    <button 
                      type="submit"
                      form="checkout-form"
                      disabled={isProcessing}
                      className="w-full bg-primary-600 text-white font-black text-[17px] py-4.5 rounded-2xl shadow-[0_10px_30px_rgba(106,13,173,0.3)] hover:shadow-[0_15px_40px_rgba(106,13,173,0.4)] hover:bg-primary-700 transition-all flex justify-center items-center gap-3 group active:scale-[0.98] disabled:opacity-90 disabled:pointer-events-none overflow-hidden relative"
                    >
                      {isProcessing && <div className="absolute inset-0 bg-primary-800 flex items-center justify-center z-10"><div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div></div>}
                      <span className={isProcessing ? 'opacity-0' : 'opacity-100 flex items-center gap-3'}>Place Order <ChevronRight size={22} className="group-hover:translate-x-1.5 transition-transform" /></span>
                    </button>
                    
                    <p className="flex items-center justify-center gap-2 mt-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                       <ShieldCheck size={14} className="text-emerald-500" /> Secured by Premium Gateway
                    </p>
                 </div>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;
