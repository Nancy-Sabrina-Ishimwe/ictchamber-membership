import { z } from 'zod';

export const companyInfoSchema = z.object({
  officialName: z.string().min(2, 'Company name must be at least 2 characters'),
  address: z.string().min(5, 'Please enter a valid address'),
  cluster: z.string().min(1, 'Please select a cluster'),
  tinNumber: z.string().min(6, 'Please enter a valid TIN number'),
  email: z.string().email('Please enter a valid email address'),
});

export const founderSchema = z.object({
  id: z.string(),
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(10, 'Valid phone number required'),
});

export const keyContactsSchema = z.object({
  founders: z.array(founderSchema).min(1, 'At least one founder is required'),
  alternateRep: z.object({
    fullName: z.string().min(2, 'Full name is required'),
    email: z.string().email('Valid email required'),
    phone: z.string().min(10, 'Valid phone number required'),
    role: z.string().min(2, 'Role is required'),
  }),
});

export const tierPaymentSchema = z.object({
  tier: z.enum(['bronze', 'silver', 'gold', 'platinum'], {
    error: 'Please select a membership tier',
  }),
  period: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  paymentMethod: z.enum(['card', 'mobile_money', 'bank_transfer']),
});

export type CompanyInfoFormValues = z.infer<typeof companyInfoSchema>;
export type KeyContactsFormValues = z.infer<typeof keyContactsSchema>;
export type TierPaymentFormValues = z.infer<typeof tierPaymentSchema>;
