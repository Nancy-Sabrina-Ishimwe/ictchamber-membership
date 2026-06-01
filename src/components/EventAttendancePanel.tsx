import { Copy, QrCode, RefreshCw, Users } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../lib/api';

type AttendanceRecord = {
  id: number;
  companyName: string;
  fullName: string;
  email: string;
  phone: string | null;
  jobTitle: string;
  department: string | null;
  attendeeType: 'MEMBER' | 'PARTNER' | 'GUEST';
  signedInAt: string;
};

type Props = {
  eventId: string;
  initialAttendanceUrl?: string | null;
  initialCount?: number;
};

const TYPE_LABELS: Record<AttendanceRecord['attendeeType'], string> = {
  MEMBER: 'Member',
  PARTNER: 'Partner',
  GUEST: 'Guest',
};

export function EventAttendancePanel({ eventId, initialAttendanceUrl, initialCount = 0 }: Props) {
  const [attendanceUrl, setAttendanceUrl] = useState(initialAttendanceUrl ?? '');
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [count, setCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  const loadAttendances = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await api.get<{
        data?: {
          event?: { attendanceUrl?: string | null };
          attendances?: AttendanceRecord[];
        };
      }>(`/events/${eventId}/attendances`);

      const payload = response.data.data;
      if (payload?.event?.attendanceUrl) {
        setAttendanceUrl(payload.event.attendanceUrl);
      }
      setAttendances(payload?.attendances ?? []);
      setCount(payload?.attendances?.length ?? 0);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load attendance data.');
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
      const response = await api.post<{
        data?: { attendanceUrl?: string };
      }>(`/events/${eventId}/attendance-token`);
      const url = response.data.data?.attendanceUrl;
      if (url) {
        setAttendanceUrl(url);
      }
      await loadAttendances();
    } catch (genError) {
      setError(genError instanceof Error ? genError.message : 'Failed to generate attendance link.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyLink = async () => {
    if (!attendanceUrl) return;
    try {
      await navigator.clipboard.writeText(attendanceUrl);
      setCopyMessage('Link copied');
      setTimeout(() => setCopyMessage(null), 2000);
    } catch {
      setCopyMessage('Could not copy');
    }
  };

  return (
    <div className="space-y-4 border-t border-gray-100 pt-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 flex items-center gap-1.5">
          <QrCode size={14} />
          Attendance check-in
        </p>
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700">
          <Users size={11} />
          {count} signed in
        </span>
      </div>

      {error ? <p className="text-xs text-red-600">{error}</p> : null}

      {attendanceUrl ? (
        <div className="flex flex-col items-center gap-3 rounded-md border border-gray-200 bg-gray-50 p-4">
          <QRCodeSVG value={attendanceUrl} size={160} level="M" includeMargin />
          <p className="text-center text-[11px] text-gray-600 break-all">{attendanceUrl}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => void copyLink()}
              className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
            >
              <Copy size={12} />
              {copyMessage ?? 'Copy link'}
            </button>
            <button
              type="button"
              onClick={() => void generateLink()}
              disabled={isGenerating}
              className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw size={12} className={isGenerating ? 'animate-spin' : ''} />
              New QR link
            </button>
          </div>
          <p className="text-[10px] text-gray-500 text-center max-w-xs">
            Display this QR at the venue. Attendees scan it to open the sign-in form on their phone.
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => void generateLink()}
          disabled={isGenerating}
          className="w-full rounded-md bg-[#0F2A56] py-2 text-xs font-medium text-white hover:bg-[#0c2248] disabled:opacity-50"
        >
          {isGenerating ? 'Generating…' : 'Generate attendance QR code'}
        </button>
      )}

      {isLoading ? (
        <p className="text-xs text-gray-500">Loading sign-ins…</p>
      ) : attendances.length === 0 ? (
        <p className="text-xs text-gray-500">No attendance sign-ins yet.</p>
      ) : (
        <div className="max-h-48 overflow-y-auto rounded-md border border-gray-200">
          <table className="min-w-full text-[11px]">
            <thead className="sticky top-0 bg-gray-50 text-gray-500">
              <tr>
                <th className="px-2 py-1.5 text-left font-semibold">Name</th>
                <th className="px-2 py-1.5 text-left font-semibold">Company</th>
                <th className="px-2 py-1.5 text-left font-semibold">Role</th>
                <th className="px-2 py-1.5 text-left font-semibold">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {attendances.map((row) => (
                <tr key={row.id}>
                  <td className="px-2 py-1.5 text-gray-900">{row.fullName}</td>
                  <td className="px-2 py-1.5 text-gray-600">{row.companyName}</td>
                  <td className="px-2 py-1.5 text-gray-600">{row.jobTitle}</td>
                  <td className="px-2 py-1.5 text-gray-600">{TYPE_LABELS[row.attendeeType]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
