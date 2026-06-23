import { useState, useEffect } from 'react';
import { Calendar, Clock, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from '../../api/axios';

const AnnouncementBanner = () => {
  const [announcedBooks, setAnnouncedBooks] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerVideoUrl, setTrailerVideoUrl] = useState('');

  const fetchAnnouncements = async () => {
    try {
      const { data } = await axios.get('/books/announcement');
      if (Array.isArray(data)) {
        setAnnouncedBooks(data);
        if (data.length > 0 && activeSlide >= data.length) {
          setActiveSlide(0);
        }
      }
    } catch (err) {
      console.error('Error fetching book announcements:', err);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Countdown timer for active announcement
  useEffect(() => {
    const currentBook = announcedBooks[activeSlide];
    if (!currentBook || !currentBook.launchDate) return;

    const calculateTime = () => {
      const difference = +new Date(currentBook.launchDate) - +new Date();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        // Fetch new data when countdown finishes
        fetchAnnouncements();
        return;
      }
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);

    return () => clearInterval(timer);
  }, [announcedBooks, activeSlide]);

  // Auto slide effect
  useEffect(() => {
    if (announcedBooks.length <= 1 || showTrailer) return;
    const slideTimer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % announcedBooks.length);
    }, 8000);
    return () => clearInterval(slideTimer);
  }, [announcedBooks, showTrailer]);

  if (announcedBooks.length === 0) return null;

  const currentBook = announcedBooks[activeSlide];
  if (!currentBook) return null;

  const getEmbedUrl = (url) => {
    if (!url) return '';
    let videoId = '';
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      if (match && match[2].length === 11) {
        videoId = match[2];
      }
    } catch (e) {
      console.error('Failed to parse youtube url:', e);
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url;
  };

  const isYoutube = (url) => {
    return url && (url.includes('youtube.com') || url.includes('youtu.be'));
  };

  const handlePrev = () => {
    setActiveSlide((prev) => (prev === 0 ? announcedBooks.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveSlide((prev) => (prev === announcedBooks.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="w-full bg-[#f8fafc] py-12 px-4 sm:px-8 lg:px-12">
      <div className="max-w-[1400px] mx-auto bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a] rounded-3xl border border-white/[0.08] shadow-2xl relative overflow-hidden p-6 sm:p-10 lg:p-12 group">
        {/* Glowing Decorative Spheres */}
        <div className="absolute top-[-100px] left-[-100px] w-96 h-96 rounded-full bg-primary-500/15 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 rounded-full bg-purple-500/15 blur-[120px] pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 relative z-10">
          
          {/* Left Side: Info & Launch details */}
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left w-full lg:w-auto">
            {/* Cover Art Image with Play Hover Overlay */}
            <div 
              onClick={() => {
                if (currentBook.trailerUrl) {
                  setTrailerVideoUrl(currentBook.trailerUrl);
                  setShowTrailer(true);
                }
              }}
              className={`w-32 h-44 sm:w-36 sm:h-52 rounded-2xl overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.4)] border border-white/[0.1] shrink-0 transform hover:scale-105 transition-transform duration-300 mx-auto sm:mx-0 relative ${currentBook.trailerUrl ? 'cursor-pointer group/cover' : ''}`}
            >
              <img 
                src={currentBook.coverImage} 
                alt={currentBook.title} 
                className="w-full h-full object-cover"
              />
              {currentBook.trailerUrl && (
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/cover:opacity-100 flex flex-col items-center justify-center gap-2 transition-all duration-300 backdrop-blur-[2px]">
                  <div className="w-11 h-11 rounded-full bg-primary-500/90 text-white flex items-center justify-center shadow-lg transform scale-90 group-hover/cover:scale-100 transition-transform duration-300">
                    <span className="ml-1 text-sm">▶</span>
                  </div>
                  <span className="text-[9px] text-white font-bold uppercase tracking-wider">Play Trailer</span>
                </div>
              )}
            </div>
            
            <div className="space-y-3 flex-1">
              <div className="inline-flex items-center gap-1.5 bg-primary-500/15 border border-primary-500/30 px-3 py-1 rounded-full text-primary-400 text-[10px] font-black tracking-widest uppercase mb-1">
                <Sparkles size={10} className="animate-pulse" />
                Upcoming Exclusive Release
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-poppins font-black text-white leading-tight">
                {currentBook.title}
              </h2>
              
              <p className="text-slate-300 text-xs sm:text-sm font-semibold">
                By <span className="text-purple-300 font-bold">{currentBook.authorName}</span>
              </p>
              
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-lg">
                {currentBook.description}
              </p>

              {currentBook.trailerUrl && (
                <button
                  onClick={() => {
                    setTrailerVideoUrl(currentBook.trailerUrl);
                    setShowTrailer(true);
                  }}
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white text-xs font-bold px-4.5 py-2.5 rounded-xl border border-white/10 hover:border-white/20 transition-all shadow-md active:scale-95 mt-1"
                >
                  <span className="text-primary-400 text-sm">▶</span> Watch Trailer
                </button>
              )}
            </div>
          </div>

          {/* Right Side: Countdown Timer & Schedule Callout */}
          <div className="flex flex-col items-center lg:items-end gap-4 w-full lg:w-auto shrink-0 border-t lg:border-t-0 border-white/10 pt-6 lg:pt-0">
            <div className="text-slate-400 text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <Clock size={14} className="text-primary-400" />
              Launching In
            </div>
            
            {/* Countdown Boxes */}
            <div className="grid grid-cols-4 gap-3 max-w-xs sm:max-w-sm w-full">
              <div className="flex flex-col items-center justify-center bg-white/[0.03] border border-white/[0.06] rounded-2xl p-2 sm:p-4 aspect-square shadow-lg backdrop-blur-md min-w-[70px]">
                <span className="text-white text-lg sm:text-2xl md:text-3xl font-black font-poppins leading-none">{String(timeLeft.days).padStart(2, '0')}</span>
                <span className="text-slate-400 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider mt-1.5">Days</span>
              </div>
              
              <div className="flex flex-col items-center justify-center bg-white/[0.03] border border-white/[0.06] rounded-2xl p-2 sm:p-4 aspect-square shadow-lg backdrop-blur-md min-w-[70px]">
                <span className="text-white text-lg sm:text-2xl md:text-3xl font-black font-poppins leading-none">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="text-slate-400 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider mt-1.5">Hours</span>
              </div>
              
              <div className="flex flex-col items-center justify-center bg-white/[0.03] border border-white/[0.06] rounded-2xl p-2 sm:p-4 aspect-square shadow-lg backdrop-blur-md min-w-[70px]">
                <span className="text-white text-lg sm:text-2xl md:text-3xl font-black font-poppins leading-none">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="text-slate-400 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider mt-1.5">Mins</span>
              </div>
              
              <div className="flex flex-col items-center justify-center bg-white/[0.03] border border-white/[0.06] rounded-2xl p-2 sm:p-4 aspect-square shadow-lg backdrop-blur-md min-w-[70px]">
                <span className="text-white text-lg sm:text-2xl md:text-3xl font-black font-poppins leading-none">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="text-slate-400 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider mt-1.5">Secs</span>
              </div>
            </div>
            
            <div className="text-[10px] sm:text-xs text-slate-400 font-semibold flex items-center gap-1.5 mt-2 bg-white/[0.02] border border-white/[0.05] rounded-full px-4 py-1.5">
              <Calendar size={13} className="text-purple-400" />
              Target Release: {new Date(currentBook.launchDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
            </div>
          </div>
          
        </div>

        {/* Navigation Arrows */}
        {announcedBooks.length > 1 && (
          <>
            <button 
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center border border-white/10 hover:border-white/20 transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center border border-white/10 hover:border-white/20 transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Dot Indicators */}
        {announcedBooks.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {announcedBooks.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${idx === activeSlide ? 'w-5 bg-primary-500' : 'w-1.5 bg-white/20 hover:bg-white/40'}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Video Lightbox Modal */}
      {showTrailer && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          onClick={() => {
            setShowTrailer(false);
            setTrailerVideoUrl('');
          }}
        >
          <div 
            className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={() => {
                setShowTrailer(false);
                setTrailerVideoUrl('');
              }}
              className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center border border-white/15 transition-all text-sm font-semibold hover:scale-105"
            >
              ✕
            </button>
            
            {isYoutube(trailerVideoUrl) ? (
              <iframe 
                src={getEmbedUrl(trailerVideoUrl)} 
                title="Book Trailer" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowFullScreen
                className="w-full h-full"
              />
            ) : (
              <video 
                src={trailerVideoUrl} 
                controls 
                autoPlay 
                className="w-full h-full object-contain"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementBanner;
