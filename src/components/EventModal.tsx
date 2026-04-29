import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { Calendar, Loader2, MapPin, Search, X } from "lucide-react";
import { api } from "../lib/api";

export type EventFormValue = {
  title: string;
  date: string;
  time: string;
  location: string;
  notes: string;
  companies: string[];
};

type Props = {
  onClose: () => void;
  onSave: (payload: EventFormValue) => Promise<void> | void;
};

export default function EventModal({ onClose, onSave }: Props) {
  const [memberCompanies, setMemberCompanies] = useState<string[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [membersError, setMembersError] = useState<string | null>(null);

  const [companies, setCompanies] = useState<string[]>([]);
  const [companyInput, setCompanyInput] = useState("");
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
  const companyFieldRef = useRef<HTMLDivElement | null>(null);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const loadMembers = async () => {
      try {
        setLoadingMembers(true);
        setMembersError(null);
        const response = await api.get<{
          data?: Array<{ companyName?: string | null }>;
        }>("/members");
        const names = (response.data.data ?? [])
          .map((m) => m.companyName?.trim() ?? "")
          .filter(Boolean);
        const unique = Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
        setMemberCompanies(unique);
      } catch (error) {
        setMembersError(error instanceof Error ? error.message : "Failed to load member companies.");
        setMemberCompanies([]);
      } finally {
        setLoadingMembers(false);
      }
    };
    void loadMembers();
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      if (!companyFieldRef.current?.contains(event.target as Node)) {
        setCompanyDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const filteredCompanySuggestions = useMemo(() => {
    const q = companyInput.trim().toLowerCase();
    return memberCompanies.filter((name) => {
      if (companies.some((c) => c.toLowerCase() === name.toLowerCase())) return false;
      if (!q) return true;
      return name.toLowerCase().includes(q);
    });
  }, [memberCompanies, companies, companyInput]);

  const removeCompany = (name: string) => {
    setCompanies((prev) => prev.filter((c) => c !== name));
  };

  const pickCompany = (canonicalName: string) => {
    if (companies.some((c) => c.toLowerCase() === canonicalName.toLowerCase())) return;
    setCompanies((prev) => [...prev, canonicalName]);
    setCompanyInput("");
    setCompanyDropdownOpen(false);
  };

  const handleSubmit = async () => {
    const trimmedTitle = title.trim();
    const trimmedTime = time.trim();
    if (!trimmedTitle) {
      setFormError("Event name is required.");
      return;
    }
    if (!date) {
      setFormError("Event date is required.");
      return;
    }
    if (!trimmedTime) {
      setFormError("Event time is required.");
      return;
    }
    if (companies.length === 0) {
      setFormError("Select at least one member company from the directory.");
      return;
    }
    if (memberCompanies.length === 0 && !loadingMembers) {
      setFormError("No member companies available. Add members in the system before creating an event.");
      return;
    }
    setFormError(null);
    try {
      setIsSaving(true);
      await onSave({
        title: trimmedTitle,
        date,
        time: trimmedTime,
        location: location.trim() || "Virtual Event",
        notes: notes.trim(),
        companies,
      });
      onClose();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Failed to save event.");
    } finally {
      setIsSaving(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] grid place-items-center overflow-hidden bg-black/50 px-4 py-10 sm:px-6 sm:py-12 md:px-8 md:py-16"
      onClick={() => {
        if (isSaving) return;
        onClose();
      }}
    >
      <div
        className="w-full max-w-2xl min-h-0 max-h-[min(90vh,calc(100dvh-6rem))] overflow-y-scroll overflow-x-hidden overscroll-contain rounded-md border border-gray-200 bg-white shadow-lg [scrollbar-width:thin] [scrollbar-color:#d4d4d8_#f4f4f5] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-300 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-zinc-100"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="px-4 pb-8 pt-6 sm:px-6 sm:pb-10 sm:pt-8 space-y-4">
          {/* HEADER */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Event Details</h2>
              <p className="text-sm text-gray-500 mt-1">
                Fill in the primary information for the upcoming partner event.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              aria-label="Close event modal"
            >
              <X size={18} />
            </button>
          </div>

          {/* FORM */}
          <div className="space-y-4">
            {formError ? <p className="text-xs text-red-600">{formError}</p> : null}

            <Input
              label="Event Name / Topic *"
              placeholder="Q3 Corporate Sustainability Summit"
              value={title}
              onChange={setTitle}
              disabled={loadingMembers}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <IconInput
                label="Event Date *"
                icon={<Calendar size={16} />}
                type="date"
                value={date}
                onChange={setDate}
                disabled={loadingMembers}
              />

              <IconInput
                label="Location (Optional)"
                icon={<MapPin size={16} />}
                placeholder="Grand Hyatt, Seattle WA"
                value={location}
                onChange={setLocation}
                disabled={loadingMembers}
              />
            </div>

            <Input
              label="Event Time *"
              placeholder="9:00 AM - 5:00 PM"
              value={time}
              onChange={setTime}
              disabled={loadingMembers}
            />

            <div>
              <label className="text-sm text-gray-700 font-medium">Description & Notes</label>
              <textarea
                rows={3}
                value={notes}
                disabled={loadingMembers}
                onChange={(event) => setNotes(event.target.value)}
                className="w-full mt-1.5 border border-gray-200 rounded-md px-3 py-2 text-sm resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder="Annual gathering of partner companies to discuss Q3 sustainability targets, review carbon offset initiatives, and plan for Q4 joint ventures. Keynote by Sarah Jenkins. Ensure VIP catering is booked."
              />
            </div>

            <hr className="border-gray-200" />

            <div ref={companyFieldRef} className="relative">
              <p className="text-sm font-medium text-gray-900">Benefitting Companies</p>
              <p className="text-xs text-gray-500 mb-2">
                Select members by company name (from your membership directory).
              </p>

              {loadingMembers ? (
                <p className="text-xs text-gray-500 flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Loading member companies…
                </p>
              ) : membersError ? (
                <p className="text-xs text-red-600">{membersError}</p>
              ) : memberCompanies.length === 0 ? (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                  No member companies found. Add members first, then schedule an event.
                </p>
              ) : null}

              <div className="border border-gray-200 rounded-md px-3 py-2 flex flex-wrap gap-2 items-center min-h-[44px]">
                {companies.map((c) => (
                  <span
                    key={c}
                    className="flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs max-w-full"
                  >
                    <span className="truncate">{c}</span>
                    <button
                      type="button"
                      disabled={loadingMembers || isSaving}
                      onClick={() => removeCompany(c)}
                      className="text-gray-500 hover:text-gray-700 shrink-0"
                      aria-label={`Remove ${c}`}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
                <div className="flex items-center gap-2 flex-1 min-w-[180px]">
                  <Search size={14} className="text-gray-400 shrink-0" />
                  <input
                    value={companyInput}
                    disabled={loadingMembers || memberCompanies.length === 0}
                    onChange={(event) => {
                      setCompanyInput(event.target.value);
                      setCompanyDropdownOpen(true);
                    }}
                    onFocus={() => setCompanyDropdownOpen(true)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        if (filteredCompanySuggestions.length === 1) {
                          pickCompany(filteredCompanySuggestions[0]);
                          return;
                        }
                        const exact = memberCompanies.find(
                          (n) =>
                            !companies.some((c) => c.toLowerCase() === n.toLowerCase()) &&
                            n.toLowerCase() === companyInput.trim().toLowerCase(),
                        );
                        if (exact) pickCompany(exact);
                      }
                    }}
                    placeholder="Search members to add…"
                    className="outline-none text-sm w-full bg-transparent disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {companyDropdownOpen && !loadingMembers && memberCompanies.length > 0 && (
                <div className="absolute z-20 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg max-h-52 overflow-y-auto">
                  {filteredCompanySuggestions.length === 0 ? (
                    <p className="px-3 py-2.5 text-sm text-gray-500">No matching companies.</p>
                  ) : (
                    filteredCompanySuggestions.slice(0, 50).map((name) => (
                      <button
                        key={name}
                        type="button"
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors truncate"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => pickCompany(name)}
                      >
                        {name}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 sm:pt-5 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="w-full sm:w-auto px-4 py-2 border border-gray-200 rounded-md text-sm hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={isSaving || loadingMembers || memberCompanies.length === 0 || Boolean(membersError)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 bg-yellow-500 rounded-md text-sm font-medium hover:bg-yellow-400 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                  Saving…
                </>
              ) : (
                "Save Event"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ================= INPUT ================= */

function Input({
  label,
  placeholder,
  value,
  onChange,
  disabled,
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="text-sm text-gray-700 font-medium">{label}</label>
      <input
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="w-full mt-1.5 border border-gray-200 rounded-md px-3 py-2 text-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
      />
    </div>
  );
}

/* ================= ICON INPUT ================= */

function IconInput({
  label,
  icon,
  placeholder,
  value,
  onChange,
  type = "text",
  disabled,
}: {
  label: string;
  icon: ReactNode;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "date";
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="text-sm text-gray-700 font-medium">{label}</label>

      <div className="flex items-center border border-gray-200 rounded-md px-3 py-2 mt-1.5">
        <div className="text-gray-400">{icon}</div>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="ml-2 outline-none text-sm w-full bg-transparent disabled:cursor-not-allowed disabled:bg-transparent"
        />
      </div>
    </div>
  );
}
