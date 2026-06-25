import { Document, Page, pdfjs } from 'react-pdf';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { motion } from 'framer-motion';
import { X, ZoomIn, ZoomOut, ShieldCheck } from 'lucide-react';
import { getPdfProxyUrl } from '../utils/image';

// Configure the pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

const PdfPreviewModal = ({
  book,
  setIsPdfOpen,
  handleBuyNow,
  previewPageNumber,
  setPreviewPageNumber,
  previewNumPages,
  setPreviewNumPages,
  previewScale,
  setPreviewScale,
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="fixed inset-0 z-[110] bg-[#1e293b]/95 backdrop-blur-md flex flex-col items-center p-4 sm:p-8"
    >
      {/* Header Controls */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-4">
         <div className="text-white">
            <h4 className="text-2xl font-black font-poppins">{book.title} (Digital Preview)</h4>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
               Page {previewPageNumber} of {previewNumPages ? Math.min(10, previewNumPages) : '10'}
            </p>
         </div>
         <div className="flex items-center gap-4">
            {/* Zoom controls */}
            <div className="flex items-center gap-2 text-white bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl font-mono text-xs">
              <button onClick={() => setPreviewScale(s => Math.max(0.6, s - 0.1))} className="p-1 hover:text-primary-400 transition-colors"><ZoomOut size={14}/></button>
              <span>{Math.round(previewScale * 100)}%</span>
              <button onClick={() => setPreviewScale(s => Math.min(2.0, s + 0.1))} className="p-1 hover:text-primary-400 transition-colors"><ZoomIn size={14}/></button>
            </div>
            <button 
              onClick={() => {
                setIsPdfOpen(false);
                setPreviewPageNumber(1);
              }} 
              className="w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all border border-white/20"
            >
              <X size={24}/>
            </button>
         </div>
      </div>

      {/* Pagination Controls */}
      <div className="w-full max-w-4xl flex justify-center mb-4">
        <div className="px-5 py-2.5 rounded-full flex items-center gap-5 bg-white/5 border border-white/10 shadow-md">
          <button 
            disabled={previewPageNumber <= 1} 
            onClick={() => setPreviewPageNumber(p => p - 1)}
            className="px-4 py-2 rounded-xl text-xs font-bold uppercase bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none transition"
          >
            Prev
          </button>
          <span className="font-mono text-sm font-black text-white">
            Page {previewPageNumber} / {previewNumPages ? Math.min(10, previewNumPages) : '10'}
          </span>
          <button 
            disabled={previewPageNumber >= Math.min(10, previewNumPages || 10)}
            onClick={() => setPreviewPageNumber(p => p + 1)}
            className="px-4 py-2 rounded-xl text-xs font-bold uppercase bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none transition"
          >
            Next
          </button>
        </div>
      </div>

      {/* Simulated Reader Container */}
      <div className="flex-1 w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-auto relative border border-white/10 p-4 flex justify-center items-start">
         <div className="min-w-fit">
           <Document
             file={getPdfProxyUrl(book.formats.ebook?.pdfUrl)}
             onLoadSuccess={({ numPages }) => setPreviewNumPages(numPages)}
             loading={<div className="p-20 font-bold text-slate-500 animate-pulse text-center">Loading Preview...</div>}
           >
             <Page 
               pageNumber={previewPageNumber} 
               scale={previewScale} 
               renderTextLayer={false} 
               renderAnnotationLayer={false} 
             />
           </Document>
         </div>

         {/* Lock Screen overlay on page 10 to prompt purchase */}
         {previewPageNumber === 10 && (
           <div className="absolute inset-0 bg-[#0f172a]/90 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center text-white z-20">
             <div className="w-20 h-20 rounded-full bg-primary-600/20 border border-primary-500/30 flex items-center justify-center text-primary-400 mb-6 animate-bounce">
               <ShieldCheck size={40} />
             </div>
             <h3 className="text-3xl font-black font-poppins mb-3">End of Preview</h3>
             <p className="text-gray-400 max-w-md mb-8">You have reached the end of the free 10-page preview. Please purchase this book to read the remaining pages.</p>
             <button 
               onClick={() => {
                 setIsPdfOpen(false);
                 handleBuyNow();
               }} 
               className="bg-primary-500 hover:bg-primary-600 text-white font-black text-lg px-8 py-4 rounded-xl shadow-xl transition-all active:scale-95"
             >
               Buy Now Securely
             </button>
           </div>
         )}
      </div>

      {/* Bottom Disclaimer */}
      <p className="mt-4 text-gray-500 font-bold text-xs tracking-widest uppercase">© Pustak Maza Digital distribution rights reserved.</p>
    </motion.div>
  );
};

export default PdfPreviewModal;
