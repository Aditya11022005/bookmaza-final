import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Plus, FileText, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import useAuthStore from '../../store/authStore';
import { toast } from 'sonner';

const AuthorBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchAuthorBooks = async () => {
      if (!user) return;
      try {
        const { data } = await axios.get(`/books?author=${user._id}&all=true`);
        setBooks(data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load books');
      } finally {
        setLoading(false);
      }
    };
    fetchAuthorBooks();
  }, [user]);

  if (loading) return <div className="text-center py-20 text-xl font-bold animate-pulse text-white">Loading your books...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-poppins font-black text-white tracking-tight">My Publications</h1>
          <p className="text-slate-500 text-sm font-medium mt-0.5">Manage your digital catalog and monitor format pricing.</p>
        </div>
        <Link to="/author/upload" className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-600/30">
          <Plus size={18} />
          Publish New Book
        </Link>
      </div>

      {books.length === 0 ? (
        <div className="bg-[#0d1526] border border-white/[0.06] rounded-3xl p-16 text-center">
          <BookOpen className="mx-auto text-slate-600 mb-4" size={48} />
          <h2 className="text-xl font-bold text-white mb-2">No Publications Yet</h2>
          <p className="text-slate-500 max-w-sm mx-auto mb-6">Start sharing your work with the world by uploading your first eBook or audiobook.</p>
          <Link to="/author/upload" className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white text-sm font-bold px-5 py-3 rounded-xl transition-all">
            Upload Your First Book
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <motion.div
              key={book._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0d1526] border border-white/[0.06] rounded-3xl overflow-hidden flex flex-col hover:border-white/10 transition-colors shadow-2xl"
            >
              <div className="p-6 flex gap-4 border-b border-white/[0.04]">
                <img 
                  src={book.coverImage} 
                  alt={book.title} 
                  className="w-20 h-28 object-cover rounded-xl border border-white/10 shadow-lg" 
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-base truncate">{book.title}</h3>
                  <p className="text-slate-500 text-xs mt-1 truncate">{book.authorName}</p>
                  
                  <div className="flex items-center gap-2 mt-4">
                    {book.isPublished ? (
                      <span className="inline-flex items-center gap-1 bg-green-500/10 text-green-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-green-500/10">
                        <CheckCircle2 size={10} /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-500/10">
                        <AlertCircle size={10} /> Pending
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-3 flex-grow bg-white/[0.01]">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-bold">eBook Price</span>
                  <span className="text-white font-bold">
                    {book.formats?.ebook?.isAvailable ? `₹${book.formats.ebook.price}` : 'Unavailable'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-bold">Audiobook Price</span>
                  <span className="text-white font-bold">
                    {book.formats?.audiobook?.isAvailable ? `₹${book.formats.audiobook.price}` : 'Unavailable'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-bold">Hardcopy Price</span>
                  <span className="text-white font-bold">
                    {book.formats?.hardcopy?.isAvailable ? `₹${book.formats.hardcopy.price}` : 'Unavailable'}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-white/[0.02] border-t border-white/[0.04] flex gap-2">
                <Link 
                  to={`/book/${book._id}`} 
                  className="flex-1 py-2 bg-[#111a2e] hover:bg-[#1a2642] text-slate-300 hover:text-white text-xs font-bold text-center rounded-xl transition-colors border border-white/[0.04]"
                >
                  View Details
                </Link>
                {book.formats?.ebook?.isAvailable && (
                  <Link 
                    to={`/read/${book._id}`} 
                    className="flex-1 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 text-xs font-bold text-center rounded-xl transition-colors border border-amber-500/20 flex items-center justify-center gap-1"
                  >
                    <Sparkles size={12} /> Read Reader
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AuthorBooks;
