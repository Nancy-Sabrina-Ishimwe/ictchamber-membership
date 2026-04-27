import { NavLink } from "react-router-dom";
import { KeyRound, ShieldCheck, Clock, Smartphone, Users, SlidersHorizontal, Download, MonitorCheck, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";

type Log = {
  time: string;
  user: string;
  ip: string;
  action: string;
  status: "Success" | "Failed";
};

export default function SecuritySettings() {
  /* STATES */
  const [length, setLength] = useState<number>(12);
  const [uppercase, setUppercase] = useState<boolean>(true);
  const [numbers, setNumbers] = useState<boolean>(true);
  const [special, setSpecial] = useState<boolean>(true);
  const [twoFA, setTwoFA] = useState<boolean>(false);
  const [concurrent, setConcurrent] = useState<boolean>(false);

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
          <Tab
            label="General setting"
            icon={<SlidersHorizontal size={14} />}
            to="/admin/settings/general"
          />
          <Tab label="Security settings" icon={<KeyRound size={14} />} to="/admin/settings/security" />
        </div>
      </div>

      {/* HEADER */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-[34px] leading-tight font-bold tracking-[-0.02em] text-gray-900">
            Security Settings
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-gray-500">
            Configure system-wide security policies, authentication methods, and monitor administrative access logs.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 self-start">
          <button className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
            Discard Changes
          </button>

          <button className="rounded-md bg-yellow-500 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-yellow-400">
            Save Settings
          </button>
        </div>
      </div>
      {/* CARDS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* PASSWORD */}
        <div className="bg-white p-6 rounded-md border shadow-sm space-y-5">
          <Header icon={<KeyRound size={18} />} title="Password Policy" />

          <p className="text-sm text-gray-500">
            Enforce strict password requirements for all administrative accounts.
          </p>

          {/* SLIDER */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Minimum Length</span>
              <span className="text-yellow-600 font-medium">{length} chars</span>
            </div>

            <input
              type="range"
              min={8}
              max={32}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full accent-yellow-500"
            />

            <div className="flex justify-between text-xs text-gray-400">
              <span>8 (Weak)</span>
              <span>32 (Strong)</span>
            </div>
          </div>

          <SwitchRow label="Require Uppercase" desc="At least one uppercase letter" value={uppercase} onChange={setUppercase} />
          <SwitchRow label="Require Numbers" desc="At least one number" value={numbers} onChange={setNumbers} />
          <SwitchRow label="Require Special Characters" desc="E.g. !@#$%" value={special} onChange={setSpecial} />
        </div>

        {/* 2FA */}
        <div className="bg-white p-6 rounded-md border shadow-sm space-y-5">
          <Header icon={<ShieldCheck size={18} />} title="Two-Factor Authentication" />

          <p className="text-sm text-gray-500">
            Add an extra layer of security to administrative accounts.
          </p>

        <div className="border rounded-md p-4 text-sm flex gap-3 items-start">
  
  {/* ICON */}
   <Smartphone size={50} className="text-gray-400 mt-1" />

  {/* TEXT */}
  <div>
    
    <p className="font-medium">Enforce Global 2FA</p>
    <p className="text-xs text-gray-500">
      When enabled, all users will be required to set up a two-factors authentication method (Authenticator app or SMS) upon their next login.
    </p>
  </div>

</div>

          <div className="bg-yellow-50 border rounded-md p-4 flex justify-between items-center">
            <div>
              <p className="font-medium">Enable 2FA</p>
              <p className="text-xs text-gray-500">Currently optional</p>
            </div>

            <Toggle value={twoFA} onChange={setTwoFA} />
          </div>
        </div>

        {/* SESSION */}
        <div className="bg-white p-6 rounded-md border shadow-sm space-y-5">
          <Header icon={<Clock size={18} />} title="Session Management" />

          <p className="text-sm text-gray-500">
            Control user session lifetimes and concurrent access.
          </p>

          <div>
            <label className="font-medium">Idle Session Timeout</label>
            <p className="text-xs text-gray-500">Automatically log user after a period of inactivity</p>
            <select className="w-full mt-1 border rounded-md px-3 py-2 text-sm">
              <option> </option>
              
            </select>
          </div>

          <SwitchRow
            label="Allow Concurrent Logins"
            desc="Permit users to be logged in from multiple devices simultaneously"
            value={concurrent}
            onChange={setConcurrent}
          />
        </div>

      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5">
          <div>
            <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900">
              <MonitorCheck size={16} className="text-gray-600" />
              Login Activity Audit
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Recent authentication events across the administrative portal.
            </p>
          </div>

          <button className="inline-flex items-center gap-2 self-start rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
            <Download size={14} />
            Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] table-fixed text-sm">
            <thead className="bg-gray-50 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left sm:px-5">Timestamp</th>
                <th className="px-4 py-3 text-left sm:px-5">User Account</th>
                <th className="px-4 py-3 text-left sm:px-5">IP Address</th>
                <th className="px-4 py-3 text-left sm:px-5">Action Event</th>
                <th className="px-4 py-3 text-left sm:px-5">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 bg-white">
              {logs.map((log, i) => (
                <tr key={i} className="text-[13px] text-gray-700">
                  <td className="px-4 py-3.5 font-medium text-gray-600 sm:px-5">{log.time}</td>
                  <td className="px-4 py-3.5 font-medium text-gray-900 sm:px-5">{log.user}</td>
                  <td className="px-4 py-3.5 text-gray-500 sm:px-5">{log.ip}</td>
                  <td className="px-4 py-3.5 text-gray-800 sm:px-5">{log.action}</td>
                  <td className="px-4 py-3.5 sm:px-5">
                    <StatusPill status={log.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-gray-200 px-4 py-3 text-center text-xs text-gray-500 sm:px-5">
          Showing most recent 6 events. To view more history, please export the full log.
        </div>
      </div>
    </div>
  );
}

/* COMPONENTS */

function Header({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="text-yellow-500">{icon}</div>
      <h3 className="font-semibold">{title}</h3>
    </div>
  );
}

function SwitchRow({
  label,
  desc,
  value,
  onChange,
}: {
  label: string;
  desc: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex justify-between items-center text-sm">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>

      <Toggle value={value} onChange={onChange} />
    </div>
  );
}

function Toggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`w-11 h-6 rounded-full relative ${
        value ? "bg-yellow-500" : "bg-gray-300"
      }`}
    >
      <span
        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${
          value ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}

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

function StatusPill({ status }: { status: Log["status"] }) {
  const success = status === "Success";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
        success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
      }`}
    >
      {success ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
      {status}
    </span>
  );
}

/* DATA */
const logs: Log[] = [
  {
    time: "2023-10-27 14:32:01",
    user: "admin@ictchamber.rw",
    ip: "192.168.1.105",
    action: "Login",
    status: "Success",
  },
  {
    time: "2023-10-27 10:15:44",
    user: "jdoe@ictchamber.rw",
    ip: "10.0.0.42",
    action: "Login Attempt",
    status: "Failed",
  },
  {
    time: "2023-10-26 18:45:12",
    user: "s.smith@ictchamber.rw",
    ip: "192.168.1.200",
    action: "Password Reset",
    status: "Success",
  },
  {
    time: "2023-10-26 09:00:05",
    user: "admin@ictchamber.rw",
    ip: "192.168.1.105",
    action: "Add user",
    status: "Success",
  },
  {
    time: "2023-10-25 22:11:30",
    user: "unknown",
    ip: "45.22.11.90",
    action: "Login Attempt",
    status: "Failed",
  },
  {
    time: "2023-10-25 14:20:00",
    user: "m.officer@ictchamber.rw",
    ip: "10.0.1.15",
    action: "Login",
    status: "Success",
  },
];
