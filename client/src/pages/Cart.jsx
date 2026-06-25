import { Link, useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import { Trash2, ShoppingBag, Package, BookOpen, Headphones, ArrowRight, ShieldCheck } from 'lucide-react';
import usePageMeta from '../hooks/usePageMeta';
import { getOptimizedImageUrl } from '../utils/image';

const formatIcon = { hardcopy: Package, ebook: BookOpen, audiobook: Headphones };

const Cart = () => {
  usePageMeta('Cart', 'Review your selected books and proceed to checkout on Pustak Maza.');
  const { cartItems, removeFromCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * (item.qty || item.quantity || 1), 0);

  const checkoutHandler = () => {
    if (!user) navigate('/login?redirect=/checkout');
    else navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-5 px-4">
        <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center">
          <ShoppingBag size={36} className="text-primary-400" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-800 font-poppins">Your cart is empty</h2>
        <p className="text-gray-500 text-sm">Looks like you haven't added anything yet.</p>
        <Link to="/" className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-3 rounded-xl transition shadow-lg">
          Browse Books
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6 sm:mb-8 font-poppins flex items-center gap-3">
        <ShoppingBag className="text-primary-500" size={28} />
        Shopping Cart
        <span className="text-base font-bold text-gray-400 ml-1">({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</span>
      </h1>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">

        {/* Cart Items */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] overflow-hidden">
            <ul className="divide-y divide-gray-100">
              {cartItems.map((item) => {
                const qty = item.qty || item.quantity || 1;
                const img = item.coverImage || item.image || null;
                const Icon = formatIcon[item.format] || Package;

                return (
                  <li key={`${item.book}-${item.format}`} className="p-4 sm:p-6">
                    <div className="flex gap-4 sm:gap-5">
                      {/* Book Image */}
                      <div className="w-16 h-24 sm:w-20 sm:h-28 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm">
                        {img ? (
                          <img
                            src={getOptimizedImageUrl(img, 150)}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary-50">
                            <BookOpen size={24} className="text-primary-300" />
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <Link
                            to={`/book/${item.book}`}
                            className="text-sm sm:text-base font-extrabold text-gray-900 hover:text-primary-600 transition-colors font-poppins line-clamp-2 leading-snug"
                          >
                            {item.title}
                          </Link>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <Icon size={12} className="text-primary-500 flex-shrink-0" />
                            <span className="text-xs font-bold text-gray-500 capitalize">{item.format}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3 sm:mt-4">
                          <span className="text-base sm:text-lg font-black text-gray-900">
                            ₹{(item.price * qty).toFixed(2)}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.book, item.format)}
                            className="flex items-center gap-1.5 text-red-400 hover:text-red-600 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors border border-red-100"
                          >
                            <Trash2 size={14} />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-80 xl:w-96 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] p-5 sm:p-6 lg:sticky lg:top-28">
            <h2 className="text-lg font-extrabold text-gray-900 mb-5 font-poppins border-b border-gray-100 pb-4">
              Order Summary
            </h2>

            <div className="space-y-3 mb-5">
              <div className="flex justify-between items-center text-sm text-gray-600 font-medium">
                <span>Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</span>
                <span className="font-bold text-gray-800">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-500 font-medium">
                <span>Shipping</span>
                <span className="text-green-600 font-bold">
                  {subtotal >= 499 ? 'FREE' : '₹49'}
                </span>
              </div>
              {subtotal < 499 && (
                <p className="text-xs text-primary-600 font-semibold bg-primary-50 px-3 py-2 rounded-lg">
                  Add ₹{(499 - subtotal).toFixed(0)} more for free shipping!
                </p>
              )}
            </div>

            <div className="flex justify-between items-center text-xl font-black text-gray-900 border-t border-gray-100 pt-4 mb-5">
              <span>Total</span>
              <span>₹{(subtotal + (subtotal >= 499 ? 0 : 49)).toFixed(2)}</span>
            </div>

            <button
              onClick={checkoutHandler}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-extrabold py-3.5 rounded-xl transition-all shadow-[0_8px_20px_-4px_rgba(106,13,173,0.35)] hover:shadow-[0_12px_25px_-4px_rgba(106,13,173,0.45)] flex items-center justify-center gap-2 hover:-translate-y-0.5"
            >
              Proceed to Checkout
              <ArrowRight size={18} />
            </button>

            <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-gray-400 font-semibold">
              <ShieldCheck size={13} className="text-green-500" />
              Secure & Encrypted Payment
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100">
              <Link to="/shop" className="text-sm text-primary-600 hover:text-primary-700 font-bold flex items-center justify-center gap-1 hover:underline">
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
