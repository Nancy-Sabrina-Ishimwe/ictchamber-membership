import { useEffect, useState } from "react";
import { Search, Filter, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import type { Renewal } from "../types/renewal";
import { getRenewals } from "../services/renewalService";

export default function Renewals() {
  const [data, setData] = useState<Renewal[]>([]);

  useEffect(() => {
    getRenewals().then(setData);
  }, []);

  const expiringSoon = data.filter((r) => r.daysLeft <= 30).length;

  return (
    <div className="space-y-6">

      {/* TOP CARD */}
      <div className="bg-white rounded-xl shadow-sm p-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Renewal Management Hub</h2>
          <p className="text-gray-500 text-sm">
            Automate and track membership retention
          </p>
        </div>

        <div className="flex gap-4">
          <TopStat label="EXPIRING < 30 DAYS" value={expiringSoon.toString()} red />
          <TopStat label="PROJECTED REVENUE" value="1.4M RWF" />
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-3 gap-6">

        {/* LEFT */}
        <div className="col-span-2 bg-white rounded-xl shadow-sm">

          {/* HEADER */}
          <div className="p-5 border-b flex justify-between items-center">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                🕒 Upcoming Expiries
              </h3>
              <p className="text-sm text-gray-500">
                Memberships expiring within the next 90 days
              </p>
            </div>

            <div className="flex gap-2">
              <div className="flex items-center border px-3 py-2 rounded">
                <Search size={14} />
                <input
                  placeholder="Search members..."
                  className="ml-2 text-sm outline-none"
                />
              </div>
              <button className="border px-3 rounded">
                <Filter size={16} />
              </button>
            </div>
          </div>

          {/* TABLE HEADER */}
          <div className="grid grid-cols-3 text-xs text-gray-500 px-5 py-3 border-b">
            <p>Member Organization</p>
            <p>Expiry Details</p>
            <p>Automation Status</p>
          </div>

          {/* ROWS */}
          {data.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-3 items-center px-5 py-4 border-b hover:bg-gray-50"
            >

              {/* COMPANY */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div>
                  <p className="font-medium text-sm">{item.companyName}</p>
                  <p className="text-xs text-gray-500">
                    {item.tier} • {item.category}
                  </p>
                </div>
              </div>

              {/* EXPIRY */}
              <div>
                <p className="text-sm font-medium">
                  {formatDate(item.expiryDate)}
                </p>
                <ExpiryBadge days={item.daysLeft} />
              </div>

              {/* STATUS */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {item.status === "urgent" && (
                  <>
                    <AlertTriangle size={16} className="text-red-500" />
                    <span>
                      {item.lastNotification} ({item.channel}) (Urgent)
                    </span>
                  </>
                )}

                {item.status === "sent" && (
                  <>
                    <CheckCircle size={16} className="text-green-500" />
                    <span>
                      {item.lastNotification} ({item.channel})
                    </span>
                  </>
                )}

                {item.status === "pending" && (
                  <>
                    <Clock size={16} className="text-gray-400" />
                    <span>Not sent yet</span>
                  </>
                )}
              </div>
            </div>
          ))}

          {/* FOOTER */}
          <div className="flex justify-between items-center p-4 text-sm text-gray-500">
            <p>Showing {data.length} expiring members</p>
            <div className="flex gap-2">
              <button className="border px-3 py-1 rounded">Prev</button>
              <button className="border px-3 py-1 rounded">Next</button>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-5">

          {/* TRIGGERS */}
          <div className="bg-white p-5 rounded-xl shadow-sm">
            <div className="flex justify-between mb-3">
              <h3 className="font-semibold">Automated Triggers</h3>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                Active
              </span>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              System will automatically dispatch the template below.
            </p>

            <Trigger label="3 Months Before Expiry" sub="Email Only" />
            <Trigger label="2 Months Before Expiry" sub="Email + SMS" />
            <Trigger label="1 Month Before Expiry" sub="Email + SMS (Urgent)" />
            <Trigger label="On Expiry Day" sub="Email + SMS" />

            <button className="text-blue-600 text-sm mt-3">
              + Add Custom Rule
            </button>
          </div>

          {/* TEMPLATE */}
          <div className="bg-white p-5 rounded-xl shadow-sm">
            <h3 className="font-semibold mb-3">
              Standard Reminder Template
            </h3>

            <textarea
              className="w-full border rounded p-3 text-sm h-40"
              defaultValue={`Dear [Company Name],

The ICT Chamber humbly reminds you to renew your membership as it expires in [Remaining Days].

Best regards,
Rwanda ICT Chamber`}
            />

            <div className="flex gap-3 mt-4">
              <button className="bg-yellow-500 px-4 py-2 rounded text-sm">
                Edit Template
              </button>
              <button className="border px-4 py-2 rounded text-sm">
                Preview
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ===== COMPONENTS ===== */

type TopStatProps = {
  label: string;
  value: string;
  red?: boolean;
};

function TopStat({ label, value, red }: TopStatProps) {
  return (
    <div className="bg-gray-100 px-4 py-2 rounded-lg text-sm">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`font-bold ${red ? "text-red-500" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function ExpiryBadge({ days }: { days: number }) {
  let style = "bg-green-100 text-green-600";

  if (days < 10) style = "bg-red-100 text-red-600";
  else if (days < 30) style = "bg-yellow-100 text-yellow-600";

  return (
    <span className={`text-xs px-2 py-1 rounded ${style}`}>
      {days} days left
    </span>
  );
}

function Trigger({ label, sub }: { label: string; sub: string }) {
  return (
    <div className="flex justify-between items-center border p-3 rounded mb-2">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-gray-500">{sub}</p>
      </div>
      <div className="w-10 h-5 bg-gray-300 rounded-full" />
    </div>
  );
}

/* ===== HELPERS ===== */

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}