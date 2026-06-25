import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '../api/axios';
import useAdminAuthStore from '../store/adminAuthStore';
import {
  LayoutDashboard, BookOpen, Users, ShoppingBag, UserCog,
  Image, Tag, Settings, LogOut, Menu, X, ChevronRight,
  Bell, Search, Sun, Moon, ChevronLeft, Star, MessageSquare, Mail, Award, FolderOpen,
  Megaphone
} from 'lucide-react';

// ─── Navigation Config ──────────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: 'Core',
    items: [
      { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Books', path: '/admin/dashboard/books', icon: BookOpen },
      { name: 'Categories', path: '/admin/dashboard/categories', icon: FolderOpen },
      { name: 'Authors', path: '/admin/dashboard/authors', icon: Users },
      { name: 'Orders', path: '/admin/dashboard/orders', icon: ShoppingBag },
      { name: 'Users', path: '/admin/dashboard/users', icon: UserCog },
      { name: 'Reviews', path: '/admin/dashboard/reviews', icon: Star },
    ],
  },
  {
    label: 'Marketing & Support',
    items: [
      { name: 'Banners', path: '/admin/dashboard/banners', icon: Image },
      { name: 'Announcements', path: '/admin/dashboard/announcements', icon: Megaphone },
      { name: 'Coupons', path: '/admin/dashboard/coupons', icon: Tag },
      { name: 'Messages', path: '/admin/dashboard/messages', icon: MessageSquare },
      { name: 'Subscribers', path: '/admin/dashboard/subscribers', icon: Mail },
    ],
  },
  {
    label: 'Platform Actions',
    items: [
      { name: 'Certificates', path: '/admin/dashboard/certificates', icon: Award },
      { name: 'Settings', path: '/admin/dashboard/settings', icon: Settings },
    ],
  },
];

// ─── Page Title Resolver ─────────────────────────────────────────────────────
const PAGE_TITLES = {
  '/admin/dashboard': 'Dashboard',
  '/admin/dashboard/books': 'Books',
  '/admin/dashboard/categories': 'Categories',
  '/admin/dashboard/authors': 'Authors',
  '/admin/dashboard/orders': 'Orders',
  '/admin/dashboard/users': 'Users',
  '/admin/dashboard/reviews': 'Reviews',
  '/admin/dashboard/banners': 'Banners',
  '/admin/dashboard/announcements': 'Announcements',
  '/admin/dashboard/coupons': 'Coupons',
  '/admin/dashboard/messages': 'Messages',
  '/admin/dashboard/subscribers': 'Subscribers',
  '/admin/dashboard/certificates': 'Certificates',
  '/admin/dashboard/settings': 'Settings',
};

