import { useState, useRef } from "react";
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

function convertNumberToWords(amount) {
  const words = {
    0: 'Zero', 1: 'One', 2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five', 6: 'Six', 7: 'Seven', 8: 'Eight', 9: 'Nine',
    10: 'Ten', 11: 'Eleven', 12: 'Twelve', 13: 'Thirteen', 14: 'Fourteen', 15: 'Fifteen', 16: 'Sixteen', 17: 'Seventeen', 18: 'Eighteen', 19: 'Nineteen',
    20: 'Twenty', 30: 'Thirty', 40: 'Forty', 50: 'Fifty', 60: 'Sixty', 70: 'Seventy', 80: 'Eighty', 90: 'Ninety'
  };

  function convertLessThanOneThousand(number) {
    let remainder, word = "";
    if (number >= 100) {
      remainder = number % 100;
      word = words[Math.floor(number / 100)] + " Hundred";
      if (remainder > 0) {
        word += " and " + convertLessThanOneThousand(remainder);
      }
      return word;
    }
    if (number >= 20) {
      remainder = number % 10;
      word = words[Math.floor(number / 10) * 10];
      if (remainder > 0) {
        word += " " + words[remainder];
      }
      return word;
    }
    return words[number];
  }

  let num = Math.floor(amount);
  if (num === 0) return "Zero Rupees Only";

  let lakhs = Math.floor(num / 100000);
  num %= 100000;
  let thousands = Math.floor(num / 1000);
  num %= 1000;
  let remaining = num;

  let result = "";

  if (lakhs > 0) {
    result += convertLessThanOneThousand(lakhs) + " Lakh ";
  }
  if (thousands > 0) {
    result += convertLessThanOneThousand(thousands) + " Thousand ";
  }
  if (remaining > 0) {
    result += convertLessThanOneThousand(remaining);
  }

  return result.trim() + " Rupees Only";
}

