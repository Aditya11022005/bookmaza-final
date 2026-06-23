import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import { AnimatePresence, motion } from 'framer-motion';
import axios from '../api/axios';
import { resolveMediaUrl, getPdfProxyUrl } from '../utils/image';
import useAuthStore from '../store/authStore';
import { 
  Bookmark, 
  ZoomIn, 
  ZoomOut, 
  Moon, 
  Sun, 
  Save, 
  Download, 
  BookOpen, 
  FileText, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Maximize,
  Minimize
} from 'lucide-react';
import { toast } from 'sonner';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const EbookReader = () => {
  const { user } = useAuthStore();
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        (e.ctrlKey && e.key === 'p') || 
        (e.ctrlKey && e.key === 's') || 
        (e.metaKey && e.key === 'p') ||
        (e.metaKey && e.key === 's')
      ) {
        e.preventDefault();
        toast.warning('Printing and saving this document is disabled for copyright protection.');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  // Format urls
  const [pdfUrl, setPdfUrl] = useState('');
  const [epubUrl, setEpubUrl] = useState('');
  const [docxUrl, setDocxUrl] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('pdf'); // 'pdf' | 'epub' | 'docx'

  // PDF state
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [bookMode, setBookMode] = useState(window.innerWidth > 768);
  const [direction, setDirection] = useState(1);
  const [containerWidth, setContainerWidth] = useState(800);

  // Layout / sync state
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [savingSync, setSavingSync] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Gesture refs
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const lastTap = useRef(0);

  // Fullscreen support
  const toggleFullscreen = () => {
    const readerElement = document.getElementById('ebook-reader-root');
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      if (readerElement) {
        if (readerElement.requestFullscreen) {
          readerElement.requestFullscreen().catch(err => console.error(err));
        } else if (readerElement.webkitRequestFullscreen) {
          readerElement.webkitRequestFullscreen();
        }
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => console.error(err));
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        !!document.fullscreenElement || 
        !!document.webkitFullscreenElement
      );
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const updateWidth = () => {
      const el = document.getElementById('pdf-container');
      if (el) {
        const width = el.clientWidth;
        setContainerWidth(width > 0 ? width : Math.min(window.innerWidth - 32, 800));
      } else {
        setContainerWidth(Math.min(window.innerWidth - 32, 800));
      }
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    const timer = setTimeout(updateWidth, 150);
    
    return () => {
      window.removeEventListener('resize', updateWidth);
      clearTimeout(timer);
    };
  }, [selectedFormat, loading, isFullscreen, bookMode]);

  useEffect(() => {
    const fetchBookAndProgress = async () => {
      try {
        const { data: bookData } = await axios.get(`/books/${id}`);
        setBook(bookData);

        const ebook = bookData.formats?.ebook || {};
        
        // Populate specific URLs
        const pUrl = ebook.pdfUrl || (ebook.fileUrl && ebook.fileUrl.endsWith('.pdf') ? ebook.fileUrl : '');
        const eUrl = ebook.epubUrl || (ebook.fileUrl && ebook.fileUrl.endsWith('.epub') ? ebook.fileUrl : '');
        const dUrl = ebook.docxUrl || (ebook.fileUrl && (ebook.fileUrl.endsWith('.docx') || ebook.fileUrl.endsWith('.doc')) ? ebook.fileUrl : '');
        
        setPdfUrl(pUrl ? getPdfProxyUrl(pUrl) : '');
        setEpubUrl(resolveMediaUrl(eUrl));
        setDocxUrl(resolveMediaUrl(dUrl));

        // Determine default active tab format
        if (pUrl) setSelectedFormat('pdf');
        else if (eUrl) setSelectedFormat('epub');
        else if (dUrl) setSelectedFormat('docx');
        else if (ebook.fileUrl) {
          // If a fileUrl was uploaded without format separation, inspect its extension
          const urlStr = ebook.fileUrl.toLowerCase();
          if (urlStr.includes('.epub')) {
            setEpubUrl(resolveMediaUrl(ebook.fileUrl));
            setSelectedFormat('epub');
          } else if (urlStr.includes('.docx') || urlStr.includes('.doc')) {
            setDocxUrl(resolveMediaUrl(ebook.fileUrl));
            setSelectedFormat('docx');
          } else {
            setPdfUrl(getPdfProxyUrl(ebook.fileUrl));
            setSelectedFormat('pdf');
          }
        }

        // Fetch user progress
        const { data: progressData } = await axios.get(`/progress/${id}/ebook`);
        if (progressData && progressData.position > 1) {
          setPageNumber(progressData.position);
        }
        setLoading(false);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load ebook reader.');
        navigate('/library');
      }
    };
    fetchBookAndProgress();
  }, [id, navigate]);

  const saveProgress = useCallback(async (currentPage, totalPages) => {
    setSavingSync(true);
    try {
      await axios.post('/progress', {
        bookId: id,
        format: 'ebook',
        position: currentPage,
        percentage: totalPages ? Math.round((currentPage / totalPages) * 100) : 0
      });
    } catch (err) {
      console.error('Failed to sync progress', err);
    }
    setSavingSync(false);
  }, [id]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const changePage = (offset) => {
    const newPage = pageNumber + offset;
    if (newPage >= 1 && (numPages === null || newPage <= numPages)) {
      setDirection(offset);
      setPageNumber(newPage);
      saveProgress(newPage, numPages);
    }
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (scale <= 1.15) {
      if (diff > 60) {
        changePage(1);
      } else if (diff < -60) {
        changePage(-1);
      }
    }
  };

  const handleDoubleTap = (e) => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    if (now - lastTap.current < DOUBLE_PRESS_DELAY) {
      setScale(s => s > 1.15 ? 1.0 : 1.6);
    }
    lastTap.current = now;
  };

  const flipVariants = {
    initial: (dir) => ({
      rotateY: dir > 0 ? 35 : -35,
      transformOrigin: dir > 0 ? 'left center' : 'right center',
      opacity: 0.8,
      scale: 0.97,
      z: -50
    }),
    animate: {
      rotateY: 0,
      opacity: 1,
      scale: 1,
      z: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut'
      }
    },
    exit: (dir) => ({
      rotateY: dir > 0 ? -35 : 35,
      transformOrigin: dir > 0 ? 'right center' : 'left center',
      opacity: 0.8,
      scale: 0.97,
      z: -50,
      transition: {
        duration: 0.4,
        ease: 'easeIn'
      }
    })
  };

  if (loading) return <div className="text-center py-20 text-xl font-medium animate-pulse text-slate-500 font-poppins">Loading Secure Reader & Syncing Progress...</div>;
  if (!pdfUrl && !epubUrl && !docxUrl) return <div className="text-center py-20 text-red-500 font-poppins font-bold">No digital format files available for this book.</div>;

  return (
    <div 
      id="ebook-reader-root" 
      className={`transition-colors duration-300 flex flex-col items-center ${
        isFullscreen 
          ? `fixed inset-0 z-[9999] w-screen h-screen overflow-y-auto px-2 py-3 ${darkMode ? 'bg-[#0b0f19]' : 'bg-slate-50'}` 
          : `min-h-screen py-4 md:py-8 px-4 w-full ${darkMode ? 'bg-[#0b0f19]' : 'bg-slate-50'}`
      }`}
    >
      {/* Immersive Fullscreen Header (Compact and subtle) */}
      {isFullscreen && book && (
        <div className="flex items-center justify-between w-full max-w-5xl px-4 py-2 mb-2 border-b border-slate-700/20 text-slate-400 text-xs">
          <span className="font-poppins font-bold truncate max-w-[50%]">{book.title}</span>
          <span className="flex items-center gap-1.5 opacity-80">
            <Sparkles size={12} className="text-primary-400 animate-pulse" />
            <span>Double-tap to Zoom • Swipe to Turn</span>
          </span>
        </div>
      )}
      
      {/* Premium Book Metadata Header */}
      {book && !isFullscreen && (
        <div className="text-center mb-6 max-w-2xl px-4">
          <h1 className={`text-2xl md:text-3xl font-black font-poppins tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            {book.title}
          </h1>
          {book.subtitle && (
            <p className={`text-xs md:text-sm font-medium mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {book.subtitle}
            </p>
          )}
          <p className={`text-xs md:text-sm font-bold mt-2 tracking-widest uppercase ${darkMode ? 'text-primary-400' : 'text-primary-600'}`}>
            By {book.authorName}
          </p>
        </div>
      )}

      {/* Top Toolbar */}
      {!isFullscreen && (
        <div className={`p-4 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center gap-4 w-full max-w-5xl justify-between border transition-all backdrop-blur-md ${darkMode ? 'bg-[#111827]/80 text-slate-200 border-white/10 shadow-black/30' : 'bg-white/80 text-slate-800 border-slate-200/80'}`}>
          
          {/* Left Toolbar Part: Return & DarkMode */}
          <div className="flex flex-wrap items-center justify-center gap-3 w-full md:w-auto">
            <button 
              onClick={() => navigate('/library')} 
              className={`p-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-black uppercase tracking-wider transition-all ${darkMode ? 'bg-white/5 border-white/10 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'}`}
            >
              <ChevronLeft size={16} /> <span className="hidden sm:inline">Library</span><span className="sm:hidden">Lib</span>
            </button>
            
            <button 
              onClick={() => setDarkMode(!darkMode)} 
              className={`p-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-black uppercase tracking-wider transition-all ${darkMode ? 'bg-white/5 border-white/10 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'}`}
            >
              {darkMode ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} className="text-indigo-600" />} 
              <span className="hidden sm:inline">{darkMode ? 'Light Theme' : 'Dark Theme'}</span>
              <span className="sm:hidden">{darkMode ? 'Light' : 'Dark'}</span>
            </button>

            {selectedFormat === 'pdf' && (
              <button 
                onClick={() => setBookMode(!bookMode)} 
                className={`p-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-black uppercase tracking-wider transition-all ${bookMode ? 'bg-primary-600/10 border-primary-500/30 text-primary-400' : darkMode ? 'bg-white/5 border-white/10 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'}`}
              >
                <Sparkles size={16} className={bookMode ? 'text-primary-450 animate-pulse' : 'text-slate-400'} />
                <span className="hidden sm:inline">{bookMode ? '📖 3D Book Mode' : '📄 Flat PDF Mode'}</span>
                <span className="sm:hidden">{bookMode ? '📖 3D' : '📄 Flat'}</span>
              </button>
            )}

            <button 
              onClick={toggleFullscreen} 
              className={`p-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-black uppercase tracking-wider transition-all ${darkMode ? 'bg-white/5 border-white/10 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'}`}
            >
              <Maximize size={16} /> 
              <span className="hidden sm:inline">Fullscreen</span>
              <span className="sm:hidden">Full</span>
            </button>
          </div>

          {/* Center Toolbar Part: Format Tabs Selector */}
          <div className="flex bg-slate-500/10 p-1.5 rounded-2xl border border-white/5">
            {pdfUrl && (
              <button 
                onClick={() => setSelectedFormat('pdf')} 
                className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${selectedFormat === 'pdf' ? 'bg-primary-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                PDF View
              </button>
            )}
            {epubUrl && (
              <button 
                onClick={() => setSelectedFormat('epub')} 
                className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${selectedFormat === 'epub' ? 'bg-primary-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                EPUB format
              </button>
            )}
            {docxUrl && (
              <button 
                onClick={() => setSelectedFormat('docx')} 
                className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${selectedFormat === 'docx' ? 'bg-primary-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                Word (DOCX)
              </button>
            )}
          </div>

          {/* Right Toolbar Part: Zoom (PDF only) & Save Indicator */}
          <div className="flex items-center gap-4">
            {selectedFormat === 'pdf' && (
              <div className="flex items-center gap-2 border-r border-slate-600/20 pr-4">
                <button 
                  onClick={() => setScale(s => Math.max(0.6, s - 0.1))} 
                  className={`p-2 rounded transition-colors ${darkMode ? 'hover:bg-white/5' : 'hover:bg-slate-100'}`}
                >
                  <ZoomOut size={16}/>
                </button>
                <span className="font-mono text-xs font-bold">{Math.round(scale * 100)}%</span>
                <button 
                  onClick={() => setScale(s => Math.min(2.0, s + 0.1))} 
                  className={`p-2 rounded transition-colors ${darkMode ? 'hover:bg-white/5' : 'hover:bg-slate-100'}`}
                >
                  <ZoomIn size={16}/>
                </button>
              </div>
            )}

            <div className="text-xs font-black uppercase tracking-wider">
              {savingSync ? (
                <span className="animate-pulse flex items-center gap-1.5 text-primary-500"><Save size={14}/> Syncing</span>
              ) : (
                <span className="flex items-center gap-1.5 text-green-500"><Bookmark size={14}/> Auto Saved</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PDF Controls Pagination Bar (only visible when PDF is selected and NOT in fullscreen) */}
      {selectedFormat === 'pdf' && !isFullscreen && (
        <div className={`mt-4 mb-6 px-5 py-2.5 rounded-full flex items-center gap-5 shadow-lg border transition-all backdrop-blur-md ${darkMode ? 'bg-[#111827]/80 border-white/10 text-white shadow-black/20' : 'bg-white/80 border-slate-200/80 text-slate-855'}`}>
          <button 
            disabled={pageNumber <= 1} 
            onClick={() => changePage(-1)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase disabled:opacity-30 disabled:pointer-events-none transition-all hover:scale-105 active:scale-95 ${darkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            Prev
          </button>
          <span className={`font-mono text-sm font-black ${darkMode ? 'text-white' : 'text-slate-800'}`}>
            Page {pageNumber} of {numPages || '?'}
          </span>
          <button 
            disabled={pageNumber >= numPages}
            onClick={() => changePage(1)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase disabled:opacity-30 disabled:pointer-events-none transition-all hover:scale-105 active:scale-95 ${darkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            Next
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div 
        id="pdf-container" 
        className="w-full max-w-5xl mt-4 flex justify-center relative group overflow-x-auto scrollbar-thin py-2 px-1"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleDoubleTap}
      >
        
        {/* Floating Page Flip Arrows (Desktop only) */}
        {selectedFormat === 'pdf' && (
          <>
            <button 
              disabled={pageNumber <= 1}
              onClick={() => changePage(-1)}
              className={`absolute left-[-60px] top-1/2 -translate-y-1/2 z-40 p-4 rounded-full border shadow-2xl transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 disabled:opacity-0 disabled:pointer-events-none hidden lg:flex items-center justify-center backdrop-blur-md ${darkMode ? 'bg-slate-900/80 hover:bg-slate-800 border-white/10 text-white' : 'bg-white/80 hover:bg-white border-slate-200 text-slate-800'}`}
            >
              <ChevronLeft size={24} />
            </button>
            
            <button 
              disabled={pageNumber >= numPages}
              onClick={() => changePage(1)}
              className={`absolute right-[-60px] top-1/2 -translate-y-1/2 z-40 p-4 rounded-full border shadow-2xl transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 disabled:opacity-0 disabled:pointer-events-none hidden lg:flex items-center justify-center backdrop-blur-md ${darkMode ? 'bg-slate-900/80 hover:bg-slate-800 border-white/10 text-white' : 'bg-white/80 hover:bg-white border-slate-200 text-slate-800'}`}
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Render PDF Format */}
        {selectedFormat === 'pdf' && (
          <div 
            className={`shadow-2xl overflow-hidden relative transition-all duration-500 ${
              bookMode 
                ? 'rounded-r-2xl border-y border-r border-slate-400/40 bg-white shadow-[4px_4px_0px_#94a3b8,8px_8px_0px_#cbd5e1,12px_12px_0px_#e2e8f0]' 
                : 'rounded-2xl border border-slate-300/30'
            }`}
            style={{ 
              filter: darkMode ? 'invert(0.9) hue-rotate(180deg) contrast(1.15)' : 'none', 
              backgroundColor: darkMode ? '#ffffff' : 'transparent',
              perspective: bookMode ? 1500 : 'none',
              transformStyle: bookMode ? 'preserve-3d' : 'flat',
            }}
            onContextMenu={e => e.preventDefault()}
          >
            {/* Paper stack background page-edges effect on desktop */}
            {bookMode && (
              <>
                <div className="absolute right-[-4px] top-[4px] bottom-[4px] w-[4px] bg-slate-300 dark:bg-slate-800 rounded-r border-y border-r border-slate-400/20 z-0 pointer-events-none hidden md:block" />
                <div className="absolute right-[-8px] top-[8px] bottom-[8px] w-[4px] bg-slate-200 dark:bg-slate-900 rounded-r border-y border-r border-slate-400/10 z-0 pointer-events-none hidden md:block" />
              </>
            )}
            {/* Dynamic Watermark Overlay to prevent piracy/screenshots */}
            <div className="absolute inset-0 pointer-events-none select-none z-30 flex flex-wrap gap-x-16 gap-y-24 items-center justify-center p-12 overflow-hidden opacity-[0.06] dark:opacity-[0.03]">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="text-slate-800 text-sm font-black tracking-widest uppercase rotate-[-30deg] whitespace-nowrap">
                  {user?.name || 'Reader'} ({user?.email || 'Pustak Maza'})
                </div>
              ))}
            </div>

            {/* Crease shadow to make it look like open book spine */}
            {bookMode && (
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/25 via-black/5 to-transparent z-25 pointer-events-none" />
            )}

            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<div className="p-20 font-bold font-poppins animate-pulse text-slate-500">Decrypting & rendering PDF canvas...</div>}
            >
              <AnimatePresence initial={false} mode="wait" custom={direction}>
                <motion.div
                  key={pageNumber}
                  custom={direction}
                  variants={bookMode ? flipVariants : {}}
                  initial={bookMode ? "initial" : false}
                  animate={bookMode ? "animate" : false}
                  exit={bookMode ? "exit" : false}
                  className="relative z-10"
                >
                  <Page 
                    pageNumber={pageNumber} 
                    width={containerWidth}
                    scale={scale} 
                    renderTextLayer={false} 
                    renderAnnotationLayer={false} 
                    devicePixelRatio={Math.min(3, window.devicePixelRatio || 1)}
                  />
                </motion.div>
              </AnimatePresence>
            </Document>
          </div>
        )}

        {/* Render EPUB Format Card */}
        {selectedFormat === 'epub' && (
          <div className={`w-full max-w-2xl p-8 md:p-12 rounded-[2.5rem] border text-center shadow-2xl backdrop-blur-md relative overflow-hidden ${darkMode ? 'bg-[#0d1526]/90 border-white/[0.06]' : 'bg-white border-slate-200'}`}>
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary-500/10 rounded-full blur-[60px]" />
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 rounded-3xl bg-primary-600/10 text-primary-400 flex items-center justify-center mb-6 border border-primary-500/20 shadow-inner">
                <BookOpen size={36} className="text-primary-500" />
              </div>

              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-400 bg-primary-500/10 px-3.5 py-1.5 rounded-full border border-primary-500/25 mb-4">Reflowable EPUB File</span>
              <h3 className={`text-2xl md:text-3xl font-black font-poppins mb-3 ${darkMode ? 'text-white' : 'text-slate-800'}`}>Ready for your E-Reader</h3>
              
              <p className={`text-sm font-medium max-w-md mx-auto leading-relaxed mb-8 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                EPUB is the industry-standard layout for reflowable text. Download this file to read on Kindle, Apple Books, Kobo, or your favorite mobile reading app with customizable fonts and text sizing.
              </p>

              {/* Massive Premium Download Button */}
              <a 
                href={epubUrl}
                download
                onClick={() => toast.success("Download started!")}
                className="inline-flex items-center gap-3 bg-primary-600 hover:bg-primary-500 text-white font-black text-base px-10 py-5 rounded-2xl shadow-xl shadow-primary-600/20 transition-all transform hover:-translate-y-0.5 active:scale-95"
              >
                <Download size={20} /> Download EPUB format
              </a>

              <div className={`mt-8 pt-8 border-t w-full text-xs font-bold ${darkMode ? 'border-white/5 text-slate-500' : 'border-slate-100 text-slate-400'}`}>
                Digital Rights Reserved. © Pustak Maza Publisher Network.
              </div>
            </div>
          </div>
        )}

        {/* Render DOCX Format with Web Office Viewer */}
        {selectedFormat === 'docx' && (
          <div className="w-full flex flex-col items-center gap-6">
            
            {/* Quick Download Banner */}
            <div className={`w-full p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${darkMode ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><FileText size={20}/></div>
                <span className={`text-sm font-bold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>Microsoft Word format (DOCX) is available</span>
              </div>
              <a 
                href={docxUrl}
                download
                className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Download size={14}/> Download DOCX
              </a>
            </div>

            {/* Embedded IFrame Viewer */}
            <div className="w-full bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-350/20 relative group">
              <iframe 
                src={`https://docs.google.com/viewer?url=${encodeURIComponent(docxUrl)}&embedded=true`} 
                className="w-full h-[75vh] border-none"
                title="DOCX Reader"
              />
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#0f172a]/90 backdrop-blur-md text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg border border-white/15 opacity-0 group-hover:opacity-100 transition-opacity">
                Office Document Preview Enabled
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Bottom spacer to prevent content from being cut off by the floating toolbar */}
      {isFullscreen && <div className="h-28 w-full shrink-0" />}

      {/* Floating Bottom Control Bar for Fullscreen Mode */}
      {isFullscreen && selectedFormat === 'pdf' && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[10000] w-[92%] max-w-lg p-4 rounded-3xl shadow-2xl flex flex-col gap-3 border transition-all backdrop-blur-md ${darkMode ? 'bg-[#111827]/90 text-slate-200 border-white/10 shadow-black/40' : 'bg-white/90 text-slate-800 border-slate-200/80 shadow-slate-300/40'}`}>
          {/* Top Row: Page Scrubber slider */}
          <div className="flex items-center gap-3 w-full px-1">
            <span className="text-[10px] font-mono font-bold select-none opacity-60">1</span>
            <input 
              type="range" 
              min="1" 
              max={numPages || 1} 
              value={pageNumber} 
              onChange={(e) => {
                const newPg = parseInt(e.target.value);
                setPageNumber(newPg);
                saveProgress(newPg, numPages);
              }}
              className="w-full accent-primary-500 cursor-pointer h-1.5 rounded-lg bg-slate-300/40 dark:bg-slate-700/40" 
            />
            <span className="text-[10px] font-mono font-bold select-none opacity-60">{numPages || 1}</span>
          </div>

          {/* Bottom Row: Actions */}
          <div className="flex items-center justify-between w-full">
            {/* Page navigation */}
            <div className="flex items-center gap-1.5">
              <button 
                disabled={pageNumber <= 1} 
                onClick={() => changePage(-1)}
                className={`p-2 rounded-xl border transition-all ${darkMode ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white disabled:opacity-30' : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700 disabled:opacity-30'}`}
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-[11px] font-black font-mono tracking-tight px-1 select-none">
                {pageNumber} / {numPages || '?'}
              </span>
              <button 
                disabled={pageNumber >= numPages} 
                onClick={() => changePage(1)}
                className={`p-2 rounded-xl border transition-all ${darkMode ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white disabled:opacity-30' : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700 disabled:opacity-30'}`}
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setScale(s => Math.max(0.6, s - 0.1))} 
                className={`p-2 rounded-xl border transition-all ${darkMode ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-750'}`}
              >
                <ZoomOut size={16} />
              </button>
              <span className="text-[10px] font-mono font-bold min-w-[32px] text-center select-none">{Math.round(scale * 100)}%</span>
              <button 
                onClick={() => setScale(s => Math.min(2.0, s + 0.1))} 
                className={`p-2 rounded-xl border transition-all ${darkMode ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-750'}`}
              >
                <ZoomIn size={16} />
              </button>
            </div>

            {/* Actions: Theme Toggle, Book Mode, Fullscreen Exit */}
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setDarkMode(!darkMode)} 
                className={`p-2 rounded-xl border transition-all ${darkMode ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'}`}
                title="Toggle Theme"
              >
                {darkMode ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} className="text-indigo-600" />}
              </button>
              <button 
                onClick={() => setBookMode(!bookMode)} 
                className={`p-2 rounded-xl border transition-all ${bookMode ? 'bg-primary-600/10 border-primary-500/30 text-primary-400' : darkMode ? 'bg-white/5 border-white/10 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'}`}
                title="Toggle Book Layout"
              >
                <Sparkles size={16} className={bookMode ? 'text-primary-450' : 'text-slate-400'} />
              </button>
              <button 
                onClick={toggleFullscreen}
                className="p-2 rounded-xl border bg-primary-600 border-primary-500 text-white hover:bg-primary-500 transition-all shadow-md shadow-primary-600/20"
                title="Exit Fullscreen"
              >
                <Minimize size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default EbookReader;
