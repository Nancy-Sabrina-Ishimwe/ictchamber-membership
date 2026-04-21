import {
  Users,
  UserCheck,
  UserX,
  DollarSign,
} from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-6">

      {/* Header + Actions */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">Hello, Admin 👋</h2>
          <p className="text-gray-500">
            Here is what's happening with the Membership today.
          </p>
        </div>

        {/* Buttons (FIXED) */}
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border rounded-md text-sm bg-white hover:bg-gray-50 shadow-sm">
            📩 Bulk Message
          </button>

          <button className="flex items-center gap-2 px-4 py-2 border rounded-md text-sm bg-white hover:bg-gray-50 shadow-sm">
            ⬇️ Export
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
        <button className="px-4 py-2 border rounded text-sm">
          Filter
        </button>

        <div className="flex gap-2">
          <button className="px-4 py-2 border rounded text-sm">
            YTD (Jan - Jul)
          </button>
          <button className="px-4 py-2 border rounded text-sm">
            Select Date
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-4 gap-4">

        <Card
          icon={<Users size={20} />}
          title="Total Organizations"
          value="2,845"
          color="bg-blue-100 text-blue-600"
        />

        <Card
          icon={<UserCheck size={20} />}
          title="Active Members"
          value="2,103"
          color="bg-green-100 text-green-600"
        />

        <Card
          icon={<UserX size={20} />}
          title="Inactive Members"
          value="42"
          color="bg-red-100 text-red-600"
        />

        <Card
          icon={<DollarSign size={20} />}
          title="Renewal Due"
          value="9"
          color="bg-yellow-100 text-yellow-600"
        />
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="font-semibold">Revenue Growth</h3>
          <p className="text-sm text-gray-500 mb-4">
            Monthly revenue collection (YTD)
          </p>

          <div className="h-40 bg-gray-100 rounded flex items-center justify-center">
            Chart here
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="font-semibold">Membership Trends</h3>
          <p className="text-sm text-gray-500 mb-4">
            New vs Renewed members
          </p>

          <div className="h-40 bg-gray-100 rounded flex items-center justify-center">
            Chart here
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="font-semibold mb-4">Recent Activity</h3>

        <table className="w-full text-sm">
          <thead className="text-gray-500 border-b">
            <tr>
              <th className="text-left py-2">Company</th>
              <th className="text-left py-2">Action</th>
              <th className="text-left py-2">Date</th>
              <th className="text-left py-2">Amount</th>
              <th className="text-left py-2">Status</th>
            </tr>
          </thead>

          <tbody>
            <tr className="border-b">
              <td className="py-2">TechVision Rwanda</td>
              <td>Membership Renewed</td>
              <td>Today</td>
              <td>$500</td>
              <td className="text-green-500">Success</td>
            </tr>

            <tr className="border-b">
              <td className="py-2">Kigali Cloud</td>
              <td>New Registration</td>
              <td>Today</td>
              <td>-</td>
              <td className="text-yellow-500">Pending</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* Card component */
function Card({
  icon,
  title,
  value,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className={`w-10 h-10 flex items-center justify-center rounded ${color}`}>
        {icon}
      </div>

      <p className="text-gray-500 text-sm mt-4">{title}</p>
      <h3 className="text-xl font-bold">{value}</h3>
    </div>
  );
}