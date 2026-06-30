import React, { useEffect } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function FooterButtons({ 
  generateNextInvoice, items, setItems, printRef, invoiceNo, totals, triggerPdfRef, triggerPrintRef 
}) {
  
  const handleGeneratePDF = async () => {
    if (!printRef.current) return;
    try {
      const element = printRef.current;
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
      pdf.save(`ATOZ_${invoiceNo}.pdf`);
      
      if (generateNextInvoice) generateNextInvoice();
    } catch (error) {
      console.error("PDF Generation error: ", error);
    }
  };

  const handlePrint = () => {
    window.print();
    if (generateNextInvoice) generateNextInvoice();
  };

  // Keep references connected dynamically as state changes
  useEffect(() => {
    if (triggerPdfRef) triggerPdfRef.current = handleGeneratePDF;
    if (triggerPrintRef) triggerPrintRef.current = handlePrint;
  });

  const handleClearForm = () => {
    if (window.confirm("Are you sure you want to clear all invoice fields?")) {
      if (setItems) {
        setItems([{ hsn: "", partNo: "", description: "", qty: 1, unit: "Nos", rate: 0, discount: 0, sgst: 9, cgst: 9, amount: 0 }]);
      }
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="text-xs text-gray-400 font-medium">
        ATOZ Software Engine • <span className="font-bold text-gray-500">Ctrl+S</span> (Save PDF) • <span className="font-bold text-gray-500">Ctrl+P</span> (Print)
      </div>

      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={handleClearForm}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg border border-gray-300 shadow-sm"
        >
          Clear Form
        </button>

        <button
          type="button"
          onClick={handlePrint}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm"
        >
          Print Directly
        </button>

        <button
          type="button"
          onClick={handleGeneratePDF}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm"
        >
          Generate PDF & Save
        </button>
      </div>
    </div>
  );
}