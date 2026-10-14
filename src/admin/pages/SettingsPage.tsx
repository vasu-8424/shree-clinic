import React, { useState, useEffect } from 'react';
import {
  Settings,
  Building,
  Lock,
  Save,
  CheckCircle,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { apiFetch } from '../api/client';

export const SettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [savingClinic, setSavingClinic] = useState(false);
  const [clinicFeedback, setClinicFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Clinic profile state
  const [clinicForm, setClinicForm] = useState({
    clinicName: '',
    address: '',
    phone: '',
    whatsapp: '',
    gstin: '',
    rciNumber: '',
    invoiceFooter: '',
  });

  // Password change state
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await apiFetch('/api/v1/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            setClinicForm({
              clinicName: data.settings.clinicName || '',
              address: data.settings.address || '',
              phone: data.settings.phone || '',
              whatsapp: data.settings.whatsapp || '',
              gstin: data.settings.gstin || '',
              rciNumber: data.settings.rciNumber || '',
              invoiceFooter: data.settings.invoiceFooter || '',
            });
          }
        }
      } catch (e) {
        console.error('Failed to load clinic settings:', e);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSaveClinic = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingClinic(true);
      setClinicFeedback(null);
      const res = await apiFetch('/api/v1/settings', {
        method: 'PUT',
        body: JSON.stringify(clinicForm),
      });

      if (res.ok) {
        setClinicFeedback({ type: 'success', text: 'Clinic settings saved successfully' });
      } else {
        const err = await res.json();
        setClinicFeedback({ type: 'error', text: err.error || 'Failed to save settings' });
      }
    } catch {
      setClinicFeedback({ type: 'error', text: 'Network error saving settings' });
    } finally {
      setSavingClinic(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordFeedback({ type: 'error', text: 'New password and confirm password do not match' });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordFeedback({ type: 'error', text: 'New password must be at least 8 characters' });
      return;
    }

    try {
      setSavingPassword(true);
      setPasswordFeedback(null);
      const res = await apiFetch('/api/v1/settings/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (res.ok) {
        setPasswordFeedback({ type: 'success', text: 'Administrator password changed successfully' });
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const err = await res.json();
        setPasswordFeedback({ type: 'error', text: err.error || 'Failed to change password' });
      }
    } catch {
      setPasswordFeedback({ type: 'error', text: 'Network error changing password' });
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#0b3037] animate-spin mb-3" />
        <p className="text-xs text-stone-500">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="border-b border-stone-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0b3037] flex items-center gap-3">
          <Settings className="w-7 h-7 text-[#d9ae4a]" />
          Clinic & Security Settings
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-1">
          Update healthcare facility metadata, GST tax details, and administrator credentials.
        </p>
      </div>

      {/* Clinic Profile Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-100">
          <div className="w-10 h-10 rounded-2xl bg-[#0b3037]/10 text-[#0b3037] flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-stone-900">Healthcare Facility Profile</h2>
            <p className="text-xs text-stone-500">
              Information displayed on official invoices, consultation receipts, and reports.
            </p>
          </div>
        </div>

        {clinicFeedback && (
          <div
            className={`p-3.5 rounded-xl text-xs mb-5 flex items-center gap-2 ${
              clinicFeedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {clinicFeedback.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{clinicFeedback.text}</span>
          </div>
        )}

        <form onSubmit={handleSaveClinic} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Clinic Legal Name</label>
            <input
              type="text"
              required
              value={clinicForm.clinicName}
              onChange={(e) => setClinicForm({ ...clinicForm, clinicName: e.target.value })}
              className="w-full px-3.5 py-2 border border-stone-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Registered Hospital Address
            </label>
            <textarea
              rows={2}
              required
              value={clinicForm.address}
              onChange={(e) => setClinicForm({ ...clinicForm, address: e.target.value })}
              className="w-full px-3.5 py-2 border border-stone-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Phone Number</label>
              <input
                type="tel"
                required
                value={clinicForm.phone}
                onChange={(e) => setClinicForm({ ...clinicForm, phone: e.target.value })}
                className="w-full px-3.5 py-2 border border-stone-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">WhatsApp Business</label>
              <input
                type="tel"
                required
                value={clinicForm.whatsapp}
                onChange={(e) => setClinicForm({ ...clinicForm, whatsapp: e.target.value })}
                className="w-full px-3.5 py-2 border border-stone-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                GSTIN Number (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 36AABCU9603R1ZM"
                value={clinicForm.gstin}
                onChange={(e) => setClinicForm({ ...clinicForm, gstin: e.target.value })}
                className="w-full px-3.5 py-2 border border-stone-200 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                RCI Registration Number (Audiology / Speech)
              </label>
              <input
                type="text"
                placeholder="e.g. A-12345"
                value={clinicForm.rciNumber}
                onChange={(e) => setClinicForm({ ...clinicForm, rciNumber: e.target.value })}
                className="w-full px-3.5 py-2 border border-stone-200 rounded-xl font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Invoice Footer Disclaimer Note
            </label>
            <input
              type="text"
              value={clinicForm.invoiceFooter}
              onChange={(e) => setClinicForm({ ...clinicForm, invoiceFooter: e.target.value })}
              className="w-full px-3.5 py-2 border border-stone-200 rounded-xl text-xs"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingClinic}
              className="px-5 py-2.5 rounded-xl bg-[#0b3037] hover:bg-[#124b55] text-white font-medium flex items-center gap-2 cursor-pointer shadow-sm transition-all"
            >
              {savingClinic ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Save Clinic Profile</span>
            </button>
          </div>
        </form>
      </div>

      {/* Security & Password Management */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-100">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-stone-900">Administrator Security & Password</h2>
            <p className="text-xs text-stone-500">
              Argon2id cryptographic hash with instant token revocation on update.
            </p>
          </div>
        </div>

        {passwordFeedback && (
          <div
            className={`p-3.5 rounded-xl text-xs mb-5 flex items-center gap-2 ${
              passwordFeedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {passwordFeedback.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{passwordFeedback.text}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Current Password <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              required
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
              }
              placeholder="Enter existing password"
              className="w-full px-3.5 py-2 border border-stone-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                New Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                }
                placeholder="At least 8 characters"
                className="w-full px-3.5 py-2 border border-stone-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Confirm New Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                }
                placeholder="Re-enter new password"
                className="w-full px-3.5 py-2 border border-stone-200 rounded-xl"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingPassword}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium flex items-center gap-2 cursor-pointer shadow-sm transition-all"
            >
              {savingPassword ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              <span>Update Password</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
