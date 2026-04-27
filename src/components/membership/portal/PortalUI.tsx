import React from 'react';
import type { RequestStatus } from '../../../types/portal';

// ─── Status Badge ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<RequestStatus, { label: string; className: string; dot: string }> = {
  in_progress: {
    label: 'In Progress',
    className: 'bg-blue-50 text-blue-600 border border-blue-100',
    dot: 'bg-blue-400',
  },
  completed: {
    label: 'Completed',
    className: 'bg-green-50 text-green-600 border border-green-100',
    dot: 'bg-green-400',
  },
  closed: {
    label: 'Closed',
    className: 'bg-gray-100 text-gray-500 border border-gray-200',
    dot: 'bg-gray-400',
  },
  pending: {
    label: 'Pending',
    className: 'bg-amber-50 text-amber-600 border border-amber-100',
    dot: 'bg-amber-400',
  },
};

export const StatusBadge: React.FC<{ status: RequestStatus }> = ({ status }) => {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

// ─── Toggle ───────────────────────────────────────────────────────────────────
export const Toggle: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={onChange}
    className={[
      'relative inline-flex w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#EF9F27]/50 flex-shrink-0',
      checked ? 'bg-[#EF9F27]' : 'bg-gray-200',
    ].join(' ')}
  >
    <span
      className={[
        'inline-block w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-200 mt-0.5',
        checked ? 'translate-x-5' : 'translate-x-0.5',
      ].join(' ')}
    />
  </button>
);

// ─── Tier Badge ───────────────────────────────────────────────────────────────
export const TierBadge: React.FC<{ tier: string; size?: 'sm' | 'md' }> = ({ tier, size = 'md' }) => {
  const label = tier.charAt(0).toUpperCase() + tier.slice(1) + ' Member';
  return (
    <span className={[
      'inline-flex items-center rounded-full font-semibold bg-[#EF9F27] text-white',
      size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs',
    ].join(' ')}>
      {label}
    </span>
  );
};

// ─── BenefitBar ───────────────────────────────────────────────────────────────
export const BenefitBar: React.FC<{ label: string; used: number; total: number }> = ({ label, used, total }) => {
  const pct = Math.round((used / total) * 100);
  const isHigh = pct >= 80;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-gray-700">{label}</span>
        <span className="text-sm text-gray-500">
          <span className="font-semibold text-gray-900">{used}</span> / {total}
        </span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${isHigh ? 'bg-amber-400' : 'bg-[#EF9F27]'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

// ─── Avatar ───────────────────────────────────────────────────────────────────
export const Avatar: React.FC<{ initials: string; size?: 'sm' | 'md' | 'lg' }> = ({ initials, size = 'md' }) => {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-base' };
  return (
    <div className={`rounded-full bg-amber-100 flex items-center justify-center font-semibold text-amber-700 flex-shrink-0 ${sizes[size]}`}>
      {initials}
    </div>
  );
};

// ─── Section card with header ─────────────────────────────────────────────────
interface SectionCardProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  icon, title, subtitle, headerRight, children, className = ''
}) => (
  <div className={`bg-white rounded-sm border border-gray-200 overflow-hidden ${className}`}>
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
      <div className="flex items-center gap-2.5">
        {icon && <div className="text-[#EF9F27]">{icon}</div>}
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {headerRight}
    </div>
    <div className="p-6">{children}</div>
  </div>
);

// ─── Portal Input (lighter variant) ──────────────────────────────────────────
interface PortalInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  required?: boolean;
  hint?: string;
}

export const PortalInput = React.forwardRef<HTMLInputElement, PortalInputProps>(
  ({ label, error, required, hint, className = '', ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <input
        ref={ref}
        className={[
          'w-full px-3 py-2.5 rounded-sm border bg-white text-sm text-gray-900 placeholder:text-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-[#EF9F27]/30 focus:border-[#EF9F27]',
          'transition-colors duration-150',
          props.readOnly ? 'bg-gray-50 text-gray-500 cursor-default' : '',
          error ? 'border-red-300' : 'border-gray-200 hover:border-gray-300',
          className,
        ].join(' ')}
        {...props}
      />
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  ),
);
PortalInput.displayName = 'PortalInput';

// ─── PortalTextarea ───────────────────────────────────────────────────────────
interface PortalTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  required?: boolean;
}

export const PortalTextarea = React.forwardRef<HTMLTextAreaElement, PortalTextareaProps>(
  ({ label, error, required, className = '', ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        className={[
          'w-full px-3 py-2.5 rounded-sm border bg-white text-sm text-gray-900 placeholder:text-gray-400 resize-none',
          'focus:outline-none focus:ring-2 focus:ring-[#EF9F27]/30 focus:border-[#EF9F27]',
          'transition-colors duration-150',
          error ? 'border-red-300' : 'border-gray-200 hover:border-gray-300',
          className,
        ].join(' ')}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  ),
);
PortalTextarea.displayName = 'PortalTextarea';

// ─── PortalSelect ─────────────────────────────────────────────────────────────
interface PortalSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  required?: boolean;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const PortalSelect = React.forwardRef<HTMLSelectElement, PortalSelectProps>(
  ({ label, error, required, options, placeholder, className = '', ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={[
            'w-full px-3 py-2.5 rounded-sm border bg-white text-sm appearance-none cursor-pointer',
            'focus:outline-none focus:ring-2 focus:ring-[#EF9F27]/30 focus:border-[#EF9F27]',
            'transition-colors duration-150',
            error ? 'border-red-300' : 'border-gray-200 hover:border-gray-300',
            !props.value ? 'text-gray-400' : 'text-gray-900',
            className,
          ].join(' ')}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
        </svg>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  ),
);
PortalSelect.displayName = 'PortalSelect';
