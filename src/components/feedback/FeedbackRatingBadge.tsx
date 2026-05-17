import type { ServiceFeedbackRating } from '../../types/feedback';
import { getFeedbackOption } from '../../types/feedback';

type Props = {
  rating: ServiceFeedbackRating;
  size?: 'sm' | 'md';
};

export function FeedbackRatingBadge({ rating, size = 'sm' }: Props) {
  const option = getFeedbackOption(rating);
  if (!option) return null;

  const Icon = option.icon;
  const compact = size === 'sm';

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
        option.selectedBg,
      ].join(' ')}
    >
      <Icon className={compact ? `h-3 w-3 ${option.iconClass}` : `h-3.5 w-3.5 ${option.iconClass}`} strokeWidth={2} />
      <span className="text-gray-800">{option.label}</span>
    </span>
  );
}
