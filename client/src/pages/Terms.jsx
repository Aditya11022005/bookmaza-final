import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta';

const termsData = [
  {
    title: "1. Introduction",
    content: "Welcome to Pustak Maza. These Terms and Conditions govern your use of our website and services. By accessing or using our platform, you agree to be bound by these terms. If you do not agree with any part of these terms, please do not use our services."
  },
  {
    title: "2. User Responsibilities",
    content: "As a user of Pustak Maza, you agree to provide accurate, current, and complete information during the registration process. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree not to use the platform for any unlawful purpose or in any way that interrupts or impairs the platform's functionality."
  },
  {
    title: "3. Purchases and Payments",
    content: "All prices on Pustak Maza are subject to change without notice. We accept various forms of payment through our secure payment gateway. By submitting payment information, you authorize us to charge the applicable fees to your selected payment method. We reserve the right to refuse or cancel any order for any reason, including suspected fraud or pricing errors."
  },
  {
    title: "4. Digital Content (Ebooks, Audiobooks)",
    content: "When you purchase or access digital content (such as ebooks or audiobooks) on Pustak Maza, you are granted a non-exclusive, non-transferable license to access and read or listen to the content for your personal, non-commercial use. You may not copy, distribute, modify, or create derivative works from the digital content without explicit permission from the rights holders."
  },
  {
    title: "5. Refund Policy",
    content: "For physical books, you may request a return within 7 days of delivery, provided the item is in its original condition. For digital content (ebooks and audiobooks), refunds are generally not provided once the content has been accessed or downloaded, except in cases where the file is fundamentally defective or corrupted. Please contact our support team for specific refund inquiries."
  },
  {
    title: "6. Intellectual Property",
    content: "All content on the Pustak Maza platform, including text, graphics, logos, images, audio clips, and software, is the property of Pustak Maza or its content suppliers and is protected by international copyright laws. You may not reproduce, duplicate, copy, sell, or exploit any portion of the service without express written permission from us."
  },
  {
    title: "7. Limitation of Liability",
    content: "Pustak Maza shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages resulting from your access to or use of the platform and its services. We do not warrant that the website will be uninterrupted, secure, or error-free at all times."
  },
  {
    title: "8. Contact Information",
    content: "If you have any questions or concerns regarding these Terms and Conditions, please contact us."
  }
];

const Terms = () => {
  usePageMeta('Terms & Conditions', 'Read the Pustak Maza terms and conditions governing the use of our digital and physical book services.');
  return (
    <div className="min-h-screen bg-[#f8fafc] py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-primary-100/30 blur-[120px] rounded-full pointer-events-none z-0"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
           <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 group hover:shadow-md transition-shadow">
               <BookOpen size={30} className="text-primary-600 group-hover:scale-110 transition-transform"/>
           </div>
          <h1 className="text-4xl md:text-5xl font-poppins font-extrabold text-[#1e293b] mb-4">Terms and Conditions</h1>
          <p className="text-lg text-[#64748b] font-inter max-w-2xl mx-auto">
            Please read these terms carefully before using Pustak Maza. Last updated: March 2026.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="bg-white rounded-[2rem] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden"
        >
           <div className="p-8 md:p-12 lg:p-16">
              <div className="prose prose-lg prose-slate max-w-none font-inter text-[#334155] leading-relaxed">
                 {termsData.map((section, index) => (
                    <div key={index} className="mb-10 last:mb-0">
                       <h2 className="text-2xl font-poppins font-black text-[#1e293b] mb-4 flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center text-sm">{index + 1}</span>
                          {section.title.replace(`${index + 1}. `, '')}
                       </h2>
                       <p className="pl-11 text-[16px] text-[#475569] leading-loose">{section.content}</p>
                       
                       {index === termsData.length - 1 && (
                          <div className="pl-11 mt-4">
                             <Link to="/contact" className="inline-flex items-center text-primary-600 font-bold hover:text-primary-800 transition-colors underline underline-offset-4">
                                Reach out to our Support Team
                             </Link>
                          </div>
                       )}
                       {index !== termsData.length - 1 && <div className="pl-11 mt-10"><hr className="border-gray-100"/></div>}
                    </div>
                 ))}
              </div>
           </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Terms;
