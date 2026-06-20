import { useState, useMemo } from 'react';
import usePageMeta from '../hooks/usePageMeta';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, MessageCircleQuestion, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const faqsData = [
  {
    category: "General Questions",
    items: [
      { q: "What is Pustak Maza?", a: "Pustak Maza is a premium digital and physical publication network that connects readers with amazing stories. We offer ebooks, audiobooks, and physical hardcovers." },
      { q: "Do I need an account to browse books?", a: "No, you can browse our catalog freely. However, creating an account is necessary to track your reading progress, add items to your wishlist, or make a purchase." },
      { q: "How do I become an author on the platform?", a: "We have an Author portal! When registering, select 'Author' or upgrade your account in the dashboard to submit your manuscripts and manage your sales." }
    ]
  },
  {
    category: "Orders and Payments",
    items: [
      { q: "How do I purchase a book?", a: "Simply add the desired book format to your cart, proceed to checkout, and enter your payment details. We process payments securely via Stripe." },
      { q: "What payment methods do you accept?", a: "We accept all major credit cards, debit cards, and UPI (where applicable)." },
      { q: "Can I cancel my order?", a: "Physical book orders can be canceled before they ship. Digital items (ebooks/audiobooks) cannot be canceled once the payment is successful." }
    ]
  },
  {
    category: "Ebook & Audiobook Access",
    items: [
      { q: "How do I access my ebook?", a: "Once purchased, navigate to 'My Library' from your account dropdown. Click 'Read' on any ebook to launch our immersive Ebook Reader." },
      { q: "Can I download audiobooks for offline listening?", a: "Currently, audiobooks must be streamed directly through our web-based Audio Player. Offline downloads will be available in an upcoming mobile app release." },
      { q: "Are ebooks DRM protected?", a: "Yes, our digital content is protected to ensure our authors receive fair royalties. Ebooks can only be read within the Pustak Maza reader." }
    ]
  },
  {
    category: "Account and Login",
    items: [
      { q: "How do I reset my password?", a: "Click on the 'Forgot Password' link on the login page. Enter your email, and we will send you a secure link to create a new password." },
      { q: "How do I update my profile information?", a: "Log in to your account, visit the 'My Profile' section, and you can edit your name, phone number, and avatar." }
    ]
  },
  {
    category: "Support",
    items: [
      { q: "How do I contact support?", a: "You can reach out to us via the Contact Us page or email support@pustakmaza.com." },
      { q: "What are your support hours?", a: "Our team operates Monday to Friday, 9 AM to 6 PM IST. We strive to reply to all queries within 24 hours." }
    ]
  }
];

const FAQ = () => {
  usePageMeta('FAQ', 'Find answers to frequently asked questions about Pustak Maza books, orders, payments, and digital access.');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState(`0-0`); // By default open first item
  const [activeCategory, setActiveCategory] = useState('All');

  // Flatten and filter FAQs based on search
  const filteredFaqs = useMemo(() => {
    let result = [];
    faqsData.forEach((cat, catIndex) => {
      if (activeCategory !== 'All' && activeCategory !== cat.category) return;
      
      const filteredItems = cat.items.filter(item => 
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.a.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      if (filteredItems.length > 0) {
        result.push({
          category: cat.category,
          catIndex,
          items: filteredItems
        });
      }
    });
    return result;
  }, [searchQuery, activeCategory]);

  const categories = ['All', ...faqsData.map(c => c.category)];

  const toggleAccordion = (id) => {
    if (openIndex === id) {
      setOpenIndex(null);
    } else {
      setOpenIndex(id);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-200/20 blur-[120px] rounded-full pointer-events-none z-0 translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Header section */}
        <div className="text-center mb-16">
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.6 }}
             className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 mb-6"
          >
             <MessageCircleQuestion size={30} className="text-primary-600"/>
          </motion.div>
          <motion.h1 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.6, delay: 0.1 }}
             className="text-4xl md:text-5xl font-poppins font-extrabold text-[#1e293b] mb-4"
          >
             How can we help?
          </motion.h1>
          <motion.p 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.6, delay: 0.2 }}
             className="text-lg text-[#64748b] font-inter max-w-2xl mx-auto mb-10"
          >
            Search our knowledge base or browse categories to find answers to your questions.
          </motion.p>

          {/* Search Bar */}
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.6, delay: 0.3 }}
             className="max-w-2xl mx-auto relative group"
          >
             <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-600 transition-colors">
               <Search size={24} />
             </div>
             <input 
               type="text" 
               placeholder="Search for answers..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-16 pr-6 py-5 bg-white border border-gray-200 rounded-full text-lg text-[#1e293b] placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all font-inter shadow-lg shadow-gray-200/50"
             />
          </motion.div>
        </div>

        {/* Content Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Categories Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="w-full lg:w-1/4 shrink-0"
          >
             <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-24">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 pl-4">Categories</h3>
                <div className="flex flex-col gap-2">
                   {categories.map(cat => (
                      <button 
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`text-left px-4 py-3 rounded-xl font-bold transition-all ${activeCategory === cat ? 'bg-primary-50 text-primary-700' : 'text-[#64748b] hover:bg-gray-50 hover:text-[#1e293b]'}`}
                      >
                         {cat}
                      </button>
                   ))}
                </div>

                <div className="mt-8 pt-8 border-t border-gray-100 px-4">
                   <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Still need help?</h3>
                   <Link to="/contact" className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-bold bg-[#1e293b] text-white hover:bg-primary-600 transition-colors">
                      <Mail size={18} /> Contact Us
                   </Link>
                </div>
             </div>
          </motion.div>

          {/* Accordions */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="w-full lg:w-3/4"
          >
             {filteredFaqs.length > 0 ? (
                <div className="space-y-10">
                   {filteredFaqs.map((section) => (
                      <div key={section.category}>
                         <h3 className="text-2xl font-poppins font-black text-[#1e293b] mb-6 pl-2">{section.category}</h3>
                         <div className="space-y-4">
                            {section.items.map((item, idx) => {
                               const id = `${section.catIndex}-${idx}`;
                               const isOpen = openIndex === id;
                               return (
                                 <div 
                                    key={idx} 
                                    className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'border-primary-200 shadow-md shadow-primary-500/5' : 'border-gray-100 shadow-sm hover:border-gray-200'}`}
                                 >
                                    <button 
                                      onClick={() => toggleAccordion(id)}
                                      className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 focus:outline-none"
                                    >
                                       <span className={`font-bold font-inter text-lg transition-colors ${isOpen ? 'text-primary-700' : 'text-[#1e293b]'}`}>
                                          {item.q}
                                       </span>
                                       <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-primary-100 text-primary-600' : 'bg-gray-50 text-gray-400'}`}>
                                          <ChevronDown size={20} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
                                       </div>
                                    </button>
                                    <AnimatePresence>
                                       {isOpen && (
                                          <motion.div 
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="overflow-hidden"
                                          >
                                             <div className="px-6 pb-6 pt-2 text-[#475569] font-inter leading-relaxed text-[15px]">
                                                {item.a}
                                             </div>
                                          </motion.div>
                                       )}
                                    </AnimatePresence>
                                 </div>
                               );
                            })}
                         </div>
                      </div>
                   ))}
                </div>
             ) : (
                <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
                   <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                      <Search size={32} />
                   </div>
                   <h3 className="text-2xl font-poppins font-bold text-[#1e293b] mb-2">No results found</h3>
                   <p className="text-[#64748b]">We couldn't find any FAQs matching "{searchQuery}". Try adjusting your search terms.</p>
                </div>
             )}
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default FAQ;
