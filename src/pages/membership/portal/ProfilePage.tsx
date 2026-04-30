import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { PortalLayout } from '../../../components/membership/portal/PortalLayout';
import { PortalInput, PortalTextarea } from '../../../components/membership/portal/PortalUI';
import { usePortalStore } from '../../../store/portalStore';
import type { ContactPerson } from '../../../types/portal';
import { api } from '../../../lib/api';

const ContactRow: React.FC<{
  contact: ContactPerson;
  onEdit: () => void;
  onDelete: () => void;
  deleting?: boolean;
}> = ({ contact, onEdit, onDelete, deleting = false }) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-sm border border-gray-200 bg-white px-4 py-4">
    <div className="flex items-start sm:items-center gap-3 min-w-0">
      <div className="w-10 h-10 rounded-full bg-[#E9E2FA]" />
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-900">{contact.fullName}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
            {contact.email}
          </span>
          <span>•</span>
          <span>{contact.phone}</span>
        </div>
      </div>
    </div>

    <div className="flex items-center justify-between sm:justify-end gap-4">
      <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-[10px] font-medium text-gray-700">
        {contact.role}
      </span>
      <button
        type="button"
        onClick={onEdit}
        className="rounded-sm p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
        </svg>
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={deleting}
        className="rounded-sm p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
        </svg>
      </button>
    </div>
  </div>
);

