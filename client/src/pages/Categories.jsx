import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight, LayoutGrid, Search, Loader } from 'lucide-react';
import usePageMeta from '../hooks/usePageMeta';
import axios from '../api/axios';

const gradients = [
  'bg-gradient-to-br from-primary-900 to-primary-600',
  'bg-gradient-to-br from-blue-900 to-indigo-600',
  'bg-gradient-to-br from-emerald-900 to-teal-600',
  'bg-gradient-to-br from-amber-900 to-orange-600',
  'bg-gradient-to-br from-slate-900 to-primary-800',
  'bg-gradient-to-br from-rose-900 to-rose-600',
  'bg-gradient-to-br from-cyan-900 to-blue-700'
];

const icons = ['✨', '🚀', '🌱', '🏛️', '💼', '📜', '❤️', '🧬', '📚', '🧠', '🎭', '🔮'];

const Categories = () => {
  usePageMeta('Categories', 'Explore all book categories on Pustak Maza including Fiction, Self-Help, History, Business, and more.');
  const [categories, setCategories] = useState([]);
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchData = async () => {
      try {
        const [catRes, bookRes] = await Promise.all([
          axios.get('/categories'),
          axios.get('/books')
        ]);
        setCategories(catRes.data);
        setBooks(bookRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getBookCount = (categoryId) => {
    return books.filter(b => b.category === categoryId || b.category?._id === categoryId).length;
  };

  const filteredCategories = categories.filter(cat =>
    cat.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] w-full font-inter">
      {/* Structural Header */}
      <div className="bg-white border-b border-[#e2e8f0] sticky top-[72px] lg:top-[88px] z-30 shadow-sm">
         <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center gap-2 text-sm font-black text-[#64748b] uppercase tracking-widest">
            <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
            <ChevronRight size={16} className="text-gray-300"/>
            <span className="text-[#1e293b] bg-gray-100 px-3 py-1 rounded-md">Categories</span>
         </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-12 lg:py-20">
         {/* Title Section */}
         <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-16">
            <div className="text-center lg:text-left">
               <span className="text-primary-600 font-black uppercase tracking-[0.2em] text-sm mb-3 flex items-center justify-center lg:justify-start gap-2">
                 <LayoutGrid size={16}/> Browse Library
               </span>
               <h1 className="text-4xl md:text-5xl lg:text-5xl font-black text-[#1e293b] font-poppins drop-shadow-sm">All Book Categories</h1>
               <p className="text-lg text-[#64748b] mt-4 font-medium max-w-2xl">Dive into thousands of premium titles curated perfectly into respective genres. Discover your next great read today.</p>
            </div>
            
            <div className="w-full lg:w-96 relative">
               <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
               <input 
                 type="text" 
                 placeholder="Search categories..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full bg-white border border-[#e2e8f0] rounded-2xl pl-14 pr-6 py-5 focus:outline-none focus:ring-2 ring-primary-500 font-bold text-lg text-[#1e293b] shadow-sm hover:shadow-md transition-shadow" 
               />
            </div>
         </div>

         {loading ? (
           <div className="flex flex-col items-center justify-center py-20 gap-4">
             <Loader className="animate-spin text-primary-600" size={40} />
             <span className="text-slate-500 font-bold text-sm uppercase tracking-wider">Loading genres...</span>
           </div>
         ) : (
           /* Master Grid */
           <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-8">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((cat, idx) => {
                  const bg = gradients[idx % gradients.length];
                  const icon = icons[idx % icons.length];
                  const desc = cat.description || `Explore our handpicked collection of stories, wisdom, and educational materials in ${cat.name}.`;
                  const count = getBookCount(cat._id);

                  return (
                    <motion.div
                      key={cat._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: idx * 0.05 }}
                    >
                      <Link to={`/category/${cat.slug || cat.name.toLowerCase()}`} className="group block relative bg-white border border-[#e2e8f0] rounded-2xl sm:rounded-[2rem] p-4 sm:p-8 h-full shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(106,13,173,0.15)] hover:border-primary-300 transition-all duration-500 transform hover:-translate-y-2 overflow-hidden flex flex-col justify-between">
                         {/* Abstract Overlays */}
                         <div className={`absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 ${bg} opacity-5 rounded-bl-[100%] group-hover:scale-125 transition-transform duration-700 pointer-events-none`}></div>
                         
                         <div className="relative z-10">
                            <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl ${bg} text-white flex items-center justify-center text-xl sm:text-3xl mb-4 sm:mb-6 shadow-md shadow-primary-500/20 group-hover:scale-110 transition-transform duration-300`}>
                               {icon}
                            </div>
                            <h3 className="text-base sm:text-2xl font-black text-[#1e293b] mb-1.5 sm:mb-3 group-hover:text-primary-600 transition-colors font-poppins">{cat.name}</h3>
                            <p className="text-[#64748b] text-xs sm:text-base font-medium leading-[1.6] sm:leading-[1.7] mb-4 sm:mb-8 hidden sm:block">{desc}</p>
                         </div>
                         
                         <div className="relative z-10 flex items-center justify-between border-t border-gray-100 pt-3 sm:pt-5 mt-auto">
                            <span className="text-[9px] sm:text-xs font-black uppercase tracking-widest text-[#64748b] bg-gray-50 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-[#e2e8f0] group-hover:border-primary-200 group-hover:text-primary-600 transition-colors">{count} Books</span>
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-500 group-hover:bg-primary-500 group-hover:text-white transition-all shadow-sm">
                              <ChevronRight size={16} className="sm:w-5 sm:h-5"/>
                            </div>
                         </div>
                      </Link>
                    </motion.div>
                  );
                })
              ) : (
                <div className="col-span-full bg-white border border-[#e2e8f0] p-12 text-center text-slate-500 font-medium rounded-[2rem]">
                  No genres found matching your search.
                </div>
              )}
           </div>
         )}
      </div>
    </div>
  );
};

export default Categories;
