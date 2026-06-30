export default function VehicleForm() {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4 border-b pb-2">
        Vehicle Details
      </h2>

      <div className="space-y-3">

        <input
          placeholder="Registration Number"
          className="w-full border rounded p-2"
        />

        <input
          placeholder="Vehicle Make"
          className="w-full border rounded p-2"
        />

        <input
          placeholder="Model"
          className="w-full border rounded p-2"
        />

        <input
          placeholder="Engine Number"
          className="w-full border rounded p-2"
        />

        <input
          placeholder="Chassis Number"
          className="w-full border rounded p-2"
        />

        <input
          placeholder="Kilometer Reading"
          className="w-full border rounded p-2"
        />

      </div>
    </div>
  );
}