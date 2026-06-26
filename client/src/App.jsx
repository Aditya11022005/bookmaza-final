import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';
import RootLayout from './layouts/RootLayout';
import AdminLayout from './layouts/AdminLayout';
import AuthorLayout from './layouts/AuthorLayout';
import AccountLayout from './layouts/AccountLayout';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';

// Admin Pages
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminAuthors = lazy(() => import('./pages/admin/AdminAuthors'));
const AdminBooks = lazy(() => import('./pages/admin/AdminBooks'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminCoupons = lazy(() => import('./pages/admin/AdminCoupons'));
const AdminBanners = lazy(() => import('./pages/admin/AdminBanners'));
const AdminAnnouncements = lazy(() => import('./pages/admin/AdminAnnouncements'));
const AdminCertificates = lazy(() => import('./pages/admin/AdminCertificates'));
const AdminReviews = lazy(() => import('./pages/admin/AdminMarketing').then(m => ({ default: m.AdminReviews })));
const AdminMessages = lazy(() => import('./pages/admin/AdminMarketing').then(m => ({ default: m.AdminMessages })));
const AdminSubscribers = lazy(() => import('./pages/admin/AdminMarketing').then(m => ({ default: m.AdminSubscribers })));

// Author Pages
const AuthorLogin = lazy(() => import('./pages/author/AuthorLogin'));
const AuthorApplication = lazy(() => import('./pages/author/AuthorApplication'));
const AuthorDashboard = lazy(() => import('./pages/author/AuthorDashboard'));
const AuthorUpload = lazy(() => import('./pages/author/AuthorUpload'));
const AuthorProfile = lazy(() => import('./pages/author/AuthorProfile'));
const AuthorEarnings = lazy(() => import('./pages/author/AuthorEarnings'));
const AuthorBooks = lazy(() => import('./pages/author/AuthorBooks'));

// Client Pages
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const BookDetails = lazy(() => import('./pages/BookDetails'));
const Cart = lazy(() => import('./pages/Cart'));
const Library = lazy(() => import('./pages/Library'));
const EbookReader = lazy(() => import('./components/EbookReader'));
const AudioPlayer = lazy(() => import('./components/AudioPlayer'));
const Shop = lazy(() => import('./pages/Shop'));
const Category = lazy(() => import('./pages/Category'));
const Categories = lazy(() => import('./pages/Categories'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const SearchResults = lazy(() => import('./pages/SearchResults'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const VerifyResetOTP = lazy(() => import('./pages/VerifyResetOTP'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Terms = lazy(() => import('./pages/Terms'));
const FAQ = lazy(() => import('./pages/FAQ'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const RefundPolicy = lazy(() => import('./pages/RefundPolicy'));
const ShippingPolicy = lazy(() => import('./pages/ShippingPolicy'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const MyProfile = lazy(() => import('./pages/MyProfile'));
const MyOrders = lazy(() => import('./pages/MyOrders'));
const OrderDetails = lazy(() => import('./pages/OrderDetails'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const Subscriptions = lazy(() => import('./pages/Subscriptions'));


// Stub Client Pages
const Authors = () => <div className="p-10 text-center text-3xl font-bold">Authors Directory</div>;
const MyAccount = () => <div className="p-10 text-center text-3xl font-bold">My Account Overview</div>;

const Page404 = () => <div className="p-20 text-center text-5xl font-black text-gray-300">404 - Page Not Found</div>;

// Stub Admin Pages
const AdminPlaceholder = ({ title }) => <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[500px]"><h2 className="text-3xl font-bold text-gray-800">{title}</h2><p className="text-gray-500 mt-2 font-medium">Module is currently being scaffolded.</p></div>;

const App = () => {
  return (
    <Router>
      <Suspense fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] font-poppins gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin"></div>
          <span className="text-[#64748b] font-bold text-sm uppercase tracking-wider animate-pulse">Loading Book Maza...</span>
        </div>
      }>
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
              <Route path="announcements" element={<AdminAnnouncements />} />
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
          <Route path="/author/apply" element={<Navigate to="/author/login" replace />} />

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
        <SpeedInsights />
        <Analytics />
      </Suspense>
    </Router>
  );
};

export default App;
