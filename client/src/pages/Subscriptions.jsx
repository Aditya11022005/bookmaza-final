import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, ShieldCheck, Sparkles, Award } from 'lucide-react';
import axios from '../api/axios';
import useAuthStore from '../store/authStore';
import { toast } from 'sonner';

const Subscriptions = () => {
  const { user, login } = useAuthStore();
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const { data } = await axios.get('/subscriptions/current');
        setCurrentSubscription(data);
      } catch (err) {
        console.error(err);
      }
    };
    if (user) fetchSubscription();
  }, [user]);

  const handleSubscribe = async (plan) => {
    setLoadingPlan(plan);
    try {
      const { data } = await axios.post('/subscriptions/subscribe', {
        plan,
        paymentId: `sub_mock_${Date.now()}`
      });

      toast.success(`Successfully subscribed to ${plan.toUpperCase()}!`);
      setCurrentSubscription(data.subscription);
      
      // Update store user details
      if (user) {
        login({
          ...user,
          subscription: {
            plan,
            endDate: data.subscription.endDate,
            active: true
          }
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Subscription failed');
    }
    setLoadingPlan(null);
  };

  const plans = [
    {
      name: 'basic',
      title: 'Basic Plan',
      price: '₹299',
      features: ['Unlimited Reading', 'eBooks Access', 'Bookmark & Highlights Sync'],
      color: 'from-blue-600 to-indigo-600',
      icon: ShieldCheck
    },
    {
      name: 'premium',
      title: 'Premium Plan',
      price: '₹499',
      features: ['Unlimited Reading & Listening', 'eBooks & Audiobooks', 'Offline Reading Access', 'Priority Releases'],
      color: 'from-purple-600 to-indigo-600',
      icon: Sparkles,
      popular: true
    },
    {
      name: 'gold',
      title: 'Gold Club',
      price: '₹799',
      features: ['All Premium Features', 'Early Access to New Releases', 'Special Author Webcasts', 'Free Hardcopy Deliveries (1/mo)', 'No Ads'],
      color: 'from-amber-600 to-purple-600',
      icon: Award
    }
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 py-12 md:py-20 min-h-screen">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-poppins font-black text-gray-900 tracking-tight"
        >
          Choose Your Literary Journey
        </motion.h1>
        <p className="text-gray-500 mt-4 text-lg">
          Unlock unlimited access to the finest collection of eBooks, Audiobooks, and exclusive publishing experiences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan, idx) => {
          const Icon = plan.icon;
          const isActive = currentSubscription?.plan === plan.name && currentSubscription?.status === 'active';
          
          return (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`bg-white rounded-[2rem] border relative overflow-hidden flex flex-col p-8 sm:p-10 shadow-lg hover:shadow-xl transition-all duration-300 ${
                plan.popular ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <span className="absolute top-5 right-5 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Most Popular
                </span>
              )}

              <div className="mb-8">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${plan.color} text-white flex items-center justify-center mb-6`}>
                  <Icon size={24} />
                </div>
                <h3 className="text-2xl font-poppins font-black text-gray-900 capitalize">{plan.title}</h3>
                <div className="flex items-baseline mt-4">
                  <span className="text-4xl font-black text-gray-900">{plan.price}</span>
                  <span className="text-gray-500 ml-2 text-sm">/ month</span>
                </div>
              </div>

              <div className="space-y-4 mb-10 flex-grow">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                      <Check size={14} />
                    </div>
                    <span className="text-gray-600 font-medium text-sm sm:text-base">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                disabled={loadingPlan || isActive}
                onClick={() => handleSubscribe(plan.name)}
                className={`w-full py-4 rounded-2xl font-bold text-center transition-all ${
                  isActive
                    ? 'bg-green-600 text-white cursor-default'
                    : 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-600/20 hover:scale-[1.02]'
                } disabled:opacity-50`}
              >
                {loadingPlan === plan.name ? 'Processing...' : isActive ? 'Active Subscription' : 'Subscribe Now'}
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Subscriptions;
