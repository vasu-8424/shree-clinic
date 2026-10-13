import React from 'react';

export const PatientsPage: React.FC = () => (
  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-xs">
    <h1 className="text-2xl font-bold text-neutral-900 mb-2">Patients (EMR) Registry</h1>
    <p className="text-xs text-neutral-600 mb-6">Patient profiles, UHIDs, case histories, and consent management.</p>
    <div className="p-8 border-2 border-dashed border-neutral-200 rounded-2xl text-center text-xs font-mono text-neutral-500">
      [Ready for Step c: Patient Profile + Consent Module]
    </div>
  </div>
);

export const PatientDetailPage: React.FC = () => (
  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-xs">
    <h1 className="text-2xl font-bold text-neutral-900 mb-2">Patient Profile (EMR)</h1>
    <p className="text-xs text-neutral-600 mb-6">Tabs: Overview, Visits, Audiology, Therapy, Hearing Aid, Files, Billing.</p>
    <div className="p-8 border-2 border-dashed border-neutral-200 rounded-2xl text-center text-xs font-mono text-neutral-500">
      [Ready for Step c: Patient Detail View]
    </div>
  </div>
);

export const AppointmentsPage: React.FC = () => (
  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-xs">
    <h1 className="text-2xl font-bold text-neutral-900 mb-2">Appointment Calendar & Queue</h1>
    <p className="text-xs text-neutral-600 mb-6">Calendar view (day/week/month), pending website intakes, and reminders.</p>
    <div className="p-8 border-2 border-dashed border-neutral-200 rounded-2xl text-center text-xs font-mono text-neutral-500">
      [Ready for Step e: Appointments Admin + Calendar]
    </div>
  </div>
);

export const HearingAidsPage: React.FC = () => (
  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-xs">
    <h1 className="text-2xl font-bold text-neutral-900 mb-2">Hearing Aid Enquiries, Trials & Sales</h1>
    <p className="text-xs text-neutral-600 mb-6">Manage walk-ins, ongoing trials, and device dispensing.</p>
    <div className="p-8 border-2 border-dashed border-neutral-200 rounded-2xl text-center text-xs font-mono text-neutral-500">
      [Ready for Step i: Hearing Aid Enquiries, Trials & Sales]
    </div>
  </div>
);

export const InventoryPage: React.FC = () => (
  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-xs">
    <h1 className="text-2xl font-bold text-neutral-900 mb-2">Hearing Aid Stock & Repairs</h1>
    <p className="text-xs text-neutral-600 mb-6">Inventory management, trial units, and repair tracking.</p>
    <div className="p-8 border-2 border-dashed border-neutral-200 rounded-2xl text-center text-xs font-mono text-neutral-500">
      [Ready for Step i: Stock & Repairs Inventory]
    </div>
  </div>
);

export const BillingPage: React.FC = () => (
  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-xs">
    <h1 className="text-2xl font-bold text-neutral-900 mb-2">Billing, GST Invoices & Payments</h1>
    <p className="text-xs text-neutral-600 mb-6">GST invoices, line items, payment modes, and printable receipts.</p>
    <div className="p-8 border-2 border-dashed border-neutral-200 rounded-2xl text-center text-xs font-mono text-neutral-500">
      [Ready for Step j: Billing & Invoicing Module]
    </div>
  </div>
);

export const ReportsPage: React.FC = () => (
  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-xs">
    <h1 className="text-2xl font-bold text-neutral-900 mb-2">Reports & Exports</h1>
    <p className="text-xs text-neutral-600 mb-6">Excel exports and printable PDF clinical case reports.</p>
    <div className="p-8 border-2 border-dashed border-neutral-200 rounded-2xl text-center text-xs font-mono text-neutral-500">
      [Ready for Step l: Excel Exports & Printable Reports]
    </div>
  </div>
);

export const AuditLogPage: React.FC = () => (
  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-xs">
    <h1 className="text-2xl font-bold text-neutral-900 mb-2">DPDP Compliance Audit Log</h1>
    <p className="text-xs text-neutral-600 mb-6">Immutable record of logins, views, updates, and exports.</p>
    <div className="p-8 border-2 border-dashed border-neutral-200 rounded-2xl text-center text-xs font-mono text-neutral-500">
      [Ready for Step m: Audit Log Viewer]
    </div>
  </div>
);

export const SettingsPage: React.FC = () => (
  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-xs">
    <h1 className="text-2xl font-bold text-neutral-900 mb-2">Clinic & Account Settings</h1>
    <p className="text-xs text-neutral-600 mb-6">Change administrator password and update clinic metadata.</p>
    <div className="p-8 border-2 border-dashed border-neutral-200 rounded-2xl text-center text-xs font-mono text-neutral-500">
      [Ready for Step m: Settings & Password Management]
    </div>
  </div>
);
