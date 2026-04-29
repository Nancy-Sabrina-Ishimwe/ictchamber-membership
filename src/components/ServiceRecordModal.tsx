import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Building2, CalendarDays, Check, ChevronDown, X } from "lucide-react";

export type ServiceRecordFormValue = {
  name: string;
  code: string;
  company: string;
  date: string;
  status: "Completed" | "In Progress" | "Pending Review";
  notes?: string;
};

type Props = {
  onClose: () => void;
  mode?: "add" | "view" | "edit";
  initialRecord?: ServiceRecordFormValue | null;
  onSave?: (record: ServiceRecordFormValue) => void;
};

const COMPANY_OPTIONS = [
  "Acme Corporation",
  "TechNova Solutions",
  "Global Industries Ltd.",
  "Stark Enterprises",
  "WayneTech",
];

const STATUS_OPTIONS = ["Completed", "In Progress", "Pending Review"] as const;

function toInputDate(dateText: string) {
  const parsed = new Date(dateText);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

function toDisplayDate(dateValue: string) {
  if (!dateValue) return "";
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return dateValue;
  return parsed.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

export default function ServiceRecordModal({
  onClose,
  mode = "add",
  initialRecord = null,
  onSave,
}: Props) {
  const readOnly = mode === "view";
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>(
    initialRecord?.company ? [initialRecord.company] : ["Acme Corporation"],
  );
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
  const [servicesDelivered, setServicesDelivered] = useState(initialRecord?.name ?? "");
  const [deliveryDate, setDeliveryDate] = useState(initialRecord?.date ? toInputDate(initialRecord.date) : "");
  const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]>(initialRecord?.status ?? "Completed");
  const [notes, setNotes] = useState(initialRecord?.notes ?? "");

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const availableCompanies = useMemo(
    () => COMPANY_OPTIONS.filter((company) => !selectedCompanies.includes(company)),
    [selectedCompanies]
  );

  const addCompany = (company: string) => {
    if (readOnly) return;
    setSelectedCompanies((prev) => [...prev, company]);
    setCompanyDropdownOpen(false);
  };

  const removeCompany = (company: string) => {
    if (readOnly) return;
    setSelectedCompanies((prev) => prev.filter((c) => c !== company));
  };

  const handleSave = () => {
    if (readOnly) {
      onClose();
      return;
    }
    const payload: ServiceRecordFormValue = {
      name: servicesDelivered.trim() || "Untitled Service",
      code: initialRecord?.code ?? `SRV-${Date.now()}`,
      company: selectedCompanies[0] ?? "Unknown Company",
      date: toDisplayDate(deliveryDate),
      status,
      notes: notes.trim(),
    };
    onSave?.(payload);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/55 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-md border border-gray-200 shadow-lg max-h-[calc(100vh-1.5rem)] sm:max-h-[calc(100vh-2rem)] md:max-h-[calc(100vh-3rem)] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Record Service Delivery</h2>
              <p className="text-sm text-gray-500 mt-1">
                {mode === "view"
                  ? "Review delivered service record details."
                  : mode === "edit"
                  ? "Update the service fulfillment record."
                  : "Log newly completed services to beneficiary companies."}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close add service record modal"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-4 sm:mt-5 border border-gray-200 rounded-lg p-4 sm:p-5 space-y-5">
            {readOnly ? (
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-gray-500">Record Code:</span>{" "}
                  <span className="font-medium text-gray-900">{initialRecord?.code ?? "-"}</span>
                </p>
                <p>
                  <span className="text-gray-500">Service Name:</span>{" "}
                  <span className="font-medium text-gray-900">{servicesDelivered || "-"}</span>
                </p>
                <p>
                  <span className="text-gray-500">Beneficiary Company:</span>{" "}
                  <span className="font-medium text-gray-900">{selectedCompanies.join(", ") || "-"}</span>
                </p>
                <p>
                  <span className="text-gray-500">Delivery Date:</span>{" "}
                  <span className="font-medium text-gray-900">
                    {deliveryDate
                      ? new Date(deliveryDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                        })
                      : "-"}
                  </span>
                </p>
                <p>
                  <span className="text-gray-500">Status:</span>{" "}
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                      status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : status === "In Progress"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {status}
                  </span>
                </p>
                <div className="pt-1">
                  <p className="text-gray-500">Additional Notes:</p>
                  <p className="font-medium text-gray-900 whitespace-pre-wrap">{notes || "-"}</p>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <h3 className="text-base font-medium text-gray-900">Benefiting Companies</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Select one or more companies that received this service.
                  </p>
                  <div className="relative mt-3">
                    <button
                      type="button"
                      onClick={() => setCompanyDropdownOpen((prev) => !prev)}
                      className="w-full border border-gray-200 rounded-md px-3 py-2 flex items-center justify-between gap-2 text-left"
                    >
                      <div className="flex flex-wrap items-center gap-2 min-w-0">
                        {selectedCompanies.length === 0 ? (
                          <span className="text-sm text-gray-400">Select companies</span>
                        ) : (
                          selectedCompanies.map((company) => (
                            <span
                              key={company}
                              className="inline-flex items-center gap-1 rounded-md bg-gray-100 text-gray-700 text-xs px-2 py-1"
                            >
                              <Building2 size={12} className="text-gray-500" />
                              <span className="max-w-[150px] truncate">{company}</span>
                              <span
                                role="button"
                                tabIndex={0}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  removeCompany(company);
                                }}
                                onKeyDown={(event) => {
                                  if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    removeCompany(company);
                                  }
                                }}
                                className="text-gray-500 hover:text-gray-700"
                                aria-label={`Remove ${company}`}
                              >
                                <X size={12} />
                              </span>
                            </span>
                          ))
                        )}
                      </div>
                      <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
                    </button>

                    {companyDropdownOpen && (
                      <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-sm max-h-48 overflow-y-auto">
                        {availableCompanies.length === 0 ? (
                          <p className="px-3 py-2 text-sm text-gray-500">All companies already selected.</p>
                        ) : (
                          availableCompanies.map((company) => (
                            <button
                              key={company}
                              type="button"
                              onClick={() => addCompany(company)}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                            >
                              {company}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-medium text-gray-900">Services Delivered</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Choose the specific services rendered from the catalog.
                  </p>
                  <textarea
                    value={servicesDelivered}
                    onChange={(event) => setServicesDelivered(event.target.value)}
                    className="w-full mt-3 border border-gray-200 rounded-md px-3 py-2 text-sm min-h-20 resize-none"
                    placeholder="Enter any relevant details or links to external reports here..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-base font-medium text-gray-900">Delivery Date</label>
                    <div className="mt-3 relative">
                      <CalendarDays size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="date"
                        value={deliveryDate}
                        onChange={(event) => setDeliveryDate(event.target.value)}
                        className="w-full border border-gray-200 rounded-md pl-9 pr-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-base font-medium text-gray-900">Initial Status</label>
                    <select
                      value={status}
                      onChange={(event) => setStatus(event.target.value as (typeof STATUS_OPTIONS)[number])}
                      className="w-full mt-3 border border-gray-200 rounded-md px-3 py-2 text-sm bg-white"
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1.5">
                      New records are marked &quot;Completed&quot; by default.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-base font-medium text-gray-900">Additional Notes (Optional)</label>
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    className="w-full mt-3 border border-gray-200 rounded-md px-3 py-2 text-sm min-h-24 resize-none"
                    placeholder="Enter any relevant details or links to external reports here..."
                  />
                </div>
              </>
            )}

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-1">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2 border border-gray-200 rounded-md text-sm hover:bg-gray-50 transition-colors"
              >
                {readOnly ? "Close" : "Cancel"}
              </button>
              {!readOnly ? (
                <button
                  onClick={handleSave}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2 bg-yellow-500 hover:bg-yellow-400 rounded-md text-sm font-medium transition-colors"
                >
                  <Check size={14} />
                  {mode === "edit" ? "Save Changes" : "Save Record"}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
