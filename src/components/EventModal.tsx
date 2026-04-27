import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { Calendar, MapPin, Search, X } from "lucide-react";

type Props = {
  onClose: () => void;
};

export default function EventModal({ onClose }: Props) {
  const [companies, setCompanies] = useState<string[]>([
    "EcoTech Solutions",
    "GreenEnergy Corp",
  ]);
  const [companyInput, setCompanyInput] = useState("");

  const removeCompany = (name: string) => {
    setCompanies((prev) => prev.filter((c) => c !== name));
  };

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const addCompany = () => {
    const value = companyInput.trim();
    if (!value || companies.includes(value)) return;
    setCompanies((prev) => [...prev, value]);
    setCompanyInput("");
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-md border border-gray-200 shadow-lg">
        <div className="p-4 sm:p-5 space-y-4">

          {/* HEADER */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Event Details</h2>
              <p className="text-sm text-gray-500 mt-1">
                Fill in the primary information for the upcoming partner event.
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close event modal"
            >
              <X size={18} />
            </button>
          </div>

          {/* FORM */}
          <div className="space-y-4">

            {/* NAME */}
            <Input label="Event Name / Topic *" placeholder="Q3 Corporate Sustainability Summit" />

            {/* DATE + LOCATION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <IconInput
                label="Event Date *"
                icon={<Calendar size={16} />}
                placeholder="October 15, 2024"
              />

              <IconInput
                label="Location (Optional)"
                icon={<MapPin size={16} />}
                placeholder="Grand Hyatt, Seattle WA"
              />

            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="text-sm text-gray-700 font-medium">
                Description & Notes
              </label>
              <textarea
                rows={3}
                className="w-full mt-1.5 border border-gray-200 rounded-md px-3 py-2 text-sm resize-none"
                placeholder="Annual gathering of partner companies to discuss Q3 sustainability targets, review carbon offset initiatives, and plan for Q4 joint ventures. Keynote by Sarah Jenkins. Ensure VIP catering is booked."
              />
            </div>

            {/* DIVIDER */}
            <hr className="border-gray-200" />

            {/* COMPANIES */}
            <div>
              <p className="text-sm font-medium text-gray-900">Benefitting Companies</p>
              <p className="text-xs text-gray-500 mb-2">
                Select one or more partners associated with this event.
              </p>

              <div className="border border-gray-200 rounded-md px-3 py-2 flex flex-wrap gap-2 items-center">

                {/* TAGS */}
                {companies.map((c) => (
                  <span
                    key={c}
                    className="flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                  >
                    {c}
                    <button
                      onClick={() => removeCompany(c)}
                      className="text-gray-500 hover:text-gray-700"
                      aria-label={`Remove ${c}`}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}

                {/* INPUT */}
                <div className="flex items-center gap-2 flex-1 min-w-[180px]">
                  <Search size={14} className="text-gray-400" />
                  <input
                    value={companyInput}
                    onChange={(event) => setCompanyInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addCompany();
                      }
                    }}
                    placeholder="Search to add..."
                    className="outline-none text-sm w-full bg-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-1">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 border border-gray-200 rounded-md text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>

            <button className="w-full sm:w-auto px-5 py-2 bg-yellow-500 rounded-md text-sm font-medium hover:bg-yellow-400 transition-colors">
              Save Event
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ================= INPUT ================= */

function Input({
  label,
  placeholder,
}: {
  label: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-sm text-gray-700 font-medium">{label}</label>
      <input
        placeholder={placeholder}
        className="w-full mt-1.5 border border-gray-200 rounded-md px-3 py-2 text-sm"
      />
    </div>
  );
}

/* ================= ICON INPUT ================= */

function IconInput({
  label,
  icon,
  placeholder,
}: {
  label: string;
  icon: ReactNode;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-sm text-gray-700 font-medium">{label}</label>

      <div className="flex items-center border border-gray-200 rounded-md px-3 py-2 mt-1.5">
        <div className="text-gray-400">{icon}</div>
        <input
          placeholder={placeholder}
          className="ml-2 outline-none text-sm w-full bg-transparent"
        />
      </div>
    </div>
  );
}