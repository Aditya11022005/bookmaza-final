import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getOptimizedImageUrl } from '../../utils/image';

const dummySlides = [
  {
    id: 's1',
    title: 'The Great Indian Epic',
    subtitle: 'Dive into beautifully bound hardcovers of classic mythology.',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=2000&q=80',
    link: '/shop',
    buttonText: 'Shop the Classic'
  },
  {
    id: 's2',
    title: 'Listen Everywhere',
    subtitle: 'Discover our massive collection of high-quality premium Audiobooks.',
    image: 'https://images.unsplash.com/photo-1510515152865-c32f831349cd?auto=format&fit=crop&w=2000&q=80',
    link: '/format/audiobook',
    buttonText: 'Browse Audiobooks'
  },
  {
    id: 's3',
    title: 'Vast Ebook Library',
    subtitle: 'Carry thousands of titles in your pocket with our integrated Ebook reader.',
    image: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&w=2000&q=80',
    link: '/category/fiction',
    buttonText: 'Explore Fiction'
  }
];

const HeroSlider = ({ banners = [] }) => {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const slides = banners.length > 0 ? banners : dummySlides;

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [isHovered, nextSlide]);

  return (
    <div 
      className="relative w-full h-[420px] sm:h-[520px] md:h-[620px] lg:h-[720px] overflow-hidden bg-[#1e293b] select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence mode="sync">
        <motion.div
           key={current}
           initial={{ opacity: 0, scale: 1.04 }}
           animate={{ opacity: 1, scale: 1 }}
           exit={{ opacity: 0 }}
           transition={{ duration: 0.8, ease: 'easeOut' }}
           drag="x"
           dragConstraints={{ left: 0, right: 0 }}
           dragElastic={0.2}
           onDragEnd={(e, { offset }) => {
             if (offset.x < -50) nextSlide();
             else if (offset.x > 50) prevSlide();
           }}
           className="absolute inset-0 cursor-grab active:cursor-grabbing"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 via-primary-800/60 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-transparent to-transparent z-10 opacity-50 pointer-events-none" />
          
          {slides[current].videoUrl ? (
            <video
              src={slides[current].videoUrl}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />
          ) : (
            <img
              src={getOptimizedImageUrl(slides[current].image || slides[current].coverImage, 1200)}
              alt="Hero Background"
              className="w-full h-full object-cover pointer-events-none"
              draggable="false"
              fetchPriority={current === 0 ? "high" : "auto"}
              loading={current === 0 ? "eager" : "lazy"}
            />
          )}
          
          {/* Content Block */}
          <div className="absolute inset-0 z-20 flex items-center pointer-events-none">
            <div className="w-full px-5 sm:px-10 lg:px-16 max-w-7xl mx-auto">
               <div className="max-w-xs sm:max-w-lg md:max-w-2xl pointer-events-auto">
                 <motion.div
                   initial={{ y: 20, opacity: 0 }}
                   animate={{ y: 0, opacity: 1 }}
                   transition={{ delay: 0.2, duration: 0.5 }}
                   className="inline-block bg-primary-100 text-primary-700 font-bold px-3 py-1 rounded-full text-[10px] sm:text-xs uppercase tracking-widest mb-4 sm:mb-6 shadow-sm border border-primary-200"
                 >
                    Featured Collection
                 </motion.div>
                 
                 <motion.h1 
                   initial={{ y: 20, opacity: 0 }}
                   animate={{ y: 0, opacity: 1 }}
                   transition={{ delay: 0.3, duration: 0.5 }}
                   className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-5 leading-[1.1] tracking-tight font-poppins"
                 >
                   {slides[current].title}
                 </motion.h1>
                 
                 <motion.p 
                   initial={{ y: 20, opacity: 0 }}
                   animate={{ y: 0, opacity: 1 }}
                   transition={{ delay: 0.4, duration: 0.5 }}
                   className="text-sm sm:text-lg text-primary-50 mb-6 sm:mb-8 font-medium leading-relaxed max-w-sm sm:max-w-xl"
                 >
                   {slides[current].subtitle}
                 </motion.p>
                 
                 <motion.div
                   initial={{ y: 20, opacity: 0 }}
                   animate={{ y: 0, opacity: 1 }}
                   transition={{ delay: 0.5, duration: 0.5 }}
                   className="flex flex-col sm:flex-row gap-3"
                 >
                   <Link
                     to={slides[current].link || '/shop'}
                     className="bg-gradient-to-r from-primary-500 to-primary-400 hover:from-primary-600 hover:to-primary-500 text-white px-6 sm:px-10 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base shadow-[0_8px_25px_-5px_rgba(106,13,173,0.5)] transition-all hover:-translate-y-0.5 text-center border border-white/10"
                   >
                     {slides[current].buttonText || 'Explore Now'}
                   </Link>
                   <Link
                     to="/about"
                     className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-6 sm:px-10 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base transition-colors text-center"
                   >
                     Learn More
                   </Link>
                 </motion.div>
               </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Nav Arrows — always visible on mobile, hover on desktop */}
      <button
        onClick={prevSlide}
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 bg-white/15 hover:bg-white/30 backdrop-blur-md border border-white/20 p-2 sm:p-3 rounded-full text-white transition-all sm:opacity-0 sm:group-hover:opacity-100 opacity-80"
        aria-label="Previous slide"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 bg-white/15 hover:bg-white/30 backdrop-blur-md border border-white/20 p-2 sm:p-3 rounded-full text-white transition-all sm:opacity-0 sm:group-hover:opacity-100 opacity-80"
        aria-label="Next slide"
      >
        <ChevronRight size={20} />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-5 sm:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3 z-30">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1.5 sm:h-2 rounded-full transition-all duration-500 shadow-sm ${current === i ? 'bg-primary-300 w-7 sm:w-10' : 'bg-white/40 w-2 sm:w-3 hover:bg-white/80'}`}
          />
        ))}
      </div>
    </div>
  );
};
export default HeroSlider;
