import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { 
  BookOpen, BarChart, Settings, Menu, X, ChevronRight, ChevronLeft,
  DollarSign, UploadCloud, Star, User, LogOut, Search, Bell, Sun, Moon
} from 'lucide-react';
import { toast } from 'sonner';

const PAGE_TITLES = {
  '/author': 'Overview Dashboard',
  '/author/dashboard': 'Overview Dashboard',
  '/author/books': 'My Books',
  '/author/upload': 'Upload Hub',
  '/author/status': 'Publishing Status',
  '/author/earnings': 'Earnings & Royalties',
  '/author/reviews': 'Fan Reviews',
  '/author/profile': 'Author Profile',
};

const AuthorLayout = () => {
  const { user, logout } = useAuthStore(); // Using standard auth store or dummy
  const navigate = useNavigate();
  const location = useLocation();

  // Route protection
  const isAuthor = user && user.role === 'author';
  const isApproved = user && user.isAuthorApproved;

  useEffect(() => {
    if (!user) {
      navigate('/author/login', { replace: true });
    } else if (!isAuthor) {
      toast.error('Access denied. This area is reserved for authors.');
      navigate('/', { replace: true });
    } else if (!isApproved) {
      toast.error('Your author account is pending admin approval.');
      navigate('/author/login', { replace: true });
    }
  }, [user, isAuthor, isApproved, navigate]);

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);

  if (!isAuthor || !isApproved) {
    return null; // Prevent UI rendering while redirecting
  }


  const currentTitle = PAGE_TITLES[location.pathname] || 'Author Studio';
  const authorName = user?.name || 'Jane Doe';
  const initials = authorName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'A';

  const navItems = [
    { name: 'Dashboard', path: '/author', icon: BarChart },
    { name: 'My Books', path: '/author/books', icon: BookOpen },
    { name: 'Upload Hub', path: '/author/upload', icon: UploadCloud },
    { name: 'Status & Approvals', path: '/author/status', icon: Settings },
    { name: 'Earnings', path: '/author/earnings', icon: DollarSign },
    { name: 'Reviews', path: '/author/reviews', icon: Star },
    { name: 'Profile', path: '/author/profile', icon: User },
  ];

  const handleLogout = () => {
    logout();
    navigate('/author/login', { replace: true });
  };

  const SIDEBAR_W = collapsed ? 'w-[72px]' : 'w-64';

  return (
    <div className={`flex h-screen bg-[#0f172a] overflow-hidden font-inter ${isLightMode ? 'admin-light-mode' : ''}`}>
      
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[#0d1526] border-r border-white/[0.06] transition-all duration-300 ease-in-out ${SIDEBAR_W} ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 lg:flex lg:shrink-0`}>
        
        {/* Logo */}
        <div className={`h-16 flex items-center border-b border-white/[0.06] shrink-0 ${collapsed ? 'justify-center px-3' : 'px-5 gap-3'}`}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-amber-700/40 shrink-0">
            PM
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-white font-poppins font-black text-[15px] leading-none">Pustak Maza</p>
              <p className="text-amber-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">Author Studio</p>
            </div>
          )}
          <button className="ml-auto lg:hidden text-slate-500 hover:text-white transition-colors" onClick={() => setMobileOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin scrollbar-thumb-white/10">
          {!collapsed && (
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 px-3 mb-3 mt-2">Main Menu</p>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink 
                key={item.name}
                to={item.path}
                end={item.path === '/author'}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? item.name : undefined}
                className={({ isActive }) => `group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative ${isActive ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'text-slate-400 hover:bg-white/5 hover:text-white'} ${collapsed ? 'justify-center' : ''}`}
              >
                {({ isActive }) => (
                  <>
                    <Icon size={20} className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-white' : ''}`} />
                    {!collapsed && <span className="font-semibold text-[14px] truncate">{item.name}</span>}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User / Logout */}
        <div className="shrink-0 border-t border-white/[0.06] p-3 space-y-1">
          {!collapsed && (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-2">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-xs shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-bold truncate leading-tight">{authorName}</p>
                <p className="text-slate-500 text-[11px] truncate">Verified Author</p>
              </div>
            </div>
          )}

          <button onClick={handleLogout} title={collapsed ? 'Sign Out' : undefined} className={`w-full group flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 ${collapsed ? 'justify-center' : ''}`}>
            <LogOut size={20} className="shrink-0 group-hover:scale-110 transition-transform duration-200" />
            {!collapsed && <span className="font-semibold text-[14px]">Sign Out</span>}
          </button>

          <button onClick={() => setCollapsed(c => !c)} className={`hidden lg:flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-white/5 hover:text-slate-300 transition-all duration-200 ${collapsed ? 'justify-center' : ''}`}>
            <ChevronLeft size={18} className={`shrink-0 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
            {!collapsed && <span className="font-semibold text-[13px]">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-16 bg-[#111827]/90 backdrop-blur-md border-b border-white/[0.06] flex items-center px-4 lg:px-6 gap-4 shrink-0 sticky top-0 z-30">
          <button className="lg:hidden text-slate-400 hover:text-white transition-colors p-1" onClick={() => setMobileOpen(true)}>
            <Menu size={22} />
          </button>

          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm min-w-0">
            <span className="text-slate-600 font-medium hidden sm:block">Studio</span>
            <ChevronRight size={14} className="text-slate-700 hidden sm:block shrink-0" />
            <span className="text-white font-bold truncate">{currentTitle}</span>
          </div>

          <div className="flex-1" />

          {/* Top Actions */}
          <div className="flex items-center gap-3">
            <div 
              onClick={() => toast.info('Author deep search coming soon!')}
              className="hidden md:flex items-center gap-2 bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2 text-slate-500 hover:bg-white/[0.08] transition-all cursor-pointer group"
            >
              <Search size={16} className="group-hover:text-slate-300 transition-colors" />
              <span className="text-sm font-medium">Search Books...</span>
            </div>

            <button onClick={() => setIsLightMode(!isLightMode)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all preserve-colors">
              {isLightMode ? <Moon size={17} /> : <Sun size={17} />}
            </button>

            <button className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all">
              <Bell size={17} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full border border-[#111827]" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 scrollbar-thin scrollbar-thumb-white/10 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-amber-600/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="relative z-10 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AuthorLayout;
