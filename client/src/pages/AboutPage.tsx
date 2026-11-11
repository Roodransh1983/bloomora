import React from 'react';
import { Link } from 'react-router-dom';
import { Flower2, Heart, Recycle, Users, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="pt-28 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
      {/* Editorial Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase tracking-widest text-sage font-bold font-sans">The BLOOMORA Story</span>
        <h1 className="font-serif text-4xl sm:text-6xl font-bold text-forest leading-[1.1]">
          Where Nature’s Offerings Find Everlasting Life.
        </h1>
        <p className="text-base sm:text-lg text-charcoal/70 leading-relaxed font-sans max-w-2xl mx-auto">
          Born from a deep reverence for Indian cultural traditions and an urgent commitment to environmental stewardship.
        </p>
      </div>

      {/* Hero Image */}
      <div className="relative rounded-3xl overflow-hidden aspect-[21/9] max-h-[500px] border border-beige shadow-md">
        <img
          src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=1600"
          alt="Artisanal flower drying and botanical design process"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest/70 via-transparent to-transparent flex items-end p-8 sm:p-12">
          <p className="font-serif text-xl sm:text-2xl text-ivory max-w-xl font-medium">
            "Beauty does not diminish after a ritual or celebration. With care, it simply takes another form."
          </p>
        </div>
      </div>

      {/* The Dual Problem We Solve */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-5">
          <span className="text-xs uppercase tracking-widest text-terracotta font-bold font-sans">
            The Reality in India
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-forest leading-tight">
            The Flower Waste & Textile Predicament
          </h2>
          <p className="text-sm text-charcoal/70 leading-relaxed font-sans">
            In India, flowers are symbols of reverence, festivity, and sacred devotion. Thousands of metric tons of marigold, rose, jasmine, and lotus garlands are placed at temples, wedding mandaps, and commemorative events every single day. Due to their sacred nature, people are reluctant to dispose of them with ordinary refuse, leading them into rivers and reservoirs where pesticide run-offs disrupt aquatic ecosystems.
          </p>
          <p className="text-sm text-charcoal/70 leading-relaxed font-sans">
            Simultaneously, our wardrobes accumulate millions of wearable and gently used garments that could provide dignified warmth to underserved families or be upcycled into useful durable textile products.
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-white border border-beige shadow-sm space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sage/20 text-forest flex items-center justify-center">
                <Flower2 className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-lg font-bold text-forest">Floral Regeneration</h4>
            </div>
            <p className="text-xs text-charcoal/70 leading-relaxed font-sans">
              Systematic collection from places of worship and event venues, natural sundrying, and gentle essential oil preservation for home decor and natural paper.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-beige shadow-sm space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-terracotta/20 text-terracotta flex items-center justify-center">
                <Recycle className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-lg font-bold text-forest">Textile Dignity</h4>
            </div>
            <p className="text-xs text-charcoal/70 leading-relaxed font-sans">
              Clean redistribution of everyday clothes, coupled with artisanal re-crafting of unusable cottons, silks, and woollens into modern tote bags and home textiles.
            </p>
          </div>
        </div>
      </div>

      {/* Social Livelihood Impact */}
      <div className="rounded-3xl bg-forest text-ivory p-8 sm:p-14 space-y-8">
        <div className="max-w-2xl space-y-3">
          <span className="text-xs uppercase tracking-widest text-sage font-bold font-sans">Community Empowerment</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ivory">
            Dignified Livelihoods for Rural Women Artisans
          </h2>
          <p className="text-sm text-ivory/70 leading-relaxed font-sans">
            BLOOMORA is more than a store. Every purchase directly sustains self-help women groups across Karnataka, Uttar Pradesh, and Rajasthan, providing fair wages, flexible hours, and safe creative artisanal workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-forest-light">
          <div>
            <p className="font-serif text-3xl font-bold text-sage">500+</p>
            <p className="text-xs text-ivory/70 mt-1">Artisans & Self-Help Workers</p>
          </div>
          <div>
            <p className="font-serif text-3xl font-bold text-sage">100%</p>
            <p className="text-xs text-ivory/70 mt-1">Fair Living Wage Guarantee</p>
          </div>
          <div>
            <p className="font-serif text-3xl font-bold text-sage">0%</p>
            <p className="text-xs text-ivory/70 mt-1">Toxic Dyes or Petrochemicals</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center max-w-xl mx-auto space-y-4">
        <h3 className="font-serif text-2xl font-bold text-forest">Ready to Experience Beauty Beyond Waste?</h3>
        <p className="text-xs text-charcoal/60 font-sans">
          Support our circular mission by exploring our handcrafted creations or donating your gently used clothes.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/shop"
            className="w-full sm:w-auto px-8 py-3 rounded-full bg-forest text-ivory text-xs font-semibold hover:bg-forest-light transition-colors"
          >
            Explore Catalogue
          </Link>
          <Link
            to="/donate"
            className="w-full sm:w-auto px-8 py-3 rounded-full border border-forest text-forest text-xs font-semibold hover:bg-forest hover:text-ivory transition-colors"
          >
            Schedule Donation
          </Link>
        </div>
      </div>
    </div>
  );
}
