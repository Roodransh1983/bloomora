import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star, Sparkles } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { success } = useToast();

  const primaryImage =
    product.images?.find((img) => img.isPrimary)?.url ||
    product.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=800';

  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) return;
    try {
      await addToCart(product.id, 1);
      success(`Added "${product.name}" to cart`);
    } catch {
      // Handled
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(product.id);
  };

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  return (
    <div className="group relative bg-white rounded-2xl border border-beige/80 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full">
      {/* Image container */}
      <Link to={`/shop/${product.slug}`} className="block relative aspect-square overflow-hidden bg-ivory">
        <img
          src={primaryImage}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Sustainability Badge */}
        {product.sustainabilityLabel && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-forest px-2.5 py-1 rounded-full text-[10px] font-medium tracking-wide uppercase shadow-sm flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-sage" />
            <span className="truncate max-w-[140px]">{product.sustainabilityLabel}</span>
          </div>
        )}

        {/* Discount Badge */}
        {discountPercent && (
          <div className="absolute bottom-3 left-3 bg-terracotta text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
            {discountPercent}% OFF
          </div>
        )}

        {/* Wishlist button */}
        <button
          onClick={handleToggleWishlist}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
            wishlisted
              ? 'bg-terracotta text-white'
              : 'bg-white/80 text-charcoal/70 hover:bg-white hover:text-terracotta'
          }`}
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-white' : ''}`} />
        </button>

        {/* Out of stock overlay */}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-charcoal/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-white text-charcoal text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        {/* Category & Rating */}
        <div className="flex items-center justify-between text-xs text-charcoal/60 mb-1.5 font-sans">
          <span className="uppercase tracking-wider text-[10px] text-sage font-semibold">
            {product.category?.name || 'Sustainable'}
          </span>
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="font-medium text-charcoal/80 text-xs">{product.rating.toFixed(1)}</span>
            <span className="text-[10px] text-charcoal/40">({product.reviewCount})</span>
          </div>
        </div>

        {/* Title */}
        <Link to={`/shop/${product.slug}`} className="block flex-1 group-hover:text-forest transition-colors">
          <h3 className="font-serif text-base font-semibold text-charcoal leading-snug line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Price & Action */}
        <div className="mt-4 pt-3 border-t border-beige/60 flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="font-serif text-lg font-bold text-forest">₹{product.price.toLocaleString('en-IN')}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-charcoal/40 line-through">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
              product.stock > 0
                ? 'bg-forest text-ivory hover:bg-forest-light'
                : 'bg-beige/60 text-charcoal/40 cursor-not-allowed'
            }`}
            title="Add to Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
