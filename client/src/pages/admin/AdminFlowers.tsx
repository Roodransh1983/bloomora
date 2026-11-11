import React, { useEffect, useState } from 'react';
import { Flower2, Eye, X } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export function AdminFlowers() {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [notesInput, setNotesInput] = useState('');
  const { success, error } = useToast();

  const statuses = [
    'ALL',
    'SUBMITTED',
    'UNDER_REVIEW',
    'ACCEPTED',
    'PICKUP_SCHEDULED',
    'COLLECTED',
    'PROCESSED',
    'REJECTED',
  ];

  const fetchCollections = async () => {
    try {
      const res = await api.admin.flowerCollections() as { data: any[] };
      let data = res.data || [];
      if (statusFilter !== 'ALL') {
        data = data.filter((c: any) => c.status === statusFilter);
      }
      setCollections(data);
    } catch (err: any) {
      error(err.message || 'Failed to fetch flower collection requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, [statusFilter]);

  const handleUpdateStatus = async (id: string, newStatus: string, adminNotes?: string) => {
    try {
      await api.admin.updateFlowerStatus(id, { status: newStatus, adminNotes });
      success(`Flower collection status updated to ${newStatus}`);
      await fetchCollections();
      if (selectedRequest && selectedRequest.id === id) {
        setSelectedRequest({ ...selectedRequest, status: newStatus, adminNotes });
      }
    } catch (err: any) {
      error(err.message || 'Failed to update status');
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedRequest) return;
    await handleUpdateStatus(selectedRequest.id, selectedRequest.status, notesInput);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-beige gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-sage font-bold font-sans">
            Circular Flora Logistics
          </span>
          <h1 className="font-serif text-3xl font-bold text-forest mt-0.5">Flower Collection Requests</h1>
          <p className="text-xs text-charcoal/60 mt-1 font-sans">
            Manage daily and one-time floral waste pickups from temples, wedding halls, and markets.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {statuses.map((st) => (
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

      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : collections.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-beige text-center space-y-2">
          <Flower2 className="w-10 h-10 text-charcoal/30 mx-auto" />
          <p className="font-serif text-base font-semibold text-forest">No requests found</p>
          <p className="text-xs text-charcoal/50">There are no collection requests under this status.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-beige shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-ivory border-b border-beige text-charcoal/70 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Request ID</th>
                  <th className="py-3.5 px-4">Institution / Name</th>
                  <th className="py-3.5 px-4">Source</th>
                  <th className="py-3.5 px-4">Approx. Quantity</th>
                  <th className="py-3.5 px-4">Flower Types</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige/60">
                {collections.map((col) => (
                  <tr key={col.id} className="hover:bg-ivory/50 transition-colors">
                    <td className="py-3 px-4 font-serif font-bold text-forest">{col.requestNumber}</td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-charcoal">{col.fullName}</p>
                      <p className="text-[10px] text-charcoal/50">{col.phone}</p>
                    </td>
                    <td className="py-3 px-4 text-charcoal/70">{col.flowerSource}</td>
                    <td className="py-3 px-4 font-semibold text-forest">{col.quantity}</td>
                    <td className="py-3 px-4 text-charcoal/60 truncate max-w-xs">{col.flowerType || 'Mixed'}</td>
                    <td className="py-3 px-4">
                      <select
                        value={col.status}
                        onChange={(e) => handleUpdateStatus(col.id, e.target.value, col.adminNotes)}
                        className="text-xs bg-ivory border border-beige rounded-lg px-2 py-1 font-semibold focus:outline-none"
                      >
                        {statuses.filter((s) => s !== 'ALL').map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedRequest(col);
                          setNotesInput(col.adminNotes || '');
                        }}
                        className="p-1.5 rounded-lg border border-beige hover:bg-ivory text-forest"
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

      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-beige p-6 sm:p-8 space-y-4">
            <button
              onClick={() => setSelectedRequest(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-charcoal/40 hover:text-charcoal"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-xs uppercase tracking-wider text-sage font-bold font-sans">
              Collection Request
            </span>
            <h3 className="font-serif text-2xl font-bold text-forest">{selectedRequest.requestNumber}</h3>

            <div className="p-4 rounded-2xl bg-ivory border border-beige space-y-2 text-xs">
              <p>
                <strong>Partner / Temple:</strong> {selectedRequest.fullName} ({selectedRequest.phone})
              </p>
              <p>
                <strong>Collection Location:</strong> {selectedRequest.collectionAddress}, {selectedRequest.city} -{' '}
                {selectedRequest.pinCode}
              </p>
              <p>
                <strong>Source & Volume:</strong> {selectedRequest.flowerSource} ({selectedRequest.quantity})
              </p>
              <p>
                <strong>Flower Varieties:</strong> {selectedRequest.flowerType || 'Mixed flora'}
              </p>
              {selectedRequest.additionalInfo && (
                <p>
                  <strong>Special Instructions:</strong> {selectedRequest.additionalInfo}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal/80 mb-1">
                Route & Processing Notes
              </label>
              <textarea
                rows={3}
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder="Assign van route, timing, drying racks, or volunteer notes..."
                className="w-full px-3 py-2 bg-ivory border border-beige rounded-xl text-xs focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSaveNotes}
                className="mt-2 px-4 py-1.5 rounded-lg bg-forest text-ivory text-xs font-semibold hover:bg-forest-light"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
