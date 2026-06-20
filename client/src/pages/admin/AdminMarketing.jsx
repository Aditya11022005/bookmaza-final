import { motion } from 'framer-motion';
import { Star, MessageSquare, Mail } from 'lucide-react';

export const AdminReviews = () => (
  <div className="p-8 bg-[#0d1526] rounded-2xl border border-white/10 flex flex-col items-center justify-center min-h-[400px]">
    <Star size={48} className="text-amber-400 mb-4 opacity-50" />
    <h2 className="text-xl font-bold text-white">Review Moderation</h2>
    <p className="text-slate-500 mt-2 text-sm">Approve, reject or delete book reviews from customers.</p>
  </div>
);

export const AdminMessages = () => (
  <div className="p-8 bg-[#0d1526] rounded-2xl border border-white/10 flex flex-col items-center justify-center min-h-[400px]">
    <MessageSquare size={48} className="text-blue-400 mb-4 opacity-50" />
    <h2 className="text-xl font-bold text-white">Contact Inboxes</h2>
    <p className="text-slate-500 mt-2 text-sm">Read and reply to queries submitted via the Contact Us form.</p>
  </div>
);

export const AdminSubscribers = () => (
  <div className="p-8 bg-[#0d1526] rounded-2xl border border-white/10 flex flex-col items-center justify-center min-h-[400px]">
    <Mail size={48} className="text-rose-400 mb-4 opacity-50" />
    <h2 className="text-xl font-bold text-white">Newsletter List</h2>
    <p className="text-slate-500 mt-2 text-sm">Manage email subscribers and send bulk newsletters.</p>
  </div>
);
