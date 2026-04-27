import { useEffect, useState } from "react";
import {
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock3,
  Building2,
  SlidersHorizontal,
  FileText,
} from "lucide-react";
import type { Renewal } from "../types/renewal";
import { getRenewals } from "../services/renewalService";

export default function Renewals() {
  const [data, setData] = useState<Renewal[]>([]);

  useEffect(() => {
    getRenewals().then(setData);
  }, []);

  const expiringSoon = data.filter((r) => r.daysLeft <= 30).length;
  const projectedRevenueM = 1.4;

  return (
    <div className="space-y-3 sm:space-y-4">

      {/* TOP CARD */}
      <div className="bg-white border border-gray-200 rounded-md shadow-sm p-3 sm:p-4 flex flex-col gap-3 lg:flex-row lg:justify-between lg:items-center">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Renewal Management Hub</h2>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            Automate and track membership retention
          </p>
        </div>

        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-2 sm:gap-3 w-full lg:w-auto">
          <TopStat label="EXPIRING < 30 DAYS" value={expiringSoon.toString()} red />
          <TopStat label="PROJECTED REVENUE" value={`${projectedRevenueM}M`} suffix="RWF" />
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 sm:gap-4">

        {/* LEFT */}
        <div className="xl:col-span-2 bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">

          {/* HEADER */}
          <div className="p-3 sm:p-4 border-b border-gray-100 flex flex-col gap-2.5 lg:flex-row lg:justify-between lg:items-center">
            <div>
              <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2 text-gray-900">
                <Clock3 size={15} className="text-gray-500" />
                Upcoming Expiries
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Memberships expiring within the next 90 days
              </p>
            </div>

            <div className="flex gap-2 w-full lg:w-auto">
              <div className="flex items-center border border-gray-200 px-2.5 py-1.5 rounded-md w-full lg:w-64">
                <Search size={13} className="text-gray-400" />
                <input
                  placeholder="Search members..."
                  className="ml-2 text-xs sm:text-sm outline-none w-full bg-transparent"
                />
              </div>
              <button className="border border-gray-200 px-2.5 rounded-md hover:bg-gray-50 transition-colors">
                <Filter size={14} />
              </button>
            </div>
          </div>

          {/* TABLE HEADER */}
          <div className="hidden md:grid grid-cols-3 text-[11px] font-medium text-gray-500 px-3 sm:px-4 py-2.5 border-b border-gray-100 bg-gray-50/60">
            <p>Member Organization</p>
            <p>Expiry Details</p>
            <p>Automation Status</p>
          </div>

          {/* MOBILE CARDS */}
          <div className="md:hidden divide-y divide-gray-100">
            {data.map((item) => (
              <div key={item.id} className="p-3 space-y-2.5 hover:bg-gray-50/60 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Building2 size={14} className="text-gray-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-xs sm:text-sm text-gray-900 break-words">{item.companyName}</p>
                      <p className="text-xs text-gray-500 break-words">
                        {item.tier} - {item.category}
                      </p>
                    </div>
                  </div>
                  <ExpiryBadge days={item.daysLeft} />
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div>
                    <p className="text-gray-400">Expiry</p>
                    <p className="text-gray-800 font-medium mt-0.5 text-[11px] sm:text-xs">{formatDate(item.expiryDate)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Status</p>
                    <div className="mt-0.5">
                      <AutomationStatus item={item} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP ROWS */}
          <div className="hidden md:block">
            {data.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-3 items-start lg:items-center gap-2.5 px-3 sm:px-4 py-3 border-b border-gray-100 hover:bg-gray-50/60 transition-colors"
              >

                {/* COMPANY */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Building2 size={14} className="text-gray-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-xs sm:text-sm text-gray-900 break-words">{item.companyName}</p>
                    <p className="text-xs text-gray-500 break-words">
                      {item.tier} - {item.category}
                    </p>
                  </div>
                </div>

                {/* EXPIRY */}
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-800">
                    {formatDate(item.expiryDate)}
                  </p>
                  <div className="mt-1.5">
                    <ExpiryBadge days={item.daysLeft} />
                  </div>
                </div>

                {/* STATUS */}
                <AutomationStatus item={item} />
              </div>
            ))}
          </div>

          {/* FOOTER */}
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 text-xs text-gray-500">
            <p>Showing {data.length} expiring members</p>
            <div className="flex gap-2">
              <button className="border border-gray-200 px-3 py-1 rounded-md hover:bg-gray-50 transition-colors">Prev</button>
              <button className="border border-gray-200 px-3 py-1 rounded-md hover:bg-gray-50 transition-colors">Next</button>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-4">

          {/* TRIGGERS */}
          <div className="bg-white border border-gray-200 p-3 sm:p-4 rounded-md shadow-sm">
            <div className="flex justify-between mb-3">
              <h3 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                <SlidersHorizontal size={14} className="text-gray-500" />
                Automated Triggers
              </h3>
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                Active
              </span>
            </div>

            <p className="text-xs sm:text-sm text-gray-500 mb-3">
              System will automatically dispatch the template below based on these active rules.
            </p>

            <Trigger label="3 Months Before Expiry" sub="Email Only" />
            <Trigger label="2 Months Before Expiry" sub="Email + SMS" />
            <Trigger label="1 Month Before Expiry" sub="Email + SMS (Urgent)" />
            <Trigger label="On Expiry Day" sub="Email + SMS" />

            <button className="text-xs sm:text-sm mt-2.5 text-gray-700 hover:text-gray-900 transition-colors">
              + Add Custom Rule
            </button>
          </div>

          {/* TEMPLATE */}
          <div className="bg-white border border-gray-200 p-3 sm:p-4 rounded-md shadow-sm">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2 text-gray-900">
              <FileText size={14} className="text-gray-500" />
              Standard Reminder Template
            </h3>

            <p className="text-xs font-semibold tracking-wide text-gray-500 mb-2">AVAILABLE VARIABLES</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {["[Company Name]", "[Remaining Days]", "[Expiry Date]", "[Tier Level]"].map((tag) => (
                <span key={tag} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                  {tag}
                </span>
              ))}
            </div>

            <textarea
              className="w-full border border-gray-200 rounded-md p-2.5 text-xs sm:text-sm h-40 resize-none"
              defaultValue={`Dear [Company Name],

The ICT Chamber humbly reminds you to renew your membership as it expires in [Remaining Days].

Best regards,
Rwanda ICT Chamber`}
            />

            <div className="flex flex-col sm:flex-row gap-2.5 mt-3">
              <button className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-400 transition-colors px-3.5 py-2 rounded-md text-xs sm:text-sm font-medium">
                Edit Template
              </button>
              <button className="w-full sm:w-auto border border-gray-300 px-3.5 py-2 rounded-md text-xs sm:text-sm hover:bg-gray-50 transition-colors">
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
  suffix?: string;
  red?: boolean;
};

function TopStat({ label, value, suffix, red }: TopStatProps) {
  return (
    <div className="bg-gray-50 border border-gray-200 px-2.5 py-1.5 rounded-md text-xs sm:text-sm">
      <p className="text-[10px] sm:text-xs text-gray-500 font-semibold leading-tight">{label}</p>
      <p className={`font-bold text-base sm:text-lg leading-tight mt-1 ${red ? "text-red-500" : "text-gray-900"}`}>
        {value}
        {suffix ? <span className="text-xs font-semibold text-gray-500 ml-1">{suffix}</span> : null}
      </p>
    </div>
  );
}

function ExpiryBadge({ days }: { days: number }) {
  let style = "bg-green-100 text-green-600";

  if (days < 10) style = "bg-red-100 text-red-600";
  else if (days < 30) style = "bg-yellow-100 text-yellow-600";

  return (
    <span className={`text-[11px] px-2 py-1 rounded-full font-medium ${style}`}>
      {days} days left
    </span>
  );
}

function Trigger({ label, sub }: { label: string; sub: string }) {
  return (
    <div className="flex justify-between items-center border border-gray-100 p-2.5 rounded-md mb-2">
      <div>
        <p className="text-xs sm:text-sm font-medium text-gray-800">{label}</p>
        <p className="text-xs text-gray-500">{sub}</p>
      </div>
      <div className="w-9 h-5 rounded-full bg-slate-800 relative">
        <span className="absolute right-0.5 top-0.5 w-4 h-4 rounded-full bg-white" />
      </div>
    </div>
  );
}

function AutomationStatus({ item }: { item: Renewal }) {
  if (item.status === "urgent") {
    return (
      <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
        <AlertTriangle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
        <span className="break-words">
          {item.lastNotification ?? "Recently"} ({item.channel ?? "Email + SMS"}) (Urgent)
        </span>
      </div>
    );
  }

  if (item.status === "sent") {
    return (
      <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
        <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
        <span className="break-words">
          {item.lastNotification ?? "Recently"} ({item.channel ?? "Email"})
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-500">
      <Clock3 size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
      <span>Not sent yet</span>
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