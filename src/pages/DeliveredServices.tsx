import { Search, Filter, Plus } from "lucide-react";

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
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Delivered Services</h2>
          <p className="text-gray-500 text-sm">
            View and manage previously documented service fulfillments.
          </p>
        </div>

        <button className="flex items-center gap-2 bg-yellow-500 px-4 py-2 rounded text-sm font-medium">
          <Plus size={16} />
          Add Record
        </button>
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex justify-between items-center">
        <div className="flex items-center border rounded px-3 py-2 w-96">
          <Search size={16} className="text-gray-400" />
          <input
            placeholder="Search services or companies..."
            className="ml-2 outline-none text-sm w-full"
          />
        </div>

        <button className="flex items-center gap-2 border px-4 py-2 rounded text-sm">
          <Filter size={16} />
          Filter
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">

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
              <tr key={i} className="border-t hover:bg-gray-50">

                {/* SERVICE */}
                <td className="p-4">
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs text-gray-400">{s.code}</p>
                </td>

                {/* COMPANY */}
                <td className="p-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                    🏢
                  </div>
                  {s.company}
                </td>

                {/* DATE */}
                <td className="p-4 text-gray-500">
                  📅 {s.date}
                </td>

                {/* STATUS */}
                <td className="p-4">
                  <StatusBadge status={s.status} />
                </td>

                {/* ACTIONS */}
                <td className="p-4">👁️ ✏️ 🗑️</td>

              </tr>
            ))}
          </tbody>
        </table>

        {/* FOOTER */}
        <div className="flex justify-between items-center p-4 text-sm text-gray-500">
          <p>Showing 1 to 7 of 24 results</p>

          <div className="flex gap-2">
            <button className="border px-3 py-1 rounded">Previous</button>
            <button className="border px-3 py-1 rounded">Next</button>
          </div>
        </div>
      </div>
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
    <span className={`px-3 py-1 rounded-full text-xs ${style}`}>
      {status}
    </span>
  );
}