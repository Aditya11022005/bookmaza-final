import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, Star, ShoppingCart, Heart, Headphones, BookOpen, Package, ChevronDown } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import { toast } from 'sonner';
import usePageMeta from '../hooks/usePageMeta';
import axios from '../api/axios';
import { getOptimizedImageUrl } from '../utils/image';

export const CATEGORIES = ['Fiction', 'Science Fiction', 'Self-Help', 'History', 'Business', 'Biography', 'Romance', 'Science'];
export const FORMATS = [{ id: 'ebook', label: 'Ebook' }, { id: 'audiobook', label: 'Audiobook' }, { id: 'hardcopy', label: 'Hardcopy' }];

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

const Shop = () => {
  usePageMeta('Shop Online - Buy Ebooks, Audiobooks & Hardcopies', 'Browse our full catalog of premium ebooks, audiobooks, and hardcopy novels in Marathi and English. Filter by category, format, and price on Pustak Maza.');
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedFormats, setSelectedFormats] = useState([]);
  const [priceRange, setPriceRange] = useState(1000); 
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('latest');
  
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const addToCart = useCartStore(s => s.addToCart);
  const navigate = useNavigate();
  
  const location = useLocation();

  useEffect(() => {
    const fetchShopData = async () => {
      try {
        const [booksRes, categoriesRes] = await Promise.all([
          axios.get('/books'),
          axios.get('/categories')
        ]);
        setBooks(booksRes.data);
        setCategories(categoriesRes.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchShopData();
  }, []);

  useEffect(() => {
    if (location.pathname.includes('/format/')) {
       const presetFormat = location.pathname.split('/format/')[1];
       if(presetFormat) setSelectedFormats([presetFormat]);
    }
    if (location.pathname.includes('/category/') && categories.length > 0) {
       const presetCat = location.pathname.split('/category/')[1];
       const matched = categories.find(c => c.slug.toLowerCase() === presetCat.toLowerCase() || c.name.toLowerCase() === presetCat.toLowerCase());
       if(matched) setSelectedCategories([matched.name]);
    }
    window.scrollTo(0,0);
  }, [location, categories]);

  const toggleFilter = (stateArr, setState, value) => {
    if (stateArr.includes(value)) setState(stateArr.filter(i => i !== value));
    else setState([...stateArr, value]);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setSelectedFormats([]);
    setPriceRange(1000);
    setMinRating(0);
    setSortBy('latest');
    setIsMobileFilterOpen(false);
  };

  // Complex multi-axis real-time evaluating engine
  const filteredBooks = useMemo(() => {
    let result = books.filter(book => {
      // 1. Text Search Constraints
      if (searchTerm && !book.title.toLowerCase().includes(searchTerm.toLowerCase()) && !book.authorName?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      
      // 2. Exact Category Matches
      const catName = book.category?.name || book.category;
      if (selectedCategories.length > 0 && !selectedCategories.includes(catName)) return false;
      
      // 3. Format Requirements
      if (selectedFormats.length > 0) {
        const hasFormat = selectedFormats.some(f => book.formats && book.formats[f]?.isAvailable);
        if (!hasFormat) return false;
      }
      
      // 4. Rating Constraints
      if ((book.rating || 4.5) < minRating) return false;
      
      // 5. Dynamic Smart Pricing Evaluation (Based on formats requested)
      const checkPrice = getBookPrice(book, selectedFormats);
      if (checkPrice > priceRange) return false;

      return true;
    });

    // Final Post-Filter Sorting
    switch(sortBy) {
      case 'price-low': result.sort((a,b) => getBookPrice(a, selectedFormats) - getBookPrice(b, selectedFormats)); break;
      case 'price-high': result.sort((a,b) => getBookPrice(b, selectedFormats) - getBookPrice(a, selectedFormats)); break;
      case 'rating': result.sort((a,b) => (b.rating || 4.5) - (a.rating || 4.5)); break;
      case 'latest': result.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
      default: break; 
    }

    return result;
  }, [books, searchTerm, selectedCategories, selectedFormats, priceRange, minRating, sortBy]);

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
      <Link to={`/book/${book._id}`} className="group relative bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden shadow-sm hover:shadow-[0_15px_35px_-10px_rgba(106,13,173,0.15)] hover:border-primary-200 transition-all duration-400 flex flex-col h-full transform hover:-translate-y-2">
         {/* Adaptive Format Icon Badge */}
         <div className="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-sm text-[#1e293b] shadow-sm border border-[#e2e8f0] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
           {activeFormat === 'audiobook' && <><Headphones size={12} className="text-primary-500"/> Audio</>}
           {activeFormat === 'ebook' && <><BookOpen size={12} className="text-primary-500"/> Ebook</>}
           {activeFormat === 'hardcopy' && <><Package size={12} className="text-primary-500"/> Physical</>}
         </div>
         
         {/* Hover Heart Action */}
         <button className="absolute top-3 right-3 z-30 w-8 h-8 flex flex-col items-center justify-center bg-white/95 hover:bg-white backdrop-blur-sm rounded-full text-gray-400 hover:text-red-500 shadow-sm transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100" onClick={e => { e.preventDefault(); toast.success('Saved to wishlist'); }}>
           <Heart size={16} />
         </button>

         {/* Full Bleed Image Block */}
         <div className="w-full h-64 sm:h-72 relative overflow-hidden bg-[#f8fafc] shrink-0 border-b border-[#f1f5f9]">
           <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>
           <img src={getOptimizedImageUrl(book.coverImage, 300)} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out relative z-0" />
         </div>
         
         <div className="p-5 flex flex-col flex-grow relative z-20">
           <span className="text-[10px] text-primary-600 font-extrabold uppercase tracking-widest mb-1.5">{book.category?.name || book.category}</span>
           <h3 className="font-semibold text-lg leading-snug text-[#1e293b] mb-1 line-clamp-2 group-hover:text-primary-600 transition-colors font-poppins">{book.title}</h3>
           <p className="text-xs text-[#64748b] font-bold uppercase tracking-widest mb-4 flex-grow">{book.authorName}</p>
           
           <div className="flex justify-between items-end mb-4">
             <div className="flex flex-col">
               <span className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-0.5">Price</span>
               <span className={`text-2xl font-black leading-none font-poppins ${renderPrice === 0 ? "text-emerald-600" : "text-primary-700"}`}>{renderPrice === 0 ? "Free" : `₹${renderPrice}`}</span>
             </div>
             <div className="flex items-center text-primary-600 font-bold text-[13px] bg-primary-50 px-1.5 py-0.5 rounded border border-primary-100">
                <Star size={12} fill="currentColor" className="mr-1"/> {book.rating}
             </div>
           </div>

           <div className="flex gap-2 mt-auto">
             <button onClick={(e) => handleBuyNow(e, book)} className="flex-1 py-3 rounded-xl bg-primary-500 text-white font-bold flex items-center justify-center gap-2 hover:bg-primary-600 shadow-[0_4px_10px_-2px_rgba(106,13,173,0.3)] transition-colors z-30">
               Buy Now
             </button>
             <button onClick={(e) => handleAdd(e, book)} className="w-[3rem] shrink-0 rounded-xl border border-primary-100 bg-primary-50 text-primary-600 font-bold flex items-center justify-center hover:bg-primary-100 hover:text-primary-700 transition-colors z-30">
               <ShoppingCart size={18} />
             </button>
           </div>
         </div>
      </Link>
    );
  };

// FilterPanel as a STANDALONE component (NOT inside Shop)
// This prevents remounting on every Shop re-render which breaks sliders/checkboxes
const FilterPanel = ({
  searchTerm, setSearchTerm,
  selectedFormats, setSelectedFormats,
  selectedCategories, setSelectedCategories,
  priceRange, setPriceRange,
  minRating, setMinRating,
  clearFilters,
  filteredCount,
  setIsMobileFilterOpen,
  categories // Add categories prop
}) => (
   <div className="flex flex-col gap-8 h-full">
     <div className="flex items-center justify-between pb-4 border-b border-[#e2e8f0]">
        <h3 className="font-bold text-xl text-[#1e293b] flex items-center gap-2 font-poppins"><Filter size={20} className="text-primary-500"/> Filters</h3>
        <button onClick={clearFilters} className="text-sm font-bold text-primary-600 hover:text-primary-700 underline underline-offset-4">Clear All</button>
     </div>

     {/* Search */}
     <div>
       <label className="text-xs font-bold text-[#64748b] uppercase tracking-widest mb-3 block">Search Catalog</label>
       <div className="relative">
         <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
         <input type="text" placeholder="Title or Author..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 ring-primary-500 font-medium text-[#1e293b] shadow-inner" />
       </div>
     </div>

     {/* Formats */}
     <div>
       <label className="text-xs font-bold text-[#64748b] uppercase tracking-widest mb-3 block">Format</label>
       <div className="flex flex-col gap-3">
         {FORMATS.map(f => (
           <label key={f.id} className="flex items-center gap-3 cursor-pointer group">
             <input type="checkbox" checked={selectedFormats.includes(f.id)} onChange={() => {
               if (selectedFormats.includes(f.id)) setSelectedFormats(selectedFormats.filter(i => i !== f.id));
               else setSelectedFormats([...selectedFormats, f.id]);
             }} className="w-5 h-5 rounded border-[#cbd5e1] text-primary-500 focus:ring-primary-500 cursor-pointer" />
             <span className={`font-medium ${selectedFormats.includes(f.id) ? 'text-primary-700 font-bold' : 'text-[#64748b] group-hover:text-primary-600'}`}>{f.label}</span>
           </label>
         ))}
       </div>
     </div>

     {/* Categories */}
     <div>
       <label className="text-xs font-bold text-[#64748b] uppercase tracking-widest mb-3 block">Categories</label>
       <div className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
         {categories && categories.length > 0 ? (
           categories.map(c => (
             <label key={c._id} className="flex items-center gap-3 cursor-pointer group">
               <input type="checkbox" checked={selectedCategories.includes(c.name)} onChange={() => {
                 if (selectedCategories.includes(c.name)) setSelectedCategories(selectedCategories.filter(i => i !== c.name));
                 else setSelectedCategories([...selectedCategories, c.name]);
               }} className="w-5 h-5 rounded border-[#cbd5e1] text-primary-500 focus:ring-primary-500 cursor-pointer" />
               <span className={`font-medium ${selectedCategories.includes(c.name) ? 'text-primary-700 font-bold' : 'text-[#64748b] group-hover:text-primary-600'}`}>{c.name}</span>
             </label>
           ))
         ) : (
           <p className="text-xs text-gray-400">Loading categories...</p>
         )}
       </div>
     </div>

     {/* Price Range Slider */}
     <div>
       <label className="text-xs font-bold text-[#64748b] uppercase tracking-widest mb-3 flex justify-between items-center">
         <span>Max Price</span>
         <span className="text-primary-600 font-black text-base">₹{priceRange}</span>
       </label>
       <input
         type="range"
         min="100"
         max="1500"
         step="50"
         value={priceRange}
         onChange={e => setPriceRange(Number(e.target.value))}
         className="w-full accent-primary-500 cursor-pointer h-2"
       />
       <div className="flex justify-between text-xs text-gray-400 font-bold mt-1">
         <span>₹100</span>
         <span>₹1500</span>
       </div>
     </div>

     {/* Rating Filter */}
     <div>
        <label className="text-xs font-bold text-[#64748b] uppercase tracking-widest mb-3 block">Minimum Rating</label>
        <div className="flex flex-wrap gap-2">
           {[0, 3, 4, 4.5].map(r => (
             <button
               key={r}
               onClick={() => setMinRating(r)}
               className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${minRating === r ? 'bg-primary-500 text-white border-primary-500 shadow-md' : 'bg-white border-[#e2e8f0] text-[#64748b] hover:border-primary-300 hover:text-primary-600'}`}
             >
               {r === 0 ? 'Any' : `⭐ ${r}+`}
             </button>
           ))}
        </div>
     </div>
     
     {/* Mobile Apply */}
     <div className="mt-auto pt-4 lg:hidden pb-10">
        <button onClick={() => setIsMobileFilterOpen(false)} className="w-full bg-primary-500 text-white font-bold text-lg py-4 rounded-xl shadow-[0_8px_20px_rgba(106,13,173,0.3)] hover:bg-primary-600 transition-all active:scale-95">
          Apply Filters ({filteredCount})
        </button>
     </div>
   </div>
);

  return (
    <div className="w-full min-h-screen bg-[#f8fafc]">
      
      {/* Mobile Top Information & Actions Bar */}
      <div className="lg:hidden sticky top-[72px] z-30 bg-white/90 backdrop-blur-md border-b border-[#e2e8f0] p-4 flex justify-between items-center shadow-[0_4px_10px_rgba(0,0,0,0.02)]">
         <span className="font-extrabold text-[#1e293b] font-poppins">{filteredBooks.length} Results</span>
         <button onClick={() => setIsMobileFilterOpen(true)} className="flex items-center gap-2 bg-primary-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm active:scale-95 transition-transform">
           <Filter size={18}/> Filters
         </button>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 py-8 lg:py-12 flex items-start gap-10 relative">
        
        {/* Desktop Absolute Left Sidebar */}
        <aside className="hidden lg:block w-[300px] shrink-0 sticky top-32 max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar p-8 bg-white border border-[#e2e8f0] rounded-3xl shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)]">
           <FilterPanel
             searchTerm={searchTerm} setSearchTerm={setSearchTerm}
             selectedFormats={selectedFormats} setSelectedFormats={setSelectedFormats}
             selectedCategories={selectedCategories} setSelectedCategories={setSelectedCategories}
             priceRange={priceRange} setPriceRange={setPriceRange}
             minRating={minRating} setMinRating={setMinRating}
             clearFilters={clearFilters}
             filteredCount={filteredBooks.length}
             setIsMobileFilterOpen={setIsMobileFilterOpen}
             categories={categories}
           />
        </aside>

        {/* Framer Motion Mobile Slide-in Drawer overlay */}
        <AnimatePresence>
          {isMobileFilterOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-[#1e293b]/50 backdrop-blur-md lg:hidden flex justify-end">
              <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="w-full max-w-sm h-full bg-white shadow-2xl flex flex-col pt-6 px-6 overflow-y-auto relative">
                <button onClick={() => setIsMobileFilterOpen(false)} className="absolute top-6 right-6 w-10 h-10 bg-[#f8fafc] border border-[#e2e8f0] rounded-full flex items-center justify-center text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-colors z-20">
                  <X size={20}/>
                </button>
                <div className="mt-4 flex-grow relative z-10">
                  <FilterPanel
                    searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                    selectedFormats={selectedFormats} setSelectedFormats={setSelectedFormats}
                    selectedCategories={selectedCategories} setSelectedCategories={setSelectedCategories}
                    priceRange={priceRange} setPriceRange={setPriceRange}
                    minRating={minRating} setMinRating={setMinRating}
                    clearFilters={clearFilters}
                    filteredCount={filteredBooks.length}
                    setIsMobileFilterOpen={setIsMobileFilterOpen}
                    categories={categories}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Master Active Content Grid */}
        <div className="flex-1 w-full min-w-0">
          
          <div className="hidden lg:flex justify-between items-center mb-8 bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-sm">
             <span className="font-extrabold text-[#1e293b] text-xl font-poppins">{filteredBooks.length} Books Found</span>
             <div className="flex items-center gap-3">
               <span className="text-[#64748b] font-bold text-sm uppercase tracking-widest">Sort By:</span>
               <div className="relative">
                 <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="appearance-none bg-[#f8fafc] border border-[#e2e8f0] text-[#1e293b] font-bold py-2.5 pl-5 pr-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 cursor-pointer shadow-none">
                   <option value="latest">Latest Arrivals</option>
                   <option value="price-low">Price: Low to High</option>
                   <option value="price-high">Price: High to Low</option>
                   <option value="rating">Highest Rated First</option>
                 </select>
                 <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-500 pointer-events-none"/>
               </div>
             </div>
          </div>

          <div className="lg:hidden flex items-center justify-between gap-3 mb-6 bg-white p-3 rounded-2xl border border-[#e2e8f0] shadow-sm">
             <span className="text-[#64748b] font-bold text-xs uppercase tracking-widest ml-2">Sort</span>
             <div className="relative flex-1">
               <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="appearance-none w-full bg-[#f8fafc] border border-[#e2e8f0] text-[#1e293b] font-bold py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 cursor-pointer">
                 <option value="latest">Latest Arrivals</option>
                 <option value="price-low">Low to High</option>
                 <option value="price-high">High to Low</option>
                 <option value="rating">Best Rated</option>
               </select>
               <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-500 pointer-events-none"/>
             </div>
          </div>

          {filteredBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredBooks.map(book => (
                <BookCard key={book._id} book={book} />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-[#e2e8f0] rounded-3xl p-16 flex flex-col items-center justify-center text-center shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] min-h-[50vh]">
               <div className="w-24 h-24 bg-primary-50 text-primary-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
                 <Search size={40}/>
               </div>
               <h3 className="text-3xl font-extrabold text-[#1e293b] mb-4 font-poppins">No Books Found</h3>
               <p className="text-[#64748b] text-lg font-medium mb-10 max-w-md">We couldn't find any titles matching your exact filter combination. Try clearing some criteria to broaden your search.</p>
               <button onClick={clearFilters} className="bg-primary-500 hover:bg-primary-600 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-[0_8px_20px_rgba(106,13,173,0.3)] transition-all transform hover:-translate-y-1">
                 Clear All Filters
               </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Shop;
