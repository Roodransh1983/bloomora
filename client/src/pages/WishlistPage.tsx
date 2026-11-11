import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight, ShoppingBag, Trash2 } from 'lucide-react';
import { api } from '../services/api';
import { Product } from '../types';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export function WishlistPage() {
  const { wishlistIds, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { success } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      try {
        const res = await api.wishlist.get() as { data: Array<{ product: Product }> } | Array<{ product: Product }>;
        const items = Array.isArray(res) ? res : (res as { data: Array<{ product: Product }> }).data || [];
        setProducts(items.map((i) => i.product).filter(Boolean));
      } catch (err) {
        console.error('Fetch wishlist error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlistProducts();
  }, [wishlistIds]);

  const handleAddToCart = async (product: Product) => {
    await addToCart(product.id, 1);
    success(`Added "${product.name}" to cart`);
  };

  const handleRemove = async (productId: string) => {
    await removeFromWishlist(productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  return (
    <div className="pt-28 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="border-b border-beige pb-4">
        <span className="text-xs uppercase tracking-widest text-sage font-bold font-sans">Curated Favourites</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest mt-1">My Saved Items</h1>
      </div>

      {loading ? (
        <div className="py-24 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-3xl border border-beige p-12 text-center space-y-4 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-terracotta/20 text-terracotta flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8 text-terracotta" />
          </div>
          <h3 className="font-serif text-xl font-bold text-forest">Your Wishlist is Empty</h3>
          <p className="text-xs text-charcoal/60 font-sans max-w-sm mx-auto">
            Click the heart icon on any product to save your favorite sustainable floral designs and upcycled bags for later.
          </p>
          <div className="pt-2">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-forest text-ivory text-xs font-semibold hover:bg-forest-light transition-colors"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const primaryImage =
              product.images?.find((img) => img.isPrimary)?.url ||
              product.images?.[0]?.url ||
              'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=800';

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-beige overflow-hidden shadow-sm flex flex-col justify-between"
              >
                <div>
                  <Link to={`/shop/${product.slug}`} className="block relative aspect-square bg-ivory">
                    <img src={primaryImage} alt={product.name} className="w-full h-full object-cover" />
                  </Link>

                  <div className="p-4 space-y-1">
                    <span className="text-[10px] uppercase font-semibold text-sage tracking-wider">
                      {product.category?.name || 'Upcycled'}
                    </span>
                    <Link to={`/shop/${product.slug}`}>
                      <h4 className="font-serif text-sm font-semibold text-charcoal hover:text-forest line-clamp-1">
                        {product.name}
                      </h4>
                    </Link>
                    <p className="font-serif text-base font-bold text-forest pt-1">
                      ₹{product.price.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0 flex items-center gap-2">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="flex-1 py-2 rounded-xl bg-forest text-ivory text-xs font-semibold hover:bg-forest-light transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" /> Add
                  </button>
                  <button
                    onClick={() => handleRemove(product.id)}
                    className="p-2 rounded-xl border border-beige text-charcoal/40 hover:text-red-600 transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
