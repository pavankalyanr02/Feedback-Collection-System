import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { Star, CheckCircle, Sparkles, AlertCircle } from 'lucide-react';
import { SkeletonCard } from '../components/ui/SkeletonLoader';

export const PublicFormPage: React.FC = () => {
  const { publicId } = useParams<{ publicId: string }>();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: form, isLoading, isError, error } = useQuery({
    queryKey: ['publicForm', publicId],
    queryFn: async () => {
      const res = await apiClient.get(`/public/forms/${publicId}`);
      return res.data.data;
    },
    enabled: !!publicId,
  });

  const submitMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.post(`/public/forms/${publicId}/responses`, payload);
      return res.data;
    },
    onSuccess: () => {
      setIsSubmitted(true);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Failed to submit response.');
    },
  });

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const formattedAnswers = Object.entries(answers).map(([questionId, value]) => ({
      questionId,
      value,
    }));

    submitMutation.mutate({
      isAnonymous: true,
      answers: formattedAnswers,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 flex justify-center items-center">
        <div className="w-full max-w-xl">
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (isError || !form) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 flex justify-center items-center text-center">
        <div className="glass-card p-8 rounded-3xl border border-slate-800 max-w-md space-y-4">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="text-xl font-bold text-slate-100">Form Unavailable</h2>
          <p className="text-xs text-slate-400">
            {(error as any)?.response?.data?.message || 'This feedback form is inactive, expired, or does not exist.'}
          </p>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 flex justify-center items-center text-center">
        <div className="glass-card p-10 rounded-3xl border border-emerald-500/30 max-w-md space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-100">Thank You!</h2>
          <p className="text-sm text-slate-300">Your feedback has been successfully submitted.</p>
          <p className="text-xs text-slate-500">We appreciate your time helping us improve.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 flex flex-col justify-center items-center relative overflow-hidden">
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-2xl space-y-6 z-10">
        {/* Brand Banner Header */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-3 relative overflow-hidden">
          <div className="flex items-center space-x-3">
            {form.organization?.logoUrl ? (
              <img src={form.organization.logoUrl} alt={form.organization.name} className="w-10 h-10 rounded-xl object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
            )}
            <div>
              <p className="text-xs font-semibold text-brand-400 uppercase tracking-wider">
                {form.organization?.name || 'Feedback Survey'}
              </p>
              <h1 className="text-2xl font-extrabold text-slate-100">{form.title}</h1>
            </div>
          </div>
          {form.description && <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-slate-800/60">{form.description}</p>}
        </div>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* Public Submission Form Questions */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {form.questions?.map((q: any, idx: number) => (
            <div key={q.id} className="glass-card p-6 rounded-3xl border border-slate-800/80 space-y-3">
              <label className="block text-sm font-bold text-slate-100">
                {idx + 1}. {q.title} {q.isRequired && <span className="text-red-400">*</span>}
              </label>
              {q.description && <p className="text-xs text-slate-400">{q.description}</p>}

              {/* STAR_RATING */}
              {q.type === 'STAR_RATING' && (
                <div className="flex space-x-2 pt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleAnswerChange(q.id, star.toString())}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          parseInt(answers[q.id] || '0', 10) >= star
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* RATING (1-10) */}
              {q.type === 'RATING' && (
                <div className="grid grid-cols-10 gap-1.5 pt-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleAnswerChange(q.id, num.toString())}
                      className={`py-2 rounded-xl text-xs font-bold transition-all ${
                        answers[q.id] === num.toString()
                          ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
                          : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              )}

              {/* SINGLE_CHOICE */}
              {q.type === 'SINGLE_CHOICE' && (
                <div className="space-y-2 pt-2">
                  {q.options?.map((opt: any) => (
                    <label
                      key={opt.id || opt.value}
                      className={`flex items-center space-x-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                        answers[q.id] === opt.value
                          ? 'bg-brand-500/10 border-brand-500 text-brand-300 font-semibold'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={opt.value}
                        checked={answers[q.id] === opt.value}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        className="text-brand-500 focus:ring-brand-500"
                      />
                      <span className="text-xs">{opt.label}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* YES_NO */}
              {q.type === 'YES_NO' && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  {['Yes', 'No'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleAnswerChange(q.id, opt)}
                      className={`py-3 rounded-2xl text-xs font-bold transition-all ${
                        answers[q.id] === opt
                          ? 'bg-brand-500 text-white shadow-lg'
                          : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {/* LONG_TEXT */}
              {q.type === 'LONG_TEXT' && (
                <textarea
                  rows={4}
                  value={answers[q.id] || ''}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  placeholder="Type your response here..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              )}

              {/* SHORT_TEXT */}
              {q.type === 'SHORT_TEXT' && (
                <input
                  type="text"
                  value={answers[q.id] || ''}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  placeholder="Your answer..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              )}

              {/* DROPDOWN */}
              {q.type === 'DROPDOWN' && (
                <select
                  value={answers[q.id] || ''}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
                >
                  <option value="">Select an option...</option>
                  {q.options?.map((opt: any) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={submitMutation.isPending}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-brand-500/25 transition-all hover:scale-[1.01]"
          >
            {submitMutation.isPending ? 'Submitting Feedback...' : 'Submit Feedback Response'}
          </button>
        </form>
      </div>
    </div>
  );
};
