export default function CustomerForm() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4 border-b pb-2">
        Customer Details
      </h2>

      <div className="space-y-3">
        <input
          type="text"
          placeholder="Customer Name"
          className="w-full border rounded p-2"
        />

        <textarea
          placeholder="Address"
          className="w-full border rounded p-2"
        />

        <input
          type="text"
          placeholder="Phone Number"
          className="w-full border rounded p-2"
        />

        <input
          type="text"
          placeholder="GST Number"
          className="w-full border rounded p-2"
        />
      </div>
    </div>
  );
}