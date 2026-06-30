import React from 'react';

export default function InvoiceDetails({ invoiceNo = "INV00001" }) {
  // Get today's local date string formatted as YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="border-t border-gray-100 pt-3 mt-1">
      <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">
        Invoice Meta Details
      </h3>
      
      <div className="space-y-3 text-xs">
        {/* Automated System Invoice Number Field */}
        <div>
          <label className="block text-gray-500 font-medium mb-1">Invoice Number</label>
          <div className="w-full p-2 bg-gray-100 border border-gray-200 rounded-lg font-bold text-gray-800 select-none">
            {invoiceNo}
          </div>
        </div>

        {/* Interactive Job Card Input Field */}
        <div>
          <label className="block text-gray-500 font-medium mb-1">Job Card / Reference No.</label>
          <input 
            type="text" 
            placeholder="e.g., JC-9842"
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 font-medium"
          />
        </div>

        {/* Date Selection Box Field */}
        <div>
          <label className="block text-gray-500 font-medium mb-1">Invoice Date</label>
          <input 
            type="date" 
            defaultValue={today}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 font-medium"
          />
        </div>
      </div>
    </div>
  );
}