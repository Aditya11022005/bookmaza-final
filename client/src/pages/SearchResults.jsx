import { useState, useMemo, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Star, ShoppingCart, Heart, Headphones, BookOpen, Package, ChevronRight, Hash } from 'lucide-react';
import useCartStore from '../store/cartStore';
import { toast } from 'sonner';
import usePageMeta from '../hooks/usePageMeta';
import axios from '../api/axios';
import { getOptimizedImageUrl } from '../utils/image';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const q = queryParams.get('q') || '';

  usePageMeta(q ? `Search: "${q}" | Pustak Maza` : 'Search | Pustak Maza', `Search results for "${q}" on Pustak Maza. Browse ebooks, audiobooks and hardcopy books.`, true);
  
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState(q);
  const addToCart = useCartStore(s => s.addToCart);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const { data } = await axios.get('/books');
        setBooks(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBooks();
    setSearchTerm(q);
    window.scrollTo(0, 0);
  }, [q]);

  const filteredBooks = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase();
    return books.filter(book => {
      const catName = book.category?.name || book.category || '';
      return book.title.toLowerCase().includes(term) || 
             book.authorName?.toLowerCase().includes(term) ||
             (typeof catName === 'string' && catName.toLowerCase().includes(term));
    });
  }, [books, searchTerm]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleAddToCart = (e, book) => {
    e.preventDefault();
    const defaultFormat = book.formats?.hardcopy ? 'hardcopy' : book.formats?.ebook ? 'ebook' : 'audiobook';
    addToCart({ 
      book: book._id, 
      title: book.title, 
      coverImage: book.coverImage, 
      format: defaultFormat, 
      price: book.formats?.[defaultFormat]?.price || book.price, 
      qty: 1 
    });
    toast.success(`${book.title} added to cart!`);
  };

  const handleBuyNow = (e, book) => {
    e.preventDefault();
    const defaultFormat = book.formats?.hardcopy ? 'hardcopy' : book.formats?.ebook ? 'ebook' : 'audiobook';
    const buyNowItem = {
      book: book._id,
      title: book.title,
      image: book.coverImage,
      coverImage: book.coverImage,
      format: defaultFormat,
      price: book.formats?.[defaultFormat]?.price || book.price,
      qty: 1
    };
    sessionStorage.setItem('tempBuyNow', JSON.stringify(buyNowItem));
    navigate('/checkout', { state: { buyNowItem } });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] w-full pb-20">
      {/* Search Header */}
      <div className="bg-white border-b border-[#e2e8f0] pt-24 pb-12 lg:pt-32 lg:pb-20">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-12">
          <div className="flex items-center gap-2 text-sm font-black text-[#64748b] uppercase tracking-widest mb-8">
            <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
            <ChevronRight size={16} className="text-gray-300"/>
            <span className="text-[#1e293b] bg-gray-100 px-3 py-1 rounded-md">Search Results</span>
          </div>

          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-black text-[#1e293b] font-poppins mb-6">
              {q ? `Results for "${q}"` : 'Search our Catalog'}
            </h1>
            
            <form onSubmit={handleSearchSubmit} className="relative group">
              <SearchIcon size={24} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search books, authors, categories..." 
                className="w-full bg-[#f8fafc] border-2 border-[#e2e8f0] rounded-3xl pl-16 pr-8 py-6 focus:outline-none focus:ring-4 ring-primary-500/10 focus:border-primary-500 font-bold text-xl text-[#1e293b] shadow-inner transition-all"
              />
              <button 
                type="submit"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-primary-600 text-white px-8 py-3 rounded-2xl font-black hover:bg-primary-700 transition-all shadow-lg active:scale-95"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 sm:px-12 py-12">
        {filteredBooks.length > 0 ? (
          <>
            <div className="flex items-center gap-3 mb-10 pb-6 border-b border-gray-200">
               <Hash size={24} className="text-primary-500"/>
               <span className="font-black text-[#1e293b] text-2xl font-poppins">Filtered {filteredBooks.length} Titles</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredBooks.map(book => (
                <Link key={book._id} to={`/book/${book._id}`} className="group bg-white border border-[#e2e8f0] rounded-[2rem] overflow-hidden shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(106,13,173,0.2)] hover:border-primary-200 transition-all duration-500 flex flex-col h-full transform hover:-translate-y-2">
                  <div className="w-full h-80 relative overflow-hidden bg-[#f8fafc] border-b border-[#f1f5f9]">
                    <img src={getOptimizedImageUrl(book.coverImage, 300)} alt={book.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out" />
                  </div>
                  
                  <div className="p-6 flex flex-col flex-grow">
                    <span className="text-[11px] text-primary-600 font-black uppercase tracking-[0.2em] mb-2">{book.category?.name || book.category}</span>
                    <h3 className="font-extrabold text-xl leading-snug text-[#1e293b] mb-1.5 line-clamp-2 group-hover:text-primary-600 transition-colors font-poppins">{book.title}</h3>
                    <p className="text-sm text-[#64748b] font-bold uppercase tracking-widest mb-6 flex-grow">{book.authorName}</p>
                    
                    <div className="flex justify-between items-end mb-6">
                      <div className="flex flex-col">
                        <span className="text-[11px] text-gray-400 font-extrabold uppercase tracking-widest mb-1">Price</span>
                        <span className="text-3xl font-black text-[#1e293b] leading-none text-primary-700 font-poppins">₹{book.price}</span>
                      </div>
                      <div className="flex items-center text-primary-600 font-black text-sm bg-primary-50 px-2.5 py-1 rounded-lg border border-primary-100">
                         <Star size={14} fill="currentColor" className="mr-1.5"/> {book.rating}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button onClick={(e) => handleBuyNow(e, book)} className="flex-1 py-4 rounded-xl bg-primary-500 text-white font-black flex items-center justify-center gap-2 hover:bg-primary-600 shadow-lg transition-all">
                        Buy Now
                      </button>
                      <button onClick={(e) => handleAddToCart(e, book)} className="w-14 shrink-0 rounded-xl border border-primary-100 bg-primary-50 text-primary-600 font-bold flex items-center justify-center hover:bg-primary-100 transition-colors">
                        <ShoppingCart size={18} />
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="bg-white border border-[#e2e8f0] rounded-[3rem] p-20 flex flex-col items-center justify-center text-center shadow-sm min-h-[40vh]">
            <div className="w-32 h-32 bg-primary-50 text-primary-500 rounded-full flex items-center justify-center mb-8 shadow-inner border shadow-[inset_0_4px_10px_rgba(106,13,173,0.1)]">
              <SearchIcon size={50}/>
            </div>
            <h3 className="text-4xl font-black text-[#1e293b] mb-4 font-poppins">No Results Found</h3>
            <p className="text-[#64748b] text-xl font-medium mb-12 max-w-lg leading-relaxed">
              We couldn't find any books matching "{q}". Try searching for something else like "Atomic Habits" or "Fiction".
            </p>
            <Link to="/shop" className="bg-primary-500 hover:bg-primary-600 text-white font-black text-xl px-12 py-5 rounded-2xl shadow-lg transition-all transform hover:-translate-y-1 active:scale-95">
              Browse All Books
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
