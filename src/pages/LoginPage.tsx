import { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Eye, EyeOff, Mail, Lock,
  ArrowRight, CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { APP_LOGO_SRC, ROUTES } from '../constants/app';

const NAVBAR_LOGO_CLASS = 'h-10 w-10 rounded-sm object-contain';

const FEATURES = [
  { label: 'Membership Management',  desc: 'Manage member profiles, tiers, and renewals in one place.' },
  { label: 'Payment & Billing',      desc: 'Track invoices, receipts, and payment history seamlessly.' },
  { label: 'Services & Events',      desc: 'Deliver services and organise events for your members.' },
  { label: 'Reports & Analytics',    desc: 'Get insights on member activity, revenue, and engagement.' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // If the user was redirected here, send them back after login
  const from = (location.state as { from?: Location })?.from?.pathname;

  useEffect(() => {
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, []);

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const user = await login(email, password);
      // Redirect to the page they tried to visit, or role-based default
      const destination = from ?? (user.role === 'admin' ? ROUTES.ADMIN : ROUTES.MEMBER_DASHBOARD);
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex min-h-0 overflow-hidden bg-gray-50">

      {/* ── LEFT BRANDED PANEL ────────────────────────────────── */}
      <div
        className="relative hidden h-full min-h-0 flex-col justify-between overflow-hidden p-8 xl:p-10 lg:flex lg:w-[45%] xl:w-[42%]"
        style={{ background: 'linear-gradient(160deg, #0b1120 0%, #0f1e38 55%, #0b1120 100%)' }}
      >
        {/* Dot-grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Glow accents */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#EF9F27]/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 right-0 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <img src={APP_LOGO_SRC} alt="ICT Chamber" className={NAVBAR_LOGO_CLASS} />
            <div>
              <p className="text-white text-sm font-bold leading-tight">Rwanda ICT Chamber</p>
              <p className="text-[#EF9F27] text-xs font-semibold leading-tight tracking-wide">
                Membership Portal
              </p>
            </div>
          </div>

          {/* Hero text */}
          <div className="mt-8 xl:mt-10">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#EF9F27]">
              Welcome back
            </p>
            <h1 className="text-2xl font-black leading-snug text-white xl:text-3xl">
              Powering Rwanda's
              <br />
              <span className="text-[#EF9F27]">Digital Economy</span>
            </h1>
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-gray-400 xl:text-sm">
              The Rwanda ICT Chamber Membership Management System — connecting, empowering, and accelerating the ICT ecosystem.
            </p>
          </div>
        </div>

        {/* Feature list */}
        <div className="relative z-10 mt-6 min-h-0 flex-1 space-y-2.5 overflow-hidden xl:space-y-3">
          {FEATURES.map((f) => (
            <div key={f.label} className="flex items-start gap-2.5">
              <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#EF9F27]/15 xl:h-6 xl:w-6">
                <CheckCircle2 size={13} className="text-[#EF9F27]" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-white xl:text-xs">{f.label}</p>
                <p className="text-[10px] leading-snug text-gray-500 xl:text-[11px] xl:leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom tagline */}
        <p className="relative z-10 mt-auto shrink-0 pt-6 text-[11px] text-gray-600">
          © {new Date().getFullYear()} Rwanda ICT Chamber · All rights reserved
        </p>
      </div>

      {/* ── RIGHT FORM PANEL ───────────────────────────────────── */}
      <div className="flex h-full min-h-0 flex-1 flex-col items-center justify-center overflow-hidden px-4 py-5 sm:px-8 sm:py-6">

        {/* Mobile logo */}
        <div className="mb-4 flex shrink-0 items-center gap-3 lg:hidden">
          <img src={APP_LOGO_SRC} alt="ICT Chamber" className={NAVBAR_LOGO_CLASS} />
          <div>
            <p className="text-sm font-bold leading-tight text-gray-900">Rwanda ICT Chamber</p>
            <p className="text-xs font-semibold leading-tight text-[#EF9F27]">Membership Portal</p>
          </div>
        </div>

        <div className="w-full max-w-[420px] min-h-0 shrink px-1">

          {/* Heading */}
          <div className="mb-4">
            <h2 className="text-xl font-black text-gray-900 sm:text-2xl">Sign in</h2>
            <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
              Enter your credentials to access your account.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                Email address
              </label>
              <div className="relative">
                <Mail
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#EF9F27] focus:ring-2 focus:ring-[#EF9F27]/20"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <label className="text-xs font-semibold text-gray-700">Password</label>
                <Link
                  to={ROUTES.FORGOT_PASSWORD}
                  className="shrink-0 text-xs font-medium text-[#EF9F27] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock
                  size={14}
                  strokeWidth={2}
                  className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400"
                  aria-hidden
                />
                <input
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-10 text-sm leading-normal text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#EF9F27] focus:ring-2 focus:ring-[#EF9F27]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Toggle password visibility"
                >
                  {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label className="flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 accent-[#EF9F27]"
              />
              <span className="text-xs text-gray-600">Keep me signed in</span>
            </label>

            {/* Error */}
            {error ? (
              <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600">
                {error}
              </p>
            ) : null}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#EF9F27] py-2.5 text-sm font-bold text-black shadow-sm transition hover:bg-[#d98e1e] disabled:opacity-60"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
              ) : (
                <>
                  Sign In <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-[11px] text-gray-400">or</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* Register link */}
          <p className="text-center text-xs text-gray-500">
            Not a member yet?{' '}
            <Link
              to={ROUTES.MEMBER_REGISTER}
              className="font-semibold text-[#EF9F27] hover:underline"
            >
              Apply for membership
            </Link>
          </p>

          {/* Demo hint */}
          <div className="mt-3 rounded-lg border border-dashed border-gray-200 bg-white px-3 py-2.5 sm:px-4">
            <p className="text-[10px] font-semibold text-gray-500 sm:text-[11px]">Demo credentials</p>
            <p className="mt-1 text-[10px] text-gray-400 sm:text-[11px]">
              Use the seeded superadmin account or any member account activated via the registration flow.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
