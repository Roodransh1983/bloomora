import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Recycle,
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export function DonatePage() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    mobile: user?.phone || '',
    email: user?.email || '',
    pickupAddress: '',
    city: 'Bengaluru',
    pinCode: '',
    clothingCategory: "Women's & Men's Daily Wear",
    itemCount: 5,
    clothingCondition: 'Gently Used',
    preferredPickupDate: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [submittedDonation, setSubmittedDonation] = useState<{
    donationNumber: string;
    fullName: string;
    itemCount: number;
    preferredPickupDate: string;
  } | null>(null);

  const categories = [
    "Women's & Men's Daily Wear",
    "Children's & Infant Garments",
    'Warm Woollens & Blankets',
    'Ethnic & Festive Attire',
    'Cotton Sarees & Dhotis',
    'Damaged Fabrics (For Upcycling)',
  ];

  const conditions = [
    { label: 'Like New', desc: 'Hardly worn, spotless condition' },
    { label: 'Gently Used', desc: 'Clean, wearable, minimal signs of use' },
    { label: 'Needs Repair', desc: 'Minor tears or missing buttons' },
    { label: 'Suitable for Textile Recycling', desc: 'Worn out; ideal for shredding and artisanal reweaving' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.mobile || !formData.pickupAddress || !formData.pinCode) {
      error('Please complete all mandatory fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.donations.submit(formData) as { donation: any; success: boolean };
      setSubmittedDonation(res.donation);
      success('Clothing donation request scheduled successfully!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      error(err.message || 'Failed to submit donation request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-terracotta/20 text-terracotta text-xs font-semibold uppercase tracking-wider">
          <Heart className="w-3.5 h-3.5" />
          <span>Circular Wardrobe & Community Redistribution</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-forest leading-tight">
          Your Unused Clothes Can Create Someone's New Beginning.
        </h1>
        <p className="text-sm sm:text-base text-charcoal/70 leading-relaxed font-sans max-w-2xl mx-auto">
          We collect wearable garments for immediate community donation, and channel unusable textiles to our rural women artisans for creative upcycling into tote bags and home accessories.
        </p>
      </div>

      {submittedDonation ? (
        /* Confirmation State */
        <div className="max-w-2xl mx-auto p-8 sm:p-12 rounded-3xl bg-white border border-beige shadow-lg text-center space-y-6 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-sage/20 text-forest flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-forest" />
          </div>

          <div>
            <span className="text-xs uppercase tracking-widest text-sage font-bold font-sans">
              Request Confirmed
            </span>
            <h2 className="font-serif text-3xl font-bold text-forest mt-1">Thank You, {submittedDonation.fullName}!</h2>
            <p className="text-xs text-charcoal/60 mt-1 font-sans">
              Your donation request has been registered and forwarded to our logistics coordinator.
            </p>
          </div>

          {/* Donation Number Highlight */}
          <div className="p-6 rounded-2xl bg-ivory border border-beige space-y-2">
            <span className="text-xs uppercase tracking-wider text-charcoal/50">Your Unique Donation ID</span>
            <p className="font-serif text-3xl font-extrabold text-forest tracking-wide">
              {submittedDonation.donationNumber}
            </p>
            <p className="text-[11px] text-charcoal/60">
              Please save this ID to track your donation journey from review to distribution.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={`/track/donation/${submittedDonation.donationNumber}`}
              className="w-full sm:w-auto px-8 py-3 rounded-full bg-forest text-ivory text-xs font-semibold hover:bg-forest-light transition-colors"
            >
              Track This Donation
            </Link>
            <button
              onClick={() => setSubmittedDonation(null)}
              className="w-full sm:w-auto px-8 py-3 rounded-full border border-beige text-charcoal/80 text-xs font-semibold hover:bg-ivory"
            >
              Schedule Another Donation
            </button>
          </div>
        </div>
      ) : (
        /* Main Donation Form & Info Grid */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-beige p-6 sm:p-10 shadow-sm">
            <h2 className="font-serif text-2xl font-bold text-forest mb-2">Schedule Doorstep Pickup</h2>
            <p className="text-xs text-charcoal/60 mb-6 font-sans">
              Fill in your details below. Our team reviews all requests within 24 hours.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal/80 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Radhika Menon"
                    className="w-full px-3.5 py-2.5 bg-ivory border border-beige rounded-xl text-xs focus:ring-1 focus:ring-forest focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal/80 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 bg-ivory border border-beige rounded-xl text-xs focus:ring-1 focus:ring-forest focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal/80 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@domain.com"
                  className="w-full px-3.5 py-2.5 bg-ivory border border-beige rounded-xl text-xs focus:ring-1 focus:ring-forest focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal/80 mb-1">Complete Pickup Address *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.pickupAddress}
                  onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                  placeholder="Apartment, Wing, Street, Landmark"
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
                    placeholder="560038"
                    className="w-full px-3.5 py-2.5 bg-ivory border border-beige rounded-xl text-xs focus:ring-1 focus:ring-forest focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal/80 mb-1">Clothing Category</label>
                  <select
                    value={formData.clothingCategory}
                    onChange={(e) => setFormData({ ...formData, clothingCategory: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-ivory border border-beige rounded-xl text-xs focus:ring-1 focus:ring-forest focus:outline-none font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal/80 mb-1">Approx. Number of Items</label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={formData.itemCount}
                    onChange={(e) => setFormData({ ...formData, itemCount: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2.5 bg-ivory border border-beige rounded-xl text-xs focus:ring-1 focus:ring-forest focus:outline-none"
                  />
                </div>
              </div>

              {/* Conditions */}
              <div>
                <label className="block text-xs font-semibold text-charcoal/80 mb-2">Clothing Condition</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {conditions.map((cond) => (
                    <label
                      key={cond.label}
                      className={`p-3 rounded-xl border text-xs cursor-pointer flex flex-col transition-all ${
                        formData.clothingCondition === cond.label
                          ? 'border-forest bg-forest/5 text-forest font-semibold'
                          : 'border-beige hover:bg-ivory text-charcoal/70'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="clothingCondition"
                          checked={formData.clothingCondition === cond.label}
                          onChange={() => setFormData({ ...formData, clothingCondition: cond.label })}
                          className="text-forest focus:ring-forest"
                        />
                        <span>{cond.label}</span>
                      </div>
                      <span className="text-[10px] text-charcoal/50 mt-1 pl-5">{cond.desc}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal/80 mb-1">Preferred Pickup Date</label>
                <input
                  type="date"
                  value={formData.preferredPickupDate}
                  onChange={(e) => setFormData({ ...formData, preferredPickupDate: e.target.value })}
                  min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                  className="w-full px-3.5 py-2.5 bg-ivory border border-beige rounded-xl text-xs focus:ring-1 focus:ring-forest focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal/80 mb-1">Additional Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Gate code, specific instructions, or details on types of clothes..."
                  className="w-full px-3.5 py-2.5 bg-ivory border border-beige rounded-xl text-xs focus:ring-1 focus:ring-forest focus:outline-none"
                />
              </div>

              {/* Administrative Pickup Notice */}
              <div className="p-3.5 rounded-xl bg-beige/40 border border-beige flex items-start gap-2.5 text-xs text-charcoal/70">
                <ShieldAlert className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
                <span>
                  <strong>Note:</strong> Doorstep pickup services are subject to operational route availability in your city. Our logistics partner will call to confirm before arriving.
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-full bg-forest text-ivory text-xs font-semibold uppercase tracking-wider hover:bg-forest-light transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <Heart className="w-4 h-4 text-terracotta" />
                <span>{loading ? 'Submitting Request...' : 'Confirm Clothing Donation'}</span>
              </button>
            </form>
          </div>

          {/* Right: Info and Process */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-beige p-6 sm:p-8 space-y-6">
              <h3 className="font-serif text-xl font-bold text-forest">What Happens Next?</h3>

              <div className="space-y-4 text-xs font-sans">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-sage/30 text-forest font-bold flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <h5 className="font-semibold text-charcoal">Verification & Slot Allocation</h5>
                    <p className="text-charcoal/60 mt-0.5">
                      Our dispatch team reviews your address and coordinates a pickup slot with you via SMS/WhatsApp.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-sage/30 text-forest font-bold flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <h5 className="font-semibold text-charcoal">Hygienic Sorting & Categorization</h5>
                    <p className="text-charcoal/60 mt-0.5">
                      Garments are sanitized, steam-pressed, and segregated into direct donation piles vs. upcycling fabric lots.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-sage/30 text-forest font-bold flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <h5 className="font-semibold text-charcoal">Impact Notification</h5>
                    <p className="text-charcoal/60 mt-0.5">
                      You receive updates at every step so you know exactly where your garments made a difference.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-ivory border border-beige text-xs">
                <p className="font-semibold text-forest mb-1">Already submitted a donation?</p>
                <p className="text-charcoal/60 mb-3">Track its live status with your donation number.</p>
                <Link
                  to="/track"
                  className="inline-flex items-center gap-1.5 text-terracotta font-semibold hover:underline"
                >
                  <span>Track Donation Status</span>
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
