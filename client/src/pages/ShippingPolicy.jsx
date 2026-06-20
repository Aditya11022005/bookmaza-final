import React from 'react';

const ShippingPolicy = () => {
  return (
    <div className="py-16 md:py-24 bg-[#f8fafc]">
      <div className="max-w-4xl mx-auto px-6 sm:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-poppins font-extrabold text-[#1e293b] mb-4">Shipping &amp; Delivery Policy</h1>
          <p className="text-sm font-semibold text-gray-500 font-inter">
            Read about our packaging standards, shipping timelines, and courier services. Last updated: March 2026.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 space-y-10 font-inter text-[#475569] leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-[#1e293b] mb-4 font-poppins">1. Domestic Shipping (India)</h2>
            <p>
              We ship printed hardcovers and paperback novels across India. 
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><span className="font-bold">Processing Time:</span> Orders are processed and dispatched within 1 to 2 business days.</li>
              <li><span className="font-bold">Delivery Time:</span> Once shipped, delivery takes 3 to 5 business days in metro cities and 5 to 7 business days for regional areas.</li>
            </ul>
          </section>

          <hr className="border-gray-100" />

          <section>
            <h2 className="text-2xl font-bold text-[#1e293b] mb-4 font-poppins">2. Digital Deliveries</h2>
            <p>
              Ebooks and audiobooks require no physical shipping. These products are delivered instantly into your account library under the <span className="font-bold">My Library</span> tab upon successful completion of payment.
            </p>
          </section>

          <hr className="border-gray-100" />

          <section>
            <h2 className="text-2xl font-bold text-[#1e293b] mb-4 font-poppins">3. Shipping Rates</h2>
            <p>
              Shipping rates are calculated dynamically at checkout based on weight and target address. Standard free shipping may be offered for orders exceeding specific threshold amounts, as displayed on the banner or checkout page.
            </p>
          </section>

          <hr className="border-gray-100" />

          <section>
            <h2 className="text-2xl font-bold text-[#1e293b] mb-4 font-poppins">4. Shipment Tracking</h2>
            <p>
              Once your package is shipped, you will receive an email with your Tracking number and the name of the shipping partner (e.g., Delhivery, BlueDart, India Post). You can track your parcel on the courier partner's tracking page or under your <span className="font-bold">My Orders</span> tab.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicy;
