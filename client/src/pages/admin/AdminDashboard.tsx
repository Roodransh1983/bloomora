import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ShoppingBag,
  Users,
  Gift,
  Flower2,
  TrendingUp,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { api } from '../../services/api';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.admin.dashboard() as { data: any };
        setStats(res.data);
      } catch (err) {
        console.error('Fetch dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: `₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`,
      icon: TrendingUp,
      color: 'bg-emerald-50 text-emerald-700',
    },
    {
      title: 'Active Orders',
      value: stats?.totalOrders || 0,
      icon: ShoppingBag,
      color: 'bg-blue-50 text-blue-700',
    },
    {
      title: 'Clothing Donations',
      value: stats?.totalDonations || 0,
      icon: Gift,
      color: 'bg-terracotta/15 text-terracotta',
    },
    {
      title: 'Flower Collections',
      value: stats?.totalFlowerRequests || 0,
      icon: Flower2,
      color: 'bg-sage/20 text-forest',
    },
    {
      title: 'Catalogued Products',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'bg-amber-50 text-amber-700',
    },
    {
      title: 'Registered Patrons',
      value: stats?.totalCustomers || 0,
      icon: Users,
      color: 'bg-purple-50 text-purple-700',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-forest text-ivory flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <span className="text-xs uppercase tracking-widest text-sage font-bold font-sans">
            Executive Overview
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ivory mt-1">
            BLOOMORA Operations Dashboard
          </h2>
          <p className="text-xs text-ivory/70 mt-1 font-sans">
            Real-time monitoring of artisanal orders, clothing donations, and floral waste regeneration.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/admin/products"
            className="px-4 py-2.5 rounded-full bg-sage text-forest text-xs font-semibold hover:bg-sage-light transition-colors"
          >
            + Add New Product
          </Link>
          <Link
            to="/admin/media"
            className="px-4 py-2.5 rounded-full bg-white/10 text-ivory text-xs font-semibold hover:bg-white/20 transition-colors"
          >
            Media Library
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.title} className="p-5 rounded-2xl bg-white border border-beige shadow-sm space-y-2">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${c.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="font-serif text-xl sm:text-2xl font-bold text-charcoal">{c.value}</p>
              <p className="text-[11px] text-charcoal/50 font-medium truncate">{c.title}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Orders & Recent Donations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-3xl border border-beige p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-beige">
            <h3 className="font-serif text-lg font-bold text-forest flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-sage" /> Recent Customer Orders
            </h3>
            <Link to="/admin/orders" className="text-xs text-forest font-semibold hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {stats?.recentOrders?.length === 0 ? (
              <p className="text-xs text-charcoal/50 py-4 text-center">No orders placed yet.</p>
            ) : (
              stats?.recentOrders?.map((ord: any) => (
                <div
                  key={ord.id}
                  className="p-3.5 rounded-2xl bg-ivory border border-beige/80 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-semibold text-charcoal">{ord.orderNumber}</p>
                    <p className="text-[11px] text-charcoal/50">{ord.customerName} • {ord.items?.length || 1} item(s)</p>
                  </div>
                  <div className="text-right">
                    <p className="font-serif font-bold text-forest">₹{ord.totalAmount.toLocaleString('en-IN')}</p>
                    <span className="text-[10px] font-semibold text-sage">{ord.orderStatus}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Donations */}
        <div className="bg-white rounded-3xl border border-beige p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-beige">
            <h3 className="font-serif text-lg font-bold text-forest flex items-center gap-2">
              <Gift className="w-4 h-4 text-terracotta" /> Recent Clothing Donations
            </h3>
            <Link to="/admin/donations" className="text-xs text-terracotta font-semibold hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {stats?.recentDonations?.length === 0 ? (
              <p className="text-xs text-charcoal/50 py-4 text-center">No donation requests yet.</p>
            ) : (
              stats?.recentDonations?.map((don: any) => (
                <div
                  key={don.id}
                  className="p-3.5 rounded-2xl bg-ivory border border-beige/80 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-semibold text-charcoal">{don.donationNumber}</p>
                    <p className="text-[11px] text-charcoal/50">{don.fullName} • {don.city}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-charcoal">{don.itemCount} garments</p>
                    <span className="text-[10px] font-semibold text-terracotta">{don.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