export const ProfilePage: React.FC = () => {
  const { member, contacts, updateMember, updateContacts } = usePortalStore();

  const [form, setForm] = useState({
    companyName: member.companyName,
    description: member.description,
    website: member.website,
    phone: member.phone,
    address: member.address,
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactPerson | null>(null);
  const [contactSaving, setContactSaving] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [deletingContactId, setDeletingContactId] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setError(null);
        const response = await api.get<{
          success: boolean;
          data: {
            companyName: string;
            address?: string | null;
            email: string;
            tin?: string | null;
            logoUrl?: string | null;
            contacts?: Array<{
              id: number;
              fullName: string;
              email: string;
              phone: string;
              title?: string | null;
              type?: string;
            }>;
          };
        }>('/auth/me');

        const payload = response.data.data;
        setForm((prev) => ({
          ...prev,
          companyName: payload.companyName ?? prev.companyName,
          address: payload.address ?? prev.address,
        }));

        updateMember({
          companyName: payload.companyName ?? member.companyName,
          email: payload.email ?? member.email,
          address: payload.address ?? member.address,
          tinNumber: payload.tin ?? member.tinNumber,
          logoUrl: payload.logoUrl ?? undefined,
        });

        updateContacts(
          (Array.isArray(payload.contacts) ? payload.contacts : []).map((contact) => {
            const names = contact.fullName.trim().split(' ');
            const initials = names.slice(0, 2).map((part) => part[0] ?? '').join('').toUpperCase() || 'NA';
            return {
              id: String(contact.id),
              fullName: contact.fullName,
              email: contact.email,
              phone: contact.phone,
              role: contact.title ?? contact.type ?? 'Contact Person',
              avatarInitials: initials,
            } as ContactPerson;
          }),
        );
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load profile data.');
      }
    };

    void fetchProfile();
  }, []);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      const response = await api.patch<{
        success: boolean;
        data: {
          companyName: string;
          address?: string | null;
          tin?: string | null;
        };
      }>('/auth/me', {
        companyName: form.companyName.trim(),
        address: form.address.trim(),
      });

      const payload = response.data.data;
      updateMember({
        companyName: payload.companyName ?? form.companyName,
        address: payload.address ?? form.address,
        tinNumber: payload.tin ?? member.tinNumber,
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage('Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage('New password and confirmation do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMessage('New password must be at least 8 characters.');
      return;
    }

    try {
      setPasswordMessage(null);
      setPasswordSaving(true);
      await api.post('/auth/change-password', {
        email: member.email,
        oldPassword: currentPassword,
        newPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMessage('Password updated successfully.');
    } catch (changeError) {
      setPasswordMessage(changeError instanceof Error ? changeError.message : 'Failed to update password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleSendVerificationLink = async () => {
    try {
      setSendingVerification(true);
      setPasswordMessage(null);
      // Keep this non-blocking for environments where backend endpoint is not yet wired.
      await Promise.resolve();
      setPasswordMessage(`Verification link sent to ${member.email}.`);
    } catch (verificationError) {
      setPasswordMessage(
        verificationError instanceof Error ? verificationError.message : 'Failed to send verification link.',
      );
    } finally {
      setSendingVerification(false);
    }
  };

  const handleCancelProfileChanges = () => {
    setForm({
      companyName: member.companyName,
      description: member.description,
      website: member.website,
      phone: member.phone,
      address: member.address,
    });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordMessage(null);
    setError(null);
  };

  const handleDeleteContact = async (id: string) => {
    const shouldDelete = window.confirm('Are you sure you want to delete this contact?');
    if (!shouldDelete) return;
    try {
      setError(null);
      setDeletingContactId(id);
      await api.delete(`/auth/me/contacts/${id}`);
      updateContacts(contacts.filter((c) => c.id !== id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete contact.');
    } finally {
      setDeletingContactId(null);
    }
  };

  const openAddContactModal = () => {
    setContactError(null);
    setContactForm({ fullName: '', email: '', phone: '', role: '' });
    setShowAddContactModal(true);
  };

  const openEditContactModal = (contact: ContactPerson) => {
    setContactError(null);
    setEditingContact(contact);
    setContactForm({
      fullName: contact.fullName,
      email: contact.email,
      phone: contact.phone,
      role: contact.role,
    });
  };

  const closeContactModal = () => {
    if (contactSaving) return;
    setShowAddContactModal(false);
    setEditingContact(null);
    setContactError(null);
  };

  const saveContact = async () => {
    const fullName = contactForm.fullName.trim();
    const email = contactForm.email.trim();
    const phone = contactForm.phone.trim();
    const role = contactForm.role.trim() || 'Contact Person';
    if (!fullName || !email || !phone) {
      setContactError('Please fill in full name, email, and phone.');
      return;
    }

    const avatarInitials =
      fullName
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0] ?? '')
        .join('')
        .toUpperCase() || 'NA';

    try {
      setError(null);
      setContactError(null);
      setContactSaving(true);
      if (editingContact) {
        const response = await api.patch<{
          success: boolean;
          data: { id: number };
        }>(`/auth/me/contacts/${editingContact.id}`, {
          fullName,
          email,
          phone,
          title: role,
        });

        updateContacts(
          contacts.map((contact) =>
            contact.id === String(response.data.data.id)
              ? { ...contact, fullName, email, phone, role, avatarInitials }
              : contact,
          ),
        );
      } else {
        const response = await api.post<{
          success: boolean;
          data: { id: number };
        }>('/auth/me/contacts', {
          fullName,
          email,
          phone,
          title: role,
        });

        const newContact: ContactPerson = {
          id: String(response.data.data.id),
          fullName,
          email,
          phone,
          role,
          avatarInitials,
        };
        updateContacts([...contacts, newContact]);
      }

      closeContactModal();
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Failed to save contact.';
      setError(message);
      setContactError(message);
    } finally {
      setContactSaving(false);
    }
  };

  return (
    <PortalLayout title="Profile">
      <div className="mx-auto max-w-[900px]">
        <div className="mb-8">
          <h2 className="text-[22px] font-bold leading-tight text-gray-900">Your company Profile</h2>
          <p className="mt-2.5 text-sm text-gray-400">Manage your organization's public information, contact details, and account settings.</p>
        </div>
        {error ? (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        ) : null}

        <section className="mb-8 overflow-hidden rounded-sm border border-gray-200 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 px-4 sm:px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-5 w-5 items-center justify-center text-[#F4B400]">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Company Information</h3>
                <p className="text-sm text-gray-400">This information will be displayed in the member directory.</p>
              </div>
            </div>
            {/* <div className="text-left sm:text-right">
              <p className="text-xs text-gray-900">Membership ID</p>
              <p className="mt-1 text-xl font-normal leading-none text-gray-900">{member.membershipId}</p>
            </div> */}
          </div>

          <div className="px-4 sm:px-5 py-5">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="flex flex-col items-center gap-2 flex-shrink-0">
                <p className="text-xs font-semibold text-gray-400">Company Logo</p>
                <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-gray-200 bg-gray-50">
                  {member.logoUrl ? (
                    <img
                      src={member.logoUrl}
                      alt={member.companyName ? `${member.companyName} logo` : 'Company logo'}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="px-2 text-center text-[10px] leading-snug text-gray-400">No logo uploaded</span>
                  )}
                </div>
              </div>

              <div className="flex-1 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <PortalInput
                    label="Company Name"
                    required
                    value={form.companyName}
                    onChange={set('companyName')}
                  />
                  <PortalInput
                    label="TIN (Tax Identification Number)"
                    value={member.tinNumber}
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* <div className="mt-5 border-t border-gray-100 pt-5">
              <PortalTextarea
                label="Company Profile & Description"
                value={form.description}
                onChange={set('description')}
                rows={3}
                className="min-h-[100px]"
              />
            </div> */}

             {/* <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <PortalInput label="Website" value={form.website} onChange={set('website')} />
              <PortalInput label="Primary Phone" value={form.phone} onChange={set('phone')} />
            </div>*/}

            <div className="mt-4">
              <PortalInput label="Physical Address" value={form.address} onChange={set('address')} />
            </div>
          </div>
        </section>

        <section className="mb-8 overflow-hidden rounded-sm border border-gray-200 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 px-4 sm:px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-5 w-5 items-center justify-center text-[#F4B400]">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Contact Persons</h3>
                <p className="text-xs text-gray-400">Manage founders, CEOs, and designated representatives.</p>
              </div>
            </div>
            {/* <button
              onClick={openAddContactModal}
              className="flex items-center gap-2 rounded-sm border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-medium text-gray-900 transition-colors hover:border-gray-300"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
              </svg>
              Add Contact
            </button> */}
          </div>

          <div className="space-y-3 px-4 sm:px-5 py-5">
            {contacts.map((contact) => (
              <ContactRow
                key={contact.id}
                contact={contact}
                onEdit={() => openEditContactModal(contact)}
                onDelete={() => void handleDeleteContact(contact.id)}
                deleting={deletingContactId === contact.id}
              />
            ))}
          </div>
        </section>

        <section className="mb-8 overflow-hidden rounded-sm border border-gray-200 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
            <div className="flex h-5 w-5 items-center justify-center text-[#F4B400]">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </div>
              <div>
              <h3 className="text-sm font-semibold text-gray-900">Account & Security</h3>
              <p className="text-xs text-gray-400">Update your login credentials and security preferences.</p>
            </div>
          </div>

          <div className="px-4 sm:px-5 py-5">
            <div>
              <p className="mb-3 text-[10px] font-bold tracking-widest text-gray-400 uppercase">PRIMARY ACCOUNT EMAIL</p>
              <PortalInput label="Email Address" value={member.email} readOnly />
              <div className="mt-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-[11px] text-gray-400">This email is used for portal login and receiving official Chamber communications.</p>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] text-gray-700">
                    <svg className="h-3.5 w-3.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Verified
                  </div>
                  {/* <button
                    type="button"
                    onClick={() => void handleSendVerificationLink()}
                    disabled={sendingVerification}
                    className="flex items-center gap-2 rounded-sm border border-gray-200 px-3.5 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                    {sendingVerification ? 'Sending...' : 'Send Verification Link'}
                  </button> */}
                </div>
              </div>
            </div>

            <div className="mt-5 border-t border-gray-100 pt-5">
              <p className="mb-3 text-[10px] font-bold tracking-widest text-gray-400 uppercase">CHANGE PASSWORD</p>
              <div className="flex flex-col gap-3">
                <PortalInput
                  label="Current Password"
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <PortalInput
                    label="New Password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <PortalInput
                    label="Confirm New Password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <div className="flex justify-start sm:justify-end">
                  <button
                    type="button"
                    onClick={() => void handleChangePassword()}
                    disabled={passwordSaving}
                    className="flex items-center gap-2 rounded-sm border border-gray-200 bg-gray-50 px-3.5 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:border-gray-300 disabled:opacity-60"
                  >
                    <svg className="h-3.5 w-3.5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    </svg>
                    {passwordSaving ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
                {passwordMessage ? (
                  <p
                    className={`text-xs ${
                      passwordMessage.toLowerCase().includes('successfully') ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {passwordMessage}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <div className="mb-4 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3">
          <button
            type="button"
            onClick={handleCancelProfileChanges}
            className="rounded-sm border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-sm bg-[#E5AB00] px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-[#d49e00] disabled:opacity-60 active:scale-[0.98]"
          >
            {saving ? (
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            ) : saved ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
              </svg>
            ) : null}
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>
      {(showAddContactModal || editingContact) ? (
        <ContactModal
          title={editingContact ? 'Edit Contact' : 'Add Contact'}
          form={contactForm}
          onChange={(field, value) => setContactForm((prev) => ({ ...prev, [field]: value }))}
          onClose={closeContactModal}
          onSave={() => void saveContact()}
          saving={contactSaving}
          error={contactError}
          saveLabel={editingContact ? 'Save Changes' : 'Add Contact'}
        />
      ) : null}
    </PortalLayout>
  );
};

const ContactModal: React.FC<{
  title: string;
  form: {
    fullName: string;
    email: string;
    phone: string;
    role: string;
  };
  onChange: (field: 'fullName' | 'email' | 'phone' | 'role', value: string) => void;
  onClose: () => void;
  onSave: () => void;
  saving?: boolean;
  error?: string | null;
  saveLabel: string;
}> = ({ title, form, onChange, onClose, onSave, saving = false, error = null, saveLabel }) => {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const isInvalid = !form.fullName.trim() || !form.email.trim() || !form.phone.trim();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving || isInvalid) return;
    onSave();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-sm border border-gray-200 bg-white shadow-xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <button type="button" className="text-gray-400 hover:text-gray-600" onClick={onClose} disabled={saving}>✕</button>
        </div>
        <form className="space-y-3 p-4" onSubmit={handleSubmit}>
          <PortalInput
            label="Full Name"
            required
            value={form.fullName}
            onChange={(event) => onChange('fullName', event.target.value)}
          />
          <PortalInput
            label="Email"
            required
            value={form.email}
            onChange={(event) => onChange('email', event.target.value)}
          />
          <PortalInput
            label="Phone"
            required
            value={form.phone}
            onChange={(event) => onChange('phone', event.target.value)}
          />
          <PortalInput
            label="Role / Title"
            value={form.role}
            onChange={(event) => onChange('role', event.target.value)}
          />
          {error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
          ) : null}
        </form>
        <div className="flex justify-end gap-2 border-t border-gray-100 px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-sm border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isInvalid || saving}
            className="rounded-sm bg-[#E5AB00] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#d49e00] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Saving...' : saveLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
