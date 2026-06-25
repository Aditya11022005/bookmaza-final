import { useState, useEffect, useRef, useMemo, lazy, Suspense } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ShoppingCart, Heart, Headphones, BookOpen, Package, CheckCircle2, ChevronRight, Play, Pause, Maximize2, Share2, ShieldCheck, Truck, Clock, ThumbsUp, Upload, Image as ImageIcon, Video, User, Check, Navigation, Info, X, ExternalLink, ZoomIn, ZoomOut } from 'lucide-react';
import useCartStore from '../store/cartStore';
import { toast } from 'sonner';
import BookSlider from '../components/home/BookSlider';
import usePageMeta from '../hooks/usePageMeta';
import axios from '../api/axios';
import useAuthStore from '../store/authStore';
import { getOptimizedImageUrl, resolveMediaUrl, getPdfProxyUrl } from '../utils/image';

const PdfPreviewModal = lazy(() => import('../components/PdfPreviewModal'));


const REVIEWS_MOCK = [
  { id: 1, name: "Arjun Desai", rating: 5, date: "October 12, 2024", verified: true, title: "A masterpiece of modern publication!", text: "This book completely changed my perspective. The bilingual pacing is incredible, the Marathi translation hits very profoundly. Pustak Maza definitely produced a premium hardcover. The spacing and typography is top notch.", images: ["https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&q=80&w=400"] },
  { id: 2, name: "Sneha Patil", rating: 4, date: "September 28, 2024", verified: true, title: "Beautifully written narrative.", text: "The translation holds up really well. The audiobook narration is highly recommended if you commute daily. Subtracting one star because delivery took an extra day.", images: [] },
  { id: 3, name: "Rohan K.", rating: 5, date: "August 04, 2024", verified: false, title: "Highly recommend the hardcopy edition.", text: "The print quality from Pustak Maza is definitively premium. Pages feel thick, typography is highly legible, and the binding is simply excellent. Worth every ruinpee.", images: [] }
];

