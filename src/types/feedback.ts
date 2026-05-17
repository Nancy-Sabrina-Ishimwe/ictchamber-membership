import type { LucideIcon } from 'lucide-react';
import { Frown, Meh, Smile, SmilePlus } from 'lucide-react';

export type ServiceFeedbackRating =
  | 'VERY_SATISFIED'
  | 'SOMEWHAT_SATISFIED'
  | 'NOT_SATISFIED'
  | 'EXTREMELY_NOT_SATISFIED';

export type FeedbackSurveyResponse = {
  id: number;
  requestTitle: string;
  serviceCategory: { id: number; categoryName: string };
  serviceSubtype: { id: number; name: string };
  companyName: string | null;
  deliveryDate: string | null;
  feedbackSubmitted: boolean;
  feedback: {
    rating: ServiceFeedbackRating;
    description: string | null;
    comment: string | null;
    submittedAt: string;
  } | null;
};

export type ServiceFeedbackRecord = {
  requestId: string;
  requestTitle: string;
  companyName: string;
  category: string | null;
  subtype: string | null;
  deliveryDate: string | null;
  rating: ServiceFeedbackRating | null;
  description: string | null;
  comment: string | null;
  submittedAt: string | null;
};

export const FEEDBACK_RATING_OPTIONS: Array<{
  value: ServiceFeedbackRating;
  label: string;
  icon: LucideIcon;
  iconClass: string;
  selectedRing: string;
  selectedBg: string;
}> = [
  {
    value: 'VERY_SATISFIED',
    label: 'Very Satisfied',
    icon: SmilePlus,
    iconClass: 'text-emerald-600',
    selectedRing: 'ring-emerald-500/35',
    selectedBg: 'bg-emerald-50 border-emerald-300',
  },
  {
    value: 'SOMEWHAT_SATISFIED',
    label: 'Somewhat Satisfied',
    icon: Smile,
    iconClass: 'text-[#0F2A56]',
    selectedRing: 'ring-[#0F2A56]/25',
    selectedBg: 'bg-blue-50 border-blue-200',
  },
  {
    value: 'NOT_SATISFIED',
    label: 'Not Satisfied',
    icon: Meh,
    iconClass: 'text-amber-600',
    selectedRing: 'ring-amber-500/35',
    selectedBg: 'bg-amber-50 border-amber-300',
  },
  {
    value: 'EXTREMELY_NOT_SATISFIED',
    label: 'Extremely not Satisfied',
    icon: Frown,
    iconClass: 'text-red-600',
    selectedRing: 'ring-red-500/35',
    selectedBg: 'bg-red-50 border-red-300',
  },
];

export function getFeedbackOption(rating: ServiceFeedbackRating | null | undefined) {
  if (!rating) return null;
  return FEEDBACK_RATING_OPTIONS.find((option) => option.value === rating) ?? null;
}

export function formatFeedbackDate(value: string | null | undefined): string {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed);
}
