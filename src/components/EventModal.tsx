import { useState } from "react";
import { Calendar, MapPin, Search } from "lucide-react";

type Props = {
  onClose: () => void;
};

export default function EventModal({ onClose }: Props) {
  const [companies, setCompanies] = useState<string[]>([
    "EcoTech Solutions",
    "GreenEnergy Corp",
  ]);

  const removeCompany = (name: string) => {
    setCompanies((prev) => prev.filter((c) => c !== name));
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      {/* CONTAINER */}
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-lg p-6 space-y-6">

        {/* HEADER */}
        <div>
          <h2 className="text-lg font-semibold">Event Details</h2>
          <p className="text-sm text-gray-500 mt-1">
            Fill in the primary information for the upcoming partner event.
          </p>
        </div>

        {/* FORM */}
        <div className="space-y-5">

          {/* NAME */}
          <Input label="Event Name / Topic *" placeholder="Q3 Corporate Partnership Summit" />

          {/* DATE + LOCATION */}
          <div className="grid grid-cols-2 gap-4">

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
            <label className="text-sm text-gray-600">
              Description & Notes
            </label>
            <textarea
              rows={4}
              className="w-full mt-1 border rounded-md px-3 py-2 text-sm resize-none"
              placeholder="Annual gathering of companies to discuss Q3 Sustainability targets,review carbon oofeset initiative ,and plan for G4 joint venture Keynotes by Sarah Jenkins.Ensure VIP catering is booked"
            />
          </div>

          {/* DIVIDER */}
          <hr />

          {/* COMPANIES */}
          <div>
            <p className="text-sm font-medium">Benefitting Companies</p>
            <p className="text-xs text-gray-500 mb-2">
              Select one or more partners associated with this event.
            </p>

            <div className="border rounded-md px-3 py-2 flex flex-wrap gap-2 items-center">

              {/* TAGS */}
              {companies.map((c) => (
                <span
                  key={c}
                  className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs"
                >
                  {c}
                  <button onClick={() => removeCompany(c)}>✕</button>
                </span>
              ))}

              {/* INPUT */}
              <div className="flex items-center gap-2 flex-1 min-w-[150px]">
                <Search size={14} className="text-gray-400" />
                <input
                  placeholder="Search to add..."
                  className="outline-none text-sm w-full"
                />
              </div>

            </div>
          </div>

        </div>

        {/* BUTTONS */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50"
          >
            Cancel
          </button>

          <button className="px-5 py-2 bg-yellow-500 rounded-md text-sm font-medium hover:bg-yellow-400">
            Save Event
          </button>
        </div>

      </div>
    </div>
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
      <label className="text-sm text-gray-600">{label}</label>
      <input
        placeholder={placeholder}
        className="w-full mt-1 border rounded-md px-3 py-2 text-sm"
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
  icon: React.ReactNode;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-sm text-gray-600">{label}</label>

      <div className="flex items-center border rounded-md px-3 py-2 mt-1">
        <div className="text-gray-400">{icon}</div>
        <input
          placeholder={placeholder}
          className="ml-2 outline-none text-sm w-full"
        />
      </div>
    </div>
  );
}