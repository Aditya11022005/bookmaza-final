const Newsletter = () => (
  <section className="bg-[#1e293b] py-14 sm:py-20 md:py-24 px-5 sm:px-8 text-center mt-10 sm:mt-16 md:mt-20 border-t-[5px] border-primary-500 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-t from-primary-900/40 to-transparent z-0"></div>
    <div className="relative z-10 max-w-2xl mx-auto">
      <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white mb-3 sm:mb-5 tracking-tight font-poppins">Stay in the Loop</h2>
      <p className="text-primary-100 text-sm sm:text-base md:text-xl mb-7 sm:mb-10 font-medium leading-relaxed max-w-xl mx-auto">
        Subscribe to get curated book recommendations, audio exclusive drops, and VIP discount codes.
      </p>
      
      <form className="flex flex-col sm:flex-row max-w-xl mx-auto gap-3" onSubmit={e => e.preventDefault()}>
         <input
           type="email"
           placeholder="Your email address"
           className="flex-1 px-4 sm:px-6 py-3.5 sm:py-5 rounded-xl outline-none focus:ring-4 ring-primary-500 font-medium text-sm sm:text-base bg-white text-[#1e293b] shadow-inner"
         />
         <button
           type="submit"
           className="bg-primary-500 hover:bg-primary-600 text-white font-extrabold px-7 sm:px-10 py-3.5 sm:py-5 rounded-xl shadow-[0_8px_25px_rgba(106,13,173,0.4)] transition-all hover:-translate-y-0.5 text-sm sm:text-base whitespace-nowrap"
         >
           Subscribe
         </button>
      </form>
    </div>
  </section>
);

export default Newsletter;
