import React, { useState, useEffect } from 'react';
import {
  Star,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
  Search,
  CheckCircle,
  Clock,
  Sparkles,
  MessageSquare,
  AlertCircle,
  MapPin,
  Calendar,
} from 'lucide-react';
import { apiFetch } from '../api/client';

interface ReviewItem {
  id: string;
  patientName: string;
  rating: number;
  department: string;
  treatment: string | null;
  comment: string;
  city: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ReviewStats {
  total: number;
  published: number;
  hidden: number;
  avgRating: number;
}

export const ReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    total: 0,
    published: 0,
    hidden: 0,
    avgRating: 5.0,
  });
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'hidden'>('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (deptFilter !== 'all') params.append('department', deptFilter);

      const res = await apiFetch(`/api/v1/reviews?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
        if (data.stats) {
          setStats(data.stats);
        }
      } else {
        setNotification({ type: 'error', message: 'Failed to load reviews.' });
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setNotification({ type: 'error', message: 'Network error while loading reviews.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [statusFilter, deptFilter]);

  const handleTogglePublish = async (review: ReviewItem) => {
    const nextState = !review.isPublished;
    setTogglingId(review.id);
    try {
      const res = await apiFetch(`/api/v1/reviews/${review.id}/publish`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: nextState }),
      });

      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === review.id ? { ...r, isPublished: nextState } : r))
        );
        setStats((prev) => ({
          ...prev,
          published: nextState ? prev.published + 1 : Math.max(0, prev.published - 1),
          hidden: nextState ? Math.max(0, prev.hidden - 1) : prev.hidden + 1,
        }));
        setNotification({
          type: 'success',
          message: nextState
            ? `Review by "${review.patientName}" is now LIVE on the website.`
            : `Review by "${review.patientName}" is now HIDDEN from the website.`,
        });
      } else {
        const err = await res.json().catch(() => ({}));
        setNotification({ type: 'error', message: err.error || 'Failed to update visibility.' });
      }
    } catch (err) {
      console.error('Failed to toggle review visibility:', err);
      setNotification({ type: 'error', message: 'Network error updating review.' });
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete the review from "${name}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await apiFetch(`/api/v1/reviews/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
        setStats((prev) => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
          published: prev.published - (reviews.find((r) => r.id === id)?.isPublished ? 1 : 0),
          hidden: prev.hidden - (reviews.find((r) => r.id === id)?.isPublished ? 0 : 1),
        }));
        setNotification({ type: 'success', message: 'Review deleted successfully.' });
      } else {
        const err = await res.json().catch(() => ({}));
        setNotification({ type: 'error', message: err.error || 'Failed to delete review.' });
      }
    } catch (err) {
      console.error('Failed to delete review:', err);
      setNotification({ type: 'error', message: 'Network error deleting review.' });
    } finally {
      setDeletingId(null);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      r.patientName.toLowerCase().includes(q) ||
      (r.comment && r.comment.toLowerCase().includes(q)) ||
      (r.city && r.city.toLowerCase().includes(q)) ||
      (r.treatment && r.treatment.toLowerCase().includes(q))
    );
  });

  const getDeptBadge = (dept: string) => {
    const d = dept.toLowerCase();
    if (d.includes('audiology') || d.includes('hearing')) {
      return 'bg-teal-500/15 text-teal-300 border-teal-500/30';
    }
    if (d.includes('speech')) {
      return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
    }
    if (d.includes('physio')) {
      return 'bg-lime-500/15 text-lime-300 border-lime-500/30';
    }
    return 'bg-slate-700/50 text-slate-300 border-slate-600/40';
  };

  return (
    <div className="space-y-6">
      {/* Header Block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
              WEBSITE CONTENT MANAGEMENT
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Star className="w-7 h-7 text-amber-400 fill-amber-400" />
            <span>Patient Reviews & Testimonials</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Reviews submitted by patients from the clinic website. Moderate which testimonials appear live on the public site using the display toggle.
          </p>
        </div>

        <button
          onClick={fetchReviews}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all shadow-sm active:scale-95 border border-slate-700"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Notification banner */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold animate-fade-in ${
            notification.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-xs underline opacity-80 hover:opacity-100 ml-3"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#0b121e] p-4 sm:p-5 rounded-2xl border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2 font-mono">
            <span>TOTAL REVIEWS</span>
            <MessageSquare className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {stats.total}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            All submitted patient stories
          </span>
        </div>

        <div className="bg-[#0b121e] p-4 sm:p-5 rounded-2xl border border-emerald-900/40 shadow-md">
          <div className="flex items-center justify-between text-emerald-400 text-xs mb-2 font-mono">
            <span>DISPLAYED ON SITE</span>
            <Eye className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-300">
            {stats.published}
          </div>
          <span className="text-[11px] text-emerald-400/80 mt-1 block">
            Live on public website
          </span>
        </div>

        <div className="bg-[#0b121e] p-4 sm:p-5 rounded-2xl border border-amber-900/40 shadow-md">
          <div className="flex items-center justify-between text-amber-400 text-xs mb-2 font-mono">
            <span>HIDDEN / PENDING</span>
            <EyeOff className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-300">
            {stats.hidden}
          </div>
          <span className="text-[11px] text-amber-400/80 mt-1 block">
            Unpublished / In review
          </span>
        </div>

        <div className="bg-[#0b121e] p-4 sm:p-5 rounded-2xl border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2 font-mono">
            <span>AVG RATING</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 flex items-center gap-1.5">
            <span>{stats.avgRating}</span>
            <span className="text-base text-slate-400 font-normal">/ 5.0</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Across all patient submissions
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0b121e] p-3.5 sm:p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by patient name, treatment, comment or city..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#070b12] border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">Status:</span>
          <div className="inline-flex rounded-xl bg-[#070b12] p-1 border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'all'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setStatusFilter('published')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'published'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              Published ({stats.published})
            </button>
            <button
              onClick={() => setStatusFilter('hidden')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'hidden'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-amber-400'
              }`}
            >
              Hidden ({stats.hidden})
            </button>
          </div>

          {/* Department Filter */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2 bg-[#070b12] border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">All Departments</option>
            <option value="Audiology">Audiology</option>
            <option value="Speech Therapy">Speech Therapy</option>
            <option value="Physiotherapy">Physiotherapy</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-3.5">
        {loading ? (
          <div className="p-12 text-center bg-[#0b121e] rounded-2xl border border-slate-800 text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-400" />
            <p className="text-xs">Loading patient reviews...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-12 text-center bg-[#0b121e] rounded-2xl border border-slate-800 text-slate-400">
            <MessageSquare className="w-8 h-8 mx-auto mb-2.5 text-slate-500 opacity-60" />
            <h4 className="text-sm font-bold text-slate-200 mb-1">No reviews found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchTerm || statusFilter !== 'all' || deptFilter !== 'all'
                ? 'Try adjusting your filters or search keywords.'
                : 'No reviews have been submitted yet. Public patient submissions will appear here.'}
            </p>
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col md:flex-row md:items-start justify-between gap-4 ${
                rev.isPublished
                  ? 'bg-[#0b1422] border-emerald-900/50 shadow-md'
                  : 'bg-[#0b121e] border-slate-800 opacity-90'
              }`}
            >
              {/* Left Column: Reviewer Info, Rating & Comment */}
              <div className="flex-1 min-w-0 space-y-2.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {rev.patientName}
                  </h3>

                  {rev.city && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span>{rev.city}</span>
                    </span>
                  )}

                  <span
                    className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase border ${getDeptBadge(
                      rev.department
                    )}`}
                  >
                    {rev.department}
                  </span>

                  {rev.treatment && (
                    <span className="text-[11px] font-semibold text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-md border border-slate-700/60">
                      {rev.treatment}
                    </span>
                  )}
                </div>

                {/* Star Rating Display */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= rev.rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-600'
                      }`}
                    />
                  ))}
                  <span className="text-xs font-bold text-amber-300 ml-1.5 font-mono">
                    {rev.rating}.0
                  </span>
                </div>

                {/* Review Body */}
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal whitespace-pre-line bg-black/20 p-3 rounded-xl border border-slate-800/60">
                  “{rev.comment}”
                </p>

                {/* Timestamp */}
                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                  <Calendar className="w-3 h-3" />
                  <span>Submitted on: {new Date(rev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>

              {/* Right Column: Visibility Toggle & Actions */}
              <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                {/* Website Visibility Button */}
                <div className="flex flex-col items-start md:items-end gap-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                    Website Visibility:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleTogglePublish(rev)}
                    disabled={togglingId === rev.id}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 border cursor-pointer ${
                      rev.isPublished
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                    }`}
                  >
                    {togglingId === rev.id ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : rev.isPublished ? (
                      <Eye className="w-3.5 h-3.5 text-white" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span>
                      {togglingId === rev.id
                        ? 'Updating...'
                        : rev.isPublished
                        ? 'Displayed on Website'
                        : 'Hidden (Click to Display)'}
                    </span>
                  </button>
                </div>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => handleDelete(rev.id, rev.patientName)}
                  disabled={deletingId === rev.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-xs font-semibold transition-all"
                  title="Delete Review"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
