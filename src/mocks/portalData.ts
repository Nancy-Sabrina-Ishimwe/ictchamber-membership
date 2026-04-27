import type {
  Member,
  ContactPerson,
  ServiceRequest,
  ActivityItem,
  PaymentRecord,
  BenefitUsage,
} from '../types/portal';

export const mockMember: Member = {
  id: 'mem-001',
  companyName: 'Kigali Tech Solution',
  representedBy: 'Nkurunziza',
  membershipId: 'ICT-2020-045',
  tier: 'gold',
  status: 'active',
  validFrom: 'Oct 24, 2025',
  expiryDate: 'Oct 24, 2026',
  daysToExpiry: 45,
  email: 'admin@techvision.rw',
  phone: '+250 788 123 456',
  website: 'https://techvision.rw',
  address: 'Kigali Heights, 4th Floor, KG 7 Ave, Kigali, Rwanda',
  tinNumber: '102938475',
  description:
    'Leading software development firm specializing in custom enterprise solutions and fintech integrations in East Africa.',
  automatedReminders: true,
};

export const mockContacts: ContactPerson[] = [
  {
    id: 'c-001',
    fullName: 'Jean Claude Nsabimana',
    email: 'jc@techvision.rw',
    phone: '+250 788 000 111',
    role: 'CEO & Founder',
    avatarInitials: 'JN',
  },
  {
    id: 'c-002',
    fullName: 'Alice Mutoni',
    email: 'alice.m@techvision.rw',
    phone: '+250 788 000 222',
    role: 'Operations Manager',
    avatarInitials: 'AM',
  },
];

export const mockRequests: ServiceRequest[] = [
  {
    id: 'r-001',
    requestId: 'REQ-2024-089',
    title: 'B2B Matchmaking with European Tech Firms',
    category: 'B2B Linkages',
    submittedDate: 'May 12, 2024',
    status: 'in_progress',
    assignedOfficer: 'Marketing',
  },
  {
    id: 'r-002',
    requestId: 'REQ-2024-085',
    title: 'Policy Advocacy on Cross-Border Data Flows',
    category: 'Advocacy',
    submittedDate: 'May 8, 2024',
    status: 'in_progress',
    assignedOfficer: 'Marketing',
  },
  {
    id: 'r-003',
    requestId: 'REQ-2024-072',
    title: 'Participation in Transform Africa Summit',
    category: 'Event Participation',
    submittedDate: 'Apr 20, 2024',
    status: 'completed',
    assignedOfficer: 'Communication',
  },
  {
    id: 'r-004',
    requestId: 'REQ-2024-061',
    title: 'Specialized Training: Cloud Architecture',
    category: 'Training',
    submittedDate: 'Apr 5, 2024',
    status: 'completed',
    assignedOfficer: 'Marketing',
  },
  {
    id: 'r-005',
    requestId: 'REQ-2024-092',
    title: 'Market Entry Research - FinTech Sector',
    category: 'Research Support',
    submittedDate: 'May 15, 2024',
    status: 'in_progress',
    assignedOfficer: 'Communication',
  },
];

export const mockActivity: ActivityItem[] = [
  {
    id: 'a-001',
    title: 'Consulting Service Request',
    date: 'Oct 24, 2023',
    status: 'in_progress',
    type: 'request',
  },
  {
    id: 'a-002',
    title: 'Membership Renewal Payment',
    date: 'Oct 15, 2023',
    status: 'completed',
    type: 'payment',
  },
  {
    id: 'a-003',
    title: 'Exhibition Booth',
    date: 'Sep 28, 2023',
    status: 'completed',
    type: 'benefit',
  },
  {
    id: 'a-004',
    title: 'Legal Advisory on IP',
    date: 'Sep 10, 2023',
    status: 'closed',
    type: 'document',
  },
];

export const mockPayments: PaymentRecord[] = [
  {
    id: 'p-001',
    invoiceId: 'INV-2024-001',
    date: 'Oct 24, 2024',
    description: 'Annual Gold Membership Renewal',
    method: 'Credit Card •••• 4242',
    amount: 600000,
    currency: 'RWF',
    status: 'paid',
  },
  {
    id: 'p-002',
    invoiceId: 'INV-2023-001',
    date: 'Oct 24, 2023',
    description: 'Upgrade to Gold Membership',
    method: 'Bank Transfer',
    amount: 600000,
    currency: 'RWF',
    status: 'paid',
  },
  {
    id: 'p-003',
    invoiceId: 'INV-2022-001',
    date: 'Oct 24, 2022',
    description: 'Annual Silver Membership Renewal',
    method: 'Credit Card •••• 1111',
    amount: 300000,
    currency: 'RWF',
    status: 'paid',
  },
  {
    id: 'p-004',
    invoiceId: 'INV-2021-001',
    date: 'Oct 24, 2021',
    description: 'Initial Silver Membership Registration',
    method: 'Credit Card •••• 1111',
    amount: 300000,
    currency: 'RWF',
    status: 'paid',
  },
];

export const mockBenefitUsage: BenefitUsage[] = [
  { label: 'Exhibition Booths', used: 1, total: 3 },
  { label: 'Consultation Hours', used: 4, total: 10 },
  { label: 'Premium Job Postings', used: 8, total: 10 },
];
