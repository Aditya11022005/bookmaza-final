import { useState } from 'react';
import { Award, Printer, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const AdminCertificates = () => {
  // Manual text entry states for flexibility
  const [authorName, setAuthorName] = useState('MANISH KUMAR');
  const [publicationName, setPublicationName] = useState('BOOK SAGA PUBLICATIONS');
  const [awardDescription, setAwardDescription] = useState(
    'This certificate is awarded to a PhD scholar, Department of Microbiology, School of Science, YBN University, ESIC MEDICAL COLLEGE & HOSPITAL, NAMKUM, RANCHI, JHARKHAND, in recognition of his contribution as the author of a book entitled'
  );
  const [bookTitle, setBookTitle] = useState('Advances In Cancer Research: From Bench To Bedside');
  
  const [signatoryName, setSignatoryName] = useState('PRIYA LOKARE');
  const [signatoryTitle, setSignatoryTitle] = useState('Founder');
  const [dateStr, setDateStr] = useState('10/07/2025');
  const [sealRegNumber, setSealRegNumber] = useState('UDYAM-MH-01-0045616');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handlePublish = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(`Certificate issued successfully for ${authorName}!`);
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header (Hidden in print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-poppins font-black text-white tracking-tight">Certificate Generator</h1>
          <p className="text-slate-500 text-sm font-medium mt-0.5">Issue custom awards and publication certificates to authors</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handlePrint}
            className="inline-flex items-center gap-2 bg-[#0d1526] hover:bg-slate-900 border border-white/10 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-md"
          >
            <Printer size={18} className="text-amber-500" />
            Print Certificate
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex flex-col lg:flex-row gap-8 print:block">
        
        {/* Controls Sidebar (Hidden in print) */}
        <div className="w-full lg:w-96 shrink-0 space-y-6 print:hidden">
          <div className="bg-[#0d1526] border border-white/[0.06] rounded-2xl p-6 space-y-4">
            <h2 className="text-white font-poppins font-bold text-[15px] border-b border-white/5 pb-2 mb-2 flex items-center gap-2">
              <Award size={18} className="text-amber-500" /> Certificate Configurator
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Publication Brand</label>
                <input 
                  type="text" 
                  value={publicationName}
                  onChange={(e) => setPublicationName(e.target.value)}
                  placeholder="e.g. BOOK SAGA PUBLICATIONS" 
                  className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-amber-500/50 transition-colors" 
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Author Name</label>
                <input 
                  type="text" 
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Enter Author's Full Name" 
                  className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-amber-500/50 transition-colors" 
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Award Citation / Details</label>
                <textarea 
                  rows="4"
                  value={awardDescription}
                  onChange={(e) => setAwardDescription(e.target.value)}
                  placeholder="Citation/Award Description..."
                  className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-amber-500/50 transition-colors resize-none text-xs leading-relaxed" 
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Book Title</label>
                <input 
                  type="text" 
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  placeholder="e.g. Advances In Cancer Research" 
                  className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-amber-500/50 transition-colors" 
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Seal Registration Number</label>
                <input 
                  type="text" 
                  value={sealRegNumber}
                  onChange={(e) => setSealRegNumber(e.target.value)}
                  placeholder="e.g. UDYAM-MH-01-0045616" 
                  className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-amber-500/50 transition-colors" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Date</label>
                  <input 
                    type="text" 
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-amber-500/50" 
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Signatory Title</label>
                  <input 
                    type="text" 
                    value={signatoryTitle}
                    onChange={(e) => setSignatoryTitle(e.target.value)}
                    className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-amber-500/50" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Signatory Name</label>
                <input 
                  type="text" 
                  value={signatoryName}
                  onChange={(e) => setSignatoryName(e.target.value)}
                  className="w-full bg-[#0f172a] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-amber-500/50" 
                />
              </div>
            </div>
            
            <button 
              onClick={handlePublish}
              disabled={isSubmitting}
              className="w-full mt-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-emerald-500/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 size={18} /> {isSubmitting ? 'Issuing...' : 'Issue & Publish'}
            </button>
          </div>
        </div>

        {/* Certificate Preview Render Canvas */}
        <div className="flex-1 overflow-x-auto pb-10 print:p-0 print:overflow-visible flex justify-center">
          
          {/* Certificate Board */}
          <div 
            id="certificate-print-area"
            className="w-[960px] h-[680px] bg-[#faf8f4] relative shadow-2xl overflow-hidden flex flex-col items-center justify-between py-12 px-20 border-[16px] border-[#0c2340] print:shadow-none print:w-[100%] print:h-[100vh] print:m-0 print:border-none"
            style={{ 
              boxSizing: 'border-box',
              backgroundImage: 'radial-gradient(#ffffff 20%, transparent 20%), radial-gradient(#ffffff 20%, transparent 20%)',
              backgroundSize: '10px 10px',
              backgroundPosition: '0 0, 5px 5px',
              backgroundColor: '#fcfaf6'
            }}
          >
            {/* Double Thin Inner Gold Line Border */}
            <div className="absolute inset-4 border border-[#d4af37] pointer-events-none opacity-80" />
            <div className="absolute inset-5 border-2 border-double border-[#d4af37] pointer-events-none opacity-60" />

            {/* Premium Corner Vector Graphic Emulation */}
            {/* Top Left */}
            <svg className="absolute top-0 left-0 w-32 h-32 pointer-events-none" viewBox="0 0 120 120" fill="none">
              <path d="M0 0 L120 0 L100 20 L20 20 L20 100 L0 120 Z" fill="#d4af37" />
              <path d="M5 5 L110 5 L95 20 H20 V95 L5 110 Z" fill="#0c2340" />
              <path d="M0 45 L45 0 L55 0 L0 55 Z" fill="#d4af37" />
              <path d="M0 80 L80 0 L90 0 L0 90 Z" fill="#d4af37" />
              <path d="M15 15 L35 15 L15 35 Z" fill="#0c2340" />
            </svg>

            {/* Top Right */}
            <svg className="absolute top-0 right-0 w-32 h-32 scale-x-[-1] pointer-events-none" viewBox="0 0 120 120" fill="none">
              <path d="M0 0 L120 0 L100 20 L20 20 L20 100 L0 120 Z" fill="#d4af37" />
              <path d="M5 5 L110 5 L95 20 H20 V95 L5 110 Z" fill="#0c2340" />
              <path d="M0 45 L45 0 L55 0 L0 55 Z" fill="#d4af37" />
              <path d="M0 80 L80 0 L90 0 L0 90 Z" fill="#d4af37" />
              <path d="M15 15 L35 15 L15 35 Z" fill="#0c2340" />
            </svg>

            {/* Bottom Left */}
            <svg className="absolute bottom-0 left-0 w-32 h-32 scale-y-[-1] pointer-events-none" viewBox="0 0 120 120" fill="none">
              <path d="M0 0 L120 0 L100 20 L20 20 L20 100 L0 120 Z" fill="#d4af37" />
              <path d="M5 5 L110 5 L95 20 H20 V95 L5 110 Z" fill="#0c2340" />
              <path d="M0 45 L45 0 L55 0 L0 55 Z" fill="#d4af37" />
              <path d="M0 80 L80 0 L90 0 L0 90 Z" fill="#d4af37" />
              <path d="M15 15 L35 15 L15 35 Z" fill="#0c2340" />
            </svg>

            {/* Bottom Right */}
            <svg className="absolute bottom-0 right-0 w-32 h-32 scale-x-[-1] scale-y-[-1] pointer-events-none" viewBox="0 0 120 120" fill="none">
              <path d="M0 0 L120 0 L100 20 L20 20 L20 100 L0 120 Z" fill="#d4af37" />
              <path d="M5 5 L110 5 L95 20 H20 V95 L5 110 Z" fill="#0c2340" />
              <path d="M0 45 L45 0 L55 0 L0 55 Z" fill="#d4af37" />
              <path d="M0 80 L80 0 L90 0 L0 90 Z" fill="#d4af37" />
              <path d="M15 15 L35 15 L15 35 Z" fill="#0c2340" />
            </svg>

            {/* Top Logo & Title */}
            <div className="flex flex-col items-center z-10 shrink-0">
              <div className="mb-2 text-[#0c2340] opacity-95 flex items-center justify-center">
                <svg className="w-16 h-12 text-[#0c2340]" viewBox="0 0 64 48" fill="none" stroke="currentColor" strokeWidth="3">
                  {/* Styled Open Book Logo matching the image */}
                  <path d="M32 40c-6-5-16-5-24-5v-28c8 0 18 0 24 5 6-5 16-5 24-5v28c-8 0-18 0-24 5z" fill="currentColor" fillOpacity="0.15" strokeLinejoin="round" />
                  <path d="M32 10v30" />
                  <path d="M8 40c8 0 18 0 24 5 6-5 16-5 24-5" />
                </svg>
              </div>
              <h2 className="text-slate-800 font-serif text-[18px] font-black uppercase tracking-[0.25em]">
                {publicationName || 'BOOK SAGA PUBLICATIONS'}
              </h2>
            </div>

            {/* Ribbon Certificate Banner */}
            <div className="relative w-[340px] h-[48px] bg-gradient-to-r from-[#916b1f] via-[#cfa54a] to-[#916b1f] shadow-md flex items-center justify-center z-10 mt-1">
              {/* Ribbon Tails left/right */}
              <div className="absolute -left-3 top-2 w-3 h-10 bg-[#7a5716] clip-ribbon-left" style={{ clipPath: 'polygon(100% 0, 0 50%, 100% 100%)' }} />
              <div className="absolute -right-3 top-2 w-3 h-10 bg-[#7a5716] clip-ribbon-right" style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }} />
              
              <h1 className="text-white font-serif text-[20px] font-extrabold italic tracking-wide drop-shadow-sm">
                Certificate of Author
              </h1>
            </div>

            {/* Presentation Subtitle */}
            <div className="text-slate-500 font-serif text-sm font-semibold italic mt-4 z-10">
              This certificate is proudly presented to:
            </div>

            {/* Recipient Name */}
            <div className="z-10 mt-2 text-center w-full">
              <h1 className="text-[#334e68] font-serif text-[42px] font-bold uppercase tracking-widest inline-block min-w-[360px]">
                {authorName || 'MANISH KUMAR'}
              </h1>
              
              {/* Gold/Slate Thin Divider */}
              <div className="flex items-center justify-center gap-3 w-full max-w-[400px] mx-auto mt-2 mb-1">
                <div className="h-[1px] bg-slate-300 flex-1" />
                <div className="w-2.5 h-2.5 rounded-full border border-slate-400 bg-white" />
                <div className="h-[1px] bg-slate-300 flex-1" />
              </div>
            </div>

            {/* Description Text Box */}
            <div className="z-10 text-center px-10 max-w-[720px] mt-2 flex-grow flex items-center justify-center">
              <p className="text-slate-600 font-serif text-[13px] leading-[1.8] italic font-medium">
                {awardDescription}
              </p>
            </div>

            {/* Book Title Highlight */}
            <div className="z-10 text-center w-full mb-6 mt-1">
              <h3 className="text-[#0c2340] font-serif text-[22px] font-black tracking-tight max-w-[800px] mx-auto">
                {bookTitle}
              </h3>
            </div>

            {/* Bottom Row: Signatory, Seal, Date */}
            <div className="w-full flex items-end justify-between px-10 z-10 shrink-0">
              
              {/* Left Signatory */}
              <div className="text-center w-48">
                <div className="h-10 flex items-end justify-center">
                  <span className="font-serif text-[26px] text-slate-800 leading-none" style={{ fontFamily: "'Brush Script MT', cursive, Georgia, serif" }}>
                    {signatoryName ? signatoryName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') : 'Priya Lokare'}
                  </span>
                </div>
                <div className="w-full border-t border-slate-400/80 my-1" />
                <p className="text-[#0c2340] font-bold text-[10px] uppercase tracking-widest">{signatoryName}</p>
                <p className="text-slate-500 font-semibold text-[9px] uppercase tracking-wider mt-0.5">{signatoryTitle}</p>
              </div>

              {/* Seal with Curved SVG Text Paths matching the stamp in photo */}
              <div className="w-24 h-24 flex items-center justify-center relative bg-transparent p-1 transform -rotate-12 mb-[-8px]">
                <svg className="w-full h-full select-none pointer-events-none" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="46" fill="none" stroke="#2c3e50" strokeWidth="1.5" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#2c3e50" strokeWidth="0.5" strokeDasharray="3,1" />
                  <circle cx="50" cy="50" r="33" fill="none" stroke="#2c3e50" strokeWidth="1" />
                  
                  {/* Center Logo */}
                  <g transform="translate(37,39) scale(0.4)" stroke="#2c3e50" fill="none" strokeWidth="3">
                    <path d="M32 40c-6-5-16-5-24-5v-28c8 0 18 0 24 5 6-5 16-5 24-5v28c-8 0-18 0-24 5z" />
                    <path d="M32 10v30" />
                  </g>
                  
                  {/* Text Paths */}
                  <path id="seal-text-path-top" d="M 18,50 A 32,32 0 1,1 82,50" fill="none" />
                  <path id="seal-text-path-bottom" d="M 82,50 A 32,32 0 1,1 18,50" fill="none" />
                  
                  <text fill="#2c3e50" fontSize="5.5" fontWeight="900" letterSpacing="0.4">
                    <textPath href="#seal-text-path-top" startOffset="50%" textAnchor="middle">
                      {publicationName || 'BOOK SAGA PUBLICATIONS'}
                    </textPath>
                  </text>
                  <text fill="#2c3e50" fontSize="5" fontWeight="900" letterSpacing="0.2">
                    <textPath href="#seal-text-path-bottom" startOffset="50%" textAnchor="middle">
                      {sealRegNumber || 'UDYAM-MH-01-0045616'}
                    </textPath>
                  </text>
                </svg>
              </div>

              {/* Right Date */}
              <div className="text-center w-48">
                <div className="h-10 flex items-end justify-center">
                  <span className="font-serif text-sm font-bold text-slate-800 leading-none">
                    {dateStr}
                  </span>
                </div>
                <div className="w-full border-t border-slate-400/80 my-1" />
                <p className="text-[#0c2340] font-bold text-[10px] uppercase tracking-widest">Date</p>
                <p className="text-slate-500 font-semibold text-[9px] uppercase tracking-wider mt-0.5">Date of Issue</p>
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* Special print media styles to ensure precise alignment when printing */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #certificate-print-area, #certificate-print-area * {
            visibility: visible;
          }
          #certificate-print-area {
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%) scale(1.1);
            width: 960px !important;
            height: 680px !important;
            margin: 0 !important;
            padding: 48px 80px !important;
            border: 4px solid #0c2340 !important;
            background-color: #faf8f4 !important;
            page-break-inside: avoid;
            box-shadow: none !important;
          }
          @page {
            size: A4 landscape;
            margin: 0;
          }
        }
      `}} />
    </div>
  );
};

export default AdminCertificates;
