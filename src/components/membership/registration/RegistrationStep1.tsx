import React, { useEffect, useRef, useState } from 'react';
import {
  useForm,
  useFieldArray,
  useWatch,
  type FieldErrors,
  type UseFormRegister,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronDown, Search } from 'lucide-react';
import { useRegistrationStore } from '../../../store/registrationStore';
import { companyInfoSchema, keyContactsSchema } from '../../../lib/schemas';
import { Input, Button, Card } from '../ui/ui';
import { getClustersApi, registerApi, type ClusterItem } from '../../../services/authService';

type KeyContactsFormValues = z.infer<typeof keyContactsSchema>;

// ─── Logo Upload ──────────────────────────────────────────────────────────────
const LogoUpload: React.FC<{
  onChange: (file: File | null) => void;
}> = ({ onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    onChange(f);
    if (f) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">Company Logo</label>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={[
          'w-full h-[88px] rounded-sm border-2 border-dashed flex flex-col items-center justify-center gap-1',
          'hover:border-[#EF9F27]/60 hover:bg-amber-50/30 transition-all duration-150',
          preview ? 'border-[#EF9F27]/50 bg-amber-50/20' : 'border-gray-200 bg-gray-50/50',
        ].join(' ')}
      >
        {preview ? (
          <img src={preview} alt="Logo" className="h-12 w-auto object-contain" />
        ) : (
          <>
            <svg className="w-5 h-5 text-[#EF9F27]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <span className="text-xs text-[#EF9F27] font-medium">Upload Logo</span>
          </>
        )}
      </button>
      <p className="text-xs text-gray-400 text-center">Recommended (PNG, JPG)</p>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleChange} />
    </div>
  );
};

// ─── Founder Entry ────────────────────────────────────────────────────────────
interface FounderEntryProps {
  index: number;
  register: UseFormRegister<KeyContactsFormValues>;
  errors: FieldErrors<KeyContactsFormValues>;
  onRemove?: () => void;
  canRemove: boolean;
}

const FounderEntry: React.FC<FounderEntryProps> = ({ index, register, errors, onRemove, canRemove }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fieldErrors = (errors as any)?.founders?.[index];

  return (
    <div className="pt-4 first:pt-0">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-400 tracking-widest uppercase">
          Founder {index + 1}
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-red-400 hover:text-red-600 transition-colors flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
            Remove
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <Input
          label="Full Name"
          placeholder="Founder's full name"
          error={fieldErrors?.fullName?.message}
          {...register(`founders.${index}.fullName`)}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="founder@company.com"
            error={fieldErrors?.email?.message}
            {...register(`founders.${index}.email`)}
          />
          <Input
            label="Phone Number"
            placeholder="+250 700 000 000"
            error={fieldErrors?.phone?.message}
            {...register(`founders.${index}.phone`)}
          />
        </div>
      </div>
    </div>
  );
};

