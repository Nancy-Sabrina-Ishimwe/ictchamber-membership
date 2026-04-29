import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createPortal } from "react-dom";
import {
  ChevronLeft, Shield, Building2, MapPin, Mail, Phone, Globe,
  FileText, Download, X, CreditCard, MessageSquare, CheckCircle2,
  Bell, FileCheck, TrendingUp, Bold, Italic, AlignLeft, AlignCenter,
  AlignRight, List, Image, Smile, Paperclip, Send, Calendar, Clock,
  RotateCcw, ChevronLeft as ChLeft, ChevronRight, Users, Filter,
} from "lucide-react";
import { api } from "../lib/api";

/* ============================================================
   EMPTY STATE
============================================================ */
const EMPTY_MEMBER = {
  id: "-",
  name: "-",
  status: "Inactive" as const,
  tier: "-",
  category: "-",
  cluster: "-",
  location: "-",
  contact: {
    name: "-",
    title: "-",
    email: "-",
    phone: "-",
    website: "-",
    address: "-",
  },
  registration: {
    tin: "-",
    rdb: "-",
    category: "-",
    memberId: "-",
  },
  documents: [] as Array<{ name: string; size: string; date: string }>,
  membership: {
    validFrom: "-",
    expiresOn: "-",
    daysRemaining: 0,
    renewalNote: "Membership subscription not active.",
  },
  payments: [] as Array<{ invoiceId: string; date: string; description: string; amount: string; status: string }>,
  allPayments: [] as Array<{ invoiceId: string; date: string; description: string; amount: string; status: string }>,
  activity: [] as Array<{ type: string; label: string; description: string; time: string }>,
};

type MemberState = Omit<typeof EMPTY_MEMBER, "status"> & {
  status: "Active" | "Inactive";
};

const activityIconMap: Record<string, React.ReactNode> = {
  payment:  <CreditCard   size={14} />,
  email:    <Mail         size={14} />,
  document: <FileCheck    size={14} />,
  upgrade:  <TrendingUp   size={14} />,
};

const activityColorMap: Record<string, string> = {
  payment:  "bg-green-100  text-green-600",
  email:    "bg-blue-100   text-blue-600",
  document: "bg-purple-100 text-purple-600",
  upgrade:  "bg-yellow-100 text-yellow-600",
};

type MemberProfileApiResponse = {
  success: boolean;
  data: {
    id: number;
    companyName: string;
    email: string;
    active: boolean;
    tin?: string | null;
    address?: string | null;
    logoUrl?: string | null;
    cluster?: { clusterName: string } | null;
    subcluster?: { name: string } | null;
    selectedTier?: { tierName: string } | null;
    contacts?: Array<{
      fullName: string;
      title?: string | null;
      email: string;
      phone: string;
    }>;
    subscriptions?: Array<{
      startDate: string;
      endDate: string;
      tier?: { tierName: string } | null;
    }>;
    membershipPayments?: Array<{
      invoiceNumber: string;
      amount: number;
      currency: string;
      status: string;
      paidAt?: string | null;
      createdAt: string;
      tier?: { tierName: string } | null;
    }>;
    serviceRequests?: Array<{
      status: string;
      updatedAt: string;
      requestTitle: string;
    }>;
  };
};

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

/* ============================================================
   SKELETON
============================================================ */
function SkeletonLine({ w = "full" }: { w?: string }) {
  return <div className={`h-3 bg-gray-200 rounded w-${w} animate-pulse`} />;
}

function SkeletonCard({ rows = 4, tall = false }: { rows?: number; tall?: boolean }) {
  return (
    <div className="rounded-md border border-gray-200 bg-white p-4 sm:p-5 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-32 mb-4" />
      <div className={`space-y-2.5 ${tall ? "min-h-[120px]" : ""}`}>
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonLine key={i} w={["full", "4/5", "3/5", "full", "2/3"][i % 5]} />
        ))}
      </div>
    </div>
  );
}

