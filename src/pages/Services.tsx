import {
  Users,
  FileText,
  CheckCircle,
  Activity,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

/* TYPES */

type Stat = {
  title: string;
  value: number;
  change: string;
  positive: boolean;
  icon: React.ReactNode;
};

type ActivityItem = {
  title: string;
  company: string;
  time: string;
  icon: React.ReactNode;
};

/* COMPONENT */

export default function Services() {
  const navigate = useNavigate(); //

  /* DATA */

  const stats: Stat[] = [
    {
      title: "Total Members",
      value: 1248,
      change: "+12% from last month",
      positive: true,
      icon: <Users size={18} />,
    },
    {
      title: "Pending Requests",
      value: 42,
      change: "-5% from last week",
      positive: false,
      icon: <FileText size={18} />,
    },
    {
      title: "Services Delivered",
      value: 892,
      change: "+18% from last month",
      positive: true,
      icon: <CheckCircle size={18} />,
    },
    {
      title: "Active Services",
      value: 156,
      change: "+2% from last week",
      positive: true,
      icon: <Activity size={18} />,
    },
  ];

  const activities: ActivityItem[] = [
    {
      title: "Service Delivered",
      company: "Acme Corp",
      time: "2 hours ago",
      icon: <CheckCircle className="text-green-500" size={16} />,
    },
    {
      title: "New Request",
      company: "Globex Inc",
      time: "4 hours ago",
      icon: <FileText className="text-orange-500" size={16} />,
    },
    {
      title: "New Member Added",
      company: "Stark Industries",
      time: "Yesterday",
      icon: <Users className="text-gray-400" size={16} />,
    },
    {
      title: "Service Delivered",
      company: "Wayne Enterprises",
      time: "Yesterday",
      icon: <CheckCircle className="text-green-500" size={16} />,
    },
    {
      title: "System Maintenance",
      company: "Server #4",
      time: "2 days ago",
      icon: <Activity className="text-gray-400" size={16} />,
    },
  ];

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const requested = [24, 52, 48, 61, 55, 67];
  const delivered = [30, 40, 52, 50, 58, 78];

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Dashboard Overview</h2>
          <p className="text-gray-500 text-sm">
            Here's a summary of your service management activities.
          </p>
        </div>

        <div className="flex gap-3">
          <button className="border px-4 py-2 rounded text-sm">
            📅 Last 30 Days
          </button>

          <button
            onClick={() => navigate("/services/delivered")}
            className="bg-yellow-500 px-4 py-2 rounded text-sm font-medium"
          >
            Delivered Services
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <StatCard key={i} stat={stat} />
        ))}
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-3 gap-4">

        {/* CHART */}
        <div className="col-span-2 bg-white p-6 rounded-xl shadow-sm">
          <h3 className="font-semibold">Service Delivery Trends</h3>
          <p className="text-sm text-gray-500 mb-4">
            Requests vs. Deliveries over the last 6 months.
          </p>

          <div className="flex items-end gap-6 h-64 mt-6">
            {months.map((m, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="flex gap-2 items-end h-52">
                  <div
                    className="w-5 bg-yellow-500 rounded"
                    style={{ height: `${requested[i]}%` }}
                  />
                  <div
                    className="w-5 bg-blue-900 rounded"
                    style={{ height: `${delivered[i]}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">{m}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-4 mt-4 text-sm">
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              Requested
            </span>
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-900 rounded-full" />
              Delivered
            </span>
          </div>
        </div>

        {/* ACTIVITY */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="font-semibold">Recent Activity</h3>
          <p className="text-sm text-gray-500 mb-4">
            Latest actions across the platform.
          </p>

          <div className="space-y-4">
            {activities.map((a, i) => (
              <div key={i} className="flex gap-3">
                <div className="mt-1">{a.icon}</div>

                <div>
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-gray-500">{a.company}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    ⏱ {a.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

/* STAT CARD */

function StatCard({ stat }: { stat: Stat }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-start">
      <div>
        <p className="text-gray-500 text-sm">{stat.title}</p>
        <h3 className="text-xl font-bold mt-2">
          {stat.value.toLocaleString()}
        </h3>

        <p
          className={`text-xs mt-1 ${
            stat.positive ? "text-green-600" : "text-red-500"
          }`}
        >
          {stat.change}
        </p>
      </div>

      <div className="w-10 h-10 bg-gray-100 flex items-center justify-center rounded">
        {stat.icon}
      </div>
    </div>
  );
}