export default function InvoiceTable({ items, setItems }) {

  const handleChange = (index, field, value) => {
    const updatedItems = [...items];

    if (["qty", "rate", "discount", "sgst", "cgst"].includes(field)) {
      updatedItems[index][field] = value === "" ? "" : Number(value);
    } else {
      updatedItems[index][field] = value;
    }

    const qty = Number(updatedItems[index].qty) || 0;
    const rate = Number(updatedItems[index].rate) || 0;
    const discount = Number(updatedItems[index].discount) || 0;

    updatedItems[index].amount = qty * rate - discount;
    setItems(updatedItems);
  };

  // Intercept the Enter key press to move focus downward or append lines dynamically
  const handleKeyDown = (event, rowIndex, fieldName) => {
    if (event.key === "Enter") {
      event.preventDefault();
      
      const currentTableRows = items.length;
      
      if (rowIndex === currentTableRows - 1) {
        // If on the last row, make a new row automatically
        setItems([
          ...items,
          { hsn: "", partNo: "", description: "", qty: 1, unit: "Nos", rate: 0, discount: 0, sgst: 9, cgst: 9, amount: 0 }
        ]);
        
        // Wait briefly for React to build the row element, then lock focus onto the new element cell
        setTimeout(() => {
          const nextTargetInput = document.querySelector(`[data-row="${rowIndex + 1}"][data-field="${fieldName}"]`);
          if (nextTargetInput) nextTargetInput.focus();
        }, 50);
      } else {
        // Drop focus straight down onto the matching field column of the next index row
        const nextTargetInput = document.querySelector(`[data-row="${rowIndex + 1}"][data-field="${fieldName}"]`);
        if (nextTargetInput) nextTargetInput.focus();
      }
    }
  };

  const addRow = () => {
    setItems([
      ...items,
      { hsn: "", partNo: "", description: "", qty: 1, unit: "Nos", rate: 0, discount: 0, sgst: 9, cgst: 9, amount: 0 },
    ]);
  };

  const deleteRow = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold tracking-tight text-gray-800">Invoice Items</h2>
        <button
          type="button"
          onClick={addRow}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2 rounded-lg shadow-sm"
        >
          + Add Row
        </button>
      </div>

      <div className="overflow-auto border border-gray-200 rounded-lg">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-gray-100 text-gray-700 uppercase font-semibold text-xs">
            <tr>
              <th className="border-b p-2">HSN</th>
              <th className="border-b p-2">Part No</th>
              <th className="border-b p-2">Description</th>
              <th className="border-b p-2 w-16">Qty</th>
              <th className="border-b p-2 w-16">Unit</th>
              <th className="border-b p-2 w-24">Rate</th>
              <th className="border-b p-2 w-20">Discount</th>
              <th className="border-b p-2 w-16">SGST%</th>
              <th className="border-b p-2 w-16">CGST%</th>
              <th className="border-b p-2 w-28 text-right">Amount</th>
              <th className="border-b p-2 text-center w-20">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 bg-white">
            {items.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50/70">
                <td className="p-1">
                  <input
                    data-row={index}
                    data-field="hsn"
                    className="w-full p-1 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    value={row.hsn}
                    onChange={(e) => handleChange(index, "hsn", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index, "hsn")}
                  />
                </td>

                <td className="p-1">
                  <input
                    data-row={index}
                    data-field="partNo"
                    className="w-full p-1 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    value={row.partNo}
                    onChange={(e) => handleChange(index, "partNo", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index, "partNo")}
                  />
                </td>

                <td className="p-1">
                  <input
                    data-row={index}
                    data-field="description"
                    className="w-full p-1 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    value={row.description}
                    onChange={(e) => handleChange(index, "description", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index, "description")}
                  />
                </td>

                <td className="p-1">
                  <input
                    type="number"
                    data-row={index}
                    data-field="qty"
                    className="w-full p-1 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    value={row.qty}
                    min="0"
                    onChange={(e) => handleChange(index, "qty", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index, "qty")}
                  />
                </td>

                <td className="p-1">
                  <input
                    data-row={index}
                    data-field="unit"
                    className="w-full p-1 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    value={row.unit}
                    onChange={(e) => handleChange(index, "unit", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index, "unit")}
                  />
                </td>

                <td className="p-1">
                  <input
                    type="number"
                    data-row={index}
                    data-field="rate"
                    className="w-full p-1 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    value={row.rate}
                    min="0"
                    onChange={(e) => handleChange(index, "rate", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index, "rate")}
                  />
                </td>

                <td className="p-1">
                  <input
                    type="number"
                    data-row={index}
                    data-field="discount"
                    className="w-full p-1 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    value={row.discount}
                    min="0"
                    onChange={(e) => handleChange(index, "discount", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index, "discount")}
                  />
                </td>

                <td className="p-1">
                  <input
                    type="number"
                    data-row={index}
                    data-field="sgst"
                    className="w-full p-1 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    value={row.sgst}
                    min="0"
                    onChange={(e) => handleChange(index, "sgst", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index, "sgst")}
                  />
                </td>

                <td className="p-1">
                  <input
                    type="number"
                    data-row={index}
                    data-field="cgst"
                    className="w-full p-1 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    value={row.cgst}
                    min="0"
                    onChange={(e) => handleChange(index, "cgst", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index, "cgst")}
                  />
                </td>

                <td className="p-2 font-medium text-right text-gray-900 bg-gray-50/50">
                  ₹ {(Number(row.amount) || 0).toFixed(2)}
                </td>

                <td className="p-1 text-center">
                  <button
                    type="button"
                    onClick={() => deleteRow(index)}
                    disabled={items.length === 1}
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      items.length === 1 ? "bg-gray-100 text-gray-400" : "bg-red-500 text-white"
                    }`}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}