import React, { useState } from 'react';
import { Star, X, CheckCircle, AlertCircle, Loader2, Sparkles, HeartHandshake } from 'lucide-react';
import { apiUrl } from '../utils/publicApi';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmitted?: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  onReviewSubmitted,
}) => {
  const [patientName, setPatientName] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [department, setDepartment] = useState<'Audiology' | 'Speech Therapy' | 'Physiotherapy' | 'General Care'>('Audiology');
  const [treatment, setTreatment] = useState('');
  const [city, setCity] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!patientName.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }
    if (!comment.trim() || comment.trim().length < 10) {
      setErrorMsg('Please write at least a few words about your therapy experience (min 10 characters).');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(apiUrl('/api/v1/public/reviews'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: patientName.trim(),
          rating,
          department,
          treatment: treatment.trim() || undefined,
          city: city.trim() || undefined,
          comment: comment.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsSuccess(true);
        if (onReviewSubmitted) {
          onReviewSubmitted();
        }
      } else {
        setErrorMsg(data.error || 'Failed to submit review. Please try again.');
      }
    } catch (err) {
      console.error('Review submit error:', err);
      setErrorMsg('Network error while submitting review. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setIsSuccess(false);
    setErrorMsg('');
    setPatientName('');
    setRating(5);
    setDepartment('Audiology');
    setTreatment('');
    setCity('');
    setComment('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3.5 sm:p-6 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative border-2 border-neutral-200 flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={resetAndClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-black transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          /* Thank You Success State */
          <div className="text-center py-8 space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-mono font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Review Submitted</span>
            </div>

            <h3 className="text-2xl font-bold text-neutral-900">
              Thank You for Sharing!
            </h3>

            <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
              Your feedback is deeply appreciated by our clinical team. To ensure patient authenticity and privacy, reviews are verified by our clinic admin before being published on the website.
            </p>

            <div className="pt-4">
              <button
                type="button"
                onClick={resetAndClose}
                className="px-8 py-3 rounded-full bg-neutral-900 hover:bg-[#053543] text-white font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95"
              >
                Close & Return
              </button>
            </div>
          </div>
        ) : (
          /* Review Form */
          <>
            <div className="mb-5 pr-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-mono font-bold tracking-wider uppercase mb-2">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span>Patient Feedback</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 leading-tight">
                Share Your Therapy Experience
              </h3>
              <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                Your journey inspires and guides others. Tell us about the care you received at Shree Clinic.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Star Rating Selector */}
              <div>
                <label className="block text-xs font-bold text-neutral-900 mb-1.5">
                  1. Overall Experience Rating <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-amber-50/60 border border-amber-200/80">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 hover:scale-110 transition-transform focus:outline-none"
                      >
                        <Star
                          className={`w-7 h-7 transition-colors ${
                            star <= (hoverRating || rating)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-neutral-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-amber-900 ml-2 font-mono">
                    {rating === 5
                      ? '5.0 — Outstanding Care'
                      : rating === 4
                      ? '4.0 — Very Good'
                      : rating === 3
                      ? '3.0 — Satisfactory'
                      : rating === 2
                      ? '2.0 — Needs Improvement'
                      : '1.0 — Poor Experience'}
                  </span>
                </div>
              </div>

              {/* Patient Name */}
              <div>
                <label className="block text-xs font-bold text-neutral-900 mb-1">
                  2. Patient / Caregiver Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar or Anita (Mother of Aarav)"
                  className="w-full p-3 rounded-xl border border-neutral-300 text-sm font-semibold text-neutral-900 placeholder:text-neutral-400 focus:border-[#053543] focus:outline-none transition-colors"
                />
              </div>

              {/* Department Option Buttons */}
              <div>
                <label className="block text-xs font-bold text-neutral-900 mb-1">
                  3. Therapy Specialty
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(
                    [
                      { id: 'Audiology', label: 'Audiology' },
                      { id: 'Speech Therapy', label: 'Speech' },
                      { id: 'Physiotherapy', label: 'Physio' },
                      { id: 'General Care', label: 'General' },
                    ] as const
                  ).map((dept) => (
                    <button
                      key={dept.id}
                      type="button"
                      onClick={() => setDepartment(dept.id)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                        department === dept.id
                          ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                          : 'bg-stone-50 text-neutral-700 border-neutral-200 hover:bg-stone-100'
                      }`}
                    >
                      {dept.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Treatment / Condition (Optional) & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-900 mb-1">
                    Treatment / Condition <span className="text-neutral-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={treatment}
                    onChange={(e) => setTreatment(e.target.value)}
                    placeholder="e.g. Speech Delay, Hearing Aid, Knee Rehab"
                    className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs sm:text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:border-[#053543] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-900 mb-1">
                    City / Area <span className="text-neutral-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Mokila, Hyderabad"
                    className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs sm:text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:border-[#053543] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Review Textarea */}
              <div>
                <label className="block text-xs font-bold text-neutral-900 mb-1">
                  4. Your Review & Recovery Story <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Describe how the therapy or consultation helped you or your family member..."
                  className="w-full p-3 rounded-xl border border-neutral-300 text-xs sm:text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:border-[#053543] focus:outline-none transition-colors resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-full bg-neutral-900 hover:bg-[#053543] text-white font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Review...</span>
                    </>
                  ) : (
                    <>
                      <HeartHandshake className="w-4 h-4 text-emerald-400" />
                      <span>Submit Patient Review</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
