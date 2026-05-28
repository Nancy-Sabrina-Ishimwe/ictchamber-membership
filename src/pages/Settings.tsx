import { useState } from "react";
import type { FormEvent } from "react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function Settings() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setMessageType(null);

    if (!user?.email) {
      setMessageType("error");
      setMessage("Unable to determine your account. Please sign in again.");
      return;
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessageType("error");
      setMessage("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 8) {
      setMessageType("error");
      setMessage("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessageType("error");
      setMessage("New password and confirmation do not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post("/auth/change-password", {
        email: user.email,
        oldPassword: currentPassword,
        newPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessageType("success");
      setMessage("Password updated successfully.");
    } catch (error) {
      const fallback = "Failed to update password.";
      const errorMessage =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message: unknown }).message === "string"
          ? (error as { message: string }).message
          : fallback;
      setMessageType("error");
      setMessage(errorMessage || fallback);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900">Change Password</h2>
        <p className="mt-2 text-sm text-gray-500">
          Update your admin account password to keep your account secure.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
              Current Password
            </label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-yellow-500"
              autoComplete="current-password"
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-yellow-500"
              autoComplete="new-password"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-yellow-500"
              autoComplete="new-password"
            />
          </div>

          {message ? (
            <div
              className={`rounded-md px-3 py-2 text-sm ${
                messageType === "success"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {message}
            </div>
          ) : null}

          <div className="pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-yellow-500 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
