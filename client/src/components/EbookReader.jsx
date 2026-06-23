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
  Minimize,
  Search,
  Trash2,
  Plus,
  X,
  PanelRight
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

  // Advanced Features State
  const [bookmarks, setBookmarks] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [bookTextContent, setBookTextContent] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState('bookmarks'); // 'bookmarks' | 'search' | 'notes'
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectionMenuVisible, setSelectionMenuVisible] = useState(false);
  const [selectionMenuCoords, setSelectionMenuCoords] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState('');

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
        if (progressData) {
          if (progressData.position > 1) {
            setPageNumber(progressData.position);
          }
          if (progressData.bookmarks) {
            setBookmarks(progressData.bookmarks);
          }
          if (progressData.highlights) {
            setHighlights(progressData.highlights);
          }
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

  const saveProgress = useCallback(async (currentPage, totalPages, updatedBookmarks, updatedHighlights) => {
    setSavingSync(true);
    try {
      await axios.post('/progress', {
        bookId: id,
        format: 'ebook',
        position: currentPage,
        percentage: totalPages ? Math.round((currentPage / totalPages) * 100) : 0,
        bookmarks: updatedBookmarks !== undefined ? updatedBookmarks : bookmarks,
        highlights: updatedHighlights !== undefined ? updatedHighlights : highlights
      });
    } catch (err) {
      console.error('Failed to sync progress', err);
    }
    setSavingSync(false);
  }, [id, bookmarks, highlights]);

  const onDocumentLoadSuccess = async (pdf) => {
    setNumPages(pdf.numPages);
    
    // Background text extraction for global search
    try {
      const extractedText = {};
      for (let i = 1; i <= pdf.numPages; i++) {
        // Yield to main thread every 5 pages to keep UI responsive
        if (i % 5 === 0) {
          await new Promise(resolve => setTimeout(resolve, 30));
        }
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const textItems = textContent.items.map(item => item.str).join(' ');
        extractedText[i] = textItems;
      }
      setBookTextContent(extractedText);
    } catch (err) {
      console.error('Failed to extract text for search', err);
    }
  };
  const applyPageHighlightsAndSearch = useCallback(() => {
    // Wait a brief moment for the DOM to be fully updated
    setTimeout(() => {
      const textLayer = document.querySelector(`.react-pdf__Page[data-page-number="${pageNumber}"] .react-pdf__Page__textContent`);
      if (!textLayer) return;

      const spans = textLayer.querySelectorAll('span');
      
      // Clear any previous custom highlight markers we added
      spans.forEach(span => {
        if (span.dataset.originalText) {
          span.innerHTML = span.dataset.originalText;
        } else {
          span.dataset.originalText = span.innerHTML;
        }
      });

      // Get page highlights and search query
      const pageHighlights = highlights.filter(h => h.page === pageNumber);
      const activeSearch = searchQuery.trim().toLowerCase();

      spans.forEach(span => {
        let html = span.innerHTML;
        let modified = false;

        // Apply page highlights
        pageHighlights.forEach(h => {
          const textToHighlight = h.text;
          const escapedText = textToHighlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
          const regex = new RegExp(`(${escapedText})`, 'gi');
          
          if (regex.test(html)) {
            let colorClass = 'bg-yellow-250/50 dark:bg-yellow-500/30 text-inherit';
            if (h.color === 'green') colorClass = 'bg-green-200/50 dark:bg-green-500/30 text-inherit';
            if (h.color === 'blue') colorClass = 'bg-blue-200/50 dark:bg-blue-500/30 text-inherit';

            html = html.replace(regex, `<mark class="${colorClass} rounded px-0.5 cursor-pointer hover:opacity-85" data-highlight-id="${new Date(h.createdAt).getTime()}">${textToHighlight}</mark>`);
            modified = true;
          }
        });

        // Apply active search query highlighting
        if (activeSearch && activeSearch.length >= 2) {
          const escapedSearch = activeSearch.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
          const regex = new RegExp(`(${escapedSearch})`, 'gi');
          if (regex.test(html)) {
            html = html.replace(regex, `<mark class="bg-orange-300/60 dark:bg-orange-500/40 text-inherit rounded px-0.5 font-bold shadow-sm">$1</mark>`);
            modified = true;
          }
        }

        if (modified) {
          span.innerHTML = html;
        }
      });
    }, 100);
  }, [pageNumber, highlights, searchQuery]);

  // Run highlight applicator on pageNumber or highlights/searchQuery changes
  useEffect(() => {
    applyPageHighlightsAndSearch();
  }, [pageNumber, highlights, searchQuery, applyPageHighlightsAndSearch]);

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setSelectionMenuVisible(false);
      return;
    }
    
    const text = selection.toString().trim();
    if (text.length < 2) {
      setSelectionMenuVisible(false);
      return;
    }
    
    const container = document.getElementById('pdf-container');
    if (container && container.contains(selection.anchorNode)) {
      setSelectedText(text);
      
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      setSelectionMenuCoords({
        x: rect.left + rect.width / 2,
        y: rect.top - 55
      });
      setSelectionMenuVisible(true);
    } else {
      setSelectionMenuVisible(false);
    }
  }, []);

  useEffect(() => {
    const handleDocumentSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setSelectionMenuVisible(false);
      }
    };
    document.addEventListener('selectionchange', handleDocumentSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleDocumentSelectionChange);
    };
  }, []);

  const addHighlight = async (color) => {
    if (!selectedText) return;
    
    const newHighlight = {
      page: pageNumber,
      text: selectedText,
      color,
      note: '',
      createdAt: new Date()
    };
    
    const updated = [...highlights, newHighlight];
    setHighlights(updated);
    setSelectionMenuVisible(false);
    window.getSelection()?.removeAllRanges();
    
    await saveProgress(pageNumber, numPages, bookmarks, updated);
    toast.success('Text highlighted!');
  };

  const addHighlightWithNote = async () => {
    if (!selectedText) return;
    
    const noteText = prompt('Enter a note for this highlight:');
    if (noteText === null) return;
    
    const newHighlight = {
      page: pageNumber,
      text: selectedText,
      color: 'yellow',
      note: noteText,
      createdAt: new Date()
    };
    
    const updated = [...highlights, newHighlight];
    setHighlights(updated);
    setSelectionMenuVisible(false);
    window.getSelection()?.removeAllRanges();
    
    await saveProgress(pageNumber, numPages, bookmarks, updated);
    toast.success('Note added!');
  };

  const deleteHighlight = async (highlightToDelete) => {
    const updated = highlights.filter(h => h !== highlightToDelete);
    setHighlights(updated);
    await saveProgress(pageNumber, numPages, bookmarks, updated);
    toast.success('Highlight removed');
  };

  const handleHighlightClick = (e) => {
    const mark = e.target.closest('mark[data-highlight-id]');
    if (!mark) {
      handleDoubleTap(e);
      return;
    }
    
    const highlightId = mark.dataset.highlightId;
    const highlight = highlights.find(h => new Date(h.createdAt).getTime().toString() === highlightId);
    if (!highlight) return;
    
    if (highlight.note) {
      toast(highlight.note, {
        description: `Highlight Note (Page ${highlight.page})`,
        action: {
          label: 'Delete',
          onClick: () => deleteHighlight(highlight)
        }
      });
    } else {
      toast('Highlight Options', {
        description: `Text: "${highlight.text.slice(0, 30)}..."`,
        action: {
          label: 'Delete Highlight',
          onClick: () => deleteHighlight(highlight)
        }
      });
    }
  };

  const toggleBookmark = async () => {
    const isBookmarked = bookmarks.some(b => b.page === pageNumber);
    let updated;
    if (isBookmarked) {
      updated = bookmarks.filter(b => b.page !== pageNumber);
      setBookmarks(updated);
      toast.success('Bookmark removed');
    } else {
      const label = prompt('Enter a label for this bookmark (optional):') || `Page ${pageNumber}`;
      if (label === null) return;
      updated = [...bookmarks, { page: pageNumber, label, createdAt: new Date() }];
      setBookmarks(updated);
      toast.success('Bookmark added');
    }
    await saveProgress(pageNumber, numPages, updated, highlights);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    
    const results = [];
    const lowerQuery = query.toLowerCase();
    
    Object.entries(bookTextContent).forEach(([pageStr, text]) => {
      const pageNum = parseInt(pageStr);
      const lowerText = text.toLowerCase();
      
      if (lowerText.includes(lowerQuery)) {
        const index = lowerText.indexOf(lowerQuery);
        const start = Math.max(0, index - 40);
        const end = Math.min(text.length, index + lowerQuery.length + 60);
        let snippet = text.slice(start, end);
        if (start > 0) snippet = '...' + snippet;
        if (end < text.length) snippet = snippet + '...';
        
        results.push({
          page: pageNum,
          snippet
        });
      }
    });
    
    setSearchResults(results);
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
          ? `fixed inset-0 z-[9999] w-screen h-screen overflow-y-auto px-0 py-1 ${darkMode ? 'bg-[#0b0f19]' : 'bg-slate-50'}` 
          : `min-h-screen py-4 md:py-8 px-0 md:px-4 w-full ${darkMode ? 'bg-[#0b0f19]' : 'bg-slate-50'}`
      }`}
    >
      {/* Immersive Fullscreen Header (Compact and subtle) */}
      {isFullscreen && book && (
        <div className="flex items-center justify-between w-full max-w-5xl px-4 py-2 mb-2 border-b border-slate-700/20 text-slate-400 text-xs">
          <span className="font-poppins font-bold truncate max-w-[50%]">{book.title}</span>
          <span className="flex items-center gap-1.5 opacity-80">
            <Sparkles size={12} className="text-primary-400 animate-pulse" />
            <span className="hidden sm:inline">Double-tap to Zoom • Swipe to Turn</span>
            <span className="sm:hidden">Gestures Active</span>
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

            {selectedFormat === 'pdf' && (
              <>
                <button 
                  onClick={toggleBookmark} 
                  className={`p-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-black uppercase tracking-wider transition-all ${
                    bookmarks.some(b => b.page === pageNumber)
                      ? 'bg-yellow-600/15 border-yellow-500/30 text-yellow-500 hover:bg-yellow-600/20' 
                      : darkMode ? 'bg-white/5 border-white/10 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                  }`}
                  title="Bookmark current page"
                >
                  <Bookmark size={16} className={bookmarks.some(b => b.page === pageNumber) ? 'fill-yellow-500 text-yellow-500' : ''} />
                  <span className="hidden sm:inline">Bookmark</span>
                </button>

                <button 
                  onClick={() => setSidebarOpen(!sidebarOpen)} 
                  className={`p-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-black uppercase tracking-wider transition-all ${
                    sidebarOpen
                      ? 'bg-primary-600 border-primary-500 text-white' 
                      : darkMode ? 'bg-white/5 border-white/10 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                  }`}
                  title="Open Notes, Bookmarks & Search"
                >
                  <PanelRight size={16} />
                  <span className="hidden sm:inline">Shelf</span>
                </button>
              </>
            )}
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
        className="w-full max-w-5xl mt-2 md:mt-4 flex justify-center relative group overflow-x-auto scrollbar-thin py-1 md:py-2 px-0 md:px-1"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={(e) => {
          handleTouchEnd(e);
          handleTextSelection(e);
        }}
        onMouseUp={handleTextSelection}
        onClick={handleHighlightClick}
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
            className={`overflow-hidden relative transition-all duration-500 w-full md:w-auto shadow-none md:shadow-2xl ${
              bookMode 
                ? 'rounded-none border-none md:rounded-r-2xl md:border-y md:border-r md:border-slate-400/40 bg-white shadow-none md:shadow-[4px_4px_0px_#94a3b8,8px_8px_0px_#cbd5e1,12px_12px_0px_#e2e8f0]' 
                : 'rounded-none border-none md:rounded-2xl md:border md:border-slate-300/30'
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
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/25 via-black/5 to-transparent z-25 pointer-events-none hidden md:block" />
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
                    renderTextLayer={true} 
                    renderAnnotationLayer={false} 
                    devicePixelRatio={Math.min(3, window.devicePixelRatio || 1)}
                    onRenderSuccess={applyPageHighlightsAndSearch}
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
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 w-full">
            
            {/* Page navigation */}
            <div className="flex items-center justify-between md:justify-start gap-2 w-full md:w-auto">
              <span className="text-[10px] uppercase font-black tracking-wider opacity-50 md:hidden">Navigate</span>
              <div className="flex items-center gap-1.5">
                <button 
                  disabled={pageNumber <= 1} 
                  onClick={() => changePage(-1)}
                  className={`p-2 rounded-xl border transition-all ${darkMode ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white disabled:opacity-30' : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700 disabled:opacity-30'}`}
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-[11px] font-black font-mono tracking-tight px-2 min-w-[54px] text-center select-none">
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
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center justify-between md:justify-start gap-2 w-full md:w-auto">
              <span className="text-[10px] uppercase font-black tracking-wider opacity-50 md:hidden">Zoom</span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setScale(s => Math.max(0.6, s - 0.1))} 
                  className={`p-2 rounded-xl border transition-all ${darkMode ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-755'}`}
                >
                  <ZoomOut size={16} />
                </button>
                <span className="text-[10px] font-mono font-bold min-w-[36px] text-center select-none">{Math.round(scale * 100)}%</span>
                <button 
                  onClick={() => setScale(s => Math.min(2.0, s + 0.1))} 
                  className={`p-2 rounded-xl border transition-all ${darkMode ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-755'}`}
                >
                  <ZoomIn size={16} />
                </button>
              </div>
            </div>

            {/* Actions: Bookmark, Shelf, Theme Toggle, Book Mode, Fullscreen Exit */}
            <div className="flex items-center justify-between md:justify-end gap-1.5 w-full md:w-auto border-t border-slate-500/10 pt-3 md:pt-0 md:border-none">
              <span className="text-[10px] uppercase font-black tracking-wider opacity-50 md:hidden">Tools</span>
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={toggleBookmark}
                  className={`p-2 rounded-xl border transition-all ${
                    bookmarks.some(b => b.page === pageNumber)
                      ? 'bg-yellow-600/15 border-yellow-500/30 text-yellow-500 hover:bg-yellow-600/20' 
                      : darkMode ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
                  }`}
                  title="Bookmark Page"
                >
                  <Bookmark size={16} className={bookmarks.some(b => b.page === pageNumber) ? 'fill-yellow-500 text-yellow-500' : ''} />
                </button>
                <button 
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className={`p-2 rounded-xl border transition-all ${
                    sidebarOpen
                      ? 'bg-primary-600 border-primary-500 text-white' 
                      : darkMode ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
                  }`}
                  title="Open Notes, Search, Bookmarks"
                >
                  <PanelRight size={16} />
                </button>
                <button 
                  onClick={() => setDarkMode(!darkMode)} 
                  className={`p-2 rounded-xl border transition-all ${darkMode ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'}`}
                  title="Toggle Theme"
                >
                  {darkMode ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} className="text-indigo-600" />}
                </button>
                <button 
                  onClick={() => setBookMode(!bookMode)} 
                  className={`p-2 rounded-xl border transition-all ${bookMode ? 'bg-primary-600/10 border-primary-500/30 text-primary-400' : darkMode ? 'bg-white/5 border-white/10 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-650 hover:bg-slate-200'}`}
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
        </div>
      )}
      {/* Floating Selection Highlighter Menu */}
      {selectionMenuVisible && (
        <div 
          className="fixed z-[10001] -translate-x-1/2 bg-slate-900/95 backdrop-blur-sm text-white px-3 py-1.5 rounded-full shadow-2xl flex items-center gap-2 border border-white/10"
          style={{ 
            left: selectionMenuCoords.x, 
            top: selectionMenuCoords.y 
          }}
          onMouseDown={e => e.preventDefault()}
        >
          <button 
            onClick={() => addHighlight('yellow')} 
            className="w-5 h-5 rounded-full bg-yellow-400 hover:scale-110 active:scale-95 transition-transform" 
            title="Highlight Yellow"
          />
          <button 
            onClick={() => addHighlight('green')} 
            className="w-5 h-5 rounded-full bg-green-400 hover:scale-110 active:scale-95 transition-transform" 
            title="Highlight Green"
          />
          <button 
            onClick={() => addHighlight('blue')} 
            className="w-5 h-5 rounded-full bg-blue-400 hover:scale-110 active:scale-95 transition-transform" 
            title="Highlight Blue"
          />
          <div className="w-[1px] h-4 bg-white/20 mx-1" />
          <button 
            onClick={addHighlightWithNote} 
            className="text-[10px] uppercase font-black tracking-wider hover:text-primary-300 transition-colors flex items-center gap-1"
          >
            <Plus size={12} /> Note
          </button>
        </div>
      )}

      {/* Sliding Sidebar Drawer for Search, Bookmarks, and Highlights */}
      {sidebarOpen && (
        <div 
          className={`fixed inset-y-0 right-0 z-[10002] w-80 md:w-96 shadow-2xl border-l flex flex-col transition-all duration-300 ${
            darkMode 
              ? 'bg-[#0f172a] text-slate-100 border-white/10' 
              : 'bg-white text-slate-800 border-slate-200'
          }`}
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <span className="font-poppins font-black text-sm uppercase tracking-wider flex items-center gap-2">
              <PanelRight size={18} className="text-primary-500" /> Reader Shelf
            </span>
            <button 
              onClick={() => setSidebarOpen(false)} 
              className={`p-1.5 rounded-lg border transition-colors ${
                darkMode ? 'hover:bg-white/5 border-white/10' : 'hover:bg-slate-100 border-slate-200'
              }`}
            >
              <X size={18} />
            </button>
          </div>

          {/* Tab Selector */}
          <div className="flex border-b border-white/10 p-1 bg-slate-500/5">
            <button 
              onClick={() => setSidebarTab('bookmarks')}
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                sidebarTab === 'bookmarks' 
                  ? 'bg-primary-600 text-white' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Bookmarks
            </button>
            <button 
              onClick={() => setSidebarTab('search')}
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                sidebarTab === 'search' 
                  ? 'bg-primary-600 text-white' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Search
            </button>
            <button 
              onClick={() => setSidebarTab('notes')}
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                sidebarTab === 'notes' 
                  ? 'bg-primary-600 text-white' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Notes
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
            
            {/* Bookmarks Tab */}
            {sidebarTab === 'bookmarks' && (
              <div className="flex flex-col gap-2">
                {bookmarks.length === 0 ? (
                  <p className="text-xs text-center text-slate-500 py-10 font-bold">No bookmarks set. Click the bookmark button in the toolbar to add this page.</p>
                ) : (
                  bookmarks.map((b, i) => (
                    <div 
                      key={i} 
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-3 hover:scale-[1.01] transition-transform cursor-pointer ${
                        darkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                      onClick={() => {
                        setPageNumber(b.page);
                        saveProgress(b.page, numPages);
                      }}
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold truncate">{b.label}</span>
                        <span className="text-[10px] opacity-60 font-mono">Page {b.page}</span>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          const updated = bookmarks.filter((_, idx) => idx !== i);
                          setBookmarks(updated);
                          saveProgress(pageNumber, numPages, updated, highlights);
                          toast.success('Bookmark deleted');
                        }}
                        className="text-red-500 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Search Tab */}
            {sidebarTab === 'search' && (
              <div className="flex flex-col gap-4">
                <div className="relative">
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search inside book..." 
                    className={`w-full pl-9 pr-4 py-2.5 rounded-2xl border text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      darkMode 
                        ? 'bg-white/5 border-white/10 text-white placeholder-slate-500' 
                        : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                    }`}
                  />
                  <Search size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
                  {searchQuery && (
                    <button 
                      onClick={() => handleSearch('')}
                      className="absolute right-3 top-3 text-slate-400 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  {searchQuery.trim().length >= 2 && searchResults.length === 0 ? (
                    <p className="text-xs text-center text-slate-500 py-10 font-bold">No matches found for "{searchQuery}".</p>
                  ) : searchQuery.trim().length < 2 ? (
                    <p className="text-xs text-center text-slate-500 py-10">Type at least 2 characters to search the book text.</p>
                  ) : (
                    searchResults.map((r, i) => (
                      <div 
                        key={i}
                        className={`p-3 rounded-2xl border flex flex-col gap-1 cursor-pointer transition-transform hover:scale-[1.01] ${
                          darkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                        onClick={() => {
                          setPageNumber(r.page);
                          saveProgress(r.page, numPages);
                        }}
                      >
                        <span className="text-[10px] font-black text-primary-400 uppercase tracking-widest">Page {r.page}</span>
                        <p className="text-xs italic leading-relaxed opacity-80" dangerouslySetInnerHTML={{ 
                          __html: r.snippet.replace(new RegExp(`(${searchQuery})`, 'gi'), '<mark class="bg-orange-300/60 dark:bg-orange-500/40 text-inherit font-bold rounded px-0.5">$1</mark>') 
                        }} />
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Notes/Highlights Tab */}
            {sidebarTab === 'notes' && (
              <div className="flex flex-col gap-2">
                {highlights.length === 0 ? (
                  <p className="text-xs text-center text-slate-500 py-10 font-bold">No highlights or notes. Select text in the eBook reader to highlight and write notes.</p>
                ) : (
                  highlights.map((h, i) => (
                    <div 
                      key={i}
                      className={`p-3 rounded-2xl border flex flex-col gap-2 hover:scale-[1.01] transition-transform cursor-pointer ${
                        darkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                      onClick={() => {
                        setPageNumber(h.page);
                        saveProgress(h.page, numPages);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono opacity-60">Page {h.page}</span>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-3.5 h-3.5 rounded-full ${
                            h.color === 'green' ? 'bg-green-400' : h.color === 'blue' ? 'bg-blue-400' : 'bg-yellow-400'
                          }`} />
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteHighlight(h);
                            }}
                            className="text-red-500 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs italic border-l-2 border-slate-400/30 pl-2 opacity-80 truncate">{h.text}</p>
                      
                      {h.note ? (
                        <div className="flex flex-col gap-0.5 bg-black/10 dark:bg-white/5 p-2 rounded-xl border border-white/5">
                          <span className="text-[9px] uppercase font-black tracking-wider text-slate-400">Note</span>
                          <p className="text-xs opacity-90">{h.note}</p>
                          <button 
                            onClick={async (e) => {
                              e.stopPropagation();
                              const newNoteText = prompt('Edit note:', h.note);
                              if (newNoteText === null) return;
                              
                              const updated = highlights.map((item, idx) => idx === i ? { ...item, note: newNoteText } : item);
                              setHighlights(updated);
                              await saveProgress(pageNumber, numPages, bookmarks, updated);
                              toast.success('Note updated');
                            }}
                            className="text-[9px] font-bold text-primary-400 hover:underline mt-1 self-start"
                          >
                            Edit
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={async (e) => {
                            e.stopPropagation();
                            const noteText = prompt('Enter a note for this highlight:');
                            if (noteText === null) return;
                            
                            const updated = highlights.map((item, idx) => idx === i ? { ...item, note: noteText } : item);
                            setHighlights(updated);
                            await saveProgress(pageNumber, numPages, bookmarks, updated);
                            toast.success('Note added');
                          }}
                          className="text-[10px] font-black uppercase text-primary-500 hover:underline self-start flex items-center gap-1 mt-1"
                        >
                          <Plus size={10} /> Add Note
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

          </div>
        </div>
      )}
      
    </div>
  );
};

export default EbookReader;
