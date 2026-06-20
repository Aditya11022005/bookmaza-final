import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import AdminLayout from './layouts/AdminLayout';
import AuthorLayout from './layouts/AuthorLayout';
import AccountLayout from './layouts/AccountLayout';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAuthors from './pages/admin/AdminAuthors';
import AdminBooks from './pages/admin/AdminBooks';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCategories from './pages/admin/AdminCategories';
import AdminSettings from './pages/admin/AdminSettings';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminBanners from './pages/admin/AdminBanners';
import AdminCertificates from './pages/admin/AdminCertificates';
import { AdminReviews, AdminMessages, AdminSubscribers } from './pages/admin/AdminMarketing';

// Author Pages
import AuthorLogin from './pages/author/AuthorLogin';
import AuthorApplication from './pages/author/AuthorApplication';
import AuthorDashboard from './pages/author/AuthorDashboard';
import AuthorUpload from './pages/author/AuthorUpload';
import AuthorProfile from './pages/author/AuthorProfile';
import AuthorEarnings from './pages/author/AuthorEarnings';
import AuthorBooks from './pages/author/AuthorBooks';


// Client Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import BookDetails from './pages/BookDetails';
import Cart from './pages/Cart';
import Library from './pages/Library';
import EbookReader from './components/EbookReader';
import AudioPlayer from './components/AudioPlayer';
import Shop from './pages/Shop';
import Category from './pages/Category';
import Categories from './pages/Categories';
import About from './pages/About';
import Contact from './pages/Contact';
import SearchResults from './pages/SearchResults';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import VerifyResetOTP from './pages/VerifyResetOTP';
import ResetPassword from './pages/ResetPassword';
import Terms from './pages/Terms';
import FAQ from './pages/FAQ';
import PrivacyPolicy from './pages/PrivacyPolicy';
import RefundPolicy from './pages/RefundPolicy';
import ShippingPolicy from './pages/ShippingPolicy';
import Wishlist from './pages/Wishlist';
import MyProfile from './pages/MyProfile';
import MyOrders from './pages/MyOrders';
import OrderDetails from './pages/OrderDetails';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Subscriptions from './pages/Subscriptions';


// Stub Client Pages
const Authors = () => <div className="p-10 text-center text-3xl font-bold">Authors Directory</div>;
const MyAccount = () => <div className="p-10 text-center text-3xl font-bold">My Account Overview</div>;

const Page404 = () => <div className="p-20 text-center text-5xl font-black text-gray-300">404 - Page Not Found</div>;

// Stub Admin Pages
const AdminPlaceholder = ({title}) => <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[500px]"><h2 className="text-3xl font-bold text-gray-800">{title}</h2><p className="text-gray-500 mt-2 font-medium">Module is currently being scaffolded.</p></div>;

const App = () => {
  return (
    <Router>
      <Routes>
        
        {/* Core Application / Storefront */}
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="categories" element={<Categories />} />
          <Route path="category/:slug" element={<Category />} />
          <Route path="format/:type" element={<Shop />} />
          <Route path="book/:id" element={<BookDetails />} />
          <Route path="authors" element={<Authors />} />
          <Route path="author/:id" element={<AuthorProfile />} />
          <Route path="search" element={<SearchResults />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order-success" element={<OrderSuccess />} />
          <Route path="subscriptions" element={<Subscriptions />} />
          
          {/* Protected Account Routes */}
          <Route element={<ProtectedRoute />}>
             <Route element={<AccountLayout />}>
                <Route path="account" element={<Navigate to="/profile" replace />} />
                <Route path="profile" element={<MyProfile />} />
              <Route path="orders" element={<MyOrders />} />
              <Route path="orders/:id" element={<OrderDetails />} />
              <Route path="library" element={<Library />} />
                <Route path="wishlist" element={<Wishlist />} />
             </Route>
          </Route>
          
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="privacy" element={<PrivacyPolicy />} />
          <Route path="terms" element={<Terms />} />
          <Route path="refund-policy" element={<RefundPolicy />} />
          <Route path="shipping-policy" element={<ShippingPolicy />} />
          
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="verify-reset-otp" element={<VerifyResetOTP />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="verify-email" element={<VerifyEmail />} />
          <Route path="*" element={<Page404 />} />
        </Route>
        
        {/* Fullscreen Media Players */}
        <Route path="/read/:id" element={<EbookReader />} />
        <Route path="/listen/:id" element={<AudioPlayer />} />
        
        {/* Admin Dashboard */}
        {/* /admin       → redirects to /admin/dashboard (via ProtectedAdminRoute) */}
        {/* /admin/login → public login page */}
        {/* /admin/dashboard/* → protected */}
        <Route path="/admin/login" element={<AdminLogin />} />
        
        <Route path="/admin" element={<ProtectedAdminRoute />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="authors" element={<AdminAuthors />} />
            <Route path="books" element={<AdminBooks />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="payments" element={<AdminPlaceholder title="Stripe Payments Log" />} />
            <Route path="banners" element={<AdminBanners />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="subscribers" element={<AdminSubscribers />} />
            <Route path="certificates" element={<AdminCertificates />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Route>

        {/* Author Portal */}
        <Route path="/author/login" element={<AuthorLogin />} />
        <Route path="/author/apply" element={<AuthorApplication />} />
        
        <Route path="/author" element={<AuthorLayout />}>
          <Route index element={<Navigate to="/author/dashboard" replace />} />
          <Route path="dashboard" element={<AuthorDashboard />} />
          <Route path="books" element={<AuthorBooks />} />
          <Route path="upload" element={<AuthorUpload />} />
          <Route path="status" element={<AdminPlaceholder title="Publishing Approvals" />} />
          <Route path="earnings" element={<AuthorEarnings />} />
          <Route path="reviews" element={<AdminPlaceholder title="Fan Reviews" />} />
          <Route path="profile" element={<AuthorProfile />} />
        </Route>

      </Routes>
    </Router>
  );
};

export default App;
