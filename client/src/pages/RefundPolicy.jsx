import React from 'react';

const RefundPolicy = () => {
  return (
    <div className="py-16 md:py-24 bg-[#f8fafc]">
      <div className="max-w-4xl mx-auto px-6 sm:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-poppins font-extrabold text-[#1e293b] mb-4">Refund &amp; Cancellation Policy</h1>
          <p className="text-sm font-semibold text-gray-500 font-inter">
            Please review our refund guidelines for digital and physical items. Last updated: March 2026.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 space-y-10 font-inter text-[#475569] leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-[#1e293b] mb-4 font-poppins">1. Digital Products (Ebooks &amp; Audiobooks)</h2>
            <p>
              Due to the nature of digital goods, all purchases of ebooks and audiobooks are final and non-refundable. Once purchase access is granted, the files are immediately added to your permanent digital library for streaming or reading. 
            </p>
            <p className="mt-3">
              If you experience technical issues downloading, reading, or playing a digital file, please contact us immediately at <span className="font-bold text-primary-600">contact@booksagapublications.com</span>. We will assist you or replace the file.
            </p>
          </section>

          <hr className="border-gray-100" />

          <section>
            <h2 className="text-2xl font-bold text-[#1e293b] mb-4 font-poppins">2. Physical Books (Hardcovers &amp; Paperbacks)</h2>
            <p>
              We accept returns or replacements for physical books within <span className="font-bold">7 days</span> of delivery under the following circumstances:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>The book arrived damaged, torn, or severely misprinted.</li>
              <li>The incorrect book title was shipped to you.</li>
            </ul>
            <p className="mt-3">
              To request a return or replacement, please send an email with photos of the damaged package and book to our support team. The item must be unused and in its original packaging.
            </p>
          </section>

          <hr className="border-gray-100" />

          <section>
            <h2 className="text-2xl font-bold text-[#1e293b] mb-4 font-poppins">3. Order Cancellations</h2>
            <p>
              Physical book orders can be cancelled within <span className="font-bold">24 hours</span> of purchase, provided the book has not yet been processed or handed over to our shipping courier. Once shipped, the order cannot be cancelled. Digital product purchases cannot be cancelled.
            </p>
          </section>

          <hr className="border-gray-100" />

          <section>
            <h2 className="text-2xl font-bold text-[#1e293b] mb-4 font-poppins">4. Refund Processing</h2>
            <p>
              Approved refunds will be processed via your original payment method (Razorpay or card) within <span className="font-bold">5 to 7 business days</span>. Please note that banks/payment gateways may take additional days to reflect the credit in your account.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
