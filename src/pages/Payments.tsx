import {
  Clock3,
  XCircle,
  Search,
  Download,
  Calendar,
  Building2,
  Landmark,
  Smartphone,
  CreditCard,
} from "lucide-react";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import type { Payment } from "../types/payment";
import { getPayments } from "../services/paymentService";

/* ✅ MOVE OUTSIDE COMPONENT (FIXES WARNING) */
const fallbackData: Payment[] = [
  {
    id: "1",
    companyName: "MTN Rwanda",
    tier: "Platinum Tier",
    period: "2023-2024",
    amount: 1000000,
    datePaid: "2023-10-15",
    method: "Bank Transfer",
    reference: "TRX-1092",
    status: "Paid",
  },
  {
    id: "2",
    companyName: "Kasha Technologies",
    tier: "Gold Tier",
    period: "2023-2024",
    amount: 100000,
    datePaid: "2023-10-14",
    method: "Mobile Money",
    reference: "TRX-1091",
    status: "Paid",
  },
  {
    id: "3",
    companyName: "Awesomity Lab",
    tier: "Silver Tier",
    period: "2023-2024",
    amount: 300000,
    datePaid: "2023-10-12",
    method: "Credit Card",
    reference: "TRX-1090",
    status: "Pending",
  },
  {
    id: "4",
    companyName: "AC Group",
    tier: "Platinum Tier",
    period: "2023-2024",
    amount: 600000,
    datePaid: "2023-10-10",
    method: "Bank Transfer",
    reference: "TRX-1089",
    status: "Failed",
  },
];