function MemberProfileSkeleton() {
  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="h-4 bg-gray-200 rounded w-44 animate-pulse" />

      {/* Profile header */}
      <div className="rounded-md border border-gray-200 bg-white p-4 sm:p-5 animate-pulse">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 flex-shrink-0 rounded-full bg-gray-200" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="flex gap-2">
              <div className="h-5 bg-gray-200 rounded w-40" />
              <div className="h-5 bg-gray-200 rounded-full w-16" />
              <div className="h-5 bg-gray-200 rounded w-16" />
            </div>
            <div className="flex gap-4">
              <div className="h-3 bg-gray-200 rounded w-24" />
              <div className="h-3 bg-gray-200 rounded w-28" />
              <div className="h-3 bg-gray-200 rounded w-20" />
            </div>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Left sidebar */}
        <div className="space-y-4">
          <SkeletonCard rows={5} />
          <SkeletonCard rows={4} />
          <SkeletonCard rows={3} />
        </div>
        {/* Right main */}
        <div className="space-y-4 xl:col-span-2">
          <SkeletonCard rows={3} tall />
          <SkeletonCard rows={5} tall />
          <SkeletonCard rows={4} />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   MAIN PAGE
============================================================ */
export default function MemberProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [showMessage,  setShowMessage]  = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showLedger,   setShowLedger]   = useState(false);
  const [member, setMember] = useState<MemberState>(EMPTY_MEMBER);
  const [isLoading, setIsLoading] = useState(!!id);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMemberProfile = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.get<MemberProfileApiResponse>(`/members/${id}`);
        const payload = response.data.data;
        const primaryContact = payload.contacts?.[0];
        const latestSubscription = payload.subscriptions?.[0];
        const daysRemaining = latestSubscription?.endDate
          ? Math.max(
              Math.ceil((new Date(latestSubscription.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
              0,
            )
          : 0;

        const mappedMember: MemberState = {
          ...EMPTY_MEMBER,
          id: String(payload.id),
          name: payload.companyName || EMPTY_MEMBER.name,
          status: payload.active ? ("Active" as const) : ("Inactive" as const),
          tier: payload.selectedTier?.tierName ?? EMPTY_MEMBER.tier,
          category: payload.selectedTier?.tierName ? `${payload.selectedTier.tierName} Member` : EMPTY_MEMBER.category,
          cluster: payload.cluster?.clusterName ?? EMPTY_MEMBER.cluster,
          location: payload.subcluster?.name ?? payload.address ?? EMPTY_MEMBER.location,
          contact: {
            name: primaryContact?.fullName ?? payload.companyName ?? EMPTY_MEMBER.contact.name,
            title: primaryContact?.title ?? EMPTY_MEMBER.contact.title,
            email: primaryContact?.email ?? payload.email ?? EMPTY_MEMBER.contact.email,
            phone: primaryContact?.phone ?? EMPTY_MEMBER.contact.phone,
            website: EMPTY_MEMBER.contact.website,
            address: payload.address ?? EMPTY_MEMBER.contact.address,
          },
          registration: {
            ...EMPTY_MEMBER.registration,
            tin: payload.tin ?? EMPTY_MEMBER.registration.tin,
            category: payload.cluster?.clusterName ?? EMPTY_MEMBER.registration.category,
            memberId: String(payload.id),
          },
          documents: [],
          membership: {
            validFrom: formatDate(latestSubscription?.startDate),
            expiresOn: formatDate(latestSubscription?.endDate),
            daysRemaining,
            renewalNote:
              daysRemaining > 0
                ? `Membership has ${daysRemaining} day(s) remaining.`
                : "Membership subscription not active.",
          },
          payments: (payload.membershipPayments ?? []).slice(0, 3).map((payment) => ({
            invoiceId: payment.invoiceNumber,
            date: formatDate(payment.paidAt ?? payment.createdAt),
            description: `${payment.tier?.tierName ?? "Membership"} payment`,
            amount: payment.amount.toLocaleString(),
            status: payment.status,
          })),
          allPayments: (payload.membershipPayments ?? []).map((payment) => ({
            invoiceId: payment.invoiceNumber,
            date: formatDate(payment.paidAt ?? payment.createdAt),
            description: `${payment.tier?.tierName ?? "Membership"} payment`,
            amount: payment.amount.toLocaleString(),
            status: payment.status,
          })),
          activity: (payload.serviceRequests ?? []).slice(0, 5).map((request) => ({
            type: request.status === "DELIVERED" ? "payment" : "document",
            label: `Service Request ${request.status}`,
            description: request.requestTitle,
            time: formatDateTime(request.updatedAt),
          })),
        };
        setMember(mappedMember);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "Failed to load member profile.");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchMemberProfile();
  }, [id]);

  if (isLoading) return <MemberProfileSkeleton />;

  const progressPct = Math.min(100, Math.round((member.membership.daysRemaining / 365) * 100));

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <button
        type="button"
        onClick={() => navigate("/admin/members")}
        className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800"
      >
        <ChevronLeft size={14} />
        Back to Members
        <span className="text-gray-300">/</span>
        <span className="text-gray-800 font-medium">{member.name}</span>
      </button>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}

      {/* Profile header card */}
      <div className="rounded-md border border-gray-200 bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 flex-shrink-0 rounded-full bg-gray-200" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">{member.name}</h1>
                <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                  <CheckCircle2 size={11} /> {member.status}
                </span>
                <span className="rounded bg-gray-900 px-2 py-0.5 text-xs font-medium text-white">
                  {member.tier}
                </span>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                <span className="inline-flex items-center gap-1">
                  <Shield size={12} className="text-gray-400" />
                  {member.category}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Building2 size={12} className="text-gray-400" />
                  {member.cluster}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin size={12} className="text-gray-400" />
                  {member.location}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowMessage(true)}
            className="inline-flex items-center gap-2 self-start rounded-md bg-yellow-500 px-4 py-2 text-sm font-medium text-black hover:bg-yellow-400"
          >
            <MessageSquare size={14} />
            Message
          </button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* LEFT SIDEBAR */}
        <div className="space-y-4">

          {/* Contact Information */}
          <Card title="Contact Information">
            <p className="font-semibold text-sm text-gray-900">{member.contact.name}</p>
            <p className="text-xs text-gray-500 mb-3">{member.contact.title}</p>
            <div className="space-y-2 text-xs text-gray-700">
              <ContactRow icon={<Mail size={13} />}  value={member.contact.email}   href={`mailto:${member.contact.email}`} />
              <ContactRow icon={<Phone size={13} />} value={member.contact.phone} />
              <ContactRow icon={<Globe size={13} />} value={member.contact.website} href={member.contact.website} />
              <ContactRow icon={<MapPin size={13} />} value={member.contact.address} />
            </div>
          </Card>

          {/* Registration Details */}
          <Card title="Registration Details">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-gray-400">TIN Number</p>
                <p className="font-semibold text-gray-800 mt-0.5">{member.registration.tin}</p>
              </div>
              <div>
                <p className="text-gray-400">RDB Reg. No.</p>
                <p className="font-semibold text-gray-800 mt-0.5">{member.registration.rdb}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-400 mb-1">Business Category</p>
                <span className="rounded-md bg-black-50 px-2 py-1 text-xs font-medium text-black-700">
                  {member.registration.category}
                </span>
              </div>
              <div className="col-span-2">
                <p className="text-gray-400">Member ID</p>
                <p className="font-semibold text-black-600 mt-0.5">{member.registration.memberId}</p>
              </div>
            </div>
          </Card>

          {/* Uploaded Documents */}
          <Card title="Uploaded Documents">
            <div className="space-y-2.5">
              {member.documents.map((doc) => (
                <div key={doc.name} className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded bg-gray-100 text-gray-500">
                    <FileText size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-gray-800">{doc.name}</p>
                    <p className="text-[11px] text-gray-400">{doc.size} · {doc.date}</p>
                  </div>
                  <button type="button" className="text-gray-400 hover:text-gray-700">
                    <Download size={13} />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* RIGHT MAIN */}
        <div className="space-y-4 xl:col-span-2">

          {/* Membership Status */}
          <Card title="Membership Status" subtitle="Current active subscription period details.">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-6 sm:gap-8 text-xs">
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">Valid From</p>
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                    <Calendar size={12} className="text-gray-400" />
                    {member.membership.validFrom}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">Expires On</p>
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                    <Clock size={12} className="text-yellow-500" />
                    {member.membership.expiresOn}
                  </p>
                </div>
              </div>

              <div className="w-full rounded-md border border-gray-200 bg-gray-50 p-3 sm:w-[210px]">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">Days Remaining</span>
                  <span className="text-[30px] font-bold leading-none text-gray-900">{member.membership.daysRemaining}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                  <div className="h-full rounded-full bg-[#0f2a5c]" style={{ width: `${progressPct}%` }} />
                </div>
                <p className="mt-1.5 text-[10px] text-gray-500">{member.membership.renewalNote}</p>
              </div>
            </div>
          </Card>

          {/* Payment History */}
          <Card
            title="Payment History"
            action={
              <button
                type="button"
                onClick={() => setShowLedger(true)}
                className="inline-flex items-center gap-1 text-xs font-medium text-black-600 hover:underline"
              >
                View full ledger <ChevronRight size={13} />
              </button>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-xs">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["INVOICE ID", "DATE", "DESCRIPTION", "AMOUNT", "STATUS", "RECEIPT"].map((h) => (
                      <th key={h} className="py-2 pr-3 text-left text-[10px] font-semibold text-black-500 tracking-wide first:pl-0">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {member.payments.map((p) => (
                    <tr key={p.invoiceId} className="text-gray-700">
                      <td className="py-2.5 pr-3 font-semibold text-gray-900">{p.invoiceId}</td>
                      <td className="py-2.5 pr-3 whitespace-nowrap">{p.date}</td>
                      <td className="py-2.5 pr-3">{p.description}</td>
                      <td className="py-2.5 pr-3 whitespace-nowrap">
                        <span className="text-[11px] text-gray-400">RWF</span>
                        <br />
                        <span className="font-semibold">{p.amount}</span>
                      </td>
                      <td className="py-2.5 pr-3">
                        <span className="rounded-md bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          {p.status}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <button type="button" className="text-gray-400 hover:text-gray-700">
                          <Download size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card title="Recent Activity & Interactions">
            <div className="space-y-3">
              {member.activity.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${activityColorMap[item.type]}`}>
                    {activityIconMap[item.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <p className="text-xs font-semibold text-gray-900">{item.label}</p>
                      <p className="text-[11px] text-gray-400 whitespace-nowrap">{item.time}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Modals */}
      {showMessage  ? <MessageModal  onClose={() => setShowMessage(false)}  onSchedule={() => { setShowMessage(false); setShowSchedule(true); }} /> : null}
      {showSchedule ? <ScheduleModal onClose={() => setShowSchedule(false)} /> : null}
      {showLedger   ? <LedgerModal   onClose={() => setShowLedger(false)} entries={member.allPayments} /> : null}
    </div>
  );
}

/* ============================================================
   SHARED HELPERS
============================================================ */
function Card({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-gray-200 bg-white p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {subtitle ? <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function ContactRow({ icon, value, href }: { icon: React.ReactNode; value: string; href?: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 flex-shrink-0 text-gray-400">{icon}</span>
      {href ? (
        <a href={href} target="_blank" rel="noreferrer" className="break-all text-black-600 hover:underline">{value}</a>
      ) : (
        <span className="text-gray-700">{value}</span>
      )}
    </div>
  );
}

function ModalShell({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[620px] rounded-md bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

/* ============================================================
   MESSAGE MODAL
============================================================ */
function MessageModal({ onClose, onSchedule }: { onClose: () => void; onSchedule: () => void }) {
  const toolbarBtns = [
    { icon: <Bold size={13} />, label: "bold" },
    { icon: <Italic size={13} />, label: "italic" },
    { icon: <AlignLeft size={13} />, label: "left" },
    { icon: <AlignCenter size={13} />, label: "center" },
    { icon: <AlignRight size={13} />, label: "right" },
    { icon: <List size={13} />, label: "list" },
    { icon: <Image size={13} />, label: "image" },
    { icon: <Smile size={13} />, label: "emoji" },
  ];

  return (
    <ModalShell onClose={onClose}>
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <h3 className="text-base font-bold text-gray-900">Message Content</h3>
        <button type="button" onClick={onClose} className="rounded-md p-1 text-gray-500 hover:bg-gray-100">
          <X size={16} />
        </button>
      </div>

      <div className="space-y-3 px-5 py-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Subject Line</label>
          <input
            placeholder="e.g., Important Update from Rwanda ICT Chamber"
            className="mt-1.5 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-yellow-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Message Body</label>
          <div className="mt-1.5 overflow-hidden rounded-md border border-gray-300 focus-within:border-yellow-500">
            <div className="flex flex-wrap gap-0.5 border-b border-gray-200 bg-gray-50 px-2 py-1.5">
              {toolbarBtns.map((btn) => (
                <button key={btn.label} type="button" className="rounded p-1 text-gray-500 hover:bg-gray-200">
                  {btn.icon}
                </button>
              ))}
            </div>
            <textarea
              rows={5}
              placeholder="Write your email content here..."
              className="w-full px-3 py-2 text-sm outline-none resize-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-500">
          <button type="button" className="inline-flex items-center gap-1 hover:text-gray-700">
            <Paperclip size={12} /> Attach Files
          </button>
          <span className="text-gray-300">|</span>
          <span>Max 5MB total</span>
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-4">
        <button type="button" onClick={onClose} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Cancel
        </button>
        <button type="button" onClick={onSchedule} className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          <Bell size={14} /> Schedule
        </button>
        <button type="button" onClick={onClose} className="inline-flex items-center gap-2 rounded-md bg-yellow-500 px-4 py-2 text-sm font-medium text-black hover:bg-yellow-400">
          <Send size={14} /> Send Now
        </button>
      </div>
    </ModalShell>
  );
}

/* ============================================================
   SCHEDULE MODAL
============================================================ */
const DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];
const CALENDAR = [
  [null,null,null,1,2,3,4],
  [5,6,7,8,9,10,11],
  [12,13,14,15,16,17,18],
  [19,20,21,22,23,24,25],
  [26,27,28,29,30,null,null],
];

function ScheduleModal({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState(15);
  const [rangeMode, setRangeMode] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-3 sm:p-5"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[700px] overflow-hidden rounded-md bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between bg-gray-900 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-yellow-500 text-black">
              <Bell size={15} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Schedule Message</h3>
              <p className="text-xs text-gray-400 mt-0.5">Set date, time, and recurrence for your broadcast.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5">
          {/* Left: Date picker */}
          <div className="border-r border-gray-100 p-4 sm:col-span-3">
            {/* Tab toggle */}
            <div className="mb-3 flex gap-2">
              {["Single Date", "Date Range"].map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setRangeMode(label === "Date Range")}
                  className={`rounded-md border px-3 py-1 text-xs font-medium ${
                    (label === "Date Range") === rangeMode
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Month header */}
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">November 2023</p>
              <div className="flex gap-1">
                <button type="button" className="rounded p-1 text-gray-400 hover:bg-gray-100"><ChLeft size={14} /></button>
                <button type="button" className="rounded p-1 text-gray-400 hover:bg-gray-100"><ChevronRight size={14} /></button>
              </div>
            </div>

            {/* Day labels */}
            <div className="mb-1 grid grid-cols-7 text-center">
              {DAYS.map((d) => (
                <div key={d} className="py-1 text-[11px] font-medium text-gray-400">{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            {CALENDAR.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 text-center">
                {week.map((day, di) => (
                  <button
                    key={di}
                    type="button"
                    disabled={!day}
                    onClick={() => day && setSelected(day)}
                    className={`mx-auto my-0.5 flex h-8 w-8 items-center justify-center rounded-full text-xs transition-colors ${
                      !day ? "invisible" :
                      day === selected ? "bg-yellow-500 font-semibold text-black" :
                      day === 12 ? "font-semibold text-yellow-600" :
                      "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            ))}

            {/* Time / Timezone / Repeat */}
            <div className="mt-3 space-y-2">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-700">
                    <Clock size={12} /> Time
                  </label>
                  <input className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-xs outline-none" placeholder="09:00 AM" />
                </div>
                <div className="flex-1">
                  <label className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-700">
                    <Globe size={12} /> Timezone
                  </label>
                  <input className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-xs outline-none" placeholder="CAT (UTC+2)" />
                </div>
              </div>
              <div>
                <label className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-700">
                  <RotateCcw size={12} /> Repeat Options
                </label>
                <input className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-xs outline-none" placeholder="No repeat" />
              </div>
            </div>
          </div>

          {/* Right: Target Audience */}
          <div className="bg-gray-50 p-4 sm:col-span-2">
            <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-gray-700">
              <Users size={13} className="text-yellow-500" /> Target Audience
            </p>

            <div className="rounded-md border border-gray-200 bg-white p-3 text-center">
              <p className="text-xs text-gray-500">Total Recipients</p>
              <p className="mt-0.5 text-3xl font-bold text-gray-900">1,240</p>
              <div className="mt-2 flex justify-center">
                <div className="rounded-full bg-yellow-100 p-2 text-yellow-600">
                  <Users size={16} />
                </div>
              </div>
            </div>

            <div className="mt-3 space-y-1.5">
              <p className="flex items-center gap-1 text-xs font-medium text-gray-600">
                <Filter size={11} /> Applied Filters
              </p>
              {["Status: Active", "Category: Tech", "Region: Kigali"].map((f) => (
                <span key={f} className="mr-1.5 inline-block rounded-full bg-gray-200 px-2 py-0.5 text-[11px] text-gray-700">
                  {f}
                </span>
              ))}
            </div>

            <div className="mt-4 rounded-md border border-black-100 bg-black-50 p-3 text-xs text-black-700">
              Message will be sent on{" "}
              <span className="font-semibold">Nov {selected}, 2023</span> at{" "}
              <span className="font-semibold">09:00 AM (CAT)</span> to{" "}
              <span className="font-semibold">1,240 members</span>.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-4">
          <button type="button" onClick={onClose} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button type="button" onClick={onClose} className="rounded-md bg-yellow-500 px-5 py-2 text-sm font-medium text-black hover:bg-yellow-400">
            Schedule Message
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ============================================================
   PAYMENT LEDGER MODAL
============================================================ */
function LedgerModal({
  onClose,
  entries,
}: {
  onClose: () => void;
  entries: Array<{ invoiceId: string; date: string; description: string; amount: string; status: string }>;
}) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[640px] rounded-md bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h3 className="text-base font-bold text-gray-900">Payment History</h3>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-gray-500 hover:bg-gray-100">
            <X size={16} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-xs">
            <thead>
              <tr className="border-b border-gray-100">
                {["INVOICE ID", "DATE", "DESCRIPTION", "AMOUNT", "STATUS", "RECEIPT"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-black-500 tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {entries.map((p, i) => (
                <tr key={i} className="text-gray-700 hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-gray-900">{p.invoiceId}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{p.date}</td>
                  <td className="px-4 py-3">{p.description}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-[11px] text-gray-400">RWF</span>
                    <br />
                    <span className="font-semibold">{p.amount}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-md bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button type="button" className="text-gray-400 hover:text-gray-700">
                      <Download size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 px-5 py-4">
          <button type="button" onClick={onClose} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            close
          </button>
          <button type="button" className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Download size={14} /> Export All
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
