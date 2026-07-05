import { useState, useRef, useEffect } from "react";
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

function convertNumberToWords(amount) {
  const words = {
    0: 'Zero', 1: 'One', 2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five', 6: 'Six', 7: 'Seven', 8: 'Eight', 9: 'Nine',
    10: 'Ten', 11: 'Eleven', 12: 'Twelve', 13: 'Thirteen', 14: 'Fourteen', 15: 'Fifteen', 16: 'Sixteen', 17: 'Seventeen', 18: 'Eighteen', 19: 'Nineteen',
    20: 'Twenty', 30: 'Thirty', 40: 'Forty', 50: 'Fifty', 60: 'Sixty', 70: 'Seventy', 80: 'Eighty', 90: 'Ninety'
  };

  function convertLessThanOneThousand(n) {
    let rem, word = "";
    if (n >= 100) {
      rem = n % 100;
      word = words[Math.floor(n / 100)] + " Hundred";
      if (rem > 0) word += " and " + convertLessThanOneThousand(rem);
      return word;
    }
    if (n >= 20) {
      rem = n % 10;
      word = words[Math.floor(n / 10) * 10];
      if (rem > 0) word += " " + words[rem];
      return word;
    }
    return words[n];
  }

  let num = Math.floor(amount);
  if (num === 0) return "Zero Rupees Only";

  let lakhs     = Math.floor(num / 100000); num %= 100000;
  let thousands = Math.floor(num / 1000);   num %= 1000;
  let remaining = num;

  let result = "";
  if (lakhs > 0)     result += convertLessThanOneThousand(lakhs)     + " Lakh ";
  if (thousands > 0) result += convertLessThanOneThousand(thousands) + " Thousand ";
  if (remaining > 0) result += convertLessThanOneThousand(remaining);

  return result.trim() + " Rupees Only";
}