// ─── Tooltip for collapsed sidebar ──────────────────────────────────────────
const NavItem = ({ item, collapsed, onNavigate }) => {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.path}
      end={item.path === '/admin/dashboard'}
      onClick={onNavigate}
      title={collapsed ? item.name : undefined}
      className={({ isActive }) =>
        `group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative
        ${isActive
          ? 'bg-primary-600 text-white shadow-lg shadow-primary-700/40'
          : 'text-slate-400 hover:bg-white/5 hover:text-white'
        }
        ${collapsed ? 'justify-center' : ''}`
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            size={20}
            className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-white' : ''}`}
          />
          {!collapsed && (
            <span className="font-semibold text-[14px] leading-none truncate">{item.name}</span>
          )}
          {/* Active indicator dot (visible when collapsed) */}
          {isActive && collapsed && (
            <span className="absolute right-0.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary-400 rounded-full" />
          )}
          {/* Tooltip on hover when collapsed */}
          {collapsed && (
            <span className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg
                            opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap
                            shadow-xl border border-white/10 transition-all duration-150 z-50
                            translate-x-1 group-hover:translate-x-0">
              {item.name}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
};

// ─── Main Layout ─────────────────────────────────────────────────────────────
const AdminLayout = () => {
  const { admin, logout } = useAdminAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Desktop collapsible state
  const [collapsed, setCollapsed] = useState(false);
  // Mobile drawer state
  const [mobileOpen, setMobileOpen] = useState(false);
  // Light Mode Toggle State
  const [isLightMode, setIsLightMode] = useState(false);

  // Search Command Palette State
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchData, setSearchData] = useState({ books: [], orders: [], users: [] });
  const [loadingSearch, setLoadingSearch] = useState(false);

  // Notifications Dropdown State
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      let pendingAuthors = [];
      let pendingMessages = [];

      try {
        const usersRes = await axios.get('/users');
        pendingAuthors = (usersRes.data || [])
          .filter(u => u.role === 'author' && !u.isAuthorApproved)
          .map(u => ({
            id: `author-${u._id}`,
            type: 'author',
            title: 'Pending Author Approval',
            message: `${u.name} is waiting for author approval.`,
            path: '/admin/dashboard/authors',
            date: u.createdAt || new Date()
          }));
      } catch (userErr) {
        console.error('Failed to load users for notifications:', userErr);
      }

      try {
        const contactRes = await axios.get('/contact');
        pendingMessages = (contactRes.data || [])
          .filter(m => m.status === 'pending')
          .map(m => ({
            id: `msg-${m._id}`,
            type: 'message',
            title: `Support: ${m.subject}`,
            message: `From ${m.name}: "${m.message.slice(0, 45)}..."`,
            path: '/admin/dashboard/messages',
            date: m.createdAt || new Date()
          }));
      } catch (contactErr) {
        console.error('Failed to load contacts for notifications:', contactErr);
      }

      const combined = [...pendingAuthors, ...pendingMessages].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      setNotifications(combined);
    } catch (err) {
      console.error('Failed to process notifications:', err);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const allActions = [
    { name: 'Go to Dashboard', path: '/admin/dashboard', desc: 'Overview and platform sales reports' },
    { name: 'Books Catalog', path: '/admin/dashboard/books', desc: 'Upload and edit ebooks, audiobooks or physical books' },
    { name: 'Categories Management', path: '/admin/dashboard/categories', desc: 'Configure platform book genres and categories' },
    { name: 'Authors Approvals', path: '/admin/dashboard/authors', desc: 'Verify and manage author profiles and royalty splits' },
    { name: 'Manage Orders', path: '/admin/dashboard/orders', desc: 'Track physical and digital customer orders' },
    { name: 'System Settings', path: '/admin/dashboard/settings', desc: 'Configure GST, shipping costs, and Razorpay API' },
    { name: 'Banners & Carousel', path: '/admin/dashboard/banners', desc: 'Manage home screen promo banner slides' },
    { name: 'Coupons & Promos', path: '/admin/dashboard/coupons', desc: 'Create and distribute discount promo codes' }
  ];

  const openSearch = async () => {
    setSearchOpen(true);
    setSearchQuery('');
    try {
      setLoadingSearch(true);
      const [booksRes, ordersRes, usersRes] = await Promise.all([
        axios.get('/books?all=true'),
        axios.get('/orders'),
        axios.get('/users')
      ]);
      setSearchData({
        books: booksRes.data || [],
        orders: ordersRes.data || [],
        users: usersRes.data || []
      });
    } catch (err) {
      console.error('Search data fetch failed:', err);
    } finally {
      setLoadingSearch(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (searchOpen) {
          setSearchOpen(false);
        } else {
          openSearch();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen]);

  const filteredBooks = searchQuery
    ? searchData.books.filter(b => b.title?.toLowerCase().includes(searchQuery.toLowerCase()) || b.authorName?.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];
  const filteredOrders = searchQuery
    ? searchData.orders.filter(o => o._id?.toLowerCase().includes(searchQuery.toLowerCase()) || o.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];
  const filteredUsers = searchQuery
    ? searchData.users.filter(u => u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];
  const filteredActions = searchQuery
    ? allActions.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.desc.toLowerCase().includes(searchQuery.toLowerCase()))
    : allActions;

  const currentTitle = PAGE_TITLES[location.pathname] || 'Admin';
  const initials = admin?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'A';

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  const SIDEBAR_W = collapsed ? 'w-64 lg:w-[72px]' : 'w-64';

  return (
    <div className={`flex h-screen bg-[#0f172a] overflow-hidden font-inter ${isLightMode ? 'admin-light-mode' : ''}`}>

      {/* ─── Mobile Overlay ──────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ─── SIDEBAR ─────────────────────────────────────────────── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col
          bg-[#0d1526] border-r border-white/[0.06]
          transition-all duration-300 ease-in-out
          ${SIDEBAR_W}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0 lg:flex lg:shrink-0
        `}
      >
        {/* Logo */}
        <div className={`h-16 flex items-center border-b border-white/[0.06] shrink-0 ${collapsed ? 'justify-center px-3' : 'px-5 gap-3'}`}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-primary-700/40 shrink-0">
            PM
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-white font-poppins font-black text-[15px] leading-none">Pustak Maza</p>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">Admin Panel</p>
            </div>
          )}
          {/* Mobile close */}
          <button
            className="ml-auto lg:hidden text-slate-500 hover:text-white transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 px-3 mb-2">
                  {group.label}
                </p>
              )}
              {collapsed && <div className="border-t border-white/[0.06] mb-2 mx-1" />}
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavItem
                    key={item.path}
                    item={item}
                    collapsed={collapsed}
                    onNavigate={() => setMobileOpen(false)}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom: User + Logout */}
        <div className="shrink-0 border-t border-white/[0.06] p-3 space-y-1">
          {/* User info */}
          {!collapsed && (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-2">
              <div className="w-8 h-8 rounded-full bg-primary-600/30 border border-primary-500/40 flex items-center justify-center text-primary-300 font-black text-xs shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-bold truncate leading-tight">{admin?.name || 'Administrator'}</p>
                <p className="text-slate-500 text-[11px] truncate">{admin?.role || 'superadmin'}</p>
              </div>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            title={collapsed ? 'Sign Out' : undefined}
            className={`w-full group flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400
              hover:bg-red-500/10 hover:text-red-400 transition-all duration-200
              ${collapsed ? 'justify-center' : ''}`}
          >
            <LogOut size={20} className="shrink-0 group-hover:scale-110 transition-transform duration-200" />
            {!collapsed && <span className="font-semibold text-[14px]">Sign Out</span>}
            {collapsed && (
              <span className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900 text-red-400 text-xs font-bold rounded-lg
                              opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap
                              shadow-xl border border-red-500/20 transition-all duration-150 z-50">
                Sign Out
              </span>
            )}
          </button>

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className={`hidden lg:flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600
              hover:bg-white/5 hover:text-slate-300 transition-all duration-200
              ${collapsed ? 'justify-center' : ''}`}
          >
            <ChevronLeft
              size={18}
              className={`shrink-0 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
            />
            {!collapsed && <span className="font-semibold text-[13px]">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* ─── RIGHT PANEL ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ─── TOP NAVBAR ───────────────────────────────────────── */}
        <header className="h-16 bg-[#111827]/90 backdrop-blur-md border-b border-white/[0.06] flex items-center px-4 lg:px-6 gap-4 shrink-0 sticky top-0 z-30">

          {/* Mobile hamburger */}
          <button
            className="lg:hidden text-slate-400 hover:text-white transition-colors p-1"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={22} />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm min-w-0">
            <span className="text-slate-600 font-medium hidden sm:block">Admin</span>
            <ChevronRight size={14} className="text-slate-700 hidden sm:block shrink-0" />
            <span className="text-white font-bold truncate">{currentTitle}</span>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Search (functional) */}
          <div 
            onClick={openSearch}
            className="hidden md:flex items-center gap-2 bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2 text-slate-500 hover:bg-white/[0.08] transition-all cursor-pointer group"
          >
            <Search size={16} className="group-hover:text-slate-300 transition-colors" />
            <span className="text-sm font-medium">Search…</span>
            <kbd className="ml-2 text-[10px] font-bold bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-slate-600">⌘K</kbd>
          </div>

          {/* Mobile Search Icon Button */}
          <button 
            onClick={openSearch}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all"
          >
            <Search size={17} />
          </button>

          {/* Theme Toggle */}
          <button 
            onClick={() => setIsLightMode(!isLightMode)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all preserve-colors"
          >
            {isLightMode ? <Moon size={17} /> : <Sun size={17} />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => {
                setShowNotifications(!showNotifications);
                fetchNotifications(); // Refresh on click
              }}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all"
            >
              <Bell size={17} />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-primary-500 rounded-full border border-[#111827]" />
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <>
                  {/* Backdrop overlay to close when clicking outside */}
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 bg-[#0d1526]/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col"
                  >
                    <div className="px-4 py-3.5 border-b border-white/[0.08] flex items-center justify-between">
                      <span className="text-white text-xs font-bold uppercase tracking-wider">Notifications ({notifications.length})</span>
                      <button 
                        onClick={fetchNotifications}
                        className="text-[10px] text-primary-400 hover:text-primary-300 font-bold"
                      >
                        Refresh
                      </button>
                    </div>

                    <div className="max-h-[300px] overflow-y-auto divide-y divide-white/[0.04] scrollbar-thin">
                      {loadingNotifications && notifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
                          <div className="w-4 h-4 rounded-full border-2 border-primary-500/20 border-t-primary-500 animate-spin" />
                          <span>Checking notifications...</span>
                        </div>
                      ) : notifications.length > 0 ? (
                        notifications.map((n) => (
                          <div 
                            key={n.id}
                            onClick={() => {
                              setShowNotifications(false);
                              navigate(n.path);
                            }}
                            className="p-3.5 hover:bg-white/[0.02] cursor-pointer transition-colors flex flex-col gap-1 text-left"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-white text-xs font-bold truncate">{n.title}</span>
                              <span className="text-[9px] text-slate-500 shrink-0 font-semibold">
                                {new Date(n.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                            <p className="text-slate-400 text-[11px] leading-relaxed line-clamp-2">{n.message}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-slate-500 text-xs font-medium">
                          No pending notifications
                        </div>
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Avatar */}
          <div className="flex items-center gap-3 pl-2 border-l border-white/[0.06]">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-primary-700/30">
              {initials}
            </div>
            <div className="hidden sm:block">
              <p className="text-white text-sm font-bold leading-tight">{admin?.name || 'Admin'}</p>
              <p className="text-slate-500 text-[11px] capitalize">{admin?.role || 'superadmin'}</p>
            </div>
          </div>
        </header>

        {/* ─── PAGE CONTENT ─────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto bg-[#0f172a]">
          {/* Inner container */}
          <div className="p-4 lg:p-8 min-h-full">
            <Outlet />
          </div>
        </main>

      </div>

      {/* ─── Search Command Palette ────────────────────────────── */}
      <AnimatePresence>
        {searchOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSearchOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-xl bg-[#0d1526]/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh] z-10"
            >
              {/* Search Bar Input */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.08] shrink-0">
                <Search size={20} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search books, orders, authors, settings..."
                  className="flex-grow bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none"
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  className="text-slate-500 hover:text-white transition-colors text-xs font-bold bg-white/5 px-2 py-1 rounded"
                >
                  ESC
                </button>
              </div>

              {/* Results Area */}
              <div className="flex-grow overflow-y-auto p-4 space-y-4 min-h-[200px]">
                {loadingSearch ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-500">
                    <div className="w-6 h-6 rounded-full border-2 border-primary-500/20 border-t-primary-500 animate-spin" />
                    <span className="text-xs font-bold uppercase tracking-wider">Syncing dashboard records...</span>
                  </div>
                ) : (
                  <>
                    {/* If no search query, show default instructions & quick actions */}
                    {!searchQuery && (
                      <div className="space-y-4">
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">
                          Quick Navigation
                        </div>
                        <div className="grid grid-cols-1 gap-1">
                          {allActions.map((action) => (
                            <NavLink
                              key={action.name}
                              to={action.path}
                              onClick={() => setSearchOpen(false)}
                              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/[0.04] transition-all group"
                            >
                              <div>
                                <span className="text-white text-xs font-bold block group-hover:text-primary-400 transition-colors">{action.name}</span>
                                <span className="text-slate-500 text-[11px] font-medium">{action.desc}</span>
                              </div>
                              <ChevronRight size={14} className="text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                            </NavLink>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Search Results */}
                    {searchQuery && (
                      <div className="space-y-4">
                        {/* Books Results */}
                        {filteredBooks.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-[10px] font-black text-primary-400 uppercase tracking-widest px-2">
                              Books ({filteredBooks.length})
                            </div>
                            <div className="space-y-1">
                              {filteredBooks.map((book) => (
                                <NavLink
                                  key={book._id}
                                  to="/admin/dashboard/books"
                                  onClick={() => setSearchOpen(false)}
                                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/[0.04] transition-all"
                                >
                                  <img src={book.coverImage} className="w-8 h-11 object-cover rounded bg-white/5 border border-white/10 shrink-0" />
                                  <div className="min-w-0">
                                    <span className="text-white text-xs font-bold block truncate">{book.title}</span>
                                    <span className="text-slate-500 text-[10px] block truncate">By {book.authorName}</span>
                                  </div>
                                </NavLink>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Orders Results */}
                        {filteredOrders.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest px-2">
                              Orders ({filteredOrders.length})
                            </div>
                            <div className="space-y-1">
                              {filteredOrders.map((order) => (
                                <NavLink
                                  key={order._id}
                                  to="/admin/dashboard/orders"
                                  onClick={() => setSearchOpen(false)}
                                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/[0.04] transition-all group"
                                >
                                  <div className="min-w-0">
                                    <span className="text-white text-xs font-bold block font-mono">
                                      #{order._id.substring(order._id.length - 8).toUpperCase()}
                                    </span>
                                    <span className="text-slate-500 text-[10px] block truncate">
                                      Customer: {order.user?.name || 'Guest'} ({order.user?.email || 'N/A'})
                                    </span>
                                  </div>
                                  <span className="text-white text-xs font-bold shrink-0">₹{order.totalPrice}</span>
                                </NavLink>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Users / Authors Results */}
                        {filteredUsers.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest px-2">
                              Users & Authors ({filteredUsers.length})
                            </div>
                            <div className="space-y-1">
                              {filteredUsers.map((user) => (
                                <NavLink
                                  key={user._id}
                                  to={user.role === 'author' ? '/admin/dashboard/authors' : '/admin/dashboard/users'}
                                  onClick={() => setSearchOpen(false)}
                                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/[0.04] transition-all"
                                >
                                  <div>
                                    <span className="text-white text-xs font-bold block">{user.name}</span>
                                    <span className="text-slate-500 text-[10px] block">{user.email}</span>
                                  </div>
                                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10">
                                    {user.role}
                                  </span>
                                </NavLink>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Actions Results */}
                        {filteredActions.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-2">
                              System Actions
                            </div>
                            <div className="space-y-1">
                              {filteredActions.map((action) => (
                                <NavLink
                                  key={action.name}
                                  to={action.path}
                                  onClick={() => setSearchOpen(false)}
                                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/[0.04] transition-all group"
                                >
                                  <div>
                                    <span className="text-white text-xs font-bold block group-hover:text-primary-400 transition-colors">{action.name}</span>
                                    <span className="text-slate-500 text-[11px] font-medium">{action.desc}</span>
                                  </div>
                                  <ChevronRight size={14} className="text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                                </NavLink>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* If completely empty search */}
                        {filteredBooks.length === 0 && filteredOrders.length === 0 && filteredUsers.length === 0 && filteredActions.length === 0 && (
                          <div className="text-center py-12 text-slate-500 border border-dashed border-white/10 rounded-2xl">
                            No records found matching "{searchQuery}".
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminLayout;
