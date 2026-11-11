import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Flower2,
  Recycle,
  Heart,
  ShieldCheck,
  Truck,
  Leaf,
  CheckCircle2,
  Star,
} from 'lucide-react';
import { api } from '../services/api';
import { Product, Category, WebsiteContent } from '../types';
import { ProductCard } from '../components/ui/ProductCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export function HomePage() {
  const [bestsellers, setBestsellers] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [heroContent, setHeroContent] = useState<WebsiteContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes, contentRes] = await Promise.all([
          api.products.list({ bestseller: 'true', limit: 8 }) as Promise<{ products: Product[] }>,
          api.categories.list() as Promise<{ data: Category[] } | Category[]>,
          api.content.get('hero_section') as Promise<{ data: WebsiteContent } | WebsiteContent>,
        ]);

        setBestsellers(prodRes.products || []);
        setCategories(Array.isArray(catRes) ? catRes : (catRes as { data: Category[] }).data || []);

        const hero = (contentRes as { data?: WebsiteContent }).data || (contentRes as WebsiteContent);
        if (hero) setHeroContent(hero);
      } catch (err) {
        console.error('Home data load error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-24 md:space-y-32">
      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-gradient-to-b from-beige/40 via-ivory to-ivory">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Text Col */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sage/20 text-forest text-xs font-semibold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5 text-sage-dark" />
                <span>Handcrafted Sustainability from India</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-forest leading-[1.08] tracking-tight">
                {heroContent?.title || 'Beauty Beyond Waste.'}
              </h1>

              <p className="font-sans text-base sm:text-lg text-charcoal/70 leading-relaxed max-w-xl mx-auto lg:mx-0">
                {heroContent?.subtitle ||
                  'Giving discarded flowers a new life and unused clothes a new purpose. Discover an artisanal, dignified way to live sustainably.'}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <Link
                  to="/shop"
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-forest text-ivory font-medium text-sm hover:bg-forest-light transition-all shadow-md flex items-center justify-center gap-2 group"
                >
                  <span>Explore Our Collection</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/donate"
                  className="w-full sm:w-auto px-8 py-4 rounded-full border border-forest text-forest font-medium text-sm hover:bg-forest hover:text-ivory transition-all flex items-center justify-center gap-2"
                >
                  <Heart className="w-4 h-4 text-terracotta" />
                  <span>Donate Your Clothes</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-8 border-t border-beige/80 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0 text-center lg:text-left">
                <div>
                  <p className="font-serif text-2xl font-bold text-forest">100%</p>
                  <p className="text-[11px] text-charcoal/60 uppercase tracking-wider">Upcycled Materials</p>
                </div>
                <div>
                  <p className="font-serif text-2xl font-bold text-forest">500+</p>
                  <p className="text-[11px] text-charcoal/60 uppercase tracking-wider">Artisans Empowered</p>
                </div>
                <div>
                  <p className="font-serif text-2xl font-bold text-forest">0</p>
                  <p className="text-[11px] text-charcoal/60 uppercase tracking-wider">Toxic Chemicals</p>
                </div>
              </div>
            </div>

            {/* Editorial Image Hero Composition */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Background decorative blob */}
                <div className="absolute -inset-4 bg-gradient-to-tr from-sage/30 to-terracotta/20 rounded-3xl blur-2xl -z-10 transform -rotate-3" />

                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/5] bg-ivory">
                  <img
                    src={
                      heroContent?.image ||
                      'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=1200'
                    }
                    alt="Handmade dried floral art and upcycled textile hampers"
                    className="w-full h-full object-cover"
                  />

                  {/* Floating badge */}
                  <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-beige shadow-lg">
                    <p className="text-xs uppercase font-semibold text-sage tracking-wider">Featured Handcraft</p>
                    <p className="font-serif text-sm font-bold text-forest">Upcycled Marigold & Jasmine Botanicals</p>
                    <p className="text-[11px] text-charcoal/60 mt-0.5">Sourced from temple offerings across Bengaluru & Varanasi</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. OUR DUAL MISSION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs uppercase tracking-widest text-sage font-bold font-sans">Our Purpose</span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-forest">
            Two Streams of Regeneration
          </h2>
          <p className="text-sm sm:text-base text-charcoal/70 leading-relaxed font-sans">
            BLOOMORA tackles two critical waste challenges in India through thoughtful design and dignified circular workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Card 1: Flower Upcycling */}
          <div className="relative rounded-3xl bg-white border border-beige p-8 lg:p-10 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-sage/20 text-forest flex items-center justify-center">
                <Flower2 className="w-7 h-7 text-forest" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-forest">Temple & Event Flower Upcycling</h3>
              <p className="text-sm text-charcoal/70 leading-relaxed font-sans">
                Every day, thousands of kilograms of sacred flowers are offered at temples and celebrations, often ending up in water bodies. We collect these flowers, sun-dry them, and lovingly handcraft aromatic potpourri, resin floral art, organic home decor, and natural botanical dyes.
              </p>
              <ul className="space-y-2 text-xs text-charcoal/80 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sage" /> Sourced from temples, flower markets, and weddings
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sage" /> Preserves fresh essential oils and organic pigments
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sage" /> Diverts floral waste from sacred rivers
                </li>
              </ul>
            </div>
            <div className="pt-8 mt-6 border-t border-beige">
              <Link
                to="/flowers"
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-forest group-hover:text-forest-light"
              >
                <span>Contribute Flower Waste</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Card 2: Clothing Donation & Upcycling */}
          <div className="relative rounded-3xl bg-white border border-beige p-8 lg:p-10 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-terracotta/20 text-terracotta flex items-center justify-center">
                <Recycle className="w-7 h-7 text-terracotta" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-forest">Clothing Donation & Textile Upcycling</h3>
              <p className="text-sm text-charcoal/70 leading-relaxed font-sans">
                Unused garments in our wardrobes hold immense potential. We facilitate seamless doorstep clothing donations. Wearable garments are cleaned and distributed to underserved communities, while damaged textiles are converted into durable tote bags, aprons, and artisanal accessories.
              </p>
              <ul className="space-y-2 text-xs text-charcoal/80 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-terracotta" /> Dignified redistribution of wearable clothes
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-terracotta" /> Creative textile upcycling for damaged fabrics
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-terracotta" /> Free pickup scheduling & real-time tracking
                </li>
              </ul>
            </div>
            <div className="pt-8 mt-6 border-t border-beige">
              <Link
                to="/donate"
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-terracotta group-hover:text-terracotta-dark"
              >
                <span>Schedule a Clothing Donation</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SHOP BY CATEGORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-sage font-bold font-sans">Curated Catalogue</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-forest mt-1">Shop by Category</h2>
          </div>
          <Link
            to="/shop"
            className="text-xs font-semibold uppercase tracking-wider text-forest hover:text-forest-light flex items-center gap-1 group"
          >
            <span>View All Products</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.slug}`}
              className="group flex flex-col rounded-2xl bg-white border border-beige overflow-hidden hover:shadow-md transition-all text-center p-3 sm:p-4"
            >
              <div className="aspect-square rounded-xl overflow-hidden bg-ivory mb-3">
                <img
                  src={
                    cat.image ||
                    'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=400'
                  }
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h4 className="font-serif text-xs sm:text-sm font-semibold text-charcoal group-hover:text-forest line-clamp-1">
                {cat.name}
              </h4>
              <p className="text-[10px] text-charcoal/50 mt-0.5">Explore pieces</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. BESTSELLING PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-sage font-bold font-sans">Artisanal Highlights</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-forest mt-1">Bestselling Creations</h2>
          </div>
          <Link
            to="/shop"
            className="text-xs font-semibold uppercase tracking-wider text-forest hover:text-forest-light flex items-center gap-1 group"
          >
            <span>Browse Full Catalogue</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestsellers.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </section>

      {/* 5. HOW WE TRANSFORM WASTE (PROCESS) */}
      <section className="bg-white border-y border-beige py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <span className="text-xs uppercase tracking-widest text-sage font-bold font-sans">The Circular Journey</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-forest">How We Transform Waste</h2>
            <p className="text-sm text-charcoal/70 font-sans">From neglected sacred petals to prized sustainable creations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-ivory border border-beige relative">
              <span className="font-serif text-4xl font-bold text-sage/30 absolute top-4 right-4">01</span>
              <div className="w-10 h-10 rounded-xl bg-forest text-ivory flex items-center justify-center mb-4">
                <Truck className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-lg font-bold text-forest mb-2">Conscious Collection</h4>
              <p className="text-xs text-charcoal/70 leading-relaxed font-sans">
                We partner with temples, wedding banquet halls, and flower markets to systematically collect discarded flowers and fabric donations.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-ivory border border-beige relative">
              <span className="font-serif text-4xl font-bold text-sage/30 absolute top-4 right-4">02</span>
              <div className="w-10 h-10 rounded-xl bg-sage text-forest flex items-center justify-center mb-4">
                <Leaf className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-lg font-bold text-forest mb-2">Natural Processing</h4>
              <p className="text-xs text-charcoal/70 leading-relaxed font-sans">
                Flowers are hand-sorted, petal-separated, and naturally sun-dried without harmful synthetic chemicals or artificial colorants.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-ivory border border-beige relative">
              <span className="font-serif text-4xl font-bold text-sage/30 absolute top-4 right-4">03</span>
              <div className="w-10 h-10 rounded-xl bg-terracotta text-ivory flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-lg font-bold text-forest mb-2">Artisanal Handcrafting</h4>
              <p className="text-xs text-charcoal/70 leading-relaxed font-sans">
                Local women artisans handcraft potpourri, pressed botanical wall frames, organic incense, and upcycled textile bags.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. DONATE YOUR CLOTHES (CALLOUT BANNER) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-forest text-ivory overflow-hidden p-8 sm:p-12 lg:p-16">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="text-xs uppercase tracking-widest text-sage font-bold font-sans">Circular Wardrobe</span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-ivory leading-tight">
              Your Unused Clothes Can Create Someone's New Beginning.
            </h2>
            <p className="text-sm sm:text-base text-ivory/70 font-sans leading-relaxed">
              Clear your closet with purpose. Clean, wearable clothes are gifted directly to families in need; worn fabrics are lovingly rewoven by our rural artisans.
            </p>
            <div className="pt-4 flex flex-wrap gap-4">
              <Link
                to="/donate"
                className="px-8 py-3.5 rounded-full bg-terracotta text-ivory font-semibold text-xs tracking-wider uppercase hover:bg-terracotta-dark transition-colors shadow-md"
              >
                Schedule Free Pickup
              </Link>
              <Link
                to="/track"
                className="px-8 py-3.5 rounded-full border border-white/30 text-ivory font-semibold text-xs tracking-wider uppercase hover:bg-white/10 transition-colors"
              >
                Track Previous Request
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CUSTOMER TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
          <span className="text-xs uppercase tracking-widest text-sage font-bold font-sans">Community Love</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-forest">What Our Patrons Say</h2>
          <p className="text-sm text-charcoal/70 font-sans">Real stories from people who choose beauty with responsibility.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-beige shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-500" />
                ))}
              </div>
              <p className="font-serif text-sm italic text-charcoal leading-relaxed">
                "The Sacred Marigold potpourri bowl set smells divine. Knowing it came from temple offerings rather than ending up in a river makes it feel sacred."
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-beige/60">
              <p className="text-xs font-bold text-forest">Pooja Venkatesh</p>
              <p className="text-[11px] text-charcoal/50">Bengaluru, Karnataka</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-beige shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-500" />
                ))}
              </div>
              <p className="font-serif text-sm italic text-charcoal leading-relaxed">
                "Donated 12 gently used cotton kurtas. The BLOOMORA team gave me a tracking ID, and I could actually see when they were sorted and distributed!"
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-beige/60">
              <p className="text-xs font-bold text-forest">Rohit Malhotra</p>
              <p className="text-[11px] text-charcoal/50">Mumbai, Maharashtra</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-beige shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-500" />
                ))}
              </div>
              <p className="font-serif text-sm italic text-charcoal leading-relaxed">
                "The botanical resin frame preserved real dried hibiscus flowers. It is the centerpiece of my living room. Truly luxury sustainable decor."
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-beige/60">
              <p className="text-xs font-bold text-forest">Ananya Sen</p>
              <p className="text-[11px] text-charcoal/50">Kolkata, West Bengal</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
