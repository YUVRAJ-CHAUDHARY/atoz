import { lineAmount } from "../../utils/calculations";

/* ============================================================================
   SELLER (A2Z AUTOHEAVEN) — apni firm ki fixed details. Sirf yahan badalni hain.
   (Buyer / vehicle / items / dates Home.jsx ke state se aate hain.)
   ========================================================================== */
const SELLER = {
  name: "A2Z AUTOHEAVEN",
  address: "VISHNU VIHAR, JANSATH ROAD, MUZAFFARNAGAR-251001.",
  phone: "9528706923",
  email: "a2zautoheaven@gmail.com",
  gstin: "09ABQFA1265J1Z4",
  tagline: "First Choice",
};

const OUR_DETAILS = {
  gstNo: "09ABQFA1265J1Z4",
  state: "Uttar Pradesh",
  stateCode: "09",
  enteredBy: "ACCOUNTANT",
};

const BANK = {
  name: "PUNJAB NATIONAL BANK",
  account: "6848008700000322",
  ifsc: "PUNB0684800",
  branch: "BRANCH : VIKAS BHAWAN, MUZAFFARNAGAR",
};

const TERMS = [
  "All disputes are subject to 'MUZAFFARNAGAR' jurisdiction only",
  "Interest will be charged 18% per month after 7 days.",
  "Goods once sold will not be taken back or changed.",
];

const COPY_TYPE = "Original for Buyer";
const FOOTER_CREDIT = "Powered by ATOZ Billing Software";

const f2 = (n) => (Number.isFinite(+n) ? +n : 0).toFixed(2);

