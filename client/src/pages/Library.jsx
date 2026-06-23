import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Headphones, Play, BookText, Clock, CheckCircle2, LibraryBig, Grid, Layers } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import useOrderStore from '../store/orderStore';
import useAuthStore from '../store/authStore';
import usePageMeta from '../hooks/usePageMeta';
import axios from '../api/axios';
import { toast } from 'sonner';
import { getOptimizedImageUrl } from '../utils/image';

const LibraryCard = ({ item, onClick }) => {
  const isCompleted = item.progress === 100;
  const isStarted = item.progress > 0 && item.progress < 100;
  const Icon = item.type === 'read' ? BookText : Headphones;
  const actionText = item.type === 'read' ? (isStarted ? 'Continue Reading' : 'Start Reading') : (isStarted ? 'Continue Listening' : 'Start Listening');

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white rounded-[2rem] p-4 sm:p-5 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-gray-100 hover:shadow-[0_8px_30px_-10px_rgba(106,13,173,0.15)] transition-all duration-300 group flex flex-col h-full cursor-pointer"
      onClick={() => onClick(item.type, item.bookId)}
    >
      <div className="relative w-full aspect-[2/3] rounded-[1.5rem] overflow-hidden mb-5 bg-gray-50 border border-gray-100/50 shadow-inner group-hover:shadow-md transition-shadow">
         <img src={getOptimizedImageUrl(item.coverImage, 300)} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]" />
         
         <div className="absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-white/90 text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-white/20">
            {item.type === 'read' ? <BookOpen size={12} className="text-blue-300"/> : <Headphones size={12} className="text-purple-300"/>}
            {item.format}
         </div>

         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
            <div className="w-14 h-14 rounded-full bg-white text-primary-600 flex items-center justify-center shadow-lg transform scale-50 group-hover:scale-100 transition-transform duration-300 ease-out">
               <Play size={24} className={item.type === 'listen' ? 'ml-1' : ''} fill="currentColor"/>
            </div>
         </div>
      </div>

      <div className="flex-1 flex flex-col">
         <h3 className="font-poppins font-bold text-[#1e293b] text-xl leading-tight mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">{item.title}</h3>
         <p className="text-[#64748b] text-sm font-medium mb-auto">by <span className="text-[#1e293b] font-bold">{item.author}</span></p>

         <div className="mt-6 pt-5 border-t border-gray-50 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold font-inter">
               {isCompleted ? (
                  <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100/50 uppercase tracking-wider"><CheckCircle2 size={12} /> Completed</span>
               ) : isStarted ? (
                  <span className="flex items-center gap-1.5 text-primary-600 uppercase tracking-wider bg-primary-50 px-2 py-1 rounded-lg border border-primary-100/50"><Clock size={12} /> {item.progress}% Finished</span>
               ) : (
                  <span className="flex items-center gap-1.5 text-gray-500 uppercase tracking-wider bg-gray-50 px-2 py-1 rounded-lg border border-gray-100"><Icon size={12} /> Not Started</span>
               )}
            </div>
            
            {!isCompleted && item.progress > 0 && (
               <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${item.progress}%` }}
                     transition={{ duration: 1, ease: 'easeOut' }}
                     className={`h-full rounded-full ${item.type === 'read' ? 'bg-blue-500' : 'bg-purple-500'}`}
                  ></motion.div>
               </div>
            )}

            <button className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${isCompleted ? 'bg-gray-50 text-[#1e293b] border-2 border-gray-100 hover:border-gray-200 hover:bg-gray-100' : 'bg-primary-600 text-white shadow-[0_4px_14px_0_rgba(106,13,173,0.39)] hover:shadow-[0_6px_20px_rgba(106,13,173,0.23)] hover:bg-primary-700'}`}>
               <Icon size={18} /> {actionText}
            </button>
         </div>
      </div>
    </motion.div>
  );
};

