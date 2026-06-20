import { Outlet, NavLink } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { User, Package, BookOpen, Heart, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AccountLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'My Profile', path: '/profile', icon: <User size={20} /> },
    { name: 'My Orders', path: '/orders', icon: <Package size={20} /> },
    { name: 'My Library', path: '/library', icon: <BookOpen size={20} /> },
    { name: 'Wishlist', path: '/wishlist', icon: <Heart size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] py-10 px-4 sm:px-6 lg:px-8 font-inter">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* Sidebar Nav */}
        <div className="w-full lg:w-1/4 shrink-0">
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 lg:sticky lg:top-28">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-xl uppercase overflow-hidden ring-4 ring-primary-50 shrink-0">
                 {user?.profileImage ? (
                   <img src={user.profileImage} alt={user?.name} className="w-full h-full object-cover" />
                 ) : (
                   user?.name?.charAt(0) || 'U'
                 )}
              </div>
              <div className="overflow-hidden">
                <h3 className="font-poppins font-bold text-[#1e293b] text-lg leading-tight truncate">{user?.name || 'Reader'}</h3>
                <span className="text-sm font-medium text-[#64748b] capitalize">{user?.role || 'Customer'}</span>
              </div>
            </div>

            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) => 
                    `flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all ${
                      isActive 
                        ? 'bg-primary-50 text-primary-700 shadow-sm border border-primary-100' 
                        : 'text-[#64748b] hover:bg-gray-50 hover:text-[#1e293b] border border-transparent'
                    }`
                  }
                >
                  {item.icon} {item.name}
                </NavLink>
              ))}
            </nav>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl font-bold text-rose-500 hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-100"
              >
                <LogOut size={20} /> Logout
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Pane */}
        <div className="flex-1 w-full lg:w-3/4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AccountLayout;