export default function InvoicePrintTemplate({
  printRef,
  invoiceNo,
  invoiceMeta = {},
  items = [],
  totals = {},
  customer = {},
  vehicle = {},
}) {
  return (
    <div className="azi-stage">
      {/* Scoped styles — won't touch the rest of your Tailwind UI */}
      <style>{CSS}</style>

      {/* The A4 sheet — this exact element is what gets printed / turned into PDF */}
      <div className="azi-sheet" ref={printRef}>
        <div className="azi-copytype">{COPY_TYPE}</div>

        <div className="azi-box">
          {/* Letterhead */}
          <div className="azi-head">
            <div className="azi-name">{SELLER.name}</div>
            <div className="azi-addr">{SELLER.address}</div>
            <div className="azi-meta">Phone : {SELLER.phone}</div>
            <div className="azi-meta">E-Mail : {SELLER.email}</div>
            <div className="azi-gstin">GSTIN : {SELLER.gstin}</div>
            <div className="azi-tagline">{SELLER.tagline}</div>
          </div>

          <div className="azi-title">GST INVOICE</div>

          {/* Three detail columns */}
          <div className="azi-details">
            <div className="azi-dcol azi-bill">
              <div className="azi-sec">BILL TO :</div>
              <div className="azi-gap" />
              <Row k="Name" v={customer.name} />
              <Row k="Address" v={customer.address} />
              <div className="azi-gap" />
              <Row k="Ph.No" v={customer.phone} />
              <Row k="Email" v={customer.email} />
              <Row k="GST No" v={customer.gstin} />
            </div>

            <div className="azi-dcol azi-veh">
              <div className="azi-sec">VEHICLE DETAIL :</div>
              <div className="azi-gap" />
              <Row k="Regn. No." v={vehicle.regNo} />
              <div className="azi-gap" />
              <Row k="Make" v={vehicle.make} />
              <Row k="Model" v={vehicle.model} />
              <Row k="Chassis" v={vehicle.chassis} />
              <Row k="Kilo Meters" v={vehicle.kilometers} />
            </div>

            <div className="azi-dcol azi-inv">
              <div className="azi-sec">INVOICE DETAIL :</div>
              <Row k="Invoice No." v={invoiceNo} />
              <Row k="Job Card No." v={invoiceMeta.jobCardNo} />
              <Row k="Job Card Date" v={invoiceMeta.jobCardDate} />
              <Row k="Invoice Date" v={invoiceMeta.invoiceDate} />
              <div className="azi-sec" style={{ marginTop: 5, display: "inline-block" }}>
                OUR DETAILS :
              </div>
              <Row k="GST No" v={OUR_DETAILS.gstNo} />
              <Row k="State" v={OUR_DETAILS.state} />
              <Row k="State Code" v={OUR_DETAILS.stateCode} />
              <Row k="Entered by" v={OUR_DETAILS.enteredBy} />
            </div>
          </div>

          <div className="azi-desc">DESCRIPTION OF PARTS &amp; LABOUR</div>

          {/* Items */}
          <div className="azi-items-wrap">
            <div className="azi-wm">{SELLER.name}</div>
            <table className="azi-items">
              <colgroup>
                <col style={{ width: "3.7%" }} />
                <col style={{ width: "7.4%" }} />
                <col style={{ width: "12.7%" }} />
                <col style={{ width: "28.0%" }} />
                <col style={{ width: "5.0%" }} />
                <col style={{ width: "5.3%" }} />
                <col style={{ width: "9.3%" }} />
                <col style={{ width: "6.4%" }} />
                <col style={{ width: "6.1%" }} />
                <col style={{ width: "6.1%" }} />
                <col style={{ width: "10.0%" }} />
              </colgroup>
              <thead>
                <tr>
                  <th>S.</th>
                  <th>HSN</th>
                  <th>Part</th>
                  <th>Name Of Product</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>Rate</th>
                  <th>Dis%</th>
                  <th>SGST</th>
                  <th>CGST</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((r, i) => (
                  <tr key={i}>
                    <td className="azi-ctr">{i + 1}</td>
                    <td>{r.hsn}</td>
                    <td className="azi-b">{r.partNo}</td>
                    <td className="azi-b">{r.description}</td>
                    <td className="azi-ctr">{r.qty}</td>
                    <td className="azi-ctr">{r.unit}</td>
                    <td className="azi-num">{f2(r.rate)}</td>
                    <td className="azi-num">{f2(r.discount)}</td>
                    <td className="azi-num">{f2(r.sgst)}</td>
                    <td className="azi-num">{f2(r.cgst)}</td>
                    <td className="azi-num">{f2(lineAmount(r))}</td>
                  </tr>
                ))}
                {/* filler keeps the column rules running to the bottom */}
                <tr className="azi-fill">
                  {Array.from({ length: 11 }).map((_, i) => (
                    <td key={i} />
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Bottom: words/bank/terms  |  totals */}
          <div className="azi-bottom">
            <div className="azi-bleft">
              <div className="azi-words-block">
                <div className="azi-words-title">Total Invoice Amount in words :</div>
                <div className="azi-words">{totals.amountInWords}</div>
              </div>
              <div className="azi-bank-block">
                <div className="azi-lbl">Bank Details :</div>
                <div className="azi-bank-lines">
                  <div>A/C - {BANK.account}</div>
                  <div>IFSC CODE - {BANK.ifsc}</div>
                  <div>
                    {BANK.name} &nbsp; {BANK.branch}
                  </div>
                </div>
              </div>
              <div className="azi-terms-block">
                <div className="azi-lbl">Terms and Condition</div>
                <ol>
                  {TERMS.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ol>
                <div className="azi-eoe">E. &amp; O.E.</div>
              </div>
            </div>

            <div className="azi-bright">
              <div className="azi-totals-block">
                <div className="azi-trow"><span>SUB TOTAL</span><span>{f2(totals.subtotal)}</span></div>
                <div className="azi-trow"><span>SGST</span><span>{f2(totals.sgstTotal)}</span></div>
                <div className="azi-trow"><span>CGST</span><span>{f2(totals.cgstTotal)}</span></div>
                <div className="azi-trow"><span>TOTAL TAX</span><span>{f2(totals.totalTax)}</span></div>
                <div className="azi-trow"><span>ROUND OFF</span><span>{f2(totals.roundOff)}</span></div>
              </div>
              <div className="azi-grand-block">
                <span>GRAND TOTAL</span>
                <span>{f2(totals.grandTotal)}</span>
              </div>
              <div className="azi-sign-block">
                <div className="azi-sign-for">For {SELLER.name}</div>
                <div className="azi-sign-auth">Authorised Signatory</div>
              </div>
            </div>
          </div>
        </div>

        <div className="azi-credit">{FOOTER_CREDIT}</div>
      </div>
    </div>
  );
}

function Row({ k, v }) {
  return (
    <div className="azi-drow">
      <span className="azi-k">{k}</span>
      <span className="azi-c">:</span>
      <span className="azi-v">{v}</span>
    </div>
  );
}

/* ============================================================================
   Scoped CSS (only affects .azi-* — your Tailwind UI is untouched)
   ========================================================================== */
const CSS = `
.azi-stage { display:flex; justify-content:center; padding:24px 8px; background:#d7dade; }
.azi-stage * { box-sizing:border-box; margin:0; padding:0; }

.azi-sheet { width:794px; min-height:1123px; background:#fff; padding:16px 16px 14px;
  display:flex; flex-direction:column; font-family:Arial, Helvetica, sans-serif; color:#000;
  box-shadow:0 2px 14px rgba(0,0,0,.18); }

.azi-copytype { text-align:right; font-size:11px; padding:0 2px 3px; }
.azi-box { border:1.6px solid #000; flex:1; display:flex; flex-direction:column; }

.azi-head { position:relative; border-bottom:1.6px solid #000; padding:7px 10px 9px; text-align:center; }
.azi-name { font-size:30px; font-weight:800; letter-spacing:.5px; line-height:1.02; }
.azi-addr { font-size:12.5px; font-weight:700; line-height:1.28; }
.azi-meta { font-size:11.5px; line-height:1.3; }
.azi-gstin { font-size:11.5px; font-weight:700; }
.azi-tagline { position:absolute; right:12px; bottom:9px; font:italic 700 18px/1 Georgia,"Times New Roman",serif; }

.azi-title { border-bottom:1.6px solid #000; text-align:center; font-weight:700; font-size:15px; padding:3px; }

.azi-details { display:flex; border-bottom:1.6px solid #000; font-size:11px; }
.azi-dcol { padding:5px 9px 7px; }
.azi-bill { width:35%; border-right:1.6px solid #000; }
.azi-veh  { width:30%; border-right:1.6px solid #000; }
.azi-inv  { width:35%; }
.azi-sec { font-weight:700; text-decoration:underline; font-size:11.5px; }
.azi-drow { display:flex; line-height:1.55; }
.azi-drow .azi-k { flex:0 0 78px; }
.azi-veh .azi-drow .azi-k { flex-basis:86px; }
.azi-inv .azi-drow .azi-k { flex-basis:92px; }
.azi-drow .azi-c { flex:0 0 9px; }
.azi-drow .azi-v { flex:1; word-break:break-word; }
.azi-gap { height:8px; }

.azi-desc { border-bottom:1.6px solid #000; font-weight:700; font-size:11px; padding:3px 9px; }
.azi-items-wrap { position:relative; flex:1; display:flex; flex-direction:column; }
.azi-wm { position:absolute; top:38%; left:50%; transform:translate(-50%,-50%) rotate(-28deg);
  font:800 70px/1 Arial, sans-serif; color:rgba(0,0,0,.06); white-space:nowrap; pointer-events:none;
  z-index:0; letter-spacing:2px; }

.azi-items { width:100%; height:100%; border-collapse:collapse; font-size:11px; position:relative; z-index:1; table-layout:fixed; }
.azi-items th, .azi-items td { border-right:1px solid #000; padding:2px 5px; vertical-align:top; overflow:hidden; }
.azi-items th:last-child, .azi-items td:last-child { border-right:none; }
.azi-items thead th { border-bottom:1.6px solid #000; font-weight:700; text-align:center; font-size:11px; }
.azi-num { text-align:right; }
.azi-ctr { text-align:center; }
.azi-b { font-weight:700; }
.azi-fill td { height:100%; border-bottom:none; }

.azi-bottom { display:flex; border-top:1.6px solid #000; font-size:11px; }
.azi-bleft  { width:62%; display:flex; flex-direction:column; border-right:1.6px solid #000; }
.azi-bright { width:38%; display:flex; flex-direction:column; }

.azi-words-block { padding:8px 10px 10px; }
.azi-words-title { text-align:center; font-weight:700; text-decoration:underline; }
.azi-words { text-align:center; font-weight:700; margin-top:6px; }

.azi-bank-block { border-top:1.6px solid #000; padding:6px 10px; display:flex; gap:10px; }
.azi-bank-block .azi-lbl { font-weight:700; text-decoration:underline; flex:0 0 auto; }
.azi-bank-lines { line-height:1.5; }

.azi-terms-block { border-top:1.6px solid #000; padding:6px 10px 8px; flex:1; }
.azi-terms-block .azi-lbl { font-weight:700; text-decoration:underline; }
.azi-terms-block ol { margin:4px 0 0 16px; line-height:1.5; }
.azi-terms-block ol li { font-weight:700; }
.azi-eoe { margin-top:4px; font-weight:700; }

.azi-totals-block { padding:8px 10px; }
.azi-trow { display:flex; justify-content:space-between; line-height:1.65; font-weight:700; }
.azi-grand-block { border-top:1.6px solid #000; padding:8px 10px; display:flex; justify-content:space-between;
  align-items:baseline; font-weight:800; font-size:16px; }
.azi-sign-block { border-top:1.6px solid #000; padding:8px 10px; flex:1; display:flex; flex-direction:column; }
.azi-sign-for { font-weight:700; }
.azi-sign-auth { margin-top:auto; text-align:right; font-weight:700; }

.azi-credit { text-align:center; font:italic 10px/1 Arial; color:#555; padding-top:6px; }
`;