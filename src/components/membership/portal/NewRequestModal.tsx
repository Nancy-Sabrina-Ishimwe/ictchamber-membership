import React, { useEffect, useRef, useState } from 'react';
import { usePortalStore } from '../../../store/portalStore';
import { SERVICE_CATEGORIES } from '../../../types/portal';
import { PortalInput, PortalTextarea } from './PortalUI';

const PRIORITY_LEVELS = ['low', 'medium', 'high'] as const;
type Priority = (typeof PRIORITY_LEVELS)[number];

const ModalSelect: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  error?: string;
}> = ({ label, value, onChange, options, placeholder, required, error }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const selected = options.find((opt) => opt.value === value)?.label;

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className={[
            'w-full px-3 py-2.5 rounded-sm border bg-white text-sm text-left',
            'focus:outline-none focus:ring-2 focus:ring-[#EF9F27]/30 focus:border-[#EF9F27]',
            'transition-colors duration-150 flex items-center justify-between',
            error ? 'border-red-300' : 'border-gray-200 hover:border-gray-300',
            selected ? 'text-gray-900' : 'text-gray-400',
          ].join(' ')}
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          <span className="truncate">{selected ?? placeholder ?? 'Select'}</span>
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div className="absolute z-30 mt-1 w-full max-h-56 overflow-y-auto rounded-sm border border-gray-200 bg-white shadow-lg">
            <button
              type="button"
              onClick={() => {
                onChange('');
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 text-sm text-gray-500 hover:bg-gray-50 flex items-center gap-2.5"
            >
              <span className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
              {placeholder ?? 'Select'}
            </button>
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={[
                  'w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2.5',
                  value === opt.value ? 'bg-amber-50 text-gray-900' : 'text-gray-700',
                ].join(' ')}
              >
                <span
                  className={[
                    'w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                    value === opt.value ? 'border-[#EF9F27]' : 'border-gray-300',
                  ].join(' ')}
                >
                  {value === opt.value && <span className="w-2 h-2 rounded-full bg-[#EF9F27]" />}
                </span>
                <span className="block truncate">{opt.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

export const NewRequestModal: React.FC = () => {
  const { setShowNewRequestModal, addRequest } = usePortalStore();

  const [category, setCategory] = useState('');
  const [subtype, setSubtype] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contactMethod, setContactMethod] = useState<'email' | 'phone'>('email');
  const [preferredDate, setPreferredDate] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!category) e.category = 'Please select a category';
    if (!title.trim()) e.title = 'Request title is required';
    if (!description.trim()) e.description = 'Description is required';
    if (!agreed) e.agreed = 'Please agree to the Terms of Service';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));

    const reqId = `REQ-${new Date().getFullYear()}-${String(Math.floor(100 + Math.random() * 900))}`;
    addRequest({
      id: crypto.randomUUID(),
      requestId: reqId,
      title,
      category,
      submittedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'pending',
      assignedOfficer: 'Pending Assignment',
    });

    setSubmitting(false);
    setShowNewRequestModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowNewRequestModal(false)} />

      <div className="relative bg-white rounded-sm shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between p-4 sm:p-6 pb-0">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Submit a Service Request</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Fill out the details below to initiate a new request. Our team will review and assign an officer shortly.</p>
          </div>
          <button onClick={() => setShowNewRequestModal(false)} className="ml-4 p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="p-4 sm:p-6 flex flex-col gap-5">
          {/* Request Details */}
          <div className="bg-gray-50/60 border border-gray-100 rounded-sm p-4 flex flex-col gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-0.5">Request Details</p>
              <p className="text-xs text-gray-500">Provide specific information about the service you need.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ModalSelect
                label="Service Category"
                required
                placeholder="Select category"
                value={category}
                onChange={(value) => { setCategory(value); setErrors((p) => ({ ...p, category: '' })); }}
                options={SERVICE_CATEGORIES.map((c) => ({ value: c, label: c }))}
                error={errors.category}
              />
              <ModalSelect
                label="Service Subtype"
                placeholder="Select subtype"
                value={subtype}
                onChange={setSubtype}
                options={[
                  { value: 'standard', label: 'Standard' },
                  { value: 'urgent', label: 'Urgent' },
                  { value: 'advisory', label: 'Advisory' },
                ]}
              />
            </div>
            <PortalInput
              label="Request Title"
              required
              placeholder="e.g., Request for participation in upcoming tech expo"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: '' })); }}
              error={errors.title}
            />
            <div>
              <PortalTextarea
                label="Detailed Description"
                required
                placeholder="Please describe your needs in detail, including any specific outcomes you expect..."
                value={description}
                onChange={(e) => { setDescription(e.target.value); setErrors((p) => ({ ...p, description: '' })); }}
                rows={4}
                maxLength={1000}
                error={errors.description}
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{description.length} / 1000 characters</p>
            </div>
          </div>

          {/* Logistics */}
          <div className="bg-gray-50/60 border border-gray-100 rounded-sm p-4 flex flex-col gap-4">
            <p className="text-sm font-semibold text-gray-900">Logistics & Preferences</p>

            {/* Contact method */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Preferred Contact Method</label>
              <div className="flex flex-col gap-2">
                {(['email', 'phone'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setContactMethod(m)}
                    className={[
                      'flex items-center gap-2.5 px-3 py-2.5 rounded-sm border-2 text-sm text-left transition-all',
                      contactMethod === m
                        ? 'border-[#EF9F27] bg-amber-50/40 text-gray-900'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300',
                    ].join(' ')}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${contactMethod === m ? 'border-[#EF9F27]' : 'border-gray-300'}`}>
                      {contactMethod === m && <div className="w-2 h-2 rounded-full bg-[#EF9F27]" />}
                    </div>
                    {m === 'email' ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                      </svg>
                    )}
                    {m === 'email' ? 'Email' : 'Phone Call'}
                  </button>
                ))}
              </div>
            </div>

            {/* Date + Priority */}
            <PortalInput
              label="Preferred Date (if applicable)"
              type="date"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              hint="When would you like this service delivered?"
            />

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Priority Level</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {PRIORITY_LEVELS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={[
                      'py-2 rounded-sm border-2 text-sm font-medium capitalize transition-all',
                      priority === p
                        ? 'border-[#EF9F27] bg-amber-50/40 text-gray-900'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300',
                    ].join(' ')}
                  >
                    {priority === p ? (
                      <span className="inline-flex items-center gap-1">
                        {p}
                        <svg className="w-3.5 h-3.5 text-[#EF9F27]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                        </svg>
                      </span>
                    ) : p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Terms */}
          <div>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => { setAgreed(e.target.checked); setErrors((p) => ({ ...p, agreed: '' })); }}
                className="mt-0.5 w-4 h-4 accent-[#EF9F27] flex-shrink-0"
              />
              <span className="text-xs text-gray-500 leading-relaxed">
                I agree to the{' '}
                <a href="#" className="text-[#EF9F27] hover:underline font-medium">Terms of Service</a>
                {' '}and SLA conditions.
              </span>
            </label>
            {errors.agreed && <p className="text-xs text-red-500 mt-1 ml-6">{errors.agreed}</p>}
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t border-gray-100">
            <button
              onClick={() => setShowNewRequestModal(false)}
              className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#EF9F27] hover:bg-[#d98e1e] text-white text-sm font-semibold rounded-sm transition-all disabled:opacity-50 active:scale-[0.98] w-full sm:w-auto"
            >
              {submitting && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              )}
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
