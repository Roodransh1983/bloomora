import React, { useEffect, useState } from 'react';
import { MessageSquare, Star, Check, X, ShieldAlert } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export function AdminReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  const fetchReviews = async () => {
    try {
      const res = await api.admin.reviews() as { data: any[] };
      setReviews(res.data || []);
    } catch (err: any) {
      error(err.message || 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggleApproval = async (id: string, current: boolean) => {
    try {
      await api.admin.updateReview(id, { isApproved: !current });
      success(`Review ${!current ? 'approved for display' : 'hidden from public view'}`);
      await fetchReviews();
    } catch (err: any) {
      error(err.message || 'Failed to update review status');
    }
  };

  return (
    <div className="space-y-8">
      <div className="pb-6 border-b border-beige">
        <span className="text-xs uppercase tracking-widest text-sage font-bold font-sans">
          Reputation & Testimonials
        </span>
        <h1 className="font-serif text-3xl font-bold text-forest mt-0.5">Product Reviews Moderation</h1>
        <p className="text-xs text-charcoal/60 mt-1 font-sans">
          Approve or unpublish feedback submitted by patrons on artisanal product pages.
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : reviews.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-beige text-center space-y-2">
          <MessageSquare className="w-10 h-10 text-charcoal/30 mx-auto" />
          <p className="font-serif text-base font-semibold text-forest">No reviews submitted</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-beige shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-ivory border-b border-beige text-charcoal/70 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Creation Name</th>
                  <th className="py-3.5 px-4">Reviewer</th>
                  <th className="py-3.5 px-4">Rating</th>
                  <th className="py-3.5 px-4">Comment</th>
                  <th className="py-3.5 px-4">Public Status</th>
                  <th className="py-3.5 px-4 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige/60">
                {reviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-ivory/50 transition-colors">
                    <td className="py-3 px-4 font-serif font-bold text-forest">
                      {rev.product?.name || 'Handcrafted Product'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-charcoal">{rev.userName}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating ? 'fill-amber-500 text-amber-500' : 'text-beige'
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-charcoal/80 max-w-sm">{rev.comment}</td>
                    <td className="py-3 px-4">
                      {rev.isApproved ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                          Live on Store
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700">
                          Hidden
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleApproval(rev.id, rev.isApproved)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          rev.isApproved
                            ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                            : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        }`}
                      >
                        {rev.isApproved ? 'Unpublish' : 'Approve'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
