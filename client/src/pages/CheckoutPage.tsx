import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Package,
  CreditCard,
  Truck,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

export function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const { success, error } = useToast();

  const state = (location.state as { appliedCoupon?: string; discountAmount?: number }) || {};
  const couponCode = state.appliedCoupon || '';
  const discountAmount = state.discountAmount || 0;
  const shippingFee = total > 499 || total === 0 ? 0 : 70;
  const finalTotal = Math.max(0, total + shippingFee - discountAmount);

  const [formData, setFormData] = useState({
    customerName: user?.name || '',
    customerEmail: user?.email || '',
    customerPhone: user?.phone || '',
    street: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pinCode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'TEST_GATEWAY' | 'COD'>('TEST_GATEWAY');
  const [loading, setLoading] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<{
    id: string;
    orderNumber: string;
    totalAmount: number;
    customerName: string;
    customerEmail: string;
    shippingAddress: string;
  } | null>(null);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.customerEmail || !formData.customerPhone || !formData.street || !formData.pinCode) {
      error('Please complete all shipping address fields.');
      return;
    }

    if (items.length === 0) {
      error('Your bag is empty.');
      navigate('/shop');
      return;
    }

    setLoading(true);
    try {
      const fullShippingAddress = `${formData.street}, ${formData.city}, ${formData.state} - ${formData.pinCode}`;

      const res = await api.orders.create({
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        shippingAddress: fullShippingAddress,
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
          price: i.product.price,
          productName: i.product.name,
          productImage: i.product.images?.[0]?.url || '',
        })),
        couponCode: couponCode || undefined,
        shippingFee,
        discountAmount,
        totalAmount: finalTotal,
      }) as { order: any; success: boolean };

      await clearCart();
      setConfirmedOrder(res.order);
      success(`Order placed successfully! Order #${res.order.orderNumber}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      error(err.message || 'Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  if (confirmedOrder) {
    return (
      <div className="pt-32 pb-24 max-w-2xl mx-auto px-4 text-center space-y-6 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-sage/20 text-forest flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10 text-forest" />
        </div>

        <div>
          <span className="text-xs uppercase tracking-widest text-sage font-bold font-sans">Order Confirmed</span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest mt-1">
            Thank You, {confirmedOrder.customerName}!
          </h1>
          <p className="text-xs text-charcoal/60 mt-1 font-sans">
            A confirmation receipt has been generated. Our artisans will begin hand-packing your order.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="p-6 rounded-3xl bg-white border border-beige shadow-sm space-y-4 text-left">
          <div className="flex items-center justify-between pb-3 border-b border-beige">
            <span className="text-xs text-charcoal/60">Order Reference</span>
            <span className="font-serif font-bold text-forest text-base sm:text-lg">
              {confirmedOrder.orderNumber}
            </span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-beige text-xs">
            <span className="text-charcoal/60">Total Paid (INR)</span>
            <span className="font-bold text-forest text-sm">
              ₹{confirmedOrder.totalAmount.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="text-xs space-y-1">
            <span className="text-charcoal/60 block">Shipping Destination</span>
            <p className="font-medium text-charcoal">{confirmedOrder.shippingAddress}</p>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/shop"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-forest text-ivory text-xs font-semibold hover:bg-forest-light transition-colors"
          >
            Continue Shopping
          </Link>
          <Link
            to="/account/orders"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-beige text-charcoal/80 text-xs font-semibold hover:bg-ivory transition-colors"
          >
            View in My Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <span className="text-xs uppercase tracking-widest text-sage font-bold font-sans">Secure Checkout</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest mt-1">Delivery & Payment</h1>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Customer & Address Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Customer Details */}
          <div className="bg-white rounded-3xl border border-beige p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="font-serif text-xl font-bold text-forest">1. Contact Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal/80 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="e.g. Radhika Menon"
                  className="w-full px-3.5 py-2.5 bg-ivory border border-beige rounded-xl text-xs focus:ring-1 focus:ring-forest focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-charcoal/80 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 bg-ivory border border-beige rounded-xl text-xs focus:ring-1 focus:ring-forest focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal/80 mb-1">Email Address (for Receipt) *</label>
              <input
                type="email"
                required
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                placeholder="name@domain.com"
                className="w-full px-3.5 py-2.5 bg-ivory border border-beige rounded-xl text-xs focus:ring-1 focus:ring-forest focus:outline-none"
              />
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-3xl border border-beige p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="font-serif text-xl font-bold text-forest">2. Delivery Address</h3>
            <div>
              <label className="block text-xs font-semibold text-charcoal/80 mb-1">
                Street Address / Flat / Building *
              </label>
              <textarea
                rows={2}
                required
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                placeholder="Flat 302, Green Meadows, 12th Main Rd"
                className="w-full px-3.5 py-2.5 bg-ivory border border-beige rounded-xl text-xs focus:ring-1 focus:ring-forest focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                <label className="block text-xs font-semibold text-charcoal/80 mb-1">State *</label>
                <input
                  type="text"
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="Karnataka"
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
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-3xl border border-beige p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="font-serif text-xl font-bold text-forest">3. Payment Mode</h3>

            <div className="space-y-3">
              <label
                className={`p-4 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                  paymentMethod === 'TEST_GATEWAY'
                    ? 'border-forest bg-forest/5'
                    : 'border-beige hover:bg-ivory'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'TEST_GATEWAY'}
                  onChange={() => setPaymentMethod('TEST_GATEWAY')}
                  className="mt-1 text-forest focus:ring-forest"
                />
                <div className="space-y-1">
                  <span className="font-serif text-sm font-bold text-forest flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-sage" />
                    Online Payment (Razorpay Test Mode / Simulated)
                  </span>
                  <p className="text-xs text-charcoal/70">
                    Production architecture ready. In development/demonstration mode, this processes a simulated test order without charging real cards.
                  </p>
                </div>
              </label>

              <label
                className={`p-4 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                  paymentMethod === 'COD' ? 'border-forest bg-forest/5' : 'border-beige hover:bg-ivory'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="mt-1 text-forest focus:ring-forest"
                />
                <div className="space-y-1">
                  <span className="font-serif text-sm font-bold text-forest flex items-center gap-2">
                    <Truck className="w-4 h-4 text-terracotta" />
                    Cash on Delivery
                  </span>
                  <p className="text-xs text-charcoal/70">
                    Pay in cash or UPI directly to our delivery executive upon arrival.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Items in Order & Total Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-beige p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="font-serif text-xl font-bold text-forest pb-3 border-b border-beige">In Your Bag</h3>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((i) => (
                <div key={i.id} className="flex items-center justify-between text-xs">
                  <div className="flex-1 min-w-0 pr-3">
                    <p className="font-medium text-charcoal truncate">{i.product.name}</p>
                    <p className="text-[11px] text-charcoal/50">Qty: {i.quantity} × ₹{i.product.price}</p>
                  </div>
                  <span className="font-serif font-bold text-forest">
                    ₹{(i.product.price * i.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-beige space-y-2 text-xs text-charcoal/70 font-sans">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-terracotta font-semibold">
                  <span>Coupon ({couponCode})</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="pt-3 border-t border-beige flex justify-between items-baseline">
                <span className="font-serif text-base font-bold text-forest">Total Payable</span>
                <span className="font-serif text-2xl font-bold text-forest">
                  ₹{finalTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-full bg-forest text-ivory text-xs font-semibold uppercase tracking-wider hover:bg-forest-light transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{loading ? 'Confirming Order...' : `Pay ₹${finalTotal.toLocaleString('en-IN')}`}</span>
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-charcoal/50 text-center">
              <ShieldCheck className="w-4 h-4 text-sage" />
              <span>256-bit encrypted secure checkout</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
