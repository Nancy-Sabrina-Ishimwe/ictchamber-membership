import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, KeyRound, Lock, Mail, ShieldCheck } from 'lucide-react';
import { api } from '../lib/api';
import { APP_LOGO_SRC, ROUTES } from '../constants/app';

const NAVBAR_LOGO_CLASS = 'h-10 w-10 rounded-sm object-contain';
const MOBILE_LOGIN_LOGO_SRC =
  'https://res.cloudinary.com/dc6iwekzx/image/upload/v1778836285/logo_1945919583_1_lwuwo3.png';

type ResetStep = 'request' | 'reset';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<ResetStep>('request');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);

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

  const showMessage = (type: 'success' | 'error', value: string) => {
    setMessageType(type);
    setMessage(value);
  };

  const handleRequestOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setMessageType(null);

    if (!email.trim()) {
      showMessage('error', 'Please enter your email address.');
      return;
    }

    try {
      setLoading(true);
      await api.post('/auth/forgot-password', { email: email.trim() });
      setStep('reset');
      showMessage('success', 'We sent a 6-digit OTP to your email. Enter it below to reset your password.');
    } catch (error) {
      showMessage(
        'error',
        error instanceof Error ? error.message : 'Failed to send reset code. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setMessageType(null);

    if (!email.trim() || !otp.trim() || !newPassword || !confirmPassword) {
      showMessage('error', 'Please complete all fields.');
      return;
    }

    if (!/^\d{6}$/.test(otp.trim())) {
      showMessage('error', 'OTP must be exactly 6 digits.');
      return;
    }

    if (newPassword.length < 8) {
      showMessage('error', 'New password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage('error', 'New password and confirmation do not match.');
      return;
    }

    try {
      setLoading(true);
      await api.post('/auth/reset-password', {
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
      });

      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      showMessage('success', 'Password reset successful. You can now return to login with your new password.');
    } catch (error) {
      showMessage(
        'error',
        error instanceof Error ? error.message : 'Failed to reset password. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email.trim()) {
      showMessage('error', 'Enter your email address first.');
      setStep('request');
      return;
    }

    try {
      setResending(true);
      setMessage(null);
      setMessageType(null);
      await api.post('/auth/forgot-password', { email: email.trim() });
      showMessage('success', 'A new OTP has been sent to your email.');
    } catch (error) {
      showMessage(
        'error',
        error instanceof Error ? error.message : 'Failed to resend OTP. Please try again.',
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex min-h-0 overflow-hidden bg-gray-50">
      <div
        className="relative hidden h-full min-h-0 flex-col justify-between overflow-hidden p-8 lg:flex lg:w-[45%] xl:w-[42%] xl:p-10"
        style={{ background: 'linear-gradient(160deg, #0b1120 0%, #0f1e38 55%, #0b1120 100%)' }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#EF9F27]/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 right-0 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative z-10">
          <img src={APP_LOGO_SRC} alt="ICT Chamber" className={NAVBAR_LOGO_CLASS} />
        </div>

        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <div className="text-center">
            <p className="text-3xl font-black leading-tight text-white">Rwanda ICT Chamber</p>
            <p className="mt-1 text-xl font-bold leading-tight tracking-wide text-[#EF9F27]">
              Secure Account Recovery
            </p>
          </div>
        </div>

        <p className="relative z-10 mt-auto shrink-0 pt-6 text-[11px] text-gray-600">
          © {new Date().getFullYear()} Rwanda ICT Chamber · All rights reserved
        </p>
      </div>

      <div className="flex h-full min-h-0 flex-1 flex-col items-center justify-center overflow-hidden px-4 py-5 sm:px-8 sm:py-6">
        <div className="mb-4 flex shrink-0 items-center gap-3 lg:hidden">
          <img src={MOBILE_LOGIN_LOGO_SRC} alt="ICT Chamber" className="h-10 w-auto object-contain" />
          <div>
            <p className="text-sm font-bold leading-tight text-gray-900">Rwanda ICT Chamber</p>
            <p className="text-xs font-semibold leading-tight text-[#EF9F27]">Membership Portal</p>
          </div>
        </div>

        <div className="w-full max-w-[440px] min-h-0 shrink px-1">
          <Link
            to={ROUTES.LOGIN}
            className="mb-5 inline-flex items-center gap-2 text-xs font-medium text-gray-500 transition hover:text-gray-700"
          >
            <ArrowLeft size={14} />
            Back to login
          </Link>

          <div className="mb-4">
            <h2 className="text-xl font-black text-gray-900 sm:text-2xl">Forgot Password</h2>
            <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
              {step === 'request'
                ? 'Enter your account email and we will send you a one-time reset code.'
                : 'Enter the OTP from your email and choose a new password.'}
            </p>
          </div>

          <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-[#EF9F27]/15 p-2 text-[#EF9F27]">
                {step === 'request' ? <Mail size={16} /> : <ShieldCheck size={16} />}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {step === 'request' ? 'Step 1: Request OTP' : 'Step 2: Reset Password'}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {step === 'request'
                    ? 'We will email a 6-digit OTP to the account you enter below.'
                    : 'Use the OTP exactly as received. It expires after a short time for security.'}
                </p>
              </div>
            </div>
          </div>

          {message ? (
            <div
              className={`mb-4 rounded-lg border px-3 py-2 text-xs ${
                messageType === 'success'
                  ? 'border-green-200 bg-green-50 text-green-700'
                  : 'border-red-200 bg-red-50 text-red-700'
              }`}
            >
              {message}
            </div>
          ) : null}

          {step === 'request' ? (
            <form onSubmit={handleRequestOtp} className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">Email address</label>
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
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#EF9F27] focus:ring-2 focus:ring-[#EF9F27]/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#EF9F27] py-2.5 text-sm font-bold text-black shadow-sm transition hover:bg-[#d98e1e] disabled:opacity-60"
              >
                {loading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                ) : (
                  <>
                    Send OTP <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">Email address</label>
                <div className="relative">
                  <Mail
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#EF9F27] focus:ring-2 focus:ring-[#EF9F27]/20"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">OTP code</label>
                <div className="relative">
                  <KeyRound
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))}
                    className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm tracking-[0.35em] text-gray-900 placeholder:tracking-normal placeholder-gray-400 outline-none transition focus:border-[#EF9F27] focus:ring-2 focus:ring-[#EF9F27]/20"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">New password</label>
                <div className="relative">
                  <Lock
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="password"
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#EF9F27] focus:ring-2 focus:ring-[#EF9F27]/20"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">Confirm new password</label>
                <div className="relative">
                  <Lock
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="password"
                    autoComplete="new-password"
                    placeholder="Re-enter your new password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#EF9F27] focus:ring-2 focus:ring-[#EF9F27]/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#EF9F27] py-2.5 text-sm font-bold text-black shadow-sm transition hover:bg-[#d98e1e] disabled:opacity-60"
              >
                {loading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                ) : (
                  <>
                    Reset Password <ArrowRight size={15} />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setStep('request');
                    setOtp('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setMessage(null);
                    setMessageType(null);
                  }}
                  className="text-xs font-medium text-gray-500 transition hover:text-gray-700"
                >
                  Change email
                </button>
                <button
                  type="button"
                  onClick={() => void handleResendOtp()}
                  disabled={resending}
                  className="text-xs font-medium text-[#EF9F27] transition hover:underline disabled:opacity-60"
                >
                  {resending ? 'Resending...' : 'Resend OTP'}
                </button>
              </div>
            </form>
          )}

          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-[11px] text-gray-400">or</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <p className="text-center text-xs text-gray-500">
            Remembered your password?{' '}
            <Link to={ROUTES.LOGIN} className="font-semibold text-[#EF9F27] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
