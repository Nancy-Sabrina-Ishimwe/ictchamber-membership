import {
  ArrowLeft,
  Calendar,
  Clock3,
  Copy,
  Download,
  ExternalLink,
  MapPin,
  QrCode,
  RefreshCw,
  LayoutGrid,
  Search,
  Table2,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../lib/api';
import { ROUTES } from '../constants/app';
import {
  ATTENDEE_TYPE_LABELS,
  type AttendanceEventSummary,
  type AttendanceRecord,
  type AttendeeType,
} from '../types/eventAttendance';

type PickerViewMode = 'table' | 'grid';

export default function EventAttendanceAdminPage() {
  const { eventId } = useParams<{ eventId?: string }>();
  const navigate = useNavigate();

  const [events, setEvents] = useState<AttendanceEventSummary[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerViewMode, setPickerViewMode] = useState<PickerViewMode>('table');

  const loadEvents = useCallback(async () => {
    try {
      setEventsError(null);
      setEventsLoading(true);
      const response = await api.get<{
        data?: Array<{
          id: number;
          title: string;
          eventDate: string;
          eventTime: string;
          location?: string | null;
          status: 'COMPLETED' | 'UPCOMING';
          attendanceUrl?: string | null;
          attendanceCount?: number;
        }>;
      }>('/events');

      setEvents(
        (response.data.data ?? []).map((item) => ({
          id: String(item.id),
          title: item.title,
          date: item.eventDate,
          time: item.eventTime,
          location: item.location?.trim() || 'Virtual Event',
          status: item.status === 'COMPLETED' ? 'Completed' : 'Upcoming',
          attendanceUrl: item.attendanceUrl ?? null,
          attendanceCount: item.attendanceCount ?? 0,
        })),
      );
    } catch (err) {
      setEventsError(err instanceof Error ? err.message : 'Failed to load events.');
      setEvents([]);
    } finally {
      setEventsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  const filteredEvents = useMemo(() => {
    const q = pickerSearch.trim().toLowerCase();
    if (!q) return events;
    return events.filter((e) =>
      [e.title, e.location, e.status].join(' ').toLowerCase().includes(q),
    );
  }, [events, pickerSearch]);

  const selectedSummary = eventId ? events.find((e) => e.id === eventId) : undefined;

  if (eventId) {
    return (
      <AttendanceDashboard
        eventId={eventId}
        eventSummary={selectedSummary}
        onBack={() => navigate(ROUTES.ADMIN_EVENT_ATTENDANCE)}
        onRefreshEvents={loadEvents}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
            <Link to={ROUTES.ADMIN_EVENTS} className="hover:text-[#0F2A56] hover:underline">
              Events
            </Link>
            <span>/</span>
            <span className="font-medium text-gray-900">Attendance</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Event attendance</h1>
          <p className="mt-1 max-w-xl text-sm text-gray-500">
            Manage QR check-in links and review sign-ins with signatures for each chamber event.
          </p>
        </div>
        <Link
          to={ROUTES.ADMIN_EVENTS}
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          <Calendar size={16} />
          All events
        </Link>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={pickerSearch}
              onChange={(e) => setPickerSearch(e.target.value)}
              placeholder="Search events…"
              className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#EF9F27] focus:ring-2 focus:ring-[#EF9F27]/20"
            />
          </div>
          <div className="inline-flex w-full sm:w-auto items-center rounded-lg border border-gray-200 bg-gray-50 p-1">
            <ViewModeButton
              active={pickerViewMode === 'table'}
              icon={<Table2 size={14} />}
              label="Table"
              onClick={() => setPickerViewMode('table')}
            />
            <ViewModeButton
              active={pickerViewMode === 'grid'}
              icon={<LayoutGrid size={14} />}
              label="Grid"
              onClick={() => setPickerViewMode('grid')}
            />
          </div>
        </div>
      </div>

      {eventsLoading ? (
        <p className="text-sm text-gray-500">Loading events…</p>
      ) : eventsError ? (
        <p className="text-sm text-red-600">{eventsError}</p>
      ) : filteredEvents.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 px-6 py-16 text-center">
          <QrCode className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-900">No events found</p>
          <p className="mt-1 text-sm text-gray-500">Create an event first, then return here to set up check-in.</p>
        </div>
      ) : pickerViewMode === 'table' ? (
        <EventsPickerTable
          events={filteredEvents}
          onOpen={(id) => navigate(ROUTES.ADMIN_EVENT_ATTENDANCE_DETAIL(id))}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredEvents.map((event) => (
            <button
              key={event.id}
              type="button"
              onClick={() => navigate(ROUTES.ADMIN_EVENT_ATTENDANCE_DETAIL(event.id))}
              className="group rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-[#EF9F27]/50 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                    event.status === 'Upcoming'
                      ? 'bg-amber-50 text-amber-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {event.status}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#0F2A56]/5 px-2 py-0.5 text-[11px] font-medium text-[#0F2A56]">
                  <Users size={12} />
                  {event.attendanceCount ?? 0}
                </span>
              </div>
              <h2 className="mt-3 text-base font-semibold text-gray-900 group-hover:text-[#0F2A56]">
                {event.title}
              </h2>
              <p className="mt-2 text-xs text-gray-500">
                {formatEventDate(event.date)} · {event.time}
              </p>
              <p className="mt-1 truncate text-xs text-gray-500">{event.location}</p>
              <p className="mt-4 text-xs font-semibold text-[#EF9F27]">Open attendance →</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AttendanceDashboard({
  eventId,
  eventSummary,
  onBack,
  onRefreshEvents,
}: {
  eventId: string;
  eventSummary?: AttendanceEventSummary;
  onBack: () => void;
  onRefreshEvents: () => Promise<void>;
}) {
  const [attendanceUrl, setAttendanceUrl] = useState(eventSummary?.attendanceUrl ?? '');
  const [eventMeta, setEventMeta] = useState<{
    title: string;
    eventDate?: string;
    eventTime?: string;
    location?: string;
  } | null>(eventSummary ? { title: eventSummary.title } : null);
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [tableSearch, setTableSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | AttendeeType>('all');
  const [signaturePreview, setSignaturePreview] = useState<AttendanceRecord | null>(null);

  const loadAttendances = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await api.get<{
        data?: {
          event?: {
            id: number;
            title: string;
            eventDate?: string;
            eventTime?: string;
            location?: string;
            status?: 'UPCOMING' | 'COMPLETED';
            attendanceUrl?: string | null;
          };
          attendances?: AttendanceRecord[];
        };
      }>(`/events/${eventId}/attendances`);

      const payload = response.data.data;
      const ev = payload?.event;
      if (ev?.attendanceUrl) {
        setAttendanceUrl(ev.attendanceUrl);
      }
      if (ev?.title) {
        setEventMeta({
          title: ev.title,
          eventDate: ev.eventDate,
          eventTime: ev.eventTime,
          location: ev.location,
        });
      }
      setAttendances(payload?.attendances ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load attendance.');
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    void loadAttendances();
  }, [loadAttendances]);

  const generateLink = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      const response = await api.post<{ data?: { attendanceUrl?: string } }>(
        `/events/${eventId}/attendance-token`,
      );
      if (response.data.data?.attendanceUrl) {
        setAttendanceUrl(response.data.data.attendanceUrl);
      }
      await loadAttendances();
      await onRefreshEvents();
    } catch (genError) {
      setError(genError instanceof Error ? genError.message : 'Failed to generate link.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyLink = async () => {
    if (!attendanceUrl) return;
    try {
      await navigator.clipboard.writeText(attendanceUrl);
      setCopyMessage('Copied');
      setTimeout(() => setCopyMessage(null), 2000);
    } catch {
      setCopyMessage('Copy failed');
    }
  };

  const filteredRows = useMemo(() => {
    const q = tableSearch.trim().toLowerCase();
    return attendances.filter((row) => {
      if (typeFilter !== 'all' && row.attendeeType !== typeFilter) return false;
      if (!q) return true;
      return [
        row.fullName,
        row.companyName,
        row.email,
        row.jobTitle,
        row.phone ?? '',
        ATTENDEE_TYPE_LABELS[row.attendeeType],
      ]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [attendances, tableSearch, typeFilter]);

  const stats = useMemo(() => {
    const total = attendances.length;
    const members = attendances.filter((a) => a.attendeeType === 'MEMBER').length;
    const partners = attendances.filter((a) => a.attendeeType === 'PARTNER').length;
    const guests = attendances.filter((a) => a.attendeeType === 'GUEST').length;
    return { total, members, partners, guests };
  }, [attendances]);

  const exportCsv = () => {
    const header = [
      'Signed in',
      'Full name',
      'Company',
      'Email',
      'Phone',
      'Job title',
      'Department',
      'Type',
    ];
    const rows = filteredRows.map((r) => [
      formatDateTime(r.signedInAt),
      r.fullName,
      r.companyName,
      r.email,
      r.phone ?? '',
      r.jobTitle,
      r.department ?? '',
      ATTENDEE_TYPE_LABELS[r.attendeeType],
    ]);
    const csv = [header, ...rows]
      .map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${eventId}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const title = eventSummary?.title ?? eventMeta?.title ?? 'Event';
  const displayDate = eventSummary?.date ?? eventMeta?.eventDate;
  const displayTime = eventSummary?.time ?? eventMeta?.eventTime;
  const displayLocation = eventSummary?.location ?? eventMeta?.location;

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-[#0F2A56]"
      >
        <ArrowLeft size={16} />
        All events attendance
      </button>

      <div
        className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm"
        style={{ background: 'linear-gradient(135deg, #0f1e38 0%, #0b1120 100%)' }}
      >
        <div className="p-6 sm:p-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#EF9F27]">
            Attendance dashboard
          </p>
          <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">{title}</h1>
          {displayDate || displayTime || displayLocation ? (
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/85">
              {displayDate ? (
                <li className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-[#EF9F27]" />
                  {formatEventDate(displayDate)}
                </li>
              ) : null}
              {displayTime ? (
                <li className="flex items-center gap-1.5">
                  <Clock3 size={14} className="text-[#EF9F27]" />
                  {displayTime}
                </li>
              ) : null}
              {displayLocation ? (
                <li className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-[#EF9F27]" />
                  {displayLocation}
                </li>
              ) : null}
            </ul>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total sign-ins" value={stats.total} icon={<UserCheck size={18} />} />
        <StatCard label="Members" value={stats.members} />
        <StatCard label="Partners" value={stats.partners} />
        <StatCard label="Guests" value={stats.guests} />
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[320px_1fr]">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <QrCode size={16} className="text-[#EF9F27]" />
            Check-in QR code
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            Display at the venue entrance so attendees can sign in on their phones.
          </p>

          {attendanceUrl ? (
            <div className="mt-5 flex flex-col items-center">
              <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-inner">
                <QRCodeSVG value={attendanceUrl} size={200} level="M" includeMargin />
              </div>
              <p className="mt-3 w-full break-all text-center text-[10px] text-gray-500">{attendanceUrl}</p>
              <div className="mt-4 flex w-full flex-col gap-2">
                <button
                  type="button"
                  onClick={() => void copyLink()}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 py-2 text-xs font-medium text-gray-800 hover:bg-gray-100"
                >
                  <Copy size={14} />
                  {copyMessage ?? 'Copy link'}
                </button>
                <a
                  href={attendanceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 py-2 text-xs font-medium text-gray-800 hover:bg-gray-100"
                >
                  <ExternalLink size={14} />
                  Open sign-in page
                </a>
                <button
                  type="button"
                  onClick={() => void generateLink()}
                  disabled={isGenerating}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0F2A56] py-2 text-xs font-medium text-white hover:bg-[#0c2248] disabled:opacity-50"
                >
                  <RefreshCw size={14} className={isGenerating ? 'animate-spin' : ''} />
                  Regenerate QR link
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => void generateLink()}
              disabled={isGenerating}
              className="mt-5 w-full rounded-lg bg-[#EF9F27] py-3 text-sm font-bold text-black hover:bg-[#d98e1e] disabled:opacity-60"
            >
              {isGenerating ? 'Generating…' : 'Generate QR code'}
            </button>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Sign-in register</h2>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void loadAttendances()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                <RefreshCw size={12} />
                Refresh
              </button>
              <button
                type="button"
                onClick={exportCsv}
                disabled={filteredRows.length === 0}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
              >
                <Download size={12} />
                Export CSV
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder="Search name, company, email…"
                className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#EF9F27] focus:ring-2 focus:ring-[#EF9F27]/20"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'all' | AttendeeType)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#EF9F27] focus:ring-2 focus:ring-[#EF9F27]/20"
            >
              <option value="all">All types</option>
              <option value="MEMBER">Members</option>
              <option value="PARTNER">Partners</option>
              <option value="GUEST">Guests</option>
            </select>
          </div>

          {isLoading ? (
            <p className="p-8 text-center text-sm text-gray-500">Loading sign-ins…</p>
          ) : filteredRows.length === 0 ? (
            <p className="p-8 text-center text-sm text-gray-500">
              {attendances.length === 0
                ? 'No one has signed in yet. Share the QR code at the event.'
                : 'No sign-ins match your filters.'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Signed in</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Company</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Signature</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50/80">
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                        {formatDateTime(row.signedInAt)}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{row.fullName}</td>
                      <td className="px-4 py-3 text-gray-600">{row.companyName}</td>
                      <td className="px-4 py-3 text-gray-600">{row.jobTitle}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700">
                          {ATTENDEE_TYPE_LABELS[row.attendeeType]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        <div>{row.email}</div>
                        {row.phone ? <div className="text-gray-400">{row.phone}</div> : null}
                      </td>
                      <td className="px-4 py-3">
                        {row.signatureData ? (
                          <button
                            type="button"
                            onClick={() => setSignaturePreview(row)}
                            className="rounded-lg border border-gray-200 bg-white p-1 hover:border-[#EF9F27]"
                          >
                            <img
                              src={row.signatureData}
                              alt=""
                              className="h-10 w-20 object-contain"
                            />
                          </button>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {signaturePreview
        ? createPortal(
            <div
              className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4"
              onClick={() => setSignaturePreview(null)}
            >
              <div
                className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-5 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{signaturePreview.fullName}</p>
                    <p className="text-sm text-gray-500">{signaturePreview.companyName}</p>
                    <p className="mt-1 text-xs text-gray-400">
                      {formatDateTime(signaturePreview.signedInAt)}
                    </p>
                  </div>
                  <button type="button" onClick={() => setSignaturePreview(null)} className="text-gray-400">
                    <X size={18} />
                  </button>
                </div>
                {signaturePreview.signatureData ? (
                  <img
                    src={signaturePreview.signatureData}
                    alt=""
                    className="w-full rounded-lg border border-gray-200 bg-white"
                  />
                ) : null}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

function ViewModeButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs transition-colors ${
        active
          ? 'bg-white font-semibold text-gray-900 shadow-sm'
          : 'text-gray-600 hover:text-gray-900'
      }`}
      aria-pressed={active}
    >
      {icon}
      {label}
    </button>
  );
}

function EventsPickerTable({
  events,
  onOpen,
}: {
  events: AttendanceEventSummary[];
  onOpen: (eventId: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-center">Sign-ins</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {events.map((event) => (
              <tr
                key={event.id}
                onClick={() => onOpen(event.id)}
                className="cursor-pointer transition-colors hover:bg-[#EF9F27]/5"
              >
                <td className="px-4 py-3 font-medium text-gray-900">{event.title}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                  {formatEventDate(event.date)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-600">{event.time}</td>
                <td className="max-w-[200px] truncate px-4 py-3 text-gray-600">{event.location}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      event.status === 'Upcoming'
                        ? 'bg-amber-50 text-amber-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {event.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center justify-center gap-1 rounded-full bg-[#0F2A56]/5 px-2.5 py-0.5 text-xs font-semibold text-[#0F2A56]">
                    <Users size={12} />
                    {event.attendanceCount ?? 0}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-xs font-semibold text-[#EF9F27]">Manage →</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        {icon ? <span className="text-[#EF9F27]">{icon}</span> : null}
      </div>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function formatEventDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateTime(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}
