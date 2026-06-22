import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Filter, Edit, Trash2, Star, X, Upload, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';
import axios from '../../api/axios';
import { toast } from 'sonner';

const AdminBooks = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [summaryEn, setSummaryEn] = useState('');
  const [summaryMr, setSummaryMr] = useState('');
  const [category, setCategory] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [images, setImages] = useState([]);
  const [isPublished, setIsPublished] = useState(true);

  // New metadata fields
  const [isbn, setIsbn] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [pages, setPages] = useState('');
  const [publisher, setPublisher] = useState('');
  const [publishYear, setPublishYear] = useState('');
  const [language, setLanguage] = useState('Marathi');
  const [authorName, setAuthorName] = useState('');
  
  // Custom roles & external links
  const [coAuthor, setCoAuthor] = useState('');
  const [chiefEditor, setChiefEditor] = useState('');
  const [editor, setEditor] = useState('');
  const [amazonLink, setAmazonLink] = useState('');
  const [flipkartLink, setFlipkartLink] = useState('');
  const [pothiLink, setPothiLink] = useState('');

  // Formats state
  const [ebookAvailable, setEbookAvailable] = useState(false);
  const [ebookPrice, setEbookPrice] = useState(0);
  const [ebookFree, setEbookFree] = useState(false);
  const [ebookFile, setEbookFile] = useState('');
  const [ebookPdf, setEbookPdf] = useState('');
  const [ebookEpub, setEbookEpub] = useState('');
  const [ebookDocx, setEbookDocx] = useState('');

  const [audiobookAvailable, setAudiobookAvailable] = useState(false);
  const [audiobookPrice, setAudiobookPrice] = useState(0);
  const [audiobookFree, setAudiobookFree] = useState(false);
  const [audiobookFile, setAudiobookFile] = useState('');
  const [audiobookDuration, setAudiobookDuration] = useState('');
  const [chapters, setChapters] = useState([]);

  const [hardcopyAvailable, setHardcopyAvailable] = useState(false);
  const [hardcopyPrice, setHardcopyPrice] = useState(0);
  const [hardcopyStock, setHardcopyStock] = useState(0);

  const [loading, setLoading] = useState(false);

  const fetchBooks = async () => {
    try {
      const { data } = await axios.get('/books?all=true');
      setBooks(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch books');
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get('/categories');
      setCategories(data);
      if (data.length > 0 && !category) {
        setCategory(data[0]._id);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch categories');
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingBook(null);
    setTitle('');
    setDescription('');
    setSummaryEn('');
    setSummaryMr('');
    if (categories.length > 0) setCategory(categories[0]._id);
    else setCategory('');
    setCoverImage('');
    setImages([]);
    setIsPublished(true);
    setEbookAvailable(false);
    setEbookPrice(0);
    setEbookFree(false);
    setEbookFile('');
    setEbookPdf('');
    setEbookEpub('');
    setEbookDocx('');
    setAudiobookAvailable(false);
    setAudiobookPrice(0);
    setAudiobookFree(false);
    setAudiobookFile('');
    setAudiobookDuration('');
    setChapters([]);
    setHardcopyAvailable(false);
    setHardcopyPrice(0);
    setHardcopyStock(0);
    
    // Reset metadata
    setIsbn('');
    setDiscountPercentage(0);
    setPages('');
    setPublisher('');
    setPublishYear('');
    setLanguage('Marathi');
    setAuthorName('');
    
    setCoAuthor('');
    setChiefEditor('');
    setEditor('');
    setAmazonLink('');
    setFlipkartLink('');
    setPothiLink('');
    
    setIsModalOpen(true);
  };

  const openEditModal = (book) => {
    setEditingBook(book);
    setTitle(book.title || '');
    setDescription(book.description || '');
    setSummaryEn(book.summaryEn || '');
    setSummaryMr(book.summaryMr || '');
    setCategory(book.category?._id || book.category || '');
    setCoverImage(book.coverImage || '');
    setImages(book.images || []);
    setIsPublished(book.isPublished);

    setEbookAvailable(book.formats?.ebook?.isAvailable || false);
    setEbookPrice(book.formats?.ebook?.price || 0);
    setEbookFree(book.formats?.ebook?.isFree || false);
    setEbookFile(book.formats?.ebook?.fileUrl || '');
    setEbookPdf(book.formats?.ebook?.pdfUrl || '');
    setEbookEpub(book.formats?.ebook?.epubUrl || '');
    setEbookDocx(book.formats?.ebook?.docxUrl || '');

    setAudiobookAvailable(book.formats?.audiobook?.isAvailable || false);
    setAudiobookPrice(book.formats?.audiobook?.price || 0);
    setAudiobookFree(book.formats?.audiobook?.isFree || false);
    setAudiobookFile(book.formats?.audiobook?.fileUrl || '');
    setAudiobookDuration(book.formats?.audiobook?.duration || '');
    setChapters(book.formats?.audiobook?.chapters || []);

    setHardcopyAvailable(book.formats?.hardcopy?.isAvailable || false);
    setHardcopyPrice(book.formats?.hardcopy?.price || 0);
    setHardcopyStock(book.formats?.hardcopy?.stock || 0);

    // Populate metadata
    setIsbn(book.isbn || '');
    setDiscountPercentage(book.discountPercentage || 0);
    setPages(book.pages || '');
    setPublisher(book.publisher || '');
    setPublishYear(book.publishYear || '');
    setLanguage(book.language || 'Marathi');
    setAuthorName(book.authorName || '');

    setCoAuthor(book.coAuthor || '');
    setChiefEditor(book.chiefEditor || '');
    setEditor(book.editor || '');
    setAmazonLink(book.amazonLink || '');
    setFlipkartLink(book.flipkartLink || '');
    setPothiLink(book.pothiLink || '');

    setIsModalOpen(true);
  };

  const handleUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    const isImage = type === 'cover' || type === 'auxiliary';
    formData.append(isImage ? 'image' : 'file', file);

    const toastId = toast.loading(`Uploading ${type === 'cover' ? 'cover image' : type === 'auxiliary' ? 'preview image' : 'file'}...`);

    try {
      const endpoint = isImage ? '/upload/image' : '/upload/protected';
      const { data } = await axios.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Uploaded successfully!', { id: toastId });
      if (type === 'cover') setCoverImage(data.url);
      else if (type === 'auxiliary') setImages(prev => [...prev, data.url]);
      else if (type === 'ebook') setEbookFile(data.url);
      else if (type === 'ebook-pdf') setEbookPdf(data.url);
      else if (type === 'ebook-epub') setEbookEpub(data.url);
      else if (type === 'ebook-docx') setEbookDocx(data.url);
      else if (type === 'audiobook') setAudiobookFile(data.url);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Upload failed', { id: toastId });
    }
  };

  const handleSaveBook = async (e) => {
    e.preventDefault();
    if (!title || !description || !category || !coverImage) {
      toast.error('Title, description, category, and cover image are required.');
      return;
    }

    const payload = {
      title,
      description,
      category,
      coverImage,
      images,
      isPublished,
      isbn,
      discountPercentage: Number(discountPercentage) || 0,
      pages: pages ? Number(pages) : undefined,
      publisher,
      publishYear: publishYear ? Number(publishYear) : undefined,
      language,
      authorName,
      summaryEn,
      summaryMr,
      coAuthor,
      chiefEditor,
      editor,
      amazonLink,
      flipkartLink,
      pothiLink,
      formats: {
        ebook: {
          isAvailable: ebookAvailable,
          isFree: ebookFree,
          price: ebookFree ? 0 : Number(ebookPrice),
          fileUrl: ebookFile || ebookPdf || ebookEpub || ebookDocx,
          pdfUrl: ebookPdf,
          epubUrl: ebookEpub,
          docxUrl: ebookDocx,
        },
        audiobook: {
          isAvailable: audiobookAvailable,
          isFree: audiobookFree,
          price: audiobookFree ? 0 : Number(audiobookPrice),
          fileUrl: audiobookFile || (chapters.length > 0 ? chapters[0].fileUrl : ''),
          duration: audiobookDuration,
          chapters: chapters,
        },
        hardcopy: {
          isAvailable: hardcopyAvailable,
          price: Number(hardcopyPrice),
          stock: Number(hardcopyStock),
        }
      }
    };

    setLoading(true);
    try {
      if (editingBook) {
        await axios.put(`/books/${editingBook._id}`, payload);
        toast.success('Book updated successfully!');
      } else {
        await axios.post('/books', payload);
        toast.success('Book created successfully!');
      }
      setIsModalOpen(false);
      fetchBooks();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save book');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBook = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    try {
      await axios.delete(`/books/${id}`);
      toast.success('Book removed successfully!');
      fetchBooks();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to delete book');
    }
  };

  const handleTogglePublish = async (book) => {
    try {
      const updatedStatus = !book.isPublished;
      await axios.put(`/books/${book._id}`, { isPublished: updatedStatus });
      toast.success(updatedStatus ? 'Book published!' : 'Book unpublished!');
      fetchBooks();
    } catch (err) {
      console.error(err);
      toast.error('Failed to change publish status');
    }
  };

  const filteredBooks = books.filter(book => 
    (book.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (book.authorName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-poppins font-black text-white tracking-tight">Books Catalog</h1>
          <p className="text-slate-500 text-sm font-medium mt-0.5">Manage inventory, pricing, and book formats</p>
        </div>
        <button 
          onClick={openAddModal}
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-primary-600/30"
        >
          <Plus size={18} />
          Add New Book
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search books by title, author..."
            className="w-full bg-[#0d1526] border border-white/[0.06] text-white text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all placeholder:text-slate-600"
          />
        </div>
      </div>

      <div className="bg-[#0d1526] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                <th className="px-5 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Book Info</th>
                <th className="px-5 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Category</th>
                <th className="px-5 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Formats Available</th>
                <th className="px-5 py-4 text-center text-[11px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Status</th>
                <th className="px-5 py-4 text-right text-[11px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.length > 0 ? (
                filteredBooks.map((book, i) => {
                  const formatLabels = [];
                  if (book.formats?.ebook?.isAvailable) formatLabels.push('Ebook');
                  if (book.formats?.audiobook?.isAvailable) formatLabels.push('Audiobook');
                  if (book.formats?.hardcopy?.isAvailable) formatLabels.push('Physical');

                  return (
                    <motion.tr
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      key={book._id}
                      className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-14 rounded-lg overflow-hidden shrink-0 bg-white/5 border border-white/[0.06]">
                            <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="text-white font-bold text-sm leading-tight">{book.title}</p>
                            <p className="text-slate-500 text-xs font-medium mt-0.5">By {book.authorName || 'Unknown'}</p>
                            <div className="flex items-center gap-1 mt-1 text-amber-400 text-[10px] font-bold">
                              <Star size={10} fill="currentColor" /> {book.rating || 4.5} ({book.numReviews || 0} reviews)
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-block text-[9px] font-black uppercase tracking-widest bg-white/[0.05] text-slate-300 border border-white/[0.1] px-2 py-0.5 rounded">
                          {book.category?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {formatLabels.length > 0 ? (
                            formatLabels.map((lbl) => (
                              <span key={lbl} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary-950/40 text-primary-400 border border-primary-800/40">
                                {lbl}
                              </span>
                            ))
                          ) : (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                              None
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button 
                          onClick={() => handleTogglePublish(book)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors
                            ${book.isPublished ? 'text-emerald-400 bg-emerald-400/10 hover:bg-emerald-400/20' : 'text-slate-400 bg-slate-400/10 hover:bg-slate-400/20'}`}
                        >
                          {book.isPublished ? (
                            <><Eye size={12} /> Published</>
                          ) : (
                            <><EyeOff size={12} /> Draft</>
                          )}
                        </button>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => openEditModal(book)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteBook(book._id)}
                            className="p-1.5 text-rose-400 hover:text-white hover:bg-rose-500/20 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center text-slate-500 font-medium">
                    No books found. Add some to populate the catalog!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Book Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0d1526] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <form onSubmit={handleSaveBook} className="flex flex-col h-full overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
                  <h2 className="text-xl font-poppins font-bold text-white">
                    {editingBook ? 'Edit Book Details' : 'Add New Book'}
                  </h2>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5">
                  <div className="flex flex-col md:flex-row gap-5">
                    {/* Cover block */}
                    <div className="w-full md:w-36 flex flex-col gap-2 shrink-0">
                      <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest">Cover Image</label>
                      <div className="h-48 bg-white/5 border border-white/10 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-colors cursor-pointer border-dashed relative overflow-hidden group">
                        {coverImage ? (
                          <>
                            <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                            <button 
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setCoverImage(''); }}
                              className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-red-500 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <>
                            <Upload size={24} className="mb-2" />
                            <span className="text-[10px] font-bold text-center px-2">Upload Image File</span>
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={(e) => handleUpload(e, 'cover')}
                              className="absolute inset-0 opacity-0 cursor-pointer" 
                            />
                          </>
                        )}
                      </div>
                      <div className="text-slate-500 text-center font-bold text-[10px]">- OR -</div>
                      <input 
                        type="text" 
                        placeholder="Paste Cover Image URL" 
                        value={coverImage} 
                        onChange={(e) => setCoverImage(e.target.value)}
                        className="w-full bg-[#0f172a] border border-white/10 text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-primary-500/50 placeholder:text-slate-600"
                      />
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      <div>
                        <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Book Title</label>
                        <input 
                          type="text" 
                          required
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="e.g. Atomic Habits" 
                          className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50" 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Category</label>
                          <select 
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50 appearance-none cursor-pointer"
                          >
                            {categories.map((cat) => (
                              <option key={cat._id} value={cat._id}>{cat.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-end pb-1">
                          <label className="flex items-center gap-2 text-sm text-slate-300 font-medium cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={isPublished}
                              onChange={(e) => setIsPublished(e.target.checked)}
                              className="w-4 h-4 rounded border-white/20 bg-white/5 accent-primary-500" 
                            />
                            Publish Immediately
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Description</label>
                        <textarea 
                          rows="3" 
                          required
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Full description of the book..." 
                          className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50 resize-none"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">English Summary (Optional)</label>
                          <textarea 
                            rows="3" 
                            value={summaryEn}
                            onChange={(e) => setSummaryEn(e.target.value)}
                            placeholder="Defaults to description if blank..." 
                            className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50 resize-none"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Marathi Summary (Optional)</label>
                          <textarea 
                            rows="3" 
                            value={summaryMr}
                            onChange={(e) => setSummaryMr(e.target.value)}
                            placeholder="Leave blank to auto-translate from English..." 
                            className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50 resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Multiple Preview Images Upload */}
                  <div className="border-t border-white/10 pt-5 space-y-4">
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest">Book Preview Images (Multiple)</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {images.map((img, index) => (
                        <div key={index} className="relative aspect-[3/4] bg-white/5 border border-white/10 rounded-xl overflow-hidden group">
                          <img src={img} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setImages(prev => prev.filter((_, i) => i !== index))}
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-red-500 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      
                      {/* Upload Box */}
                      <div className="aspect-[3/4] bg-white/5 border border-white/10 border-dashed rounded-xl flex flex-col items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-colors cursor-pointer relative">
                        <Upload size={20} className="mb-1" />
                        <span className="text-[9px] font-bold text-center px-1">Add Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleUpload(e, 'auxiliary')}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Or paste auxiliary image URL and press Enter"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (e.target.value.trim()) {
                              setImages(prev => [...prev, e.target.value.trim()]);
                              e.target.value = '';
                            }
                          }
                        }}
                        className="flex-1 bg-[#0f172a] border border-white/10 text-white text-xs rounded-xl px-3 py-2 placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50"
                      />
                    </div>
                  </div>

                  {/* Book Metadata & Details */}
                  <div className="border-t border-white/10 pt-5 space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Book Metadata & Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">ISBN</label>
                        <input 
                          type="text" 
                          value={isbn}
                          onChange={(e) => setIsbn(e.target.value)}
                          placeholder="e.g. 978-3-16-148410-0" 
                          className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50" 
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Author Name</label>
                        <input 
                          type="text" 
                          value={authorName}
                          onChange={(e) => setAuthorName(e.target.value)}
                          placeholder="Custom Author Name" 
                          className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Co-Author Name(s)</label>
                        <input 
                          type="text" 
                          value={coAuthor}
                          onChange={(e) => setCoAuthor(e.target.value)}
                          placeholder="Co-Author(s) (comma separated)" 
                          className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50" 
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Chief Editor</label>
                        <input 
                          type="text" 
                          value={chiefEditor}
                          onChange={(e) => setChiefEditor(e.target.value)}
                          placeholder="Chief Editor" 
                          className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50" 
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Editor</label>
                        <input 
                          type="text" 
                          value={editor}
                          onChange={(e) => setEditor(e.target.value)}
                          placeholder="Editor" 
                          className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Discount Percentage (%)</label>
                        <input 
                          type="number" 
                          min="0"
                          max="100"
                          value={discountPercentage}
                          onChange={(e) => setDiscountPercentage(e.target.value)}
                          placeholder="e.g. 10" 
                          className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50" 
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Language</label>
                        <input 
                          type="text" 
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          placeholder="e.g. Marathi, English" 
                          className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50" 
                        />
                      </div>
                    </div>

                    {/* External Purchase Links */}
                    <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4 space-y-3">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">External Store Purchase Links</h4>
                      <p className="text-[10px] text-slate-500">Provide links if the book is not directly sold on this platform.</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Amazon Link</label>
                          <input 
                            type="text" 
                            value={amazonLink}
                            onChange={(e) => setAmazonLink(e.target.value)}
                            placeholder="Amazon URL" 
                            className="w-full bg-[#0f172a] border border-white/10 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-primary-500/50" 
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Flipkart Link</label>
                          <input 
                            type="text" 
                            value={flipkartLink}
                            onChange={(e) => setFlipkartLink(e.target.value)}
                            placeholder="Flipkart URL" 
                            className="w-full bg-[#0f172a] border border-white/10 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-primary-500/50" 
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Pothi Link</label>
                          <input 
                            type="text" 
                            value={pothiLink}
                            onChange={(e) => setPothiLink(e.target.value)}
                            placeholder="Pothi URL" 
                            className="w-full bg-[#0f172a] border border-white/10 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-primary-500/50" 
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Total Pages</label>
                        <input 
                          type="number" 
                          min="0"
                          value={pages}
                          onChange={(e) => setPages(e.target.value)}
                          placeholder="e.g. 350" 
                          className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50" 
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Publisher</label>
                        <input 
                          type="text" 
                          value={publisher}
                          onChange={(e) => setPublisher(e.target.value)}
                          placeholder="e.g. Pustak Maza" 
                          className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50" 
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Publish Year</label>
                        <input 
                          type="number" 
                          min="1800"
                          max={new Date().getFullYear() + 1}
                          value={publishYear}
                          onChange={(e) => setPublishYear(e.target.value)}
                          placeholder="e.g. 2026" 
                          className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Formats setup */}
                  <div className="border-t border-white/10 pt-5 space-y-5">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Formats & Pricing</h3>

                    {/* 1. Ebook */}
                    <div className="p-4 rounded-xl border border-white/10 bg-white/[0.01] space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm font-bold text-white cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={ebookAvailable}
                            onChange={(e) => setEbookAvailable(e.target.checked)}
                            className="w-4 h-4 rounded border-white/20 bg-white/5 accent-primary-500" 
                          />
                          E-Book Format Available
                        </label>
                      </div>
                      {ebookAvailable && (
                        <div className="space-y-4 pt-2">
                          <div className="max-w-md">
                            <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">E-Book Price (₹)</label>
                            <div className="flex items-center gap-3">
                              <input 
                                type="number" 
                                min="0"
                                disabled={ebookFree}
                                value={ebookFree ? 0 : ebookPrice}
                                onChange={(e) => setEbookPrice(e.target.value)}
                                placeholder="299" 
                                className="w-40 bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-2 disabled:opacity-50 focus:outline-none focus:border-primary-500/50" 
                              />
                              <label className="flex items-center gap-2 text-xs text-slate-300 font-bold uppercase tracking-wider cursor-pointer whitespace-nowrap">
                                <input 
                                  type="checkbox" 
                                  checked={ebookFree}
                                  onChange={(e) => setEbookFree(e.target.checked)}
                                  className="w-4 h-4 rounded border-white/20 bg-white/5 accent-primary-500" 
                                />
                                Make Free E-Book
                              </label>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            {/* PDF File */}
                            <div className="space-y-1.5">
                              <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest">PDF format URL</label>
                              <div className="flex gap-2">
                                <input 
                                  type="text" 
                                  value={ebookPdf}
                                  onChange={(e) => setEbookPdf(e.target.value)}
                                  placeholder="PDF URL" 
                                  className="w-full min-w-0 bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-3 py-2 placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50" 
                                />
                                <div className="relative bg-primary-600/20 text-primary-400 hover:bg-primary-600/30 border border-primary-500/20 px-3 py-2 rounded-xl flex items-center justify-center cursor-pointer text-xs font-bold whitespace-nowrap shrink-0">
                                  PDF
                                  <input 
                                    type="file" 
                                    accept=".pdf"
                                    onChange={(e) => handleUpload(e, 'ebook-pdf')}
                                    className="absolute inset-0 opacity-0 cursor-pointer" 
                                  />
                                </div>
                              </div>
                            </div>

                            {/* EPUB File */}
                            <div className="space-y-1.5">
                              <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest">EPUB format URL</label>
                              <div className="flex gap-2">
                                <input 
                                  type="text" 
                                  value={ebookEpub}
                                  onChange={(e) => setEbookEpub(e.target.value)}
                                  placeholder="EPUB URL" 
                                  className="w-full min-w-0 bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-3 py-2 placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50" 
                                />
                                <div className="relative bg-primary-600/20 text-primary-400 hover:bg-primary-600/30 border border-primary-500/20 px-3 py-2 rounded-xl flex items-center justify-center cursor-pointer text-xs font-bold whitespace-nowrap shrink-0">
                                  EPUB
                                  <input 
                                    type="file" 
                                    accept=".epub"
                                    onChange={(e) => handleUpload(e, 'ebook-epub')}
                                    className="absolute inset-0 opacity-0 cursor-pointer" 
                                  />
                                </div>
                              </div>
                            </div>

                            {/* DOCX File */}
                            <div className="space-y-1.5">
                              <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest">DOCX format URL</label>
                              <div className="flex gap-2">
                                <input 
                                  type="text" 
                                  value={ebookDocx}
                                  onChange={(e) => setEbookDocx(e.target.value)}
                                  placeholder="DOCX URL" 
                                  className="w-full min-w-0 bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-3 py-2 placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50" 
                                />
                                <div className="relative bg-primary-600/20 text-primary-400 hover:bg-primary-600/30 border border-primary-500/20 px-3 py-2 rounded-xl flex items-center justify-center cursor-pointer text-xs font-bold whitespace-nowrap shrink-0">
                                  DOCX
                                  <input 
                                    type="file" 
                                    accept=".docx,.doc"
                                    onChange={(e) => handleUpload(e, 'ebook-docx')}
                                    className="absolute inset-0 opacity-0 cursor-pointer" 
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 2. Audiobook */}
                    <div className="p-4 rounded-xl border border-white/10 bg-white/[0.01] space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm font-bold text-white cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={audiobookAvailable}
                            onChange={(e) => setAudiobookAvailable(e.target.checked)}
                            className="w-4 h-4 rounded border-white/20 bg-white/5 accent-primary-500" 
                          />
                          Audiobook Format Available
                        </label>
                      </div>
                      {audiobookAvailable && (
                        <div className="space-y-4 pt-2">
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                            <div className="lg:col-span-3">
                              <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">Audio Price (₹)</label>
                              <div className="flex items-center gap-2">
                                <input 
                                  type="number" 
                                  min="0"
                                  disabled={audiobookFree}
                                  value={audiobookFree ? 0 : audiobookPrice}
                                  onChange={(e) => setAudiobookPrice(e.target.value)}
                                  placeholder="399" 
                                  className="w-full min-w-0 bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-2 disabled:opacity-50 focus:outline-none focus:border-primary-500/50" 
                                />
                                <label className="flex items-center gap-1.5 text-[10px] text-slate-300 font-bold uppercase tracking-wider cursor-pointer whitespace-nowrap">
                                  <input 
                                    type="checkbox" 
                                    checked={audiobookFree}
                                    onChange={(e) => setAudiobookFree(e.target.checked)}
                                    className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 accent-primary-500" 
                                  />
                                  Free
                                </label>
                              </div>
                            </div>
                            <div className="lg:col-span-3">
                              <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">Duration (e.g. 5h 20m)</label>
                              <input 
                                type="text" 
                                value={audiobookDuration}
                                onChange={(e) => setAudiobookDuration(e.target.value)}
                                placeholder="e.g. 6 hours" 
                                className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-2 focus:outline-none focus:border-primary-500/50" 
                              />
                            </div>
                            <div className="lg:col-span-6">
                              <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">Main / Intro Audio File URL</label>
                              <div className="flex gap-2 w-full min-w-0">
                                <input 
                                  type="text" 
                                  value={audiobookFile}
                                  onChange={(e) => setAudiobookFile(e.target.value)}
                                  placeholder="Paste URL or upload" 
                                  className="w-full min-w-0 bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-3 py-2 placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50" 
                                />
                                <div className="relative bg-primary-600/20 text-primary-400 hover:bg-primary-600/30 border border-primary-500/20 px-3 py-2 rounded-xl flex items-center justify-center cursor-pointer text-xs font-bold whitespace-nowrap shrink-0">
                                  Upload File
                                  <input 
                                    type="file" 
                                    accept="audio/*"
                                    onChange={(e) => handleUpload(e, 'audiobook')}
                                    className="absolute inset-0 opacity-0 cursor-pointer" 
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Chapters Area */}
                          <div className="border-t border-white/5 pt-4 space-y-3">
                            <div className="flex justify-between items-center">
                              <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest">Chapters (Chapterwise Upload)</label>
                              <button
                                type="button"
                                onClick={() => setChapters(prev => [...prev, { title: '', fileUrl: '', duration: '' }])}
                                className="text-xs font-bold text-primary-400 hover:text-primary-300 flex items-center gap-1 bg-primary-500/10 px-2.5 py-1 rounded-lg border border-primary-500/20 transition-all"
                              >
                                <Plus size={14} /> Add Chapter
                              </button>
                            </div>

                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                              {chapters.length === 0 ? (
                                <p className="text-slate-600 text-xs italic">No chapters added yet. Click "Add Chapter" above to start uploading chapter-wise files.</p>
                              ) : (
                                chapters.map((ch, index) => (
                                  <div key={index} className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 relative">
                                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ch {index + 1}</span>
                                    </div>
                                    <input 
                                      type="text"
                                      required
                                      placeholder="Chapter Title"
                                      value={ch.title}
                                      onChange={(e) => {
                                        const updated = [...chapters];
                                        updated[index].title = e.target.value;
                                        setChapters(updated);
                                      }}
                                      className="w-full sm:w-1/3 bg-[#0f172a] border border-white/10 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
                                    />
                                    <div className="flex-1 flex gap-2 w-full">
                                      <input 
                                        type="text"
                                        required
                                        placeholder="Audio URL"
                                        value={ch.fileUrl}
                                        onChange={(e) => {
                                          const updated = [...chapters];
                                          updated[index].fileUrl = e.target.value;
                                          setChapters(updated);
                                        }}
                                        className="flex-grow bg-[#0f172a] border border-white/10 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
                                      />
                                      <div className="relative bg-primary-600/20 text-primary-400 hover:bg-primary-600/30 border border-primary-500/20 px-2 py-1.5 rounded-lg flex items-center justify-center cursor-pointer text-xs font-bold whitespace-nowrap">
                                        Upload
                                        <input 
                                          type="file" 
                                          accept="audio/*"
                                          onChange={async (e) => {
                                            const file = e.target.files[0];
                                            if (!file) return;
                                            const formData = new FormData();
                                            formData.append('file', file);
                                            const toastId = toast.loading(`Uploading Chapter ${index + 1} audio...`);
                                            try {
                                              const { data } = await axios.post('/upload/protected', formData, {
                                                headers: { 'Content-Type': 'multipart/form-data' }
                                              });
                                              toast.success('Chapter audio uploaded!', { id: toastId });
                                              const updated = [...chapters];
                                              updated[index].fileUrl = data.url;
                                              setChapters(updated);
                                            } catch (err) {
                                              toast.error('Upload failed', { id: toastId });
                                            }
                                          }}
                                          className="absolute inset-0 opacity-0 cursor-pointer" 
                                        />
                                      </div>
                                    </div>
                                    <button 
                                      type="button" 
                                      onClick={() => setChapters(prev => prev.filter((_, i) => i !== index))}
                                      className="text-red-400 hover:text-red-300 p-1.5 hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 3. Hardcopy */}
                    <div className="p-4 rounded-xl border border-white/10 bg-white/[0.01] space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm font-bold text-white cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={hardcopyAvailable}
                            onChange={(e) => setHardcopyAvailable(e.target.checked)}
                            className="w-4 h-4 rounded border-white/20 bg-white/5 accent-primary-500" 
                          />
                          Physical Hardcopy Available
                        </label>
                      </div>
                      {hardcopyAvailable && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                          <div>
                            <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">Physical Price (₹)</label>
                            <input 
                              type="number" 
                              min="0"
                              value={hardcopyPrice}
                              onChange={(e) => setHardcopyPrice(e.target.value)}
                              placeholder="499" 
                              className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-2" 
                            />
                          </div>
                          <div>
                            <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">Stock Quantity</label>
                            <input 
                              type="number" 
                              min="0"
                              value={hardcopyStock}
                              onChange={(e) => setHardcopyStock(e.target.value)}
                              placeholder="100" 
                              className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-2" 
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-white/10 flex items-center justify-end gap-3 shrink-0 bg-white/[0.02]">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-primary-600 hover:bg-primary-500 transition-colors shadow-lg shadow-primary-600/20 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Book'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminBooks;
