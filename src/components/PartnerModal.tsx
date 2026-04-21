import { useState } from "react";

type Props = {
  onClose: () => void;
};

export default function PartnerModal({ onClose }: Props) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    program: "",
    status: "",
    timeframe: "",
  });

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    console.log("Partner Data:", form);

    // 👉 later connect backend here

    onClose(); // close modal after save
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

      {/* Modal container */}
      <div className="bg-white w-full max-w-3xl rounded-xl p-6 shadow-lg relative space-y-6">

        {/* Title */}
        <h2 className="text-lg font-semibold">Partner Details</h2>

        {/* Form */}
        <div className="space-y-4">

          {/* Partner Name */}
          <Input
            label="Partner Name *"
            value={form.name}
            onChange={(v) => handleChange("name", v)}
            placeholder="e.g. Acme Corporation"
          />

          {/* Contact + Email */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Contact Number"
              value={form.phone}
              onChange={(v) => handleChange("phone", v)}
              placeholder="+250 788 123 456"
            />
            <Input
              label="Email Address *"
              value={form.email}
              onChange={(v) => handleChange("email", v)}
              placeholder="contact@partner.com"
            />
          </div>

          {/* Section */}
          <h3 className="font-semibold mt-2">Program & Engagement</h3>

          <Select
            label="Partnership Program"
            value={form.program}
            onChange={(v) => handleChange("program", v)}
            options={["Program A", "Program B"]}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Program Status *"
              value={form.status}
              onChange={(v) => handleChange("status", v)}
              options={["Active", "Pending", "Closed"]}
            />
            <Select
              label="Program Timeframe *"
              value={form.timeframe}
              onChange={(v) => handleChange("timeframe", v)}
              options={["2024-2025", "2025-2026"]}
            />
          </div>

          {/* Note */}
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded text-sm text-gray-600">
            ⚠️ This partner entry automatically syncs with analytics dashboards.
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-yellow-500 text-black rounded font-medium hover:bg-yellow-400"
          >
            Save Partner
          </button>
        </div>

        {/* Close (X) */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-black"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

/* ✅ Input */
function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-sm text-gray-600">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full mt-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
      />
    </div>
  );
}

/* ✅ Select */
function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="text-sm text-gray-600">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
      >
        <option value="">Select</option>
        {options.map((opt) => (
          <option key={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}