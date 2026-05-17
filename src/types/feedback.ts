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

export const FEEDBACK_RATING_OPTIONS: Array<{
  value: ServiceFeedbackRating;
  emoji: string;
  label: string;
}> = [
  { value: 'VERY_SATISFIED', emoji: '😄', label: 'Very Satisfied' },
  { value: 'SOMEWHAT_SATISFIED', emoji: '🙂', label: 'Somewhat Satisfied' },
  { value: 'NOT_SATISFIED', emoji: '😐', label: 'Not Satisfied' },
  { value: 'EXTREMELY_NOT_SATISFIED', emoji: '😞', label: 'Extremely not Satisfied' },
];
