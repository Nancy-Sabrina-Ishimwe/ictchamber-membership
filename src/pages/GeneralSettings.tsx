import { NavLink } from "react-router-dom";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  UploadCloud,
  Save,
  Pencil,
  ShieldCheck,
  Users,
  SlidersHorizontal,
  KeyRound,
} from "lucide-react";

export default function GeneralSettings() {
  return (
    <div className="space-y-5">
      {/* TABS */}
      <div className="w-fit max-w-full rounded-md border border-gray-200 bg-white p-1.5 overflow-x-auto">
        <div className="inline-flex min-w-max gap-1">
          <Tab
            label="User roles & access management"
            icon={<ShieldCheck size={14} />}
            to="/admin/settings"
            end
          />
          <Tab
            label="User management"
            icon={<Users size={14} />}
            to="/admin/settings/users"
          />
          <Tab label="General setting" icon={<SlidersHorizontal size={14} />} to="/admin/settings/general" />
          <Tab
            label="Security settings"
            icon={<KeyRound size={14} />}
            to="/admin/settings/security"
          />
        </div>
      </div>

      {/* TOP BAR */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-[24px] leading-tight font-bold tracking-[-0.02em] text-gray-900">
            General Settings
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-gray-500">
            Manage your organization's core identity, contact information, and global site preferences.
          </p>
        </div>

        <button className="inline-flex items-center justify-center gap-2 self-start rounded-md bg-yellow-500 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-yellow-400">
          <Pencil size={15} />
          Edit Settings
        </button>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* LEFT CARD */}
        <div className="xl:col-span-2 bg-white rounded-md border shadow-sm p-6">

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
                  defaultValue="Rwanda ICT Chamber"
                  className="w-full p-2 outline-none text-sm"
                />
              </div>
            </div>

            {/* EMAIL + PHONE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>
                <label className="text-sm text-gray-600">Support Email Address</label>
                <div className="flex items-center border rounded-md mt-1 px-3">
                  <Mail size={16} className="text-gray-400" />
                  <input
                    defaultValue="support@ictchamber.rw"
                    className="w-full p-2 outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600">Primary Contact Number</label>
                <div className="flex items-center border rounded-md mt-1 px-3">
                  <Phone size={16} className="text-gray-400" />
                  <input
                    defaultValue="+250 788 123 456"
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
            <button className="bg-yellow-500 hover:bg-yellow-600 px-5 py-2 rounded-md text-sm flex items-center gap-2 shadow-sm">
              <Save size={16} />
              Save Changes
            </button>
          </div>
        </div>

        {/* RIGHT CARD */}
        <div className="bg-white rounded-md border shadow-sm p-6">

          <h3 className="font-semibold text-lg mb-2">Brand Assets</h3>
          <p className="text-gray-500 text-sm mb-4">
            Manage your organization's logo and branding.
          </p>

          {/* UPLOAD BOX */}
          <div className="border-2 border-dashed rounded-md p-6 text-center text-sm text-gray-500">
            <UploadCloud className="mx-auto mb-3 text-yellow-500" />
            <p>
              <span className="text-yellow-600 font-medium">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs mt-1">
              SVG, PNG, JPG or GIF (max. 800x400px)
            </p>
          </div>

          {/* FILE */}
          <div className="flex items-center gap-3 border rounded-md p-3 mt-4">
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
  icon,
  to,
  end,
}: {
  label: string;
  icon?: React.ReactNode;
  to: string;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `inline-flex items-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ${
          isActive
            ? "bg-yellow-500 text-black"
            : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
        }`
      }
    >
      {icon ? <span className="text-black">{icon}</span> : null}
      {label}
    </NavLink>
  );
}
