import { motion } from 'framer-motion';
import { Book, Lightbulb, PenTool, Library, BookOpen, Headphones, Package, ShieldCheck, Star, Lock, Smartphone, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
};

const About = () => {
  usePageMeta('About', 'Learn more about Pustak Maza, a modern publication house and publishing imprint of Book Saga Publication.');
  return (
    <div className="w-full bg-[#f8fafc] overflow-hidden">

      {/* 1. HERO SECTION */}
      <section className="relative w-full pt-32 pb-24 md:pt-40 md:pb-32 px-6 lg:px-12 bg-[#1e293b] overflow-hidden">
        {/* Purple Gradient & Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-800 via-primary-500/80 to-primary-900 z-0"></div>
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay z-0"></div>

        <div className="max-w-[1400px] mx-auto relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="flex-1 text-center lg:text-left">
            <motion.div variants={fadeInUp} className="inline-block bg-white/10 backdrop-blur-md border border-white/20 text-primary-50 font-bold px-4 py-1.5 rounded-full text-xs uppercase tracking-widest mb-6 shadow-sm">
              Publishing Imprint
            </motion.div>
            <motion.h1 variants={fadeInUp} className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight font-poppins">
              About Pustak Maza
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-primary-100 mb-6 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
              A modern publication house dedicated to stories, knowledge, and creativity.
            </motion.p>
            <motion.p variants={fadeInUp} className="text-lg text-primary-200 mb-10 font-semibold border-l-4 border-primary-300 pl-4 py-1 max-w-xl mx-auto lg:mx-0">
              Pustak Maza is a publishing imprint of <Link to="/about" className="text-white hover:text-primary-300 underline decoration-primary-400 underline-offset-4 transition-colors">Book Saga Publications</Link>.
            </motion.p>
            <motion.div variants={fadeInUp}>
              <Link to="/shop" className="inline-flex items-center justify-center gap-2 bg-white text-primary-600 px-8 py-4 rounded-xl font-bold text-lg shadow-[0_8px_25px_-5px_rgba(0,0,0,0.3)] hover:bg-primary-50 hover:-translate-y-1 transition-all">
                Explore Books <ArrowRight size={20} />
              </Link>
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="flex-1 w-full max-w-lg lg:max-w-none">
            <div className="relative rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.4)] border-4 border-white/10 bg-white/5 backdrop-blur-sm">
              <img src="/images/about_hero.png" alt="Library Illustration" className="w-full h-auto object-cover" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. WHO WE ARE */}
      <section className="py-24 px-6 lg:px-12 max-w-[1400px] mx-auto bg-[#f8fafc]">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} className="flex-1">
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#1e293b] mb-6 font-poppins">Who We Are</h2>
            <div className="w-20 h-1.5 bg-primary-500 rounded-full mb-8"></div>
            <p className="text-[#64748b] text-xl font-medium leading-relaxed mb-6">
              Pustak Maza is a modern publication house committed to delivering high-quality books across multiple formats including ebooks, audiobooks, and printed editions.
            </p>
            <p className="text-[#64748b] text-xl font-medium leading-relaxed">
              As a publishing imprint of <strong className="text-primary-600">Book Saga Publications</strong>, we aim to bring meaningful stories and knowledge to readers everywhere.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="flex-1 w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-[0_15px_40px_-10px_rgba(106,13,173,0.15)] border border-gray-100 p-3">
            <img src="/images/about_team.png" alt="Publishing Team" className="w-full h-auto rounded-2xl" />
          </motion.div>
        </div>
      </section>

      {/* 3. OUR MISSION */}
      <section className="py-24 px-6 w-full bg-white border-y border-[#e2e8f0]">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#1e293b] mb-6 font-poppins">Our Mission</h2>
            <p className="text-[#64748b] text-xl max-w-2xl mx-auto font-medium">Driving the future of reading through innovation and support for our creative community.</p>
          </div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Lightbulb, title: "Promote Knowledge", desc: "Spreading impactful ideas globally." },
              { icon: PenTool, title: "Empower Authors", desc: "Supporting writers at every step." },
              { icon: Star, title: "Deliver Quality Content", desc: "Curating only the absolute best." },
              { icon: Library, title: "Build Reading Culture", desc: "Fostering communities of readers." }
            ].map((item, i) => (
              <motion.div key={i} variants={fadeInUp} className="bg-[#f8fafc] p-10 rounded-2xl border border-[#e2e8f0] hover:border-primary-300 hover:shadow-[0_15px_30px_-5px_rgba(106,13,173,0.15)] transition-all transform hover:-translate-y-2 group">
                <div className="bg-white text-primary-500 w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-sm border border-gray-100 group-hover:bg-primary-500 group-hover:text-white transition-colors">
                  <item.icon size={32} />
                </div>
                <h3 className="text-xl font-bold text-[#1e293b] mb-3 font-poppins group-hover:text-primary-600 transition-colors">{item.title}</h3>
                <p className="text-[#64748b] font-medium leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4. WHAT WE OFFER */}
      <section className="py-24 px-6 lg:px-12 max-w-[1400px] mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#1e293b] mb-6 font-poppins">What We Offer</h2>
          <p className="text-[#64748b] text-xl max-w-2xl mx-auto font-medium">Discover stories in the format that specifically matters to you.</p>
        </div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: BookOpen, title: "Ebooks", desc: "Instant access to digital reading experiences." },
            { icon: Headphones, title: "Audiobooks", desc: "Listen to stories anytime, anywhere." },
            { icon: Package, title: "Hardcopy Books", desc: "Premium printed editions for traditional readers." }
          ].map((format, i) => (
            <motion.div key={i} variants={fadeInUp} className="bg-white p-10 rounded-2xl border border-[#e2e8f0] shadow-sm hover:shadow-[0_20px_40px_-10px_rgba(106,13,173,0.2)] transition-all group flex flex-col items-center text-center transform hover:-translate-y-2">
              <div className="bg-primary-50 p-6 rounded-full mb-8 group-hover:bg-primary-100 transition-colors">
                <format.icon size={48} className="text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold text-[#1e293b] mb-4 font-poppins">{format.title}</h3>
              <p className="text-[#64748b] text-lg font-medium">{format.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 5. WHY CHOOSE US */}
      <section className="py-24 px-6 w-full bg-[#1e293b] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary-900 via-[#1e293b] to-primary-800 z-0"></div>
        <div className="max-w-[1400px] mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 font-poppins">Why Choose Pustak Maza</h2>
          </div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: ShieldCheck, title: "Trusted Publication", desc: "A Book Saga Company" },
              { icon: Star, title: "Premium Quality Content", desc: "Curated Knowledge" },
              { icon: Lock, title: "Secure Platform", desc: "100% Secure Access" },
              { icon: Smartphone, title: "Easy Access Anywhere", desc: "Digital Reading Modes" }
            ].map((feature, i) => (
              <motion.div variants={fadeInUp} key={i} className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl hover:bg-white/20 transition-all text-center">
                <feature.icon size={36} className="text-primary-300 mx-auto mb-6" />
                <h4 className="text-white text-xl font-bold mb-2 font-poppins">{feature.title}</h4>
                <p className="text-gray-300 font-medium">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 6. OUR VISION */}
      <section className="py-32 px-6 lg:px-12 max-w-[1200px] mx-auto text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-100/40 rounded-full blur-[100px] -z-10"></div>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
          <h2 className="text-4xl md:text-5xl font-extrabold text-primary-600 mb-8 font-poppins relative z-10">Our Vision</h2>
          <p className="text-3xl md:text-4xl lg:text-5xl text-[#1e293b] font-bold leading-snug italic tracking-tight relative z-10 max-w-4xl mx-auto">
            "To become a leading publication house that connects authors and readers through powerful stories, knowledge, and innovation."
          </p>
        </motion.div>
      </section>

      {/* 7. CALL TO ACTION */}
      <section className="py-24 px-6 w-full text-center bg-gradient-to-b from-[#f8fafc] to-[#f1f5f9]">
        <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="max-w-4xl mx-auto bg-white border border-[#e2e8f0] shadow-[0_20px_50px_-15px_rgba(106,13,173,0.15)] rounded-3xl p-12 md:p-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100/50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#1e293b] mb-6 font-poppins relative z-10">Start Your Reading Journey Today</h2>
          <p className="text-[#64748b] text-xl font-medium mb-10 relative z-10">Join thousands of readers discovering premium stories published directly by Pustak Maza.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
            <Link to="/shop" className="bg-primary-500 hover:bg-primary-600 text-white font-bold text-lg px-10 py-5 rounded-2xl shadow-[0_8px_20px_rgba(106,13,173,0.3)] transition-all transform hover:-translate-y-1">
              Browse Books
            </Link>
            <Link to="/contact" className="bg-white border-2 border-[#e2e8f0] hover:border-primary-200 text-[#1e293b] hover:text-primary-600 font-bold text-lg px-10 py-5 rounded-2xl transition-all hover:bg-primary-50">
              Contact Us
            </Link>
          </div>
        </motion.div>
      </section>

    </div>
  );
};
export default About;
