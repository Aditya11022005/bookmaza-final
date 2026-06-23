import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Megaphone, Plus, Edit, Trash2, X, Calendar, Clock, 
  Search, Check, AlertCircle, Sparkles, ChevronRight, FileText, ArrowRight
} from 'lucide-react';
import axios from '../../api/axios';
import { toast } from 'sonner';

const AdminAnnouncements = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form states
  const [selectedBookId, setSelectedBookId] = useState('');
  const [launchDate, setLaunchDate] = useState('');
  const [launchHour, setLaunchHour] = useState('12');
  const [launchMinute, setLaunchMinute] = useState('00');
  const [launchAmpm, setLaunchAmpm] = useState('PM');
  const [editingBook, setEditingBook] = useState(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookSearch, setBookSearch] = useState('');

  // Active announcement countdown state
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isTimeUp, setIsTimeUp] = useState(false);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/books?all=true');
      setBooks(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Filter books flagged as announced
  const announcements = books.filter(b => b.isAnnounced);
  
  // Sort announcements so upcoming ones are first, ordered by nearest launch date
  const upcomingAnnouncements = announcements
    .filter(b => b.launchDate && new Date(b.launchDate) > new Date())
    .sort((a, b) => new Date(a.launchDate) - new Date(b.launchDate));
  
  const pastAnnouncements = announcements
    .filter(b => !b.launchDate || new Date(b.launchDate) <= new Date())
    .sort((a, b) => new Date(b.launchDate) - new Date(a.launchDate));

  const activeAnnouncement = upcomingAnnouncements[0] || null;

  // Countdown timer for active announcement
  useEffect(() => {
    if (!activeAnnouncement || !activeAnnouncement.launchDate) return;

    const calculateTimeLeft = () => {
      const difference = +new Date(activeAnnouncement.launchDate) - +new Date();
      if (difference <= 0) {
        setIsTimeUp(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        // Automatically refresh data when countdown hits 0 to update status
        fetchBooks();
        return;
      }
      setIsTimeUp(false);
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [activeAnnouncement]);

  const openScheduleModal = () => {
    setEditingBook(null);
    setSelectedBookId('');
    setLaunchDate('');
    setLaunchHour('12');
    setLaunchMinute('00');
    setLaunchAmpm('PM');
    setBookSearch('');
    setIsModalOpen(true);
  };

  const openEditModal = (book) => {
    setEditingBook(book);
    setSelectedBookId(book._id);
    if (book.launchDate) {
      const dateObj = new Date(book.launchDate);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      setLaunchDate(`${year}-${month}-${day}`);
      
      const hours24 = dateObj.getHours();
      const minutesVal = String(dateObj.getMinutes()).padStart(2, '0');
      let hours12 = hours24 % 12;
      hours12 = hours12 === 0 ? 12 : hours12;
      const ampmVal = hours24 >= 12 ? 'PM' : 'AM';
      
      setLaunchHour(String(hours12));
      setLaunchMinute(minutesVal);
      setLaunchAmpm(ampmVal);
    } else {
      setLaunchDate('');
      setLaunchHour('12');
      setLaunchMinute('00');
      setLaunchAmpm('PM');
    }
    setIsModalOpen(true);
  };

  const handleSaveAnnouncement = async (e) => {
    e.preventDefault();
    if (!selectedBookId || !launchDate) {
      toast.error('Please select a book and launch date');
      return;
    }

    // Combine local date and time to local timezone Date object
    const [year, month, day] = launchDate.split('-').map(Number);
    let hours24 = parseInt(launchHour, 10);
    if (isNaN(hours24) || hours24 < 1 || hours24 > 12) hours24 = 12;
    const minutesVal = parseInt(launchMinute, 10) || 0;

    if (launchAmpm === 'PM' && hours24 < 12) hours24 += 12;
    if (launchAmpm === 'AM' && hours24 === 12) hours24 = 0;

    const combinedDate = new Date(year, month - 1, day, hours24, minutesVal);

    if (combinedDate <= new Date()) {
      toast.error('Launch date and time must be in the future');
      return;
    }

    setSaving(true);
    const toastId = toast.loading(editingBook ? 'Updating announcement...' : 'Scheduling announcement...');
    try {
      // Schedule the book: set isAnnounced to true, update launch date, and set isPublished to false (draft)
      await axios.put(`/books/${selectedBookId}`, {
        isAnnounced: true,
        launchDate: combinedDate.toISOString(),
        isPublished: false
      });
      
      toast.success(editingBook ? 'Announcement updated successfully!' : 'Launch announcement scheduled!', { id: toastId });
      setIsModalOpen(false);
      fetchBooks();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save announcement', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelAnnouncement = async (bookId) => {
    if (!window.confirm('Are you sure you want to cancel this announcement? The book will remain as a draft.')) return;
    
    const toastId = toast.loading('Canceling announcement...');
    try {
      await axios.put(`/books/${bookId}`, {
        isAnnounced: false
      });
      toast.success('Launch announcement canceled successfully!', { id: toastId });
      fetchBooks();
    } catch (err) {
      console.error(err);
      toast.error('Failed to cancel announcement', { id: toastId });
    }
  };

  // Candidates for new announcement (not already announced, prioritized drafts/unpublished)
  const candidateBooks = books
    .filter(b => !b.isAnnounced && b._id !== editingBook?._id)
    .filter(b => b.title.toLowerCase().includes(bookSearch.toLowerCase()) || b.authorName.toLowerCase().includes(bookSearch.toLowerCase()));

  // Filter for the main announcement list search
  const filteredAnnouncements = announcements.filter(b => 
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.authorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-white font-inter">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-poppins font-black text-white tracking-tight flex items-center gap-2">
            <Megaphone className="text-primary-500" />
            Launch Announcements
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-0.5">Manage upcoming book releases and the homepage countdown banner</p>
        </div>
        <button 
          onClick={openScheduleModal}
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-primary-600/30"
        >
          <Plus size={18} />
          Schedule Launch
        </button>
      </div>

      {/* Active Announcement / Banner Live Preview */}
      {activeAnnouncement && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#0b1329] via-[#161a35] to-[#0b1329] border border-primary-500/20 p-6 rounded-2xl relative overflow-hidden"
        >
          {/* Decorative glows */}
          <div className="absolute top-[-50px] left-[-50px] w-48 h-48 rounded-full bg-primary-500/10 blur-[60px] pointer-events-none" />
          <div className="absolute bottom-[-50px] right-[-50px] w-48 h-48 rounded-full bg-purple-500/10 blur-[60px] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-6 items-start lg:items-center">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              {/* Cover Art */}
              <div className="w-20 h-28 rounded-xl overflow-hidden shadow-xl border border-white/[0.08] shrink-0">
                <img 
                  src={activeAnnouncement.coverImage} 
                  alt={activeAnnouncement.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1 bg-primary-500/15 border border-primary-500/30 px-2 py-0.5 rounded-full text-primary-400 text-[9px] font-black uppercase tracking-wider">
                  <Sparkles size={10} className="animate-pulse text-primary-400" />
                  Active Homepage Countdown Banner
                </div>
                <h3 className="text-xl font-bold text-white leading-tight">{activeAnnouncement.title}</h3>
                <p className="text-slate-400 text-xs font-semibold">By <span className="text-purple-300 font-bold">{activeAnnouncement.authorName}</span></p>
                <p className="text-slate-500 text-xs line-clamp-2 max-w-xl leading-relaxed">{activeAnnouncement.description}</p>
              </div>
            </div>

            {/* Countdown Display */}
            <div className="flex flex-col items-center lg:items-end gap-2.5 w-full lg:w-auto shrink-0 border-t lg:border-t-0 border-white/5 pt-4 lg:pt-0">
              <span className="text-slate-500 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <Clock size={11} className="text-primary-400" />
                Live Timer
              </span>
              
              <div className="flex items-center gap-1.5">
                {[
                  { value: timeLeft.days, label: 'D' },
                  { value: timeLeft.hours, label: 'H' },
                  { value: timeLeft.minutes, label: 'M' },
                  { value: timeLeft.seconds, label: 'S' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <div className="flex flex-col items-center justify-center bg-white/[0.02] border border-white/[0.06] rounded-xl w-12 h-12">
                      <span className="text-white text-md font-extrabold leading-none">{String(item.value).padStart(2, '0')}</span>
                      <span className="text-slate-600 text-[8px] font-bold mt-0.5">{item.label}</span>
                    </div>
                    {idx < 3 && <span className="text-slate-700 font-black text-sm">:</span>}
                  </div>
                ))}
              </div>
              
              <div className="flex items-center gap-2 mt-1">
                <button 
                  onClick={() => openEditModal(activeAnnouncement)}
                  className="px-3 py-1 bg-white/5 hover:bg-white/10 hover:text-white border border-white/10 rounded-lg text-[11px] font-bold transition-all"
                >
                  Reschedule
                </button>
                <button 
                  onClick={() => handleCancelAnnouncement(activeAnnouncement._id)}
                  className="px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg text-[11px] font-bold transition-all border border-rose-500/15"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main List Section */}
      <div className="bg-[#0d1526] border border-white/[0.06] rounded-2xl overflow-hidden">
        {/* List Controls */}
        <div className="p-5 border-b border-white/[0.06] flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search announcements..."
              className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:border-primary-500/50"
            />
          </div>
          
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary-500"></span> Upcoming Releases ({upcomingAnnouncements.length})
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 ml-3"></span> Launched ({pastAnnouncements.length})
          </div>
        </div>

        {/* Content Table */}
        {loading ? (
          <div className="py-20 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : announcements.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-medium flex flex-col items-center justify-center">
            <Megaphone size={40} className="mb-3 opacity-20" />
            <p>No launch announcements scheduled yet.</p>
            <button 
              onClick={openScheduleModal}
              className="mt-3 text-primary-400 text-xs font-bold hover:underline flex items-center gap-1"
            >
              Schedule your first release launch <ArrowRight size={14} />
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.01] text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <th className="py-3.5 px-5">Book Info</th>
                  <th className="py-3.5 px-5">Launch Time</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {/* Upcoming Announcements */}
                {upcomingAnnouncements.map((book) => (
                  <tr key={book._id} className="hover:bg-white/[0.01] group transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-14 rounded-lg overflow-hidden border border-white/10 shrink-0">
                          <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm group-hover:text-primary-400 transition-colors">{book.title}</div>
                          <div className="text-slate-400 text-xs mt-0.5">By {book.authorName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-200">
                        <Calendar size={13} className="text-slate-500" />
                        {new Date(book.launchDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border
                        ${activeAnnouncement?._id === book._id 
                          ? 'text-primary-400 bg-primary-500/10 border-primary-500/20' 
                          : 'text-amber-400 bg-amber-500/10 border-amber-500/20'}`}>
                        {activeAnnouncement?._id === book._id ? 'Active Banner' : 'Upcoming Release'}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button 
                          onClick={() => openEditModal(book)}
                          className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/[0.05]"
                          title="Reschedule launch"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={() => handleCancelAnnouncement(book._id)}
                          className="p-2 text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition-colors border border-rose-500/15"
                          title="Cancel announcement"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {/* Launched & Past Announcements */}
                {pastAnnouncements.map((book) => (
                  <tr key={book._id} className="hover:bg-white/[0.01] opacity-70 group transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-14 rounded-lg overflow-hidden border border-white/10 shrink-0">
                          <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm">{book.title}</div>
                          <div className="text-slate-400 text-xs mt-0.5">By {book.authorName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Calendar size={13} />
                        Released: {new Date(book.launchDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border text-emerald-400 bg-emerald-500/10 border-emerald-500/20">
                        <Check size={10} /> Launched & Live
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button 
                        onClick={() => handleCancelAnnouncement(book._id)}
                        className="px-2.5 py-1 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/[0.05] text-[10px] font-bold"
                        title="Remove announcement banner metadata from database"
                      >
                        Clean Banner Tag
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Schedule / Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#0d1526] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              <form onSubmit={handleSaveAnnouncement}>
                <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
                  <h2 className="text-xl font-poppins font-bold text-white flex items-center gap-2">
                    <Calendar className="text-primary-500" size={20} />
                    {editingBook ? 'Reschedule Launch' : 'Schedule Book Launch'}
                  </h2>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 space-y-5">
                  {/* Book Selection */}
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Select Book</label>
                    {editingBook ? (
                      <div className="flex items-center gap-3 bg-white/[0.02] border border-white/10 p-3 rounded-xl">
                        <img src={editingBook.coverImage} alt={editingBook.title} className="w-8 h-12 object-cover rounded-md border border-white/10" />
                        <div>
                          <div className="text-sm font-bold text-white">{editingBook.title}</div>
                          <div className="text-slate-500 text-xs mt-0.5">By {editingBook.authorName}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                          <input 
                            type="text" 
                            placeholder="Type to filter books..." 
                            value={bookSearch}
                            onChange={(e) => setBookSearch(e.target.value)}
                            className="w-full bg-[#0f172a] border border-white/10 text-white text-xs rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-primary-500/50"
                          />
                        </div>
                        
                        <select 
                          required
                          value={selectedBookId}
                          onChange={(e) => setSelectedBookId(e.target.value)}
                          className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50 cursor-pointer appearance-none"
                        >
                          <option value="">-- Choose a book --</option>
                          {candidateBooks.map((b) => (
                            <option key={b._id} value={b._id}>
                              {b.title} (by {b.authorName}) {!b.isPublished && '[Draft]'}
                            </option>
                          ))}
                        </select>
                        {candidateBooks.length === 0 && bookSearch && (
                          <p className="text-[11px] text-slate-500">No matching candidate books found.</p>
                        )}
                      </div>
                    )}
                  </div>

                   {/* Launch Date & Time */}
                  <div className="space-y-4">
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest -mb-1">Launch Date & Time</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Date</span>
                        <div className="relative">
                          <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                          <input 
                            type="date" 
                            required
                            value={launchDate}
                            onChange={(e) => setLaunchDate(e.target.value)}
                            className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-primary-500/50 cursor-pointer" 
                          />
                        </div>
                      </div>
                      <div>
                        <span className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Time</span>
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <input 
                              type="number" 
                              required
                              placeholder="HH"
                              min="1"
                              max="12"
                              value={launchHour}
                              onChange={(e) => setLaunchHour(e.target.value)}
                              onBlur={() => {
                                let val = parseInt(launchHour, 10);
                                if (isNaN(val) || val < 1) val = 12;
                                if (val > 12) val = 12;
                                setLaunchHour(String(val));
                              }}
                              className="w-full text-center bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl py-2.5 focus:outline-none focus:border-primary-500/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                            />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-bold pointer-events-none">HR</span>
                          </div>
                          <span className="text-slate-600 font-bold">:</span>
                          <div className="relative flex-1">
                            <input 
                              type="number" 
                              required
                              placeholder="MM"
                              min="0"
                              max="59"
                              value={launchMinute}
                              onChange={(e) => setLaunchMinute(e.target.value)}
                              onBlur={() => {
                                let val = parseInt(launchMinute, 10);
                                if (isNaN(val) || val < 0) val = 0;
                                if (val > 59) val = 59;
                                setLaunchMinute(String(val).padStart(2, '0'));
                              }}
                              className="w-full text-center bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl py-2.5 focus:outline-none focus:border-primary-500/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                            />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-bold pointer-events-none">MIN</span>
                          </div>
                          <select
                            value={launchAmpm}
                            onChange={(e) => setLaunchAmpm(e.target.value)}
                            className="bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary-500/50 cursor-pointer text-center font-bold"
                          >
                            <option value="AM">AM</option>
                            <option value="PM">PM</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1.5">
                      The book will remain in draft mode until this time, and will automatically become available and public after it passes.
                    </p>
                  </div>
                </div>

                <div className="p-6 border-t border-white/10 flex items-center justify-end gap-3 bg-white/[0.02]">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-primary-600 hover:bg-primary-500 transition-colors shadow-lg shadow-primary-600/20 disabled:opacity-50"
                  >
                    {saving ? 'Scheduling...' : editingBook ? 'Save Reschedule' : 'Schedule Launch'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminAnnouncements;
