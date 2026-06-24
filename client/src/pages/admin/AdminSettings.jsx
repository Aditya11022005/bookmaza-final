import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Store, CreditCard, Mail, Globe, Shield, Truck, Percent, CheckCircle, AlertTriangle, Settings as SettingsIcon } from 'lucide-react';
import axios from '../../api/axios';
import { toast } from 'sonner';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    gstPercentage: 18,
    shippingCost: 99,
    shiprocketEmail: '',
    shiprocketPassword: '',
    storeName: '',
    supportEmail: '',
    contactPhone: '',
    contactWhatsApp: '',
    contactAddress: '',
    contactAddress2: '',
    contactHours: '',
    defaultRoyaltyPercentage: 25,
    autoApproveAuthors: false,
    razorpayKeyId: '',
    razorpayKeySecret: ''
  });

  const [hasConnection, setHasConnection] = useState(false);

  // Message / Support mailbox states
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [msgFilter, setMsgFilter] = useState('all');
  const [msgSearch, setMsgSearch] = useState('');

  const fetchMessages = async () => {
    try {
      setLoadingMessages(true);
      const { data } = await axios.get('/contact');
      setMessages(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load support messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'messages') {
      fetchMessages();
    }
  }, [activeTab]);

  const handleMarkStatus = async (msgId, status) => {
    try {
      await axios.put(`/contact/${msgId}`, { status });
      toast.success(`Message marked as ${status}`);
      fetchMessages();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update message status');
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) {
      toast.error('Reply message cannot be empty');
      return;
    }
    try {
      setSendingReply(true);
      await axios.post(`/contact/${selectedMessage._id}/reply`, { replyMessage: replyText });
      toast.success('Reply email sent to user!');
      setSelectedMessage(null);
      setReplyText('');
      fetchMessages();
    } catch (err) {
      console.error(err);
      toast.error('Failed to send reply email');
    } finally {
      setSendingReply(false);
    }
  };

  // Fetch settings from server
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/settings');
      if (data) {
        setFormData({
          gstPercentage: data.gstPercentage ?? 18,
          shippingCost: data.shippingCost ?? 99,
          shiprocketEmail: data.shiprocketEmail || '',
          shiprocketPassword: data.shiprocketPassword ? '********' : '', // Placeholder if exists
          storeName: data.storeName || '',
          supportEmail: data.supportEmail || '',
          contactPhone: data.contactPhone || '',
          contactWhatsApp: data.contactWhatsApp || '',
          contactAddress: data.contactAddress || '',
          contactAddress2: data.contactAddress2 || '',
          contactHours: data.contactHours || '',
          defaultRoyaltyPercentage: data.defaultRoyaltyPercentage ?? 25,
          autoApproveAuthors: data.autoApproveAuthors ?? false,
          razorpayKeyId: data.razorpayKeyId || '',
          razorpayKeySecret: data.razorpayKeySecret ? '********' : ''
        });
        setHasConnection(!!(data.shiprocketEmail && data.shiprocketPassword));
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load platform settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.endsWith('Cost') || name.endsWith('Percentage') ? Number(value) : value
    }));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      
      // Clean password value if it is still set to placeholder '********'
      const payload = { ...formData };
      if (payload.shiprocketPassword === '********') {
        delete payload.shiprocketPassword;
      }
      if (payload.razorpayKeySecret === '********') {
        delete payload.razorpayKeySecret;
      }

      await axios.put('/settings', payload);
      toast.success('Settings updated successfully!');
      fetchSettings();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const TABS = [
    { id: 'general', label: 'General & Store', icon: Store },
    { id: 'taxes', label: 'Taxes & Shipping', icon: Percent },
    { id: 'authors', label: 'Author Settings', icon: Shield },
    { id: 'shiprocket', label: 'Shiprocket Connect', icon: Truck },
    { id: 'payment', label: 'Payments', icon: CreditCard },
    { id: 'cms', label: 'Pages (CMS)', icon: Globe },
    { id: 'messages', label: 'Support Mailbox', icon: Mail },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-poppins font-black text-white tracking-tight">Platform Settings</h1>
          <p className="text-slate-500 text-sm font-medium mt-0.5">Configure global store variables, taxes, and shipping integrations</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-primary-600/30 disabled:opacity-50"
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full lg:w-64 shrink-0 space-y-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all
                  ${activeTab === tab.id
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0d1526] border border-white/[0.06] rounded-2xl p-6 md:p-8"
          >
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className="text-lg font-poppins font-bold text-white mb-4">General Settings</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Store Name</label>
                    <input 
                      type="text" 
                      name="storeName"
                      value={formData.storeName || ''}
                      onChange={handleChange}
                      className="w-full bg-[#0f172a] border border-white/[0.06] text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50" 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Support Email</label>
                    <input 
                      type="email" 
                      name="supportEmail"
                      value={formData.supportEmail || ''}
                      onChange={handleChange}
                      className="w-full bg-[#0f172a] border border-white/[0.06] text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50" 
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Contact Phone</label>
                    <input 
                      type="text" 
                      name="contactPhone"
                      value={formData.contactPhone || ''}
                      onChange={handleChange}
                      className="w-full bg-[#0f172a] border border-white/[0.06] text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50" 
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Contact WhatsApp (Numbers only, e.g. 919322465522)</label>
                    <input 
                      type="text" 
                      name="contactWhatsApp"
                      value={formData.contactWhatsApp || ''}
                      onChange={handleChange}
                      className="w-full bg-[#0f172a] border border-white/[0.06] text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50" 
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Headquarters Address</label>
                    <input 
                      type="text" 
                      name="contactAddress"
                      value={formData.contactAddress || ''}
                      onChange={handleChange}
                      className="w-full bg-[#0f172a] border border-white/[0.06] text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50" 
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Branch Address (Optional)</label>
                    <input 
                      type="text" 
                      name="contactAddress2"
                      value={formData.contactAddress2 || ''}
                      onChange={handleChange}
                      className="w-full bg-[#0f172a] border border-white/[0.06] text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50" 
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Working Hours</label>
                    <input 
                      type="text" 
                      name="contactHours"
                      value={formData.contactHours || ''}
                      onChange={handleChange}
                      className="w-full bg-[#0f172a] border border-white/[0.06] text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50" 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Store Currency</label>
                    <select className="w-full bg-[#0f172a] border border-white/[0.06] text-slate-400 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50 appearance-none">
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'taxes' && (
              <div className="space-y-6">
                <h2 className="text-lg font-poppins font-bold text-white mb-4">Taxes & Shipping Management</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">GST Percentage (%)</label>
                    <input 
                      type="number" 
                      name="gstPercentage"
                      value={formData.gstPercentage}
                      onChange={handleChange}
                      placeholder="e.g. 18" 
                      className="w-full bg-[#0f172a] border border-white/[0.06] text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50" 
                    />
                    <p className="text-xs text-slate-500 mt-1.5">Standard GST tax applied on overall cart subtotal during checkout</p>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Flat Shipping Rate (₹)</label>
                    <input 
                      type="number" 
                      name="shippingCost"
                      value={formData.shippingCost}
                      onChange={handleChange}
                      placeholder="e.g. 99" 
                      className="w-full bg-[#0f172a] border border-white/[0.06] text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50" 
                    />
                    <p className="text-xs text-slate-500 mt-1.5">Flat cost charged for delivery of physical book formats (hardcopy)</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'authors' && (
              <div className="space-y-6">
                <h2 className="text-lg font-poppins font-bold text-white mb-4">Author Settings</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Default Royalty Percentage (%)</label>
                    <input 
                      type="number" 
                      name="defaultRoyaltyPercentage"
                      value={formData.defaultRoyaltyPercentage}
                      onChange={handleChange}
                      placeholder="e.g. 25" 
                      className="w-full bg-[#0f172a] border border-white/[0.06] text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50" 
                    />
                    <p className="text-xs text-slate-500 mt-1.5">Standard royalty rate split assigned to newly registered author accounts</p>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Registration Mode</label>
                    <select 
                      name="autoApproveAuthors"
                      value={formData.autoApproveAuthors ? 'true' : 'false'}
                      onChange={(e) => setFormData(prev => ({ ...prev, autoApproveAuthors: e.target.value === 'true' }))}
                      className="w-full bg-[#0f172a] border border-white/[0.06] text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50 appearance-none cursor-pointer"
                    >
                      <option value="false">Require Admin Approval (Manual)</option>
                      <option value="true">Auto Approve Authors (Instantly Approved)</option>
                    </select>
                    <p className="text-xs text-slate-500 mt-1.5">Control whether newly registered author accounts are approved automatically or require manual verification</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'shiprocket' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-4">
                  <div>
                    <h2 className="text-lg font-poppins font-bold text-white">Shiprocket Integration</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Automate shipping tracking, pickup creation, and shipping label generation</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasConnection ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        <CheckCircle size={10} /> Connected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                        <AlertTriangle size={10} /> Disconnected
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Shiprocket Account Email</label>
                    <input 
                      type="email" 
                      name="shiprocketEmail"
                      value={formData.shiprocketEmail}
                      onChange={handleChange}
                      placeholder="e.g. shipping@company.com" 
                      className="w-full bg-[#0f172a] border border-white/[0.06] text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50" 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Shiprocket Account Password</label>
                    <input 
                      type="password" 
                      name="shiprocketPassword"
                      value={formData.shiprocketPassword}
                      onChange={handleChange}
                      placeholder="Enter Shiprocket password..." 
                      className="w-full bg-[#0f172a] border border-white/[0.06] text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50" 
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'payment' && (
              <div className="space-y-6">
                <h2 className="text-lg font-poppins font-bold text-white mb-4">Payment Gateways</h2>
                <div className="p-4 rounded-xl border border-primary-500/30 bg-primary-500/10 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black">RZ</div>
                      <div>
                        <p className="text-white font-bold text-sm">Razorpay</p>
                        <p className="text-emerald-400 text-xs font-medium">Active - Live Mode</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Razorpay Key ID</label>
                    <input 
                      type="text" 
                      name="razorpayKeyId"
                      value={formData.razorpayKeyId || ''}
                      onChange={handleChange}
                      placeholder="e.g. rzp_live_xxxxxxxxxxxxxx"
                      className="w-full bg-[#0f172a] border border-white/[0.06] text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50" 
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Razorpay Key Secret</label>
                    <input 
                      type="password" 
                      name="razorpayKeySecret"
                      value={formData.razorpayKeySecret || ''}
                      onChange={handleChange}
                      placeholder="Enter Razorpay Key Secret..."
                      className="w-full bg-[#0f172a] border border-white/[0.06] text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50" 
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'cms' && (
              <div className="space-y-6">
                <h2 className="text-lg font-poppins font-bold text-white mb-4">Content Management (CMS)</h2>
                
                <div className="space-y-6">
                  <div className="border border-white/10 rounded-xl p-6 bg-white/[0.02]">
                    <h3 className="text-md font-bold text-primary-400 mb-4 flex items-center gap-2">
                      <Globe size={18} /> Edit About Us Page
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Page Title</label>
                        <input type="text" defaultValue="About Pustak Maza" className="w-full bg-[#0f172a] border border-white/[0.06] text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50" />
                      </div>
                      
                      <div>
                        <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Main Image (URL / Upload)</label>
                        <div className="flex items-center gap-4">
                          <input type="text" defaultValue="/images/about-us-hero.jpg" className="flex-1 bg-[#0f172a] border border-white/[0.06] text-slate-300 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50" />
                          <button className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-xl border border-white/10 transition-colors whitespace-nowrap">
                            Upload New
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Page Content (HTML/Text)</label>
                        <textarea rows="10" defaultValue="Welcome to Pustak Maza, your number one source for all things books. We're dedicated to providing you the very best of literature, with an emphasis on Marathi & English selections, fast delivery, and author support." className="w-full bg-[#0f172a] border border-white/[0.06] text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500/50 resize-y font-mono"></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
                  <div>
                    <h2 className="text-lg font-poppins font-bold text-white">Support Mailbox</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Manage and respond to user messages submitted via the Contact page</p>
                  </div>
                  
                  {/* Status Filters */}
                  <div className="flex items-center gap-1 bg-white/[0.02] border border-white/[0.06] p-1 rounded-xl">
                    {['all', 'unread', 'read', 'replied'].map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setMsgFilter(f)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all
                          ${msgFilter === f 
                            ? 'bg-primary-600 text-white shadow-md' 
                            : 'text-slate-400 hover:text-white'}`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search and refresh */}
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={msgSearch}
                    onChange={(e) => setMsgSearch(e.target.value)}
                    placeholder="Search by sender name, email, or subject..."
                    className="flex-1 bg-[#0f172a] border border-white/[0.06] text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-500/50"
                  />
                  <button 
                    type="button"
                    onClick={fetchMessages}
                    className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors"
                  >
                    Refresh
                  </button>
                </div>

                {/* Loading State */}
                {loadingMessages ? (
                  <div className="py-20 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages
                      .filter((m) => {
                        if (msgFilter !== 'all' && m.status !== msgFilter) return false;
                        if (msgSearch) {
                          const query = msgSearch.toLowerCase();
                          return (
                            (m.name || '').toLowerCase().includes(query) ||
                            (m.email || '').toLowerCase().includes(query) ||
                            (m.subject || '').toLowerCase().includes(query)
                          );
                        }
                        return true;
                      }).length === 0 ? (
                        <div className="text-center py-16 text-slate-500 border border-dashed border-white/10 rounded-2xl">
                          No messages found matching this filter.
                        </div>
                      ) : (
                        messages
                          .filter((m) => {
                            if (msgFilter !== 'all' && m.status !== msgFilter) return false;
                            if (msgSearch) {
                              const query = msgSearch.toLowerCase();
                              return (
                                (m.name || '').toLowerCase().includes(query) ||
                                (m.email || '').toLowerCase().includes(query) ||
                                (m.subject || '').toLowerCase().includes(query)
                              );
                            }
                            return true;
                          })
                          .map((msg) => (
                            <div 
                              key={msg._id}
                              className={`p-5 rounded-2xl border transition-all hover:border-white/10 flex flex-col md:flex-row justify-between gap-4 items-start md:items-center
                                ${msg.status === 'unread' 
                                  ? 'bg-[#121b2e] border-primary-500/20' 
                                  : 'bg-[#0a101d] border-white/[0.04]'}`}
                            >
                              <div className="space-y-1.5 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-bold text-white text-sm">{msg.name}</span>
                                  <span className="text-xs text-slate-500 font-medium">({msg.email})</span>
                                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border
                                    ${msg.status === 'unread' 
                                      ? 'text-primary-400 bg-primary-500/10 border-primary-500/20' 
                                      : msg.status === 'read'
                                        ? 'text-sky-400 bg-sky-400/10 border-sky-400/20'
                                        : 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'}`}>
                                    {msg.status}
                                  </span>
                                </div>
                                <p className="text-sm font-bold text-slate-200">Subject: {msg.subject}</p>
                                <p className="text-xs text-slate-400 line-clamp-2 bg-[#0f172a]/40 p-2.5 rounded-xl border border-white/[0.03] mt-1">{msg.message}</p>
                                <div className="text-[10px] text-slate-500 mt-2 font-medium">
                                  Received: {new Date(msg.createdAt).toLocaleString('en-IN')}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                                {msg.status === 'unread' && (
                                  <button
                                    type="button"
                                    onClick={() => handleMarkStatus(msg._id, 'read')}
                                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-white rounded-xl transition-colors"
                                  >
                                    Mark Read
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedMessage(msg);
                                    setReplyText(msg.replyMessage || '');
                                  }}
                                  className="px-3.5 py-1.5 bg-primary-600 hover:bg-primary-500 text-xs font-bold text-white rounded-xl shadow-md transition-colors"
                                >
                                  {msg.status === 'replied' ? 'View Response' : 'Reply & Manage'}
                                </button>
                              </div>
                            </div>
                          ))
                      )}
                  </div>
                )}

                {/* Reply Modal */}
                {selectedMessage && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div 
                      onClick={() => setSelectedMessage(null)}
                      className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <div className="relative w-full max-w-xl bg-[#0d1526] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                      <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
                        <h2 className="text-lg font-poppins font-bold text-white">
                          {selectedMessage.status === 'replied' ? 'Support Inquiry Details' : 'Reply to Support Inquiry'}
                        </h2>
                        <button 
                          type="button"
                          onClick={() => setSelectedMessage(null)}
                          className="text-slate-400 hover:text-white transition-colors text-lg"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="p-6 space-y-4 overflow-y-auto">
                        <div className="grid grid-cols-2 gap-4 text-xs bg-white/[0.02] p-4 rounded-xl border border-white/[0.05]">
                          <div>
                            <span className="text-slate-500 block">Sender Name</span>
                            <span className="font-bold text-slate-200">{selectedMessage.name}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Sender Email</span>
                            <a href={`mailto:${selectedMessage.email}`} className="font-bold text-primary-400 hover:underline">{selectedMessage.email}</a>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Phone Number</span>
                            <span className="font-bold text-slate-200">{selectedMessage.phone}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Received Date</span>
                            <span className="font-bold text-slate-200">{new Date(selectedMessage.createdAt).toLocaleString('en-IN')}</span>
                          </div>
                        </div>

                        <div>
                          <span className="text-xs text-slate-500 block mb-1">Subject</span>
                          <p className="text-sm font-bold text-white bg-white/[0.03] p-3 rounded-xl border border-white/[0.05]">{selectedMessage.subject}</p>
                        </div>

                        <div>
                          <span className="text-xs text-slate-500 block mb-1">Original Inquiry Message</span>
                          <p className="text-sm text-slate-300 bg-white/[0.03] p-3 rounded-xl border border-white/[0.05] whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">{selectedMessage.message}</p>
                        </div>

                        {selectedMessage.status === 'replied' ? (
                          <div className="border-t border-white/10 pt-4 space-y-2">
                            <span className="text-xs text-slate-500 block">Response Sent via Email</span>
                            <p className="text-sm text-emerald-400 bg-emerald-950/20 p-3 rounded-xl border border-emerald-800/20 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">{selectedMessage.replyMessage}</p>
                            <span className="text-[10px] text-slate-500 block">Replied At: {selectedMessage.repliedAt ? new Date(selectedMessage.repliedAt).toLocaleString('en-IN') : 'N/A'}</span>
                          </div>
                        ) : (
                          <form onSubmit={handleSendReply} className="border-t border-white/10 pt-4 space-y-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Draft Email Reply</label>
                              <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                rows={5}
                                required
                                placeholder="Type your response to the user... An email will be sent automatically containing this response."
                                className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500/50 resize-none"
                              />
                            </div>

                            <div className="flex items-center justify-end gap-3 bg-white/[0.02] p-4 -mx-6 -mb-6 border-t border-white/10">
                              <button 
                                type="button" 
                                onClick={() => setSelectedMessage(null)}
                                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors"
                              >
                                Cancel
                              </button>
                              <button 
                                type="submit"
                                disabled={sendingReply}
                                className="px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-xs font-bold text-white rounded-xl shadow-lg shadow-primary-600/30 transition-colors disabled:opacity-50"
                              >
                                {sendingReply ? 'Sending Email Reply...' : 'Send Reply via Email'}
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Other tabs placeholder */}
            {(!['general', 'taxes', 'shiprocket', 'payment', 'cms', 'messages'].includes(activeTab)) && (
              <div className="py-20 flex flex-col items-center justify-center text-slate-500">
                <SettingsIcon size={48} className="mb-4 opacity-20" />
                <p className="text-lg font-bold text-slate-400">Settings module under development.</p>
              </div>
            )}

          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
