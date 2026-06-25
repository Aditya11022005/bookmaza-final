import { Link } from 'react-router-dom';
import { getCategoryIcon } from '../../utils/categoryHelper';

const CategoryGrid = ({ categories = [] }) => {
  const cats = categories;

  return (
    <section className="relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-12 gap-3 sm:gap-4">
         <div>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-[#1e293b] tracking-tight mb-2 font-poppins">Explore by Category</h2>
            <p className="text-[#64748b] text-sm sm:text-base md:text-xl font-medium">Find your next obsession from our curated collections.</p>
         </div>
         <Link
           to="/categories"
           className="text-primary-600 font-bold bg-white hover:text-primary-700 hover:bg-primary-50 px-4 py-2 sm:px-6 sm:py-3 rounded-xl transition-all flex items-center gap-2 shadow-sm border border-primary-100 text-sm sm:text-base whitespace-nowrap"
         >
           View All <span aria-hidden="true" className="text-base sm:text-xl">→</span>
         </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
        {cats.slice(0, 6).map((cat) => {
          const Icon = getCategoryIcon(cat.name);
          return (
            <Link
              key={cat.name}
              to={`/category/${cat.slug || cat.name.toLowerCase()}`}
              className="bg-white border border-[#e2e8f0] rounded-2xl p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center gap-3 sm:gap-5 hover:shadow-[0_15px_30px_-5px_rgba(106,13,173,0.15)] hover:border-primary-300 transition-all duration-300 transform hover:-translate-y-1 group"
            >
               <div className="bg-primary-50 text-primary-600 p-3 sm:p-4 md:p-5 rounded-xl group-hover:bg-primary-500 group-hover:text-white group-hover:shadow-[0_10px_20px_-5px_rgba(106,13,173,0.3)] transition-all duration-300">
                 <Icon size={22} className="sm:hidden" />
                 <Icon size={28} className="hidden sm:block md:hidden" />
                 <Icon size={34} className="hidden md:block" />
               </div>
               <span className="font-extrabold text-[#1e293b] text-center text-[10px] sm:text-sm md:text-base group-hover:text-primary-600 transition-colors uppercase tracking-wide font-poppins leading-tight">
                 {cat.name}
               </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
export default CategoryGrid;