export default function Home() {
  const [items, setItems] = useState([
    { hsn: "17007", partNo: "84510074L01", description: "WINSHEILD FRONT GLASS", qty: 1, unit: "PCS", rate: 3737.30, discount: 0, sgst: 9, cgst: 9, amount: 3737.30 },
    { hsn: "8512", partNo: "GS-5400890", description: "GLASS SEALENT BOND", qty: 2, unit: "PCS", rate: 1017.00, discount: 0, sgst: 9, cgst: 9, amount: 2033.96 },
    { hsn: "998729", partNo: "WD-00250361", description: "LAB. WINDSHIELD REPLACEMENT", qty: 1, unit: "PCS", rate: 600.00, discount: 0, sgst: 9, cgst: 9, amount: 600.00 }
  ]);

  const [invoiceNo, setInvoiceNo] = useState("A2Z250011");
  const [customer, setCustomer] = useState({
    name: "ROYAL SUNDARAM GENERAL INSURANCE CO. LIMITED",
    address: "LUCKNOW LOC",
    phone: "9927015845",
    gstin: "09AABCR7106G1ZH"
  });
  
  const [vehicle, setVehicle] = useState({
    regNo: "UK 17 Q 8631",
    make: "MARUTI",
    model: "DZIRE",
    chassis: "XX145336",
    km: "225495"
  });

  const [meta, setMeta] = useState({
    jobCardNo: "AZ25-1011",
    jobCardDate: "2025-05-29",
    invoiceDate: "2025-05-29",
    ourGstin: "09ABQFA1265J1Z4",
    state: "Uttar Pradesh",
    stateCode: "09",
    enteredBy: "ACCOUNTANT"
  });

  const printElementRef = useRef(null);

  const subtotal = items.reduce((sum, item) => sum + (Number(item.qty || 0) * Number(item.rate || 0) * (1 - (Number(item.discount || 0) / 100))), 0);
  const sgstTotal = items.reduce((sum, item) => sum + ((Number(item.qty || 0) * Number(item.rate || 0) * (1 - (Number(item.discount || 0) / 100))) * (Number(item.sgst || 0) / 100)), 0);
  const cgstTotal = items.reduce((sum, item) => sum + ((Number(item.qty || 0) * Number(item.rate || 0) * (1 - (Number(item.discount || 0) / 100))) * (Number(item.cgst || 0) / 100)), 0);
  
  const exactGrandTotal = subtotal + sgstTotal + cgstTotal;
  const grandTotal = Math.round(exactGrandTotal);
  const roundOff = grandTotal - exactGrandTotal;
  const amountInWords = convertNumberToWords(grandTotal);

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    if (["qty", "rate", "discount", "sgst", "cgst"].includes(field)) {
      let parsedVal = value === "" ? "" : Number(value);
      if (parsedVal < 0) parsedVal = 0;
      updatedItems[index][field] = parsedVal;
    } else {
      updatedItems[index][field] = value;
    }

    const qty = Number(updatedItems[index].qty) || 0;
    const rate = Number(updatedItems[index].rate) || 0;
    const discount = Number(updatedItems[index].discount) || 0;
    updatedItems[index].amount = (qty * rate) - ((qty * rate * discount) / 100);
    
    setItems(updatedItems);
  };

  const addRow = () => {
    if (items.length >= 18) {
      alert("भाई, 1 PAGE पर रखने के लिए 18 से ज़्यादा आइटम मत डालो!");
      return;
    }
    setItems([...items, { hsn: "", partNo: "", description: "", qty: 1, unit: "PCS", rate: 0, discount: 0, sgst: 9, cgst: 9, amount: 0 }]);
  };

  const deleteRow = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleGeneratePDF = async () => {
    if (!printElementRef.current) return;
    try {
      const element = printElementRef.current;
      const canvas = await html2canvas(element, { 
        scale: 2, 
        useCORS: true,
        scrollY: -window.scrollY 
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
      pdf.save(`${invoiceNo}.pdf`);
    } catch (error) {
      console.error("PDF Generation error: ", error);
    }
  };

  const emptyRowsCount = Math.max(0, 18 - items.length);

  return (
    <div className="bg-neutral-200 min-h-screen py-4 px-4 flex flex-col items-center space-y-4 print:bg-white print:py-0 print:px-0">
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 0mm !important;
          }
          body * {
            visibility: hidden;
          }
          .print-bill-container, .print-bill-container * {
            visibility: visible;
          }
          .print-bill-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            padding: 6mm !important;
            margin: 0 !important;
            border: none !important;
            box-sizing: border-box !important;
          }
          input, select, textarea {
            border: none !important;
            box-shadow: none !important;
            outline: none !important;
            background-color: transparent !transparent;
          }
          .print-bill-container * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          ::-webkit-scrollbar { display: none; }
        }
      `}} />

      <div className="w-[210mm] bg-white p-3 rounded-xl shadow-md flex justify-between items-center print:hidden border border-black">
        <div className="text-xs font-bold text-black uppercase tracking-wider">A2Z Invoice System</div>
        <div className="flex space-x-2">
          <button onClick={addRow} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded shadow">+ Add Part/Labour</button>
          <button onClick={() => window.print()} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded shadow">Print (A4 Exact)</button>
          <button onClick={handleGeneratePDF} className="px-4 py-1 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded shadow">Save PDF</button>
        </div>
      </div>

      <div 
        ref={printElementRef}
        className="print-bill-container relative w-[210mm] h-[297mm] bg-white p-6 border border-black text-black font-sans flex flex-col overflow-hidden"
        style={{ boxSizing: 'border-box', pageBreakInside: 'avoid', pageBreakAfter: 'avoid' }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
          <div className="text-[72px] font-black text-black/10 tracking-widest uppercase transform -rotate-[28deg] leading-none text-center whitespace-nowrap">
            A2Z <br /> AUTOHEAVEN
          </div>
        </div>

        <div className="relative z-10 flex flex-col h-full justify-between">
          
          <div className="flex flex-col flex-grow">
            <div className="relative border border-black p-2 mb-2">
              <div className="absolute right-2 top-1 text-[8px] font-bold text-black uppercase">Original for Buyer</div>
              <div className="absolute right-2 bottom-1 text-xs font-black italic tracking-wide text-black">First Choice</div>
              <div className="text-center">
                <h1 className="text-xl font-black tracking-tight leading-tight">A2Z AUTOHEAVEN</h1>
                <p className="text-[10px] font-semibold leading-tight">VISHNU VIHAR, JANSATH ROAD, MUZAFFARNAGAR-251001.</p>
                <p className="text-[10px] leading-tight">Phone: 9528706923 | E-Mail: a2zautoheaven@gmail.com</p>
                <p className="text-[10px] font-bold">GSTIN: 09ABQFA1265J1Z4</p>
                <div className="text-center font-black text-xs uppercase tracking-wider mt-1 border-t border-black pt-1 w-32 mx-auto">
                  GST INVOICE
                </div>
              </div>
            </div>

            <div className="grid grid-cols-12 border border-black text-[10px] mb-0 divide-x divide-black">
              <div className="col-span-4 p-1.5 space-y-0.5">
                <h4 className="font-bold underline text-[9px] uppercase mb-1">BILL TO:</h4>
                <div className="flex"><span className="font-bold w-12 shrink-0">Name:</span><input type="text" className="w-full font-bold bg-transparent p-0" value={customer.name} onChange={(e) => setCustomer({...customer, name: e.target.value})} /></div>
                <div className="flex"><span className="font-bold w-12 shrink-0">Address:</span><input type="text" className="w-full bg-transparent p-0" value={customer.address} onChange={(e) => setCustomer({...customer, address: e.target.value})} /></div>
                <div className="flex"><span className="font-bold w-12 shrink-0">Ph.No:</span><input type="text" className="w-full bg-transparent p-0" value={customer.phone} onChange={(e) => setCustomer({...customer, phone: e.target.value})} /></div>
                <div className="flex"><span className="font-bold w-12 shrink-0">GST No:</span><input type="text" className="w-full bg-transparent uppercase font-bold p-0" value={customer.gstin} onChange={(e) => setCustomer({...customer, gstin: e.target.value})} /></div>
              </div>

              <div className="col-span-4 p-1.5 space-y-0.5">
                <h4 className="font-bold underline text-[9px] uppercase mb-1">VEHICLE DETAIL:</h4>
                <div className="flex"><span className="font-bold w-16 shrink-0">Regn. No.:</span><input type="text" className="w-full font-bold uppercase bg-transparent p-0" value={vehicle.regNo} onChange={(e) => setVehicle({...vehicle, regNo: e.target.value})} /></div>
                <div className="flex"><span className="font-bold w-16 shrink-0">Make:</span><input type="text" className="w-full bg-transparent p-0" value={vehicle.make} onChange={(e) => setVehicle({...vehicle, make: e.target.value})} /></div>
                <div className="flex"><span className="font-bold w-16 shrink-0">Model:</span><input type="text" className="w-full bg-transparent p-0" value={vehicle.model} onChange={(e) => setVehicle({...vehicle, model: e.target.value})} /></div>
                <div className="flex"><span className="font-bold w-16 shrink-0">Chassis:</span><input type="text" className="w-full bg-transparent p-0" value={vehicle.chassis} onChange={(e) => setVehicle({...vehicle, chassis: e.target.value})} /></div>
                <div className="flex"><span className="font-bold w-16 shrink-0">Kilo Meters:</span><input type="text" className="w-full bg-transparent p-0" value={vehicle.km} onChange={(e) => setVehicle({...vehicle, km: e.target.value})} /></div>
              </div>

              <div className="col-span-4 p-1.5 space-y-0.5 text-[9px]">
                <h4 className="font-bold underline text-[9px] uppercase mb-1">INVOICE DETAIL:</h4>
                <div className="flex"><span className="font-bold w-20 shrink-0">Invoice No:</span><input type="text" className="w-full font-bold bg-transparent p-0" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} /></div>
                <div className="flex"><span className="font-bold w-20 shrink-0">Job Card No.:</span><input type="text" className="w-full bg-transparent p-0" value={meta.jobCardNo} onChange={(e) => setMeta({...meta, jobCardNo: e.target.value})} /></div>
                <div className="flex"><span className="font-bold w-20 shrink-0">Job Card Date:</span><input type="text" className="w-full bg-transparent p-0" value={meta.jobCardDate} onChange={(e) => setMeta({...meta, jobCardDate: e.target.value})} /></div>
                <div className="flex"><span className="font-bold w-20 shrink-0">Invoice Date:</span><input type="text" className="w-full bg-transparent p-0" value={meta.invoiceDate} onChange={(e) => setMeta({...meta, invoiceDate: e.target.value})} /></div>
                
                <div className="border-t border-black my-0.5 pt-0.5 font-bold underline uppercase text-[8px]">OUR DETAILS:</div>
                <div className="flex"><span className="w-20 shrink-0 font-bold">GST No:</span><input type="text" className="w-full bg-transparent uppercase font-bold p-0" value={meta.ourGstin} onChange={(e) => setMeta({...meta, ourGstin: e.target.value})} /></div>
                <div className="flex"><span className="w-20 shrink-0 font-bold">State:</span><input type="text" className="w-full bg-transparent p-0" value={meta.state} onChange={(e) => setMeta({...meta, state: e.target.value})} /></div>
                <div className="flex"><span className="w-20 shrink-0 font-bold">State Code:</span><input type="text" className="w-full bg-transparent p-0" value={meta.stateCode} onChange={(e) => setMeta({...meta, stateCode: e.target.value})} /></div>
                <div className="flex"><span className="w-20 shrink-0 font-bold">Entered by:</span><input type="text" className="w-full bg-transparent p-0 uppercase" value={meta.enteredBy} onChange={(e) => setMeta({...meta, enteredBy: e.target.value})} /></div>
              </div>
            </div>

            <div className="border-x border-b border-black overflow-hidden flex-grow flex flex-col">
              <table className="w-full text-[10px] text-left border-collapse flex-grow">
                <thead>
                  <tr className="bg-neutral-100 font-bold border-t border-b border-black uppercase text-center text-[9px] h-6">
                    <th className="border-r border-black p-1 w-6">S</th>
                    <th className="border-r border-black p-1 w-14">HSN</th>
                    <th className="border-r border-black p-1 w-24">Part</th>
                    <th className="border-r border-black p-1 text-left">Name Of Product</th>
                    <th className="border-r border-black p-1 w-8">Qty</th>
                    <th className="border-r border-black p-1 w-10">Unit</th>
                    <th className="border-r border-black p-1 w-16 text-right">Rate</th>
                    <th className="border-r border-black p-1 w-10 text-right">Dis%</th>
                    <th className="border-r border-black p-1 w-10 text-center">SGST</th>
                    <th className="border-r border-black p-1 w-10 text-center">CGST</th>
                    <th className="p-1 w-20 text-right">Amount</th>
                    <th className="p-1 w-6 text-center print:hidden"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} className="align-middle border-b border-black h-6">
                      <td className="border-r border-black p-0.5 text-center font-bold">{index + 1}</td>
                      <td className="border-r border-black p-0.5"><input type="text" className="w-full text-center bg-transparent p-0 font-mono" value={item.hsn} onChange={(e) => handleItemChange(index, "hsn", e.target.value)} /></td>
                      <td className="border-r border-black p-0.5"><input type="text" className="w-full text-center bg-transparent p-0 font-mono" value={item.partNo} onChange={(e) => handleItemChange(index, "partNo", e.target.value)} /></td>
                      <td className="border-r border-black p-0.5"><input type="text" className="w-full bg-transparent p-0 font-bold uppercase" value={item.description} onChange={(e) => handleItemChange(index, "description", e.target.value)} /></td>
                      <td className="border-r border-black p-0.5"><input type="number" className="w-full text-center bg-transparent p-0" value={item.qty} onChange={(e) => handleItemChange(index, "qty", e.target.value)} /></td>
                      <td className="border-r border-black p-0.5"><input type="text" className="w-full text-center bg-transparent p-0 uppercase" value={item.unit} onChange={(e) => handleItemChange(index, "unit", e.target.value)} /></td>
                      <td className="border-r border-black p-0.5"><input type="number" className="w-full text-right bg-transparent p-0 font-mono" value={item.rate} onChange={(e) => handleItemChange(index, "rate", e.target.value)} /></td>
                      <td className="border-r border-black p-0.5"><input type="number" className="w-full text-right bg-transparent p-0 font-mono" value={item.discount} onChange={(e) => handleItemChange(index, "discount", e.target.value)} /></td>
                      <td className="border-r border-black p-0.5"><input type="number" className="w-full text-center bg-transparent p-0 font-mono" value={item.sgst} onChange={(e) => handleItemChange(index, "sgst", e.target.value)} /></td>
                      <td className="border-r border-black p-0.5"><input type="number" className="w-full text-center bg-transparent p-0 font-mono" value={item.cgst} onChange={(e) => handleItemChange(index, "cgst", e.target.value)} /></td>
                      <td className="p-0.5 text-right font-bold font-mono">₹{Number(item.amount).toFixed(2)}</td>
                      <td className="p-0.5 text-center print:hidden">
                        <button onClick={() => deleteRow(index)} className="text-red-500 font-bold">x</button>
                      </td>
                    </tr>
                  ))}

                  {Array.from({ length: emptyRowsCount }).map((_, i) => (
                    <tr key={`empty-${i}`} className="h-6">
                      <td className="border-r border-black text-transparent">{items.length + i + 1}</td>
                      <td className="border-r border-black"></td>
                      <td className="border-r border-black"></td>
                      <td className="border-r border-black"></td>
                      <td className="border-r border-black"></td>
                      <td className="border-r border-black"></td>
                      <td className="border-r border-black"></td>
                      <td className="border-r border-black"></td>
                      <td className="border-r border-black"></td>
                      <td className="border-r border-black"></td>
                      <td></td>
                      <td className="print:hidden"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-12 border border-black text-[10px] items-stretch mt-0 divide-x divide-black">
            {/* LEFT FOOTER SECTION: Amount in words, Bank and Terms */}
            <div className="col-span-7 flex flex-col justify-between p-0 divide-y divide-black">
              <div className="p-2 text-center flex flex-col justify-center items-center min-h-[45px]">
                <span className="text-[9px] uppercase text-black font-bold block mb-0.5 underline">Total Invoice Amount in words :</span>
                <span className="font-black italic text-black text-[11px]">Rs. {amountInWords}</span>
              </div>

              <div className="p-2 leading-tight text-[9px] bg-white">
                <span className="font-black block uppercase underline text-black mb-0.5">Bank Details :</span>
                <div className="grid grid-cols-12 gap-x-1">
                  <p className="col-span-5 font-bold">PUNJAB NATIONAL BANK</p>
                  <p className="col-span-7">A/C : <span className="font-mono font-bold">6848008700000322</span></p>
                  <p className="col-span-5 text-black uppercase text-[8px]">BRANCH: VIKAS BHAWAN, M.NAGAR</p>
                  <p className="col-span-7">IFSC CODE : <span className="font-mono font-bold">PUNB0684800</span></p>
                </div>
              </div>
              
              <div className="p-2 text-[8px] leading-tight text-black bg-white">
                <span className="font-bold uppercase block text-black mb-0.5 underline">Terms and Condition</span>
                <p>1. All disputes are subject to 'MUZAFFARNAGAR' jurisdiction only.</p>
                <p>2. Interest will be charged 18% per month after 7 days.</p>
                <p>3. Goods once sold will not be taken back or changed.</p>
                <p className="font-bold mt-0.5 text-black">E. & O.E.</p>
              </div>
            </div>

            {/* RIGHT FOOTER SECTION: Clean subtotal block and Grand Total */}
            <div className="col-span-5 flex flex-col justify-between bg-white divide-y divide-black">
              {/* Internal borders removed between tax elements to look like a single clean box */}
              <div className="w-full text-[10px] space-y-1 p-2 px-3">
                <div className="flex justify-between">
                  <span className="font-bold text-black">SUB TOTAL</span>
                  <span className="font-mono font-bold">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-black">SGST</span>
                  <span className="font-mono">₹{sgstTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-black">CGST</span>
                  <span className="font-mono">₹{cgstTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-black/10 pt-1">
                  <span>TOTAL TAX</span>
                  <span className="font-mono">₹{(sgstTotal + cgstTotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between italic text-black">
                  <span>ROUND OFF</span>
                  <span className="font-mono">{roundOff >= 0 ? `+₹${roundOff.toFixed(2)}` : `-₹${Math.abs(roundOff).toFixed(2)}`}</span>
                </div>
              </div>

              <div className="flex flex-col justify-between pt-0">
                <div className="flex justify-between p-1.5 px-3 bg-neutral-100 border-b border-black text-black font-black text-xs">
                  <span>GRAND TOTAL</span>
                  <span className="font-mono text-black">₹{grandTotal.toFixed(2)}.00</span>
                </div>
                
                <div className="flex flex-col justify-between items-center text-center p-2 pt-3 min-h-[65px] bg-white">
                  <span className="font-black text-[9px] tracking-wide text-black uppercase">For A2Z AUTOHEAVEN</span>
                  <span className="block border-t border-black border-dashed w-36 pt-0.5 font-normal text-black capitalize text-[8px] mt-4">
                    Authorised Signatory
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-1 left-6 right-6 flex justify-between items-center text-[7px] text-black z-20">
          <div className="italic">ATOZ Software Engine Mode</div>
        </div>

      </div>
    </div>
  );
}