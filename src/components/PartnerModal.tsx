import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  onClose: () => void;
  onSave: (payload: {
    partnerName: string;
    contactNumber: string;
    email: string;
    partnershipProgram: string;
    programStatus: "ONGOING" | "INCOMING" | "COMPLETED";
    fromYear: number;
    toYear: number;
  }) => Promise<void>;
  isSaving?: boolean;
};

const mapStatusToApi = (value: string): "ONGOING" | "INCOMING" | "COMPLETED" | null => {
  if (value === "Active") return "ONGOING";
  if (value === "Pending") return "INCOMING";
  if (value === "Closed") return "COMPLETED";
  return null;
};

export default function PartnerModal({ onClose, onSave, isSaving = false }: Props) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    program: "",
    status: "",
    timeframe: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      const [fromYearRaw, toYearRaw] = form.timeframe.split("-").map((value) => value.trim());
      const fromYear = Number(fromYearRaw);
      const toYear = Number(toYearRaw);
      const programStatus = mapStatusToApi(form.status);

      if (!form.name || !form.phone || !form.email || !form.program || !programStatus || !Number.isInteger(fromYear) || !Number.isInteger(toYear)) {
        setError("Please complete all required fields with a valid timeframe (e.g. 2024-2025).");
        return;
      }

      await onSave({
        partnerName: form.name,
        contactNumber: form.phone,
        email: form.email,
        partnershipProgram: form.program,
        programStatus,
        fromYear,
        toYear,
      });
      onClose();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to save partner.");
    }
  };

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">

      {/* Modal container */}
      <div className="bg-white w-full max-w-3xl rounded-md p-4 sm:p-6 shadow-lg relative space-y-5 mt-0 mb-0 max-h-[calc(100vh-1.5rem)] sm:max-h-[calc(100vh-2rem)] md:max-h-[calc(100vh-3rem)] overflow-y-auto">

        {/* Title */}
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base sm:text-lg font-semibold">Partner Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-black transition-colors"
            aria-label="Close partner modal"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {error ? <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div> : null}

          {/* Partner Name */}
          <Input
            label="Partner Name *"
            value={form.name}
            onChange={(v) => handleChange("name", v)}
            placeholder="e.g. Acme Corporation"
          />

          {/* Contact + Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 border rounded hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            disabled={isSaving}
            onClick={handleSubmit}
            className="w-full sm:w-auto px-6 py-2 bg-yellow-500 text-black rounded font-medium hover:bg-yellow-400 disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save Partner"}
          </button>
        </div>
      </div>
    </div>,
    document.body
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