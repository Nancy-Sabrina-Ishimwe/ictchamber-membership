import { useNavigate } from "react-router-dom";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  UploadCloud,
  Save,
  Pencil,
} from "lucide-react";

export default function GeneralSettings() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">

      {/* TOP BAR */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">General Settings</h2>
          <p className="text-gray-500 text-sm">
            Manage your organization's core identity, contact information, and global site preferences.
          </p>
        </div>

        <button className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-lg text-sm flex items-center gap-2 shadow-sm">
          <Pencil size={16} />
          Edit Settings
        </button>
      </div>

      {/* TABS */}
      <div className="flex gap-2 bg-white p-2 rounded-xl border w-fit">
        <Tab label="User roles & access management" onClick={() => navigate("/settings")} />
        <Tab label="User management" onClick={() => navigate("/settings/users")} />
        <Tab label="General setting" active />
        <Tab label="Security settings" onClick={() => navigate("/settings/security")} />
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-3 gap-6">

        {/* LEFT CARD */}
        <div className="col-span-2 bg-white rounded-xl border shadow-sm p-6">

          {/* TITLE */}
          <div className="flex items-center gap-2 mb-4">
            <Building2 size={18} className="text-yellow-500" />
            <h3 className="font-semibold text-lg">Organization Profile</h3>
          </div>

          <p className="text-gray-500 text-sm mb-6">
            Update the primary information displayed across the platform and in communications.
          </p>

          {/* FORM */}
          <div className="space-y-5">

            {/* NAME */}
            <div>
              <label className="text-sm text-gray-600">Organization Name</label>
              <div className="flex items-center border rounded-md mt-1 px-3">
                <Building2 size={16} className="text-gray-400" />
                <input
                  value="Rwanda ICT Chamber"
                  className="w-full p-2 outline-none text-sm"
                />
              </div>
            </div>

            {/* EMAIL + PHONE */}
            <div className="grid grid-cols-2 gap-4">

              <div>
                <label className="text-sm text-gray-600">Support Email Address</label>
                <div className="flex items-center border rounded-md mt-1 px-3">
                  <Mail size={16} className="text-gray-400" />
                  <input
                    value="support@ictchamber.rw"
                    className="w-full p-2 outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600">Primary Contact Number</label>
                <div className="flex items-center border rounded-md mt-1 px-3">
                  <Phone size={16} className="text-gray-400" />
                  <input
                    value="+250 788 123 456"
                    className="w-full p-2 outline-none text-sm"
                  />
                </div>
              </div>

            </div>

            {/* ADDRESS */}
            <div>
              <label className="text-sm text-gray-600">Official Headquarters Address</label>
              <div className="flex items-start border rounded-md mt-1 px-3 py-2">
                <MapPin size={16} className="text-gray-400 mt-1" />
                <textarea
                  className="w-full outline-none text-sm ml-2"
                  rows={3}
                  defaultValue={`KG 7 Ave, Kigali, Rwanda
Telecom House, 6th Floor`}
                />
              </div>
            </div>

          </div>

          {/* SAVE BUTTON */}
          <div className="flex justify-end mt-6">
            <button className="bg-yellow-500 hover:bg-yellow-600 px-5 py-2 rounded-lg text-sm flex items-center gap-2 shadow-sm">
              <Save size={16} />
              Save Changes
            </button>
          </div>
        </div>

        {/* RIGHT CARD */}
        <div className="bg-white rounded-xl border shadow-sm p-6">

          <h3 className="font-semibold text-lg mb-2">Brand Assets</h3>
          <p className="text-gray-500 text-sm mb-4">
            Manage your organization's logo and branding.
          </p>

          {/* UPLOAD BOX */}
          <div className="border-2 border-dashed rounded-xl p-6 text-center text-sm text-gray-500">
            <UploadCloud className="mx-auto mb-3 text-yellow-500" />
            <p>
              <span className="text-yellow-600 font-medium">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs mt-1">
              SVG, PNG, JPG or GIF (max. 800x400px)
            </p>
          </div>

          {/* FILE */}
          <div className="flex items-center gap-3 border rounded-lg p-3 mt-4">
            <div className="w-12 h-12 bg-gray-200 rounded-md"></div>

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

/* TAB */
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
      className={`px-4 py-2 rounded-lg text-sm ${
        active
          ? "bg-yellow-500 text-black"
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      {label}
    </button>
  );
}
