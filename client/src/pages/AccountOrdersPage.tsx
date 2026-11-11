import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowLeft, ArrowRight, Clock, CheckCircle } from 'lucide-react';
import { api } from '../services/api';
import { Order } from '../types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export function AccountOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.user.orders() as { data: Order[] } | Order[];
        setOrders(Array.isArray(res) ? res : (res as { data: Order[] }).data || []);
      } catch (err) {
        console.error('Fetch orders error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'SHIPPED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'PROCESSING':
      case 'CONFIRMED':
        return 'bg-sage/20 text-forest border-sage/40';
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="pt-28 pb-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="border-b border-beige pb-4 flex items-center justify-between">
        <div>
          <Link
            to="/account"
            className="text-xs font-semibold text-charcoal/60 hover:text-forest flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Account
          </Link>
          <h1 className="font-serif text-3xl font-bold text-forest">Order History</h1>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-beige p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-ivory text-forest flex items-center justify-center mx-auto">
            <Package className="w-7 h-7 text-forest" />
          </div>
          <h3 className="font-serif text-xl font-bold text-forest">No Orders Placed Yet</h3>
          <p className="text-xs text-charcoal/60 max-w-xs mx-auto font-sans">
            When you purchase our handcrafted dried-flower or upcycled pieces, your orders will appear here.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-forest text-ivory text-xs font-semibold hover:bg-forest-light transition-colors"
          >
            <span>Explore Creations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-3xl border border-beige p-6 shadow-sm space-y-4">
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-beige gap-2">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-charcoal/50">Order Reference</span>
                  <p className="font-serif font-bold text-forest text-base">{order.orderNumber}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                      order.orderStatus
                    )}`}
                  >
                    {order.orderStatus}
                  </span>
                  <span className="text-xs text-charcoal/50">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-3">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      {item.productImage && (
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-12 h-12 rounded-xl object-cover bg-ivory border border-beige"
                        />
                      )}
                      <div>
                        <p className="font-semibold text-charcoal">{item.productName}</p>
                        <p className="text-charcoal/50 text-[11px]">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-serif font-semibold text-forest">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-beige flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <span className="text-charcoal/60">
                  Shipped to: <strong className="text-charcoal">{order.shippingAddress}</strong>
                </span>
                <span className="font-serif text-lg font-bold text-forest">
                  Total: ₹{order.totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
