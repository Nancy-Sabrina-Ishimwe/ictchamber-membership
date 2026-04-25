import { useEffect, useState } from "react";
import {
  Users,
  UserCheck,
  UserX,
  DollarSign,
} from "lucide-react";

import DashboardCard from "../components/DashboardCard";
import { getDashboardData } from "../services/dashboardService";
import type { DashboardStats, Activity } from "../types/dashboard";

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDashboardData();
        setStats(data.stats);
        setActivities(data.activities);
      } catch (error) {
        console.error("Error fetching dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <p className="text-gray-500">Loading dashboard...</p>;
  }

  if (!stats) {
    return <p className="text-red-500">Failed to load data</p>;
  }

  return (
    <div className="bg-slate-100 space-y-6">

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">Hello, Admin 👋</h2>
          <p className="text-gray-500">
            Here is what's happening with the Membership today.
          </p>
        </div>

        <div className="flex gap-3">
          <button className="px-4 py-2 border rounded-md text-sm bg-white shadow-sm">
            📩 Bulk Message
          </button>
          <button className="px-4 py-2 border rounded-md text-sm bg-white shadow-sm">
            ⬇️ Export
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm flex justify-between">
        <button className="border px-4 py-2 rounded text-sm">Filter</button>

        <div className="flex gap-2">
          <button className="border px-4 py-2 rounded text-sm">
            YTD (Jan - Jul)
          </button>
          <button className="border px-4 py-2 rounded text-sm">
            Select Date
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-4 gap-4">
        <DashboardCard
          icon={<Users />}
          title="Total Organizations"
          value={stats.totalOrganizations}
          color="bg-blue-100 text-blue-600"
        />

        <DashboardCard
          icon={<UserCheck />}
          title="Active Members"
          value={stats.activeMembers}
          color="bg-green-100 text-green-600"
        />

        <DashboardCard
          icon={<UserX />}
          title="Inactive Members"
          value={stats.inactiveMembers}
          color="bg-red-100 text-red-600"
        />

        <DashboardCard
          icon={<DollarSign />}
          title="Renewal Due"
          value={stats.renewalDue}
          color="bg-yellow-100 text-yellow-600"
        />
      </div>

      {/* Charts (ready for backend later) */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="font-semibold">Revenue Growth</h3>
          <p className="text-sm text-gray-500 mb-4">
            Monthly revenue collection (YTD)
          </p>
          <div className="h-40 bg-gray-100 flex items-center justify-center">
            Chart will use backend data
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="font-semibold">Membership Trends</h3>
          <p className="text-sm text-gray-500 mb-4">
            New vs Renewed members
          </p>
          <div className="h-40 bg-gray-100 flex items-center justify-center">
            Chart will use backend data
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
            {activities.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="py-2">{item.company}</td>
                <td>{item.action}</td>
                <td>{item.date}</td>
                <td>{item.amount}</td>
                <td
                  className={
                    item.status === "success"
                      ? "text-green-500"
                      : "text-yellow-500"
                  }
                >
                  {item.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}