import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { NavLink } from "react-router-dom";
import {
  KeyRound,
  ShieldCheck,
  Clock,
  Smartphone,
  Users,
  SlidersHorizontal,
  Download,
  MonitorCheck,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

type Log = {
  time: string;
  user: string;
  ip: string;
  action: string;
  status: "Success" | "Failed";
};

export default function SecuritySettings() {
  const { user } = useAuth();

  const [length, setLength] = useState<number>(12);
  const [uppercase, setUppercase] = useState<boolean>(true);
  const [numbers, setNumbers] = useState<boolean>(true);
  const [special, setSpecial] = useState<boolean>(true);
  const [twoFA, setTwoFA] = useState<boolean>(false);
  const [concurrent, setConcurrent] = useState<boolean>(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordMessageType, setPasswordMessageType] = useState<"success" | "error" | null>(null);

  const passwordStrengthHint = useMemo(() => {
    const rules = [
      `${length}+ characters`,
      uppercase ? "uppercase letter" : null,
      numbers ? "number" : null,
      special ? "special character" : null,
    ].filter(Boolean);

    return `Recommended: ${rules.join(", ")}.`;
  }, [length, numbers, special, uppercase]);

  const handleChangePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordMessage(null);
    setPasswordMessageType(null);

    if (!user?.email) {
      setPasswordMessageType("error");
      setPasswordMessage("Unable to determine your account. Please sign in again.");
      return;
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessageType("error");
      setPasswordMessage("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMessageType("error");
      setPasswordMessage("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessageType("error");
      setPasswordMessage("New password and confirmation do not match.");
      return;
    }

    try {
      setIsSubmittingPassword(true);
      await api.post("/auth/change-password", {
        email: user.email,
        oldPassword: currentPassword,
        newPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMessageType("success");
      setPasswordMessage("Password updated successfully.");
    } catch (error) {
      const fallback = "Failed to update password.";
      const message =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message: unknown }).message === "string"
          ? (error as { message: string }).message
          : fallback;

      setPasswordMessageType("error");
      setPasswordMessage(message || fallback);
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const handleClearPasswordForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordMessage(null);
    setPasswordMessageType(null);
  };

  return (
    <div className="space-y-5">
      <div className="w-fit max-w-full overflow-x-auto rounded-md border border-gray-200 bg-white p-1.5">
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

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-[24px] leading-tight font-bold tracking-[-0.02em] text-gray-900">
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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-5 rounded-md border bg-white p-6 shadow-sm">
          <Header icon={<KeyRound size={18} />} title="Password Policy" />

          <p className="text-sm text-gray-500">
            Enforce strict password requirements for all administrative accounts.
          </p>

          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span>Minimum Length</span>
              <span className="font-medium text-yellow-600">{length} chars</span>
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

        <div className="space-y-5 rounded-md border bg-white p-6 shadow-sm">
          <Header icon={<ShieldCheck size={18} />} title="Two-Factor Authentication" />

          <p className="text-sm text-gray-500">
            Add an extra layer of security to administrative accounts.
          </p>

          <div className="flex items-start gap-3 rounded-md border p-4 text-sm">
            <Smartphone size={50} className="mt-1 text-gray-400" />

            <div>
              <p className="font-medium">Enforce Global 2FA</p>
              <p className="text-xs text-gray-500">
                When enabled, all users will be required to set up a two-factor authentication method (Authenticator app or SMS) upon their next login.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md border bg-yellow-50 p-4">
            <div>
              <p className="font-medium">Enable 2FA</p>
              <p className="text-xs text-gray-500">Currently optional</p>
            </div>

            <Toggle value={twoFA} onChange={setTwoFA} />
          </div>
        </div>

        <div className="space-y-5 rounded-md border bg-white p-6 shadow-sm">
          <Header icon={<Clock size={18} />} title="Session Management" />

          <p className="text-sm text-gray-500">
            Control user session lifetimes and concurrent access.
          </p>

          <div>
            <label className="font-medium">Idle Session Timeout</label>
            <p className="text-xs text-gray-500">Automatically log user after a period of inactivity</p>
            <select className="mt-1 w-full rounded-md border px-3 py-2 text-sm">
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

      <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900">
              <KeyRound size={18} className="text-yellow-500" />
              Change Password
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Update your administrator password from this settings page. {passwordStrengthHint}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClearPasswordForm}
            className="self-start rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Clear Form
          </button>
        </div>

        <form onSubmit={handleChangePassword} className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <PasswordField
            id="admin-current-password"
            label="Current Password"
            value={currentPassword}
            onChange={setCurrentPassword}
            autoComplete="current-password"
          />
          <PasswordField
            id="admin-new-password"
            label="New Password"
            value={newPassword}
            onChange={setNewPassword}
            autoComplete="new-password"
          />
          <PasswordField
            id="admin-confirm-password"
            label="Confirm New Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
          />

          {passwordMessage ? (
            <div
              className={`rounded-md px-3 py-2 text-sm lg:col-span-3 ${
                passwordMessageType === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}
            >
              {passwordMessage}
            </div>
          ) : null}

          <div className="flex justify-start lg:col-span-3">
            <button
              type="submit"
              disabled={isSubmittingPassword}
              className="rounded-md bg-yellow-500 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmittingPassword ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>

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

function Header({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="text-yellow-500">{icon}</div>
      <h3 className="font-semibold">{title}</h3>
    </div>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        type="password"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-yellow-500"
        autoComplete={autoComplete}
      />
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
    <div className="flex items-center justify-between text-sm">
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
      type="button"
      onClick={() => onChange(!value)}
      className={`relative h-6 w-11 rounded-full ${value ? "bg-yellow-500" : "bg-gray-300"}`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${value ? "left-6" : "left-1"}`}
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
