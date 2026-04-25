import { useNavigate } from "react-router-dom";
import { UploadCloud, Save } from "lucide-react";
import { useState } from "react";

export default function GeneralSettings() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "Rwanda ICT Chamber",
    email: "support@ictchamber.rw",
    phone: "+250 788 123 456",
    address: "KG 7 Ave, Kigali, Rwanda\nTelecom House, 6th Floor",
  });

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">General Settings</h2>
          <p className="text-gray-500 text-sm">
            Manage your organization's core identity and preferences.
          </p>
        </div>

        <button className="bg-yellow-500 px-4 py-2 rounded-md text-sm font-medium">
          Edit Settings
        </button>
      </div>

      {/* TABS */}
      <div className="flex gap-2">
        <Tab label="User roles & access management" onClick={() => navigate("/settings")} />
        <Tab label="User management" onClick={() => navigate("/renewals")} />
        <Tab label="General setting" active />
        <Tab label="Security settings" onClick={() => navigate("/settings/security")} />
      </div>

      {/* CONTENT */}
      <div className="grid grid-cols-3 gap-6">

        {/* LEFT FORM */}
        <div className="col-span-2 bg-white p-6 rounded-xl border shadow-sm space-y-5">

          <h3 className="font-semibold text-lg">Organization Profile</h3>

          {/* NAME */}
          <div>
            <label className="text-sm text-gray-500">Organization Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border px-3 py-2 rounded-md mt-1"
            />
          </div>

          {/* EMAIL + PHONE */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500">Support Email Address</label>
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border px-3 py-2 rounded-md mt-1"
              />
            </div>

            <div>
              <label className="text-sm text-gray-500">Primary Contact Number</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border px-3 py-2 rounded-md mt-1"
              />
            </div>
          </div>

          {/* ADDRESS */}
          <div>
            <label className="text-sm text-gray-500">Official Headquarters Address</label>
            <textarea
              rows={3}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full border px-3 py-2 rounded-md mt-1"
            />
          </div>

          {/* SAVE BUTTON */}
          <div className="flex justify-end">
            <button className="bg-yellow-500 px-5 py-2 rounded-md flex items-center gap-2 text-sm">
              <Save size={16} />
              Save Changes
            </button>
          </div>
        </div>

        {/* RIGHT SIDE (UPLOAD) */}
        <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">

          <h3 className="font-semibold text-lg">Brand Assets</h3>

          {/* UPLOAD BOX */}
          <div className="border-2 border-dashed rounded-xl p-6 text-center text-sm text-gray-500">
            <UploadCloud className="mx-auto mb-2" />
            Click to upload or drag and drop
            <p className="text-xs mt-1">
              SVG, PNG, JPG or GIF (max. 800x400px)
            </p>
          </div>

          {/* FILE PREVIEW */}
          <div className="flex items-center gap-3 border rounded-md p-2">
            <div className="w-10 h-10 bg-gray-200 rounded"></div>

            <div className="flex-1 text-sm">
              logo_primary_2023.png
              <p className="text-xs text-gray-400">1.2 MB</p>
            </div>

            <button className="text-red-500 text-sm">Remove</button>
          </div>

        </div>

      </div>
    </div>
  );
}

/* TAB COMPONENT */
function Tab({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-md text-sm ${
        active
          ? "bg-yellow-500 text-black"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      {label}
    </button>
  );
}