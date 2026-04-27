import { Search, Download, RefreshCw, Eye, Pencil, Trash2, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

type Partner = {
  id: number;
  name: string;
  contactName: string;
  contactEmail: string;
  program: string;
  status: "Incoming" | "Ongoing" | "Complete";
  timeframe: string;
};

const partners: Partner[] = [
  { id: 1, name: "Mastercard Foundation", contactName: "Sarah Jenkins",   contactEmail: "s.jenkins@mastercardfdn.org", program: "Youth Africa Works",            status: "Incoming", timeframe: "2022 - 2025" },
  { id: 2, name: "GIZ Rwanda",            contactName: "Klaus Müller",    contactEmail: "klaus.mueller@giz.de",        program: "Digital Transformation Center", status: "Incoming", timeframe: "2023 - 2026" },
  { id: 3, name: "USAID",                 contactName: "David Okinyi",    contactEmail: "dokinyi@usaid.gov",           program: "Nguriza Nshore",                status: "Complete", timeframe: "2019 - 2022" },
  { id: 4, name: "World Bank Group",      contactName: "Elena Rossi",     contactEmail: "erossi@worldbank.org",        program: "Digital Acceleration Project",  status: "Ongoing",  timeframe: "2024 - 2028" },
  { id: 5, name: "MTN Rwanda",            contactName: "Innocent Kagabo", contactEmail: "i.kagabo@mtn.rw",             program: "SME Connect",                   status: "Ongoing",  timeframe: "2024 - 2025" },
  { id: 6, name: "Equity Bank",           contactName: "Grace Uwase",     contactEmail: "guwase@equitybank.rw",        program: "FinTech Innovation Fund",       status: "Ongoing",  timeframe: "2023 - 2025" },
];

const statusStyles = {
  Incoming: "text-yellow-500 font-semibold",
  Ongoing:  "text-gray-800 font-semibold",
  Complete: "text-gray-400",
};

function FilterSelect({ label }: { label: string }) {
  return (
    <div className="relative">
      <select className="appearance-none pl-3 pr-7 py-2 border border-gray-200 rounded-md text-xs text-gray-500 bg-white focus:outline-none w-full">
        <option>{label}</option>
      </select>
      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}

export default function PartnerDirectory() {
  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Partner Directory</h2>
          <p className="text-gray-400 text-xs mt-0.5">
            Manage external partners, affiliated programs, and synchronization with central dashboards.
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-md bg-white text-xs font-medium hover:bg-gray-50 transition-colors whitespace-nowrap">
            <Download size={13} /> Export
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 bg-yellow-400 hover:bg-yellow-300 text-black rounded-md text-xs font-semibold transition-colors whitespace-nowrap">
            <RefreshCw size={13} /> Bulk Sync (All)
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-md border border-gray-200 shadow-sm p-3 flex flex-wrap gap-2">
        <div className="flex items-center gap-2 border border-gray-200 rounded-md px-3 py-2 flex-1 min-w-[160px]">
          <Search size={13} className="text-gray-400 flex-shrink-0" />
          <input
            placeholder="Search by Partner Name or Program..."
            className="outline-none text-xs w-full bg-transparent placeholder-gray-400"
          />
        </div>
        <FilterSelect label="Status" />
        <FilterSelect label="Program" />
        <FilterSelect label="Timeframe" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">

        {/* Mobile cards */}
        <div className="lg:hidden divide-y divide-gray-100">
          {partners.map((p) => (
            <div key={p.id} className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                <span className={`text-xs ${statusStyles[p.status]}`}>{p.status}</span>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-700">{p.contactName}</p>
                <p className="text-xs text-gray-400">{p.contactEmail}</p>
              </div>
              <div className="flex justify-between text-xs">
                <div><p className="text-gray-400">Program</p><p className="text-gray-700">{p.program}</p></div>
                <div className="text-right"><p className="text-gray-400">Timeframe</p><p className="text-gray-400">{p.timeframe}</p></div>
              </div>
              <div className="flex gap-3 pt-1">
                <button className="text-gray-400 hover:text-gray-600"><Eye size={14} /></button>
                <button className="text-gray-400 hover:text-gray-600"><Pencil size={14} /></button>
                <button className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table — no min-w, columns share space naturally */}
        <div className="hidden lg:block">
          <table className="w-full text-xs table-fixed">
            <colgroup>
              <col className="w-8" />
              <col className="w-[18%]" />
              <col className="w-[22%]" />
              <col className="w-[24%]" />
              <col className="w-[11%]" />
              <col className="w-[11%]" />
              <col className="w-[10%]" />
            </colgroup>
            <thead className="border-b border-gray-100">
              <tr>
                <th className="px-4 py-3"><input type="checkbox" className="rounded" /></th>
                <th className="text-left px-3 py-3 text-gray-400 font-medium">Partner Name</th>
                <th className="text-left px-3 py-3 text-gray-400 font-medium">Contact</th>
                <th className="text-left px-3 py-3 text-gray-400 font-medium">Program</th>
                <th className="text-left px-3 py-3 text-gray-400 font-medium">Status</th>
                <th className="text-left px-3 py-3 text-gray-400 font-medium">Timeframe</th>
                <th className="text-left px-3 py-3 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {partners.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-4"><input type="checkbox" className="rounded" /></td>
                  <td className="px-3 py-4 font-medium text-gray-800">{p.name}</td>
                  <td className="px-3 py-4">
                    <p className="font-semibold text-gray-800 truncate">{p.contactName}</p>
                    <p className="text-gray-400 truncate mt-0.5">{p.contactEmail}</p>
                  </td>
                  <td className="px-3 py-4 text-gray-600">{p.program}</td>
                  <td className={`px-3 py-4 ${statusStyles[p.status]}`}>{p.status}</td>
                  <td className="px-3 py-4 text-gray-400">{p.timeframe}</td>
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-2.5">
                      <button className="text-gray-400 hover:text-gray-600 transition-colors"><Eye size={14} /></button>
                      <button className="text-gray-400 hover:text-gray-600 transition-colors"><Pencil size={14} /></button>
                      <button className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
          <p>Showing <span className="font-semibold text-gray-700">1</span> to <span className="font-semibold text-gray-700">6</span> of <span className="font-semibold text-gray-700">24</span> results</p>
          <div className="flex items-center gap-1">
            <button className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded-md hover:bg-gray-50">
              <ChevronLeft size={12} />
            </button>
            {[1, 2, 3].map((n) => (
              <button key={n} className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${n === 1 ? "bg-yellow-400 text-black font-semibold" : "border border-gray-200 hover:bg-gray-50"}`}>
                {n}
              </button>
            ))}
            <span className="w-7 h-7 flex items-center justify-center text-gray-400">...</span>
            <button className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded-md hover:bg-gray-50">4</button>
            <button className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded-md hover:bg-gray-50">
              <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}