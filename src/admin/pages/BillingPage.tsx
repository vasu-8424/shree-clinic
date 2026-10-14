import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Printer,
  X,
  Loader2,
  Trash2,
  AlertCircle,
  CreditCard,
} from 'lucide-react';
import { apiFetch } from '../api/client';

export const BillingPage: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalBilled: 0,
    totalCollected: 0,
    totalDue: 0,
    totalInvoices: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Create invoice modal
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [patientsList, setPatientsList] = useState<any[]>([]);
  const [patientId, setPatientId] = useState('');
  const [isGstApplied, setIsGstApplied] = useState(false);
  const [discount, setDiscount] = useState('0');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<Array<{ description: string; hsnSac: string; quantity: number; unitPrice: number }>>([
    { description: 'Comprehensive Audiological Evaluation (PTA + Impedance)', hsnSac: '999312', quantity: 1, unitPrice: 1500 },
  ]);
  const [initialPayment, setInitialPayment] = useState({
    amount: '',
    mode: 'UPI',
    transactionReference: '',
  });

  // Record payment modal
  const [paymentModal, setPaymentModal] = useState<{ open: boolean; invoice: any | null }>({
    open: false,
    invoice: null,
  });
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [paymentRef, setPaymentRef] = useState('');

  // Printable invoice modal
  const [printableInvoice, setPrintableInvoice] = useState<any | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const loadBillingData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (search) params.append('search', search);

      const [invRes, statsRes] = await Promise.all([
        apiFetch(`/api/v1/billing/invoices?${params.toString()}`),
        apiFetch('/api/v1/billing/stats'),
      ]);

      if (invRes.ok) {
        const data = await invRes.json();
        setInvoices(data.invoices || []);
      }
      if (statsRes.ok) {
        const sData = await statsRes.json();
        if (sData.stats) setStats(sData.stats);
      }
    } catch (err) {
      console.error('Failed to load billing:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(loadBillingData, 250);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const loadPatients = async () => {
    try {
      const res = await apiFetch('/api/v1/patients?limit=50');
      if (res.ok) {
        const data = await res.json();
        setPatientsList(data.data || data.patients || []);
      }
    } catch (e) {
      console.error('Failed to load patients for invoice:', e);
    }
  };

  const handleAddItem = () => {
    setItems([...items, { description: '', hsnSac: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    setItems(updated);
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0);
  const numDiscount = Math.min(subtotal, parseFloat(discount) || 0);
  const taxable = subtotal - numDiscount;
  const gstAmount = isGstApplied ? taxable * 0.18 : 0;
  const totalAmount = taxable + gstAmount;

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) {
      alert('Please select a patient');
      return;
    }
    try {
      setSubmitting(true);
      const payload: any = {
        patientId,
        items,
        discount: numDiscount,
        isGstApplied,
        notes,
      };

      const paidVal = parseFloat(initialPayment.amount) || 0;
      if (paidVal > 0) {
        payload.initialPayment = {
          amount: paidVal,
          mode: initialPayment.mode,
          transactionReference: initialPayment.transactionReference || null,
        };
      }

      const res = await apiFetch('/api/v1/billing/invoices', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsInvoiceModalOpen(false);
        setPatientId('');
        setNotes('');
        setDiscount('0');
        setItems([{ description: 'Comprehensive Consultation & Diagnostics', hsnSac: '999312', quantity: 1, unitPrice: 1500 }]);
        setInitialPayment({ amount: '', mode: 'UPI', transactionReference: '' });
        loadBillingData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create invoice');
      }
    } catch {
      alert('Error creating invoice');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModal.invoice) return;
    try {
      setSubmitting(true);
      const res = await apiFetch(`/api/v1/billing/invoices/${paymentModal.invoice.id}/payments`, {
        method: 'POST',
        body: JSON.stringify({
          amount: parseFloat(paymentAmount),
          mode: paymentMode,
          transactionReference: paymentRef || null,
        }),
      });

      if (res.ok) {
        setPaymentModal({ open: false, invoice: null });
        setPaymentAmount('');
        setPaymentRef('');
        loadBillingData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to record payment');
      }
    } catch {
      alert('Error recording payment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0b3037] flex items-center gap-3">
            <Receipt className="w-7 h-7 text-[#d9ae4a]" />
            Billing, GST Invoices & Payments
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Automated Indian financial year GST sequencing (SHREE/26-27/XXXX), itemized billing & payment receipts.
          </p>
        </div>

        <button
          onClick={() => {
            loadPatients();
            setIsInvoiceModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-white bg-[#0b3037] hover:bg-[#124b55] shadow-sm transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Generate GST Invoice</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
            Total Billed
          </div>
          <div className="text-2xl font-bold font-serif text-[#0b3037] mt-1 font-mono">
            ₹{stats.totalBilled.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-stone-400 mt-0.5">{stats.totalInvoices} invoices generated</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
            Collected Revenue
          </div>
          <div className="text-2xl font-bold font-serif text-emerald-600 mt-1 font-mono">
            ₹{stats.totalCollected.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-stone-400 mt-0.5">UPI, Cash, Cards</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
            Outstanding Dues
          </div>
          <div className="text-2xl font-bold font-serif text-amber-600 mt-1 font-mono">
            ₹{stats.totalDue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-stone-400 mt-0.5">Pending collection</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
            GST Compliance
          </div>
          <div className="text-2xl font-bold font-serif text-[#0b3037] mt-1">18% GST</div>
          <div className="text-[11px] text-stone-400 mt-0.5">CGST 9% + SGST 9%</div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search by invoice number (e.g. SHREE/26-27/0001) or patient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b3037]/20 focus:border-[#0b3037]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-700"
        >
          <option value="">All Statuses</option>
          <option value="PAID">Paid in Full</option>
          <option value="PARTIALLY_PAID">Partially Paid</option>
          <option value="UNPAID">Unpaid Balance</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <Loader2 className="w-7 h-7 text-[#0b3037] animate-spin mb-3" />
            <p className="text-xs text-stone-500">Loading invoices...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="w-8 h-8 text-stone-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-stone-800">No invoices found</h3>
            <p className="text-xs text-stone-500 mt-1">Generate your first patient billing invoice.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Amount Paid</th>
                  <th className="py-3 px-4">Balance Due</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#0b3037]">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-stone-900">{inv.patient?.fullName}</div>
                      <div className="text-[11px] text-stone-500 font-mono">{inv.patient?.uhid}</div>
                    </td>
                    <td className="py-3.5 px-4 text-stone-600">
                      {new Date(inv.invoiceDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                      ₹{Number(inv.totalAmount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-emerald-600 font-semibold">
                      ₹{Number(inv.amountPaid).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-stone-800">
                      ₹{Number(inv.balanceDue).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : inv.status === 'PARTIALLY_PAID'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {inv.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setPrintableInvoice(inv)}
                          className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 cursor-pointer"
                          title="View / Print Tax Invoice"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {inv.status !== 'PAID' && (
                          <button
                            onClick={() => {
                              setPaymentModal({ open: true, invoice: inv });
                              setPaymentAmount(inv.balanceDue.toString());
                            }}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer"
                          >
                            Pay
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

      {/* Generate Invoice Modal */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setIsInvoiceModalOpen(false)}
              className="absolute right-5 top-5 p-1 rounded-full text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold font-serif text-[#0b3037] mb-1">
              Create Clinical GST Invoice
            </h2>
            <p className="text-xs text-stone-500 mb-6">
              Sequentially numbered GST tax invoice with instant receipt recording.
            </p>

            <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Select Patient <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full px-3.5 py-2 border border-stone-200 rounded-xl"
                >
                  <option value="">-- Choose Registered Patient --</option>
                  {patientsList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.uhid})
                    </option>
                  ))}
                </select>
              </div>

              {/* Line items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-semibold text-stone-700">Invoice Line Items</label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs font-bold text-[#0b3037] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Service / Product
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto p-1">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200 items-center"
                    >
                      <div className="col-span-6">
                        <input
                          type="text"
                          required
                          placeholder="Service name (e.g. Speech Therapy 10-Session Package)"
                          value={item.description}
                          onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-200 rounded-lg"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          placeholder="HSN/SAC"
                          value={item.hsnSac}
                          onChange={(e) => handleItemChange(idx, 'hsnSac', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-200 rounded-lg font-mono"
                        />
                      </div>
                      <div className="col-span-1">
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(idx, 'quantity', parseInt(e.target.value) || 1)
                          }
                          className="w-full px-2 py-1.5 text-xs bg-white border border-stone-200 rounded-lg text-center"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min={0}
                          placeholder="Unit Price"
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleItemChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)
                          }
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-200 rounded-lg font-mono text-right"
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1 text-rose-500 hover:text-rose-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tax & Discount calculation */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="gstToggle"
                    checked={isGstApplied}
                    onChange={(e) => setIsGstApplied(e.target.checked)}
                    className="w-4 h-4 accent-[#0b3037] rounded"
                  />
                  <label htmlFor="gstToggle" className="font-semibold text-stone-700">
                    Apply 18% GST (CGST 9% + SGST 9%)
                  </label>
                </div>

                <div className="flex items-center gap-2 justify-end">
                  <span className="font-semibold text-stone-700">Discount (₹):</span>
                  <input
                    type="number"
                    min={0}
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="w-28 px-2.5 py-1 border border-stone-200 rounded-lg text-right font-mono"
                  />
                </div>
              </div>

              {/* Totals Summary Banner */}
              <div className="bg-[#0b3037]/5 p-3.5 rounded-xl border border-[#0b3037]/15 flex items-center justify-between text-xs sm:text-sm">
                <div>
                  <span className="text-stone-500">Subtotal:</span>{' '}
                  <span className="font-mono font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
                  {isGstApplied && (
                    <span className="ml-3 text-stone-500">
                      GST (18%):{' '}
                      <span className="font-mono font-semibold">
                        ₹{gstAmount.toLocaleString('en-IN')}
                      </span>
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-stone-600 font-bold mr-2">Net Payable:</span>
                  <span className="font-serif text-lg font-bold text-[#0b3037] font-mono">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Initial Payment */}
              <div className="border-t border-stone-200 pt-3">
                <label className="block font-semibold text-stone-700 mb-2">
                  Initial Payment Received Now (Optional)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <input
                      type="number"
                      min={0}
                      max={totalAmount}
                      placeholder="Amount (₹)"
                      value={initialPayment.amount}
                      onChange={(e) =>
                        setInitialPayment({ ...initialPayment, amount: e.target.value })
                      }
                      className="w-full px-3 py-1.5 border border-stone-200 rounded-xl font-mono"
                    />
                  </div>
                  <div>
                    <select
                      value={initialPayment.mode}
                      onChange={(e) =>
                        setInitialPayment({ ...initialPayment, mode: e.target.value })
                      }
                      className="w-full px-3 py-1.5 border border-stone-200 rounded-xl"
                    >
                      <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                      <option value="CASH">Cash</option>
                      <option value="CREDIT_CARD">Credit Card</option>
                      <option value="DEBIT_CARD">Debit Card</option>
                      <option value="BANK_TRANSFER">Bank Transfer / NEFT</option>
                    </select>
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Txn Ref # / UTR"
                      value={initialPayment.transactionReference}
                      onChange={(e) =>
                        setInitialPayment({
                          ...initialPayment,
                          transactionReference: e.target.value,
                        })
                      }
                      className="w-full px-3 py-1.5 border border-stone-200 rounded-xl font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsInvoiceModalOpen(false)}
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
                  <span>Generate Invoice</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {paymentModal.open && paymentModal.invoice && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setPaymentModal({ open: false, invoice: null })}
              className="absolute right-5 top-5 p-1 rounded-full text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold font-serif text-[#0b3037] mb-1">
              Record Patient Payment
            </h2>
            <p className="text-xs text-stone-500 mb-6">
              Invoice #{paymentModal.invoice.invoiceNumber} · Balance Due: ₹
              {paymentModal.invoice.balanceDue}
            </p>

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Payment Amount (₹)</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={paymentModal.invoice.balanceDue}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3.5 py-2 border border-stone-200 rounded-xl font-mono text-base font-bold text-[#0b3037]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Payment Method</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full px-3.5 py-2 border border-stone-200 rounded-xl"
                >
                  <option value="UPI">UPI (GPay, PhonePe, Paytm, QR)</option>
                  <option value="CASH">Cash</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="DEBIT_CARD">Debit Card</option>
                  <option value="BANK_TRANSFER">Bank Transfer / IMPS</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Transaction Reference / UTR Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. UPI/32810982312"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full px-3.5 py-2 border border-stone-200 rounded-xl font-mono text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setPaymentModal({ open: false, invoice: null })}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Record Payment Receipt</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable GST Tax Invoice Modal */}
      {printableInvoice && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl relative my-6 print:m-0 print:p-0 print:shadow-none">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 print:hidden">
              <span className="text-xs font-mono font-bold text-stone-500 uppercase">
                Official Clinical Invoice Preview
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#0b3037] rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Receipt
                </button>
                <button
                  onClick={() => setPrintableInvoice(null)}
                  className="p-1 rounded-full text-stone-400 hover:text-stone-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Invoice Print Container */}
            <div className="pt-6 space-y-6 text-stone-800">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold font-serif text-[#0b3037]">
                    SHREE Multidisciplinary Healthcare
                  </h2>
                  <p className="text-xs text-stone-600 mt-1 max-w-sm">
                    Freedom Hospitals, Subishi Town Center, Mokila, Hyderabad, Telangana 501203
                  </p>
                  <p className="text-xs text-stone-600">Phone / WhatsApp: +91 79954 78069</p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold font-mono uppercase tracking-wider text-[#d9ae4a]">
                    Tax Invoice / Receipt
                  </div>
                  <div className="text-base font-bold font-mono text-[#0b3037] mt-1">
                    {printableInvoice.invoiceNumber}
                  </div>
                  <div className="text-xs text-stone-500 mt-0.5">
                    Date:{' '}
                    {new Date(printableInvoice.invoiceDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              </div>

              {/* Patient info */}
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-stone-500 font-semibold">BILLED TO:</span>
                  <div className="font-bold text-sm text-stone-900 mt-0.5">
                    {printableInvoice.patient?.fullName}
                  </div>
                  <div className="font-mono text-stone-600">UHID: {printableInvoice.patient?.uhid}</div>
                  <div className="text-stone-600">Phone: {printableInvoice.patient?.phone}</div>
                </div>
                <div className="text-right">
                  <span className="text-stone-500 font-semibold">PAYMENT STATUS:</span>
                  <div className="font-bold text-sm text-stone-900 mt-0.5">
                    {printableInvoice.status.replace('_', ' ')}
                  </div>
                  <div className="font-mono text-stone-600">
                    Paid: ₹{Number(printableInvoice.amountPaid).toLocaleString('en-IN')}
                  </div>
                  <div className="font-mono text-stone-600 font-bold">
                    Balance Due: ₹{Number(printableInvoice.balanceDue).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-100 text-stone-700 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Description</th>
                    <th className="p-2.5 text-center">HSN/SAC</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Price</th>
                    <th className="p-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {printableInvoice.items?.map((it: any) => (
                    <tr key={it.id}>
                      <td className="p-2.5 font-medium">{it.description}</td>
                      <td className="p-2.5 text-center font-mono">{it.hsnSac || '—'}</td>
                      <td className="p-2.5 text-center">{it.quantity}</td>
                      <td className="p-2.5 text-right font-mono">
                        ₹{Number(it.unitPrice).toLocaleString('en-IN')}
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold">
                        ₹{Number(it.totalPrice).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="border-t border-stone-200 pt-3 flex justify-end text-xs">
                <div className="w-64 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-stone-600">Subtotal:</span>
                    <span className="font-mono">
                      ₹{Number(printableInvoice.subtotal).toLocaleString('en-IN')}
                    </span>
                  </div>
                  {Number(printableInvoice.discount) > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount:</span>
                      <span className="font-mono">
                        -₹{Number(printableInvoice.discount).toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                  {printableInvoice.isGstApplied && (
                    <>
                      <div className="flex justify-between text-stone-600">
                        <span>CGST (9%):</span>
                        <span className="font-mono">
                          ₹{Number(printableInvoice.cgstAmount).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex justify-between text-stone-600">
                        <span>SGST (9%):</span>
                        <span className="font-mono">
                          ₹{Number(printableInvoice.sgstAmount).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between font-bold text-sm text-[#0b3037] pt-2 border-t border-stone-300">
                    <span>Total Amount:</span>
                    <span className="font-mono">
                      ₹{Number(printableInvoice.totalAmount).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-6 border-t border-stone-200 text-center text-[10px] text-stone-500 font-mono">
                Thank you for choosing SHREE Multidisciplinary Healthcare. Computer generated tax invoice.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