export default function Home() {
  const [items, setItems] = useState([
    { hsn: "8512",   partNo: "GS-5400890",  description: "xxxxxxxx",          qty: 2, unit: "PCS", rate: 1017.00, discount: 0, sgst: 9, cgst: 9, amount: 2400.12 },
      ]);

  const [invoiceNo, setInvoiceNo] = useState("A2Z250011");
  const [customer, setCustomer] = useState({
    name: "xxxxxxxx",
    address: "XXXXXX",
    phone: "9927XXXXXX",
    gstin: "XXX"
  });
  const [vehicle, setVehicle] = useState({
    regNo: "UP12XXXXXX", make: "MARUTI", model: "xxxxxxxx", chassis: "XX145336", km: "00000"
  });
  const [meta, setMeta] = useState({
    jobCardNo: "AZ25-xxxxxxxx", jobCardDate: "29-05-2025", invoiceDate: "29-05-2025",
    ourGstin: "09ABQFA1265J1Z4", state: "Uttar Pradesh", stateCode: "09", enteredBy: "ACCOUNTANT"
  });

  const printElementRef = useRef(null);

  /* ── Responsive scale: A4 (794px wide) shrinks to fit viewport ── */
  const A4_W = 794;
  const A4_H = 1123;
  const [pageScale, setPageScale] = useState(1);
  useEffect(() => {
    const calc = () => {
      const avail = window.innerWidth - 24;
      setPageScale(avail < A4_W ? avail / A4_W : 1);
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  const subtotal  = items.reduce((s, it) => s + (Number(it.qty||0) * Number(it.rate||0) * (1 - Number(it.discount||0)/100)), 0);
  const sgstTotal = items.reduce((s, it) => s + (Number(it.qty||0) * Number(it.rate||0) * (1 - Number(it.discount||0)/100)) * (Number(it.sgst||0)/100), 0);
  const cgstTotal = items.reduce((s, it) => s + (Number(it.qty||0) * Number(it.rate||0) * (1 - Number(it.discount||0)/100)) * (Number(it.cgst||0)/100), 0);
  const exactGrandTotal = subtotal + sgstTotal + cgstTotal;
  const grandTotal      = Math.round(exactGrandTotal);
  const roundOff        = grandTotal - exactGrandTotal;
  const amountInWords   = convertNumberToWords(grandTotal);

  const handleItemChange = (index, field, value) => {
    const next = [...items];
    if (["qty", "rate", "discount", "sgst", "cgst"].includes(field)) {
      let v = value === "" ? "" : Number(value);
      if (v < 0) v = 0;
      next[index][field] = v;
    } else {
      next[index][field] = value;
    }
    const qty  = Number(next[index].qty)      || 0;
    const rate = Number(next[index].rate)     || 0;
    const disc = Number(next[index].discount) || 0;
    const sgst = Number(next[index].sgst)     || 0;
    const cgst = Number(next[index].cgst)     || 0;
    const base = qty * rate * (1 - disc / 100);
    next[index].amount = base + base * (sgst + cgst) / 100;
    setItems(next);
  };

  const addRow = () => {
    if (items.length >= 18) { alert("Maximum 18 items allowed per page!"); return; }
    setItems([...items, { hsn: "", partNo: "", description: "", qty: 1, unit: "PCS", rate: 0, discount: 0, sgst: 9, cgst: 9, amount: 0 }]);
  };

  const deleteRow = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleGeneratePDF = async () => {
    if (!printElementRef.current) return;
    try {
      const canvas = await html2canvas(printElementRef.current, { scale: 2, useCORS: true, scrollY: -window.scrollY });
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, 297);
      pdf.save(`${invoiceNo}.pdf`);
    } catch (e) { console.error("PDF error:", e); }
  };

  const B    = '1px solid black';
  const FONT = 'Arial, sans-serif';
  const iStyle = { border: 'none', outline: 'none', background: 'transparent', fontFamily: FONT, padding: 0, margin: 0, width: '100%' };

  return (
    <div style={{ background: '#c8c8c8', minHeight: '100vh', padding: pageScale < 1 ? '8px' : '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: A4 portrait; margin: 0mm !important; }
          body * { visibility: hidden; }
          .pzone, .pzone * { visibility: visible; }
          .pzone {
            position: absolute !important; left: 0 !important; top: 0 !important;
            width: 210mm !important; height: 297mm !important;
            padding: 5mm !important; margin: 0 !important;
            border: none !important; box-sizing: border-box !important;
            overflow: hidden !important;
          }
          input { border: none !important; background: transparent !important; outline: none !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .noprint { display: none !important; }
        }
        * { box-sizing: border-box; }
        input {
          border: none; outline: none; background: transparent;
          font-family: Arial, sans-serif; padding: 0; margin: 0;
          -webkit-appearance: none; -moz-appearance: textfield; appearance: none;
        }
        input:focus { background: rgba(255,255,200,0.7); border-radius: 2px; }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
      ` }} />

      {/* Toolbar */}
      <div className="noprint" style={{ width: pageScale < 1 ? `${Math.round(A4_W * pageScale)}px` : '210mm', background: 'white', padding: '7px 10px', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: B, flexWrap: 'wrap', gap: '6px' }}>
        <span style={{ fontSize: pageScale < 1 ? '10px' : '12px', fontWeight: 'bold', fontFamily: FONT, textTransform: 'uppercase', letterSpacing: '1px' }}>A2Z Invoice</span>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button onClick={addRow}              style={{ padding: pageScale < 1 ? '4px 8px' : '4px 12px', background: '#2563eb', color: 'white', fontSize: pageScale < 1 ? '10px' : '12px', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer', fontFamily: FONT }}>+ Item</button>
          <button onClick={() => window.print()} style={{ padding: pageScale < 1 ? '4px 8px' : '4px 12px', background: '#15803d', color: 'white', fontSize: pageScale < 1 ? '10px' : '12px', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer', fontFamily: FONT }}>Print</button>
          <button onClick={handleGeneratePDF}   style={{ padding: pageScale < 1 ? '4px 8px' : '4px 12px', background: '#111',    color: 'white', fontSize: pageScale < 1 ? '10px' : '12px', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer', fontFamily: FONT }}>PDF</button>
        </div>
      </div>

      {/* A4 Page — scale wrapper keeps layout correct on mobile */}
      <div style={{
        width:  pageScale < 1 ? `${Math.round(A4_W * pageScale)}px` : '210mm',
        height: pageScale < 1 ? `${Math.round(A4_H * pageScale)}px` : '297mm',
        position: 'relative', flexShrink: 0
      }}>
      <div
        ref={printElementRef}
        className="pzone"
        style={{
          width: '210mm', height: '297mm', background: 'white', border: B,
          padding: '5mm', fontFamily: FONT, color: 'black',
          display: 'flex', flexDirection: 'column',
          position: pageScale < 1 ? 'absolute' : 'relative',
          top: 0, left: 0,
          overflow: 'hidden', fontSize: '11px', lineHeight: 1.55,
          transform: pageScale < 1 ? `scale(${pageScale})` : 'none',
          transformOrigin: 'top left',
        }}
      >
        {/* Watermark */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 0, overflow: 'hidden', userSelect: 'none' }}>
          <div style={{ fontSize: '86px', fontWeight: '900', color: 'rgba(0,0,0,0.055)', transform: 'rotate(-28deg)', textAlign: 'center', lineHeight: 1.05, letterSpacing: '6px', textTransform: 'uppercase', whiteSpace: 'nowrap', fontFamily: FONT }}>
            A2Z<br />AUTOHEAVEN
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>

          {/* Single outer border — all sections share this box */}
          <div style={{ border: B, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>

          {/* HEADER */}
          <div style={{ borderBottom: B, padding: '6px 8px', position: 'relative', textAlign: 'center' }}>
            <div style={{ position: 'absolute', top: '4px', right: '7px', fontSize: '7px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Original for Buyer</div>
            <div style={{ position: 'absolute', bottom: '6px', right: '8px', fontSize: '13px', fontWeight: '900', fontStyle: 'italic' }}>First Choice</div>
            <div style={{ fontSize: '22px', fontWeight: '900', letterSpacing: '3px', lineHeight: 1.1 }}>A2Z AUTOHEAVEN</div>
            <div style={{ fontSize: '11px', fontWeight: '600', marginTop: '3px' }}>VISHNU VIHAR, JANSATH ROAD,</div>
            <div style={{ fontSize: '11px', fontWeight: '600' }}>MUZAFFARNAGAR-251001.</div>
            <div style={{ fontSize: '10.5px', marginTop: '2px' }}>Phone : 9528706923</div>
            <div style={{ fontSize: '10.5px' }}>E-Mail : a2zautoheaven@gmail.com</div>
            <div style={{ fontSize: '10.5px', fontWeight: 'bold', marginTop: '1px' }}>GSTIN : 09ABQFA1265J1Z4</div>
            <div style={{ display: 'inline-block', marginTop: '5px', paddingTop: '3px', borderTop: B, fontSize: '12px', fontWeight: '900', letterSpacing: '4px', textTransform: 'uppercase' }}>
              GST INVOICE
            </div>
          </div>

          {/* INFO GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: B }}>

            {/* Bill To */}
            <div style={{ padding: '6px 8px', borderRight: B }}>
              <div style={{ fontWeight: '900', textDecoration: 'underline', fontSize: '10px', textTransform: 'uppercase', marginBottom: '5px' }}>BILL TO:</div>
              {[
                { lbl: 'Name:',    val: customer.name,    key: 'name',    bold: true              },
                { lbl: 'Address:', val: customer.address, key: 'address'                          },
                { lbl: 'Ph.No:',   val: customer.phone,   key: 'phone'                            },
                { lbl: 'GST No:',  val: customer.gstin,   key: 'gstin',   bold: true, upper: true },
              ].map(({ lbl, val, key, bold, upper }) => (
                <div key={key} style={{ display: 'flex', marginBottom: '5px', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 'bold', minWidth: '52px', flexShrink: 0, fontSize: '10.5px', letterSpacing: '0.2px' }}>{lbl}</span>
                  <input type="text" value={val} onChange={e => setCustomer({ ...customer, [key]: e.target.value })}
                    style={{ ...iStyle, fontSize: '10.5px', fontWeight: bold ? 'bold' : 'normal', textTransform: upper ? 'uppercase' : 'none' }} />
                </div>
              ))}
            </div>

            {/* Vehicle */}
            <div style={{ padding: '6px 8px', borderRight: B }}>
              <div style={{ fontWeight: '900', textDecoration: 'underline', fontSize: '10px', textTransform: 'uppercase', marginBottom: '5px' }}>VEHICLE DETAIL:</div>
              {[
                { lbl: 'Regn. No.:',   val: vehicle.regNo,   key: 'regNo',   bold: true, upper: true },
                { lbl: 'Make:',        val: vehicle.make,    key: 'make'                              },
                { lbl: 'Model:',       val: vehicle.model,   key: 'model'                             },
                { lbl: 'Chassis:',     val: vehicle.chassis, key: 'chassis'                           },
                { lbl: 'Kilo Meters:', val: vehicle.km,      key: 'km'                                },
              ].map(({ lbl, val, key, bold, upper }) => (
                <div key={key} style={{ display: 'flex', marginBottom: '5px', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 'bold', minWidth: '82px', flexShrink: 0, fontSize: '10.5px', letterSpacing: '0.2px', letterSpacing: '0.2px' }}>{lbl}</span>
                  <input type="text" value={val} onChange={e => setVehicle({ ...vehicle, [key]: e.target.value })}
                    style={{ ...iStyle, fontSize: '10.5px', fontWeight: bold ? 'bold' : 'normal', textTransform: upper ? 'uppercase' : 'none' }} />
                </div>
              ))}
            </div>

            {/* Invoice Detail */}
            <div style={{ padding: '6px 8px' }}>
              <div style={{ fontWeight: '900', textDecoration: 'underline', fontSize: '10px', textTransform: 'uppercase', marginBottom: '5px' }}>INVOICE DETAIL:</div>
              {[
                { lbl: 'Invoice No:',    val: invoiceNo,        setter: v => setInvoiceNo(v), bold: true },
                { lbl: 'Job Card No.:', val: meta.jobCardNo,   key: 'jobCardNo'                         },
                { lbl: 'Job Card Date:',val: meta.jobCardDate, key: 'jobCardDate'                       },
                { lbl: 'Invoice Date:', val: meta.invoiceDate, key: 'invoiceDate'                       },
              ].map(({ lbl, val, key, setter, bold }) => (
                <div key={lbl} style={{ display: 'flex', marginBottom: '5px', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 'bold', minWidth: '82px', flexShrink: 0, fontSize: '10.5px', letterSpacing: '0.2px' }}>{lbl}</span>
                  <input type="text" value={val}
                    onChange={e => setter ? setter(e.target.value) : setMeta({ ...meta, [key]: e.target.value })}
                    style={{ ...iStyle, fontSize: '10.5px', fontWeight: bold ? 'bold' : 'normal' }} />
                </div>
              ))}
              <div style={{ borderTop: B, marginTop: '6px', paddingTop: '5px' }}>
                <div style={{ fontWeight: '900', textDecoration: 'underline', fontSize: '10px', textTransform: 'uppercase', marginBottom: '5px' }}>OUR DETAILS:</div>
                {[
                  { lbl: 'GST No:',     key: 'ourGstin',  bold: true, upper: true },
                  { lbl: 'State:',      key: 'state'                              },
                  { lbl: 'State Code:', key: 'stateCode'                          },
                  { lbl: 'Entered by:', key: 'enteredBy',             upper: true },
                ].map(({ lbl, key, bold, upper }) => (
                  <div key={key} style={{ display: 'flex', marginBottom: '5px', alignItems: 'baseline' }}>
                    <span style={{ fontWeight: 'bold', minWidth: '82px', flexShrink: 0, fontSize: '10.5px', letterSpacing: '0.2px' }}>{lbl}</span>
                    <input type="text" value={meta[key]} onChange={e => setMeta({ ...meta, [key]: e.target.value })}
                      style={{ ...iStyle, fontSize: '10.5px', fontWeight: bold ? 'bold' : 'normal', textTransform: upper ? 'uppercase' : 'none' }} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TABLE SECTION */}
          <div style={{ borderBottom: B, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* Section heading */}
            <div style={{ fontWeight: '900', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.3px', borderBottom: B, padding: '3px 5px', fontFamily: FONT, flexShrink: 0 }}>
              DESCRIPTION OF PARTS &amp; LABOUR
            </div>

            <table style={{ width: '100%', height: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', fontFamily: FONT }}>
              <colgroup>
                <col style={{ width: '20px' }} />
                <col style={{ width: '44px' }} />
                <col style={{ width: '78px' }} />
                <col />{/* Name — flexible */}
                <col style={{ width: '26px' }} />
                <col style={{ width: '28px' }} />
                <col style={{ width: '54px' }} />
                <col style={{ width: '30px' }} />
                <col style={{ width: '32px' }} />
                <col style={{ width: '32px' }} />
                <col style={{ width: '60px' }} />
                <col style={{ width: '16px' }} />
              </colgroup>
              <thead>
                <tr style={{ background: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: '9px', borderBottom: B, borderTop: B, height: '22px' }}>
                  <th style={{ borderRight: B, padding: '2px 1px', textTransform: 'uppercase', fontWeight: '900' }}>S.</th>
                  <th style={{ borderRight: B, padding: '2px 1px', textTransform: 'uppercase', fontWeight: '900' }}>HSN</th>
                  <th style={{ borderRight: B, padding: '2px 1px', textTransform: 'uppercase', fontWeight: '900' }}>Part</th>
                  <th style={{ borderRight: B, padding: '2px 3px', textAlign: 'left', textTransform: 'uppercase', fontWeight: '900' }}>Name Of Product</th>
                  <th style={{ borderRight: B, padding: '2px 1px', textTransform: 'uppercase', fontWeight: '900' }}>Qty</th>
                  <th style={{ borderRight: B, padding: '2px 1px', textTransform: 'uppercase', fontWeight: '900' }}>Unit</th>
                  <th style={{ borderRight: B, padding: '2px 2px', textAlign: 'right', textTransform: 'uppercase', fontWeight: '900' }}>Rate</th>
                  <th style={{ borderRight: B, padding: '2px 1px', textTransform: 'uppercase', fontWeight: '900' }}>Dis%</th>
                  <th style={{ borderRight: B, padding: '2px 1px', textTransform: 'uppercase', fontWeight: '900' }}>SGST</th>
                  <th style={{ borderRight: B, padding: '2px 1px', textTransform: 'uppercase', fontWeight: '900' }}>CGST</th>
                  <th style={{ padding: '2px 3px', textAlign: 'right', textTransform: 'uppercase', fontWeight: '900' }}>Amount</th>
                  <th className="noprint" style={{ padding: '1px' }}></th>
                </tr>
              </thead>
              <tbody>
                {/* Only real data rows — NO empty filler rows */}
                {items.map((item, index) => (
                  <tr key={index} style={{ height: '23px', verticalAlign: 'middle' }}>
                    <td style={{ borderRight: B, textAlign: 'center', fontWeight: 'bold', padding: '0 1px' }}>{index + 1}</td>
                    <td style={{ borderRight: B, padding: '0 1px' }}>
                      <input type="text" value={item.hsn} onChange={e => handleItemChange(index, "hsn", e.target.value)}
                        style={{ ...iStyle, textAlign: 'center', fontSize: '10px', fontFamily: 'monospace' }} />
                    </td>
                    <td style={{ borderRight: B, padding: '0 1px' }}>
                      <input type="text" value={item.partNo} onChange={e => handleItemChange(index, "partNo", e.target.value)}
                        style={{ ...iStyle, textAlign: 'center', fontSize: '9.5px', fontFamily: 'monospace' }} />
                    </td>
                    <td style={{ borderRight: B, padding: '0 3px' }}>
                      <input type="text" value={item.description} onChange={e => handleItemChange(index, "description", e.target.value)}
                        style={{ ...iStyle, textAlign: 'left', fontSize: '10.5px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                    </td>
                    <td style={{ borderRight: B, padding: '0 1px' }}>
                      <input type="number" value={item.qty} onChange={e => handleItemChange(index, "qty", e.target.value)}
                        style={{ ...iStyle, textAlign: 'center', fontSize: '10.5px' }} />
                    </td>
                    <td style={{ borderRight: B, padding: '0 1px' }}>
                      <input type="text" value={item.unit} onChange={e => handleItemChange(index, "unit", e.target.value)}
                        style={{ ...iStyle, textAlign: 'center', fontSize: '10.5px', textTransform: 'uppercase' }} />
                    </td>
                    <td style={{ borderRight: B, padding: '0 2px' }}>
                      <input type="number" value={item.rate} onChange={e => handleItemChange(index, "rate", e.target.value)}
                        style={{ ...iStyle, textAlign: 'right', fontSize: '10.5px', fontFamily: 'monospace' }} />
                    </td>
                    <td style={{ borderRight: B, padding: '0 2px' }}>
                      <input type="number" value={item.discount} onChange={e => handleItemChange(index, "discount", e.target.value)}
                        style={{ ...iStyle, textAlign: 'right', fontSize: '10.5px', fontFamily: 'monospace' }} />
                    </td>
                    <td style={{ borderRight: B, padding: '0 1px' }}>
                      <input type="number" value={item.sgst} onChange={e => handleItemChange(index, "sgst", e.target.value)}
                        style={{ ...iStyle, textAlign: 'center', fontSize: '10.5px', fontFamily: 'monospace' }} />
                    </td>
                    <td style={{ borderRight: B, padding: '0 1px' }}>
                      <input type="number" value={item.cgst} onChange={e => handleItemChange(index, "cgst", e.target.value)}
                        style={{ ...iStyle, textAlign: 'center', fontSize: '10.5px', fontFamily: 'monospace' }} />
                    </td>
                    <td style={{ padding: '0 3px', textAlign: 'right', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '10.5px' }}>
                      {Number(item.amount).toFixed(2)}
                    </td>
                    <td className="noprint" style={{ textAlign: 'center', padding: 0 }}>
                      <button onClick={() => deleteRow(index)} style={{ color: '#cc0000', fontWeight: '900', fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1, padding: '0 2px' }}>
                        &times;
                      </button>
                    </td>
                  </tr>
                ))}
                {/* Empty rows — column lines only, NO horizontal row lines */}
                {Array.from({ length: Math.max(0, 16 - items.length) }).map((_, i) => (
                  <tr key={"e" + i} style={{ height: '23px' }}>
                    <td style={{ borderRight: B }}></td><td style={{ borderRight: B }}></td>
                    <td style={{ borderRight: B }}></td><td style={{ borderRight: B }}></td>
                    <td style={{ borderRight: B }}></td><td style={{ borderRight: B }}></td>
                    <td style={{ borderRight: B }}></td><td style={{ borderRight: B }}></td>
                    <td style={{ borderRight: B }}></td><td style={{ borderRight: B }}></td>
                    <td></td><td className="noprint"></td>
                  </tr>
                ))}
                <tr style={{ height: '100%' }}>
                  <td style={{ borderRight: B }}></td><td style={{ borderRight: B }}></td>
                  <td style={{ borderRight: B }}></td><td style={{ borderRight: B }}></td>
                  <td style={{ borderRight: B }}></td><td style={{ borderRight: B }}></td>
                  <td style={{ borderRight: B }}></td><td style={{ borderRight: B }}></td>
                  <td style={{ borderRight: B }}></td><td style={{ borderRight: B }}></td>
                  <td></td><td className="noprint"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* FOOTER */}
          <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr' }}>

            {/* Left footer */}
            <div style={{ borderRight: B, display: 'flex', flexDirection: 'column' }}>

              {/* Amount in words */}
              <div style={{ borderBottom: B, padding: '5px 8px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '38px' }}>
                <span style={{ fontSize: '9.5px', fontWeight: 'bold', textDecoration: 'underline', display: 'block', marginBottom: '3px' }}>
                  Total Invoice Amount in words :
                </span>
                <span style={{ fontWeight: '600', fontSize: '10.5px' }}>
                  Rs. {amountInWords}
                </span>
              </div>

              {/* Bank details — two-column like reference photo */}
              <div style={{ borderBottom: B, padding: '4px 7px', display: 'flex', gap: '8px' }}>
                <div style={{ flexShrink: 0, minWidth: '90px' }}>
                  <div style={{ fontWeight: '900', textDecoration: 'underline', fontSize: '10px', marginBottom: '5px' }}>Bank Details :</div>
                  <div style={{ fontWeight: 'bold', fontSize: '10px' }}>PUNJAB NATIONAL BANK</div>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 2px', fontSize: '9.5px' }}>A/C - <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>6848008700000322</span></p>
                  <p style={{ margin: '0 0 2px', fontSize: '9.5px' }}>IFSC CODE - <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>PUNB0684800</span></p>
                  <p style={{ margin: 0, fontSize: '9px', textTransform: 'uppercase' }}>BRANCH : VIKAS BHAWAN, MUZAFFARNAGAR</p>
                </div>
              </div>

              {/* Terms */}
              <div style={{ padding: '4px 7px', flex: 1 }}>
                <span style={{ fontWeight: 'bold', textDecoration: 'underline', display: 'block', marginBottom: '3px', fontSize: '10px' }}>
                  Terms and Condition
                </span>
                <p style={{ margin: '0 0 2px', fontSize: '9.5px' }}>1. All disputes are subject to &apos;MUZAFFARNAGAR&apos; jurisdiction only.</p>
                <p style={{ margin: '0 0 2px', fontSize: '9.5px' }}>2. Interest will be charged 18% per month after 7 days.</p>
                <p style={{ margin: '0 0 3px', fontSize: '9.5px' }}>3. Goods once sold will not be taken back or changed.</p>
                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '10px' }}>E. &amp; O.E.</p>
              </div>
            </div>

            {/* Right footer */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>

              {/* Totals */}
              <div style={{ padding: '5px 10px', flex: 1 }}>
                {[
                  { lbl: 'SUB TOTAL', val: subtotal.toFixed(2),                   bold: true                 },
                  { lbl: 'SGST',      val: sgstTotal.toFixed(2),                  bold: false                },
                  { lbl: 'CGST',      val: cgstTotal.toFixed(2),                  bold: false                },
                  { lbl: 'TOTAL TAX', val: (sgstTotal + cgstTotal).toFixed(2),    bold: true, topBorder: true },
                  { lbl: 'ROUND OFF', val: roundOff >= 0 ? `+${roundOff.toFixed(2)}` : `${roundOff.toFixed(2)}`, italic: true },
                ].map(({ lbl, val, bold, italic, topBorder }) => (
                  <div key={lbl} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', borderTop: topBorder ? B : 'none', paddingTop: topBorder ? '3px' : 0, fontWeight: bold ? 'bold' : 'normal', fontStyle: italic ? 'italic' : 'normal', fontSize: '10.5px' }}>
                    <span>{lbl}</span>
                    <span style={{ fontFamily: 'monospace' }}>{val}</span>
                  </div>
                ))}
              </div>

              {/* Grand total */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 10px', background: '#e8e8e8', border: B, fontWeight: '900', fontSize: '12px' }}>
                  <span>GRAND TOTAL</span>
                  <span style={{ fontFamily: 'monospace' }}>{grandTotal}.00</span>
                </div>

                {/* Signature */}
                <div style={{ padding: '5px 8px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', minHeight: '55px' }}>
                  <span style={{ fontWeight: '900', fontSize: '10.5px', letterSpacing: '0.3px' }}>For A2Z AUTOHEAVEN</span>
                  <div style={{ borderTop: '1px dashed black', paddingTop: '3px', fontSize: '10px', width: '140px', textAlign: 'center' }}>
                    Authorised Signatory
                  </div>
                </div>
              </div>
            </div>
          </div>

          </div>{/* end single outer border */}

          {/* Bottom tag */}
          <div style={{ display: 'flex', padding: '1px 2px', fontSize: '6px', color: '#888', marginTop: '1px' }}>
            <span style={{ fontStyle: 'italic' }}>ATOZ Software Engine Mode</span>
          </div>

        </div>
      </div>
      </div>{/* end scale wrapper */}
    </div>
  );
}
