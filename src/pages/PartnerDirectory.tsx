import { Search, Download, RefreshCw } from "lucide-react";

export default function PartnerDirectory() {
  const partners = [
    {
      name: "Mastercard Foundation",
      contact: "Sarah Jenkins",
      email: "s.jenkins@mastercardfdn.org",
      program: "Youth Africa Works",
      status: "Incoming",
      timeframe: "2022 - 2025",
    },
    {
      name: "GIZ Rwanda",
      contact: "Klaus Müller",
      email: "klaus.mueller@giz.de",
      program: "Digital Transformation Center",
      status: "Incoming",
      timeframe: "2023 - 2026",
    },
    {
      name: "USAID",
      contact: "David Oikinyi",
      email: "dokinyi@usaid.gov",
      program: "Nguriza Nshore",
      status: "Complete",
      timeframe: "2019 - 2022",
    },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">Partner Directory</h2>
          <p className="text-gray-500 text-sm mt-1">
            Manage external partners, affiliated programs, and synchronization with central dashboards.
          </p>
        </div>

        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border rounded-md bg-white text-sm">
            <Download size={16} />
            Export
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black rounded-md text-sm font-medium">
            <RefreshCw size={16} />
            Bulk Sync (All)
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm flex gap-3 items-center">
        <div className="flex items-center gap-2 border rounded px-3 py-2 w-96">
          <Search size={16} className="text-gray-400" />
          <input
            placeholder="Search by Partner Name or Program..."
            className="outline-none text-sm w-full"
          />
        </div>

        <div className="flex gap-2 ml-auto">
          <Select />
          <Select />
          <Select />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="p-3 text-left"></th>
              <th className="p-3 text-left">Partner Name</th>
              <th className="p-3 text-left">Contact</th>
              <th className="p-3 text-left">Program</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Timeframe</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {partners.map((p, i) => (
              <tr key={i} className="border-t hover:bg-gray-50">
                <td className="p-3">
                  <input type="checkbox" />
                </td>

                <td className="p-3 font-medium">{p.name}</td>

                <td className="p-3">
                  <p>{p.contact}</p>
                  <p className="text-xs text-gray-500">{p.email}</p>
                </td>

                <td className="p-3">{p.program}</td>

                <td className="p-3">
                  <Status status={p.status} />
                </td>

                <td className="p-3 text-gray-500">{p.timeframe}</td>

                <td className="p-3">👁️ ✏️ 🗑️</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-between items-center p-4 text-sm text-gray-500">
          <p>Showing 1 to 6 of 24 results</p>

          <div className="flex gap-2">
            <button className="px-3 py-1 border rounded">1</button>
            <button className="px-3 py-1 border rounded">2</button>
            <button className="px-3 py-1 border rounded">3</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Small components */

function Select() {
  return (
    <select className="px-3 py-2 border rounded text-sm text-gray-500">
      <option>Filter</option>
    </select>
  );
}

function Status({ status }: { status: string }) {
  let style = "";

  if (status === "Incoming") style = "bg-yellow-100 text-yellow-600";
  else if (status === "Ongoing") style = "bg-green-100 text-green-600";
  else style = "bg-gray-200 text-gray-600";

  return (
    <span className={`px-2 py-1 rounded text-xs ${style}`}>
      {status}
    </span>
  );
}