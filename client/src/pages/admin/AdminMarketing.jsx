import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  MessageSquare, 
  Mail, 
  Trash2, 
  Search, 
  Download, 
  Copy, 
  Check, 
  CornerDownRight, 
  X, 
  Loader, 
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import axios from '../../api/axios';
import { toast } from 'sonner';

// ==========================================
// 1. ADMIN SUBSCRIBERS (NEWSLETTER)
// ==========================================
export const AdminSubscribers = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);

  const fetchSubscribers = async () => {
    try {
      const { data } = await axios.get('/newsletter/subscribers');
      setSubscribers(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load subscribers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this subscriber?')) return;
    try {
      await axios.delete(`/newsletter/subscribers/${id}`);
      toast.success('Subscriber removed');
      fetchSubscribers();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to remove subscriber');
    }
  };

  const handleCopyEmails = () => {
    if (subscribers.length === 0) return;
    const emailsList = subscribers.map(s => s.email).join(', ');
    navigator.clipboard.writeText(emailsList);
    setCopied(true);
    toast.success('All subscriber emails copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCSV = () => {
    if (subscribers.length === 0) return;
    const csvContent = "data:text/csv;charset=utf-8,Email,Subscription Date\n" 
      + subscribers.map(s => `"${s.email}","${new Date(s.createdAt).toLocaleDateString('en-IN')}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `newsletter_subscribers_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredSubscribers = subscribers.filter(s => 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-poppins font-black text-white tracking-tight">Newsletter Subscribers</h1>
          <p className="text-slate-500 text-sm font-medium mt-0.5">Manage mailing list subscriptions and export addresses</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleCopyEmails}
            disabled={subscribers.length === 0}
            className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl transition-all border border-white/5 disabled:opacity-50"
          >
            {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
            Copy All
          </button>
          <button 
            onClick={handleDownloadCSV}
            disabled={subscribers.length === 0}
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl transition-all shadow-lg shadow-primary-600/30 disabled:opacity-50"
          >
            <Download size={16} />
            Download CSV
          </button>
        </div>
      </div>

      {/* Stats Widget */}
      <div className="bg-gradient-to-r from-primary-950/40 to-slate-900/40 rounded-2xl p-6 border border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400">
            <Mail size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Active Subscribers</p>
            <h3 className="text-3xl font-black text-white mt-1">{subscribers.length}</h3>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        <input
          type="text"
          placeholder="Search subscribers by email..."
          className="w-full bg-[#0d1526] border border-white/[0.06] text-white text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all placeholder:text-slate-600"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Subscribers Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader className="animate-spin text-primary-600" size={32} />
          <span className="text-slate-500 font-bold text-sm uppercase tracking-wider">Loading subscribers...</span>
        </div>
      ) : (
        <div className="bg-[#0d1526] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  <th className="px-5 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Email Address</th>
                  <th className="px-5 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Date Subscribed</th>
                  <th className="px-5 py-4 text-right text-[11px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscribers.length > 0 ? (
                  filteredSubscribers.map((sub, i) => (
                    <motion.tr
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      key={sub._id}
                      className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-white font-bold text-sm">{sub.email}</span>
                      </td>
                      <td className="px-5 py-4 text-slate-500 text-xs font-medium whitespace-nowrap">
                        {new Date(sub.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleDelete(sub._id)}
                          className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all"
                          title="Remove subscriber"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-5 py-12 text-center text-slate-500 font-medium">
                      No email subscribers found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};


// ==========================================
// 2. ADMIN MESSAGES (CONTACT FORM INBOX)
// ==========================================
export const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Reply Modal States
  const [activeMessage, setActiveMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const fetchMessages = async () => {
    try {
      const { data } = await axios.get('/contact');
      setMessages(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load contact messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await axios.put(`/contact/${id}`, { status });
      toast.success(`Message marked as ${status}`);
      fetchMessages();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return toast.error('Reply content cannot be empty');
    setSendingReply(true);
    try {
      await axios.post(`/contact/${activeMessage._id}/reply`, { replyMessage: replyText });
      toast.success('Reply email sent successfully');
      setActiveMessage(null);
      setReplyText('');
      fetchMessages();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to send reply email');
    } finally {
      setSendingReply(false);
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this contact message?')) return;
    try {
      await axios.delete(`/contact/${id}`);
      toast.success('Message deleted successfully');
      fetchMessages();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete message');
    }
  };

  const filteredMessages = messages.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-poppins font-black text-white tracking-tight">Customer Support Inbox</h1>
        <p className="text-slate-500 text-sm font-medium mt-0.5">Read queries submitted via Contact form and reply instantly</p>
      </div>

      {/* Toolbar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        <input
          type="text"
          placeholder="Search by sender, email, subject, or keywords..."
          className="w-full bg-[#0d1526] border border-white/[0.06] text-white text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all placeholder:text-slate-600"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Messages Feed */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader className="animate-spin text-primary-600" size={32} />
          <span className="text-slate-500 font-bold text-sm uppercase tracking-wider">Loading inbox messages...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMessages.length > 0 ? (
            filteredMessages.map((msg) => (
              <motion.div
                layout
                key={msg._id}
                className={`bg-[#0d1526] rounded-2xl border p-6 transition-all duration-300 flex flex-col gap-4 ${
                  msg.status === 'replied' 
                    ? 'border-emerald-500/20 bg-emerald-950/5' 
                    : msg.status === 'read' 
                      ? 'border-white/5 opacity-80' 
                      : 'border-primary-500/30 shadow-[0_0_15px_-5px_rgba(168,85,247,0.1)]'
                }`}
              >
                {/* Header detail */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.04] pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-white font-bold text-base">{msg.name}</h4>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                        msg.status === 'replied'
                          ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
                          : msg.status === 'read'
                            ? 'text-slate-400 bg-slate-800 border-slate-700'
                            : 'text-amber-400 bg-amber-400/10 border-amber-400/20'
                      }`}>
                        {msg.status}
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs font-semibold mt-1">
                      {msg.email} • {msg.phone}
                    </p>
                  </div>
                  <span className="text-slate-500 text-xs font-medium">
                    {new Date(msg.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Subject & Message Body */}
                <div>
                  <h5 className="text-primary-400 font-bold text-sm mb-1.5">{msg.subject}</h5>
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                </div>

                {/* If replied, show reply history */}
                {msg.status === 'replied' && msg.replyMessage && (
                  <div className="mt-2 bg-white/[0.02] border border-white/[0.04] rounded-xl p-4 flex gap-3">
                    <CornerDownRight size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Replied By Support:</span>
                      <p className="text-slate-400 text-xs mt-1 leading-relaxed whitespace-pre-wrap">{msg.replyMessage}</p>
                      {msg.repliedAt && (
                        <span className="text-[9px] text-slate-600 block mt-2">
                          Date: {new Date(msg.repliedAt).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions Footer */}
                <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-white/[0.03]">
                  {msg.status !== 'replied' && (
                    <button
                      onClick={() => setActiveMessage(msg)}
                      className="inline-flex items-center gap-1.5 bg-primary-600/10 hover:bg-primary-600 text-primary-400 hover:text-white border border-primary-500/20 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                    >
                      <CornerDownRight size={14} />
                      Reply via Email
                    </button>
                  )}
                  {msg.status === 'pending' && (
                    <button
                      onClick={() => handleStatusUpdate(msg._id, 'read')}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold border border-white/5 transition-colors"
                    >
                      Mark Read
                    </button>
                  )}
                  {msg.status === 'read' && (
                    <button
                      onClick={() => handleStatusUpdate(msg._id, 'pending')}
                      className="bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-350 px-4 py-2 rounded-xl text-xs font-bold border border-white/5 transition-colors"
                    >
                      Mark Unread
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteMessage(msg._id)}
                    className="inline-flex items-center gap-1.5 bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="bg-[#0d1526] rounded-2xl border border-white/5 p-12 text-center text-slate-500 font-medium">
              No message logs in the support inbox.
            </div>
          )}
        </div>
      )}

      {/* Reply Modal */}
      <AnimatePresence>
        {activeMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setActiveMessage(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-[#0d1526] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
                <div>
                  <h2 className="text-lg font-poppins font-bold text-white">Send Email Reply</h2>
                  <p className="text-slate-500 text-xs font-semibold mt-0.5">To: {activeMessage.name} ({activeMessage.email})</p>
                </div>
                <button onClick={() => setActiveMessage(null)} className="text-slate-400 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSendReply}>
                <div className="p-6 space-y-4">
                  {/* Original message reference */}
                  <div className="bg-[#0f172a] rounded-xl p-4 border border-white/5 max-h-[120px] overflow-y-auto">
                    <span className="text-[9px] font-black uppercase tracking-widest text-primary-400">Original Message:</span>
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed">{activeMessage.message}</p>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Reply Content</label>
                    <textarea 
                      required
                      rows={6}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your official support response here. The system will email this content to the customer immediately." 
                      className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50" 
                    />
                  </div>
                </div>

                <div className="p-6 border-t border-white/10 flex items-center justify-end gap-3 bg-white/[0.02]">
                  <button type="button" onClick={() => setActiveMessage(null)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={sendingReply}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-primary-600 hover:bg-primary-500 transition-colors shadow-lg shadow-primary-600/20 disabled:opacity-50"
                  >
                    {sendingReply ? 'Sending Email...' : 'Send Reply'}
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


// ==========================================
// 3. ADMIN REVIEWS (BOOK REVIEWS MODERATION)
// ==========================================
export const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get('/books?all=true');
      
      // Flatmap all reviews with book context details
      const flattenedReviews = data.flatMap(book => 
        (book.reviews || []).map(rev => ({
          ...rev,
          bookId: book._id,
          bookTitle: book.title,
          bookCover: book.coverImage
        }))
      );
      
      // Sort reviews by date descending
      flattenedReviews.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setReviews(flattenedReviews);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDeleteReview = async (bookId, reviewId) => {
    if (!window.confirm('Are you sure you want to delete this customer review?')) return;
    try {
      await axios.delete(`/books/${bookId}/reviews/${reviewId}`);
      toast.success('Review deleted successfully');
      fetchReviews();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete review');
    }
  };

  const filteredReviews = reviews.filter(rev => 
    rev.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rev.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rev.bookTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-poppins font-black text-white tracking-tight">Review Moderation</h1>
        <p className="text-slate-500 text-sm font-medium mt-0.5">Read, moderate and remove inappropriate user ratings and book reviews</p>
      </div>

      {/* Toolbar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        <input
          type="text"
          placeholder="Search reviews by comments, reviewer name, or book title..."
          className="w-full bg-[#0d1526] border border-white/[0.06] text-white text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all placeholder:text-slate-600"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Reviews list */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader className="animate-spin text-primary-600" size={32} />
          <span className="text-slate-500 font-bold text-sm uppercase tracking-wider">Loading reviews...</span>
        </div>
      ) : (
        <div className="bg-[#0d1526] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  <th className="px-5 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Book</th>
                  <th className="px-5 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Reviewer</th>
                  <th className="px-5 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Rating</th>
                  <th className="px-5 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Comment</th>
                  <th className="px-5 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Date</th>
                  <th className="px-5 py-4 text-right text-[11px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.length > 0 ? (
                  filteredReviews.map((rev, i) => (
                    <motion.tr
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      key={rev._id}
                      className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Book detail */}
                      <td className="px-5 py-4 whitespace-nowrap max-w-[200px]">
                        <div className="flex items-center gap-3">
                          <img src={rev.bookCover} alt={rev.bookTitle} className="w-8 h-10 object-cover rounded shadow border border-white/5" />
                          <span className="text-white font-bold text-xs truncate block" title={rev.bookTitle}>
                            {rev.bookTitle}
                          </span>
                        </div>
                      </td>

                      {/* Reviewer Name */}
                      <td className="px-5 py-4 text-slate-350 text-xs font-bold whitespace-nowrap">
                        {rev.name}
                      </td>

                      {/* Stars */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex gap-0.5 text-amber-400">
                          {[...Array(5)].map((_, idx) => (
                            <Star 
                              key={idx} 
                              size={12} 
                              fill={idx < rev.rating ? "currentColor" : "none"} 
                              className={idx < rev.rating ? "" : "text-slate-700"}
                            />
                          ))}
                        </div>
                      </td>

                      {/* Comment body */}
                      <td className="px-5 py-4 max-w-[300px]">
                        <p className="text-slate-400 text-xs font-medium line-clamp-2" title={rev.comment}>
                          {rev.comment}
                        </p>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-slate-500 text-xs font-semibold whitespace-nowrap">
                        {new Date(rev.createdAt || rev.date || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </td>

                      {/* Moderate action */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteReview(rev.bookId, rev._id)}
                          className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all"
                          title="Delete review"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-5 py-12 text-center text-slate-500 font-medium">
                      No ratings or book reviews found in the system.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