const ShelfBook = ({ item, onClick }) => {
  const isStarted = item.progress > 0 && item.progress < 100;

  return (
    <div className="relative pb-10 pt-4 flex flex-col items-center group">
      {/* 3D Book Container */}
      <div 
        className="book-scene cursor-pointer"
        onClick={() => onClick(item.type, item.bookId)}
      >
        <div className="book-wrap">
          {/* Front Cover */}
          <div 
            className="book-face book-front" 
            style={{ 
              backgroundImage: `url(${getOptimizedImageUrl(item.coverImage, 300)})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* Format Badge */}
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 border border-white/10">
              {item.type === 'read' ? <BookOpen size={10} className="text-blue-300"/> : <Headphones size={10} className="text-purple-300"/>}
              {item.format}
            </div>

            {/* Progress overlay */}
            {item.progress > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/50 rounded-b-[4px]">
                <div 
                  className={`h-full ${item.type === 'read' ? 'bg-blue-500' : 'bg-purple-500'}`} 
                  style={{ width: `${item.progress}%` }}
                ></div>
              </div>
            )}
          </div>

          {/* Spine (Left side thickness) */}
          <div 
            className="book-spine"
            style={{
              background: item.type === 'read' 
                ? 'linear-gradient(to right, #1d4ed8 0%, #1e3a8a 100%)' 
                : 'linear-gradient(to right, #7c3aed 0%, #6d28d9 100%)'
            }}
          />

          {/* Paper Pages (Right side thickness) */}
          <div className="book-pages" />

          {/* Back Cover */}
          <div 
            className="book-face book-back" 
            style={{
              backgroundColor: item.type === 'read' ? '#172554' : '#2e1065'
            }}
          />
        </div>
      </div>

      {/* Individual Wooden Shelf Plank */}
      <div className="absolute bottom-10 left-0 right-0 h-6 z-10 pointer-events-none">
        <div className="shelf-plank" />
      </div>

      {/* Title & Quick Action */}
      <div className="mt-8 text-center max-w-[140px] z-20 relative px-2">
        <h4 className="font-poppins font-black text-sm text-[#1e293b] line-clamp-1 group-hover:text-primary-600 transition-colors" title={item.title}>
          {item.title}
        </h4>
        <p className="text-[#64748b] text-[10px] font-bold uppercase tracking-wider mb-2">by {item.author}</p>
        <button 
          onClick={() => onClick(item.type, item.bookId)}
          className={`px-4 py-1.5 rounded-lg text-white text-[10px] font-black uppercase tracking-wider shadow-sm transition-all active:scale-[0.98] cursor-pointer ${
            item.type === 'read' 
              ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20' 
              : 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/20'
          }`}
        >
          {item.type === 'read' ? (isStarted ? 'Continue' : 'Read') : (isStarted ? 'Resume' : 'Listen')}
        </button>
      </div>
    </div>
  );
};

const Library = () => {
  usePageMeta('My Library', 'Access your purchased ebooks and audiobooks instantly in your Pustak Maza digital library.');
  const navigate = useNavigate();
  const { library = [] } = useOrderStore(); 
  const { user, login } = useAuthStore();

  const [purchasedBooks, setPurchasedBooks] = useState([]);
  const [progressList, setProgressList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('bookshelf'); // 'bookshelf' | 'grid'

  // Load database items & progress
  useEffect(() => {
    const fetchLibraryData = async () => {
      try {
        const [profileRes, progressRes] = await Promise.all([
          axios.get('/users/profile'),
          axios.get('/progress/all')
        ]);
        
        const profile = profileRes.data;
        setPurchasedBooks(profile.purchasedBooks || []);
        
        // Keep Zustand user session synced with populated profile lists
        if (user) {
          login({
            ...user,
            purchasedBooks: profile.purchasedBooks,
            wishlist: profile.wishlist
          });
        }

        setProgressList(progressRes.data || []);
      } catch (err) {
        console.error('Failed to load user library details:', err);
        toast.error('Failed to load latest bookshelf. Showing local items.');
      } finally {
        setLoading(false);
      }
    };
    fetchLibraryData();
  }, []);

  // Merge backend db purchases & local order items
  const combinedLibrary = [];

  // Add db items
  purchasedBooks.forEach(book => {
    if (book && book._id) {
      const formats = [];
      const ebookFormats = book.formats?.ebook || {};
      const audiobookFormats = book.formats?.audiobook || {};

      // Check if ebook is available
      if (ebookFormats.isAvailable) {
        formats.push('ebook');
      }
      
      // Check if audiobook is available
      if (audiobookFormats.isAvailable) {
        formats.push('audiobook');
      }

      formats.forEach(fmt => {
        const type = fmt === 'ebook' ? 'read' : 'listen';
        const formatLabel = fmt === 'ebook' ? 'Ebook' : 'Audiobook';
        
        // Find matching progress
        const matchedProg = progressList.find(
          p => p.book === book._id && p.format === fmt
        );
        const progressVal = matchedProg ? matchedProg.percentage : 0;

        combinedLibrary.push({
          id: `lib_db_${book._id}_${fmt}`,
          type,
          title: book.title,
          author: book.authorName || 'Pustak Maza Author',
          format: formatLabel,
          progress: progressVal,
          lastAccessed: matchedProg ? matchedProg.lastAccessed : new Date().toISOString(),
          coverImage: book.coverImage,
          bookId: book._id
        });
      });
    }
  });

  // Add local order items fallback
  library.forEach(localItem => {
    const exists = combinedLibrary.some(
      item => item.bookId === localItem.bookId && item.type === localItem.type
    );
    if (!exists) {
      // Find matching progress in case local items have progress
      const matchedProg = progressList.find(
        p => p.book === localItem.bookId && p.format === (localItem.type === 'read' ? 'ebook' : 'audiobook')
      );
      combinedLibrary.push({
        ...localItem,
        progress: matchedProg ? matchedProg.percentage : localItem.progress
      });
    }
  });

  const handleAccessContent = (type, bookId) => {
    navigate(`/${type}/${bookId}`);
  };

  const activeBooks = combinedLibrary.filter(b => b && b.progress > 0 && b.progress < 100);
  const newBooks = combinedLibrary.filter(b => b && b.progress === 0);
  const finishedBooks = combinedLibrary.filter(b => b && b.progress === 100);

  if (loading) {
    return <div className="text-center py-20 text-xl font-medium animate-pulse text-slate-500 font-poppins">Loading Bookshelf & Syncing Progress...</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="pb-20 font-poppins"
    >
      <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
         <div>
            <h1 className="text-3xl font-poppins font-black text-[#1e293b] mb-2 flex items-center gap-3">
               <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center shadow-inner">
                  <LibraryBig size={20} />
               </div>
               My Library
            </h1>
            <p className="text-[#64748b]">Access your purchased ebooks and audiobooks instantly.</p>
         </div>

         {/* View Mode Toggle Controls */}
         {combinedLibrary.length > 0 && (
           <div className="flex bg-[#f1f5f9] p-1 rounded-2xl border border-slate-200/80 w-fit shrink-0 self-start sm:self-auto shadow-inner">
              <button 
                 onClick={() => setViewMode('bookshelf')}
                 className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${viewMode === 'bookshelf' ? 'bg-primary-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
              >
                 <Layers size={14} /> 3D Bookshelf
              </button>
              <button 
                 onClick={() => setViewMode('grid')}
                 className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-primary-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
              >
                 <Grid size={14} /> Classic Grid
              </button>
           </div>
         )}
      </div>

      {combinedLibrary.length === 0 ? (
         <div className="bg-white rounded-[2rem] border border-gray-100 p-12 text-center shadow-sm">
            <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6 text-primary-300">
               <LibraryBig size={48} />
            </div>
            <h2 className="text-3xl font-poppins font-black text-[#1e293b] mb-4">Your Library is Empty</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">Purchase digital Ebooks and Audiobooks from the store to instantly unlock them here!</p>
            <Link to="/shop" className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 text-white font-black rounded-xl hover:bg-primary-700 transition shadow-[0_8px_20px_-6px_rgba(106,13,173,0.5)]">
               Explore Digital Books
            </Link>
         </div>
      ) : viewMode === 'bookshelf' ? (
         /* 3D Virtual Bookshelf View Mode */
         <div className="bg-[#fcf8f2] rounded-[2.5rem] border border-[#eadaab]/60 p-6 sm:p-10 shadow-[inset_0_4px_20px_rgba(0,0,0,0.03)] relative overflow-hidden">
            {/* Wooden poles/columns decoration on left and right edges */}
            <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-[#573314] to-[#855329] border-r border-[#3e220a] z-30 pointer-events-none rounded-l-[2.5rem]"></div>
            <div className="absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-l from-[#573314] to-[#855329] border-l border-[#3e220a] z-30 pointer-events-none rounded-r-[2.5rem]"></div>

            {/* Grid of Books */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-16 px-4 py-6">
               {combinedLibrary.map((item) => (
                  <ShelfBook key={item.id} item={item} onClick={handleAccessContent} />
               ))}
            </div>
         </div>
      ) : (
         /* Classic List Grid View Mode */
         <div className="space-y-16">
            
            {activeBooks.length > 0 && (
               <section>
                  <h2 className="text-xl font-poppins font-black text-[#1e293b] mb-6 flex items-center gap-2 uppercase tracking-wide">
                     <span className="w-2.5 h-2.5 rounded-full bg-primary-500"></span> Jump Back In
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                     {activeBooks.map((item, idx) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                        >
                           <LibraryCard item={item} onClick={handleAccessContent} />
                        </motion.div>
                     ))}
                  </div>
               </section>
            )}

            {newBooks.length > 0 && (
               <section>
                  <h2 className="text-xl font-poppins font-black text-[#1e293b] mb-6 flex items-center gap-2 uppercase tracking-wide">
                     <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Up Next
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                     {newBooks.map((item, idx) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                        >
                           <LibraryCard item={item} onClick={handleAccessContent} />
                        </motion.div>
                     ))}
                  </div>
               </section>
            )}

            {finishedBooks.length > 0 && (
               <section>
                  <h2 className="text-xl font-poppins font-black text-[#1e293b] mb-6 flex items-center gap-2 uppercase tracking-wide">
                     <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Finished Books
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                     {finishedBooks.map((item, idx) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                        >
                           <LibraryCard item={item} onClick={handleAccessContent} />
                        </motion.div>
                     ))}
                  </div>
               </section>
            )}

         </div>
      )}
    </motion.div>
  );
};

export default Library;

