import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, Send, MessageCircle, ArrowRight, Building2, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import usePageMeta from '../hooks/usePageMeta';
import axios from '../api/axios';

// Custom WhatsApp Icon for Premium Authentication
const WhatsAppIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
  </svg>
)

const Contact = () => {
  usePageMeta('Contact', 'Contact Pustak Maza for publishing, books, and general inquiries. Reach us by phone, email or WhatsApp.');
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings, setSettings] = useState({
    storeName: 'Pustak Maza',
    supportEmail: 'support@pustakmaza.com',
    contactPhone: '+91 93224 65522',
    contactWhatsApp: '919322465522',
    contactAddress: 'Pustak Maza HQ, Pune, Maharashtra, India',
    contactHours: 'Mon - Sat: 9:00 AM - 6:00 PM'
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get('/settings');
        if (data) {
          setSettings({
            storeName: data.storeName || 'Pustak Maza',
            supportEmail: data.supportEmail || 'support@pustakmaza.com',
            contactPhone: data.contactPhone || '+91 93224 65522',
            contactWhatsApp: data.contactWhatsApp || '919322465522',
            contactAddress: data.contactAddress || 'Pustak Maza HQ, Pune, Maharashtra, India',
            contactHours: data.contactHours || 'Mon - Sat: 9:00 AM - 6:00 PM'
          });
        }
      } catch (err) {
        console.error('Error fetching settings for contact page:', err);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post('/contact', formData);
      toast.success("Message sent successfully! Our team will get back to you shortly.");
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsApp = () => {
    const phoneNumber = settings.contactWhatsApp.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(`Hello, I want to know more about ${settings.storeName}.`);
    window.open(`https://wa.me/${phoneNumber}?text=${text}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] w-full font-inter relative pb-20">
      
      {/* Absolute Floating WhatsApp Button (Global to viewport) */}
      <button 
        onClick={handleWhatsApp}
        className="fixed bottom-8 right-8 z-[100] bg-[#25D366] text-white p-4 rounded-full shadow-[0_10px_25px_-5px_rgba(37,211,102,0.5)] hover:scale-110 active:scale-95 transition-all flex items-center justify-center group"
      >
         <WhatsAppIcon size={32}/>
         <span className="absolute right-full mr-4 bg-white text-[#1e293b] text-sm font-bold px-4 py-2 rounded-xl shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap">
           Chat on WhatsApp
         </span>
      </button>

      {/* ======================================= */}
      {/* 1. MASSIVE HERO PAGE HEADER */}
      {/* ======================================= */}
      <div className="relative pt-24 pb-24 overflow-hidden bg-gradient-to-r from-primary-900 via-primary-800 to-secondary-500">
         {/* Abstract Geometric Background Blur */}
         <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[80px] translate-x-1/2 -translate-y-1/4 pointer-events-none"></div>
         <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary-950/40 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3 pointer-events-none"></div>
         
         <div className="max-w-[1400px] mx-auto px-6 sm:px-12 relative z-10 text-center flex flex-col items-center">
            <span className="text-white/80 font-black uppercase tracking-[0.2em] text-sm mb-6 flex items-center gap-2 bg-black/10 px-4 py-2 rounded-xl backdrop-blur-md">
               <Building2 size={16}/> {settings.storeName} Publication
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-[5rem] font-black font-poppins text-white tracking-tight drop-shadow-md mb-6">Contact Us</h1>
            <p className="text-xl md:text-2xl text-primary-50 font-medium max-w-2xl leading-relaxed drop-shadow-sm">Get in touch with {settings.storeName} for publishing, books, and support.</p>
         </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 -mt-16 relative z-20">
         
         {/* ======================================= */}
         {/* 2. MAIN CONTACT SECTION (DUAL COLUMN) */}
         {/* ======================================= */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-20">
            
            {/* LEFT: Contact Information Card */}
            <div className="lg:col-span-5 flex flex-col gap-8">
               <div className="bg-white rounded-[2rem] p-10 lg:p-12 border border-[#e2e8f0] shadow-sm flex-1">
                  <h3 className="text-3xl font-black text-[#1e293b] font-poppins mb-2">Reach Out</h3>
                  <p className="text-[#64748b] font-medium leading-[1.8] mb-10 pb-10 border-b border-gray-100">Our dedicated support team is available to assist you with order inquiries, publishing pipelines, and enterprise partnerships.</p>
                  
                  <div className="flex flex-col gap-8">
                     
                     {/* Phone Block */}
                     <div className="flex items-start gap-5">
                        <div className="w-14 h-14 shrink-0 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center border border-primary-100 shadow-inner">
                           <Phone size={24}/>
                        </div>
                        <div>
                           <span className="text-xs font-black text-[#64748b] uppercase tracking-widest block mb-1">Direct Call</span>
                           <a href={`tel:${settings.contactPhone}`} className="text-xl font-bold text-[#1e293b] hover:text-primary-600 transition-colors">{settings.contactPhone}</a>
                        </div>
                     </div>

                     {/* WhatsApp Block */}
                     <div className="flex items-start gap-5">
                        <div className="w-14 h-14 shrink-0 bg-[#25D366]/10 text-[#25D366] rounded-2xl flex items-center justify-center border border-[#25D366]/20 shadow-inner">
                           <WhatsAppIcon size={28}/>
                        </div>
                        <div>
                           <span className="text-xs font-black text-[#64748b] uppercase tracking-widest block mb-1">WhatsApp Chat</span>
                           <a href="#!" onClick={(e) => {e.preventDefault(); handleWhatsApp();}} className="text-xl font-bold text-[#1e293b] hover:text-[#25D366] transition-colors">+{settings.contactWhatsApp}</a>
                        </div>
                     </div>

                     {/* Email Block */}
                     <div className="flex items-start gap-5">
                        <div className="w-14 h-14 shrink-0 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center border border-primary-100 shadow-inner">
                           <Mail size={24}/>
                        </div>
                        <div>
                           <span className="text-xs font-black text-[#64748b] uppercase tracking-widest block mb-1">Email Address</span>
                           <a href={`mailto:${settings.supportEmail}`} className="text-lg font-bold text-[#1e293b] hover:text-primary-600 transition-colors">{settings.supportEmail}</a>
                        </div>
                     </div>

                     {/* Location Block */}
                     <div className="flex items-start gap-5">
                        <div className="w-14 h-14 shrink-0 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center border border-primary-100 shadow-inner">
                           <MapPin size={24}/>
                        </div>
                        <div>
                           <span className="text-xs font-black text-[#64748b] uppercase tracking-widest block mb-1">Headquarters</span>
                           <p className="text-lg font-bold text-[#1e293b] leading-snug">{settings.contactAddress}</p>
                        </div>
                     </div>

                     {settings.contactAddress2 && (
                        <div className="flex items-start gap-5">
                           <div className="w-14 h-14 shrink-0 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center border border-primary-100 shadow-inner">
                              <MapPin size={24}/>
                           </div>
                           <div>
                              <span className="text-xs font-black text-[#64748b] uppercase tracking-widest block mb-1">Branch Office</span>
                              <p className="text-lg font-bold text-[#1e293b] leading-snug">{settings.contactAddress2}</p>
                           </div>
                        </div>
                     )}

                     {/* Hours Block */}
                     <div className="flex items-start gap-5">
                        <div className="w-14 h-14 shrink-0 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center border border-primary-100 shadow-inner">
                           <Clock size={24}/>
                        </div>
                        <div>
                           <span className="text-xs font-black text-[#64748b] uppercase tracking-widest block mb-1">Working Hours</span>
                           <p className="text-lg font-bold text-[#1e293b]">{settings.contactHours}</p>
                        </div>
                     </div>

                  </div>
               </div>
            </div>

            {/* RIGHT: Contact Form Component */}
            <div className="lg:col-span-7">
               <div className="bg-white rounded-[2rem] p-10 lg:p-12 border border-[#e2e8f0] shadow-[0_20px_50px_-15px_rgba(106,13,173,0.1)] h-full">
                  <h3 className="text-3xl font-black text-[#1e293b] font-poppins mb-2">Send us a message</h3>
                  <p className="text-[#64748b] font-medium mb-10">Fill out the form below and we will resolve your query as quickly as possible.</p>
                  
                  <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                           <label className="text-xs font-black text-[#1e293b] uppercase tracking-widest ml-1">Full Name</label>
                           <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="John Doe" className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold text-[#1e293b] placeholder:text-gray-400 placeholder:font-medium shadow-inner transition-shadow hover:border-primary-200" />
                        </div>
                        <div className="flex flex-col gap-2">
                           <label className="text-xs font-black text-[#1e293b] uppercase tracking-widest ml-1">Email Address</label>
                           <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="john@example.com" className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold text-[#1e293b] placeholder:text-gray-400 placeholder:font-medium shadow-inner transition-shadow hover:border-primary-200" />
                        </div>
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                           <label className="text-xs font-black text-[#1e293b] uppercase tracking-widest ml-1">Phone Number</label>
                           <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="+91 00000 00000" className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold text-[#1e293b] placeholder:text-gray-400 placeholder:font-medium shadow-inner transition-shadow hover:border-primary-200" />
                        </div>
                        <div className="flex flex-col gap-2">
                           <label className="text-xs font-black text-[#1e293b] uppercase tracking-widest ml-1">Subject</label>
                           <select name="subject" value={formData.subject} onChange={handleChange} required className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold text-[#1e293b] shadow-inner transition-shadow hover:border-primary-200 appearance-none cursor-pointer">
                             <option value="" disabled>Select a topic...</option>
                             <option value="Publishing Inquiry">Publishing Inquiry</option>
                             <option value="Bulk Order">Bulk Order</option>
                             <option value="Order Support">Order & Delivery Support</option>
                             <option value="General Question">General Question</option>
                           </select>
                        </div>
                     </div>

                     <div className="flex flex-col gap-2">
                        <label className="text-xs font-black text-[#1e293b] uppercase tracking-widest ml-1">Message</label>
                        <textarea name="message" value={formData.message} onChange={handleChange} required rows={6} placeholder="How can we help you today?" className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium text-lg text-[#1e293b] resize-none shadow-inner transition-shadow hover:border-primary-200 placeholder:text-gray-400"></textarea>
                     </div>

                     <button disabled={isSubmitting} type="submit" className="mt-4 w-full bg-primary-600 text-white font-black text-xl py-5 rounded-2xl shadow-[0_15px_30px_-5px_rgba(106,13,173,0.4)] hover:bg-primary-700 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-3">
                        {isSubmitting ? 'Sending Request...' : <><Send size={22}/> Send Message via Portal</>}
                     </button>
                  </form>
               </div>
            </div>
         </div>

         {/* ======================================= */}
         {/* ADDITIONAL INFO & MAP PLACEHOLDER */}
         {/* ======================================= */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-20">
            {/* Additional Info Block */}
            <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-[2rem] p-10 lg:p-14 text-white relative overflow-hidden shadow-lg border border-gray-800">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/20 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2"></div>
               <div className="relative z-10 h-full flex flex-col justify-center">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-primary-300 mb-8 border border-white/10 backdrop-blur-md shadow-inner">
                    <BookOpen size={30}/>
                  </div>
                  <h4 className="text-3xl font-black font-poppins mb-4">Publishing & General Inquiries</h4>
                  <p className="text-gray-300 text-lg font-medium leading-[1.8] mb-8">For book-related inquiries, publication opportunities, enterprise partnerships, or general technical support, feel free to reach out to us securely. {settings.storeName} represents a leading pipeline for modern regional and distribution protocols.</p>
                  <button onClick={handleWhatsApp} className="w-fit bg-[#25D366] text-white font-black px-8 py-4 rounded-xl flex items-center gap-3 hover:bg-[#20bd5a] transition-colors shadow-md active:scale-95">
                    <WhatsAppIcon size={22}/> Chat on WhatsApp directly
                  </button>
               </div>
            </div>

            {/* Google Map Placeholder Block */}
            <div className="bg-gray-200 rounded-[2rem] overflow-hidden relative shadow-inner border border-gray-300 min-h-[400px] flex flex-col items-center justify-center group cursor-pointer hover:border-primary-400 transition-colors">
               <div className="absolute inset-0 bg-map-pattern opacity-30 mix-blend-multiply"></div> 
               <div className="relative z-10 w-20 h-20 bg-white rounded-full flex items-center justify-center text-red-500 shadow-xl mb-4 group-hover:-translate-y-2 transition-transform duration-500">
                  <MapPin size={32} strokeWidth={2.5}/>
                  <div className="absolute bottom-[-10px] w-6 h-2 bg-black/20 blur-[2px] rounded-[100%]"></div>
               </div>
               <h4 className="relative z-10 text-xl font-black text-[#1e293b] font-poppins text-center px-4">Interactive Maps Integration<br/><span className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-2 block">Available upon deployment</span></h4>
            </div>
         </div>

         {/* ======================================= */}
         {/* 8. FINAL CTA SECTION */}
         {/* ======================================= */}
         <div className="bg-white rounded-[3rem] p-12 lg:p-20 text-center border-2 border-primary-100 shadow-[0_20px_60px_-15px_rgba(106,13,173,0.1)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-transparent"></div>
            <div className="relative z-10 flex flex-col items-center">
               <span className="text-primary-600 font-black uppercase tracking-[0.2em] text-sm mb-4 block">We're Online</span>
               <h3 className="text-4xl md:text-5xl lg:text-5xl font-black text-[#1e293b] font-poppins mb-12">Let's Connect</h3>
               <div className="flex flex-col sm:flex-row gap-5 items-center justify-center w-full max-w-xl mx-auto">
                  <a href={`mailto:${settings.supportEmail}`} className="w-full sm:flex-1 bg-primary-600 text-white font-black text-lg py-5 px-8 rounded-2xl hover:bg-primary-700 shadow-lg hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-3">
                    <Mail size={22}/> Send Email
                  </a>
                  <button onClick={handleWhatsApp} className="w-full sm:flex-1 bg-white border-2 border-[#25D366] text-[#25D366] font-black text-lg py-5 px-8 rounded-2xl hover:bg-[#25D366] hover:text-white shadow-md hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-3">
                    <WhatsAppIcon size={22}/> WhatsApp Chat
                  </button>
               </div>
            </div>
         </div>

      </div>
    </div>
  );
};

export default Contact;
