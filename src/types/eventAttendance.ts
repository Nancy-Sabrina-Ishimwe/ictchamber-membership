export type AttendeeType = 'MEMBER' | 'PARTNER' | 'GUEST';

export type AttendanceRecord = {
  id: number;
  companyName: string;
  fullName: string;
  email: string;
  phone: string | null;
  jobTitle: string;
  department: string | null;
  attendeeType: AttendeeType;
  signatureData: string | null;
  signedInAt: string;
};

export type AttendanceEventSummary = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  status: 'Completed' | 'Upcoming';
  attendanceUrl?: string | null;
  attendanceCount?: number;
};

export const ATTENDEE_TYPE_LABELS: Record<AttendeeType, string> = {
  MEMBER: 'Member',
  PARTNER: 'Partner',
  GUEST: 'Guest',
};
