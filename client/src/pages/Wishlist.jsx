import { useState, useEffect, useMemo } from 'react';
import usePageMeta from '../hooks/usePageMeta';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  HeartCrack, 
  Trash2, 
  ShoppingCart, 
  Eye, 
  BookOpen, 
  Headphones, 
  Package, 
  Star, 
  ChevronRight,
  ArrowDownWideNarrow,
  CheckCircle2,
  Heart
} from 'lucide-react';
import axios from '../api/axios';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';
import { getOptimizedImageUrl } from '../utils/image';

const FormatIcon = ({ format }) => {
  if (format.includes('Ebook')) return <BookOpen size={14} className="mr-1.5" />;
  if (format.includes('Audiobook')) return <Headphones size={14} className="mr-1.5" />;
  return <Package size={14} className="mr-1.5" />;
};

const Wishlist = () => {
  usePageMeta('Wishlist', 'View and manage your saved books on Pustak Maza.');
  const navigate = useNavigate();
  const { user, login } = useAuthStore();
  const addToCart = useCartStore(state => state.addToCart);

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('latest');

  // Load wishlist from database user profile
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const { data } = await axios.get('/users/profile');
        setWishlist(data.wishlist || []);
        if (user) {
          login({
            ...user,
            wishlist: data.wishlist
          });
        }
      } catch (err) {
        console.error('Failed to load wishlist items:', err);
        toast.error('Failed to load wishlist.');
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  // Handlers
  const handleRemove = async (bookId, title) => {
    try {
      const { data } = await axios.post('/users/wishlist', { bookId });
      setWishlist(prev => prev.filter(item => item._id !== bookId));
      if (user) {
        login({
          ...user,
          wishlist: data
        });
      }
      toast.success(`Removed "${title}" from wishlist.`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove item.');
    }
  };

  const getFirstAvailableFormat = (book) => {
    if (book.formats?.ebook?.isAvailable) return 'ebook';
    if (book.formats?.audiobook?.isAvailable) return 'audiobook';
    if (book.formats?.hardcopy?.isAvailable) return 'hardcopy';
    return 'ebook';
  };

  const getFormatPrice = (book, format) => {
    const fmtData = book.formats?.[format] || {};
    return fmtData.discountPrice || fmtData.price || book.price || 0;
  };

  const handleMoveToCart = async (bookObj) => {
    const format = getFirstAvailableFormat(bookObj);
    const price = getFormatPrice(bookObj, format);
    const formatLabel = format === 'ebook' ? 'Ebook' : format === 'audiobook' ? 'Audiobook' : 'Hardcopy';

    addToCart({ 
      book: bookObj._id, 
      title: bookObj.title, 
      image: bookObj.coverImage, 
      format: format, 
      price: price, 
      quantity: 1 
    });

    await handleRemove(bookObj._id, bookObj.title);

    toast.success(
      <div className="flex items-center gap-2">
         <CheckCircle2 size={18} className="text-green-500"/>
         <span>Moved <b>{bookObj.title}</b> ({formatLabel}) to cart!</span>
      </div>
    );
  };

  const getFormatsLabel = (bookObj) => {
    const fmts = [];
    if (bookObj.formats?.ebook?.isAvailable) fmts.push('Ebook');
    if (bookObj.formats?.audiobook?.isAvailable) fmts.push('Audiobook');
    if (bookObj.formats?.hardcopy?.isAvailable) fmts.push('Hardcopy');
    return fmts.join(' / ') || 'Digital';
  };

  const getStartingPrice = (bookObj) => {
    const prices = [];
    if (bookObj.formats?.ebook?.isAvailable) prices.push(bookObj.formats.ebook.discountPrice ?? bookObj.formats.ebook.price);
    if (bookObj.formats?.audiobook?.isAvailable) prices.push(bookObj.formats.audiobook.discountPrice ?? bookObj.formats.audiobook.price);
    if (bookObj.formats?.hardcopy?.isAvailable) prices.push(bookObj.formats.hardcopy.discountPrice ?? bookObj.formats.hardcopy.price);
    const validPrices = prices.filter(p => p !== undefined && p !== null);
    if (validPrices.length === 0) return bookObj.price ?? 0;
    return Math.min(...validPrices);
  };

  const getStockStatus = (bookObj) => {
    if (bookObj.formats?.hardcopy?.isAvailable) {
      return (bookObj.formats.hardcopy.stock || 0) > 0 ? 'In Stock' : 'Out of Stock';
    }
    return 'Instant Access';
  };

  // Sorting Logic
  const sortedWishlist = useMemo(() => {
    let sorted = [...wishlist];
    switch (sortBy) {
       case 'price-low':
          sorted.sort((a, b) => getStartingPrice(a) - getStartingPrice(b));
          break;
       case 'price-high':
          sorted.sort((a, b) => getStartingPrice(b) - getStartingPrice(a));
          break;
       case 'highest-rated':
          sorted.sort((a, b) => (b.rating || 5) - (a.rating || 5));
          break;
       case 'latest':
       default:
          sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
    }
    return sorted;
  }, [wishlist, sortBy]);

  if (loading) {
    return <div className="text-center py-20 text-xl font-medium animate-pulse text-slate-500 font-poppins">Loading Wishlist...</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="pb-20 font-poppins max-w-4xl"
    >
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
         <div>
            <h1 className="text-3xl font-poppins font-black text-[#1e293b] mb-2 flex items-center gap-3">
               <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center shadow-inner">
                  <Heart size={20} className="text-primary-600" fill="currentColor"/>
               </div>
               My Wishlist
            </h1>
            <p className="text-[#64748b]">Your saved books and favorites in one place.</p>
         </div>
         
         {wishlist.length > 0 && (
            <div className="flex items-center gap-3">
               <div className="p-2 bg-white rounded-xl border border-gray-100 flex items-center shadow-sm">
                  <ArrowDownWideNarrow size={18} className="text-gray-400 ml-2" />
                  <select 
                     value={sortBy} 
                     onChange={(e) => setSortBy(e.target.value)}
                     className="bg-transparent border-none text-sm font-bold text-[#1e293b] focus:ring-0 cursor-pointer pr-4 pl-3 py-1 outline-none"
                  >
                     <option value="latest">Latest Added</option>
                     <option value="price-low">Price: Low to High</option>
                     <option value="price-high">Price: High to Low</option>
                     <option value="highest-rated">Highest Rated</option>
                  </select>
               </div>
            </div>
         )}
      </div>

      <div>
         {wishlist.length > 0 ? (
            <div className="flex flex-col gap-6">
               <AnimatePresence>
                  {sortedWishlist.map((book) => (
                     <motion.div
                       key={book._id}
                       layout
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                       transition={{ duration: 0.4 }}
                       className="bg-white rounded-[2rem] p-5 sm:p-6 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-10px_rgba(106,13,173,0.15)] border border-gray-100/80 transition-all duration-300 flex flex-col md:flex-row gap-6 md:gap-8 group"
                     >
                        {/* Book Cover */}
                        <div 
                           className="w-full md:w-36 h-64 md:h-auto rounded-2xl overflow-hidden shrink-0 shadow-sm relative cursor-pointer group-hover:shadow-md transition-shadow bg-gray-50"
                           onClick={() => navigate(`/book/${book._id}`)}
                        >
                           <img src={getOptimizedImageUrl(book.coverImage, 300)} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                           <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>

                        {/* Details */}
                        <div className="flex-1 flex flex-col justify-between py-1">
                           <div>
                              <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                                 <div className="flex items-center gap-3">
                                    <span className="flex items-center text-xs font-black uppercase tracking-widest text-primary-600 bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-100/50">
                                       <FormatIcon format={getFormatsLabel(book)} />
                                       {getFormatsLabel(book)}
                                    </span>
                                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100/50 flex items-center gap-1.5">
                                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                       {getStockStatus(book)}
                                    </span>
                                 </div>
                                 <button 
                                    onClick={() => handleRemove(book._id, book.title)}
                                    className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors shrink-0"
                                    title="Remove from wishlist"
                                 >
                                    <Trash2 size={18} />
                                 </button>
                              </div>

                              <h3 
                                 className="text-2xl font-poppins font-bold text-[#1e293b] mb-1 cursor-pointer hover:text-primary-600 transition-colors line-clamp-2"
                                 onClick={() => navigate(`/book/${book._id}`)}
                              >
                                 {book.title}
                              </h3>
                              <p className="text-[#64748b] font-medium text-[15px] mb-3">by <span className="text-[#1e293b] font-bold">{book.authorName || 'Pustak Maza Author'}</span></p>

                              <p className="text-[#475569] leading-relaxed line-clamp-2 sm:line-clamp-3 text-[14px] pr-2 md:pr-8">
                                 {book.description}
                              </p>
                           </div>

                           <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-5 mt-5 border-t border-gray-50">
                              <div className="flex items-center gap-4">
                                 <div>
                                    <span className="text-sm font-bold text-gray-400 block mb-0.5 uppercase tracking-widest">Starts at</span>
                                    <span className={`text-2xl font-black ${getStartingPrice(book) === 0 ? "text-emerald-600" : "text-[#1e293b]"}`}>{getStartingPrice(book) === 0 ? "Free" : `₹${getStartingPrice(book)}`}</span>
                                 </div>
                                 <div className="h-10 border-l border-gray-100 mx-1"></div>
                                 <div>
                                    <span className="text-sm font-bold text-gray-400 block mb-0.5 uppercase tracking-widest">Rating</span>
                                    <div className="flex items-center text-amber-500">
                                       <Star size={16} fill="currentColor" />
                                       <span className="font-bold text-[#1e293b] ml-1.5 text-lg leading-none">{book.rating || 4.5}</span>
                                    </div>
                                 </div>
                              </div>
                              <div className="flex flex-col sm:flex-row items-center gap-3">
                                 <button 
                                    onClick={() => navigate(`/book/${book._id}`)}
                                    className="w-full sm:w-auto px-5 py-3 rounded-xl border-2 border-gray-100 text-[#1e293b] font-bold hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700 transition-all flex items-center justify-center gap-2"
                                 >
                                    <Eye size={18}/> Details
                                 </button>
                                 <button 
                                    onClick={() => handleMoveToCart(book)}
                                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-primary-600 text-white font-bold shadow-[0_4px_14px_0_rgba(106,13,173,0.39)] hover:shadow-[0_6px_20px_rgba(106,13,173,0.23)] hover:bg-primary-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group/btn"
                                 >
                                    <ShoppingCart size={18} className="group-hover/btn:-rotate-12 transition-transform"/> Move to Cart
                                 </button>
                              </div>
                           </div>
                        </div>
                     </motion.div>
                  ))}
               </AnimatePresence>
            </div>
         ) : (
            // Empty State
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-12 md:p-20 flex flex-col items-center text-center mt-4"
            >
               <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mb-8 relative">
                  <HeartCrack size={48} className="text-primary-300" strokeWidth={1.5} />
                  <div className="absolute top-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                     <span className="w-6 h-6 bg-primary-100 rounded-full text-primary-600 flex items-center justify-center text-xs font-black">0</span>
                  </div>
               </div>
               <h2 className="text-3xl lg:text-4xl font-poppins font-black text-[#1e293b] mb-4">Your wishlist is empty</h2>
               <p className="text-lg text-[#64748b] mb-10 max-w-sm mx-auto">
                  Save books you love and find them here later.
               </p>
               <Link 
                  to="/shop"
                  className="px-8 py-4 rounded-xl bg-[#1e293b] text-white font-bold hover:bg-primary-600 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center gap-3 group"
               >
                  Browse Books <ChevronRight size={20} className="group-hover:translate-x-1.5 transition-transform" />
               </Link>
            </motion.div>
         )}
      </div>
    </motion.div>
  );
};

export default Wishlist;
