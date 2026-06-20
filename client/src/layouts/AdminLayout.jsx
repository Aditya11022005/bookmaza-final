import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import useAdminAuthStore from '../store/adminAuthStore';
import {
  LayoutDashboard, BookOpen, Users, ShoppingBag, UserCog,
  Image, Tag, Settings, LogOut, Menu, X, ChevronRight,
  Bell, Search, Sun, Moon, ChevronLeft, Star, MessageSquare, Mail, Award, FolderOpen
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

  const SIDEBAR_W = collapsed ? 'w-[72px]' : 'w-64';

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

          {/* Search (decorative for now) */}
          <div className="hidden md:flex items-center gap-2 bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2 text-slate-500 hover:bg-white/[0.08] transition-all cursor-pointer group">
            <Search size={16} className="group-hover:text-slate-300 transition-colors" />
            <span className="text-sm font-medium">Search…</span>
            <kbd className="ml-2 text-[10px] font-bold bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-slate-600">⌘K</kbd>
          </div>

          {/* Theme Toggle */}
          <button 
            onClick={() => setIsLightMode(!isLightMode)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all preserve-colors"
          >
            {isLightMode ? <Moon size={17} /> : <Sun size={17} />}
          </button>

          {/* Notifications */}
          <button className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all">
            <Bell size={17} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full border border-[#111827]" />
          </button>

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
    </div>
  );
};

export default AdminLayout;
