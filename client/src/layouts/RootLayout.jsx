import { useState, useEffect, useMemo } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, Heart, User, Search, BookOpen, Headphones, Package, ArrowRight, Star, ChevronRight } from 'lucide-react';
import { Toaster } from 'sonner';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';
import { AnimatePresence, motion } from 'framer-motion';
import axios from '../api/axios';

const RootLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { cartItems } = useCartStore();

  const cartCount = cartItems.reduce((acc, item) => acc + (item.qty || item.quantity || 1), 0);

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
  }, []);

  useEffect(() => {
    setIsSearchOpen(false);
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);


  const isActive = (path) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  const filteredSuggestions = useMemo(() => {
    if (searchQuery.length < 2) return [];
    return books.filter(book => 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.authorName?.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);
  }, [books, searchQuery]);

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Categories', path: '/categories' },
    ...(user ? [{ name: 'My Library', path: '/library' }] : []),
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <header className="bg-white py-3 sm:py-6 border-b border-gray-100 relative z-40">
        <div className="max-w-[1400px] mx-auto px-2 sm:px-8 lg:px-12 flex justify-between items-center w-full">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 sm:gap-6 group flex-shrink-0">
            <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-xl shadow-[0_10px_25px_-5px_rgba(106,13,173,0.2)] overflow-hidden border border-gray-50 group-hover:scale-105 transition-all duration-500 flex-shrink-0 bg-primary-50 p-1.5 sm:p-2 ring-2 ring-primary-50/50">
               <img src="/logo.png" alt="Logo" className="w-full h-full object-contain drop-shadow-md"/>
            </div>
            <div className="flex flex-col">
               <span className="text-lg min-[400px]:text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400 group-hover:to-primary-300 transition-all font-poppins leading-tight drop-shadow-sm">Pustak Maza</span>
               <span className="hidden sm:block text-[8px] lg:text-[10px] font-bold text-primary-400 uppercase tracking-[0.4em] mt-0.5 ml-0.5">Premium publication</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex gap-5 xl:gap-8 font-semibold text-[#64748b] items-center">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path} 
                className={`relative transition-colors duration-300 font-inter py-2 hover:text-primary-600 whitespace-nowrap text-sm xl:text-base ${isActive(link.path) ? 'text-primary-600' : ''}`}
              >
                {link.name}
                {isActive(link.path) && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-500 rounded-full shadow-[0_0_8px_rgba(106,13,173,0.5)]"></span>
                )}
              </Link>
            ))}
          </nav>

          {/* Desktop Action Icons */}
          <div className="hidden lg:flex items-center gap-3 xl:gap-4 text-[#64748b]">
            <Link 
              to="/author/login" 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-black px-4 py-2 rounded-xl text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all font-inter"
            >
              Author Login ✍️
            </Link>
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary-50 hover:text-primary-600 transition-colors"
              aria-label="Search books"
            >
              <Search size={20} />
            </button>
            <Link to="/wishlist" className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary-50 hover:text-primary-600 transition-colors" aria-label="View Wishlist">
              <Heart size={20} />
            </Link>
            <Link to="/cart" className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary-50 hover:text-primary-600 transition-colors relative" aria-label="View Cart">
               <ShoppingCart size={20} />
               {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md border border-white">{cartCount > 99 ? '99+' : cartCount}</span>}
            </Link>
            {user ? (
               <Link to="/profile" className="w-10 h-10 rounded-full flex items-center justify-center bg-primary-100 text-primary-700 shadow-sm border border-primary-200 overflow-hidden ring-2 ring-primary-50/50 hover:ring-primary-100 transition-all font-bold text-sm">
                  {user.profileImage ? <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" /> : user.name.charAt(0)}
               </Link>
            ) : (
               <Link to="/login" className="w-10 h-10 rounded-full flex items-center justify-center bg-primary-50 text-primary-600 hover:bg-primary-500 hover:text-white transition-all shadow-sm group border border-primary-100">
                 <User size={18} className="group-hover:scale-110 transition-transform"/>
               </Link>
            )}
          </div>

          {/* Mobile / Tablet Action Icons */}
          <div className="flex items-center gap-0.5 sm:gap-1 lg:hidden">
            <button 
              onClick={() => setIsSearchOpen(true)} 
              className="w-10 h-10 rounded-full flex items-center justify-center text-[#64748b] hover:text-primary-600 hover:bg-primary-50 transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            <Link 
              to="/cart" 
              className="w-10 h-10 rounded-full flex items-center justify-center text-[#64748b] hover:text-primary-600 hover:bg-primary-50 transition-colors relative"
              aria-label="Cart"
            >
               <ShoppingCart size={20} />
               {cartCount > 0 && <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md border border-white">{cartCount > 99 ? '99+' : cartCount}</span>}
            </Link>
            <button 
              className="w-10 h-10 rounded-full flex items-center justify-center text-[#1e293b] hover:text-primary-600 hover:bg-primary-50 transition-colors" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={22}/> : <Menu size={22}/>}
            </button>
          </div>
        </div>

        {/* ── Global Search Overlay ── */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-primary-950/40 backdrop-blur-xl flex justify-center items-start p-3 sm:p-8 pt-4 sm:pt-10 overflow-y-auto"
              onClick={(e) => e.target === e.currentTarget && setIsSearchOpen(false)}
            >
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="w-full max-w-4xl h-fit flex flex-col"
              >
                {/* Search input bar */}
                <div className="relative mb-3 sm:mb-8">
                  <div className="absolute inset-0 bg-primary-500 blur-3xl opacity-20 -z-10"></div>
                  <div className="bg-white rounded-2xl sm:rounded-[2.5rem] shadow-2xl p-1.5 sm:p-2 border border-white/20 flex items-center gap-2 sm:gap-4 overflow-hidden ring-1 ring-black/5">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 shrink-0 ml-1 sm:ml-2">
                       <Search size={20} />
                    </div>
                    <form onSubmit={handleSearchSubmit} className="flex-1 min-w-0">
                      <input 
                        autoFocus
                        type="text" 
                        placeholder="Search books, authors, genres..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full py-3 sm:py-6 pr-2 sm:pr-6 text-base sm:text-2xl font-black text-[#1e293b] placeholder:text-gray-300 outline-none font-poppins bg-transparent"
                      />
                    </form>
                    <button 
                      onClick={() => setIsSearchOpen(false)}
                      className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all mr-1 sm:mr-2 flex items-center justify-center flex-shrink-0"
                      aria-label="Close search overlay"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                {/* Results box */}
                <div className="bg-white rounded-2xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[70vh]">
                  {searchQuery.length > 0 ? (
                    <div className="overflow-y-auto p-3 sm:p-8 custom-scrollbar">
                      {filteredSuggestions.length > 0 ? (
                        <>
                          <div className="flex items-center justify-between mb-3 sm:mb-6 px-1 sm:px-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#64748b]">Found {filteredSuggestions.length} Matches</span>
                            <button onClick={handleSearchSubmit} className="text-xs sm:text-sm font-black text-primary-600 hover:underline flex items-center gap-1">
                              View All <ArrowRight size={12}/>
                            </button>
                          </div>
                          
                          <div className="flex flex-col gap-2 sm:gap-3">
                            {filteredSuggestions.map(book => (
                              <Link 
                                key={book._id} 
                                to={`/book/${book._id}`}
                                className="group flex items-center gap-3 sm:gap-6 p-2.5 sm:p-4 rounded-2xl sm:rounded-3xl hover:bg-primary-50 transition-all border border-transparent hover:border-primary-100"
                              >
                                <div className="w-12 h-16 sm:w-20 sm:h-24 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm shrink-0 border border-gray-100">
                                  <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] text-primary-600 mb-0.5 block">{book.category?.name || book.category}</span>
                                  <h4 className="text-sm sm:text-xl font-bold text-[#1e293b] group-hover:text-primary-700 transition-colors font-poppins truncate">{book.title}</h4>
                                  <p className="text-xs sm:text-sm text-[#64748b] font-medium line-clamp-1">{book.authorName}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1 shrink-0">
                                   <span className="text-sm sm:text-lg font-black text-[#1e293b]">₹{book.price}</span>
                                </div>
                                <ChevronRight size={16} className="text-gray-200 group-hover:text-primary-400 group-hover:translate-x-1 transition-all hidden sm:block" />
                              </Link>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="py-10 sm:py-20 flex flex-col items-center text-center">
                           <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-300 mb-4 sm:mb-6">
                              <Search size={28}/>
                           </div>
                           <h4 className="text-lg sm:text-2xl font-black text-[#1e293b] mb-2 font-poppins">No results found</h4>
                           <p className="text-[#64748b] font-medium max-w-xs text-sm">Try a different keyword for "{searchQuery}"</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 sm:p-12">
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8">
                          <div className="text-left">
                             <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#64748b] mb-3 sm:mb-6">Popular Categories</h4>
                             <div className="flex flex-wrap gap-2">
                                {['Fiction', 'Self-Help', 'Business', 'Science Fiction'].map(cat => (
                                  <Link 
                                    key={cat} 
                                    to={`/category/${cat.toLowerCase().replace(' ', '-')}`}
                                    className="px-3 py-2 sm:px-5 sm:py-3 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] text-xs sm:text-sm font-bold text-[#1e293b] hover:border-primary-300 hover:text-primary-600 transition-all active:scale-95"
                                  >
                                    {cat}
                                  </Link>
                                ))}
                             </div>
                          </div>
                          <div className="text-left">
                             <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#64748b] mb-3 sm:mb-6">Search Tips</h4>
                             <ul className="space-y-3">
                                <li className="flex items-center gap-3 text-[#1e293b] font-bold text-sm">
                                   <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-[10px] font-black shrink-0">1</div>
                                   Search by Book Title or ISBN
                                </li>
                                <li className="flex items-center gap-3 text-[#1e293b] font-bold text-sm">
                                   <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-[10px] font-black shrink-0">2</div>
                                   Explore by Author Name
                                </li>
                             </ul>
                          </div>
                       </div>
                    </div>
                  )}
                  
                  {searchQuery.length > 0 && (
                    <button 
                      onClick={handleSearchSubmit}
                      className="w-full bg-primary-600 py-4 sm:py-6 text-white font-black text-sm sm:text-xl hover:bg-primary-700 transition-all flex items-center justify-center gap-2 sm:gap-3 active:bg-primary-800"
                    >
                      <Search size={16}/> View All Results for "{searchQuery}"
                    </button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Mobile Drawer Backdrop — OUTSIDE header so fixed positioning works ── */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Mobile Drawer Panel — OUTSIDE header ── */}
      <motion.div
        initial={false}
        animate={{ x: isMenuOpen ? 0 : '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 260 }}
        className="fixed top-0 right-0 h-full w-[85vw] max-w-sm bg-white z-[61] flex flex-col shadow-2xl"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <Link to="/" className="flex items-center gap-2.5" onClick={() => setIsMenuOpen(false)}>
            <div className="h-9 w-9 rounded-xl shadow-[0_4px_14px_0_rgba(106,13,173,0.2)] overflow-hidden bg-primary-50 p-1 flex-shrink-0">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain"/>
            </div>
            <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400 font-poppins">Pustak Maza</span>
          </Link>
          <button 
            onClick={() => setIsMenuOpen(false)}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-primary-50 hover:text-primary-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* User section */}
        <div className="px-5 py-4 border-b border-gray-100 flex-shrink-0">
          {user ? (
            <Link 
              to="/profile" 
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 p-3 rounded-2xl bg-primary-50 border border-primary-100 hover:bg-primary-100 transition-colors"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden bg-primary-200 flex items-center justify-center ring-2 ring-primary-100 flex-shrink-0">
                {user.profileImage 
                  ? <img src={user.profileImage} className="w-full h-full object-cover" alt={user.name}/> 
                  : <span className="font-bold text-primary-700 text-sm">{user.name.charAt(0)}</span>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#1e293b] text-sm truncate">{user.name}</p>
                <p className="text-xs text-[#64748b] truncate">{user.email}</p>
              </div>
              <ChevronRight size={16} className="text-primary-400 flex-shrink-0" />
            </Link>
          ) : (
            <div className="flex gap-3">
              <Link 
                to="/login" 
                onClick={() => setIsMenuOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-primary-600 text-white text-center font-bold text-sm hover:bg-primary-700 transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                onClick={() => setIsMenuOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-primary-200 text-primary-700 text-center font-bold text-sm hover:bg-primary-50 transition-colors"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto py-3 px-4">
          {navLinks.map((link) => (
            <Link 
              key={link.name}
              to={link.path} 
              onClick={() => setIsMenuOpen(false)} 
              className={`flex items-center justify-between w-full px-4 py-3.5 rounded-xl mb-1 font-semibold text-sm transition-all ${isActive(link.path) ? 'bg-primary-50 text-primary-600 border border-primary-100' : 'text-[#1e293b] hover:bg-gray-50 hover:text-primary-600'}`}
            >
              {link.name}
              {isActive(link.path) && <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0"/>}
            </Link>
          ))}
          <Link 
            to="/author/login" 
            onClick={() => setIsMenuOpen(false)} 
            className="flex items-center justify-center gap-2 w-full px-4 py-4 rounded-xl mt-4 font-black text-sm transition-all bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md font-poppins"
          >
            Author Login ✍️
          </Link>
        </nav>

        {/* Bottom quick-action bar */}
        <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/60 flex-shrink-0">
          <div className="flex justify-around">
            <button 
              onClick={() => { setIsMenuOpen(false); setIsSearchOpen(true); }}
              className="flex flex-col items-center gap-1.5 text-[#64748b] hover:text-primary-600 transition-colors"
            >
              <div className="w-11 h-11 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center hover:border-primary-100 transition-all">
                <Search size={20} />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wide">Search</span>
            </button>
            <Link 
              to="/wishlist" 
              onClick={() => setIsMenuOpen(false)} 
              className="flex flex-col items-center gap-1.5 text-[#64748b] hover:text-primary-600 transition-colors"
            >
              <div className="w-11 h-11 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center hover:border-primary-100 transition-all">
                <Heart size={20} />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wide">Wishlist</span>
            </Link>
            <Link 
              to="/cart" 
              onClick={() => setIsMenuOpen(false)} 
              className="flex flex-col items-center gap-1.5 text-[#64748b] hover:text-primary-600 transition-colors"
            >
              <div className="w-11 h-11 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center hover:border-primary-100 transition-all relative">
                <ShoppingCart size={20} />
                {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow border border-white">{cartCount > 9 ? '9+' : cartCount}</span>}
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wide">Cart</span>
            </Link>
          </div>
        </div>
      </motion.div>

      <main className="flex-grow w-full relative z-10 bg-[#f8fafc]">
        <Outlet />
      </main>

      <footer className="bg-gray-900 text-[#94a3b8] py-16 text-sm border-t-4 border-primary-500 mt-auto relative z-10">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 grid grid-cols-1 md:grid-cols-4 gap-12">
           <div>
            <h3 className="text-3xl font-black text-white mb-6 font-poppins flex items-center gap-4">
               <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center shadow-lg"><BookOpen size={20} className="text-white"/></div>
               Pustak Maza
             </h3>
             <p className="mb-6 leading-relaxed text-base tracking-wide">Your premium destination for ebooks, audiobooks, and physical masterpieces.</p>
           </div>
           <div>
             <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-base">Explore</h4>
             <ul className="space-y-4">
               <li><Link to="/format/ebook" className="hover:text-primary-400 transition flex items-center gap-2"><BookOpen size={16}/> Ebooks</Link></li>
               <li><Link to="/format/audiobook" className="hover:text-primary-400 transition flex items-center gap-2"><Headphones size={16}/> Audiobooks</Link></li>
               <li><Link to="/format/hardcopy" className="hover:text-primary-400 transition flex items-center gap-2"><Package size={16}/> Hardcovers</Link></li>
             </ul>
           </div>
           <div>
             <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-base">Help & Guide</h4>
             <ul className="space-y-4">
               <li><Link to="/faq" className="hover:text-primary-400 transition">FAQ</Link></li>
               <li><Link to="/contact" className="hover:text-primary-400 transition">Contact Us</Link></li>
               <li><Link to="/privacy" className="hover:text-primary-400 transition">Privacy Policy</Link></li>
               <li><Link to="/terms" className="hover:text-primary-400 transition">Terms &amp; Conditions</Link></li>
               <li><Link to="/refund-policy" className="hover:text-primary-400 transition">Refund &amp; Cancellation</Link></li>
               <li><Link to="/shipping-policy" className="hover:text-primary-400 transition">Shipping &amp; Delivery</Link></li>
             </ul>
           </div>
           <div>
             <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-base">Newsletter</h4>
             <p className="mb-4">Subscribe for special offers and new arrivals.</p>
             <div className="flex bg-gray-800 rounded-xl overflow-hidden focus-within:ring-2 ring-primary-500">
               <input type="email" placeholder="Email Address" className="px-5 py-4 w-full bg-transparent border-none outline-none text-white font-medium" />
               <button className="bg-primary-600 text-white px-6 py-4 hover:bg-primary-500 font-bold transition">Join</button>
             </div>
           </div>
        </div>
        <div className="text-center mt-16 pt-8 border-t border-gray-800 tracking-wider font-semibold text-gray-500">
           &copy; {new Date().getFullYear()} Pustak Maza. All rights reserved.
        </div>
      </footer>
      <Toaster position="top-right" richColors />
    </div>
  );
};

export default RootLayout;
