import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { 
  Play, 
  Pause, 
  FastForward, 
  Rewind, 
  Clock, 
  Music, 
  Headphones,
  SkipForward,
  SkipBack,
  ListMusic,
  Bookmark,
  Volume2
} from 'lucide-react';
import { toast } from 'sonner';
import { resolveMediaUrl } from '../utils/image';

const formatTime = (seconds) => {
  if (isNaN(seconds)) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatTimerRemaining = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};

const AudioPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [currentChapterIdx, setCurrentChapterIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  
  // Sleep Timer states
  const [sleepTimer, setSleepTimer] = useState(0);
  const [showSleepMenu, setShowSleepMenu] = useState(false);
  
  const audioRef = useRef(null);
  const initialProgressRef = useRef(0);

  // Fetch book and progress
  useEffect(() => {
    const fetchBookAndProgress = async () => {
      try {
        const { data: bookData } = await axios.get(`/books/${id}`);
        setBook(bookData);

        // Populate chapters
        const bookChapters = (bookData.formats?.audiobook?.chapters || []).map(ch => ({
          ...ch,
          fileUrl: resolveMediaUrl(ch.fileUrl)
        }));
        if (bookChapters.length > 0) {
          setChapters(bookChapters);
        } else {
          setChapters([{ title: 'Full Audiobook / Introduction', fileUrl: resolveMediaUrl(bookData.formats?.audiobook?.fileUrl || '') }]);
        }

        // Restore saved chapter index
        const savedChapter = localStorage.getItem(`audiobook_chapter_${id}`);
        const chapterIdx = savedChapter ? parseInt(savedChapter, 10) : 0;
        setCurrentChapterIdx(chapterIdx >= 0 && chapterIdx < (bookChapters.length || 1) ? chapterIdx : 0);

        // Restore chapter page progress position
        const { data: progressData } = await axios.get(`/progress/${id}/audiobook`);
        if (progressData && progressData.position > 0) {
          setProgress(progressData.position);
          initialProgressRef.current = progressData.position;
          if (audioRef.current) {
            audioRef.current.currentTime = progressData.position;
          }
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to load audiobook.');
        navigate('/library');
      }
    };
    fetchBookAndProgress();
  }, [id, navigate]);

  // Handle current chapter loading
  useEffect(() => {
    if (audioRef.current && chapters.length > 0) {
      const currentChapter = chapters[currentChapterIdx];
      if (currentChapter && currentChapter.fileUrl) {
        const wasPlaying = isPlaying;
        audioRef.current.src = resolveMediaUrl(currentChapter.fileUrl);
        audioRef.current.load();
        audioRef.current.playbackRate = playbackRate;
        
        // Restore progress on first load, or set back to 0
        if (initialProgressRef.current > 0) {
          audioRef.current.currentTime = initialProgressRef.current;
          initialProgressRef.current = 0; // only restore once
        } else {
          audioRef.current.currentTime = 0;
        }

        if (wasPlaying) {
          audioRef.current.play()
            .then(() => setIsPlaying(true))
            .catch(err => console.error(err));
        }
      }
    }
  }, [currentChapterIdx, chapters]);

  // Sync progress to server every 10 seconds of playback
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying && duration > 0 && audioRef.current) {
        axios.post('/progress', {
          bookId: id,
          format: 'audiobook',
          position: audioRef.current.currentTime,
          percentage: Math.round((audioRef.current.currentTime / duration) * 100)
        }).catch(err => console.error("Audio sync failed", err));
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [isPlaying, duration, id]);

  // Sleep Timer countdown listener
  useEffect(() => {
    let intervalId;
    if (isPlaying && sleepTimer > 0) {
      intervalId = setInterval(() => {
        setSleepTimer(prev => {
          if (prev <= 1) {
            if (audioRef.current) {
              audioRef.current.pause();
            }
            setIsPlaying(false);
            toast.info("Sleep timer finished. Playback paused.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPlaying, sleepTimer]);

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => console.error(err));
    }
    setIsPlaying(!isPlaying);
  };

  const cycleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2, 0.75];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const newSpeed = speeds[nextIdx];
    setPlaybackRate(newSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    }
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
    setProgress(time);
  };

  const selectChapter = (index) => {
    setCurrentChapterIdx(index);
    localStorage.setItem(`audiobook_chapter_${id}`, index);
    setIsPlaying(true);
    setProgress(0);
    initialProgressRef.current = 0; // reset restored progress
  };

  const handleNextChapter = () => {
    if (currentChapterIdx < chapters.length - 1) {
      selectChapter(currentChapterIdx + 1);
    } else {
      toast.info("You've reached the last chapter.");
    }
  };

  const handlePrevChapter = () => {
    if (currentChapterIdx > 0) {
      selectChapter(currentChapterIdx - 1);
    }
  };

  const handleEnded = () => {
    if (currentChapterIdx < chapters.length - 1) {
      const nextIdx = currentChapterIdx + 1;
      setCurrentChapterIdx(nextIdx);
      localStorage.setItem(`audiobook_chapter_${id}`, nextIdx);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  if (!book) return <div className="flex justify-center items-center min-h-[50vh] animate-pulse text-xl text-slate-400 font-poppins">Loading Audio Player & Syncing Position...</div>;

  const currentChapter = chapters[currentChapterIdx] || { title: 'Intro' };
  const sleepTimerOptions = [
    { label: 'Off', value: 0 },
    { label: '5 min', value: 5 * 60 },
    { label: '15 min', value: 15 * 60 },
    { label: '30 min', value: 30 * 60 },
    { label: '45 min', value: 45 * 60 },
    { label: '60 min', value: 60 * 60 },
  ];

  return (
    <div className="max-w-5xl mx-auto my-6 md:my-12 grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 w-full">
      
      {/* Left panel: player, controls, details */}
      <div className="lg:col-span-7 bg-[#0d1526]/90 border border-white/[0.06] rounded-[2.5rem] p-6 md:p-10 flex flex-col items-center shadow-2xl relative overflow-hidden backdrop-blur-md">
        
        {/* Subtle blur decoration */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-500/10 rounded-full blur-[80px] -z-10" />

        {/* Cover image area */}
        <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-3xl overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.5)] mb-6 border border-white/10 group">
          <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end justify-center p-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] font-black uppercase tracking-wider text-white bg-black/60 px-3 py-1 rounded-full border border-white/15 flex items-center gap-1.5"><Volume2 size={12}/> High Quality Audio</span>
          </div>
        </div>

        {/* Text information */}
        <h2 className="text-2xl md:text-3xl font-black text-center mb-1 text-white font-poppins tracking-tight">{book.title}</h2>
        <p className="text-primary-400 font-extrabold text-sm mb-4 tracking-wider uppercase">{book.authorName || book.author?.name}</p>

        {/* Chapter Title Badge */}
        <div className="bg-white/5 border border-white/10 rounded-full px-4 py-2 flex items-center gap-2 mb-8 shadow-sm">
          <Headphones size={14} className="text-primary-400 animate-bounce-sm" />
          <span className="text-xs font-bold text-slate-300">Playing: {currentChapter.title}</span>
        </div>

        {/* Hidden Audio element */}
        <audio 
          ref={audioRef}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          controlsList="nodownload"
          onContextMenu={(e) => e.preventDefault()}
        />

        {/* Timeline Progress Slider */}
        <div className="w-full space-y-2 mb-8">
          <div className="w-full flex items-center justify-between text-xs font-bold font-mono text-slate-400">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max={duration || 100} 
            value={progress}
            onChange={handleSeek}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500 focus:outline-none transition-all hover:bg-slate-750"
          />
        </div>

        {/* Action Controls */}
        <div className="w-full flex items-center justify-between mt-2">
          
          {/* Playback speed selector */}
          <button 
            onClick={cycleSpeed} 
            className="text-xs font-black text-slate-400 hover:text-white transition bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/10"
          >
            {playbackRate}x Speed
          </button>

          {/* Core Navigation controls */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button 
              onClick={handlePrevChapter}
              disabled={currentChapterIdx === 0}
              className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition border border-white/5 disabled:opacity-30 disabled:pointer-events-none"
              title="Previous Chapter"
            >
              <SkipBack size={18} className="text-white" />
            </button>

            <button 
              onClick={() => { if(audioRef.current) audioRef.current.currentTime -= 15; }}
              className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition border border-white/5"
              title="Rewind 15s"
            >
              <Rewind size={20} className="text-slate-300" />
            </button>
            
            <button 
              onClick={togglePlay}
              className="bg-primary-600 hover:bg-primary-500 w-16 h-16 rounded-full flex items-center justify-center transition shadow-lg shadow-primary-600/30 hover:shadow-primary-600/60 transform hover:scale-105 active:scale-95"
            >
              {isPlaying ? <Pause size={28} className="text-white" fill="currentColor" /> : <Play size={28} className="text-white ml-1.5" fill="currentColor" />}
            </button>

            <button 
              onClick={() => { if(audioRef.current) audioRef.current.currentTime += 15; }}
              className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition border border-white/5"
              title="Fast Forward 15s"
            >
              <FastForward size={20} className="text-slate-300" />
            </button>

            <button 
              onClick={handleNextChapter}
              disabled={currentChapterIdx === chapters.length - 1}
              className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition border border-white/5 disabled:opacity-30 disabled:pointer-events-none"
              title="Next Chapter"
            >
              <SkipForward size={18} className="text-white" />
            </button>
          </div>

          {/* Sleep Timer Selector */}
          <div className="relative">
            <button 
              onClick={() => setShowSleepMenu(!showSleepMenu)}
              className={`p-2 rounded-xl transition flex items-center gap-1.5 border text-xs font-bold ${sleepTimer > 0 ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-400 hover:text-white'}`}
              title="Sleep Timer"
            >
              <Clock size={16} />
              {sleepTimer > 0 ? formatTimerRemaining(sleepTimer) : 'Timer'}
            </button>

            {showSleepMenu && (
              <div className="absolute right-0 bottom-full mb-3 bg-[#0f172a] border border-white/15 rounded-2xl p-2 shadow-2xl z-20 min-w-[140px] flex flex-col gap-1">
                <div className="px-2.5 py-1.5 text-[9px] font-black uppercase text-slate-500 tracking-wider border-b border-white/5 mb-1">Stop Playback In:</div>
                {sleepTimerOptions.map(opt => (
                  <button
                    key={opt.label}
                    onClick={() => {
                      setSleepTimer(opt.value);
                      setShowSleepMenu(false);
                      if (opt.value > 0) {
                        toast.success(`Sleep timer set for ${opt.label}.`);
                      } else {
                        toast.info("Sleep timer disabled.");
                      }
                    }}
                    className={`px-3 py-1.5 text-left text-xs font-bold rounded-lg transition-colors ${sleepTimer === opt.value ? 'bg-primary-600 text-white' : 'text-slate-300 hover:bg-white/5'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Right panel: Playlist / Chapters selector */}
      <div className="lg:col-span-5 bg-[#0d1526]/90 border border-white/[0.06] rounded-[2.5rem] p-6 md:p-8 flex flex-col shadow-2xl backdrop-blur-md max-h-[560px] overflow-hidden">
        <div className="flex items-center gap-2.5 mb-6 border-b border-white/5 pb-4 shrink-0">
          <ListMusic className="text-primary-400" size={22} />
          <div>
            <h3 className="text-lg font-black text-white font-poppins">Chapter List</h3>
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{chapters.length} Audio files available</p>
          </div>
        </div>

        {/* Scrollable list of chapters */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
          {chapters.map((ch, idx) => {
            const isActive = idx === currentChapterIdx;
            return (
              <div 
                key={idx}
                onClick={() => selectChapter(idx)}
                className={`p-3.5 rounded-2xl border transition-all duration-300 flex items-center justify-between cursor-pointer group ${isActive ? 'bg-primary-600/10 border-primary-500/30' : 'bg-white/[0.01] border-white/5 hover:border-white/10 hover:bg-white/[0.03]'}`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${isActive ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'bg-white/5 text-slate-400 group-hover:bg-white/10'}`}>
                    {isActive && isPlaying ? (
                      <span className="flex gap-[2px] items-end h-3">
                        <span className="w-[3px] bg-white rounded-full animate-audio-bar-1 h-3" />
                        <span className="w-[3px] bg-white rounded-full animate-audio-bar-2 h-1.5" />
                        <span className="w-[3px] bg-white rounded-full animate-audio-bar-3 h-2" />
                      </span>
                    ) : (
                      <Music size={14} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] font-black tracking-widest text-slate-500 uppercase block mb-0.5">Chapter {idx + 1}</span>
                    <span className={`text-sm font-bold block truncate transition-colors ${isActive ? 'text-primary-400' : 'text-slate-200 group-hover:text-white'}`}>{ch.title}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isActive ? (
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary-400 bg-primary-500/10 px-2 py-1 rounded-md border border-primary-500/20">Active</span>
                  ) : (
                    <span className="text-xs font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">Play <Play size={10} fill="currentColor"/></span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default AudioPlayer;
