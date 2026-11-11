import React, { useEffect, useState } from 'react';
import { Ticket, Plus, Trash2, Check, X } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export function AdminCoupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minOrderValue: 499,
  });

  const fetchCoupons = async () => {
    try {
      const res = await api.admin.coupons() as { data: any[] };
      setCoupons(res.data || []);
    } catch (err: any) {
      error(err.message || 'Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.admin.createCoupon({
        code: formData.code.toUpperCase().trim(),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minOrderValue: Number(formData.minOrderValue),
      });
      success(`Coupon "${formData.code.toUpperCase()}" created!`);
      setModalOpen(false);
      setFormData({ code: '', discountType: 'PERCENTAGE', discountValue: 10, minOrderValue: 499 });
      await fetchCoupons();
    } catch (err: any) {
      error(err.message || 'Failed to create coupon');
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!window.confirm(`Delete coupon "${code}"?`)) return;
    try {
      await api.admin.deleteCoupon(id);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      success(`Coupon "${code}" deleted.`);
    } catch (err: any) {
      error(err.message || 'Failed to delete coupon');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-beige gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-sage font-bold font-sans">
            Promotions & Incentives
          </span>
          <h1 className="font-serif text-3xl font-bold text-forest mt-0.5">Discount Coupons</h1>
          <p className="text-xs text-charcoal/60 mt-1 font-sans">
            Create percentage or flat rupee discounts for sustainable promotions.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-6 py-3 rounded-full bg-forest text-ivory text-xs font-semibold hover:bg-forest-light transition-all flex items-center justify-center gap-2 shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4 text-sage" />
          <span>Create New Coupon</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : coupons.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-beige text-center space-y-2">
          <Ticket className="w-10 h-10 text-charcoal/30 mx-auto" />
          <p className="font-serif text-base font-semibold text-forest">No coupons available</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-beige shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-ivory border-b border-beige text-charcoal/70 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Coupon Code</th>
                  <th className="py-3.5 px-4">Discount Type</th>
                  <th className="py-3.5 px-4">Value</th>
                  <th className="py-3.5 px-4">Min Order Value</th>
                  <th className="py-3.5 px-4">Active</th>
                  <th className="py-3.5 px-4 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige/60">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-ivory/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-forest text-sm">{c.code}</td>
                    <td className="py-3 px-4 text-charcoal/70">{c.discountType}</td>
                    <td className="py-3 px-4 font-serif font-bold text-charcoal">
                      {c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : `₹${c.discountValue}`}
                    </td>
                    <td className="py-3 px-4 text-charcoal/70">₹{c.minOrderValue}</td>
                    <td className="py-3 px-4">
                      {c.isActive ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600">
                          Disabled
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(c.id, c.code)}
                        className="p-1.5 rounded-lg border border-beige hover:bg-red-50 text-charcoal/40 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-beige p-6 sm:p-8 space-y-4">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-charcoal/40 hover:text-charcoal"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-2xl font-bold text-forest">Create Discount Code</h3>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal/80 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. EARTHDAY25"
                  className="w-full px-3 py-2 bg-ivory border border-beige rounded-xl text-xs uppercase font-mono font-bold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal/80 mb-1">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-3 py-2 bg-ivory border border-beige rounded-xl text-xs font-medium focus:outline-none"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Flat Rupees (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal/80 mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-ivory border border-beige rounded-xl text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal/80 mb-1">
                  Minimum Order Value (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={formData.minOrderValue}
                  onChange={(e) => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-ivory border border-beige rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2 rounded-full border border-beige text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-forest text-ivory text-xs font-semibold hover:bg-forest-light"
                >
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
