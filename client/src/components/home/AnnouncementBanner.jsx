import { useState, useEffect } from 'react';
import { Calendar, Clock, Sparkles } from 'lucide-react';
import axios from '../../api/axios';

const AnnouncementBanner = () => {
  const [announcedBook, setAnnouncedBook] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isLaunched, setIsLaunched] = useState(false);

  const calculateTimeLeft = (targetDate) => {
    const difference = +new Date(targetDate) - +new Date();
    if (difference <= 0) {
      setIsLaunched(true);
      return;
    }
    setTimeLeft({
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60)
    });
  };

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const { data } = await axios.get('/books/announcement');
        if (data) {
          setAnnouncedBook(data);
          calculateTimeLeft(data.launchDate);
        }
      } catch (err) {
        console.error('Error fetching book announcement:', err);
      }
    };
    fetchAnnouncement();
  }, []);

  useEffect(() => {
    if (!announcedBook || isLaunched) return;

    const timer = setInterval(() => {
      calculateTimeLeft(announcedBook.launchDate);
    }, 1000);

    return () => clearInterval(timer);
  }, [announcedBook, isLaunched]);

  if (!announcedBook || isLaunched) return null;

  return (
    <div className="w-full bg-gradient-to-r from-[#0b1329] via-[#1e1b4b] to-[#0b1329] border-b border-primary-900/40 relative overflow-hidden py-10 px-4 sm:px-8 lg:px-12">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-[-50px] left-[-50px] w-72 h-72 rounded-full bg-primary-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-50px] right-[-50px] w-72 h-72 rounded-full bg-purple-600/10 blur-[100px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
        
        {/* Left Side: Info & Launch details */}
        <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left max-w-2xl">
          {/* Cover Art Image */}
          <div className="w-28 h-40 rounded-xl overflow-hidden shadow-2xl shadow-primary-950/50 border border-white/[0.08] shrink-0 transform hover:scale-105 transition-transform duration-300">
            <img 
              src={announcedBook.coverImage} 
              alt={announcedBook.title} 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-primary-500/10 border border-primary-500/25 px-2.5 py-1 rounded-full text-primary-400 text-[10px] font-black tracking-widest uppercase mb-1">
              <Sparkles size={10} className="animate-pulse" />
              Upcoming Exclusive Release
            </div>
            
            <h2 className="text-xl sm:text-2xl font-poppins font-black text-white leading-tight">
              {announcedBook.title}
            </h2>
            
            <p className="text-slate-400 text-xs sm:text-sm font-semibold">
              By <span className="text-purple-300 font-bold">{announcedBook.authorName}</span>
            </p>
            
            <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed max-w-lg">
              {announcedBook.description}
            </p>
          </div>
        </div>

        {/* Right Side: Countdown Timer & Schedule Callout */}
        <div className="flex flex-col items-center md:items-end gap-3 shrink-0">
          <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
            <Clock size={12} className="text-primary-400" />
            Launching In
          </div>
          
          {/* Countdown Boxes */}
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center justify-center bg-white/[0.03] border border-white/[0.06] rounded-xl w-14 h-14 sm:w-16 sm:h-16 shadow-lg backdrop-blur-md">
              <span className="text-white text-lg sm:text-xl font-bold font-poppins">{String(timeLeft.days).padStart(2, '0')}</span>
              <span className="text-slate-500 text-[9px] font-black uppercase tracking-wider mt-0.5">Days</span>
            </div>
            <span className="text-white font-bold text-lg animate-pulse">:</span>
            
            <div className="flex flex-col items-center justify-center bg-white/[0.03] border border-white/[0.06] rounded-xl w-14 h-14 sm:w-16 sm:h-16 shadow-lg backdrop-blur-md">
              <span className="text-white text-lg sm:text-xl font-bold font-poppins">{String(timeLeft.hours).padStart(2, '0')}</span>
              <span className="text-slate-500 text-[9px] font-black uppercase tracking-wider mt-0.5">Hrs</span>
            </div>
            <span className="text-white font-bold text-lg animate-pulse">:</span>
            
            <div className="flex flex-col items-center justify-center bg-white/[0.03] border border-white/[0.06] rounded-xl w-14 h-14 sm:w-16 sm:h-16 shadow-lg backdrop-blur-md">
              <span className="text-white text-lg sm:text-xl font-bold font-poppins">{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span className="text-slate-500 text-[9px] font-black uppercase tracking-wider mt-0.5">Mins</span>
            </div>
            <span className="text-white font-bold text-lg animate-pulse">:</span>
            
            <div className="flex flex-col items-center justify-center bg-white/[0.03] border border-white/[0.06] rounded-xl w-14 h-14 sm:w-16 sm:h-16 shadow-lg backdrop-blur-md">
              <span className="text-white text-lg sm:text-xl font-bold font-poppins">{String(timeLeft.seconds).padStart(2, '0')}</span>
              <span className="text-slate-500 text-[9px] font-black uppercase tracking-wider mt-0.5">Secs</span>
            </div>
          </div>
          
          <div className="text-[10px] text-slate-500 font-semibold flex items-center gap-1 mt-1">
            <Calendar size={11} />
            Target Release: {new Date(announcedBook.launchDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default AnnouncementBanner;
