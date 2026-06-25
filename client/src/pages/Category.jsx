import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, Star, ShoppingCart, Heart, Headphones, BookOpen, Package, ChevronDown, ChevronRight, Hash, Check } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import { toast } from 'sonner';
import { FORMATS, CATEGORIES } from './Shop';
import BookSlider from '../components/home/BookSlider';
import usePageMeta from '../hooks/usePageMeta';
import axios from '../api/axios';
import { getOptimizedImageUrl } from '../utils/image';
import { getCategoryEmoji } from '../utils/categoryHelper';

// ==========================================
// PREDEFINED METADATA FOR BANNERS
// ==========================================
const CATEGORY_META = {
  'fiction': { title: 'Fiction Books', desc: 'Dive into our vast collection of imaginative storytelling and gripping narratives that transport you to alternate realities.', bg: 'bg-gradient-to-r from-primary-900 via-primary-800 to-primary-600', icon: '✨' },
  'science-fiction': { title: 'Science Fiction', desc: 'Explore futuristic concepts, advanced technology, and space exploration epics.', bg: 'bg-gradient-to-r from-blue-900 via-indigo-800 to-indigo-600', icon: '🚀' },
  'self-help': { title: 'Self-Help & Wellness', desc: 'Transform your life with actionable advice and profound psychological insights from acclaimed authors.', bg: 'bg-gradient-to-r from-emerald-900 via-teal-800 to-teal-600', icon: '🌱' },
  'history': { title: 'History & Culture', desc: 'Uncover the foundational events that shaped our world and defined human civilization across centuries.', bg: 'bg-gradient-to-r from-amber-900 via-orange-800 to-orange-600', icon: '🏛️' },
  'business': { title: 'Business & Economy', desc: 'Master the corporate landscape with aggressive strategies and proven framework implementations.', bg: 'bg-gradient-to-r from-slate-900 via-slate-800 to-primary-900', icon: '💼' },
  'biography': { title: 'Biography & Memoirs', desc: 'Intimate retellings and inspirational historical accounts of the figures who shifted the paradigm.', bg: 'bg-gradient-to-r from-purple-900 via-[#1e293b] to-[#0f172a]', icon: '📜' },
  'romance': { title: 'Romance & Fiction', desc: 'Explore passionate encounters and deeply emotional interwoven human connections.', bg: 'bg-gradient-to-r from-rose-900 via-pink-800 to-pink-600', icon: '❤️' },
  'science': { title: 'Science & Cosmos', desc: 'Decrypt the fundamental laws of nature, astrophysics, and quantum reality.', bg: 'bg-gradient-to-r from-cyan-900 via-blue-800 to-primary-800', icon: '🧬' }
};

// Helper to get minimum price of any format or the selected formats
const getBookPrice = (book, formatsFilter) => {
  if (formatsFilter && formatsFilter.length > 0) {
    const prices = formatsFilter
      .filter(f => book.formats && book.formats[f]?.isAvailable)
      .map(f => book.formats[f]?.price ?? 0);
    if (prices.length > 0) {
      return Math.min(...prices);
    }
  }
  const availablePrices = [];
  if (book.formats?.ebook?.isAvailable) availablePrices.push(book.formats.ebook.price ?? 0);
  if (book.formats?.audiobook?.isAvailable) availablePrices.push(book.formats.audiobook.price ?? 0);
  if (book.formats?.hardcopy?.isAvailable) availablePrices.push(book.formats.hardcopy.price ?? 0);
  
  if (availablePrices.length > 0) {
    return Math.min(...availablePrices);
  }
  return book.price ?? 0;
};

