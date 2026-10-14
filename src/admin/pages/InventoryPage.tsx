import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  X,
  Loader2,
  Wrench,
  Trash2,
} from 'lucide-react';
import { apiFetch } from '../api/client';

export const InventoryPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    total: 0,
    inStock: 0,
    onTrial: 0,
    sold: 0,
    underRepair: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');

  // Add stock item modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    brand: 'Phonak',
    modelName: '',
    style: 'RIC',
    serialNumber: '',
    mrp: '',
    purchasePrice: '',
  });

  // Repair modal
  const [repairModal, setRepairModal] = useState<{ open: boolean; itemId: string | null }>({
    open: false,
    itemId: null,
  });
  const [repairForm, setRepairForm] = useState({
    issueDescription: '',
    vendor: '',
    repairCost: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (brandFilter) params.append('brand', brandFilter);
      if (search) params.append('search', search);

      const res = await apiFetch(`/api/v1/inventory?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
        if (data.summary) setSummary(data.summary);
      }
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(loadInventory, 250);
    return () => clearTimeout(timer);
  }, [search, statusFilter, brandFilter]);

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await apiFetch('/api/v1/inventory', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        setFormData({
          brand: 'Phonak',
          modelName: '',
          style: 'RIC',
          serialNumber: '',
          mrp: '',
          purchasePrice: '',
        });
        loadInventory();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to add device to inventory');
      }
    } catch {
      alert('Error adding stock item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendToRepair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repairModal.itemId) return;
    try {
      setSubmitting(true);
      const res = await apiFetch(`/api/v1/inventory/${repairModal.itemId}/repair`, {
        method: 'POST',
        body: JSON.stringify(repairForm),
      });
      if (res.ok) {
        setRepairModal({ open: false, itemId: null });
        setRepairForm({ issueDescription: '', vendor: '', repairCost: '' });
        loadInventory();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to send device to repair');
      }
    } catch {
      alert('Error sending to repair');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturnFromRepair = async (repairId: string) => {
    try {
      const res = await apiFetch(`/api/v1/inventory/repairs/${repairId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'RETURNED' }),
      });
      if (res.ok) {
        loadInventory();
      }
    } catch (e) {
      console.error('Failed to return from repair:', e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this device from inventory?')) return;
    try {
      const res = await apiFetch(`/api/v1/inventory/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadInventory();
      } else {
        const err = await res.json();
        alert(err.error || 'Could not delete item');
      }
    } catch {
      alert('Error deleting item');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0b3037] flex items-center gap-3">
            <Package className="w-7 h-7 text-[#d9ae4a]" />
            Hearing Aid Stock & Repairs Inventory
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Real-time device tracking, trial units, warranties, and vendor repair logs.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-white bg-[#0b3037] hover:bg-[#124b55] shadow-sm transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Stock Item</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
            Available In Stock
          </div>
          <div className="text-2xl font-bold font-serif text-emerald-600 mt-1">
            {summary.inStock}
          </div>
          <div className="text-[11px] text-stone-400 mt-0.5">Ready for trial / sale</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
            On Patient Trial
          </div>
          <div className="text-2xl font-bold font-serif text-amber-600 mt-1">
            {summary.onTrial}
          </div>
          <div className="text-[11px] text-stone-400 mt-0.5">Active evaluations</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
            Under Repair
          </div>
          <div className="text-2xl font-bold font-serif text-rose-600 mt-1">
            {summary.underRepair}
          </div>
          <div className="text-[11px] text-stone-400 mt-0.5">At lab / vendor</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
            Total Devices Sold
          </div>
          <div className="text-2xl font-bold font-serif text-[#0b3037] mt-1">{summary.sold}</div>
          <div className="text-[11px] text-stone-400 mt-0.5">Dispensed to patients</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search by serial number, brand, or model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b3037]/20 focus:border-[#0b3037]"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-stone-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-700"
          >
            <option value="">All Statuses</option>
            <option value="IN_STOCK">In Stock</option>
            <option value="ON_TRIAL">On Trial</option>
            <option value="UNDER_REPAIR">Under Repair</option>
            <option value="SOLD">Sold</option>
          </select>

          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-700"
          >
            <option value="">All Brands</option>
            <option value="Phonak">Phonak</option>
            <option value="Oticon">Oticon</option>
            <option value="Signia">Signia</option>
            <option value="Widex">Widex</option>
            <option value="Resound">Resound</option>
            <option value="Starkey">Starkey</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <Loader2 className="w-7 h-7 text-[#0b3037] animate-spin mb-3" />
            <p className="text-xs text-stone-500">Loading inventory catalog...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-8 h-8 text-stone-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-stone-800">No stock items found</h3>
            <p className="text-xs text-stone-500 mt-1">Add your first clinic device to inventory.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Brand & Model</th>
                  <th className="py-3 px-4">Style</th>
                  <th className="py-3 px-4">Serial Number</th>
                  <th className="py-3 px-4">MRP (₹)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-stone-900">{item.brand}</div>
                      <div className="text-[11px] text-stone-500">{item.modelName}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-stone-700">
                      {item.style}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-stone-800">{item.serialNumber}</td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-stone-900">
                      ₹{Number(item.mrp).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                          item.status === 'IN_STOCK'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : item.status === 'ON_TRIAL'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : item.status === 'UNDER_REPAIR'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.status === 'IN_STOCK' && (
                          <button
                            onClick={() => setRepairModal({ open: true, itemId: item.id })}
                            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 cursor-pointer"
                            title="Send to Repair"
                          >
                            <Wrench className="w-4 h-4" />
                          </button>
                        )}
                        {item.status === 'UNDER_REPAIR' && item.repairs?.[0] && (
                          <button
                            onClick={() => handleReturnFromRepair(item.repairs[0].id)}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer"
                          >
                            Return Fixed
                          </button>
                        )}
                        {item.status !== 'ON_TRIAL' && (
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                            title="Remove from inventory"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Stock Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-5 top-5 p-1 rounded-full text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold font-serif text-[#0b3037] mb-1">
              Add Device to Inventory
            </h2>
            <p className="text-xs text-stone-500 mb-6">Register a new hearing aid unit by serial number.</p>

            <form onSubmit={handleAddStock} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Manufacturer Brand</label>
                  <select
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3.5 py-2 border border-stone-200 rounded-xl"
                  >
                    <option value="Phonak">Phonak</option>
                    <option value="Oticon">Oticon</option>
                    <option value="Signia">Signia</option>
                    <option value="Widex">Widex</option>
                    <option value="Resound">Resound</option>
                    <option value="Starkey">Starkey</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Form Factor Style</label>
                  <select
                    value={formData.style}
                    onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                    className="w-full px-3.5 py-2 border border-stone-200 rounded-xl"
                  >
                    <option value="RIC">RIC (Receiver-in-Canal)</option>
                    <option value="BTE">BTE (Behind-the-Ear)</option>
                    <option value="CIC">CIC (Completely-in-Canal)</option>
                    <option value="ITC">ITC (In-the-Canal)</option>
                    <option value="ITE">ITE (In-the-Ear)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Model Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Audeo Lumity L90-R"
                  value={formData.modelName}
                  onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
                  className="w-full px-3.5 py-2 border border-stone-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Unique Serial Number (S/N) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 23NA-88741-01"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  className="w-full px-3.5 py-2 border border-stone-200 rounded-xl font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    MRP Price (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="e.g. 185000"
                    value={formData.mrp}
                    onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                    className="w-full px-3.5 py-2 border border-stone-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Purchase Cost (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="Optional clinic cost"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                    className="w-full px-3.5 py-2 border border-stone-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#0b3037] hover:bg-[#124b55] text-white font-medium flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save to Stock</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Repair Modal */}
      {repairModal.open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setRepairModal({ open: false, itemId: null })}
              className="absolute right-5 top-5 p-1 rounded-full text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold font-serif text-[#0b3037] mb-1">
              Send Device to Repair
            </h2>
            <p className="text-xs text-stone-500 mb-6">Log hardware issue and vendor dispatch.</p>

            <form onSubmit={handleSendToRepair} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Issue Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Microphone distortion, moisture damage, receiver replacement needed..."
                  value={repairForm.issueDescription}
                  onChange={(e) =>
                    setRepairForm({ ...repairForm, issueDescription: e.target.value })
                  }
                  className="w-full px-3.5 py-2 border border-stone-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Service Vendor</label>
                <input
                  type="text"
                  placeholder="e.g. Sonova India / Phonak Authorized Lab"
                  value={repairForm.vendor}
                  onChange={(e) => setRepairForm({ ...repairForm, vendor: e.target.value })}
                  className="w-full px-3.5 py-2 border border-stone-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Estimated Repair Cost (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  placeholder="e.g. 3500"
                  value={repairForm.repairCost}
                  onChange={(e) => setRepairForm({ ...repairForm, repairCost: e.target.value })}
                  className="w-full px-3.5 py-2 border border-stone-200 rounded-xl font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setRepairModal({ open: false, itemId: null })}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Dispatch to Repair</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
