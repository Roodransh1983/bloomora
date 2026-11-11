import React, { useEffect, useState } from 'react';
import { Users, Mail, Phone, ShoppingBag, Gift } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export function AdminCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { error } = useToast();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await api.admin.customers() as { data: any[] };
        setCustomers(res.data || []);
      } catch (err: any) {
        error(err.message || 'Failed to fetch customers');
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  return (
    <div className="space-y-8">
      <div className="pb-6 border-b border-beige">
        <span className="text-xs uppercase tracking-widest text-sage font-bold font-sans">
          Community & Patrons
        </span>
        <h1 className="font-serif text-3xl font-bold text-forest mt-0.5">Registered Customers</h1>
        <p className="text-xs text-charcoal/60 mt-1 font-sans">
          Overview of registered patrons, order frequencies, and clothing donation contributions.
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : customers.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-beige text-center space-y-2">
          <Users className="w-10 h-10 text-charcoal/30 mx-auto" />
          <p className="font-serif text-base font-semibold text-forest">No customers registered yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-beige shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-ivory border-b border-beige text-charcoal/70 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Patron Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Total Orders</th>
                  <th className="py-3.5 px-4">Total Donations</th>
                  <th className="py-3.5 px-4 text-right">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige/60">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-ivory/50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-charcoal flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-forest text-ivory text-[11px] font-bold flex items-center justify-center">
                        {c.name?.[0]?.toUpperCase() || 'P'}
                      </div>
                      <span>{c.name}</span>
                    </td>
                    <td className="py-3 px-4 text-charcoal/70">{c.email}</td>
                    <td className="py-3 px-4 text-charcoal/70">{c.phone || '—'}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 font-bold text-forest">
                        <ShoppingBag className="w-3.5 h-3.5 text-sage" /> {c._count?.orders || 0}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 font-bold text-terracotta">
                        <Gift className="w-3.5 h-3.5 text-terracotta" /> {c._count?.donations || 0}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-charcoal/40 text-[11px]">
                      {new Date(c.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
