import { Save } from "lucide-react";

export default function SecuritySettings() {
  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Security Settings</h2>
          <p className="text-gray-500 text-sm">
            Configure system-wide security policies and authentication methods.
          </p>
        </div>

        <div className="flex gap-2">
          <button className="px-4 py-2 bg-gray-200 rounded-md text-sm">
            Discard Changes
          </button>
          <button className="px-4 py-2 bg-yellow-500 rounded-md text-sm flex items-center gap-2">
            <Save size={16} />
            Save Settings
          </button>
        </div>
      </div>

      {/* 3 CARDS */}
      <div className="grid grid-cols-3 gap-4">

        <div className="bg-white p-5 rounded-xl border">
          <h3 className="font-semibold mb-2">Password Policy</h3>
          <p className="text-sm text-gray-500">
            Enforce password rules for users.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border">
          <h3 className="font-semibold mb-2">Two-Factor Authentication</h3>
          <p className="text-sm text-gray-500">
            Add extra security to accounts.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border">
          <h3 className="font-semibold mb-2">Session Management</h3>
          <p className="text-sm text-gray-500">
            Control user session behavior.
          </p>
        </div>

      </div>

      {/* TABLE */}
      <div className="bg-white p-5 rounded-xl border">
        <h3 className="font-semibold mb-3">Login Activity Audit</h3>

        <table className="w-full text-sm">
          <thead className="text-gray-400">
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>IP</th>
              <th>Action</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            <tr className="border-t text-center">
              <td>2023-10-27</td>
              <td>admin</td>
              <td>192.168.1.1</td>
              <td>Login</td>
              <td className="text-green-500">Success</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
}