export default function Payments() {
  const navigate = useNavigate();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  /* ✅ CLEAN useEffect (NO WARNING) */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getPayments();
        setPayments(data.length ? data : fallbackData);
      } catch {
        setPayments(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ===== STATS ===== */
  const totalCollected = payments
    .filter((p) => p.status === "Paid")
    .reduce((acc, p) => acc + p.amount, 0);

  const pendingAmount = payments
    .filter((p) => p.status === "Pending")
    .reduce((acc, p) => acc + p.amount, 0);

  const failedCount = payments.filter((p) => p.status === "Failed").length;

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* HEADER */}
      <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-start">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Membership Payments</h2>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            Tracking membership payments
          </p>
        </div>

        <button
          onClick={() => navigate('/admin/renewals')}
          className="w-full md:w-auto bg-yellow-500 hover:bg-yellow-400 transition-colors px-4 sm:px-5 py-2 rounded-md text-sm font-medium"
        >
          View Renewal pending
        </button>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">

        <StatCard
          icon={<Landmark size={18} />}
          title="Total Collected (YTD)"
          value={`RWF ${formatMoney(totalCollected)}`}
          bg="bg-gray-100"
        />

        <StatCard
          icon={<Clock3 size={18} />}
          title="Pending"
          value={`RWF ${formatMoney(pendingAmount)}`}
          bg="bg-yellow-100"
        />

        <StatCard
          icon={<XCircle size={18} />}
          title="Failed Transactions"
          value={failedCount.toString()}
          bg="bg-red-100"
        />

      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-3 sm:p-4 rounded-md border border-gray-200 shadow-sm flex flex-col gap-3 lg:flex-row lg:justify-between lg:items-center">

        <button className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2 border border-gray-200 px-3 sm:px-4 py-2 rounded text-sm text-gray-600 hover:bg-gray-50 transition-colors">
          <Calendar size={16} />
          Pick date range
        </button>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="flex items-center border border-gray-200 rounded px-3 py-2 w-full sm:w-80 lg:w-96">
            <Search size={16} className="text-gray-400 flex-shrink-0" />
            <input
              placeholder="Search company or reference..."
              className="ml-2 outline-none text-sm w-full bg-transparent"
            />
          </div>

          <button className="w-full sm:w-auto flex items-center justify-center gap-2 border border-gray-200 px-4 py-2 rounded text-sm hover:bg-gray-50 transition-colors">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* DATA */}
      <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
        {!loading && payments.length === 0 ? (
          <p className="p-4 sm:p-5 text-sm text-gray-500">No payments found.</p>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {payments.map((p) => (
                <div key={p.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 break-words">{p.companyName}</p>
                      <p className="text-xs text-gray-500 mt-0.5 break-words">{p.tier}</p>
                    </div>
                    <Status status={p.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-gray-400">Period</p>
                      <p className="text-gray-700 mt-0.5">{p.period}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Date Paid</p>
                      <p className="text-gray-700 mt-0.5">{formatDate(p.datePaid)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Amount</p>
                      <p className="text-gray-900 font-medium mt-0.5">RWF {formatMoney(p.amount)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Reference</p>
                      <p className="text-gray-500 mt-0.5 break-all">{p.reference}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <MethodIcon method={p.method} />
                    <span>{p.method}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm table-fixed">
                <colgroup>
                  <col className="w-[26%]" />
                  <col className="w-[11%]" />
                  <col className="w-[13%]" />
                  <col className="w-[12%]" />
                  <col className="w-[14%]" />
                  <col className="w-[12%]" />
                  <col className="w-[12%]" />
                </colgroup>
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="p-3 text-left">Company / Member</th>
                    <th className="p-3 text-left">Period</th>
                    <th className="p-3 text-left">Amount</th>
                    <th className="p-3 text-left">Date Paid</th>
                    <th className="p-3 text-left">Method</th>
                    <th className="p-3 text-left">Reference</th>
                    <th className="p-3 text-left">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">

                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 text-gray-500">
                            <Building2 size={16} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{p.companyName}</p>
                            <p className="text-xs text-gray-500 truncate">{p.tier}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-3 whitespace-nowrap">{p.period}</td>

                      <td className="p-3 font-medium whitespace-nowrap">
                        RWF {formatMoney(p.amount)}
                      </td>

                      <td className="p-3 text-gray-500 whitespace-nowrap">
                        {formatDate(p.datePaid)}
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <MethodIcon method={p.method} />
                          <span className="truncate">{p.method}</span>
                        </div>
                      </td>

                      <td className="p-3 text-gray-400 text-xs">
                        <span className="break-all">{p.reference}</span>
                      </td>

                      <td className="p-3">
                        <Status status={p.status} />
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* FOOTER */}
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 text-xs sm:text-sm text-gray-500 border-t border-gray-100">
              <p>Showing 1 to {payments.length} entries</p>

              <div className="flex gap-2">
                <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 transition-colors">Previous</button>
                <button className="px-3 py-1 border border-gray-900 rounded bg-gray-900 text-white hover:bg-black transition-colors">
                  Next
                </button>
              </div>
            </div>
          </>
        )}

        {loading && <p className="p-4 sm:p-5 text-sm text-gray-500">Loading...</p>}
      </div>
    </div>
  );
}

/* ===== STAT CARD ===== */

type StatProps = {
  icon: ReactNode;
  title: string;
  value: string;
  bg: string;
};

function StatCard({ icon, title, value, bg }: StatProps) {
  return (
    <div className="bg-white border border-gray-200 p-4 sm:p-5 rounded-md shadow-sm flex items-center justify-between gap-3">
      <div>
        <p className="text-gray-500 text-xs sm:text-sm">{title}</p>
        <h3 className="text-xl sm:text-2xl font-bold mt-1.5 sm:mt-2 text-gray-900">{value}</h3>
      </div>

      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-md flex items-center justify-center flex-shrink-0 ${bg}`}>
        {icon}
      </div>
    </div>
  );
}

/* ===== HELPERS ===== */

function formatMoney(amount: number) {
  return amount.toLocaleString();
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function Status({ status }: { status: "Paid" | "Pending" | "Failed" }) {
  const style =
    status === "Paid"
      ? "bg-green-100 text-green-600"
      : status === "Pending"
      ? "bg-yellow-100 text-yellow-600"
      : "bg-red-100 text-red-600";

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${style}`}>
      {status}
    </span>
  );
}

function MethodIcon({ method }: { method: string }) {
  if (method === "Bank Transfer") return <Landmark size={16} />;
  if (method === "Mobile Money") return <Smartphone size={16} />;
  return <CreditCard size={16} />;
}
