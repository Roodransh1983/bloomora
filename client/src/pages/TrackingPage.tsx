import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, CheckCircle2, Clock, AlertCircle, Sparkles, ArrowRight, Truck, Gift, Flower2 } from 'lucide-react';
import { api } from '../services/api';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export function TrackingPage() {
  const { type: urlType, number: urlNumber } = useParams<{ type?: string; number?: string }>();
  const navigate = useNavigate();

  const [trackingNumber, setTrackingNumber] = useState(urlNumber || '');
  const [activeTab, setActiveTab] = useState<'donation' | 'flower'>(
    urlType === 'flower' || (urlNumber && urlNumber.startsWith('FLW')) ? 'flower' : 'donation'
  );
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const donationSteps = [
    { key: 'SUBMITTED', label: 'Submitted' },
    { key: 'UNDER_REVIEW', label: 'Under Review' },
    { key: 'APPROVED', label: 'Approved' },
    { key: 'PICKUP_SCHEDULED', label: 'Pickup Scheduled' },
    { key: 'COLLECTED', label: 'Collected' },
    { key: 'SORTED', label: 'Sorted' },
    { key: 'DISTRIBUTED', label: 'Distributed' },
    { key: 'UPCYCLED', label: 'Artisan Upcycled' },
  ];

  const flowerSteps = [
    { key: 'SUBMITTED', label: 'Submitted' },
    { key: 'UNDER_REVIEW', label: 'Under Review' },
    { key: 'ACCEPTED', label: 'Accepted' },
    { key: 'PICKUP_SCHEDULED', label: 'Route Scheduled' },
    { key: 'COLLECTED', label: 'Collected' },
    { key: 'PROCESSED', label: 'Sun-dried & Upcycled' },
  ];

  const doTrack = async (num: string, kind: 'donation' | 'flower') => {
    if (!num.trim()) return;
    setLoading(true);
    setErrorMsg('');
    setResult(null);

    try {
      if (kind === 'donation' || num.startsWith('DON')) {
        const res = await api.donations.track(num.trim()) as { donation: any };
        setResult({ ...res.donation, _kind: 'donation' });
      } else {
        const res = await api.flowers.track(num.trim()) as { collection: any };
        setResult({ ...res.collection, _kind: 'flower' });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'No record found with this reference number. Please verify the ID.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (urlNumber) {
      const kind = urlType === 'flower' || urlNumber.startsWith('FLW') ? 'flower' : 'donation';
      setActiveTab(kind);
      doTrack(urlNumber, kind);
    }
  }, [urlType, urlNumber]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      const kind = trackingNumber.startsWith('FLW') ? 'flower' : activeTab;
      navigate(`/track/${kind}/${trackingNumber.trim()}`);
    }
  };

  const getStepIndex = (currentStatus: string, steps: Array<{ key: string }>) => {
    const idx = steps.findIndex((s) => s.key === currentStatus);
    return idx === -1 ? 0 : idx;
  };

  return (
    <div className="pt-28 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-widest text-sage font-bold font-sans">
          Transparent Impact
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-forest">
          Track Your Contribution
        </h1>
        <p className="text-sm text-charcoal/70 font-sans">
          Enter your unique reference ID to inspect real-time review, pickup logistics, and processing progress.
        </p>
      </div>

      {/* Lookup Card */}
      <div className="bg-white rounded-3xl border border-beige p-6 sm:p-8 shadow-sm space-y-6">
        {/* Toggle between donation / flower */}
        <div className="flex rounded-2xl bg-ivory p-1.5 border border-beige max-w-md mx-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('donation');
              setTrackingNumber('');
              setResult(null);
            }}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'donation' ? 'bg-forest text-ivory shadow-sm' : 'text-charcoal/60 hover:text-charcoal'
            }`}
          >
            <Gift className="w-4 h-4" /> Clothing Donation
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('flower');
              setTrackingNumber('');
              setResult(null);
            }}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'flower' ? 'bg-forest text-ivory shadow-sm' : 'text-charcoal/60 hover:text-charcoal'
            }`}
          >
            <Flower2 className="w-4 h-4" /> Flower Collection
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
          <div className="relative flex-1">
            <input
              type="text"
              required
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
              placeholder={activeTab === 'donation' ? 'e.g. DON-2026-8812' : 'e.g. FLW-2026-3490'}
              className="w-full pl-10 pr-3 py-3 bg-ivory border border-beige rounded-2xl text-xs uppercase focus:ring-1 focus:ring-forest focus:outline-none"
            />
            <Search className="w-4 h-4 text-charcoal/40 absolute left-3.5 top-3.5" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-forest text-ivory rounded-2xl text-xs font-semibold hover:bg-forest-light transition-colors flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Searching...' : 'Track Request'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <p className="text-[11px] text-charcoal/40 text-center">
          Sample demo IDs: <strong>DON-2026-8812</strong> or <strong>FLW-2026-3490</strong>
        </p>
      </div>

      {loading && (
        <div className="py-12 flex justify-center">
          <LoadingSpinner />
        </div>
      )}

      {errorMsg && (
        <div className="p-6 rounded-3xl bg-red-50 border border-red-200 text-center space-y-2 max-w-md mx-auto">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <p className="font-semibold text-xs text-red-800">{errorMsg}</p>
        </div>
      )}

      {/* Result Status Display */}
      {result && (
        <div className="bg-white rounded-3xl border border-beige p-6 sm:p-10 shadow-sm space-y-8 animate-fade-in">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-beige gap-4">
            <div>
              <span className="text-xs uppercase font-semibold text-sage tracking-wider">
                {result._kind === 'donation' ? 'Clothing Donation Request' : 'Floral Waste Collection'}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-forest mt-0.5">
                {result.donationNumber || result.requestNumber}
              </h2>
              <p className="text-xs text-charcoal/60 mt-0.5">
                Logged on{' '}
                {new Date(result.createdAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>

            <div className="text-right">
              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-sage/20 text-forest border border-sage/40">
                {result.status}
              </span>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-charcoal/70 mb-6">
              Lifecycle Progress
            </h4>
            {(() => {
              const steps = result._kind === 'donation' ? donationSteps : flowerSteps;
              const currentIndex = getStepIndex(result.status, steps);

              return (
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-center">
                  {steps.map((s, idx) => {
                    const isDone = idx <= currentIndex;
                    const isCurrent = idx === currentIndex;

                    return (
                      <div key={s.key} className="flex flex-col items-center">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            isCurrent
                              ? 'bg-forest text-ivory ring-4 ring-forest/20'
                              : isDone
                              ? 'bg-sage text-forest'
                              : 'bg-beige/40 text-charcoal/30'
                          }`}
                        >
                          {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                        </div>
                        <span
                          className={`text-[10px] mt-2 font-medium leading-tight ${
                            isCurrent
                              ? 'text-forest font-bold'
                              : isDone
                              ? 'text-charcoal'
                              : 'text-charcoal/40'
                          }`}
                        >
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* Details Grid */}
          <div className="p-6 rounded-2xl bg-ivory border border-beige grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-charcoal/50 block">Donor / Partner:</span>
              <p className="font-semibold text-charcoal">{result.fullName}</p>
            </div>

            <div>
              <span className="text-charcoal/50 block">Location / City:</span>
              <p className="font-semibold text-charcoal">{result.city} ({result.pinCode})</p>
            </div>

            {result.clothingCategory && (
              <div>
                <span className="text-charcoal/50 block">Clothing Category:</span>
                <p className="font-semibold text-charcoal">
                  {result.clothingCategory} ({result.itemCount} garments)
                </p>
              </div>
            )}

            {result.flowerSource && (
              <div>
                <span className="text-charcoal/50 block">Source & Quantity:</span>
                <p className="font-semibold text-charcoal">
                  {result.flowerSource} — {result.quantity}
                </p>
              </div>
            )}

            {result.adminNotes && (
              <div className="sm:col-span-2 pt-2 border-t border-beige/60">
                <span className="text-charcoal/50 block">Coordinator Notes:</span>
                <p className="font-medium text-forest mt-0.5">{result.adminNotes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
