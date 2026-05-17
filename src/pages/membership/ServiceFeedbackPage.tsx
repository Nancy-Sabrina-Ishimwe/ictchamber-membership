import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api';
import { APP_LOGO_ALT, APP_LOGO_SRC, ROUTES } from '../../constants/app';
import {
  FEEDBACK_RATING_OPTIONS,
  type FeedbackSurveyResponse,
  type ServiceFeedbackRating,
} from '../../types/feedback';

export const ServiceFeedbackPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [survey, setSurvey] = useState<FeedbackSurveyResponse | null>(null);
  const [selectedRating, setSelectedRating] = useState<ServiceFeedbackRating | null>(null);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!id) {
      setError('Invalid feedback link.');
      setIsLoading(false);
      return;
    }

    const loadSurvey = async () => {
      try {
        setError(null);
        setIsLoading(true);
        const response = await api.get<{ success: boolean; data: FeedbackSurveyResponse }>(
          `/service-requests/${id}/feedback`,
        );
        const data = response.data.data;
        setSurvey(data);
        if (data.feedbackSubmitted && data.feedback) {
          setSelectedRating(data.feedback.rating);
          setComment(data.feedback.comment ?? '');
          setSubmitted(true);
        }
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load feedback survey.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadSurvey();
  }, [id]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!id || !selectedRating) {
      setError('Please select how satisfied you were with the service.');
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);
      await api.post(`/service-requests/${id}/feedback`, {
        feedbackRating: selectedRating,
        feedbackComment: comment.trim() || undefined,
      });
      setSubmitted(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to submit feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deliveryLabel = survey?.deliveryDate
    ? new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(new Date(survey.deliveryDate))
    : null;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-4 sm:px-6">
          <img src={APP_LOGO_SRC} alt={APP_LOGO_ALT} className="h-9 w-9 rounded-sm object-contain" />
          <div>
            <p className="text-sm font-bold text-gray-900">Rwanda ICT Chamber</p>
            <p className="text-xs font-medium text-[#EF9F27]">Service feedback</p>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-8 sm:px-6">
        <div className="mx-auto w-full max-w-xl">
          {isLoading ? (
            <div className="rounded-sm border border-gray-200 bg-white px-6 py-16 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#EF9F27]/20 border-t-[#EF9F27]" />
              <p className="mt-4 text-sm text-gray-500">Loading survey…</p>
            </div>
          ) : error && !survey ? (
            <div className="rounded-sm border border-red-200 bg-red-50 px-5 py-6 text-center">
              <p className="text-sm text-red-700">{error}</p>
              <Link
                to={ROUTES.MEMBER_DASHBOARD}
                className="mt-4 inline-block text-sm font-semibold text-[#0F2A56] hover:underline"
              >
                Go to dashboard
              </Link>
            </div>
          ) : submitted ? (
            <div className="rounded-sm border border-gray-200 bg-white px-6 py-10 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EF9F27]/15">
                <CheckCircle2 className="h-7 w-7 text-[#EF9F27]" strokeWidth={2.25} />
              </div>
              <h1 className="mt-5 text-xl font-bold text-gray-900">Thank you for your feedback</h1>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                Your response helps ICT Chamber improve the services we deliver to members.
              </p>
              {selectedRating ? (
                <p className="mt-4 text-sm text-gray-700">
                  Rating recorded:{' '}
                  <span className="font-semibold text-gray-900">
                    {FEEDBACK_RATING_OPTIONS.find((option) => option.value === selectedRating)?.label}
                  </span>
                </p>
              ) : null}
              <Link
                to={ROUTES.MEMBER_DASHBOARD}
                className="mt-8 inline-flex items-center justify-center rounded-sm bg-[#EF9F27] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#d98e1e]"
              >
                Back to dashboard
              </Link>
            </div>
          ) : survey ? (
            <form
              onSubmit={(event) => void handleSubmit(event)}
              className="rounded-sm border border-gray-200 bg-white shadow-sm"
            >
              <div className="border-b border-gray-100 px-6 py-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#EF9F27]">
                  Delivered service
                </p>
                <h1 className="mt-1 text-xl font-bold text-gray-900">How was your experience?</h1>
                <p className="mt-2 text-sm text-gray-500">
                  {survey.companyName ? (
                    <>
                      Hi <span className="font-medium text-gray-700">{survey.companyName}</span>, please
                      share your feedback on the service below.
                    </>
                  ) : (
                    'Please share your feedback on the service below.'
                  )}
                </p>
              </div>

              <div className="space-y-4 px-6 py-5">
                <div className="rounded-sm border border-gray-100 bg-gray-50/80 px-4 py-3">
                  <p className="text-sm font-semibold text-gray-900">{survey.requestTitle}</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {survey.serviceCategory.categoryName} · {survey.serviceSubtype.name}
                  </p>
                  {deliveryLabel ? (
                    <p className="mt-1 text-xs text-gray-400">Delivered {deliveryLabel}</p>
                  ) : null}
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    How satisfied are you with this service? <span className="text-red-500">*</span>
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {FEEDBACK_RATING_OPTIONS.map((option) => {
                      const isSelected = selectedRating === option.value;
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setSelectedRating(option.value)}
                          className={[
                            'flex flex-col items-center gap-2.5 rounded-sm border px-2 py-4 text-center transition-all',
                            isSelected
                              ? `${option.selectedBg} shadow-sm ring-2 ${option.selectedRing}`
                              : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50',
                          ].join(' ')}
                          aria-pressed={isSelected}
                        >
                          <span
                            className={[
                              'flex h-10 w-10 items-center justify-center rounded-full',
                              isSelected ? 'bg-white/80' : 'bg-gray-50',
                            ].join(' ')}
                          >
                            <Icon className={`h-5 w-5 ${option.iconClass}`} strokeWidth={2} aria-hidden />
                          </span>
                          <span
                            className={[
                              'text-[11px] font-medium leading-tight',
                              isSelected ? 'text-gray-900' : 'text-gray-500',
                            ].join(' ')}
                          >
                            {option.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label htmlFor="feedback-comment" className="text-sm font-semibold text-gray-900">
                    Additional feedback <span className="font-normal text-gray-400">(optional)</span>
                  </label>
                  <textarea
                    id="feedback-comment"
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    rows={4}
                    placeholder="Tell us what went well or what we could improve…"
                    className="mt-2 w-full resize-y rounded-sm border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#EF9F27] focus:outline-none focus:ring-2 focus:ring-[#EF9F27]/25"
                  />
                </div>

                {error ? (
                  <div className="rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    {error}
                  </div>
                ) : null}
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-gray-100 px-6 py-4 sm:flex-row sm:justify-end">
                <Link
                  to={ROUTES.MEMBER_DASHBOARD}
                  className="inline-flex items-center justify-center rounded-sm border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedRating}
                  className="inline-flex items-center justify-center rounded-sm bg-[#EF9F27] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#d98e1e] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? 'Submitting…' : 'Submit feedback'}
                </button>
              </div>
            </form>
          ) : null}
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white py-4 text-center text-[11px] text-gray-400">
        © {new Date().getFullYear()} Rwanda ICT Chamber
      </footer>
    </div>
  );
};
