import React, { useEffect, useState } from 'react';
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  Search,
  Check,
  X,
  Sparkles,
  Upload,
} from 'lucide-react';
import { api } from '../../services/api';
import { Product, Category } from '../../types';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ImageUpload } from '../../components/ui/ImageUpload';

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    details: '',
    price: 499,
    originalPrice: 699,
    stock: 25,
    sustainabilityLabel: 'Made from upcycled temple flowers',
    categoryId: '',
    isFeatured: false,
    isBestseller: false,
    imageUrl: '',
  });

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.products.list({ limit: 100 }) as Promise<{ products: Product[] }>,
        api.categories.list() as Promise<{ data: Category[] } | Category[]>,
      ]);
      setProducts(prodRes.products || []);
      const cats = Array.isArray(catRes) ? catRes : (catRes as { data: Category[] }).data || [];
      setCategories(cats);
      if (cats.length > 0 && !formData.categoryId) {
        setFormData((prev) => ({ ...prev, categoryId: cats[0].id }));
      }
    } catch (err: any) {
      error(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      details: '',
      price: 499,
      originalPrice: 699,
      stock: 25,
      sustainabilityLabel: 'Made from upcycled materials',
      categoryId: categories[0]?.id || '',
      isFeatured: false,
      isBestseller: false,
      imageUrl: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      slug: p.slug,
      description: p.description,
      details: p.details || '',
      price: p.price,
      originalPrice: p.originalPrice || 0,
      stock: p.stock,
      sustainabilityLabel: p.sustainabilityLabel || '',
      categoryId: p.categoryId,
      isFeatured: p.isFeatured,
      isBestseller: p.isBestseller,
      imageUrl: p.images?.[0]?.url || '',
    });
    setModalOpen(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setFormData({ ...formData, name: val, slug: generatedSlug });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        details: formData.details,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        stock: Number(formData.stock),
        sustainabilityLabel: formData.sustainabilityLabel,
        categoryId: formData.categoryId,
        isFeatured: formData.isFeatured,
        isBestseller: formData.isBestseller,
      };

      if (formData.imageUrl) {
        payload.images = [formData.imageUrl];
      }

      if (editingProduct) {
        await api.products.update(editingProduct.id, payload);
        success(`Product "${formData.name}" updated successfully!`);
      } else {
        await api.products.create(payload);
        success(`New product "${formData.name}" added to catalogue!`);
      }

      setModalOpen(false);
      await fetchData();
    } catch (err: any) {
      error(err.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await api.products.delete(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      success(`Product "${name}" deleted.`);
    } catch (err: any) {
      error(err.message || 'Failed to delete product');
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-beige gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-sage font-bold font-sans">
            Inventory & Catalogue
          </span>
          <h1 className="font-serif text-3xl font-bold text-forest mt-0.5">Product Management</h1>
          <p className="text-xs text-charcoal/60 mt-1 font-sans">
            Create, edit pricing, manage stock levels, and upload artisanal product photos.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-6 py-3 rounded-full bg-forest text-ivory text-xs font-semibold hover:bg-forest-light transition-all flex items-center justify-center gap-2 shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4 text-sage" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Table */}
      <div className="space-y-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name or category..."
            className="w-full pl-9 pr-3 py-2.5 bg-white border border-beige rounded-xl text-xs focus:ring-1 focus:ring-forest focus:outline-none"
          />
          <Search className="w-4 h-4 text-charcoal/40 absolute left-3 top-3" />
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-beige shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-ivory border-b border-beige text-charcoal/70 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Creation</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Price (INR)</th>
                    <th className="py-3.5 px-4">Inventory Stock</th>
                    <th className="py-3.5 px-4">Badges</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-beige/60">
                  {filteredProducts.map((p) => {
                    const img =
                      p.images?.[0]?.url ||
                      'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=200';

                    return (
                      <tr key={p.id} className="hover:bg-ivory/50 transition-colors">
                        <td className="py-3 px-4 flex items-center gap-3">
                          <img
                            src={img}
                            alt={p.name}
                            className="w-10 h-10 rounded-xl object-cover bg-ivory border border-beige shrink-0"
                          />
                          <div className="min-w-0 max-w-xs">
                            <p className="font-semibold text-charcoal truncate">{p.name}</p>
                            <p className="text-[10px] text-charcoal/50 truncate">{p.sustainabilityLabel}</p>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-charcoal/70">
                          {p.category?.name || 'Unassigned'}
                        </td>

                        <td className="py-3 px-4 font-serif font-bold text-forest">
                          ₹{p.price.toLocaleString('en-IN')}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              p.stock > 10
                                ? 'bg-emerald-50 text-emerald-700'
                                : p.stock > 0
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-red-50 text-red-700'
                            }`}
                          >
                            {p.stock} units
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex gap-1">
                            {p.isFeatured && (
                              <span className="px-1.5 py-0.5 rounded bg-sage/20 text-forest text-[10px] font-semibold">
                                Featured
                              </span>
                            )}
                            {p.isBestseller && (
                              <span className="px-1.5 py-0.5 rounded bg-terracotta/20 text-terracotta text-[10px] font-semibold">
                                Bestseller
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(p)}
                              className="p-1.5 rounded-lg border border-beige hover:bg-ivory text-charcoal/70 hover:text-forest transition-colors"
                              title="Edit Product"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(p.id, p.name)}
                              className="p-1.5 rounded-lg border border-beige hover:bg-red-50 text-charcoal/70 hover:text-red-600 transition-colors"
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-beige p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-charcoal/40 hover:text-charcoal"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="font-serif text-2xl font-bold text-forest mb-4">
              {editingProduct ? 'Edit Creation' : 'Add New Handcrafted Product'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal/80 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleNameChange}
                    placeholder="e.g. Temple Marigold Candle"
                    className="w-full px-3 py-2 bg-ivory border border-beige rounded-xl text-xs focus:ring-1 focus:ring-forest focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal/80 mb-1">URL Slug *</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3 py-2 bg-ivory border border-beige rounded-xl text-xs focus:ring-1 focus:ring-forest focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal/80 mb-1">Category *</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 bg-ivory border border-beige rounded-xl text-xs focus:ring-1 focus:ring-forest focus:outline-none font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal/80 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-ivory border border-beige rounded-xl text-xs focus:ring-1 focus:ring-forest focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal/80 mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-ivory border border-beige rounded-xl text-xs focus:ring-1 focus:ring-forest focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal/80 mb-1">Units in Stock *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-ivory border border-beige rounded-xl text-xs focus:ring-1 focus:ring-forest focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal/80 mb-1">
                    Sustainability Label
                  </label>
                  <input
                    type="text"
                    value={formData.sustainabilityLabel}
                    onChange={(e) => setFormData({ ...formData, sustainabilityLabel: e.target.value })}
                    placeholder="e.g. Made from upcycled temple flowers"
                    className="w-full px-3 py-2 bg-ivory border border-beige rounded-xl text-xs focus:ring-1 focus:ring-forest focus:outline-none"
                  />
                </div>
              </div>

              {/* High-priority Image Upload Module */}
              <div className="p-4 rounded-2xl bg-ivory border border-beige space-y-3">
                <span className="text-xs font-bold text-forest uppercase tracking-wider block">
                  Product Image Management
                </span>
                <ImageUpload
                  label="Upload Direct from Device (JPG / PNG / WEBP)"
                  category="product"
                  currentImage={formData.imageUrl}
                  onUploadComplete={(url) => setFormData({ ...formData, imageUrl: url })}
                />
                <div>
                  <label className="block text-[11px] text-charcoal/60 mb-1">Or paste an existing image URL:</label>
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/... or /uploads/..."
                    className="w-full px-3 py-1.5 bg-white border border-beige rounded-xl text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal/80 mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-ivory border border-beige rounded-xl text-xs focus:ring-1 focus:ring-forest focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-medium text-charcoal cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded text-forest focus:ring-forest"
                  />
                  <span>Featured Collection</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-medium text-charcoal cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isBestseller}
                    onChange={(e) => setFormData({ ...formData, isBestseller: e.target.checked })}
                    className="rounded text-forest focus:ring-forest"
                  />
                  <span>Mark as Bestseller</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-6 py-2.5 rounded-full border border-beige text-xs font-semibold hover:bg-ivory"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-2.5 rounded-full bg-forest text-ivory text-xs font-semibold hover:bg-forest-light transition-colors"
                >
                  {editingProduct ? 'Save Product Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
