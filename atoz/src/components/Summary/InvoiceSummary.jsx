import React from 'react';

export default function InvoiceSummary({ 
  subtotal = 0, 
  sgstTotal = 0, 
  cgstTotal = 0, 
  roundOff = 0, 
  grandTotal = 0, 
  amountInWords = "Zero Rupees Only" 
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-800 tracking-tight">Summary Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Side: Commercial Text Block Representation */}
        <div className="bg-blue-50 border border-blue-200 text-blue-900 rounded-xl p-4 flex flex-col justify-center">
          <span className="text-blue-700 font-bold block uppercase tracking-wide text-xs mb-1">
            Amount in Words
          </span>
          <p className="text-sm font-semibold leading-relaxed">
            {amountInWords}
          </p>
        </div>

        {/* Right Side: Financial Numbers Breakdown */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-sm font-medium space-y-2 shadow-inner">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal Base Value:</span>
            <span className="font-semibold">₹ {subtotal.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between text-gray-600">
            <span>Total SGST:</span>
            <span className="font-semibold text-orange-600">+ ₹ {sgstTotal.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between text-gray-600">
            <span>Total CGST:</span>
            <span className="font-semibold text-orange-600">+ ₹ {cgstTotal.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between text-gray-500 italic text-xs">
            <span>Mathematical Round Off:</span>
            <span>
              {roundOff >= 0 ? `+ ₹ ${roundOff.toFixed(2)}` : `- ₹ ${Math.abs(roundOff).toFixed(2)}`}
            </span>
          </div>
          
          <div className="h-px bg-gray-300 my-2" />
          
          <div className="flex justify-between text-base font-bold text-gray-900">
            <span>Grand Total (Net Payable):</span>
            <span className="text-emerald-700 text-lg">₹ {grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}