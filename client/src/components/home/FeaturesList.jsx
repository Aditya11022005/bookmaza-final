import { Truck, ShieldCheck, Award, Smartphone } from 'lucide-react';

const FeaturesList = () => {
  const features = [
    { icon: Truck, title: "Fast Delivery", desc: "Free shipping on orders over ₹499" },
    { icon: ShieldCheck, title: "Secure Payment", desc: "100% secure Stripe processing" },
    { icon: Award, title: "Premium Quality", desc: "Verified authors & publishers" },
    { icon: Smartphone, title: "Easy Access", desc: "Read & listen anywhere instantly" }
  ];
  
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 md:gap-6 py-4 sm:py-8">
      {features.map((f, i) => (
        <div key={i} className="flex flex-col items-center text-center p-4 sm:p-6 md:p-8 bg-white rounded-xl sm:rounded-2xl border border-[#e2e8f0] shadow-sm hover:shadow-[0_15px_30px_-10px_rgba(106,13,173,0.1)] hover:border-primary-200 transition-all duration-300 transform hover:-translate-y-1 group">
           <div className="text-primary-600 mb-3 sm:mb-5 bg-primary-50 p-3 sm:p-4 md:p-5 rounded-xl group-hover:bg-primary-500 group-hover:text-white transition-colors duration-300">
             <f.icon size={24} className="sm:hidden"/>
             <f.icon size={32} className="hidden sm:block md:hidden"/>
             <f.icon size={36} className="hidden md:block"/>
           </div>
           <h4 className="font-extrabold text-[#1e293b] text-sm sm:text-base md:text-lg mb-1 sm:mb-2 group-hover:text-primary-600 transition-colors font-poppins">{f.title}</h4>
           <p className="text-[#64748b] text-[11px] sm:text-sm font-medium leading-relaxed">{f.desc}</p>
        </div>
      ))}
    </div>
  );
};

export default FeaturesList;
