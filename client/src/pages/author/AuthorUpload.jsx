import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, BookOpen, FileText, CheckCircle, Save, Loader, AlertTriangle, Sparkles, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axios from '../../api/axios';

const AuthorUpload = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // File states for uploads
  const [coverUploading, setCoverUploading] = useState(false);
  const [manuscriptUploading, setManuscriptUploading] = useState(false);
  const [audioUploading, setAudioUploading] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [language, setLanguage] = useState('Marathi');
  const [pages, setPages] = useState('');
  const [coverImage, setCoverImage] = useState('');
  
  // Format check state
  const [formatEbook, setFormatEbook] = useState(false);
  const [formatAudio, setFormatAudio] = useState(false);
  const [formatHardcover, setFormatHardcover] = useState(false);

  // Format details
  const [ebookPrice, setEbookPrice] = useState('');
  const [ebookFile, setEbookFile] = useState('');
  
  const [audioPrice, setAudioPrice] = useState('');
  const [audioFile, setAudioFile] = useState('');

  const [hardcopyPrice, setHardcopyPrice] = useState('');
  const [hardcopyStock, setHardcopyStock] = useState('100');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get('/categories');
        setCategories(data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load categories');
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const payload = new FormData();
    payload.append('image', file);

    setCoverUploading(true);
    try {
      const { data } = await axios.post('/upload/image', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setCoverImage(data.url);
      toast.success('Cover image uploaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Cover image upload failed');
    } finally {
      setCoverUploading(false);
    }
  };

  const handleManuscriptUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const payload = new FormData();
    payload.append('file', file);

    setManuscriptUploading(true);
    try {
      const { data } = await axios.post('/upload/protected', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setEbookFile(data.url);
      toast.success('Manuscript uploaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Manuscript upload failed');
    } finally {
      setManuscriptUploading(false);
    }
  };

  const handleAudioUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const payload = new FormData();
    payload.append('file', file);

    setAudioUploading(true);
    try {
      const { data } = await axios.post('/upload/protected', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAudioFile(data.url);
      toast.success('Audiobook file uploaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Audiobook upload failed');
    } finally {
      setAudioUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!coverImage) {
      return toast.error('Please upload a cover image');
    }

    if (!formatEbook && !formatAudio && !formatHardcover) {
      return toast.error('Please select at least one media format');
    }

    if (formatEbook && (!ebookPrice || !ebookFile)) {
      return toast.error('Please specify price and upload manuscript for eBook');
    }

    if (formatAudio && (!audioPrice || !audioFile)) {
      return toast.error('Please specify price and upload audio file for Audiobook');
    }

    if (formatHardcover && !hardcopyPrice) {
      return toast.error('Please specify price for physical hardcover');
    }

    setIsSubmitting(true);

    const payload = {
      title,
      description,
      category,
      coverImage,
      language,
      pages: pages ? Number(pages) : undefined,
      formats: {
        ebook: {
          isAvailable: formatEbook,
          price: formatEbook ? Number(ebookPrice) : 0,
          fileUrl: formatEbook ? ebookFile : ''
        },
        audiobook: {
          isAvailable: formatAudio,
          price: formatAudio ? Number(audioPrice) : 0,
          fileUrl: formatAudio ? audioFile : ''
        },
        hardcopy: {
          isAvailable: formatHardcover,
          price: formatHardcover ? Number(hardcopyPrice) : 0,
          stock: formatHardcover ? Number(hardcopyStock) : 0
        }
      }
    };

    try {
      await axios.post('/books', payload);
      toast.success('Book submitted successfully and is pending admin approval.');
      navigate('/author/books');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to submit book');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-poppins font-black text-white tracking-tight">Upload New Book</h1>
        <p className="text-slate-500 text-sm font-medium mt-0.5">Submit your manuscript or audio files for publishing</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Cover Image Upload */}
        <div className="bg-[#0d1526] border border-white/[0.06] rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Upload size={18} className="text-amber-500"/> Cover Image
          </h2>
          
          <div className="flex flex-col md:flex-row gap-6 items-center">
            {coverImage ? (
              <div className="w-32 h-44 rounded-xl overflow-hidden border border-white/10 shrink-0 relative group shadow-lg">
                <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                  <span className="text-white text-xs font-bold">Replace Cover</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                </label>
              </div>
            ) : (
              <label className="w-full border-2 border-dashed border-white/10 hover:border-amber-500/50 transition-colors rounded-xl h-44 flex flex-col items-center justify-center bg-white/[0.01] cursor-pointer group flex-1">
                {coverUploading ? (
                  <Loader className="animate-spin text-amber-500" size={28} />
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <ImageIcon size={20} />
                    </div>
                    <p className="text-white font-bold text-sm">Upload cover image</p>
                    <p className="text-slate-500 text-xs mt-1">JPEG or PNG (1200x1800 recommended)</p>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={coverUploading} />
              </label>
            )}
            
            <div className="flex-1 space-y-2 text-center md:text-left">
              <span className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1.5 justify-center md:justify-start">
                <Sparkles size={14} /> Premium Cover Design Tip
              </span>
              <p className="text-slate-400 text-sm leading-relaxed">
                A great book cover is the first thing a reader sees. Keep key text away from borders and choose striking colors that pop in dark mode.
              </p>
            </div>
          </div>
        </div>

        {/* Basic Details */}
        <div className="bg-[#0d1526] border border-white/[0.06] rounded-2xl p-6 space-y-5">
          <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <BookOpen size={18} className="text-amber-500"/> Basic Details
          </h2>
          
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Book Title</label>
            <input 
              type="text" 
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your book's title" 
              className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500/50 transition-colors" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Category</label>
              {loadingCategories ? (
                <div className="w-full bg-[#0f172a] border border-white/10 text-slate-500 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
                  <Loader className="animate-spin" size={14} /> Loading...
                </div>
              ) : (
                <select 
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500/50 transition-colors appearance-none cursor-pointer"
                >
                  <option value="">Select Category...</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Language</label>
              <input 
                type="text" 
                required
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="e.g. Marathi, English" 
                className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500/50 transition-colors" 
              />
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Pages (Optional)</label>
              <input 
                type="number" 
                value={pages}
                onChange={(e) => setPages(e.target.value)}
                placeholder="e.g. 240" 
                className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500/50 transition-colors" 
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Synopsis / Description</label>
            <textarea 
              rows="5" 
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this book about?" 
              className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500/50 transition-colors resize-none"
            ></textarea>
          </div>
        </div>

        {/* Media Formats */}
        <div className="bg-[#0d1526] border border-white/[0.06] rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FileText size={18} className="text-amber-500"/> Media Formats
          </h2>
          <p className="text-sm text-slate-400 mb-6">Select which formats you are providing files for. At least one digital format is required for instant publishing.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className={`cursor-pointer border ${formatEbook ? 'border-amber-500 bg-amber-500/10' : 'border-white/10 bg-white/[0.02]'} rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all`}>
              <input type="checkbox" className="sr-only" checked={formatEbook} onChange={(e) => setFormatEbook(e.target.checked)} />
              <CheckCircle size={24} className={formatEbook ? 'text-amber-500' : 'text-slate-600'} />
              <span className="text-white font-bold text-sm">E-Book (PDF/EPUB)</span>
            </label>
            <label className={`cursor-pointer border ${formatAudio ? 'border-amber-500 bg-amber-500/10' : 'border-white/10 bg-white/[0.02]'} rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all`}>
              <input type="checkbox" className="sr-only" checked={formatAudio} onChange={(e) => setFormatAudio(e.target.checked)} />
              <CheckCircle size={24} className={formatAudio ? 'text-amber-500' : 'text-slate-600'} />
              <span className="text-white font-bold text-sm">Audiobook (MP3)</span>
            </label>
            <label className={`cursor-pointer border ${formatHardcover ? 'border-amber-500 bg-amber-500/10' : 'border-white/10 bg-white/[0.02]'} rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all`}>
              <input type="checkbox" className="sr-only" checked={formatHardcover} onChange={(e) => setFormatHardcover(e.target.checked)} />
              <CheckCircle size={24} className={formatHardcover ? 'text-amber-500' : 'text-slate-600'} />
              <span className="text-white font-bold text-sm">Physical Print</span>
            </label>
          </div>

          {/* Details for E-Book */}
          {formatEbook && (
            <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
              <h3 className="text-white font-bold text-sm">E-Book Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">eBook Price (₹)</label>
                  <input 
                    type="number" 
                    required={formatEbook}
                    value={ebookPrice}
                    onChange={(e) => setEbookPrice(e.target.value)}
                    placeholder="e.g. 199" 
                    className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500/50" 
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Manuscript File (PDF/EPUB)</label>
                  <div className="relative">
                    {ebookFile ? (
                      <div className="w-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm rounded-xl px-4 py-3 flex items-center justify-between">
                        <span className="truncate max-w-[200px]">Uploaded Manuscript File</span>
                        <label className="text-xs font-bold text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded-lg cursor-pointer">
                          Change File
                          <input type="file" accept=".pdf,.epub" className="hidden" onChange={handleManuscriptUpload} />
                        </label>
                      </div>
                    ) : (
                      <label className="w-full bg-[#0f172a] border border-white/10 text-slate-400 text-sm rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer hover:border-amber-500/30">
                        <span>{manuscriptUploading ? 'Uploading...' : 'Choose Manuscript File'}</span>
                        <Upload size={16} className="text-slate-500" />
                        <input type="file" accept=".pdf,.epub" className="hidden" onChange={handleManuscriptUpload} disabled={manuscriptUploading} />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Details for Audiobook */}
          {formatAudio && (
            <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
              <h3 className="text-white font-bold text-sm">Audiobook Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Audiobook Price (₹)</label>
                  <input 
                    type="number" 
                    required={formatAudio}
                    value={audioPrice}
                    onChange={(e) => setAudioPrice(e.target.value)}
                    placeholder="e.g. 299" 
                    className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500/50" 
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Audiobook Source (MP3/ZIP)</label>
                  <div className="relative">
                    {audioFile ? (
                      <div className="w-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm rounded-xl px-4 py-3 flex items-center justify-between">
                        <span className="truncate max-w-[200px]">Uploaded Audio File</span>
                        <label className="text-xs font-bold text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded-lg cursor-pointer">
                          Change File
                          <input type="file" accept=".zip,.mp3" className="hidden" onChange={handleAudioUpload} />
                        </label>
                      </div>
                    ) : (
                      <label className="w-full bg-[#0f172a] border border-white/10 text-slate-400 text-sm rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer hover:border-amber-500/30">
                        <span>{audioUploading ? 'Uploading...' : 'Choose MP3/ZIP File'}</span>
                        <Upload size={16} className="text-slate-500" />
                        <input type="file" accept=".zip,.mp3" className="hidden" onChange={handleAudioUpload} disabled={audioUploading} />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Details for Hardcover */}
          {formatHardcover && (
            <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
              <h3 className="text-white font-bold text-sm">Physical Print Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Print Retail Price (₹)</label>
                  <input 
                    type="number" 
                    required={formatHardcover}
                    value={hardcopyPrice}
                    onChange={(e) => setHardcopyPrice(e.target.value)}
                    placeholder="e.g. 399" 
                    className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500/50" 
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Print Stock Count</label>
                  <input 
                    type="number" 
                    required={formatHardcover}
                    value={hardcopyStock}
                    onChange={(e) => setHardcopyStock(e.target.value)}
                    placeholder="100" 
                    className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500/50" 
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button 
            type="button" 
            onClick={() => navigate('/author/books')} 
            className="px-6 py-3 rounded-xl text-sm font-bold text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          
          <button 
            type="submit" 
            disabled={isSubmitting || coverUploading || manuscriptUploading || audioUploading}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-amber-600/20 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
            {isSubmitting ? 'Publishing...' : 'Submit for Approval'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AuthorUpload;