const Category = () => {
  const { slug } = useParams();
  
  const [categories, setCategories] = useState([]);
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFormats, setSelectedFormats] = useState([]);
  const [priceRange, setPriceRange] = useState(1500); 
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('latest');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Resolve Category Names
  const formatSlug = slug ? slug.toLowerCase().replace(/-/g, ' ') : '';
  const matchedCategoryObj = categories.find(c => c.slug?.toLowerCase() === slug?.toLowerCase());
  const categoryNameForEmoji = matchedCategoryObj ? matchedCategoryObj.name : formatSlug;

  const meta = CATEGORY_META[slug?.toLowerCase()] || {
     title: `${formatSlug.charAt(0).toUpperCase() + formatSlug.slice(1)} Books`,
     desc: `Explore our comprehensively curated array of ${formatSlug} literature and format options.`,
     bg: 'bg-gradient-to-r from-primary-900 via-[#1e293b] to-[#0f172a]',
     icon: getCategoryEmoji(categoryNameForEmoji)
  };

  const activeCategoryStr = useMemo(() => {
    if (categories.length > 0) {
      const matched = categories.find(c => c.slug.toLowerCase() === slug?.toLowerCase() || c.name.toLowerCase() === formatSlug);
      if (matched) return matched.name;
    }
    return formatSlug ? formatSlug.charAt(0).toUpperCase() + formatSlug.slice(1) : '';
  }, [categories, slug]);

  usePageMeta(`${meta.title} | Pustak Maza`, `Browse ${meta.title} on Pustak Maza. Explore ebooks, audiobooks and hardcopy editions.`, true);
  
  const addToCart = useCartStore(s => s.addToCart);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooksAndCategories = async () => {
      try {
        const [booksRes, categoriesRes] = await Promise.all([
          axios.get('/books'),
          axios.get('/categories')
        ]);

        const sanitized = booksRes.data.map(b => ({
          ...b,
          formats: {
            hardcopy: b.formats?.hardcopy || { price: b.price || 0, stock: 0, isAvailable: false },
            ebook: b.formats?.ebook || { price: b.price || 0, isAvailable: false },
            audiobook: b.formats?.audiobook || { price: b.price || 0, isAvailable: false },
          }
        }));
        setBooks(sanitized);
        setCategories(categoriesRes.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBooksAndCategories();
    window.scrollTo(0,0);
  }, [slug]);

  const toggleFilter = (stateArr, setState, value) => {
    if (stateArr.includes(value)) setState(stateArr.filter(i => i !== value));
    else setState([...stateArr, value]);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedFormats([]);
    setPriceRange(1500);
    setMinRating(0);
    setSortBy('latest');
    setIsMobileFilterOpen(false);
  };

  // Complex multi-axis real-time evaluating engine scoped strictly to the URL category
  const filteredBooks = useMemo(() => {
    let result = books.filter(book => {
      // 0. Base Category Enforcement
      const targetSlug = slug ? slug.toLowerCase() : '';
      if (targetSlug) {
        const bookCatName = (book.category?.name || '').toLowerCase();
        const bookCatSlug = (book.category?.slug || '').toLowerCase();
        const bookCatId = (book.category?._id || book.category || '').toString().toLowerCase();

        const matchesSlug = bookCatSlug === targetSlug || 
                            bookCatName.replace(/\s+/g, '-') === targetSlug ||
                            bookCatId === targetSlug;
        if (!matchesSlug) return false;
      }

      // 1. Text Search Constraints
      if (searchTerm && !book.title.toLowerCase().includes(searchTerm.toLowerCase()) && !book.authorName?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      
      // 2. Format Requirements
      if (selectedFormats.length > 0) {
        const hasFormat = selectedFormats.some(f => book.formats && book.formats[f]?.isAvailable);
        if (!hasFormat) return false;
      }
      
      // 3. Rating Constraints
      if ((book.rating || 4.5) < minRating) return false;
      
      // 4. Dynamic Smart Pricing Evaluation (Based on formats requested)
      const checkPrice = getBookPrice(book, selectedFormats);
      if (checkPrice > priceRange) return false;

      return true;
    });

    // Final Post-Filter Sorting
    switch(sortBy) {
      case 'price-low': result.sort((a,b) => getBookPrice(a, selectedFormats) - getBookPrice(b, selectedFormats)); break;
      case 'price-high': result.sort((a,b) => getBookPrice(b, selectedFormats) - getBookPrice(a, selectedFormats)); break;
      case 'rating': result.sort((a,b) => (b.rating || 4.5) - (a.rating || 4.5)); break;
      case 'popular': result.sort((a,b) => Math.random() - 0.5); break; // Mock popular
      case 'latest': result.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
      default: break; 
    }

    return result;
  }, [books, searchTerm, selectedFormats, priceRange, minRating, sortBy, activeCategoryStr]);

  const handleAdd = (e, book) => {
    e.preventDefault();
    const formatToUse = selectedFormats.length > 0 ? selectedFormats[0] : (book.formats?.hardcopy?.isAvailable ? 'hardcopy' : book.formats?.ebook?.isAvailable ? 'ebook' : 'audiobook');
    if(!book.formats[formatToUse]) return;
    addToCart({ book: book._id, title: book.title, coverImage: book.coverImage, format: formatToUse, price: book.formats[formatToUse].price, qty: 1 });
    toast.success(`${book.title} added to cart!`);
  };

  const handleBuyNow = (e, book) => {
    e.preventDefault();
    const formatToUse = selectedFormats.length > 0 ? selectedFormats[0] : (book.formats?.hardcopy?.isAvailable ? 'hardcopy' : book.formats?.ebook?.isAvailable ? 'ebook' : 'audiobook');
    if (!book.formats[formatToUse]) return;
    const buyNowItem = {
      book: book._id,
      title: book.title,
      image: book.coverImage,
      coverImage: book.coverImage,
      format: formatToUse,
      price: book.formats[formatToUse].price,
      qty: 1
    };
    sessionStorage.setItem('tempBuyNow', JSON.stringify(buyNowItem));
    navigate('/checkout', { state: { buyNowItem } });
  };

  const BookCard = ({ book }) => {
    const defaultFormat = book.formats?.hardcopy?.isAvailable ? 'hardcopy' : book.formats?.ebook?.isAvailable ? 'ebook' : 'audiobook';
    const activeFormat = selectedFormats.length > 0 && book.formats[selectedFormats[0]]?.isAvailable ? selectedFormats[0] : defaultFormat;
    const renderPrice = book.formats[activeFormat]?.price ?? book.price;

    return (
      <Link to={`/book/${book._id}`} className="group relative bg-white border border-[#e2e8f0] rounded-3xl overflow-hidden shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-15px_rgba(106,13,173,0.2)] hover:border-primary-200 transition-all duration-500 flex flex-col h-full transform hover:-translate-y-2">
         {/* Adaptive Format Icon Badge */}
         <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-sm text-[#1e293b] shadow-sm border border-[#e2e8f0] text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest flex items-center gap-2">
           {activeFormat === 'audiobook' && <><Headphones size={14} className="text-primary-600"/> Audio</>}
           {activeFormat === 'ebook' && <><BookOpen size={14} className="text-primary-600"/> Ebook</>}
           {activeFormat === 'hardcopy' && <><Package size={14} className="text-primary-600"/> Physical</>}
         </div>
         
         {/* Hover Heart Action */}
         <button className="absolute top-4 right-4 z-30 w-10 h-10 flex flex-col items-center justify-center bg-white/95 hover:bg-white backdrop-blur-sm rounded-xl text-gray-400 hover:text-red-500 shadow-sm transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100" onClick={e => { e.preventDefault(); toast.success('Saved to wishlist'); }}>
           <Heart size={20} />
         </button>

         {/* Full Bleed Image Block */}
         <div className="w-full h-72 sm:h-80 relative overflow-hidden bg-[#f8fafc] shrink-0 border-b border-[#f1f5f9]">
           <div className="absolute inset-0 bg-gradient-to-t from-[#1e293b]/60 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"/>
           <img src={getOptimizedImageUrl(book.coverImage, 300)} alt={book.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out relative z-0" />
         </div>
         
         <div className="p-6 flex flex-col flex-grow relative z-20">
           <span className="text-[11px] text-primary-600 font-black uppercase tracking-[0.2em] mb-2">{book.category?.name || book.category}</span>
           <h3 className="font-extrabold text-xl leading-snug text-[#1e293b] mb-1.5 line-clamp-2 group-hover:text-primary-600 transition-colors font-poppins">{book.title}</h3>
           <p className="text-sm text-[#64748b] font-bold uppercase tracking-widest mb-6 flex-grow">{book.authorName}</p>
           
           <div className="flex justify-between items-end mb-6">
             <div className="flex flex-col">
               <span className="text-[11px] text-gray-400 font-extrabold uppercase tracking-widest mb-1">Price</span>
               <span className={`text-3xl font-black leading-none font-poppins ${renderPrice === 0 ? "text-emerald-600" : "text-primary-700"}`}>{renderPrice === 0 ? "Free" : `₹${renderPrice}`}</span>
             </div>
             <div className="flex items-center text-primary-600 font-black text-sm bg-primary-50 px-2.5 py-1 rounded-lg border border-primary-100">
                <Star size={14} fill="currentColor" className="mr-1.5"/> {book.rating}
             </div>
           </div>

           <div className="flex gap-3 mt-auto">
             <button onClick={(e) => handleBuyNow(e, book)} className="flex-[2] py-4 rounded-xl bg-primary-500 text-white font-black flex items-center justify-center gap-2 hover:bg-primary-600 shadow-[0_8px_20px_-5px_rgba(106,13,173,0.3)] transition-all">
               Buy Now
             </button>
             <button onClick={(e) => handleAdd(e, book)} className="flex-1 rounded-xl border-2 border-primary-100 bg-primary-50 text-primary-600 font-extrabold flex items-center justify-center hover:bg-primary-100 hover:text-primary-700 transition-colors">
               <ShoppingCart size={20} />
             </button>
           </div>
         </div>
      </Link>
    );
  };

  const FilterPanel = () => (
     <div className="flex flex-col gap-10 h-full">
       <div className="flex items-center justify-between pb-6 border-b border-[#e2e8f0]">
          <h3 className="font-black text-2xl text-[#1e293b] flex items-center gap-3 font-poppins"><Filter size={24} className="text-primary-500"/> Filters</h3>
          <button onClick={clearFilters} className="text-sm font-black text-primary-600 hover:text-primary-800 uppercase tracking-widest transition-colors">Clear</button>
       </div>

       {/* Search Bar Block */}
       <div>
         <label className="text-xs font-black text-[#64748b] uppercase tracking-[0.2em] mb-4 block">Search Category</label>
         <div className="relative">
           <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
           <input type="text" placeholder="Title or Author..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 ring-primary-500 font-bold text-[#1e293b] shadow-inner" />
         </div>
       </div>

       {/* Formats Checkboxes */}
       <div>
         <label className="text-xs font-black text-[#64748b] uppercase tracking-[0.2em] mb-4 block">Delivery Format</label>
         <div className="flex flex-col gap-4">
           {FORMATS.map(f => (
             <label key={f.id} className="flex items-center gap-4 cursor-pointer group">
               <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${selectedFormats.includes(f.id) ? 'bg-primary-500 border-primary-500' : 'border-gray-300 group-hover:border-primary-400 bg-white'}`}>
                  {selectedFormats.includes(f.id) && <Check size={14} strokeWidth={4} className="text-white"/>}
               </div>
               <span className={`font-bold text-lg transition-colors ${selectedFormats.includes(f.id) ? 'text-primary-700' : 'text-[#64748b] group-hover:text-[#1e293b]'}`}>{f.label}</span>
               <input type="checkbox" checked={selectedFormats.includes(f.id)} onChange={() => toggleFilter(selectedFormats, setSelectedFormats, f.id)} className="hidden" />
             </label>
           ))}
         </div>
       </div>

       {/* Advanced Price Slider */}
       <div>
         <label className="text-xs font-black text-[#64748b] uppercase tracking-[0.2em] mb-4 flex justify-between">
           <span>Max Price</span>
           <span className="text-primary-600 text-lg -mt-1">₹{priceRange}</span>
         </label>
         <input type="range" min="100" max="1500" step="50" value={priceRange} onChange={e => setPriceRange(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600" />
       </div>

       {/* Rating Radio/Chips */}
       <div>
          <label className="text-xs font-black text-[#64748b] uppercase tracking-[0.2em] mb-4 block">Minimum Rating</label>
          <div className="flex flex-col gap-3">
             {[0, 3, 4, 4.5].map(r => (
               <button key={r} onClick={() => setMinRating(r)} className={`w-full text-left px-5 py-3.5 rounded-xl text-sm font-black border-2 transition-all flex items-center gap-3 ${minRating === r ? 'bg-primary-50 text-primary-600 border-primary-500 shadow-sm' : 'bg-white border-[#e2e8f0] text-[#64748b] hover:border-primary-200 hover:text-[#1e293b]'}`}>
                 <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${minRating === r ? 'border-primary-600' : 'border-gray-300'}`}>
                    {minRating === r && <div className="w-2 h-2 bg-primary-600 rounded-full"/>}
                 </div>
                 {r === 0 ? "Any Rating" : `${r}+ Stars`}
               </button>
             ))}
          </div>
       </div>
       
       {/* Explicit Mobile Apply Button */}
       <div className="mt-auto pt-6 lg:hidden pb-10 border-t border-gray-100">
          <button onClick={() => setIsMobileFilterOpen(false)} className="w-full bg-primary-500 text-white font-black text-xl py-5 rounded-2xl shadow-[0_10px_20px_-5px_rgba(106,13,173,0.4)] hover:bg-primary-600 transition-all active:scale-95">Apply Selected ({filteredBooks.length})</button>
       </div>
     </div>
  );

  return (
    <div className="w-full min-h-screen bg-[#f8fafc]">
      
      {/* ======================================= */}
      {/* 1. MASSIVE PREMIUM CATEGORY HEADER */}
      {/* ======================================= */}
      <div className={`relative pt-24 pb-20 overflow-hidden ${meta.bg}`}>
         {/* Abstract Geometric Background Blur */}
         <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[80px] translate-x-1/2 -translate-y-1/4 pointer-events-none"></div>
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/20 rounded-full blur-[60px] -translate-x-1/3 translate-y-1/3 pointer-events-none"></div>
         
         <div className="max-w-[1400px] mx-auto px-6 sm:px-12 relative z-10 text-white">
            <div className="flex items-center gap-3 text-sm font-black text-white/70 uppercase tracking-widest mb-8 bg-black/10 w-fit px-4 py-2 rounded-xl backdrop-blur-md">
               <Link to="/" className="hover:text-white transition-colors">Home</Link>
               <ChevronRight size={16} />
               <Link to="/categories" className="hover:text-white transition-colors">Categories</Link>
               <ChevronRight size={16} />
               <span className="text-white">{activeCategoryStr}</span>
            </div>
            
            <div className="flex items-center gap-6 mb-6">
               <span className="text-5xl md:text-7xl filter drop-shadow-lg">{meta.icon}</span>
               <h1 className="text-5xl md:text-7xl font-black font-poppins tracking-tight drop-shadow-md">{meta.title}</h1>
            </div>
            <p className="text-xl md:text-2xl text-white/90 font-medium max-w-3xl leading-relaxed drop-shadow-sm">{meta.desc}</p>
         </div>
      </div>

      {/* Mobile Top Information & Actions Bar */}
      <div className="lg:hidden sticky top-[72px] z-30 bg-white/90 backdrop-blur-xl border-b border-[#e2e8f0] px-6 py-4 flex justify-between items-center shadow-sm">
         <span className="font-black text-[#1e293b] text-lg font-poppins flex items-center gap-2"><Hash size={20} className="text-primary-500"/> {filteredBooks.length} Results</span>
         <button onClick={() => setIsMobileFilterOpen(true)} className="flex items-center gap-2 bg-[#1e293b] text-white px-6 py-3 rounded-xl font-bold shadow-md active:scale-95 transition-transform">
           <Filter size={18}/> Filter
         </button>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-10 lg:py-16 flex items-start gap-12 relative">
        
        {/* Desktop Absolute Left Sidebar */}
        <aside className="hidden lg:block w-[320px] shrink-0 sticky top-32 max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar p-10 bg-white border border-[#e2e8f0] rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
           <FilterPanel />
        </aside>

        {/* Framer Motion Mobile Slide-in Drawer overlay */}
        <AnimatePresence>
          {isMobileFilterOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-[#1e293b]/70 backdrop-blur-sm lg:hidden flex justify-end">
              <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col pt-8 px-8 overflow-y-auto relative rounded-l-[2rem]">
                <button onClick={() => setIsMobileFilterOpen(false)} className="absolute top-8 right-8 w-12 h-12 bg-[#f8fafc] border-2 border-[#e2e8f0] rounded-full flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition-all z-20">
                  <X size={24}/>
                </button>
                <div className="mt-6 flex-grow relative z-10">
                  <FilterPanel />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Master Active Content Grid */}
        <div className="flex-1 w-full min-w-0">
          
          <div className="hidden lg:flex justify-between items-center mb-10 bg-white px-8 py-6 rounded-[2rem] border border-[#e2e8f0] shadow-sm">
             <span className="font-black text-[#1e293b] text-2xl font-poppins flex items-center gap-3">
               <Hash size={24} className="text-primary-500"/> Explore {filteredBooks.length} Titles
             </span>
             <div className="flex items-center gap-4">
               <span className="text-[#64748b] font-black text-sm uppercase tracking-widest">Sort By</span>
               <div className="relative">
                 <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="appearance-none bg-[#f8fafc] border-2 border-[#e2e8f0] text-[#1e293b] font-bold text-lg py-3 pl-6 pr-14 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 cursor-pointer shadow-inner hover:bg-gray-100 transition-colors">
                   <option value="latest">Latest Arrivals</option>
                   <option value="popular">Most Popular</option>
                   <option value="price-low">Price: Low to High</option>
                   <option value="price-high">Price: High to Low</option>
                   <option value="rating">Highest Rated</option>
                 </select>
                 <ChevronDown size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-primary-600 pointer-events-none"/>
               </div>
             </div>
          </div>

          <div className="lg:hidden flex items-center justify-between gap-4 mb-8 bg-white p-4 rounded-2xl border border-[#e2e8f0] shadow-sm">
             <span className="text-[#1e293b] font-black text-xs uppercase tracking-widest ml-2">Sort</span>
             <div className="relative flex-1">
               <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="appearance-none w-full bg-[#f8fafc] border border-[#e2e8f0] text-[#1e293b] font-bold text-base py-3 pl-5 pr-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 cursor-pointer shadow-inner">
                 <option value="latest">Latest Arrivals</option>
                 <option value="popular">Most Popular</option>
                 <option value="price-low">Low to High</option>
                 <option value="price-high">High to Low</option>
                 <option value="rating">Highest Rated</option>
               </select>
               <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-500 pointer-events-none"/>
             </div>
          </div>

          {filteredBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredBooks.map(book => (
                <BookCard key={book._id} book={book} />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-[#e2e8f0] rounded-[3rem] p-20 flex flex-col items-center justify-center text-center shadow-sm min-h-[50vh]">
               <div className="w-32 h-32 bg-primary-50 text-primary-500 rounded-full flex items-center justify-center mb-8 shadow-inner border shadow-[inset_0_4px_10px_rgba(106,13,173,0.1)]">
                 <Search size={50}/>
               </div>
               <h3 className="text-4xl font-black text-[#1e293b] mb-4 font-poppins">No Books Found</h3>
               <p className="text-[#64748b] text-xl font-medium mb-12 max-w-lg leading-relaxed">We couldn't find any titles across our <strong className="text-[#1e293b]">"{formatSlug}"</strong> catalog that precisely match your active filters.</p>
               <button onClick={clearFilters} className="bg-primary-500 hover:bg-primary-600 text-white font-black text-xl px-12 py-5 rounded-2xl shadow-[0_15px_30px_-5px_rgba(106,13,173,0.4)] transition-all transform hover:-translate-y-1 active:scale-95">
                 Reset All Filters
               </button>
            </div>
          )}
        </div>

      </div>
      
      {/* Optional: Related Global Suggestions slider */}
      <div className="mt-10 border-t border-[#e2e8f0] bg-white pt-20 pb-20 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
            <BookSlider 
              title="You May Also Like" 
              books={books.filter(b => {
                const catSlug = b.category?.slug || b.category?.name?.toLowerCase().replace(/\s+/g, '-') || (typeof b.category === 'string' ? b.category : '');
                return catSlug.toLowerCase() !== slug?.toLowerCase();
              }).slice(0, 4)} 
            />
        </div>
      </div>
    </div>
  );
};

export default Category;