// ─── Cluster Dropdown (API-backed) ────────────────────────────────────────────
const ClusterDropdown: React.FC<{
  clusters: ClusterItem[];
  value?: string;
  onChange: (cluster: ClusterItem) => void;
  error?: string;
}> = ({ clusters, value = '', onChange, error }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const filtered = clusters.filter((c) =>
    c.clusterName.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      <label className="text-sm font-medium text-gray-700">Cluster</label>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={[
          'w-full px-3 py-2.5 rounded-sm border bg-white text-left transition-colors duration-150',
          'flex items-center justify-between',
          open ? 'border-[#EF9F27] ring-2 ring-[#EF9F27]/20' : 'border-gray-200 hover:border-gray-300',
          !value ? 'text-gray-400' : 'text-gray-900',
          error ? 'border-red-400 bg-red-50/20' : '',
        ].join(' ')}
      >
        <span className="text-sm leading-none">{value || 'Select a cluster'}</span>
        <ChevronDown className={['w-4 h-4 text-gray-400 transition-transform', open ? 'rotate-180' : ''].join(' ')} />
      </button>

      {open && (
        <div className="bg-white border border-gray-200 rounded-sm mt-1.5 shadow-sm overflow-hidden z-10 relative">
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search clusters..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-sm border border-gray-200 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#EF9F27]/20 focus:border-[#EF9F27]"
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto py-1">
            {filtered.map((cluster) => {
              const selected = cluster.clusterName === value;
              return (
                <button
                  key={cluster.id}
                  type="button"
                  onClick={() => { onChange(cluster); setOpen(false); setQuery(''); }}
                  className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-slate-50 transition-colors"
                >
                  <span className={['w-5 h-5 rounded-full border-2 flex-shrink-0', selected ? 'border-[#EF9F27] bg-[#EF9F27]/10' : 'border-gray-300'].join(' ')} />
                  <span className="text-sm font-semibold text-gray-700">{cluster.clusterName}</span>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="px-4 py-3 text-sm text-gray-500">No cluster found.</p>
            )}
          </div>
        </div>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

// ─── Step 1 Page ─────────────────────────────────────────────────────────────
export const RegistrationStep1: React.FC = () => {
  const { formData, updateCompanyInfo, updateKeyContacts, setShowTrustSealModal } =
    useRegistrationStore();

  // Cluster state from API
  const [clusters, setClusters] = useState<ClusterItem[]>([]);
  const [selectedCluster, setSelectedCluster] = useState<ClusterItem | null>(null);
  const [clusterError, setClusterError] = useState('');

  // API submission state
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    getClustersApi()
      .then((data) => {
        setClusters(data);
        // Restore previous selection
        if (formData.companyInfo.clusterId) {
          const prev = data.find((c) => c.id === formData.companyInfo.clusterId);
          if (prev) setSelectedCluster(prev);
        }
      })
      .catch(() => {
        // silently fail — user can still type but must pick from list if available
      });
  }, []);

  // Company info form
  const companyForm = useForm({
    resolver: zodResolver(companyInfoSchema),
    defaultValues: {
      officialName: formData.companyInfo.officialName,
      address: formData.companyInfo.address,
      cluster: formData.companyInfo.cluster,
      tinNumber: formData.companyInfo.tinNumber,
      email: formData.companyInfo.email,
    },
  });

  // Key contacts form
  const contactsForm = useForm({
    resolver: zodResolver(keyContactsSchema),
    defaultValues: {
      founders: formData.keyContacts.founders,
      alternateRep: formData.keyContacts.alternateRep,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: contactsForm.control,
    name: 'founders',
  });

  const [logoFile, setLogoFile] = useState<File | null | undefined>(formData.companyInfo.logoFile);
  const clusterValue = useWatch({ control: companyForm.control, name: 'cluster' });

  const handleClusterChange = (cluster: ClusterItem) => {
    setSelectedCluster(cluster);
    setClusterError('');
    companyForm.setValue('cluster', cluster.clusterName, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleSubmit = async () => {
    setApiError('');

    // Validate cluster selection
    let valid = true;
    if (!selectedCluster) {
      setClusterError('Please select a cluster.');
      valid = false;
    }

    const [companyValid, contactsValid] = await Promise.all([
      companyForm.trigger(),
      contactsForm.trigger(),
    ]);

    if (!companyValid || !contactsValid || !valid) return;

    const companyValues = companyForm.getValues();
    const contactsValues = contactsForm.getValues();

    setSubmitting(true);
    try {
      // Register the company — creates an inactive account on the backend
      await registerApi({
        email: companyValues.email,
        role: 'MEMBER',
        companyName: companyValues.officialName,
        address: companyValues.address,
        clusterId: selectedCluster!.id,
        hasSeal: false, // set after TrustSeal modal in step 2
        founders: contactsValues.founders.map(({ fullName, email, phone }) => ({
          fullName,
          email,
          phone,
        })),
        alternateRepresentative: {
          fullName: contactsValues.alternateRep.fullName,
          email: contactsValues.alternateRep.email,
          phone: contactsValues.alternateRep.phone,
          title: contactsValues.alternateRep.role,
        },
        logo: logoFile ?? undefined,
      });

      // Persist form data in store so step 2 can read email / company name
      updateCompanyInfo({
        ...companyValues,
        logoFile,
        clusterId: selectedCluster!.id,
        subclusterId: null,
      });
      updateKeyContacts(contactsValues);

      // Proceed to tier selection / payment
      setShowTrustSealModal(true);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      {/* ── Company Information ────────────────────────────────────────────── */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Company Information</h2>
        <p className="text-gray-500 text-sm">
          Please provide the official details of your organization. This information will be used to establish your membership profile.
        </p>
      </div>

      <Card className="mb-8">
        <div className="mb-5 border-b border-gray-100 pb-4">
          <h3 className="text-base font-semibold text-gray-900">Company Information</h3>
          <p className="text-xs text-gray-500 mt-0.5">Basic information about how your company is publicly represented.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_160px] gap-5">
          {/* Left column */}
          <div className="flex flex-col gap-4">
            <Input
              label="Official Company Name"
              required
              placeholder="Enter your company name"
              error={companyForm.formState.errors.officialName?.message}
              {...companyForm.register('officialName')}
            />
            <Input
              label="Current Business Address"
              placeholder="e.g., KN 5 Rd KG 7 Ave, Building Name, Floor"
              error={companyForm.formState.errors.address?.message}
              {...companyForm.register('address')}
            />
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <input type="hidden" {...companyForm.register('cluster')} />
                <ClusterDropdown
                  clusters={clusters}
                  value={clusterValue}
                  onChange={handleClusterChange}
                  error={clusterError || companyForm.formState.errors.cluster?.message}
                />
              </div>
              <Input
                label="TIN Number"
                placeholder="Enter your company TIN number"
                error={companyForm.formState.errors.tinNumber?.message}
                {...companyForm.register('tinNumber')}
              />
            </div>
            <Input
              label="Email Address"
              type="email"
              placeholder="jane.doe@company.com"
              error={companyForm.formState.errors.email?.message}
              {...companyForm.register('email')}
            />
          </div>

          {/* Logo upload */}
          <LogoUpload onChange={setLogoFile} />
        </div>
      </Card>

      {/* ── Key Contacts ───────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Key Contacts</h2>
        <p className="text-gray-500 text-sm">
          Please provide the contact details for your organization's primary leadership and representatives.
        </p>
      </div>

      {/* Founders */}
      <Card className="mb-5">
        <div className="mb-5 border-b border-gray-100 pb-4">
          <h3 className="text-base font-semibold text-gray-900">Founders / Board Members</h3>
          <p className="text-xs text-gray-500 mt-0.5">List the founders or key board members of the organization.</p>
        </div>

        <div className="divide-y divide-gray-100">
          {fields.map((field, index) => (
            <FounderEntry
              key={field.id}
              index={index}
              register={contactsForm.register}
              errors={contactsForm.formState.errors}
              canRemove={fields.length > 1}
              onRemove={() => remove(index)}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() =>
            append({ id: crypto.randomUUID(), fullName: '', email: '', phone: '' })
          }
          className="mt-4 w-full border-2 border-dashed border-gray-200 hover:border-[#EF9F27]/50 hover:bg-amber-50/20 text-gray-500 hover:text-[#EF9F27] rounded-sm py-3 text-sm font-medium transition-all duration-150 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
          </svg>
          Add another founder
        </button>
      </Card>

      {/* Alternate Representative */}
      <Card className="mb-8">
        <div className="mb-5 border-b border-gray-100 pb-4">
          <h3 className="text-base font-semibold text-gray-900">Alternate Representative</h3>
          <p className="text-xs text-gray-500 mt-0.5">A secondary point of contact for daily operations or if the CEO is unavailable.</p>
        </div>

        <div className="flex flex-col gap-4">
          <Input
            label="Full Name"
            placeholder="e.g., John Smith"
            error={contactsForm.formState.errors.alternateRep?.fullName?.message}
            {...contactsForm.register('alternateRep.fullName')}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="john.smith@company.com"
              error={contactsForm.formState.errors.alternateRep?.email?.message}
              {...contactsForm.register('alternateRep.email')}
            />
            <Input
              label="Phone Number"
              placeholder="+250 700 000 000"
              error={contactsForm.formState.errors.alternateRep?.phone?.message}
              {...contactsForm.register('alternateRep.phone')}
            />
          </div>
          <Input
            label="Role / Title in Company"
            placeholder="e.g., Chief Operations Officer"
            error={contactsForm.formState.errors.alternateRep?.role?.message}
            {...contactsForm.register('alternateRep.role')}
          />
        </div>
      </Card>

      {/* API error */}
      {apiError && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {apiError}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button variant="secondary" disabled={submitting}>Cancel</Button>
        <Button
          variant="primary"
          size="lg"
          loading={submitting}
          onClick={handleSubmit}
          iconRight={
            !submitting ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
              </svg>
            ) : undefined
          }
        >
          {submitting ? 'Registering...' : 'Save & Continue'}
        </Button>
      </div>
    </div>
  );
};
