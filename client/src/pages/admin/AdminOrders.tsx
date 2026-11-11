import React, { useEffect, useState } from 'react';
import { ShoppingBag, Search, Eye, Check, X } from 'lucide-react';
import { api } from '../../services/api';
import { Order } from '../../types';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { success, error } = useToast();

  const fetchOrders = async () => {
    try {
      const res = await api.admin.orders({ status: statusFilter, search }) as { data: Order[] };
      setOrders(res.data || []);
    } catch (err: any) {
      error(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, search]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.admin.updateOrderStatus(orderId, newStatus);
      success(`Order status updated to ${newStatus}`);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
      }
      await fetchOrders();
    } catch (err: any) {
      error(err.message || 'Failed to update order status');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-beige gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-sage font-bold font-sans">
            Fulfillment & Commerce
          </span>
          <h1 className="font-serif text-3xl font-bold text-forest mt-0.5">Customer Orders</h1>
          <p className="text-xs text-charcoal/60 mt-1 font-sans">
            Review customer transactions, update dispatch statuses, and inspect shipping addresses.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-forest text-ivory'
                  : 'bg-white border border-beige text-charcoal/70 hover:bg-ivory'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-beige text-center space-y-2">
          <ShoppingBag className="w-10 h-10 text-charcoal/30 mx-auto" />
          <p className="font-serif text-base font-semibold text-forest">No orders found</p>
          <p className="text-xs text-charcoal/50">There are no orders matching the selected filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-beige shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-ivory border-b border-beige text-charcoal/70 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Order Status</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige/60">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-ivory/50 transition-colors">
                    <td className="py-3 px-4 font-serif font-bold text-forest">{ord.orderNumber}</td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-charcoal">{ord.customerName}</p>
                      <p className="text-[10px] text-charcoal/50">{ord.customerEmail}</p>
                    </td>
                    <td className="py-3 px-4 font-serif font-bold text-forest">
                      ₹{ord.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={ord.orderStatus}
                        onChange={(e) => handleUpdateStatus(ord.id, e.target.value)}
                        className="text-xs bg-ivory border border-beige rounded-lg px-2.5 py-1 font-semibold focus:outline-none focus:ring-1 focus:ring-forest"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-charcoal/50 text-[11px]">
                      {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="p-1.5 rounded-lg border border-beige hover:bg-ivory text-forest"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-beige p-6 sm:p-8 space-y-4">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-charcoal/40 hover:text-charcoal"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-xs uppercase tracking-wider text-sage font-bold font-sans">
              Order Details
            </span>
            <h3 className="font-serif text-2xl font-bold text-forest">{selectedOrder.orderNumber}</h3>

            <div className="p-4 rounded-2xl bg-ivory border border-beige space-y-2 text-xs">
              <p>
                <strong>Customer:</strong> {selectedOrder.customerName} ({selectedOrder.customerEmail})
              </p>
              <p>
                <strong>Shipping Address:</strong> {selectedOrder.shippingAddress}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-forest mb-2 uppercase tracking-wider">Ordered Items</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedOrder.items?.map((it) => (
                  <div key={it.id} className="flex justify-between items-center text-xs p-2 rounded-xl bg-ivory">
                    <span>
                      {it.productName} × {it.quantity}
                    </span>
                    <span className="font-serif font-bold text-forest">
                      ₹{(it.price * it.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-beige flex justify-between items-baseline text-xs">
              <span className="font-bold text-charcoal">Total Amount:</span>
              <span className="font-serif text-xl font-bold text-forest">
                ₹{selectedOrder.totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
