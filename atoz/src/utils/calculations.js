export function calculateTotals(items) {
  let subtotal = 0;
  let sgstTotal = 0;
  let cgstTotal = 0;

  items.forEach((item) => {
    const amount = Number(item.amount) || 0;
    const sgst = (amount * (Number(item.sgst) || 0)) / 100;
    const cgst = (amount * (Number(item.cgst) || 0)) / 100;

    subtotal += amount;
    sgstTotal += sgst;
    cgstTotal += cgst;
  });

  const grandTotal = subtotal + sgstTotal + cgstTotal;

  return {
    subtotal,
    sgstTotal,
    cgstTotal,
    grandTotal,
  };
}