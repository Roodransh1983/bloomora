import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, Search, X } from 'lucide-react';
import { api } from '../services/api';
import { Product, Category } from '../types';
import { ProductCard } from '../components/ui/ProductCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const selectedCategory = searchParams.get('category') || '';
  const searchQuery = searchParams.get('search') || '';
  const sortBy = searchParams.get('sort') || 'popular';

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.categories.list() as { data: Category[] } | Category[];
        setCategories(Array.isArray(res) ? res : (res as { data: Category[] }).data || []);
      } catch (err) {
        console.error('Fetch categories error:', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params: Record<string, string> = {};
        if (selectedCategory) params.category = selectedCategory;
        if (searchQuery) params.search = searchQuery;
        if (sortBy) params.sort = sortBy;

        const res = await api.products.list(params) as { products: Product[]; total: number };
        setProducts(res.products || []);
        setTotal(res.total || 0);
      } catch (err) {
        console.error('Fetch products error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategory, searchQuery, sortBy]);

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs uppercase tracking-widest text-sage font-bold font-sans">Artisanal Store</span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-forest mt-1">Sustainable Catalogue</h1>
        <p className="text-sm text-charcoal/70 mt-2 font-sans">
          Every piece is handcrafted from upcycled temple flowers, floral offerings, and reclaimed textiles.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block space-y-6">
          <div className="bg-white rounded-2xl border border-beige p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-beige">
              <h3 className="font-serif text-base font-bold text-forest flex items-center gap-2">
                <Filter className="w-4 h-4 text-sage" /> Filters
              </h3>
              {(selectedCategory || searchQuery) && (
                <button
                  onClick={() => setSearchParams({})}
                  className="text-[11px] text-terracotta hover:underline font-medium"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal/70 mb-3 font-sans">
                Categories
              </h4>
              <div className="space-y-1.5 text-xs">
                <button
                  onClick={() => updateFilter('category', '')}
                  className={`w-full text-left px-3 py-2 rounded-xl transition-colors ${
                    !selectedCategory ? 'bg-forest text-ivory font-semibold' : 'text-charcoal/80 hover:bg-ivory'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => updateFilter('category', cat.slug)}
                    className={`w-full text-left px-3 py-2 rounded-xl transition-colors flex items-center justify-between ${
                      selectedCategory === cat.slug
                        ? 'bg-forest text-ivory font-semibold'
                        : 'text-charcoal/80 hover:bg-ivory'
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    {cat._count?.products !== undefined && (
                      <span className="text-[10px] opacity-70">({cat._count.products})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Top Filter & Sort Bar */}
          <div className="bg-white rounded-2xl border border-beige p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-beige text-xs font-medium text-forest"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
              </button>
              <span className="text-xs text-charcoal/60 font-sans">
                Showing <strong className="text-charcoal">{products.length}</strong> of {total} creations
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <label className="text-xs text-charcoal/60 font-sans">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="text-xs bg-ivory border border-beige rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-forest text-charcoal font-medium"
              >
                <option value="popular">Most Popular</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">Newest Additions</option>
              </select>
            </div>
          </div>

          {/* Active filter badges */}
          {(selectedCategory || searchQuery) && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-charcoal/60">Active:</span>
              {selectedCategory && (
                <span className="inline-flex items-center gap-1 text-xs bg-sage/20 text-forest px-2.5 py-1 rounded-full font-medium">
                  {categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}
                  <button onClick={() => updateFilter('category', '')}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 text-xs bg-terracotta/20 text-terracotta px-2.5 py-1 rounded-full font-medium">
                  "{searchQuery}"
                  <button onClick={() => updateFilter('search', '')}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Products */}
          {loading ? (
            <div className="py-24 flex justify-center">
              <LoadingSpinner />
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-3xl border border-beige p-12 text-center space-y-3">
              <p className="font-serif text-xl font-bold text-forest">No creations found</p>
              <p className="text-xs text-charcoal/60 max-w-sm mx-auto font-sans">
                Try selecting a different category or clearing search keywords.
              </p>
              <button
                onClick={() => setSearchParams({})}
                className="mt-3 px-5 py-2 rounded-full bg-forest text-ivory text-xs font-semibold"
              >
                View All Creations
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
