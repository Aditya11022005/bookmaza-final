import { Link } from 'react-router-dom';

const PromotionalBanner = ({ banner }) => {
  // Fallback static details if no promo banner is configured
  const title = banner?.title || "Summer Reading Festival";
  const subtitle = banner?.subtitle || "Get up to 40% OFF on all Fiction and exclusive Audiobooks. Dive into a different world today.";
  const image = banner?.image || "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1600&q=80";
  const link = banner?.link || "/shop";

  return (
    <div className="w-full bg-[#1e293b] rounded-2xl overflow-hidden relative shadow-[0_15px_35px_-10px_rgba(106,13,173,0.25)] my-10 sm:my-16 group">
      <div className="absolute inset-0 bg-gradient-to-r from-primary-900/95 via-primary-600/80 to-[#1e293b]/50 z-10"/>
      <img
        src={image}
        className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-[2s] ease-out"
        alt="Promotional background"
      />
      
      <div className="relative z-20 p-7 sm:p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
         <div className="text-white max-w-xl text-center md:text-left">
            <span className="inline-block bg-primary-100/20 backdrop-blur-md border border-primary-200/30 text-white font-bold px-3 py-1 rounded-full text-[10px] sm:text-xs uppercase tracking-widest mb-4 sm:mb-6 shadow-sm">
              Limited Time Offer
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-3 sm:mb-4 leading-[1.15] text-transparent bg-clip-text bg-gradient-to-r from-white to-primary-100 font-poppins">
              {title}
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-primary-100 font-normal leading-relaxed">
              {subtitle}
            </p>
         </div>
         <Link
           to={link}
           className="bg-white hover:bg-primary-50 text-primary-600 font-bold px-7 sm:px-10 py-3 sm:py-4 rounded-xl text-sm sm:text-base shadow-[0_8px_20px_rgba(106,13,173,0.3)] transition-all transform hover:-translate-y-1 whitespace-nowrap flex-shrink-0"
         >
            Claim Your Offer
         </Link>
      </div>
    </div>
  );
};

export default PromotionalBanner;
