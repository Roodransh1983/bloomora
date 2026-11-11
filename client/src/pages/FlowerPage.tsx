import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Flower2,
  CheckCircle2,
  Truck,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Building,
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export function FlowerPage() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    collectionAddress: '',
    city: 'Bengaluru',
    pinCode: '',
    flowerSource: 'Temple',
    quantity: '10-25 kg',
    flowerType: 'Marigold & Jasmine Garlands',
    preferredDate: 'Daily Morning',
    additionalInfo: '',
  });

  const [loading, setLoading] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<{
    requestNumber: string;
    fullName: string;
    flowerSource: string;
  } | null>(null);

  const sources = ['Temple', 'Wedding Banquet', 'Public Festival / Event', 'Flower Wholesale Market', 'Other'];

  const quantities = ['Under 10 kg', '10-25 kg', '25-50 kg', '50-100 kg', '100+ kg (Daily Route)'];

  const acceptedFlowers = [
    { name: 'Marigolds (Genda)', use: 'Aromatic potpourri, natural botanical pigments & craft paper' },
    { name: 'Jasmine (Mogra)', use: 'Pure natural fragrance infusions & essential oil steam extracts' },
    { name: 'Roses (Gulab)', use: 'Pressed botanical frames, decorative art & sacred incense sticks' },
    { name: 'Hibiscus (Gudhal)', use: 'Organic textile dyeing & botanical watercolor pigments' },
    { name: 'Lotus & Orchids', use: 'Resin-encased permanent art & celebratory luxury hampers' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.collectionAddress) {
      error('Please complete all mandatory fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.flowers.submit(formData) as { collection: any; success: boolean };
      setSubmittedRequest(res.collection);
      success('Flower collection request submitted successfully!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      error(err.message || 'Failed to submit collection request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sage/20 text-forest text-xs font-semibold uppercase tracking-wider">
          <Flower2 className="w-3.5 h-3.5" />
          <span>Circular Floral Waste Management</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-forest leading-tight">
          Every Flower Deserves Another Bloom.
        </h1>
        <p className="text-sm sm:text-base text-charcoal/70 leading-relaxed font-sans max-w-2xl mx-auto">
          Over 8,000 tons of sacred floral offerings are discarded every day in India, frequently polluting rivers and water bodies. BLOOMORA bridges temples, wedding venues, and markets with dignified artisan upcycling.
        </p>
      </div>

      {submittedRequest ? (
        /* Confirmation */
        <div className="max-w-2xl mx-auto p-8 sm:p-12 rounded-3xl bg-white border border-beige shadow-lg text-center space-y-6 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-sage/20 text-forest flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-forest" />
          </div>

          <div>
            <span className="text-xs uppercase tracking-widest text-sage font-bold font-sans">
              Collection Request Logged
            </span>
            <h2 className="font-serif text-3xl font-bold text-forest mt-1">
              Thank You, {submittedRequest.fullName}!
            </h2>
            <p className="text-xs text-charcoal/60 mt-1 font-sans">
              Your request has been routed to our regional collection coordinator.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-ivory border border-beige space-y-2">
            <span className="text-xs uppercase tracking-wider text-charcoal/50">Your Unique Request ID</span>
            <p className="font-serif text-3xl font-extrabold text-forest tracking-wide">
              {submittedRequest.requestNumber}
            </p>
            <p className="text-[11px] text-charcoal/60">
              Please preserve this reference ID to track collection dispatch and processing.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={`/track/flower/${submittedRequest.requestNumber}`}
              className="w-full sm:w-auto px-8 py-3 rounded-full bg-forest text-ivory text-xs font-semibold hover:bg-forest-light transition-colors"
            >
              Track Request Status
            </Link>
            <button
              onClick={() => setSubmittedRequest(null)}
              className="w-full sm:w-auto px-8 py-3 rounded-full border border-beige text-charcoal/80 text-xs font-semibold hover:bg-ivory"
            >
              Submit Another Request
            </button>
          </div>
        </div>
      ) : (
        /* Form & Guide */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-beige p-6 sm:p-10 shadow-sm">
            <h2 className="font-serif text-2xl font-bold text-forest mb-2">Request Flower Collection</h2>
            <p className="text-xs text-charcoal/60 mb-6 font-sans">
              Whether you represent a temple trust, banquet hall, event planner, or society, we provide reliable scheduled collection.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal/80 mb-1">
                    Contact / Institution Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Sri Krishna Temple Trust"
                    className="w-full px-3.5 py-2.5 bg-ivory border border-beige rounded-xl text-xs focus:ring-1 focus:ring-forest focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal/80 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 01234"
                    className="w-full px-3.5 py-2.5 bg-ivory border border-beige rounded-xl text-xs focus:ring-1 focus:ring-forest focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal/80 mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="trust@example.org"
                  className="w-full px-3.5 py-2.5 bg-ivory border border-beige rounded-xl text-xs focus:ring-1 focus:ring-forest focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal/80 mb-1">Collection Address *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.collectionAddress}
                  onChange={(e) => setFormData({ ...formData, collectionAddress: e.target.value })}
                  placeholder="Gate / Rear Entrance, Street, Area, Landmark"
                  className="w-full px-3.5 py-2.5 bg-ivory border border-beige rounded-xl text-xs focus:ring-1 focus:ring-forest focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal/80 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Bengaluru"
                    className="w-full px-3.5 py-2.5 bg-ivory border border-beige rounded-xl text-xs focus:ring-1 focus:ring-forest focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal/80 mb-1">PIN Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.pinCode}
                    onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                    placeholder="560003"
                    className="w-full px-3.5 py-2.5 bg-ivory border border-beige rounded-xl text-xs focus:ring-1 focus:ring-forest focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal/80 mb-1">Flower Source</label>
                  <select
                    value={formData.flowerSource}
                    onChange={(e) => setFormData({ ...formData, flowerSource: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-ivory border border-beige rounded-xl text-xs focus:ring-1 focus:ring-forest focus:outline-none font-medium"
                  >
                    {sources.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal/80 mb-1">Approximate Quantity</label>
                  <select
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-ivory border border-beige rounded-xl text-xs focus:ring-1 focus:ring-forest focus:outline-none font-medium"
                  >
                    {quantities.map((q) => (
                      <option key={q} value={q}>
                        {q}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal/80 mb-1">Flower Types</label>
                  <input
                    type="text"
                    value={formData.flowerType}
                    onChange={(e) => setFormData({ ...formData, flowerType: e.target.value })}
                    placeholder="e.g. Marigolds, Jasmine, Roses"
                    className="w-full px-3.5 py-2.5 bg-ivory border border-beige rounded-xl text-xs focus:ring-1 focus:ring-forest focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal/80 mb-1">Preferred Frequency</label>
                  <input
                    type="text"
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    placeholder="e.g. Daily 8 AM, Weekly, One-time"
                    className="w-full px-3.5 py-2.5 bg-ivory border border-beige rounded-xl text-xs focus:ring-1 focus:ring-forest focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal/80 mb-1">Special Instructions</label>
                <textarea
                  rows={2}
                  value={formData.additionalInfo}
                  onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                  placeholder="Gate pass requirements, segregation status, vehicle size restrictions..."
                  className="w-full px-3.5 py-2.5 bg-ivory border border-beige rounded-xl text-xs focus:ring-1 focus:ring-forest focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-full bg-forest text-ivory text-xs font-semibold uppercase tracking-wider hover:bg-forest-light transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <Flower2 className="w-4 h-4 text-sage" />
                <span>{loading ? 'Submitting Request...' : 'Schedule Flower Collection'}</span>
              </button>
            </form>
          </div>

          {/* Right: Accepted Flowers & Impact */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-beige p-6 sm:p-8 space-y-6">
              <h3 className="font-serif text-xl font-bold text-forest">Accepted Flowers & Applications</h3>

              <div className="space-y-3.5 text-xs font-sans">
                {acceptedFlowers.map((f) => (
                  <div key={f.name} className="p-3.5 rounded-2xl bg-ivory border border-beige/80">
                    <p className="font-semibold text-forest flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-sage" />
                      {f.name}
                    </p>
                    <p className="text-charcoal/60 mt-1 pl-5">{f.use}</p>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-sage/10 border border-sage/30 text-xs">
                <p className="font-semibold text-forest mb-1">Institutional Partnerships</p>
                <p className="text-charcoal/70 leading-relaxed mb-3">
                  For major temples, convention centers, and city authorities seeking permanent daily waste segregation routes, our corporate liaison team is available.
                </p>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-1.5 text-forest font-semibold hover:underline"
                >
                  <span>Inquire About Institutional MoUs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
