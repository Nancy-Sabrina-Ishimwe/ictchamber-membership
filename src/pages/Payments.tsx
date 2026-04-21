import {
  Wallet,
  Clock,
  XCircle,
  Search,
  Download,
  Calendar,
  Landmark,
  Smartphone,
  CreditCard,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Payment } from "../types/payment";
import { getPayments } from "../services/paymentService";

export default function Payments() {
  const navigate = useNavigate();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  // fallback data
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

  // stats
  const totalCollected = payments
    .filter((p) => p.status === "Paid")
    .reduce((acc, p) => acc + p.amount, 0);

  const pendingAmount = payments
    .filter((p) => p.status === "Pending")
    .reduce((acc, p) => acc + p.amount, 0);

  const failedCount = payments.filter((p) => p.status === "Failed").length;

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">Membership Payments</h2>
          <p className="text-gray-500 text-sm">
            Tracking membership payments
          </p>
        </div>

        <button
          onClick={() => navigate("/renewals")}
          className="bg-yellow-500 px-5 py-2 rounded-md text-sm font-medium"
        >
          View Renewal pending
        </button>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-3 gap-4">

        <StatCard
          icon={<Wallet size={18} />}
          title="Total Collected (YTD)"
          value={`rwf ${formatMoney(totalCollected)}`}
          bg="bg-gray-100"
        />

        <StatCard
          icon={<Clock size={18} />}
          title="Pending"
          value={`rwf ${formatMoney(pendingAmount)}`}
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
      <div className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">

        <button className="flex items-center gap-2 border px-4 py-2 rounded text-sm text-gray-600">
          <Calendar size={16} />
          Pick date range
        </button>

        <div className="flex gap-3">
          <div className="flex items-center border rounded px-3 py-2 w-80">
            <Search size={16} className="text-gray-400" />
            <input
              placeholder="Search company or reference..."
              className="ml-2 outline-none text-sm w-full"
            />
          </div>

          <button className="flex items-center gap-2 border px-4 py-2 rounded text-sm">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">

        <table className="w-full text-sm">

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
              <tr key={p.id} className="border-t hover:bg-gray-50">

                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
                      🏢
                    </div>
                    <div>
                      <p className="font-medium">{p.companyName}</p>
                      <p className="text-xs text-gray-500">{p.tier}</p>
                    </div>
                  </div>
                </td>

                <td className="p-3">{p.period}</td>

                <td className="p-3 font-medium">
                  RWF {formatMoney(p.amount)}
                </td>

                <td className="p-3 text-gray-500">
                  {formatDate(p.datePaid)}
                </td>

                <td className="p-3">
                  <MethodIcon method={p.method} />
                </td>

                <td className="p-3 text-gray-400 text-xs">
                  {p.reference}
                </td>

                <td className="p-3">
                  <Status status={p.status} />
                </td>

              </tr>
            ))}
          </tbody>
        </table>

        {/* FOOTER */}
        <div className="flex justify-between items-center p-4 text-sm text-gray-500">
          <p>Showing 1 to {payments.length} entries</p>

          <div className="flex gap-2">
            <button className="px-3 py-1 border rounded">Previous</button>
            <button className="px-3 py-1 border rounded bg-black text-white">
              Next
            </button>
          </div>
        </div>

        {loading && <p className="p-4 text-gray-500">Loading...</p>}
      </div>
    </div>
  );
}

/* ===== STAT CARD ===== */

type StatProps = {
  icon: React.ReactNode;
  title: string;
  value: string;
  bg: string;
};

function StatCard({ icon, title, value, bg }: StatProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h3 className="text-2xl font-bold mt-2">{value}</h3>
      </div>

      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${bg}`}>
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