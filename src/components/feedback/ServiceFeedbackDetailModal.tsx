import { createPortal } from 'react-dom';
import { useEffect } from 'react';
import { MessageSquareText, X } from 'lucide-react';
import type { ServiceFeedbackRecord } from '../../types/feedback';
import { FeedbackRatingBadge } from './FeedbackRatingBadge';
import { formatFeedbackDate } from '../../types/feedback';

type Props = {
  record: ServiceFeedbackRecord;
  onClose: () => void;
};

export function ServiceFeedbackDetailModal({ record, onClose }: Props) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const hasFeedback = Boolean(record.rating && record.submittedAt);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-md border border-gray-200 bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-[#EF9F27]/15">
              <MessageSquareText className="h-4 w-4 text-[#EF9F27]" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Member feedback</h3>
              <p className="text-xs text-gray-500">{record.requestId}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div className="rounded-sm border border-gray-100 bg-gray-50/80 px-4 py-3">
            <p className="text-sm font-semibold text-gray-900">{record.requestTitle}</p>
            <p className="mt-0.5 text-xs text-gray-500">{record.companyName}</p>
            {record.category ? (
              <p className="mt-1 text-xs text-gray-400">
                {record.category}
                {record.subtype ? ` · ${record.subtype}` : ''}
              </p>
            ) : null}
            {record.deliveryDate ? (
              <p className="mt-1 text-xs text-gray-400">Delivered {formatFeedbackDate(record.deliveryDate)}</p>
            ) : null}
          </div>

          {hasFeedback ? (
            <>
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Satisfaction rating
                </p>
                <FeedbackRatingBadge rating={record.rating!} size="md" />
              </div>
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Submitted
                </p>
                <p className="text-sm text-gray-700">{formatFeedbackDate(record.submittedAt)}</p>
              </div>
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Additional comments
                </p>
                <p className="rounded-sm border border-gray-100 bg-white px-3 py-2.5 text-sm leading-relaxed text-gray-700">
                  {record.comment?.trim() ? record.comment : 'No additional comments provided.'}
                </p>
              </div>
            </>
          ) : (
            <div className="rounded-sm border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center">
              <p className="text-sm font-medium text-gray-700">No feedback yet</p>
              <p className="mt-1 text-xs text-gray-500">
                The member has not submitted feedback for this delivered service.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-gray-100 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
