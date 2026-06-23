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
    <div className="w-full bg-[#f8fafc] py-12 px-4 sm:px-8 lg:px-12">
      <div className="max-w-[1400px] mx-auto bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a] rounded-3xl border border-white/[0.08] shadow-2xl relative overflow-hidden p-6 sm:p-10 lg:p-12">
        {/* Glowing Decorative Spheres */}
        <div className="absolute top-[-100px] left-[-100px] w-96 h-96 rounded-full bg-primary-500/15 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 rounded-full bg-purple-500/15 blur-[120px] pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 relative z-10">
          
          {/* Left Side: Info & Launch details */}
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left w-full lg:w-auto">
            {/* Cover Art Image */}
            <div className="w-32 h-44 sm:w-36 sm:h-52 rounded-2xl overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.4)] border border-white/[0.1] shrink-0 transform hover:scale-105 transition-transform duration-300 mx-auto sm:mx-0">
              <img 
                src={announcedBook.coverImage} 
                alt={announcedBook.title} 
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="space-y-3 flex-1">
              <div className="inline-flex items-center gap-1.5 bg-primary-500/15 border border-primary-500/30 px-3 py-1 rounded-full text-primary-400 text-[10px] font-black tracking-widest uppercase mb-1">
                <Sparkles size={10} className="animate-pulse" />
                Upcoming Exclusive Release
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-poppins font-black text-white leading-tight">
                {announcedBook.title}
              </h2>
              
              <p className="text-slate-300 text-xs sm:text-sm font-semibold">
                By <span className="text-purple-300 font-bold">{announcedBook.authorName}</span>
              </p>
              
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-lg">
                {announcedBook.description}
              </p>
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
              Target Release: {new Date(announcedBook.launchDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBanner;
