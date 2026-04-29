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

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import type { Payment } from "../types/payment";
import { getPaymentCardsAnalytics, getPayments, type PaymentCardsAnalytics } from "../services/paymentService";

const defaultCards: PaymentCardsAnalytics = {
  totalCollectedYtd: 0,
  pendingAmount: 0,
  failedTransactions: 0,
  totalTransactions: 0,
  currency: "RWF",
  year: new Date().getFullYear(),
};

export default function Payments() {
  const navigate = useNavigate();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [cards, setCards] = useState<PaymentCardsAnalytics>(defaultCards);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | Payment["status"]>("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 10;

  useEffect(() => {
    const fetchData = async () => {
      let nextError: string | null = null;
      try {
        setError(null);
        const [paymentsResult, cardsResult] = await Promise.allSettled([
          getPayments(),
          getPaymentCardsAnalytics(),
        ]);

        if (paymentsResult.status === "fulfilled") {
          setPayments(paymentsResult.value);
        } else {
          setPayments([]);
          nextError =
            paymentsResult.reason instanceof Error
              ? paymentsResult.reason.message
              : "Failed to load payments list.";
        }

        if (cardsResult.status === "fulfilled") {
          setCards(cardsResult.value);
        } else {
          setCards(defaultCards);
          if (!nextError) {
            nextError =
              cardsResult.reason instanceof Error
                ? cardsResult.reason.message
                : "Failed to load payment analytics cards.";
          }
        }
      } catch (fetchError) {
        nextError = fetchError instanceof Error ? fetchError.message : "Failed to load payments.";
        setPayments([]);
        setCards(defaultCards);
      } finally {
        setError(nextError);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const derivedCards = useMemo<PaymentCardsAnalytics>(() => {
    const totalCollectedYtd = payments
      .filter((payment) => payment.status === "Paid")
      .reduce((sum, payment) => sum + payment.amount, 0);
    const pendingAmount = payments
      .filter((payment) => payment.status === "Pending")
      .reduce((sum, payment) => sum + payment.amount, 0);
    const failedTransactions = payments.filter((payment) => payment.status === "Failed").length;

    return {
      totalCollectedYtd,
      pendingAmount,
      failedTransactions,
      totalTransactions: payments.length,
      currency: "RWF",
      year: new Date().getFullYear(),
    };
  }, [payments]);

  const displayCards = cards.totalTransactions > 0 ? cards : derivedCards;

  const filteredPayments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;
    if (to) {
      to.setHours(23, 59, 59, 999);
    }

    return payments.filter((payment) => {
      if (statusFilter !== "All" && payment.status !== statusFilter) return false;

      const searchable = `${payment.companyName} ${payment.reference} ${payment.tier}`.toLowerCase();
      if (query && !searchable.includes(query)) return false;

      if (from || to) {
        const paymentDate = new Date(payment.datePaid);
        if (Number.isNaN(paymentDate.getTime())) return false;
        if (from && paymentDate < from) return false;
        if (to && paymentDate > to) return false;
      }

      return true;
    });
  }, [payments, searchQuery, statusFilter, fromDate, toDate]);

  const handleExportPayments = () => {
    const rows = filteredPayments.map((payment) => [
      payment.companyName,
      payment.tier,
      payment.period,
      payment.amount,
      payment.datePaid,
      payment.method,
      payment.reference,
      payment.status,
    ]);
    const csv = [
      ["Company", "Tier", "Period", "Amount", "Date Paid", "Method", "Reference", "Status"].join(","),
      ...rows.map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `membership-payments-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const totalFiltered = filteredPayments.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = totalFiltered === 0 ? 0 : (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalFiltered);
  const paginatedPayments = filteredPayments.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, fromDate, toDate]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      ) : null}

      {/* CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">

        <StatCard
          icon={<Landmark size={18} />}
          title="Total Collected (YTD)"
          value={`${displayCards.currency} ${formatMoney(displayCards.totalCollectedYtd)}`}
          bg="bg-gray-100"
        />

        <StatCard
          icon={<Clock3 size={18} />}
          title="Pending"
          value={`${displayCards.currency} ${formatMoney(displayCards.pendingAmount)}`}
          bg="bg-yellow-100"
        />

        <StatCard
          icon={<XCircle size={18} />}
          title="Failed Transactions"
          value={displayCards.failedTransactions.toString()}
          bg="bg-red-100"
        />

      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-3 sm:p-4 rounded-md border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-[repeat(2,minmax(0,180px))_minmax(0,1fr)_minmax(0,160px)_auto] gap-2 min-w-0">
            <div className="flex items-center gap-2 border border-gray-200 px-3 py-2 rounded text-sm text-gray-600 min-w-0">
              <Calendar size={16} className="shrink-0" />
              <input
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
                className="outline-none bg-transparent w-full min-w-0"
                aria-label="From date"
              />
            </div>
            <div className="flex items-center gap-2 border border-gray-200 px-3 py-2 rounded text-sm text-gray-600 min-w-0">
              <Calendar size={16} className="shrink-0" />
              <input
                type="date"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
                className="outline-none bg-transparent w-full min-w-0"
                aria-label="To date"
              />
            </div>

            <div className="flex items-center border border-gray-200 rounded px-3 py-2 min-w-0">
              <Search size={16} className="text-gray-400 flex-shrink-0" />
              <input
                placeholder="Search company or reference..."
                className="ml-2 outline-none text-sm w-full min-w-0 bg-transparent"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as "All" | Payment["status"])}
              className="w-full border border-gray-200 px-3 py-2 rounded text-sm text-gray-700 bg-white min-w-0"
            >
              <option value="All">All statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>

            <button
              type="button"
              onClick={handleExportPayments}
              className="w-full xl:w-auto flex items-center justify-center gap-2 border border-gray-200 px-4 py-2 rounded text-sm hover:bg-gray-50 transition-colors whitespace-nowrap min-w-[110px]"
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* DATA */}
      <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
        {!loading && totalFiltered === 0 ? (
          <p className="p-4 sm:p-5 text-sm text-gray-500">No payments found.</p>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {paginatedPayments.map((p) => (
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
                  {paginatedPayments.map((p) => (
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
              <p>
                Showing {totalFiltered === 0 ? 0 : startIndex + 1} to {endIndex} of {totalFiltered} entries
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={safePage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button className="px-3 py-1 border border-gray-900 rounded bg-gray-900 text-white">
                  {safePage} / {totalPages}
                </button>
                {Array.from({ length: totalPages }, (_, index) => index + 1)
                  .slice(Math.max(0, safePage - 2), Math.min(totalPages, safePage + 1))
                  .map((pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`px-3 py-1 border rounded transition-colors ${
                        pageNumber === safePage
                          ? "border-gray-900 bg-gray-900 text-white"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  ))}
                <button
                  type="button"
                  disabled={safePage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
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
