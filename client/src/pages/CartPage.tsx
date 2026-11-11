import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft, Tag, Check, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

export function CartPage() {
  const { items, total, updateQuantity, removeFromCart, clearCart, isLoading } = useCart();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
  } | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const shippingFee = total > 499 || total === 0 ? 0 : 70;
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalTotal = Math.max(0, total + shippingFee - discountAmount);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setValidatingCoupon(true);
    try {
      const res = await api.coupons.validate({
        code: couponCode.trim(),
        orderTotal: total,
      }) as { success: boolean; discountAmount: number; message?: string };

      if (res.success) {
        setAppliedCoupon({ code: couponCode.toUpperCase().trim(), discountAmount: res.discountAmount });
        success(`Coupon "${couponCode.toUpperCase().trim()}" applied: Saved ₹${res.discountAmount}!`);
      } else {
        error(res.message || 'Invalid coupon code.');
      }
    } catch (err: any) {
      error(err.message || 'Failed to validate coupon.');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  if (items.length === 0 && !isLoading) {
    return (
      <div className="pt-36 pb-24 max-w-xl mx-auto px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-sage/20 text-forest flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8 text-forest" />
        </div>
        <h2 className="font-serif text-3xl font-bold text-forest">Your Bag is Empty</h2>
        <p className="text-xs text-charcoal/60 font-sans max-w-sm mx-auto">
          Explore our handcrafted dried-flower decor, natural home fragrances, and upcycled bags.
        </p>
        <div className="pt-4">
          <Link
            to="/shop"
            className="px-8 py-3.5 rounded-full bg-forest text-ivory text-xs font-semibold hover:bg-forest-light transition-colors inline-flex items-center gap-2"
          >
            <span>Explore Collection</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <span className="text-xs uppercase tracking-widest text-sage font-bold font-sans">Checkout Process</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest mt-1">Shopping Bag</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Items List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-3xl border border-beige overflow-hidden p-6 shadow-sm divide-y divide-beige/60">
            {items.map((item) => {
              const img =
                item.product?.images?.find((i) => i.isPrimary)?.url ||
                item.product?.images?.[0]?.url ||
                'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=400';

              return (
                <div key={item.id} className="py-5 first:pt-0 last:pb-0 flex items-center gap-4 sm:gap-6">
                  {/* Thumbnail */}
                  <Link
                    to={`/shop/${item.product.slug}`}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-ivory border border-beige overflow-hidden shrink-0"
                  >
                    <img src={img} alt={item.product.name} className="w-full h-full object-cover" />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase font-semibold text-sage tracking-wider">
                      {item.product.category?.name || 'Upcycled'}
                    </span>
                    <Link to={`/shop/${item.product.slug}`} className="block hover:text-forest transition-colors">
                      <h4 className="font-serif text-sm sm:text-base font-bold text-charcoal truncate">
                        {item.product.name}
                      </h4>
                    </Link>
                    <p className="font-serif text-sm font-semibold text-forest mt-1">
                      ₹{item.product.price.toLocaleString('en-IN')}
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center border border-beige rounded-full bg-ivory px-2 py-0.5 text-xs">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-5 h-5 flex items-center justify-center text-charcoal/60 hover:text-charcoal"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-semibold text-charcoal text-xs">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="w-5 h-5 flex items-center justify-center text-charcoal/60 hover:text-charcoal disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-xs text-charcoal/40 hover:text-red-600 transition-colors flex items-center gap-1"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                    </div>
                  </div>

                  {/* Line Total */}
                  <div className="text-right shrink-0">
                    <p className="font-serif text-base sm:text-lg font-bold text-charcoal">
                      ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2">
            <Link
              to="/shop"
              className="text-xs font-semibold text-forest hover:text-forest-light flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>

            <button
              onClick={clearCart}
              className="text-xs text-charcoal/50 hover:text-red-600 transition-colors"
            >
              Clear Entire Bag
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl border border-beige p-6 shadow-sm space-y-6">
            <h3 className="font-serif text-xl font-bold text-forest pb-3 border-b border-beige">Order Summary</h3>

            {/* Coupon Code Input */}
            <div>
              <label className="block text-xs font-semibold text-charcoal/70 mb-1.5 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-sage" /> Discount Coupon
              </label>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-sage/20 border border-sage/40 text-xs text-forest font-semibold">
                  <span>Code: {appliedCoupon.code} (-₹{appliedCoupon.discountAmount})</span>
                  <button onClick={handleRemoveCoupon} className="text-xs text-red-600 hover:underline">
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="e.g. BLOOM10"
                    className="flex-1 px-3 py-2 bg-ivory border border-beige rounded-xl text-xs uppercase focus:ring-1 focus:ring-forest focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={validatingCoupon}
                    className="px-4 py-2 bg-forest text-ivory text-xs font-semibold rounded-xl hover:bg-forest-light transition-colors"
                  >
                    Apply
                  </button>
                </form>
              )}
              <p className="text-[10px] text-charcoal/50 mt-1">Try codes: <strong>BLOOM10</strong> (10% off) or <strong>WELCOME200</strong> (₹200 off on ₹999+)</p>
            </div>

            {/* Calculations */}
            <div className="space-y-2.5 text-xs text-charcoal/80 font-sans pt-2 border-t border-beige/60">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping Charges</span>
                <span>
                  {shippingFee === 0 ? (
                    <strong className="text-emerald-700">FREE</strong>
                  ) : (
                    `₹${shippingFee}`
                  )}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-terracotta font-semibold">
                  <span>Coupon Discount</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="pt-3 border-t border-beige flex justify-between items-baseline">
                <span className="font-serif text-base font-bold text-forest">Estimated Total</span>
                <span className="font-serif text-2xl font-bold text-forest">
                  ₹{finalTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                navigate('/checkout', {
                  state: {
                    appliedCoupon: appliedCoupon?.code,
                    discountAmount,
                  },
                });
              }}
              className="w-full py-4 rounded-full bg-forest text-ivory text-xs font-semibold uppercase tracking-wider hover:bg-forest-light transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
