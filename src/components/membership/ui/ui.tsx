import React from 'react';

// ─── Input ───────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  required?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, required, className = '', ...props }, ref) => (
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
          'w-full px-3 py-2.5 rounded-sm border text-sm text-gray-900 placeholder:text-gray-400 bg-white',
          'focus:outline-none focus:ring-2 focus:ring-[#EF9F27]/40 focus:border-[#EF9F27]',
          'transition-colors duration-150',
          error ? 'border-red-400 bg-red-50/30' : 'border-gray-200 hover:border-gray-300',
          className,
        ].join(' ')}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  ),
);
Input.displayName = 'Input';

// ─── Select ──────────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  required?: boolean;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
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
            'w-full px-3 py-2.5 rounded-sm border text-sm bg-white appearance-none',
            'focus:outline-none focus:ring-2 focus:ring-[#EF9F27]/40 focus:border-[#EF9F27]',
            'transition-colors duration-150 cursor-pointer',
            error ? 'border-red-400 bg-red-50/30' : 'border-gray-200 hover:border-gray-300',
            !props.value ? 'text-gray-400' : 'text-gray-900',
            className,
          ].join(' ')}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <svg
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  ),
);
Select.displayName = 'Select';

// ─── Button ──────────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  iconRight?: React.ReactNode;
  iconLeft?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading,
  iconRight,
  iconLeft,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

  const variants = {
    primary: 'bg-[#EF9F27] hover:bg-[#d98e1e] text-white focus:ring-[#EF9F27]/50 shadow-sm',
    secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300 focus:ring-gray-200',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-600 focus:ring-gray-200',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-sm',
  };

  return (
    <button
      className={[base, variants[variant], sizes[size], className].join(' ')}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      ) : iconLeft}
      {children}
      {!loading && iconRight}
    </button>
  );
};

// ─── Card ─────────────────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-sm border border-gray-100 shadow-sm p-6 ${className}`}>
    {children}
  </div>
);

// ─── SectionHeader ────────────────────────────────────────────────────────────
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, className = '' }) => (
  <div className={`mb-6 ${className}`}>
    <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
    {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
  </div>
);
