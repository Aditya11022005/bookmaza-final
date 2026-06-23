import { Star, Quote } from 'lucide-react';

const Testimonials = () => {
  const tests = [
    { name: "Sarah M.", role: "Avid Reader", text: "Pustak Maza's audiobook player is incredibly smooth. I listen every day on my commute and the sync is flawless!" },
    { name: "James K.", role: "Student", text: "The premium feel of the platform and the PDF reader's dark mode makes late-night studying so much better." },
    { name: "Elena R.", role: "Author", text: "As an author, their dashboard is the cleanest I've ever seen. Highly recommend publishing your work here." }
  ];
  
  return (
    <section className="py-8 sm:py-12 md:py-16 relative w-full overflow-hidden">
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-[#1e293b] mb-3 tracking-tight font-poppins">Loved by Readers Globally</h2>
        <p className="text-[#64748b] text-sm sm:text-base md:text-lg font-medium">Join thousands of book lovers who choose Pustak Maza.</p>
      </div>
      <div className="w-full overflow-x-auto md:overflow-visible [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex md:grid md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 pb-4 md:pb-0 px-1 sm:px-0">
          {tests.map((t, i) => (
            <div key={i} className="bg-white p-6 sm:p-7 md:p-10 rounded-2xl border border-[#e2e8f0] shadow-sm relative hover:shadow-[0_15px_35px_-10px_rgba(106,13,173,0.15)] hover:border-primary-200 transition-all duration-300 transform hover:-translate-y-1 group w-[285px] sm:w-[320px] md:w-auto shrink-0">
              <Quote className="absolute top-5 right-5 sm:top-8 sm:right-8 text-primary-50 group-hover:text-primary-100 transition-colors" size={40} />
              <div className="flex gap-1 text-yellow-400 mb-4 relative z-10">
                 <Star fill="currentColor" size={16}/><Star fill="currentColor" size={16}/><Star fill="currentColor" size={16}/><Star fill="currentColor" size={16}/><Star fill="currentColor" size={16}/>
              </div>
              <p className="text-[#1e293b] text-sm sm:text-base font-medium italic mb-5 sm:mb-7 relative z-10 leading-relaxed break-words whitespace-normal">"{t.text}"</p>
              <div className="font-extrabold text-[#1e293b] text-sm sm:text-base mb-0.5 font-poppins">{t.name}</div>
              <div className="text-[10px] sm:text-xs text-primary-600 font-extrabold uppercase tracking-widest">{t.role}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
