import { useNavigate } from "react-router-dom";
import { KeyRound, ShieldCheck, Clock, Smartphone } from "lucide-react";
import { useState } from "react";

type Log = {
  time: string;
  user: string;
  ip: string;
  action: string;
  status: "Success" | "Failed";
};

export default function SecuritySettings() {
  const navigate = useNavigate();

  /* STATES */
  const [length, setLength] = useState<number>(12);
  const [uppercase, setUppercase] = useState<boolean>(true);
  const [numbers, setNumbers] = useState<boolean>(true);
  const [special, setSpecial] = useState<boolean>(true);
  const [twoFA, setTwoFA] = useState<boolean>(false);
  const [concurrent, setConcurrent] = useState<boolean>(false);

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Security Settings</h2>
          <p className="text-gray-500 text-sm">
            Configure system-wide security policies, authentication methods, and monitor administrative access logs.
          </p>
        </div>

        <div className="flex gap-3">
          <button className="bg-gray-200 px-4 py-2 rounded-lg text-sm">
            Discard Changes
          </button>

          <button className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-lg text-sm font-medium">
            Save Settings
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-2 bg-white border rounded-xl p-2 w-fit">
        <Tab label="User roles & access management" onClick={() => navigate("/settings")} />
        <Tab label="User management" onClick={() => navigate("/renewals")} />
        <Tab label="General setting" onClick={() => navigate("/settings/general")} />
        <Tab label="Security settings" active />
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-3 gap-6">

        {/* PASSWORD */}
        <div className="bg-white p-6 rounded-xl border shadow-sm space-y-5">
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
        <div className="bg-white p-6 rounded-xl border shadow-sm space-y-5">
          <Header icon={<ShieldCheck size={18} />} title="Two-Factor Authentication" />

          <p className="text-sm text-gray-500">
            Add an extra layer of security to administrative accounts.
          </p>

        <div className="border rounded-xl p-4 text-sm flex gap-3 items-start">
  
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

          <div className="bg-yellow-50 border rounded-xl p-4 flex justify-between items-center">
            <div>
              <p className="font-medium">Enable 2FA</p>
              <p className="text-xs text-gray-500">Currently optional</p>
            </div>

            <Toggle value={twoFA} onChange={setTwoFA} />
          </div>
        </div>

        {/* SESSION */}
        <div className="bg-white p-6 rounded-xl border shadow-sm space-y-5">
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
      <div className="bg-white rounded-xl border shadow-sm">

        <div className="flex justify-between items-center p-5 border-b">
          <div>
            <h3 className="font-semibold">Login Activity Audit</h3>
            <p className="text-sm text-gray-500">
              Recent authentication events across the administrative portal.
            </p>
          </div>

          <button className="border px-3 py-2 rounded-md text-sm">
            Export CSV
          </button>
        </div>

        <table className="w-full text-sm">
          <thead className="text-gray-400">
            <tr>
              <th className="p-4 text-left">Timestamp</th>
              <th>User</th>
              <th>IP</th>
              <th>Action</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {logs.map((log, i) => (
              <tr key={i} className="border-t text-center">
                <td className="p-4">{log.time}</td>
                <td>{log.user}</td>
                <td>{log.ip}</td>
                <td>{log.action}</td>
                <td>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    log.status === "Success"
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                  }`}>
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="text-center text-xs text-gray-400 py-3">
          Showing most recent two events. To view more history ,please export the full log.
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
        active ? "bg-yellow-500 text-black" : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      {label}
    </button>
  );
}

/* DATA */
const logs: Log[] = [
  {
    time: "2023-10-27 14:32",
    user: "admin@ictchamber.rw",
    ip: "192.168.1.105",
    action: "Login",
    status: "Success",
  },
  {
    time: "2023-10-27 10:15",
    user: "jdoe@ictchamber.rw",
    ip: "10.0.0.42",
    action: "Login Attempt",
    status: "Failed",
  },
];