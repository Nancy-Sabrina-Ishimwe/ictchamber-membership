import { type FormEvent, type ReactNode, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Building2, CheckCircle2, Mail, Phone, User } from 'lucide-react';
import { api } from '../lib/api';
import { APP_LOGO_ALT, APP_LOGO_SRC, APP_NAME, ROUTES } from '../constants/app';

type AttendanceEvent = {
  id: number;
  title: string;
  eventDate: string;
  eventTime: string;
  location: string;
  status: 'UPCOMING' | 'COMPLETED';
};

type AttendeeType = 'MEMBER' | 'PARTNER' | 'GUEST';

const ATTENDEE_TYPE_OPTIONS: { value: AttendeeType; label: string }[] = [
  { value: 'MEMBER', label: 'Chamber member company' },
  { value: 'PARTNER', label: 'Partner organization' },
  { value: 'GUEST', label: 'Guest / other' },
];

export default function EventAttendancePage() {
  const { token } = useParams<{ token: string }>();
  const [event, setEvent] = useState<AttendanceEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [companyName, setCompanyName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [attendeeType, setAttendeeType] = useState<AttendeeType>('MEMBER');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Invalid attendance link.');
      setIsLoading(false);
      return;
    }

    const load = async () => {
      try {
        setError(null);
        setIsLoading(true);
        const response = await api.get<{ success: boolean; data: AttendanceEvent }>(
          `/events/attendance/${token}`,
        );
        setEvent(response.data.data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load event.');
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [token]);

  const handleSubmit = async (submitEvent: FormEvent) => {
    submitEvent.preventDefault();
    if (!token) return;

    try {
      setError(null);
      setIsSubmitting(true);
      const response = await api.post<{ message?: string }>(`/events/attendance/${token}`, {
        companyName,
        fullName,
        email,
        phone: phone.trim() || undefined,
        jobTitle,
        department: department.trim() || undefined,
        attendeeType,
        notes: notes.trim() || undefined,
      });
      setSuccessMessage(response.data.message ?? 'Attendance recorded. Thank you!');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to submit attendance.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const eventDateLabel = event?.eventDate
    ? new Intl.DateTimeFormat('en-GB', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).format(new Date(event.eventDate))
    : '';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-lg">
        <div className="mb-8 text-center">
          <img src={APP_LOGO_SRC} alt={APP_LOGO_ALT} className="mx-auto h-14 w-auto object-contain" />
          <p className="mt-3 text-sm font-medium text-slate-600">{APP_NAME}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {isLoading ? (
            <p className="text-center text-sm text-slate-500">Loading event…</p>
          ) : error && !event ? (
            <div className="text-center">
              <p className="text-sm text-red-600">{error}</p>
              <Link to={ROUTES.LOGIN} className="mt-4 inline-block text-sm font-medium text-[#0F2A56] hover:underline">
                Go to portal login
              </Link>
            </div>
          ) : successMessage ? (
            <div className="text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
              <h1 className="mt-4 text-lg font-semibold text-slate-900">You&apos;re checked in</h1>
              <p className="mt-2 text-sm text-slate-600">{successMessage}</p>
              {event ? (
                <p className="mt-4 text-xs text-slate-500">
                  {event.title} · {eventDateLabel} · {event.eventTime}
                </p>
              ) : null}
            </div>
          ) : event ? (
            <>
              <div className="mb-6 border-b border-slate-100 pb-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">Event attendance</p>
                <h1 className="mt-1 text-xl font-bold text-slate-900">{event.title}</h1>
                <p className="mt-2 text-sm text-slate-600">
                  {eventDateLabel} · {event.eventTime}
                </p>
                <p className="text-sm text-slate-600">{event.location}</p>
              </div>

              {error ? (
                <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              ) : null}

              <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
                <Field label="Organization / company name" required>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className={inputClass}
                      placeholder="e.g. Acme Technologies Ltd"
                    />
                  </div>
                </Field>

                <Field label="I am attending as" required>
                  <select
                    value={attendeeType}
                    onChange={(e) => setAttendeeType(e.target.value as AttendeeType)}
                    className={inputClass}
                  >
                    {ATTENDEE_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Your full name" required>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={inputClass}
                      placeholder="First and last name"
                    />
                  </div>
                </Field>

                <Field label="Job title / role" required>
                  <input
                    required
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className={inputClass}
                    placeholder="e.g. CEO, Partnerships Lead"
                  />
                </Field>

                <Field label="Department (optional)">
                  <input
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className={inputClass}
                    placeholder="e.g. Operations"
                  />
                </Field>

                <Field label="Email" required>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClass}
                      placeholder="you@company.com"
                    />
                  </div>
                </Field>

                <Field label="Phone (optional)">
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={inputClass}
                      placeholder="+250 ..."
                    />
                  </div>
                </Field>

                <Field label="Notes (optional)">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className={`${inputClass} resize-none`}
                    placeholder="Dietary needs, accessibility, etc."
                  />
                </Field>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-md bg-[#0F2A56] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0c2248] disabled:opacity-60"
                >
                  {isSubmitting ? 'Submitting…' : 'Sign attendance'}
                </button>
              </form>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

const inputClass =
  'w-full rounded-md border border-slate-200 bg-white py-2.5 pl-3 pr-3 text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/80';

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-700">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </label>
      {children}
    </div>
  );
}
