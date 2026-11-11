import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  Share2,
  Check,
  Send,
} from 'lucide-react';
import { api } from '../services/api';
import { Product, Review } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { ProductCard } from '../components/ui/ProductCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'materials' | 'sustainability'>('desc');
  const [loading, setLoading] = useState(true);

  // Review Form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { success, error } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        if (!slug) return;
        const prodData = await api.products.get(slug) as { product: Product; related: Product[] };
        const p = prodData.product;
        setProduct(p);
        setRelated(prodData.related || []);

        const initialImg =
          p.images?.find((i) => i.isPrimary)?.url ||
          p.images?.[0]?.url ||
          'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=800';
        setSelectedImage(initialImg);

        // Fetch reviews
        const revData = await api.reviews.list(p.id) as { reviews: Review[] };
        setReviews(revData.reviews || []);
      } catch (err) {
        console.error('Fetch product detail error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex justify-center items-center bg-ivory">
        <LoadingSpinner />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] pt-32 flex flex-col items-center justify-center text-center p-4">
        <h2 className="font-serif text-2xl font-bold text-forest">Creation Not Found</h2>
        <p className="text-xs text-charcoal/60 mt-1 mb-4">The piece you are looking for may have been archived.</p>
        <Link to="/shop" className="px-6 py-2.5 rounded-full bg-forest text-ivory text-xs font-semibold">
          Return to Catalogue
        </Link>
      </div>
    );
  }

  const handleAddToCart = async () => {
    if (product.stock <= 0) return;
    try {
      await addToCart(product.id, quantity);
      success(`Added ${quantity} × "${product.name}" to cart`);
    } catch {
      // Handled
    }
  };

  const handleBuyNow = async () => {
    if (product.stock <= 0) return;
    try {
      await addToCart(product.id, quantity);
      navigate('/checkout');
    } catch {
      // Handled
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      error('Please sign in to write a review.');
      return;
    }
    if (!reviewComment.trim()) return;

    setSubmittingReview(true);
    try {
      await api.reviews.submit(product.id, {
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      success('Review submitted successfully! Thank you for supporting our artisans.');
      setReviewComment('');
      // Refresh reviews
      const revData = await api.reviews.list(product.id) as { reviews: Review[] };
      setReviews(revData.reviews || []);
    } catch (err: any) {
      error(err.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const wishlisted = isWishlisted(product.id);

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-charcoal/60 mb-8 font-sans">
        <Link to="/" className="hover:text-forest">
          Home
        </Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-forest">
          Catalogue
        </Link>
        <span>/</span>
        <span className="text-forest font-semibold truncate max-w-xs">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Product Images Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative rounded-3xl overflow-hidden bg-white border border-beige aspect-square shadow-sm">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            {product.sustainabilityLabel && (
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-forest px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-sage" />
                <span>{product.sustainabilityLabel}</span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.url)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImage === img.url ? 'border-forest ring-2 ring-forest/20' : 'border-beige hover:border-forest/40'
                  }`}
                >
                  <img src={img.url} alt={img.altText || product.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Purchase Info */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-sage font-bold font-sans">
              {product.category?.name || 'Handmade Sustainability'}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest mt-1.5 leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-3 text-xs">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(product.rating) ? 'fill-amber-500 text-amber-500' : 'text-beige-dark'
                    }`}
                  />
                ))}
              </div>
              <span className="font-semibold text-charcoal">{product.rating.toFixed(1)}</span>
              <span className="text-charcoal/50">({product.reviewCount} artisan reviews)</span>
            </div>
          </div>

          {/* Price */}
          <div className="p-4 rounded-2xl bg-white border border-beige flex items-baseline justify-between">
            <div>
              <span className="font-serif text-3xl font-bold text-forest">₹{product.price.toLocaleString('en-IN')}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="ml-3 text-sm text-charcoal/40 line-through">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
              <p className="text-[11px] text-charcoal/50 mt-0.5">Inclusive of all taxes. Free shipping on orders over ₹499.</p>
            </div>

            {/* Stock indicator */}
            <div className="text-right">
              {product.stock > 10 ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-semibold">
                  <Check className="w-3 h-3" /> In Stock ({product.stock})
                </span>
              ) : product.stock > 0 ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full font-semibold">
                  Low Stock ({product.stock} left)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] text-red-700 bg-red-50 px-2.5 py-1 rounded-full font-semibold">
                  Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* Short description */}
          <p className="text-sm text-charcoal/70 leading-relaxed font-sans">{product.description}</p>

          {/* Quantity & CTA buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-beige rounded-full bg-white px-3 py-1.5">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || product.stock <= 0}
                  className="w-6 h-6 flex items-center justify-center text-charcoal/60 hover:text-charcoal disabled:opacity-30"
                >
                  -
                </button>
                <span className="w-10 text-center text-xs font-semibold text-charcoal">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock || product.stock <= 0}
                  className="w-6 h-6 flex items-center justify-center text-charcoal/60 hover:text-charcoal disabled:opacity-30"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-3 rounded-full border transition-colors ${
                  wishlisted
                    ? 'border-terracotta bg-terracotta text-white'
                    : 'border-beige bg-white text-charcoal/70 hover:text-terracotta'
                }`}
                title="Save to Wishlist"
              >
                <Heart className={`w-5 h-5 ${wishlisted ? 'fill-white' : ''}`} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="w-full py-3.5 rounded-full bg-forest text-ivory text-xs font-semibold hover:bg-forest-light transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Bag</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="w-full py-3.5 rounded-full bg-terracotta text-ivory text-xs font-semibold hover:bg-terracotta-dark transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                <span>Buy Now</span>
              </button>
            </div>
          </div>

          {/* Perks */}
          <div className="pt-4 border-t border-beige grid grid-cols-2 gap-4 text-xs text-charcoal/70 font-sans">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-sage" />
              <span>Pan-India Safe Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sage" />
              <span>100% Upcycled Materials</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-20 border-t border-beige pt-12">
        <div className="flex items-center gap-8 border-b border-beige pb-4 mb-8">
          <button
            onClick={() => setActiveTab('desc')}
            className={`font-serif text-lg font-bold pb-2 transition-all relative ${
              activeTab === 'desc'
                ? 'text-forest after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-forest'
                : 'text-charcoal/50 hover:text-charcoal'
            }`}
          >
            Crafting & Story
          </button>
          <button
            onClick={() => setActiveTab('materials')}
            className={`font-serif text-lg font-bold pb-2 transition-all relative ${
              activeTab === 'materials'
                ? 'text-forest after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-forest'
                : 'text-charcoal/50 hover:text-charcoal'
            }`}
          >
            Materials & Composition
          </button>
          <button
            onClick={() => setActiveTab('sustainability')}
            className={`font-serif text-lg font-bold pb-2 transition-all relative ${
              activeTab === 'sustainability'
                ? 'text-forest after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-forest'
                : 'text-charcoal/50 hover:text-charcoal'
            }`}
          >
            Ecological Impact
          </button>
        </div>

        <div className="max-w-3xl text-sm text-charcoal/80 leading-relaxed font-sans space-y-4">
          {activeTab === 'desc' && (
            <div>
              <p>{product.description}</p>
              {product.details && <p className="mt-4 p-4 rounded-2xl bg-white border border-beige">{product.details}</p>}
            </div>
          )}

          {activeTab === 'materials' && (
            <div className="space-y-3">
              <p>
                Every element of this piece is thoughtfully selected to minimize environmental footprints:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs">
                <li>Primary floral matter: Sun-dried discarded marigold, rose, and temple jasmine botanicals.</li>
                <li>Base materials: Reclaimed sustainable wood, natural plant fibers, or biodegradable craft pulp.</li>
                <li>Finishing: Organic essential oil infusions without petrochemical phthalates or artificial fixatives.</li>
                <li>Packaging: 100% compostable unbleached kraft paper box printed with water-based soy ink.</li>
              </ul>
            </div>
          )}

          {activeTab === 'sustainability' && (
            <div className="space-y-3">
              <p>
                By choosing this BLOOMORA handcrafted piece, you actively divert waste from Indian waterways:
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-sage/10 border border-sage/30">
                  <p className="font-serif text-xl font-bold text-forest">~1.2 kg</p>
                  <p className="text-xs text-charcoal/70">Flower waste prevented from entering rivers</p>
                </div>
                <div className="p-4 rounded-xl bg-terracotta/10 border border-terracotta/30">
                  <p className="font-serif text-xl font-bold text-terracotta">3.5 Hours</p>
                  <p className="text-xs text-charcoal/70">Dignified artisan livelihood generated</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="mt-20 border-t border-beige pt-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h3 className="font-serif text-2xl font-bold text-forest">Customer Reviews ({reviews.length})</h3>
            <p className="text-xs text-charcoal/60 mt-0.5">Verified experiences from conscious consumers.</p>
          </div>
        </div>

        {/* Review list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {reviews.length === 0 ? (
            <div className="col-span-2 p-8 rounded-2xl bg-white border border-beige text-center">
              <p className="font-serif text-base font-semibold text-forest">No reviews yet for this piece</p>
              <p className="text-xs text-charcoal/50 mt-1">Be the first to share your experience!</p>
            </div>
          ) : (
            reviews.map((rev) => (
              <div key={rev.id} className="p-5 rounded-2xl bg-white border border-beige shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-forest">{rev.userName}</span>
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating ? 'fill-amber-500 text-amber-500' : 'text-beige-dark'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-charcoal/80 leading-relaxed font-sans">{rev.comment}</p>
                <span className="text-[10px] text-charcoal/40 block">
                  {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Write a review */}
        <div className="max-w-xl p-6 rounded-3xl bg-white border border-beige shadow-sm">
          <h4 className="font-serif text-lg font-bold text-forest mb-1">Write a Review</h4>
          <p className="text-xs text-charcoal/60 mb-4">Share your feedback to help our artisan community thrive.</p>

          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal/70 mb-1">Your Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setReviewRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= reviewRating ? 'fill-amber-500 text-amber-500' : 'text-beige'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal/70 mb-1">Your Thoughts</label>
              <textarea
                rows={3}
                required
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="What did you love about the quality, fragrance, or artisan craftsmanship?"
                className="w-full p-3 bg-ivory border border-beige rounded-xl text-xs focus:ring-1 focus:ring-forest focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submittingReview}
              className="px-6 py-2.5 rounded-full bg-forest text-ivory text-xs font-semibold hover:bg-forest-light transition-colors flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submittingReview ? 'Submitting...' : 'Post Review'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="mt-24 border-t border-beige pt-16">
          <h3 className="font-serif text-2xl font-bold text-forest mb-8">Related Handcrafted Pieces</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
