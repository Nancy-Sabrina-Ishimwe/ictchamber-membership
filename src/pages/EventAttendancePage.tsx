import { type FormEvent, type ReactNode, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Mail,
  MapPin,
  Phone,
  User,
} from 'lucide-react';
import { api } from '../lib/api';
import { APP_LOGO_ALT, APP_LOGO_DARK_SRC, ROUTES } from '../constants/app';

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

const inputBase =
  'w-full rounded-lg border border-gray-200 bg-gray-50/80 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition ' +
  'hover:border-gray-300 hover:bg-white focus:border-[#EF9F27] focus:bg-white focus:ring-2 focus:ring-[#EF9F27]/20';

const inputWithIcon = `${inputBase} pl-10 pr-4`;

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
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date(event.eventDate))
    : '';

  return (
    <div
      className="min-h-screen px-4 py-8 sm:py-12"
      style={{
        background: 'linear-gradient(165deg, #f8fafc 0%, #eef2f7 45%, #e8edf5 100%)',
      }}
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 right-0 h-64 w-64 rounded-full bg-[#EF9F27]/8 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[#0F2A56]/6 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-md">
        <header className="mb-6 flex flex-col items-center text-center">
          <div className="rounded-2xl border border-white/80 bg-white px-6 py-4 shadow-sm">
            <img
              src={APP_LOGO_DARK_SRC}
              alt={APP_LOGO_ALT}
              className="mx-auto h-12 w-auto max-w-[220px] object-contain sm:h-14"
            />
          </div>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0F2A56]/70">
            Event check-in
          </p>
        </header>

        <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-lg shadow-gray-200/50">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-16">
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#EF9F27]/30 border-t-[#EF9F27]" />
              <p className="text-sm text-gray-500">Loading event details…</p>
            </div>
          ) : error && !event ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-red-600">{error}</p>
              <Link
                to={ROUTES.LOGIN}
                className="mt-5 inline-block text-sm font-semibold text-[#EF9F27] hover:underline"
              >
                Go to portal login
              </Link>
            </div>
          ) : successMessage ? (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" strokeWidth={2} />
              </div>
              <h1 className="mt-5 text-xl font-bold text-gray-900">You&apos;re checked in</h1>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{successMessage}</p>
              {event ? (
                <p className="mt-5 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
                  {event.title} · {eventDateLabel} · {event.eventTime}
                </p>
              ) : null}
            </div>
          ) : event ? (
            <>
              <div
                className="border-b border-gray-100 px-6 py-5"
                style={{
                  background: 'linear-gradient(135deg, #0f1e38 0%, #0b1120 100%)',
                }}
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#EF9F27]">
                  Today&apos;s event
                </p>
                <h1 className="mt-1.5 text-lg font-bold leading-snug text-white">{event.title}</h1>
                <ul className="mt-3 space-y-1.5 text-sm text-white/85">
                  <li className="flex items-center gap-2">
                    <Calendar size={14} className="shrink-0 text-[#EF9F27]" />
                    {eventDateLabel}
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock3 size={14} className="shrink-0 text-[#EF9F27]" />
                    {event.eventTime}
                  </li>
                  <li className="flex items-center gap-2">
                    <MapPin size={14} className="shrink-0 text-[#EF9F27]" />
                    {event.location}
                  </li>
                </ul>
              </div>

              <div className="px-6 py-6 sm:px-7 sm:py-7">
                <p className="mb-5 text-sm text-gray-600">
                  Please complete the form below to register your attendance.
                </p>

                {error ? (
                  <p className="mb-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                    {error}
                  </p>
                ) : null}

                <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
                  <FormSection title="Organization">
                    <Field label="Company / organization name" required>
                      <IconInput
                        icon={<Building2 size={16} strokeWidth={2} />}
                        required
                        value={companyName}
                        onChange={setCompanyName}
                        placeholder="e.g. Acme Technologies Ltd"
                      />
                    </Field>

                    <Field label="I am attending as" required>
                      <div className="relative">
                        <select
                          value={attendeeType}
                          onChange={(e) => setAttendeeType(e.target.value as AttendeeType)}
                          className={`${inputBase} appearance-none pr-10 pl-4`}
                        >
                          {ATTENDEE_TYPE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={16}
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                      </div>
                    </Field>
                  </FormSection>

                  <FormSection title="Your details">
                    <Field label="Full name" required>
                      <IconInput
                        icon={<User size={16} strokeWidth={2} />}
                        required
                        value={fullName}
                        onChange={setFullName}
                        placeholder="First and last name"
                      />
                    </Field>

                    <Field label="Job title / role" required>
                      <input
                        required
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        className={`${inputBase} px-4`}
                        placeholder="e.g. CEO, Partnerships Lead"
                      />
                    </Field>

                    <Field label="Department">
                      <input
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className={`${inputBase} px-4`}
                        placeholder="Optional — e.g. Operations"
                      />
                    </Field>
                  </FormSection>

                  <FormSection title="Contact">
                    <Field label="Email address" required>
                      <IconInput
                        icon={<Mail size={16} strokeWidth={2} />}
                        type="email"
                        required
                        value={email}
                        onChange={setEmail}
                        placeholder="you@company.com"
                      />
                    </Field>

                    <Field label="Phone number">
                      <IconInput
                        icon={<Phone size={16} strokeWidth={2} />}
                        type="tel"
                        value={phone}
                        onChange={setPhone}
                        placeholder="+250 7XX XXX XXX"
                      />
                    </Field>
                  </FormSection>

                  <FormSection title="Additional">
                    <Field label="Notes">
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className={`${inputBase} resize-none px-4 py-3`}
                        placeholder="Dietary needs, accessibility, or other requests (optional)"
                      />
                    </Field>
                  </FormSection>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#EF9F27] py-3.5 text-sm font-bold text-black shadow-sm transition hover:bg-[#d98e1e] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                    ) : (
                      'Sign attendance'
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : null}
        </div>

        <p className="mt-6 text-center text-[11px] text-gray-500">
          Rwanda ICT Chamber · Secure event registration
        </p>
      </div>
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-[#0F2A56]/80">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

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
      <label className="mb-2 block text-xs font-semibold text-gray-700">
        {label}
        {required ? <span className="font-normal text-red-500"> *</span> : null}
      </label>
      {children}
    </div>
  );
}

function IconInput({
  icon,
  value,
  onChange,
  placeholder,
  type = 'text',
  required,
}: {
  icon: ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        {icon}
      </span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputWithIcon}
        placeholder={placeholder}
      />
    </div>
  );
}