// ==========================================
// MAIN COMPONENT
// ==========================================
const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const addToCart = useCartStore(s => s.addToCart);
  const { user, login } = useAuthStore();
  
  const [book, setBook] = useState(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [autoSlide, setAutoSlide] = useState(true);
  const [selectedFormat, setSelectedFormat] = useState('hardcopy');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [helpfulVotes, setHelpfulVotes] = useState({});
  const [reportedReviews, setReportedReviews] = useState({});
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  // Review form state
  const [newReviewRating, setNewReviewRating] = useState(0);
  const [newReviewHover, setNewReviewHover] = useState(0);
  const [newHeadline, setNewHeadline] = useState('');
  const [newReviewText, setNewReviewText] = useState('');
  const [reviews, setReviews] = useState([]);
  
  // Review Media State
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // Audio Player State
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef(null);

  // PDF Viewer State
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const [previewPageNumber, setPreviewPageNumber] = useState(1);
  const [previewNumPages, setPreviewNumPages] = useState(null);
  const [previewScale, setPreviewScale] = useState(1.0);

  usePageMeta(
    book ? `${book.title} by ${book.authorName} | Pustak Maza` : 'Book Details | Pustak Maza',
    book ? (book.description ? book.description.substring(0, 155) + '...' : `Buy "${book.title}" by ${book.authorName} as ebook, audiobook or hardcopy on Pustak Maza.`) : 'View book details on Pustak Maza.',
    true
  );

  const fetchBook = async () => {
    try {
      const { data } = await axios.get(`/books/${id}`);
      // Map backend schemas to dynamic frontend bindings
      const processedBook = {
        ...data,
        subtitle: data.subtitle || "A premium publication from Pustak Maza.",
        coAuthor: data.coAuthor || '',
        chiefEditor: data.chiefEditor || '',
        editor: data.editor || '',
        coEditor: data.coEditor || '',
        amazonLink: data.amazonLink || '',
        flipkartLink: data.flipkartLink || '',
        pothiLink: data.pothiLink || '',
        author: (data.author && data.author.name !== 'Super Admin' && data.author.role !== 'admin') ? {
          name: data.authorName || data.author.name || 'Unknown Author',
          bio: data.author.bio || 'Author biography not updated yet.',
          image: data.author.profileImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400'
        } : {
          name: data.authorName || 'Unknown Author',
          bio: data.authorName ? `${data.authorName} is an esteemed author publishing with Pustak Maza.` : 'Author biography not updated yet.',
          image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400'
        },
        formats: {
          ebook: {
            isAvailable: data.formats?.ebook?.isAvailable || false,
            isFree: data.formats?.ebook?.isFree || false,
            price: data.formats?.ebook?.price || 0,
            pdfUrl: data.formats?.ebook?.fileUrl || data.formats?.ebook?.pdfUrl || '',
            discountPrice: data.discountPercentage > 0 ? Math.round(data.formats?.ebook?.price * (1 - data.discountPercentage / 100)) : undefined
          },
          audiobook: {
            isAvailable: data.formats?.audiobook?.isAvailable || false,
            isFree: data.formats?.audiobook?.isFree || false,
            price: data.formats?.audiobook?.price || 0,
            audioUrl: data.formats?.audiobook?.fileUrl || data.formats?.audiobook?.audioUrl || '',
            duration: data.formats?.audiobook?.duration || '',
            discountPrice: data.discountPercentage > 0 ? Math.round(data.formats?.audiobook?.price * (1 - data.discountPercentage / 100)) : undefined
          },
          hardcopy: {
            isAvailable: data.formats?.hardcopy?.isAvailable || false,
            price: data.formats?.hardcopy?.price || 0,
            stock: data.formats?.hardcopy?.stock || 0,
            discountPrice: data.discountPercentage > 0 ? Math.round(data.formats?.hardcopy?.price * (1 - data.discountPercentage / 100)) : undefined
          }
        },
        images: [data.coverImage, ...(data.images || [])].filter(Boolean),
        isbn: data.isbn || '978-' + Math.floor(Math.random() * 9999999999),
        publisher: data.publisher || 'Pustak Maza Imprint / Book Saga',
        publicationDate: data.publicationDate || new Date(data.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
        pages: data.pages || 280,
        language: data.language || 'English / Marathi',
        tags: data.tags || ['Bestseller', data.category?.name || data.category || 'Book'],
        summaryEn: data.summaryEn || data.description || 'No English summary available.',
        summaryMr: data.summaryMr || 'या पुस्तकाचा मराठी सारांश लवकरच जोडला जाईल.',
        rating: typeof data.rating === 'number' ? data.rating : 0,
        reviewsCount: typeof data.numReviews === 'number' ? data.numReviews : 0
      };

      setBook(processedBook);

      const mappedReviews = (data.reviews || []).map(r => ({
        id: r._id,
        name: r.name,
        rating: r.rating,
        date: new Date(r.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
        verified: true,
        title: r.comment ? (r.comment.split(' ').slice(0, 4).join(' ') + (r.comment.split(' ').length > 4 ? '...' : '')) : 'Review',
        text: r.comment || '',
        images: [],
        video: null
      }));
      setReviews(mappedReviews);

      // Auto-select first available format
      if (processedBook.formats?.hardcopy?.isAvailable) setSelectedFormat('hardcopy');
      else if (processedBook.formats?.ebook?.isAvailable) setSelectedFormat('ebook');
      else if (processedBook.formats?.audiobook?.isAvailable) setSelectedFormat('audiobook');
      else setSelectedFormat('ebook');

    } catch (err) {
      console.error(err);
      toast.error('Failed to load book details');
    }
  };

  useEffect(() => { 
    window.scrollTo(0, 0);
    
    const fetchRelated = async () => {
      try {
        const { data } = await axios.get('/books');
        setRelatedBooks(data);
      } catch (err) {
        console.error(err);
      }
    };

    if (id) {
      fetchBook();
      fetchRelated();
    }
    
    setActiveImageIdx(0);
    setAutoSlide(true);
    setIsAudioPlaying(false);
    setAudioProgress(0);
  }, [id]);

  // Audio Logic
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const updateProgress = () => {
      setAudioProgress(audio.currentTime);
      setAudioDuration(audio.duration || 0);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', updateProgress);
    audio.addEventListener('ended', () => setIsAudioPlaying(false));

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', updateProgress);
      audio.removeEventListener('ended', () => setIsAudioPlaying(false));
    };
  }, [book, selectedFormat]);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isAudioPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsAudioPlaying(!isAudioPlaying);
    }
  };

  const handleAudioSeek = (e) => {
    const audio = audioRef.current;
    if (!audio) return;
    const seekTime = (e.nativeEvent.offsetX / e.currentTarget.offsetWidth) * audio.duration;
    audio.currentTime = seekTime;
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "00:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Auto-slideshow: cycles through images every 3 seconds
  useEffect(() => {
    if (!book || !autoSlide || book.images.length <= 1) return;
    const interval = setInterval(() => {
      setActiveImageIdx(prev => (prev + 1) % book.images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [book, autoSlide]);


  if (!book) return <div className="min-h-screen flex items-center justify-center">Loading Book...</div>;

  const activeFormatData = book.formats[selectedFormat] || {};
  const hasDiscount = activeFormatData.discountPrice && activeFormatData.discountPrice < activeFormatData.price;
  const currentPrice = hasDiscount ? activeFormatData.discountPrice : (activeFormatData.price ?? book.price);

  const isAlreadyPurchased = user?.purchasedBooks?.some(item => 
    (typeof item === 'string' ? item : item._id) === book?._id
  );
  const isFormatPurchased = isAlreadyPurchased && (selectedFormat === 'ebook' || selectedFormat === 'audiobook');
  const isFree = (activeFormatData.isFree || currentPrice === 0) && (selectedFormat === 'ebook' || selectedFormat === 'audiobook');
  const displayPrice = isFree ? 0 : currentPrice;
  const hasLocalFormats = book.formats?.ebook?.isAvailable || book.formats?.audiobook?.isAvailable || book.formats?.hardcopy?.isAvailable;

  const handleAddToCart = () => {
    addToCart({ book: book._id, title: book.title, image: book.images[0], format: selectedFormat, price: displayPrice, quantity: 1 });
    toast.success(`Added ${selectedFormat} to cart successfully!`);
  };

  const handleBuyNow = () => {
    const buyNowObj = { book: book._id, title: book.title, image: book.images[0], format: selectedFormat, price: displayPrice, qty: 1 };
    sessionStorage.setItem('tempBuyNow', JSON.stringify(buyNowObj));
    navigate('/checkout', { state: { buyNowItem: buyNowObj } });
  };

  const handleWishlist = async () => {
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
      toast.error(err.response?.data?.message || 'Failed to update wishlist');
    }
  };

  const handleFreeClaim = async () => {
    if (!user) {
      toast.error('Please login to claim free books.');
      navigate('/login');
      return;
    }

    try {
      const orderItems = [{
        book: book._id,
        title: book.title,
        image: book.coverImage || book.images?.[0] || '',
        format: selectedFormat,
        price: 0,
        qty: 1
      }];

      const payload = {
        orderItems,
        shippingAddress: {},
        paymentMethod: 'Free Claim',
        itemsPrice: 0,
        shippingPrice: 0,
        totalPrice: 0
      };

      await axios.post('/orders', payload);
      
      // Update local user state
      const updatedUser = { 
        ...user, 
        purchasedBooks: [...(user.purchasedBooks || []), book._id] 
      };
      login(updatedUser);

      toast.success(`Claimed "${book.title}" successfully!`);
      navigate('/library');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to claim free book');
    }
  };

  const handleWhatsAppShare = () => {
    const text = `Check out "${book.title}" by ${book.authorName} on Pustak Maza!`;
    const url = window.location.href;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + " " + url)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShare = async () => {
    const shareData = {
      title: book.title,
      text: `Check out "${book.title}" by ${book.authorName} on Pustak Maza!`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') toast.error('Error sharing page');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <div className="bg-[#f8fafc] w-full min-h-screen pb-20 font-inter">
      {/* 0. SEO SCHEMA STRUCTURED DATA (JSON-LD) */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Book",
          "name": book.title,
          "author": {
            "@type": "Person",
            "name": book.authorName
          },
          "image": book.coverImage,
          "description": book.description || `Buy "${book.title}" by ${book.authorName} on Pustak Maza. Available in ebook, audiobook, and print editions.`,
          "workExample": [
            book.formats?.ebook?.isAvailable && {
              "@type": "Book",
              "bookFormat": "https://schema.org/EBook",
              "offers": {
                "@type": "Offer",
                "price": book.formats.ebook.price,
                "priceCurrency": "INR",
                "availability": "https://schema.org/InStock"
              }
            },
            book.formats?.audiobook?.isAvailable && {
              "@type": "Book",
              "bookFormat": "https://schema.org/AudiobookFormat",
              "offers": {
                "@type": "Offer",
                "price": book.formats.audiobook.price,
                "priceCurrency": "INR",
                "availability": "https://schema.org/InStock"
              }
            },
            book.formats?.hardcopy?.isAvailable && {
              "@type": "Book",
              "bookFormat": "https://schema.org/Hardcover",
              "offers": {
                "@type": "Offer",
                "price": book.formats.hardcopy.price,
                "priceCurrency": "INR",
                "availability": "https://schema.org/InStock"
              }
            }
          ].filter(Boolean),
          "aggregateRating": book.rating ? {
            "@type": "AggregateRating",
            "ratingValue": book.rating,
            "bestRating": "5",
            "worstRating": "1",
            "reviewCount": book.reviews?.length || 1
          } : undefined
        })}
      </script>
      
      {/* 1. STRUCTURAL BREADCRUMBS */}
      <div className="bg-white border-b border-[#e2e8f0] shadow-sm relative z-20">
         <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center gap-2 text-sm font-bold text-[#64748b] tracking-wide">
            <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
            <ChevronRight size={16} className="text-gray-300"/>
            <Link to="/shop" className="hover:text-primary-600 transition-colors">Shop</Link>
            <ChevronRight size={16} className="text-gray-300"/>
            <Link to={`/shop`} className="hover:text-primary-600 transition-colors">{book.category?.name || book.category}</Link>
            <ChevronRight size={16} className="text-gray-300"/>
            <span className="text-[#1e293b] truncate max-w-[200px] sm:max-w-[400px] bg-gray-100 px-3 py-1 rounded-md">{book.title}</span>
         </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 pt-12">
        
        {/* ======================================= */}
        {/* 2. PREMIUM TOP PRODUCT SECTION */}
        {/* ======================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* LEFT: Dual-Column Interactive Gallery */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4">
            {/* Main Image */}
            <div className="relative w-full aspect-[3/4] bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl overflow-hidden border border-[#e2e8f0] shadow-[0_15px_40px_-15px_rgba(0,0,0,0.1)] group">
               <img
                 src={getOptimizedImageUrl(book.images[activeImageIdx], 600)}
                 alt="Cover"
                 className="w-full h-full object-contain transition-transform duration-700 ease-out group-hover:scale-105 p-2"
               />
               <button className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-full text-gray-500 hover:text-primary-600 shadow-md opacity-0 group-hover:opacity-100 transition-all z-10 transform hover:scale-110">
                 <Maximize2 size={22}/>
               </button>
            </div>
            {/* Thumbnails */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {book.images.map((img, idx) => (
                 <button key={idx} onClick={() => { setActiveImageIdx(idx); setAutoSlide(false); }} className={`relative shrink-0 w-20 h-28 sm:w-24 sm:h-32 rounded-2xl overflow-hidden border-2 transition-all duration-300 bg-gray-50 ${activeImageIdx === idx ? 'border-primary-500 shadow-[0_8px_20px_rgba(106,13,173,0.3)] scale-[1.02]' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-[1.02]'}`}>
                    <img src={getOptimizedImageUrl(img, 150)} alt={`Thumb ${idx}`} className="w-full h-full object-contain p-1"/>
                 </button>
              ))}
            </div>
          </div>

          {/* RIGHT: Master Product Information Panel */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
            
            {/* Title & Micro-data */}
            <div className="mb-8">
               <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-white bg-primary-600 px-3 py-1.5 rounded-lg shadow-sm">{book.category?.name || book.category}</span>
                  {book.tags.includes("Bestseller") && <span className="text-xs font-black uppercase tracking-[0.2em] text-yellow-700 bg-yellow-100 px-3 py-1.5 rounded-lg">Bestseller</span>}
               </div>
               
               <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#1e293b] leading-[1.1] mb-4 font-poppins">{book.title}</h1>
               <h2 className="text-xl md:text-2xl text-[#64748b] font-medium leading-snug">{book.subtitle}</h2>
            </div>
            
            {/* Author & Trust Row */}
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4 mb-10 pb-10 border-b border-gray-200">
               <div className="flex items-center gap-3">
                 <img src={getOptimizedImageUrl(book.author.image, 150)} alt={book.author.name} className="w-12 h-12 rounded-full object-cover shadow-sm border border-gray-100"/>
                 <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Author</span>
                    <Link to="#" className="font-extrabold text-lg text-[#1e293b] hover:text-primary-600 transition-colors">{book.author.name}</Link>
                 </div>
               </div>

               <div className="w-px h-10 bg-gray-200 hidden sm:block"></div>

               <div className="flex flex-col">
                 <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Global Rating</span>
                 <div className="flex items-center gap-2">
                   <div className="flex text-yellow-400">
                     <Star size={18} fill="currentColor"/>
                     <Star size={18} fill="currentColor"/>
                     <Star size={18} fill="currentColor"/>
                     <Star size={18} fill="currentColor"/>
                     <Star size={18} fill="currentColor" className="opacity-40"/>
                   </div>
                   <span className="font-black text-[#1e293b]">{book.rating}</span>
                   <a href="#reviews" className="text-primary-600 hover:text-primary-700 font-bold ml-1 text-sm underline underline-offset-4">({book.reviewsCount.toLocaleString()} reviews)</a>
                 </div>
               </div>

               <div className="w-px h-10 bg-gray-200 hidden md:block"></div>

               <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-xl border border-green-100">
                 <ShieldCheck size={20} className="text-green-600"/>
                 <span className="font-bold text-green-700 text-sm">Pustak Maza Verified</span>
               </div>
            </div>

            {/* Smart Format Selector Module */}
            <div className="mb-10">
               <div className="flex items-center justify-between mb-4">
                 <h3 className="text-sm font-black text-[#1e293b] uppercase tracking-widest flex items-center gap-2"><SettingsIcon/> Select Edition Format</h3>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                 {Object.keys(book.formats)
                   .filter(format => book.formats[format]?.isAvailable)
                   .map(format => {
                    const isSelected = selectedFormat === format;
                    const fData = book.formats[format];
                    const activePrice = fData.discountPrice || fData.price;
                    
                    return (
                      <button 
                        key={format}
                        onClick={() => setSelectedFormat(format)}
                        className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-300 ${isSelected ? 'border-primary-500 bg-primary-50/50 shadow-[0_10px_20px_-10px_rgba(106,13,173,0.3)] transform -translate-y-1' : 'border-[#e2e8f0] bg-white hover:border-primary-300'}`}
                      >
                         {isSelected && <div className="absolute -top-3 -right-3 w-7 h-7 bg-primary-500 rounded-full text-white flex items-center justify-center shadow-lg animate-bounce-sm"><Check size={14} strokeWidth={4}/></div>}
                         
                         <div className="flex items-center gap-2 mb-3">
                            {format === 'hardcopy' && <Package size={22} className={isSelected ? 'text-primary-600' : 'text-gray-400'}/>}
                            {format === 'ebook' && <BookOpen size={22} className={isSelected ? 'text-primary-600' : 'text-gray-400'}/>}
                            {format === 'audiobook' && <Headphones size={22} className={isSelected ? 'text-primary-600' : 'text-gray-400'}/>}
                            <span className={`font-black uppercase tracking-widest text-sm ${isSelected ? 'text-primary-800' : 'text-[#64748b]'}`}>{format}</span>
                         </div>
                         <div className={`text-2xl font-black font-poppins mb-1 transition-colors ${isSelected ? 'text-primary-700' : 'text-[#1e293b]'}`}>
                           ₹{activePrice}
                         </div>
                         <div className="flex items-center gap-2">
                           {fData.discountPrice && <span className="text-xs font-bold text-gray-400 line-through">₹{fData.price}</span>}
                           {fData.stock && <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 rounded">{fData.stock} Left</span>}
                         </div>
                      </button>
                    );
                 })}
               </div>
            </div>

            {/* Massive Action Conversion Box */}
            <div className="bg-white p-8 rounded-3xl border border-[#e2e8f0] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] mb-10">
               
               <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8 pb-8 border-b border-gray-100">
                  <div>
                    <div className="text-sm font-black text-green-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                       <CheckCircle2 size={16}/> {activeFormatData.stock > 0 ? "In Stock & Ready to Dispatch" : "Instant Digital Availability"}
                    </div>
                    <div className="flex items-end gap-4">
                      {displayPrice === 0 ? (
                        <span className="text-5xl font-black text-emerald-600 leading-none font-poppins">
                          Free
                        </span>
                      ) : (
                        <span className="text-5xl font-black text-[#1e293b] leading-none font-poppins relative">
                          <span className="text-2xl absolute -left-4 top-1 text-gray-400">₹</span>{displayPrice}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Circular Core Actions */}
                  <div className="flex gap-3">
                     <button onClick={handleWhatsAppShare} title="Share on WhatsApp" className="w-14 h-14 rounded-full border border-[#e2e8f0] bg-gray-50 flex items-center justify-center text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all hover:scale-105 shadow-sm">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .004 5.412.001 12.049a11.81 11.81 0 001.602 5.996L0 24l6.148-1.612a11.774 11.774 0 005.9 1.57h.004c6.635 0 12.045-5.413 12.048-12.05a11.785 11.785 0 00-3.54-8.513z"/></svg>
                     </button>
                     <button onClick={handleShare} title="Share on Social" className="w-14 h-14 rounded-full border border-[#e2e8f0] bg-gray-50 flex items-center justify-center text-[#64748b] hover:text-primary-600 hover:bg-primary-50 transition-all hover:scale-105 shadow-sm">
                        <Share2 size={20}/>
                     </button>
                      <button 
                        onClick={handleWishlist} 
                        title={user?.wishlist?.some(item => (typeof item === 'string' ? item : item._id) === book._id) ? "Remove from Wishlist" : "Add to Wishlist"} 
                        className={`w-14 h-14 rounded-full border flex items-center justify-center transition-all hover:scale-105 shadow-sm ${user?.wishlist?.some(item => (typeof item === 'string' ? item : item._id) === book._id) ? 'border-rose-100 bg-rose-50 text-rose-500' : 'border-[#e2e8f0] bg-gray-50 text-[#64748b] hover:text-red-500 hover:bg-red-50'}`}
                      >
                         <Heart size={20} fill={user?.wishlist?.some(item => (typeof item === 'string' ? item : item._id) === book._id) ? "currentColor" : "none"}/>
                      </button>
                  </div>
               </div>

               <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  {!hasLocalFormats ? (
                    <div className="w-full text-center py-5 px-4 bg-slate-50 border border-slate-200 rounded-2xl">
                      <p className="text-slate-500 font-bold text-sm">This book is not sold directly on Pustak Maza.</p>
                      <p className="text-[#1e293b] font-black text-base mt-1">Please buy using the external purchase links below.</p>
                    </div>
                  ) : isFormatPurchased ? (
                    <button 
                      onClick={() => navigate(selectedFormat === 'ebook' ? `/read/${book._id}` : `/listen/${book._id}`)} 
                      className="w-full py-5 rounded-2xl bg-emerald-600 text-white font-black text-xl flex items-center justify-center gap-3 hover:bg-emerald-700 shadow-[0_15px_30px_rgba(16,185,129,0.3)] transition-all transform hover:-translate-y-1"
                    >
                      <BookOpen size={22}/> {selectedFormat === 'ebook' ? 'Read Ebook Now' : 'Listen to Audiobook Now'}
                    </button>
                  ) : isFree ? (
                    <button 
                      onClick={handleFreeClaim} 
                      className="w-full py-5 rounded-2xl bg-[#1e293b] text-white font-black text-xl flex items-center justify-center gap-3 hover:bg-primary-600 shadow-[0_15px_30px_rgba(30,41,59,0.3)] transition-all transform hover:-translate-y-1"
                    >
                      <BookOpen size={22}/> Claim Free Book
                    </button>
                  ) : (
                    <>
                      <button onClick={handleBuyNow} className="flex-[2] py-5 rounded-2xl bg-primary-500 text-white font-black text-xl flex items-center justify-center gap-3 hover:bg-primary-600 shadow-[0_15px_30px_rgba(106,13,173,0.3)] transition-all transform hover:-translate-y-1">
                        Buy Now Securely
                      </button>
                      <button onClick={handleAddToCart} className="flex-1 py-5 rounded-2xl border-2 border-primary-100 bg-primary-50 text-primary-600 font-extrabold text-lg flex items-center justify-center gap-2 hover:bg-primary-100 hover:text-primary-700 transition-colors">
                        <ShoppingCart size={22}/> Add to Cart
                      </button>
                    </>
                  )}
                </div>

                {/* External Purchase Links */}
                {(book.amazonLink || book.flipkartLink || book.pothiLink) && (
                  <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest block text-center sm:text-left">Purchase From External Stores:</span>
                    <div className="flex flex-col sm:flex-row gap-3">
                      {book.amazonLink && (
                        <a 
                          href={book.amazonLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex-1 py-3 px-4 rounded-xl border border-[#FF9900] bg-[#FF9900]/5 text-[#FF9900] font-black text-sm flex items-center justify-center gap-2 hover:bg-[#FF9900] hover:text-white transition-all transform hover:-translate-y-0.5"
                        >
                          Amazon <ExternalLink size={14} />
                        </a>
                      )}
                      {book.flipkartLink && (
                        <a 
                          href={book.flipkartLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex-1 py-3 px-4 rounded-xl border border-[#2874F0] bg-[#2874F0]/5 text-[#2874F0] font-black text-sm flex items-center justify-center gap-2 hover:bg-[#2874F0] hover:text-white transition-all transform hover:-translate-y-0.5"
                        >
                          Flipkart <ExternalLink size={14} />
                        </a>
                      )}
                      {book.pothiLink && (
                        <a 
                          href={book.pothiLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex-1 py-3 px-4 rounded-xl border border-primary-500 bg-primary-500/5 text-primary-600 font-black text-sm flex items-center justify-center gap-2 hover:bg-primary-500 hover:text-white transition-all transform hover:-translate-y-0.5"
                        >
                          Pothi <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {hasLocalFormats && (
                  <div className="text-center text-xs font-bold text-gray-400 tracking-wide uppercase flex items-center justify-center gap-2">
                    <LockIcon/> 100% Encrypted Payment Gateway
                  </div>
                )}
            </div>

            {/* Dynamic Re-active Format UI Block */}
            <AnimatePresence mode="wait">
               <motion.div 
                 key={selectedFormat}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 transition={{ duration: 0.3 }}
               >
                 {selectedFormat === 'ebook' && (
                   <div className="bg-gradient-to-r from-[#1e293b] to-[#0f172a] rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 justify-between shadow-lg relative overflow-hidden text-white border border-gray-800">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/20 rounded-full blur-[50px] translate-x-1/2 -translate-y-1/2"></div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 text-primary-400 font-black text-xs uppercase tracking-[0.2em] mb-3"><BookOpen size={16}/> Interactive Preview</div>
                        <h4 className="font-extrabold text-3xl mb-3 font-poppins text-white">Read the First 10 Pages</h4>
                        <p className="text-gray-300 font-medium leading-relaxed max-w-sm">Experience the pristine digital typography directly inside our secure Web Reader before committing to purchase.</p>
                      </div>
                      <button 
                        onClick={() => setIsPdfOpen(true)}
                        className="shrink-0 relative z-10 bg-white text-[#1e293b] font-black py-4 px-8 rounded-xl hover:bg-primary-50 transition-all shadow-xl hover:scale-105 active:scale-95"
                      >
                        Open Web Reader
                      </button>
                   </div>
                 )}
                 {selectedFormat === 'audiobook' && (
                   <div className="bg-gradient-to-br from-primary-50 to-white rounded-3xl p-8 border border-primary-100 shadow-sm relative overflow-hidden">
                      <audio ref={audioRef} src={resolveMediaUrl(book.formats.audiobook?.audioUrl)} />
                      <div className="absolute -bottom-10 -right-10 text-primary-100/50"><Headphones size={150}/></div>
                      <div className="relative z-10 flex items-center justify-between mb-8">
                         <div className="flex items-center gap-5">
                           <button 
                             onClick={toggleAudio}
                             className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center text-white shadow-[0_10px_20px_rgba(106,13,173,0.4)] hover:scale-110 transition-transform active:scale-90"
                           >
                             {isAudioPlaying ? <Pause size={24} fill="currentColor"/> : <Play size={24} className="ml-1" fill="currentColor"/>}
                           </button>
                           <div>
                             <div className="flex items-center gap-2 text-primary-600 font-black text-xs uppercase tracking-widest mb-1"><Headphones size={14}/> Audio Sample</div>
                             <h4 className="font-extrabold text-2xl font-poppins text-[#1e293b] mb-1">Chapters 1 & 2</h4>
                             <p className="text-[#64748b] text-sm font-bold">Narrated by: <span className="text-[#1e293b]">{book.formats.audiobook?.narrator || book.author.name}</span></p>
                           </div>
                         </div>
                         <span className="font-black text-[#1e293b] bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">{formatTime(audioDuration)}</span>
                      </div>
                      <div 
                        onClick={handleAudioSeek}
                        className="relative z-10 w-full h-3 bg-primary-100 rounded-full overflow-hidden mb-3 cursor-pointer shadow-inner"
                      >
                         <div className="h-full bg-primary-500 rounded-full relative transition-all" style={{ width: `${(audioProgress / audioDuration) * 100}%` }}>
                           <div className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-4 border-primary-500 rounded-full shadow-md"></div>
                         </div>
                      </div>
                      <div className="relative z-10 flex justify-between text-sm font-black text-primary-600/60">
                        <span>05:32</span>
                        <span>-09:28</span>
                      </div>
                   </div>
                 )}
                 {selectedFormat === 'hardcopy' && (
                   <div className="bg-green-50 rounded-3xl p-8 border border-green-200 shadow-sm flex flex-col sm:flex-row items-center gap-8 justify-between">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-green-600 shrink-0 shadow-sm"><Truck size={28}/></div>
                        <div>
                          <h4 className="font-extrabold text-2xl font-poppins text-green-900 mb-2">Fast & Secure Shipping</h4>
                          <p className="text-green-800 font-medium">Dispatches within 24 hours via Priority Air. Estimated delivery: <br/><strong className="text-green-900 border-b-2 border-green-300 pb-0.5">{book.formats.hardcopy?.deliveryEstimate || "2-4 Business Days"}</strong>.</p>
                        </div>
                      </div>
                      <div className="shrink-0 flex flex-col items-center gap-1.5 px-6 py-4 bg-white rounded-2xl border border-green-100 shadow-sm">
                        <span className="text-4xl font-black text-green-700 font-poppins">{book.formats.hardcopy?.stock || "Out"}</span>
                        <span className="text-xs font-black text-green-600 uppercase tracking-widest text-center">Left in<br/>Stock</span>
                      </div>
                   </div>
                 )}
               </motion.div>
            </AnimatePresence>

          </div>
        </div>

        {/* ======================================= */}
        {/* 3. PREMIUM BILINGUAL SUMMARY BLOCKS */}
        {/* ======================================= */}
        <div className="mt-24 lg:mt-32 max-w-[1400px] mb-20 text-center flex flex-col items-center">
           <span className="text-primary-600 font-black uppercase tracking-[0.2em] text-sm mb-3 block">Dive Deeper</span>
           <h3 className="text-4xl md:text-5xl font-black text-[#1e293b] font-poppins mb-16">About This Book</h3>
           
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 w-full text-left">
              {/* English */}
              <div className="bg-white/80 backdrop-blur-sm rounded-[2.5rem] p-8 lg:p-12 border border-[#e2e8f0] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden group hover:border-primary-200 transition-colors">
                 <div className="absolute top-0 right-0 w-40 h-40 bg-gray-50 rounded-bl-[100%] -z-10 group-hover:scale-110 transition-transform duration-700"></div>
                 <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
                    <h4 className="text-2xl font-black text-[#1e293b] font-poppins flex items-center gap-3">
                      <BookOpen className="text-gray-400" size={28}/> English Summary
                    </h4>
                    <span className="px-4 py-1.5 bg-[#1e293b] text-white text-xs font-black rounded-lg uppercase tracking-widest shadow-md">En</span>
                 </div>
                 <p className="text-[#475569] text-lg font-medium leading-[2] whitespace-pre-wrap">{book.summaryEn}</p>
              </div>

              {/* Marathi */}
              <div className="bg-primary-50 rounded-[2.5rem] p-8 lg:p-12 border border-primary-200 shadow-[0_20px_50px_-15px_rgba(106,13,173,0.15)] relative overflow-hidden group hover:border-primary-300 transition-colors">
                 <div className="absolute top-0 right-0 w-40 h-40 bg-primary-100 rounded-bl-[100%] -z-10 group-hover:scale-110 transition-transform duration-700"></div>
                 <div className="flex items-center justify-between mb-8 pb-6 border-b border-primary-100">
                    <h4 className="text-2xl font-black text-primary-900 font-poppins flex items-center gap-3">
                      <BookOpen className="text-primary-600" size={28}/> सारांश (Marathi)
                    </h4>
                    <span className="px-4 py-1.5 bg-primary-600 text-white text-xs font-black rounded-lg uppercase tracking-widest shadow-md">Mr</span>
                 </div>
                 <p className="text-primary-900/80 text-xl font-medium leading-[2] whitespace-pre-wrap">{book.summaryMr}</p>
              </div>
           </div>
        </div>

        {/* ======================================= */}
        {/* 4. AUTHOR PROFILE & METADATA GRID */}
        {/* ======================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-20 mb-20 px-4 sm:px-0">
          
          <div className="lg:col-span-8 flex flex-col">
             <div className="flex items-center gap-4 mb-8">
                <span className="p-3 bg-primary-50 text-primary-600 rounded-2xl"><User size={28}/></span>
                <h3 className="text-3xl font-black text-[#1e293b] font-poppins">About the Author</h3>
             </div>
             <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-[3rem] p-10 lg:p-12 shadow-[0_30px_60px_-15px_rgba(106,13,173,0.3)] relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[80px] translate-x-1/2 -translate-y-1/2"></div>
               {book.author.bio && book.author.bio !== 'Author biography not updated yet.' ? (
                 <div className="flex flex-col sm:flex-row items-center sm:items-start gap-10 relative z-10">
                    <div className="w-40 h-40 shrink-0 rounded-full overflow-hidden border-8 border-white/10 shadow-2xl group-hover:scale-105 transition-transform duration-700">
                       <img src={getOptimizedImageUrl(book.author.image, 300)} alt={book.author.name} className="w-full h-full object-cover"/>
                    </div>
                    <div className="text-center sm:text-left text-white flex-1">
                       <h4 className="text-3xl font-black font-poppins mb-4">{book.author.name}</h4>
                       <p className="text-primary-100/80 font-medium leading-[1.8] text-lg mb-8">{book.author.bio}</p>
                       <Link to={`/author/${book.author.name}`} className="inline-flex items-center gap-3 bg-white/10 hover:bg-white border border-white/20 hover:border-white hover:text-[#1e293b] text-white px-8 py-4 rounded-2xl font-black tracking-wide transition-all duration-300 backdrop-blur-md shadow-lg">
                         View Author Profile <Navigation size={18}/>
                       </Link>
                    </div>
                 </div>
               ) : (
                 <div className="flex items-center gap-6 relative z-10 py-4 text-white">
                    <div className="w-16 h-16 rounded-full bg-primary-500 flex items-center justify-center font-black text-2xl">
                      {book.author.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-3xl font-black font-poppins">{book.author.name}</h4>
                      <p className="text-primary-200/60 font-bold uppercase tracking-wider text-xs mt-1">Publisher & Author</p>
                    </div>
                 </div>
               )}
             </div>
          </div>

          <div className="lg:col-span-4 shrink-0">
             <div className="flex items-center gap-4 mb-8">
                <span className="p-3 bg-gray-100 text-[#64748b] rounded-2xl"><Info size={28}/></span>
                <h3 className="text-3xl font-black text-[#1e293b] font-poppins">Details</h3>
             </div>
             <div className="bg-white rounded-[3rem] border border-[#e2e8f0] p-10 shadow-sm">
                <table className="w-full text-left border-collapse">
                   <tbody>
                      {[
                        { label: 'ISBN/EAN', val: book.isbn },
                        { label: 'Publisher', val: <Link to="#" className="text-primary-600 hover:text-primary-800 underline underline-offset-4 font-black">{book.publisher}</Link> },
                        { label: 'Published Date', val: book.publicationDate },
                        { label: 'Bilingual Format', val: book.language },
                        { label: 'Pages Count', val: book.pages },
                        book.coAuthor && { label: book.coAuthor.includes(',') ? 'Co-Authors' : 'Co-Author', val: book.coAuthor },
                        book.chiefEditor && { label: 'Chief Editor', val: book.chiefEditor },
                        book.editor && { label: 'Editor', val: book.editor },
                        book.coEditor && { label: 'Co-Editor', val: book.coEditor },
                      ].filter(Boolean).map((row, i) => (
                        <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                           <th className="py-5 text-[#64748b] font-bold text-sm tracking-widest uppercase">{row.label}</th>
                           <td className="py-5 text-[#1e293b] font-black text-right">{row.val}</td>
                        </tr>
                      ))}
                   </tbody>
                </table>
                <div className="mt-8 pt-8 border-t border-gray-100">
                   <h5 className="text-[#64748b] font-bold text-sm tracking-widest uppercase mb-4">Categorization Tags</h5>
                   <div className="flex flex-wrap gap-2.5">
                     {book.tags.map(t => (
                        <span key={t} className="bg-[#f8fafc] border border-[#e2e8f0] text-[#1e293b] px-4 py-2 rounded-xl text-xs font-black uppercase hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 cursor-pointer transition-colors shadow-sm">{t}</span>
                     ))}
                   </div>
                </div>
             </div>
          </div>

        </div>

        {/* ======================================= */}
        {/* 5. AMAZON-STYLE REVIEW AGGREGATION BLOCK */}
        {/* ======================================= */}
        <div className="mt-20 pt-20 border-t border-[#e2e8f0] relative" id="reviews">
           <div className="flex flex-col items-center mb-16 text-center">
             <span className="text-primary-600 font-black uppercase tracking-[0.2em] text-sm mb-3 block">Reader Feedback</span>
             <h3 className="text-4xl md:text-5xl font-black text-[#1e293b] font-poppins">Customer Reviews</h3>
           </div>

           <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 relative z-10">
              
              {/* Aggregation Sidebar */}
              <div className="w-full lg:w-[350px] xl:w-[400px] shrink-0 lg:sticky lg:top-32 self-start bg-white p-8 rounded-[3rem] border border-[#e2e8f0] shadow-sm">
                 <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100">
                    <div className="text-7xl font-black text-[#1e293b] font-poppins">{book.rating}</div>
                    <div className="flex flex-col gap-2">
                       <div className="flex text-yellow-400"><Star size={24} fill="currentColor"/><Star size={24} fill="currentColor"/><Star size={24} fill="currentColor"/><Star size={24} fill="currentColor"/><Star size={24} fill="currentColor" className="opacity-30"/></div>
                       <span className="text-[#64748b] font-bold text-sm uppercase tracking-widest">{book.reviewsCount.toLocaleString()} global ratings</span>
                    </div>
                 </div>

                 {/* Premium Star Distribution Bars */}
                 <div className="flex flex-col gap-4 mb-10">
                    {[
                      { s: 5, p: 82 }, { s: 4, p: 12 }, { s: 3, p: 4 }, { s: 2, p: 1 }, { s: 1, p: 1 }
                    ].map(row => (
                       <div key={row.s} className="flex items-center gap-4 text-sm font-black text-[#64748b] group cursor-pointer">
                          <span className="w-16 whitespace-nowrap group-hover:text-primary-600 transition-colors text-right">{row.s} star</span>
                          <div className="flex-1 h-4 bg-[#f1f5f9] rounded-full overflow-hidden shadow-inner border border-gray-100">
                             <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${row.p}%` }}></div>
                          </div>
                          <span className="w-12 text-right group-hover:text-primary-600 transition-colors">{row.p}%</span>
                       </div>
                    ))}
                 </div>

                 {/* Call To Review Box */}
                 <div className="bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200 p-8 rounded-[2rem] text-center shadow-[0_10px_20px_-10px_rgba(106,13,173,0.2)]">
                    <h5 className="font-black text-[#1e293b] text-xl mb-2 font-poppins">Share Your Experience</h5>
                    <p className="text-sm font-medium text-primary-800/70 mb-8">Other readers value your honest feedback and reviews.</p>
                    <button onClick={() => setIsReviewModalOpen(true)} className="w-full bg-white border-2 border-primary-500 text-primary-600 font-extrabold py-4 px-6 rounded-2xl hover:bg-primary-500 hover:text-white transition-all shadow-md active:scale-95">
                      Write a Customer Review
                    </button>
                 </div>
              </div>

              {/* Individual Reviews Grid */}
              <div className="flex-1">
                 
                 {/* Framer-Motion Review Overly Modal */}
                 <AnimatePresence>
                   {isReviewModalOpen && (
                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-[#1e293b]/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto custom-scrollbar">
                       <motion.div initial={{ scale: 0.95, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 30 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="w-full max-w-3xl bg-white rounded-[3rem] shadow-2xl overflow-hidden my-auto relative border border-gray-100">
                          {/* Form content */}
                          <div className="px-10 py-8 border-b border-gray-100 flex justify-between items-center bg-[#f8fafc]">
                             <h4 className="text-3xl font-black text-[#1e293b] font-poppins">Write a Review</h4>
                             <button onClick={() => setIsReviewModalOpen(false)} className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 shadow-sm border border-gray-200 transition-all hover:scale-105 active:scale-95"><X size={24}/></button>
                          </div>
                          
                          <div className="p-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
                             <div className="flex items-center gap-6 pb-8 border-b border-gray-100 mb-8">
                               <img src={getOptimizedImageUrl(book.images[0], 150)} alt="book" className="w-16 h-24 object-cover rounded-lg shadow-sm"/>
                               <div>
                                 <h5 className="font-extrabold text-[#1e293b] text-xl mb-1">{book.title}</h5>
                                 <p className="text-[#64748b] font-bold">You are reviewing the {selectedFormat} edition.</p>
                               </div>
                             </div>

                             <div className="mb-8">
                                 <label className="text-sm font-black text-[#64748b] uppercase tracking-widest mb-4 block">Overall Rating</label>
                                 <div className="flex gap-3">
                                   {[1,2,3,4,5].map(st => (
                                     <button
                                       key={st}
                                       onClick={() => setNewReviewRating(st)}
                                       onMouseEnter={() => setNewReviewHover(st)}
                                       onMouseLeave={() => setNewReviewHover(0)}
                                       className="transition-transform hover:scale-110"
                                     >
                                       <Star
                                         size={40}
                                         fill={(newReviewHover || newReviewRating) >= st ? 'currentColor' : 'none'}
                                         className={(newReviewHover || newReviewRating) >= st ? 'text-yellow-400' : 'text-gray-300'}
                                       />
                                     </button>
                                   ))}
                                 </div>
                                 {newReviewRating === 0 && <p className="text-xs text-red-400 font-bold mt-2">Please select a rating</p>}
                              </div>

                              <div className="mb-8">
                                 <label className="text-sm font-black text-[#64748b] uppercase tracking-widest mb-4 block">Add a Headline</label>
                                 <input
                                   type="text"
                                   value={newHeadline}
                                   onChange={e => setNewHeadline(e.target.value)}
                                   placeholder="What's most important to know?"
                                   className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium text-lg text-[#1e293b] shadow-inner"
                                 />
                              </div>

                             <div className="mb-8">
                                <label className="text-sm font-black text-[#64748b] uppercase tracking-widest mb-2 block">Add a Photo or Video</label>
                                <p className="text-sm text-gray-500 font-medium mb-4">Shoppers find images and videos more helpful than text alone.</p>
                                <div className="flex flex-wrap gap-4">
                                   <input 
                                      type="file" 
                                      ref={imageInputRef} 
                                      multiple 
                                      accept="image/*" 
                                      className="hidden" 
                                      onChange={(e) => setSelectedImages(Array.from(e.target.files))}
                                    />
                                    <input 
                                      type="file" 
                                      ref={videoInputRef} 
                                      accept="video/*" 
                                      className="hidden" 
                                      onChange={(e) => setSelectedVideo(e.target.files[0])}
                                    />
                                    
                                    <button 
                                      onClick={() => imageInputRef.current.click()}
                                      className={`w-32 h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 transition-all ${selectedImages.length > 0 ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-gray-300 text-gray-400 hover:border-primary-400 hover:text-primary-500 hover:bg-primary-50 bg-[#f8fafc]'}`}
                                    >
                                       <ImageIcon size={32}/> 
                                       <span className="text-[10px] font-black uppercase tracking-widest text-center">
                                         {selectedImages.length > 0 ? `${selectedImages.length} Images` : 'Add Image'}
                                       </span>
                                    </button>
                                    
                                    <button 
                                      onClick={() => videoInputRef.current.click()}
                                      className={`w-32 h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 transition-all ${selectedVideo ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-gray-300 text-gray-400 hover:border-primary-400 hover:text-primary-500 hover:bg-primary-50 bg-[#f8fafc]'}`}
                                    >
                                       <Video size={32}/> 
                                       <span className="text-[10px] font-black uppercase tracking-widest text-center">
                                         {selectedVideo ? selectedVideo.name.substring(0, 10) + '...' : 'Add Video'}
                                       </span>
                                    </button>
                                 </div>
                                 {(selectedImages.length > 0 || selectedVideo) && (
                                   <button 
                                     onClick={() => { setSelectedImages([]); setSelectedVideo(null); }}
                                     className="mt-3 text-xs font-bold text-red-500 hover:text-red-700 underline"
                                   >
                                     Clear Attachments
                                   </button>
                                 )}
                              </div>

                             <div className="mb-8">
                                 <label className="text-sm font-black text-[#64748b] uppercase tracking-widest mb-4 block">Written Review</label>
                                 <textarea
                                   rows={6}
                                   value={newReviewText}
                                   onChange={e => setNewReviewText(e.target.value)}
                                   placeholder="What did you like or dislike? What did you use this product for?"
                                   className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl px-6 py-5 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium text-lg text-[#1e293b] resize-none shadow-inner"
                                 />
                              </div>

                              <div className="flex justify-end pt-6 border-t border-gray-100">
                                <button
                                  onClick={async () => {
                                    const userInfo = localStorage.getItem('userInfo');
                                    if (!userInfo) {
                                      toast.error('Please log in to submit a review!');
                                      return;
                                    }
                                    if (newReviewRating === 0) {
                                      toast.error('Please select a star rating!');
                                      return;
                                    }
                                    if (!newReviewText.trim()) {
                                      toast.error('Please write your review!');
                                      return;
                                    }
                                    try {
                                      await axios.post(`/books/${id}/reviews`, {
                                        rating: newReviewRating,
                                        comment: newReviewText.trim()
                                      });
                                      toast.success('Review submitted successfully!');
                                      setIsReviewModalOpen(false);
                                      setNewReviewRating(0);
                                      setNewReviewHover(0);
                                      setNewHeadline('');
                                      setNewReviewText('');
                                      setSelectedImages([]);
                                      setSelectedVideo(null);
                                      
                                      // Reload book and reviews
                                      fetchBook();
                                    } catch (err) {
                                      console.error(err);
                                      toast.error(err.response?.data?.message || 'Failed to submit review');
                                    }
                                  }}
                                  className="bg-primary-500 text-white font-black text-lg py-5 px-12 rounded-2xl hover:bg-primary-600 shadow-[0_10px_30px_-5px_rgba(106,13,173,0.4)] transition-all transform hover:-translate-y-1 active:scale-95"
                                >
                                  Submit Review
                                </button>
                              </div>
                          </div>
                       </motion.div>
                     </motion.div>
                   )}
                 </AnimatePresence>

                 {/* Reviews Mapping */}
                 <div className="flex flex-col gap-12 bg-white p-8 sm:p-12 rounded-[3rem] border border-[#e2e8f0] shadow-sm">
                    <h4 className="font-black text-[#1e293b] text-2xl font-poppins pb-6 border-b border-gray-100 -mt-2">Top reviews from India</h4>
                    {reviews.map(review => {
                        const isHelpful = !!helpfulVotes[review.id];
                        const isReported = !!reportedReviews[review.id];

                        const handleHelpful = () => {
                          if (!isHelpful) {
                            setHelpfulVotes(prev => ({ ...prev, [review.id]: true }));
                            toast.success('Thanks for your feedback!');
                          }
                        };

                        const handleReport = () => {
                          if (!isReported) {
                            setReportedReviews(prev => ({ ...prev, [review.id]: true }));
                            toast.info('Review reported. We will look into it.');
                          }
                        };

                        return (
                       <div key={review.id} className="pb-12 border-b border-gray-100 last:border-0 last:pb-0">
                          
                          {/* User Header */}
                          <div className="flex items-center gap-4 mb-4">
                             <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-black text-xl shadow-md border-2 border-white">
                               {review.name.charAt(0)}
                             </div>
                             <span className="font-extrabold text-[#1e293b] text-lg">{review.name}</span>
                          </div>
                          
                          {/* Rating & Title Row */}
                          <div className="flex items-center gap-4 mb-2">
                             <div className="flex text-yellow-400 bg-[#f8fafc] p-1.5 rounded-lg border border-[#e2e8f0]">
                               {[1,2,3,4,5].map(st => <Star key={st} size={16} fill={st <= review.rating ? "currentColor" : "none"} className={st > review.rating ? "text-gray-300" : ""}/>)}
                             </div>
                             <h5 className="font-black text-[#1e293b] text-xl">{review.title}</h5>
                          </div>
                          
                          <div className="text-[#64748b] text-sm font-bold mb-4 uppercase tracking-widest">Reviewed on {review.date}</div>
                          
                          {review.verified && (
                             <div className="text-green-600 text-[11px] font-black uppercase tracking-widest mb-6 flex items-center gap-1.5 bg-green-50 w-fit px-3 py-1.5 rounded-lg border border-green-100">
                               <CheckCircle2 size={14}/> Verified Purchase
                             </div>
                          )}
                          
                          <p className="text-[#1e293b] text-lg leading-[1.8] font-medium mb-8 max-w-3xl">{review.text}</p>
                          
                          {/* Review Artifacts placeholder */}
                          {review.images.length > 0 && (
                             <div className="flex gap-4 mb-8">
                               {review.images.map((img, i) => (
                                 <img key={i} src={getOptimizedImageUrl(img, 300)} alt="Review" className="w-32 h-32 object-cover rounded-2xl border-2 border-gray-200 cursor-pointer hover:border-primary-500 hover:shadow-lg transition-all hover:scale-105"/>
                               ))}
                             </div>
                          )}

                           {/* Helpful & Report — functional */}
                           <div className="flex items-center gap-4">
                              <button
                                onClick={handleHelpful}
                                className={`flex items-center gap-2 border-2 px-5 py-2 rounded-xl text-sm font-black uppercase tracking-widest transition-all active:scale-95 ${isHelpful ? 'border-green-400 text-green-600 bg-green-50 cursor-default' : 'border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-[#1e293b] hover:border-gray-300'}`}
                              >
                                <ThumbsUp size={16} fill={isHelpful ? 'currentColor' : 'none'}/>
                                {isHelpful ? 'Helpful ✓' : 'Helpful'}
                              </button>
                              <button
                                onClick={handleReport}
                                className={`text-sm font-bold uppercase tracking-widest transition-colors px-3 py-2 rounded-xl ${isReported ? 'text-red-500 bg-red-50 border border-red-200 cursor-default' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
                              >
                                {isReported ? 'Reported ✓' : 'Report'}
                              </button>
                           </div>
                        </div>
                        );
                     })}
                 </div>

              </div>
           </div>
        </div>

      </div>

      {/* ======================================= */}
      {/* 7. RELATED PRODUCTS SLIDER (Dynamic Mock Injection) */}
      {/* ======================================= */}
      <div className="mt-20 pt-20 border-t border-[#e2e8f0] bg-white shadow-[0_-20px_40px_-20px_rgba(0,0,0,0.02)]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 pb-20">
          <BookSlider 
            title="Customers who viewed this item also viewed" 
            books={relatedBooks.filter(b => b._id !== book._id).slice(0, 4)} 
          />
        </div>
      </div>

      {/* 8. PDF VIEWER OVERLAY MODAL */}
      <AnimatePresence>
        {isPdfOpen && (
          <Suspense fallback={
            <div className="fixed inset-0 z-[110] bg-[#1e293b]/95 backdrop-blur-md flex flex-col items-center justify-center text-white font-bold animate-pulse font-poppins">
              <div className="w-12 h-12 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin mb-3"></div>
              <span>Opening Web Reader...</span>
            </div>
          }>
            <PdfPreviewModal
              book={book}
              setIsPdfOpen={setIsPdfOpen}
              handleBuyNow={handleBuyNow}
              previewPageNumber={previewPageNumber}
              setPreviewPageNumber={setPreviewPageNumber}
              previewNumPages={previewNumPages}
              setPreviewNumPages={setPreviewNumPages}
              previewScale={previewScale}
              setPreviewScale={setPreviewScale}
            />
          </Suspense>
        )}
      </AnimatePresence>

    </div>
  );
};

// Simple inline component for settings icon replacement
const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
)
const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
)

export default BookDetails;
