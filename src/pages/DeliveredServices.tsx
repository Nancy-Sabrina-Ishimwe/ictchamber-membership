import { Search, Filter, Plus, Building2, CalendarDays, Eye, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import ServiceRecordModal from "../components/ServiceRecordModal";

/* ================= TYPES ================= */

type Service = {
  name: string;
  code: string;
  company: string;
  date: string;
  status: "Completed" | "In Progress" | "Pending Review";
};

/* ================= PAGE ================= */

export default function DeliveredServices() {
  const [openRecordModal, setOpenRecordModal] = useState(false);

  const services: Service[] = [
    {
      name: "Comprehensive Security Audit",
      code: "SRV-2023-089",
      company: "Acme Corporation",
      date: "Oct 24, 2023",
      status: "Completed",
    },
    {
      name: "Cloud Infrastructure Migration",
      code: "SRV-2023-090",
      company: "TechNova Solutions",
      date: "Oct 22, 2023",
      status: "In Progress",
    },
    {
      name: "Executive Leadership Training",
      code: "SRV-2023-091",
      company: "Global Industries Ltd.",
      date: "Oct 18, 2023",
      status: "Completed",
    },
    {
      name: "Annual Software License Renewal",
      code: "SRV-2023-092",
      company: "Stark Enterprises",
      date: "Oct 15, 2023",
      status: "Pending Review",
    },
    {
      name: "Custom CRM Implementation",
      code: "SRV-2023-093",
      company: "WayneTech",
      date: "Oct 10, 2023",
      status: "Completed",
    },
    {
      name: "Employee Onboarding Workshop",
      code: "SRV-2023-094",
      company: "Acme Corporation",
      date: "Oct 05, 2023",
      status: "Completed",
    },
    {
      name: "Q4 Marketing Strategy Consulting",
      code: "SRV-2023-095",
      company: "Stark Enterprises",
      date: "Sep 28, 2023",
      status: "In Progress",
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* HEADER */}
      <div className="flex flex-col gap-3 lg:flex-row lg:justify-between lg:items-start">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Delivered Services</h2>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            View and manage previously documented service fulfillments.
          </p>
        </div>

        <button
          onClick={() => setOpenRecordModal(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 transition-colors px-4 py-2 rounded-md text-sm font-medium"
        >
          <Plus size={16} />
          Add Record
        </button>
      </div>

      {/* SEARCH + FILTER */}
      <div className="bg-white border border-gray-200 rounded-md shadow-sm p-3 sm:p-4 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex items-center border border-gray-200 rounded px-3 py-2 w-full sm:max-w-md">
          <Search size={16} className="text-gray-400 flex-shrink-0" />
          <input
            placeholder="Search services or companies..."
            className="ml-2 outline-none text-sm w-full bg-transparent"
          />
        </div>

        <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-gray-200 px-4 py-2 rounded-md text-sm hover:bg-gray-50 transition-colors">
          <Filter size={16} />
          Filter
        </button>
      </div>

      {/* DATA */}
      <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-gray-100">
          {services.map((s, i) => (
            <div key={i} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-gray-900 break-words">{s.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.code}</p>
                </div>
                <StatusBadge status={s.status} />
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-700">
                <div className="w-7 h-7 bg-gray-100 rounded flex items-center justify-center text-gray-500 flex-shrink-0">
                  <Building2 size={14} />
                </div>
                <span className="break-words">{s.company}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <CalendarDays size={14} className="text-gray-400" />
                <span>{s.date}</span>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <button className="text-gray-400 hover:text-gray-600 transition-colors" aria-label={`View ${s.name}`}>
                  <Eye size={15} />
                </button>
                <button className="text-gray-400 hover:text-gray-600 transition-colors" aria-label={`Edit ${s.name}`}>
                  <Pencil size={15} />
                </button>
                <button className="text-gray-400 hover:text-red-500 transition-colors" aria-label={`Delete ${s.name}`}>
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm table-fixed">
            <colgroup>
              <col className="w-[33%]" />
              <col className="w-[26%]" />
              <col className="w-[16%]" />
              <col className="w-[15%]" />
              <col className="w-[10%]" />
            </colgroup>
            {/* HEAD */}
            <thead className="bg-gray-50 text-gray-500 text-xs">
              <tr>
                <th className="p-4 text-left">SERVICE NAME</th>
                <th className="p-4 text-left">BENEFICIARY COMPANY</th>
                <th className="p-4 text-left">DATE DELIVERED</th>
                <th className="p-4 text-left">STATUS</th>
                <th className="p-4 text-left">ACTIONS</th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {services.map((s, i) => (
                <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">

                  {/* SERVICE */}
                  <td className="p-4">
                    <p className="font-medium text-gray-900 break-words">{s.name}</p>
                    <p className="text-xs text-gray-400 break-all">{s.code}</p>
                  </td>

                  {/* COMPANY */}
                  <td className="p-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-gray-500 flex-shrink-0">
                        <Building2 size={14} />
                      </div>
                      <span className="break-words">{s.company}</span>
                    </div>
                  </td>

                  {/* DATE */}
                  <td className="p-4 text-gray-500 whitespace-nowrap">
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays size={14} className="text-gray-400" />
                      {s.date}
                    </span>
                  </td>

                  {/* STATUS */}
                  <td className="p-4">
                    <StatusBadge status={s.status} />
                  </td>

                  {/* ACTIONS */}
                  <td className="p-4">
                    <div className="flex items-center gap-2.5">
                      <button className="text-gray-400 hover:text-gray-600 transition-colors" aria-label={`View ${s.name}`}>
                        <Eye size={15} />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600 transition-colors" aria-label={`Edit ${s.name}`}>
                        <Pencil size={15} />
                      </button>
                      <button className="text-gray-400 hover:text-red-500 transition-colors" aria-label={`Delete ${s.name}`}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 text-xs sm:text-sm text-gray-500 border-t border-gray-100">
          <p>Showing 1 to 7 of 24 results</p>

          <div className="flex gap-2">
            <button className="border border-gray-200 px-3 py-1 rounded hover:bg-gray-50 transition-colors">Previous</button>
            <button className="border border-gray-200 px-3 py-1 rounded hover:bg-gray-50 transition-colors">Next</button>
          </div>
        </div>
      </div>

      {openRecordModal && (
        <ServiceRecordModal onClose={() => setOpenRecordModal(false)} />
      )}
    </div>
  );
}

/* ================= STATUS ================= */

function StatusBadge({ status }: { status: Service["status"] }) {
  let style = "";

  if (status === "Completed") {
    style = "bg-green-100 text-green-600";
  } else if (status === "In Progress") {
    style = "bg-orange-100 text-orange-600";
  } else {
    style = "bg-gray-200 text-gray-600";
  }

  return (
    <span className={`inline-flex items-center whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium ${style}`}>
      {status}
    </span>
  );
}