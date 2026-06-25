import { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, ChevronLeft, ChevronRight, Heart, Headphones, BookOpen, Package } from 'lucide-react';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';
import axios from '../../api/axios';
import { toast } from 'sonner';
import { getOptimizedImageUrl, getOptimizedImageSrcSet } from '../../utils/image';

const BookSlider = ({ title, subtitle, books, badge, focusFormat }) => {
  const scrollRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const addToCart = useCartStore(s => s.addToCart);
  const navigate = useNavigate();
  const { user, login } = useAuthStore();

  const scroll = (amount) => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  useEffect(() => {
    if (isHovered || !books || books.length === 0) return;
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const itemWidth = window.innerWidth < 640 ? 200 + 12 : 280 + 16;
        if (Math.ceil(scrollLeft + clientWidth) >= scrollWidth - 15) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({ left: itemWidth, behavior: 'smooth' });
        }
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [isHovered, books]);

  const handleAdd = (e, book) => {
    e.preventDefault();
    const format = focusFormat || (book.formats?.hardcopy ? 'hardcopy' : book.formats?.ebook ? 'ebook' : 'audiobook');
    if (!format || !book.formats[format]) return;
    addToCart({ book: book._id, title: book.title, coverImage: book.coverImage, format, price: book.formats[format].price, qty: 1 });
    toast.success(`${book.title} added to cart!`);
  };

  const handleBuyNow = (e, book) => {
    e.preventDefault();
    handleAdd(e, book);
    navigate('/cart');
  };

  const handleWishlist = async (e, book) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error('Please login to add books to your wishlist.');
      navigate('/login');
      return;
    }

    try {
      const { data } = await axios.post('/users/wishlist', { bookId: book._id });
      const updatedUser = { ...user, wishlist: data };
      login(updatedUser);

      const isInWish = data.some(item => 
        (typeof item === 'string' ? item : item._id) === book._id
      );

      if (isInWish) {
        toast.success(`${book.title} saved to Wishlist!`);
      } else {
        toast.success(`${book.title} removed from Wishlist.`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update wishlist.');
    }
  };

  if (!books || books.length === 0) return null;

  return (
    <section
      className="relative group/section"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-5 sm:mb-8 gap-2 sm:gap-4">
         <div>
            <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-[#1e293b] tracking-tight mb-1 font-poppins">{title}</h2>
            {subtitle && <p className="text-[#64748b] font-medium text-xs sm:text-sm md:text-base">{subtitle}</p>}
         </div>
         <div className="hidden lg:flex gap-2 flex-shrink-0">
            <button onClick={() => scroll(-400)} className="w-9 h-9 flex items-center justify-center rounded-full border border-[#e2e8f0] bg-white text-[#64748b] hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 transition-colors shadow-sm"><ChevronLeft size={18}/></button>
            <button onClick={() => scroll(400)} className="w-9 h-9 flex items-center justify-center rounded-full border border-[#e2e8f0] bg-white text-[#64748b] hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 transition-colors shadow-sm"><ChevronRight size={18}/></button>
         </div>
      </div>
      
      {/* Scrollable Cards */}
      <div
        ref={scrollRef}
        className="flex gap-3 sm:gap-5 overflow-x-auto pb-6 snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
         {books.map((book, index) => {
            let cardFormat = focusFormat;
            if (!cardFormat) {
              if (book.formats?.hardcopy?.isAvailable) {
                cardFormat = 'hardcopy';
              } else if (book.formats?.ebook?.isAvailable) {
                cardFormat = 'ebook';
              } else if (book.formats?.audiobook?.isAvailable) {
                cardFormat = 'audiobook';
              } else {
                cardFormat = 'ebook';
              }
            }
            const displayPrice = book.formats[cardFormat]?.price ?? book.price ?? 0;

           return (
             <Link
               to={`/book/${book._id}`}
               key={`${book._id}-${index}`}
               className="min-w-[170px] w-[170px] sm:min-w-[230px] sm:w-[230px] md:min-w-[260px] md:w-[260px] snap-start group relative bg-white border border-[#e2e8f0] rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-[0_12px_25px_-8px_rgba(106,13,173,0.15)] hover:border-primary-200 transition-all duration-300 flex flex-col cursor-pointer"
             >
               {/* Badge */}
               {badge && (
                 <div className="absolute top-2 left-2 z-20 bg-gradient-to-r from-primary-500 to-primary-400 text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md uppercase tracking-wider">
                   {badge}
                 </div>
               )}
               {/* Format tags */}
               {!badge && cardFormat === 'audiobook' && (
                 <div className="absolute top-2 left-2 z-20 bg-white/95 text-[#1e293b] shadow-sm border border-[#e2e8f0] text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1"><Headphones size={10} className="text-primary-500"/> Audio</div>
               )}
               {!badge && cardFormat === 'ebook' && (
                 <div className="absolute top-2 left-2 z-20 bg-white/95 text-[#1e293b] shadow-sm border border-[#e2e8f0] text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1"><BookOpen size={10} className="text-primary-500"/> Ebook</div>
               )}
               {!badge && cardFormat === 'hardcopy' && (
                 <div className="absolute top-2 left-2 z-20 bg-white/95 text-[#1e293b] shadow-sm border border-[#e2e8f0] text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1"><Package size={10} className="text-primary-500"/> Physical</div>
               )}
               
               {/* Wishlist button */}
               <button
                 className={`absolute top-2 right-2 z-30 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full shadow-sm transition-all opacity-0 group-hover:opacity-100 ${
                   user?.wishlist?.some(item => (typeof item === 'string' ? item : item._id) === book._id)
                     ? 'bg-rose-50 text-rose-500'
                     : 'bg-white/95 hover:bg-white text-gray-400 hover:text-red-500'
                 }`}
                 onClick={e => handleWishlist(e, book)}
               >
                 <Heart 
                   size={13} 
                   fill={user?.wishlist?.some(item => (typeof item === 'string' ? item : item._id) === book._id) ? "currentColor" : "none"}
                   className="transition-colors"
                 />
               </button>

               {/* Cover Image */}
               <div className="w-full h-44 sm:h-52 md:h-56 relative overflow-hidden bg-[#f8fafc] shrink-0 border-b border-[#f1f5f9]">
                 <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>
                  <img 
                    {...getOptimizedImageSrcSet(book.coverImage, [150, 300, 600])}
                    sizes="(max-width: 640px) 170px, 260px"
                    alt={book.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                  />
               </div>
               
               {/* Content */}
               <div className="p-3 sm:p-4 flex flex-col flex-grow">
                 <h3 className="font-semibold text-sm sm:text-base leading-snug text-[#1e293b] mb-0.5 line-clamp-2 group-hover:text-primary-600 transition-colors font-poppins">{book.title}</h3>
                 <p className="text-[10px] sm:text-xs text-[#64748b] mb-3 flex-grow">{book.authorName}</p>
                 
                 <div className="flex justify-between items-center mb-3">
                   <span className={`text-base sm:text-lg font-bold leading-none ${displayPrice === 0 ? "text-emerald-600" : "text-[#1e293b]"}`}>{displayPrice === 0 ? "Free" : `₹${displayPrice}`}</span>
                   <div className="flex items-center text-primary-500 font-bold text-[11px] sm:text-[12px] bg-primary-50 px-1.5 py-0.5 rounded border border-primary-100">
                      <Star size={10} fill="currentColor" className="mr-1"/> {book.rating || "5.0"}
                   </div>
                 </div>

                 <div className="flex gap-2">
                   <button
                     onClick={(e) => handleBuyNow(e, book)}
                     className="flex-1 py-2 rounded-lg sm:rounded-xl bg-primary-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center hover:bg-primary-700 shadow-[0_4px_10px_-2px_rgba(106,13,173,0.3)] transition-colors"
                   >
                     Buy Now
                   </button>
                   <button
                     onClick={(e) => handleAdd(e, book)}
                     className="w-9 sm:w-10 shrink-0 rounded-lg sm:rounded-xl border border-primary-100 bg-primary-50 text-primary-600 font-bold flex items-center justify-center hover:bg-primary-100 transition-colors"
                   >
                     <ShoppingCart size={15} />
                   </button>
                 </div>
               </div>
             </Link>
           );
        })}
      </div>
    </section>
  );
};
export default BookSlider;
